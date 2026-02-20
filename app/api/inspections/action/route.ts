import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Inspection from "@/models/Inspection";
import Property from "@/models/Property";
import { logActivity } from "@/lib/logActivity";

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { inspectionId, action, feedback } = await request.json();

    // 1. Update the Inspection Status
    const status = action === "verify" ? "verified" : "rejected";
    const updatedInspection = await Inspection.findByIdAndUpdate(
      inspectionId,
      { status, ownerFeedback: feedback || "" },
      { new: true }
    );

    if (!updatedInspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }

    // 2. If verified, update the property phase
    if (action === "verify") {
      await Property.findByIdAndUpdate(updatedInspection.propertyId, {
        "inspectionStatus.moveIn": "verified" 
      });
    }

    // 3. 🔔 NOTIFY TENANT: Log activity for Aman
    await logActivity({
      propertyId: updatedInspection.propertyId,
      recipientId: updatedInspection.tenantId, // Notification for Aman
      title: action === "verify" ? "Digital Witness Locked" : "Retake Requested",
      desc: action === "verify" 
        ? "Mr. Gupta has verified and cryptographically locked your move-in evidence." 
        : `Mr. Gupta requested a retake: ${feedback || "Photos were unclear."}`,
      category: action === "verify" ? "legal" : "maintenance"
    });

    return NextResponse.json({ message: `Inspection ${status}`, updatedInspection }, { status: 200 });
  } catch (error: any) {
    console.error("ACTION_API_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}