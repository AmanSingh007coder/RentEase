import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Inspection from "@/models/Inspection";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) return NextResponse.json({ error: "Property ID required" }, { status: 400 });

    console.log("🔍 API search for Property:", propertyId);

    // Resilient Query: Search by ObjectId OR String just in case of DB casting issues
    const inspection = await Inspection.findOne({ 
      $or: [
        { propertyId: propertyId },
        { propertyId: new mongoose.Types.ObjectId(propertyId) }
      ],
      type: "move-in" 
    }).sort({ createdAt: -1 });

    if (!inspection) {
      console.log("❌ DB: No move-in found for propertyId:", propertyId);
      return NextResponse.json({ error: "No baseline found" }, { status: 404 });
    }

    console.log("✅ DB: Found baseline with", inspection.images.length, "slots.");

    // Return the images array as 'slots'
    return NextResponse.json({ slots: inspection.images || [] });
  } catch (error: any) {
    console.error("🔥 API ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}