import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Property from "@/models/Property";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // 1. Get tenantId from the URL query string
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 });
    }

    // 2. Find the property where this tenant is currently staying
    const property = await Property.findOne({ tenantId });

    if (!property) {
      return NextResponse.json({ property: null, message: "No property linked to this tenant" }, { status: 200 });
    }

    // 3. Return the property (which includes property._id and ownerId)
    return NextResponse.json({ property });
  } catch (error: any) {
    console.error("GET_BY_TENANT_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}