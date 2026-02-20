import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Property from "@/models/Property"; // Adjust path as needed
import cloudinary from "@/lib/cloudinary";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { ownerId, address, rentAmount, depositAmount, roomDetails, guidelines, images } = body;

    const uploadedImages = await Promise.all(
      images.map(async (imgBase64: string) => {
        const result = await cloudinary.uploader.upload(imgBase64, {
          folder: "rentease/properties",
        });
        return {
          url: result.secure_url,
          isCameraCaptured: false,
          timestamp: new Date(),
        };
      })
    );

    const inviteCode = `RE-${nanoid(4).toUpperCase()}`;

    const newProperty = await Property.create({
      ownerId,
      address,
      rentAmount: Number(rentAmount),
      depositAmount: Number(depositAmount),
      roomDetails,
      guidelines,
      images: uploadedImages,
      inviteCode,
      status: "vacant",
      // ✅ FIX: Explicitly set the start date to the first of the current month
      leaseStartDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    });

    return NextResponse.json({ 
      message: "Property created successfully!", 
      inviteCode: newProperty.inviteCode 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}