import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Property from "@/models/Property";
import Payment from "@/models/Payment";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    // 1. Get all properties owned by this user
    const properties = await Property.find({ ownerId });
    const propertyIds = properties.map(p => p._id);

    // 2. Fetch ALL real rent payments from the database (January, etc.)
    // This ensures your historical filters actually find data
    const dbPayments = await Payment.find({ 
      propertyId: { $in: propertyIds },
      type: "rent" 
    }).populate("propertyId tenantId");

    // 3. Generate Virtual "Overdue" status for the Current Month (February)
    const currentMonth = "February";
    const currentYear = 2026;

    const currentMonthReports = await Promise.all(properties.map(async (prop) => {
      const tenant = await User.findOne({ propertyId: prop._id });
      if (!tenant) return null;

      // Check if February is already in our dbPayments list
      const hasPaidCurrent = dbPayments.some(p => 
        p.propertyId._id.toString() === prop._id.toString() && 
        p.month === currentMonth
      );

      // If not paid, create a "Virtual Overdue" record for the UI
      if (!hasPaidCurrent) {
        return {
          _id: `temp_${prop._id}_feb`,
          propertyId: prop,
          tenantId: tenant,
          month: currentMonth,
          year: currentYear,
          type: "rent",
          status: "overdue",
          amount: prop.rentAmount
        };
      }
      return null;
    }));

    // 4. Merge Real History + Virtual Current Status
    const finalReport = [
      ...dbPayments, 
      ...currentMonthReports.filter(Boolean)
    ];

    return NextResponse.json({ payments: finalReport });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}