import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Property from "@/models/Property";
import User from "@/models/User"; // Required for population

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    if (!ownerId) return NextResponse.json({ error: "Owner ID required" }, { status: 400 });

    // ✅ POPULATE tenantId to get name and email
    const properties = await Property.find({ ownerId })
      .populate("tenantId", "name email") 
      .sort({ createdAt: -1 });

    return NextResponse.json({ properties }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}