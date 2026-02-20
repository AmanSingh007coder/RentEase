import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Payment from "@/models/Payment";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { userId, transactionId } = await request.json();

    const user = await User.findById(userId).populate("propertyId");
    const property = user.propertyId;

    // 1. Create the Security Deposit Record
    await Payment.create({
      propertyId: property._id,
      tenantId: userId,
      type: "deposit",
      amount: property.depositAmount,
      gatewayTransactionId: transactionId,
      status: "completed"
    });

    // 2. ✅ NEW: Create or Update the First Month Rent Record (Current Month)
    // Dynamically get current month and year for the lease start month
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' }); // e.g., "February"
    const currentYear = now.getFullYear();

    console.log("Creating/Updating rent payment with:", {
      propertyId: property._id,
      tenantId: userId,
      month: currentMonth,
      year: currentYear,
      amount: property.rentAmount
    });

    // Check if rent payment already exists (for any month) and delete old ones
    await Payment.deleteMany({
      propertyId: property._id,
      tenantId: userId,
      type: "rent"
    });

    // Now create the correct rent payment for current month
    await Payment.create({
      propertyId: property._id,
      tenantId: userId,
      type: "rent",
      month: currentMonth, // Dynamic current month
      year: currentYear,
      amount: property.rentAmount,
      gatewayTransactionId: transactionId,
      status: "completed"
    });

    console.log("Rent payment created successfully for", currentMonth, currentYear);

    // 3. ✅ Update property status to "occupied" after payment
    property.status = "occupied";
    await property.save();

    user.isOnboarded = true;
    await user.save();

    return NextResponse.json({ message: "Onboarding and 1st month rent verified." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}