import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ExitProcess from "@/models/ExitProcess";
import User from "@/models/User"; // To get tenant names
import Property from "@/models/Property"; // To get property addresses

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    if (!ownerId) return NextResponse.json({ error: "Owner ID required" }, { status: 400 });

    // Find all exit processes for this owner that aren't 'archived' or 'settled'
    const requests = await ExitProcess.find({ 
      ownerId, 
      status: { $ne: "archived" } 
    })
    .populate({ path: "tenantId", select: "name email" })
    .populate({ path: "propertyId", select: "address" })
    .sort({ createdAt: -1 });

    return NextResponse.json({ requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}