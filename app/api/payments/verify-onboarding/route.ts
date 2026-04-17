import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Payment from "@/models/Payment";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { 
      userId, 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = await request.json();

    // 1. VERIFY THE SIGNATURE (The Security Guard)
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed: Invalid Signature" }, { status: 400 });
    }

    // 2. FETCH DATA
    const user = await User.findById(userId).populate("propertyId");
    const property = user.propertyId;

    // 3. CREATE DEPOSIT RECORD
    await Payment.create({
      propertyId: property._id,
      tenantId: userId,
      type: "deposit",
      amount: property.depositAmount,
      gatewayTransactionId: razorpay_payment_id, // REAL ID
      status: "completed"
    });

    // 4. CREATE 1st MONTH RENT
    const now = new Date();
    await Payment.create({
      propertyId: property._id,
      tenantId: userId,
      type: "rent",
      month: now.toLocaleString('default', { month: 'long' }),
      year: now.getFullYear(),
      amount: property.rentAmount,
      gatewayTransactionId: razorpay_payment_id,
      status: "completed"
    });

    // 5. FINALIZE ONBOARDING
    property.status = "occupied";
    await property.save();

    user.isOnboarded = true;
    await user.save();

    return NextResponse.json({ message: "Residency Unlocked Successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}