// app/api/properties/tenant-view/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Property from "@/models/Property";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    // ✅ FIX: Changed 'tenants' (plural) to 'tenantId' (singular) 
    // to match your database dump exactly.
    const property = await Property.findOne({ tenantId: tenantId }).populate("ownerId");

    console.log("Database Search Result:", property); // Check your terminal to see if it found it!

    return NextResponse.json({ property });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}