import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Maintenance from "@/models/Maintenance";
import Property from "@/models/Property";
import User from "@/models/User";
import { logActivity } from "@/lib/logActivity";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { tenantId, room, description, images } = await request.json();

    const user = await User.findById(tenantId);
    const property = await Property.findById(user.propertyId);

    const issue = await Maintenance.create({
      propertyId: user.propertyId,
      tenantId,
      room,
      description,
      images
    });

    // 🔔 Notify Owner
    await logActivity({
      propertyId: user.propertyId,
      recipientId: property.ownerId,
      senderId: tenantId,
      title: "New Maintenance Issue",
      desc: `${user.name} reported a ${room} issue: "${description}"`,
      category: "maintenance"
    });

    return NextResponse.json({ message: "Issue reported", issue }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}