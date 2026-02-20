import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ExitProcess from "@/models/ExitProcess";

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { exitId, deductions, finalRefundAmount } = await request.json();

    const updatedExit = await ExitProcess.findByIdAndUpdate(
      exitId,
      { 
        deductions, 
        finalRefundAmount, 
        status: "settled" 
      },
      { new: true }
    );

    return NextResponse.json({ message: "Refund processed", updatedExit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}