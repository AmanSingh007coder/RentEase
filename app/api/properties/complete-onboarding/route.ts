import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Property from "@/models/Property";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { userId, propertyId } = await request.json();

    // 1. Mark User as fully onboarded
    await User.findByIdAndUpdate(userId, { isOnboarded: true });

    // 2. Officially set the Property status to occupied
    await Property.findByIdAndUpdate(propertyId, { status: "occupied" });

    return NextResponse.json({ message: "Onboarding complete!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}