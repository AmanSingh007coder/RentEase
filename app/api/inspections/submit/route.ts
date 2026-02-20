import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Inspection from "@/models/Inspection";
import Property from "@/models/Property";
import User from "@/models/User";
import { logActivity } from "@/lib/logActivity";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { tenantId, images } = await request.json();

    // 1. Find User and linked Property
    const user = await User.findById(tenantId);
    if (!user || !user.propertyId) {
      return NextResponse.json({ error: "No property linked to this user" }, { status: 400 });
    }

    // 2. Fetch Property to get the Owner ID
    const property = await Property.findById(user.propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // 3. ✅ UPSERT: Link Move-In Evidence (Update if exists, Create if new)
    const inspection = await Inspection.findOneAndUpdate(
      { 
        tenantId, 
        propertyId: user.propertyId, 
        type: "move-in",
        status: { $ne: "verified" } 
      },
      { 
        images: images.map((img: any) => ({
          url: img.url,
          category: img.category || "General",
          isCameraCaptured: true,
          timestamp: new Date()
        })),
        status: "pending",
        ownerFeedback: "",
        createdAt: new Date() 
      },
      { upsert: true, new: true }
    );

    // 4. 🔔 NOTIFY OWNER: Log activity for Mr. Gupta
    await logActivity({
      propertyId: user.propertyId,
      recipientId: property.ownerId, // Notification for Mr. Gupta
      senderId: tenantId,
      title: "New Move-In Evidence",
      desc: `${user.name} has submitted move-in photos for review at ${property.address}.`,
      category: "legal"
    });

    return NextResponse.json({ message: "Evidence synced with vault", inspection }, { status: 200 });
  } catch (error: any) {
    console.error("SUBMIT_API_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}