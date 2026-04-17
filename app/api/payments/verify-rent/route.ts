import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Payment from "@/models/Payment";
import Notification from "@/models/Notification";
import { logActivity } from "@/lib/logActivity";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { 
      userId, month, year, amount, 
      razorpay_order_id, razorpay_payment_id, razorpay_signature 
    } = await request.json();

    // 1. Security Check: Verify Razorpay Signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Unauthorized Payment Attempt" }, { status: 400 });
    }

    const user = await User.findById(userId).populate("propertyId");

    // 2. Create the Secured Rent Payment Record
    const payment = await Payment.create({
      propertyId: user.propertyId._id,
      tenantId: userId,
      type: "rent",
      month,
      year,
      amount,
      gatewayTransactionId: razorpay_payment_id, // Real Gateway ID
      status: "completed"
    });

    // 3. Cleanup Nudges & Log Activity
    await Notification.deleteMany({ recipientId: userId, type: "nudge" });
    await logActivity({
      propertyId: user.propertyId._id,
      recipientId: user.propertyId.ownerId,
      senderId: userId,
      title: "Monthly Rent Verified 🛡️",
      desc: `${user.name} paid ₹${amount} for ${month}. Signature verified in vault.`,
      category: "payment"
    });

    return NextResponse.json({ message: "Rent secured", payment }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}