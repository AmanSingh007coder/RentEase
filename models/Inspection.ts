import mongoose from "mongoose";

const InspectionSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["move-in", "move-out"], default: "move-in" },
  
  // Updated status to reflect the verification lifecycle
  status: { 
    type: String, 
    enum: ["pending", "verified", "rejected", "completed", "physical_audit_required"], 
    default: "pending" 
  },
  
  ownerFeedback: String,
  
  // The "Slot" based array
  images: [
    {
      url: { type: String, required: true },
      category: { type: String, required: true }, // Kitchen, Bedroom, etc.
      timestamp: { type: Date, default: Date.now },
      isCameraCaptured: { type: Boolean, default: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Inspection || mongoose.model("Inspection", InspectionSchema);