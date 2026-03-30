import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ExitProcess from "@/models/ExitProcess";
import Property from "@/models/Property";
import User from "@/models/User";

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { exitId, status, isTenantSatisfied, moveOutDate} = await request.json();

// 1. Update the Exit Record
    const updateData: any = { status, isTenantSatisfied };
    
    // ✅ FIX: If a new date is provided (via reschedule or acceptance), update it in DB
    if (moveOutDate) {
      updateData.moveOutDate = new Date(moveOutDate);
    }

    const updatedExit = await ExitProcess.findByIdAndUpdate(
      exitId,
      updateData,
      { new: true }
    ).populate("tenantId");

    if (!updatedExit) return NextResponse.json({ error: "Exit record not found" }, { status: 404 });

    // 2. DISCHARGE LOGIC: Sever the database links
    if (status === "archived") {
      // ✅ A. Reset Property: Push to history, wipe tenantId, set Vacant
      await Property.findByIdAndUpdate(updatedExit.propertyId, {
        $push: { 
          pastTenants: { 
            tenantId: updatedExit.tenantId._id,
            name: updatedExit.tenantId.name,
            email: updatedExit.tenantId.email,
            movedOutAt: new Date()
          } 
        },
        tenantId: null,      // ❌ OFFICIALLY UNLINKED
        status: "vacant",    // ✅ READY FOR NEW TENANT
        activeExitId: null   // ✅ CLEAR NEGOTIATION
      });

      // ✅ B. Reset User: Wipe propertyId to trigger "Invite Code" redirect next login
      await User.findByIdAndUpdate(updatedExit.tenantId._id, { 
        propertyId: null,
        isOnboarded: false   // Reset onboarding for their next house
      });
    }

    return NextResponse.json({ message: "Lease archived and IDs unlinked", updatedExit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}