import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Property from "@/models/Property";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { inviteCode, tenantId } = await request.json();

    // 1. Find the property by the unique RE-XXXX code
    const property = await Property.findOne({ 
      inviteCode: inviteCode.trim().toUpperCase() 
    });
    
    if (!property) {
      return NextResponse.json({ error: "Invalid Invite Code." }, { status: 404 });
    }

    // 2. Perform the Handshake: Link the tenant to the property
    property.tenantId = tenantId;
    // We don't set status to "occupied" yet! Only after payment.
    await property.save();

    // 3. Link Property to User
    const updatedUser = await User.findByIdAndUpdate(
      tenantId, 
      { propertyId: property._id },
      { new: true }
    );

    // ✅ RETURN PROPERTY DATA: This allows the frontend to show the Payment Modal immediately
    return NextResponse.json({ 
      message: "Link Successful", 
      property: {
        _id: property._id,
        address: property.address,
        depositAmount: property.depositAmount,
        rentAmount: property.rentAmount
      } 
    }, { status: 200 });

  } catch (error: any) {
    console.error("JOIN_ERROR:", error.message, error.stack);
    return NextResponse.json({ 
      error: error.message || "Vault synchronization failed." 
    }, { status: 500 });
  }
}