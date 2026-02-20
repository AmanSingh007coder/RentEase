import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ExitProcess from "@/models/ExitProcess";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { exitId, photos } = await request.json(); // photos: [{ area: "Kitchen", url: "..." }]

    const updatedExit = await ExitProcess.findByIdAndUpdate(
      exitId,
      { 
        moveOutPhotos: photos,
        status: "photos_submitted" 
      },
      { new: true }
    );

    return NextResponse.json({ message: "Photos submitted for review", updatedExit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}