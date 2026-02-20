import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ExitProcess from "@/models/ExitProcess";
import Property from "@/models/Property"; // Needed for population

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    const history = await ExitProcess.find({ 
      tenantId, 
      status: "archived" 
    })
    .populate("propertyId", "address")
    .sort({ moveOutDate: -1 });

    return NextResponse.json({ history });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}