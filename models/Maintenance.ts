import mongoose from "mongoose";

const MaintenanceSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  room: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["pending", "contractor_assigned", "tenant_fix", "rejected", "resolved_by_tenant", "resolved_by_contractor"], 
    default: "pending" 
  },
  images: [{
    url: String,
    isCameraCaptured: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now }
  }],
  // ✅ This section MUST be present for MongoDB to accept the data
  contractorInfo: {
    name: { type: String, default: "" },
    contact: { type: String, default: "" },
    arrivalDesc: { type: String, default: "" }
  },
  ownerFeedback: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Maintenance || mongoose.model("Maintenance", MaintenanceSchema);