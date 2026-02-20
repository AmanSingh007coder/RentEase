import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Inspection from "@/models/Inspection";
import Property from "@/models/Property";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    // 1. Find all properties owned by this user
    const properties = await Property.find({ ownerId }).select("_id");
    const propertyIds = properties.map(p => p._id);

    // 2. Find all pending inspections for those properties
    const inspections = await Inspection.find({ 
      propertyId: { $in: propertyIds },
      status: "pending" 
    }).populate("tenantId", "name email").populate("propertyId", "address");

    return NextResponse.json({ inspections }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}