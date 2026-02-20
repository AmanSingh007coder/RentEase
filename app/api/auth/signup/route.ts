import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { name, email, password } = await request.json();

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // 2. Hash the password (Security First!)
    const hashedPassword = await bcrypt.hash(password, 12);

      // Update the User.create block
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "pending" // ✅ New manual signups also start as pending
      });

    return NextResponse.json({ message: "User created!", userId: newUser._id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}