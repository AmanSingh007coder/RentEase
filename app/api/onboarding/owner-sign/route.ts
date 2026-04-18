import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Property from "@/models/Property";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { propertyId, signatureImg } = await request.json();

    const property = await Property.findByIdAndUpdate(propertyId, {
      "agreement.isSignedByOwner": true,
      // We don't change the hash here because the hash was created 
      // when the contract was first "locked" by the tenant.
      "agreement.ownerSignature": signatureImg, 
    }, { new: true });

    return NextResponse.json({ message: "Agreement Sealed by Owner" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}