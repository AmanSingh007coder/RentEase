import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ExitProcess from "@/models/ExitProcess";
import Property from "@/models/Property"; // ❗ REQUIRED for .populate()
import User from "@/models/User";         // ❗ REQUIRED for .populate()

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const exitId = searchParams.get("exitId");

    if (!exitId) {
      return NextResponse.json({ error: "Exit ID is required" }, { status: 400 });
    }

    // ✅ LOGIC: Fetch the archived record and fill in the details
    const exit = await ExitProcess.findById(exitId)
      .populate("propertyId", "address")     // Get the house address
      .populate("tenantId", "name email");   // Get the human details

    if (!exit) {
      return NextResponse.json({ error: "Archived record not found" }, { status: 404 });
    }

    return NextResponse.json({ exit }, { status: 200 });
  } catch (error: any) {
    console.error("FETCH_ARCHIVE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}