import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ExitProcess from "@/models/ExitProcess";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    // Fetch notices that are either newly served or currently being rescheduled
    const exits = await ExitProcess.find({ 
      ownerId, 
      status: { $in: ["notice_served", "notice_rescheduled"] } 
    })
    .populate("propertyId")
    .populate("tenantId", "name email")
    .sort({ createdAt: -1 });

    return NextResponse.json({ exits });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}