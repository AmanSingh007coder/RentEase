import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ExitProcess from "@/models/ExitProcess";
import { logActivity } from "@/lib/logActivity";

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { exitId, deductions, finalRefundAmount } = await request.json();

    const updatedExit = await ExitProcess.findByIdAndUpdate(
      exitId,
      { 
        deductions, 
        finalRefundAmount, 
        status: "settled",
        settledAt: new Date()
      },
      { new: true }
    );

    if (!updatedExit) return NextResponse.json({ error: "Exit record not found" }, { status: 404 });

    // 🔔 NOTIFY TENANT: Refund is ready for review
    await logActivity({
      propertyId: updatedExit.propertyId,
      recipientId: updatedExit.tenantId,
      title: "Refund Calculated 💰",
      desc: `The owner has finalized the settlement. Please review and sign the discharge.`,
      category: "financial"
    });

    return NextResponse.json({ message: "Settlement finalized", updatedExit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}