import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ExitProcess from "@/models/ExitProcess";

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { 
      exitId, 
      status, 
      inspectionDate, 
      inspectorName, 
      inspectorContact 
    } = await request.json();

    const updateData: any = { status };
    
    // If flagged for physical visit, save inspector details
    if (status === "physical_inspection_required") {
      updateData.inspectionDate = inspectionDate;
      updateData.inspectorName = inspectorName;
      updateData.inspectorContact = inspectorContact;
    }

    const updatedExit = await ExitProcess.findByIdAndUpdate(
      exitId,
      updateData,
      { new: true }
    );

    return NextResponse.json({ message: "Decision recorded", updatedExit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}