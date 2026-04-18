import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Property from "@/models/Property";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { propertyId, tenantId, signatureImg } = await request.json();

    // 1. GENERATE BLOCKCHAIN FINGERPRINT (SHA-256)
    // We hash the Property ID + Tenant ID + Signature to create a unique ID
    const contentToHash = `${propertyId}-${tenantId}-${signatureImg.substring(0, 100)}`;
    const hash = crypto.createHash("sha256").update(contentToHash).digest("hex");

    // 2. UPDATE PROPERTY
    const property = await Property.findByIdAndUpdate(propertyId, {
      "agreement.isSignedByTenant": true,
      "agreement.blockchainHash": hash,
      "agreement.signedAt": new Date(),
      tenantId: tenantId // Formalize link if not already done
    }, { new: true });

    return NextResponse.json({ message: "Agreement Fingerprinted", hash });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}