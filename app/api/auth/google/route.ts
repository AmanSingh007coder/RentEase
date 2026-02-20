import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    // 1. Ensure DB is connected
    await connectToDatabase();

    // 2. Parse the body
    const body = await request.json();
    const { name, email, uid } = body;

    // 3. Basic validation
    if (!email || !uid) {
      return NextResponse.json({ error: "Missing email or UID from Google" }, { status: 400 });
    }

    // 4. Find or Create User
    let user = await User.findOne({ email });

    if (!user) {
      // Logic: New users start as 'pending' to trigger the Role Selection screen
      user = await User.create({
        name: name || "Google User",
        email: email,
        firebaseUid: uid,
        role: "pending", 
        password: "GOOGLE_AUTH_USER" // Placeholder for manual login bypass
      });
      console.log("New Google user created in MongoDB:", email);
    } else {
      console.log("Existing Google user logged in:", email);
    }

    // 5. Return the user object so the frontend can check the role
    return NextResponse.json({ 
      message: "Sync successful", 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        propertyId: user.propertyId,
        isOnboarded: user.isOnboarded
      } 
    }, { status: 200 });

  } catch (error: any) {
    // THIS LOGS THE ACTUAL ERROR IN YOUR VS CODE TERMINAL
    console.error("GOOGLE_SYNC_ERROR:", error.message);
    
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}