import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Inspection from "@/models/Inspection";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");
    const type = searchParams.get("type") || "move-in";

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    // Find the most recent move-in inspection for this tenant
    const inspection = await Inspection.findOne({ tenantId, type }).sort({ createdAt: -1 });

    // We return a 200 even if null, so the frontend stops loading and shows the "Start" UI
    return NextResponse.json({ inspection }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}