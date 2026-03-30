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

    const user = await User.findById(tenantId);
    if (!user || !user.propertyId) {
      return NextResponse.json({ error: "No active tenancy linked" }, { status: 400 });
    }

    const property = await Property.findById(user.propertyId);
    if (!property) return NextResponse.json({ error: "Property metadata missing" }, { status: 404 });

    // ✅ LOGIC: Upsert inspection only if NOT already verified
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

    // 🔔 Alert the owner to review
    await logActivity({
      propertyId: user.propertyId,
      recipientId: property.ownerId,
      senderId: tenantId,
      title: "Evidence Pending Review",
      desc: `${user.name} has submitted move-in photos for audit at ${property.address}.`,
      category: "legal"
    });

    return NextResponse.json({ message: "Evidence secured in vault", inspection }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}