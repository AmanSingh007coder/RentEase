import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Property from "@/models/Property";
import User from "@/models/User"; // ✅ Added this import

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 1. Fetch the User first to get their linked propertyId
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. The "Two-Way Street" search logic
    const property = await Property.findOne({ 
      $or: [
        { tenantId: userId },       // Option A: Property points to Tenant
        { _id: user.propertyId }    // Option B: Tenant points to Property
      ] 
    }).populate("ownerId");

    if (!property) {
      return NextResponse.json({ 
        error: "No active lease found for this User ID in the database.",
        ledger: [],
        stats: { totalPaid: 0, pendingCount: 0 } 
      }, { status: 200 });
    }

    // 3. Generate months from leaseStartDate to Today
    // Current Date: February 15, 2026
    const startDate = new Date(property.leaseStartDate);
    const currentDate = new Date();
    const ledger = [];

    let tempDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (tempDate <= currentDate) {
      const monthName = tempDate.toLocaleString('default', { month: 'long' });
      const year = tempDate.getFullYear();

      console.log(`Searching for payment: propertyId=${property._id}, tenantId=${userId}, month=${monthName}, year=${year}`);

      const paymentRecord = await Payment.findOne({
        propertyId: property._id,
        tenantId: userId,
        month: monthName,
        year: year,
        type: "rent"
      });

      console.log(`Payment found for ${monthName} ${year}:`, paymentRecord ? "YES" : "NO");

      ledger.push({
        month: monthName,
        year: year,
        amount: property.rentAmount,
        status: paymentRecord ? "Paid" : "Pending",
        transactionId: paymentRecord?.gatewayTransactionId || null,
        date: paymentRecord?.createdAt || null
      });

      tempDate.setMonth(tempDate.getMonth() + 1);
    }

    const stats = {
      totalPaid: ledger.filter(l => l.status === "Paid").length * property.rentAmount,
      pendingCount: ledger.filter(l => l.status === "Pending").length
    };

    return NextResponse.json({ 
      property,
      ledger: ledger.reverse(), 
      stats 
    }, { status: 200 });

  } catch (error: any) {
    console.error("LEDGER_ERROR:", error.message);
    return NextResponse.json({ error: "Server Error: " + error.message }, { status: 500 });
  }
}