import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Property from "@/models/Property";

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { propertyId, address, rentAmount, depositAmount, roomDetails, guidelines } = body;

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID required for update" }, { status: 400 });
    }

    // 3. Update the existing document instead of creating a new one
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      {
        address,
        rentAmount: Number(rentAmount),
        depositAmount: Number(depositAmount),
        roomDetails,
        // Convert comma-separated string back to array if needed
        guidelines: typeof guidelines === 'string' 
          ? guidelines.split(",").map((s: string) => s.trim()) 
          : guidelines,
      },
      { new: true } // Return the updated version
    );

    return NextResponse.json({ message: "Property updated!", updatedProperty }, { status: 200 });
  } catch (error: any) {
    console.error("UPDATE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}