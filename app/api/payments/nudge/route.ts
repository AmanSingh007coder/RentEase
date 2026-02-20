import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { tenantId, month, propertyAddress } = await request.json();

    // ✅ FIXED: Providing both 'message' (for Schema) and 'desc' (for UI)
    const newNotification = await Notification.create({
      recipientId: tenantId, 
      type: "nudge",
      category: "urgent", // ✅ Required for your ActivityPage filter
      title: "Urgent Rent Reminder",
      
      // 🛡️ The Schema requires 'message'
      message: `Your landlord sent an urgent nudge for ${month} rent at ${propertyAddress}.`,
      
      // 🎨 The Activity Page UI looks for 'desc'
      desc: `Your landlord sent an urgent nudge for ${month} rent at ${propertyAddress}.`,
      
      createdAt: new Date()
    });

    console.log("Success: Notification saved with ID:", newNotification._id);
    return NextResponse.json({ message: "Nudge sent successfully!" });

  } catch (error: any) {
    console.error("Mongoose Validation Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}