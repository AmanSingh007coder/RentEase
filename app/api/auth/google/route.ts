import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, email, uid } = body;

    if (!email || !uid) {
      return NextResponse.json({ error: "Missing Google auth data" }, { status: 400 });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email: email,
        firebaseUid: uid,
        role: "pending", 
        password: "GOOGLE_AUTH_USER" 
      });
      console.log("New Google user created:", email);
    }

    // ✅ RETURN FULL PAYLOAD FOR DASHBOARD DECISIONS
    return NextResponse.json({ 
      message: "Sync successful", 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        propertyId: user.propertyId || null,
        isOnboarded: user.isOnboarded || false
      } 
    }, { status: 200 });

  } catch (error: any) {
    console.error("GOOGLE_SYNC_ERROR:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}