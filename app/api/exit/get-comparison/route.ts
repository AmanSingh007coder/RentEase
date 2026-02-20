import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ExitProcess from "@/models/ExitProcess";
import Property from "@/models/Property"; // ❗ CRITICAL: Must be imported for populate
import User from "@/models/User";         
import Inspection from "@/models/Inspection"; 

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const exitId = searchParams.get("exitId");

    if (!exitId) return NextResponse.json({ error: "Missing exitId" }, { status: 400 });

    // 1. Fetch Exit and Populate the full Property object
    const exit = await ExitProcess.findById(exitId)
      .populate("propertyId")
      .populate("tenantId");

    if (!exit) return NextResponse.json({ error: "Exit record not found" }, { status: 404 });

    const propertyObj = exit.propertyId; // This is now the full property document

    // 2. Fetch Move-In Baseline from Inspection Collection
    const moveInInspection = await Inspection.findOne({ 
      propertyId: propertyObj._id,
      type: "move-in" 
    }).sort({ createdAt: -1 });

    const baselineImages = moveInInspection?.images || propertyObj?.images || [];
    const tenantProofImages = exit.moveOutPhotos || [];

    // 3. Create Comparison Grid
    const allCategories = Array.from(new Set([
      ...baselineImages.map((img: any) => img.category || "General"),
      ...tenantProofImages.map((img: any) => img.area || "General")
    ]));

    const comparisonGrid = allCategories.map(cat => {
      const baseline = baselineImages.find((img: any) => (img.category || "General") === cat);
      const proof = tenantProofImages.find((img: any) => (img.area || "General") === cat);
      return {
        area: cat,
        baselineUrl: baseline?.url || null,
        proofUrl: proof?.url || null
      };
    });

    // 4. Return the data
    // We send 'property' explicitly so the frontend can find result.property.securityDeposit
    return NextResponse.json({ 
      exit, 
      comparisonGrid, 
      property: propertyObj 
    });

  } catch (error: any) {
    console.error("Comparison API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}