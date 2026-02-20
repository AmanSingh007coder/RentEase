import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification"; // You may need to create this model

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { tenantId, ownerName, propertyAddress, month } = await request.json();

    await Notification.create({
      recipientId: tenantId,
      type: "nudge",
      title: "Rent Reminder",
      message: `${ownerName} sent a nudge regarding rent for ${month} at ${propertyAddress}.`,
      isRead: false,
      createdAt: new Date()
    });

    return NextResponse.json({ message: "Nudge sent successfully to activity log." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}