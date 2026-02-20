import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Payment from "@/models/Payment";
import Notification from "@/models/Notification"; // ✅ Import Notification model
import { logActivity } from "@/lib/logActivity";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { userId, month, year, amount, transactionId } = await request.json();

    // 1. Find the tenant and their property
    const user = await User.findById(userId).populate("propertyId");
    if (!user || !user.propertyId) {
      return NextResponse.json({ error: "User or Property not found" }, { status: 404 });
    }

    // 2. Create the Rent Payment Record
    const payment = await Payment.create({
      propertyId: user.propertyId._id,
      tenantId: userId,
      type: "rent",
      month,
      year,
      amount,
      gatewayTransactionId: transactionId,
      status: "completed"
    });

    // ✅ STEP 2.5: AUTOMATIC CLEANUP
    // Delete any nudges for this tenant so the red box disappears
    await Notification.deleteMany({
      recipientId: userId,
      type: "nudge"
    });

    // 3. Notify the Owner
    await logActivity({
      propertyId: user.propertyId._id,
      recipientId: user.propertyId.ownerId,
      senderId: userId,
      title: "Rent Received ✅",
      desc: `${user.name} has paid rent for ${month} ${year}. Transaction ID: ${transactionId}`,
      category: "payment"
    });

    return NextResponse.json({ 
      message: `Rent for ${month} verified and reminders cleared`, 
      payment 
    }, { status: 200 });

  } catch (error: any) {
    console.error("RENT_VERIFY_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}