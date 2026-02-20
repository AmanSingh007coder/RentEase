import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ExitProcess from "@/models/ExitProcess";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });

    // ✅ ONLY return the exit process if it is NOT archived
    const exit = await ExitProcess.findOne({ 
      tenantId, 
      status: { $ne: "archived" } 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ exit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}