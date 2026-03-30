import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ExitProcess from "@/models/ExitProcess";
import Property from "@/models/Property"; 
import User from "@/models/User";         
import Inspection from "@/models/Inspection"; 

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const exitId = searchParams.get("exitId");

    if (!exitId) return NextResponse.json({ error: "Missing exitId" }, { status: 400 });

    // 1. Fetch Exit and Populate details
    const exit = await ExitProcess.findById(exitId)
      .populate("propertyId")
      .populate("tenantId");

    if (!exit) return NextResponse.json({ error: "Exit record not found" }, { status: 404 });

    const propertyObj = exit.propertyId;

    // 2. Fetch Move-In Baseline
    const moveInInspection = await Inspection.findOne({ 
      propertyId: propertyObj._id,
      type: "move-in" 
    }).sort({ createdAt: -1 });

    // Ensure we have arrays to map over
    const baselineImages = moveInInspection?.images || propertyObj?.images || [];
    const tenantProofImages = exit.moveOutPhotos || [];

    /**
     * ✅ THE FIX: INDEX-BASED MAPPING
     * Instead of creating a Set of categories (which collapses duplicates),
     * we map through the baseline images by their position (index).
     */
    const comparisonGrid = baselineImages.map((baselineImg: any, index: number) => {
      // Find the corresponding move-out photo at the EXACT same position
      const proofImg = tenantProofImages[index];

      return {
        // Fallback to "Area X" if category is missing or duplicated
        area: baselineImg.category || `Area ${index + 1}`, 
        baselineUrl: baselineImg.url || null,
        // Match the proof by index so Row 1 Baseline matches Row 1 Proof
        proofUrl: proofImg?.url || null 
      };
    });

    // 3. Optional: Handle extra photos if tenant uploaded more than the baseline
    if (tenantProofImages.length > baselineImages.length) {
       for (let i = baselineImages.length; i < tenantProofImages.length; i++) {
         comparisonGrid.push({
           area: tenantProofImages[i].area || `Extra Photo ${i + 1}`,
           baselineUrl: null,
           proofUrl: tenantProofImages[i].url
         });
       }
    }

    // 4. Return the data
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