import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ExitProcess from "@/models/ExitProcess";
import Property from "@/models/Property";
import { logActivity } from "@/lib/logActivity";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { tenantId, propertyId, ownerId, moveOutDate, reason } = body;

    // 1. Validation Check
    if (!tenantId || !propertyId || !ownerId || !moveOutDate) {
      console.error("Missing fields:", { tenantId, propertyId, ownerId, moveOutDate });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Create the Exit Process Record
    const exitRecord = await ExitProcess.create({
      tenantId,
      propertyId,
      ownerId,
      moveOutDate: new Date(moveOutDate),
      reason,
      status: "notice_served"
    });

    // 3. Update Property Status & activeExitId
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId, 
      { 
        status: "under_notice",
        activeExitId: exitRecord._id 
      },
      { new: true }
    );

    if (!updatedProperty) {
      throw new Error("Property not found to update status");
    }

    // 4. Log Activity for the Owner
    try {
      await logActivity({
        propertyId,
        recipientId: ownerId,
        senderId: tenantId,
        title: "Notice Period Started 🏠",
        desc: `A tenant has served notice for ${new Date(moveOutDate).toLocaleDateString()}.`,
        category: "system"
      });
    } catch (logError) {
      console.warn("Activity logging failed, but notice was served", logError);
    }

    return NextResponse.json({ message: "Notice served successfully", exitRecord });
  } catch (error: any) {
    console.error("EXIT_NOTICE_POST_ERROR:", error); // Check your VS Code terminal for this!
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}