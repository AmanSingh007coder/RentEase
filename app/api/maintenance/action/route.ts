import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Maintenance from "@/models/Maintenance";
import { logActivity } from "@/lib/logActivity";

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { issueId, action, contractorName, contractorContact, arrivalDesc, feedback } = body;

    const statusMap: any = {
      approve_contractor: "contractor_assigned",
      tenant_fix: "tenant_fix",
      reject: "rejected",
      resolve_by_tenant: "resolved_by_tenant",
      resolve_by_contractor: "resolved_by_contractor"
    };

    const newStatus = statusMap[action];
    const updateData: any = { status: newStatus };

    // ✅ Explicitly map frontend names to Schema names
    if (action === "approve_contractor") {
      updateData.contractorInfo = {
        name: contractorName,
        contact: contractorContact, // Map contractorContact -> contact
        arrivalDesc: arrivalDesc
      };
    }

    if (action === "reject") {
      updateData.ownerFeedback = feedback;
    }

    // Update with { new: true } to return the updated document
    const updatedIssue = await Maintenance.findByIdAndUpdate(
      issueId, 
      { $set: updateData }, 
      { new: true }
    ).populate("propertyId");

    if (!updatedIssue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // 🔔 Notify the correct recipient
    const recipientId = action.startsWith("resolve") 
      ? updatedIssue.propertyId.ownerId 
      : updatedIssue.tenantId;

    await logActivity({
      propertyId: updatedIssue.propertyId._id,
      recipientId: recipientId,
      title: "Maintenance Update",
      desc: `Repair in ${updatedIssue.room} updated to: ${newStatus.replace(/_/g, " ")}`,
      category: "maintenance"
    });

    return NextResponse.json({ message: "Success", updatedIssue }, { status: 200 });
  } catch (error: any) {
    console.error("MAINTENANCE_ACTION_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}