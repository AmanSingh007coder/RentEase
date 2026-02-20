import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Property from "@/models/Property";
import User from "@/models/User"; // ❗ REQUIRED: Must import for .populate() to work

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    // ✅ LOGIC: Populate the tenantId to get the full name and email
    const property = await Property.findById(id)
      .populate("tenantId", "name email");

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({ property }, { status: 200 });
  } catch (error: any) {
    console.error("GET_SINGLE_PROPERTY_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}