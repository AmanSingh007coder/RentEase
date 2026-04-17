import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { amount, currency = "INR", receiptId } = await request.json();

    const options = {
      amount: Math.round(amount * 100), // Convert Rupees to Paise
      currency,
      receipt: receiptId,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error("RAZORPAY_ORDER_ERROR:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}