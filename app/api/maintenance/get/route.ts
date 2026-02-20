import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Maintenance from "@/models/Maintenance";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 });
    }

    /** * ✅ UPDATED: Added .populate("propertyId") 
     * This ensures 'propertyId' isn't just an ID string, but contains the full address.
     * We also sort by newest first to keep the 'Active Requests' current.
     */
    const issues = await Maintenance.find({ tenantId })
      .populate("propertyId", "address") 
      .sort({ createdAt: -1 });

    return NextResponse.json({ issues }, { status: 200 });
  } catch (error: any) {
    console.error("TENANT_MAINTENANCE_GET_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}