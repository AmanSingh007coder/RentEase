// app/api/properties/tenant-view/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Property from "@/models/Property";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");

  await connectToDatabase();
  
  // Find the property where this tenantId exists in the tenants array
  // .populate("ownerId") fetches the landlord's real name and email
  const property = await Property.findOne({ tenants: tenantId }).populate("ownerId");

  return NextResponse.json({ property });
}