import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification";
import Activity from "@/models/Activity"; // ✅ Import your old Activity model

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    // 1. Fetch from the new Notification store (Nudges)
    const notifications = await Notification.find({ 
      $or: [{ recipientId: userId }, { senderId: userId }] 
    });

    // 2. Fetch from the old Activity store (Payment logs, etc.)
    const legacyActivities = await Activity.find({ 
      $or: [{ recipientId: userId }, { senderId: userId }] 
    });

    // 3. Merge and Sort by Date
    const combined = [...notifications, ...legacyActivities].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ activities: combined.slice(0, 30) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}