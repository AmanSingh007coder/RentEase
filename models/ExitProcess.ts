import mongoose from "mongoose";

const ExitProcessSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  noticeDate: { type: Date, default: Date.now },
  moveOutDate: { type: Date, required: true },
  reason: { type: String },

  status: { 
    type: String, 
    enum: [
          "notice_served", 
          "notice_rescheduled", // Added
          "notice_accepted",    // Added
          "photos_submitted", 
          "physical_inspection_required", 
          "physical_inspection_done", 
          "inspection_completed", 
          "settled", 
          "archived"
        ],
    default: "notice_served"
  },

  moveOutPhotos: [{
    area: String,
    url: String,
    comment: String
  }],

  // --- Physical Inspection Details ---
  inspectionDate: Date,
  inspectorName: String,
  inspectorContact: String,
  physicalAuditNotes: String,

  // --- Financial Reconciliation ---
  deductions: [{
    item: String,
    amount: Number,
    reason: String
  }],
  finalRefundAmount: { type: Number, default: 0 },
  isTenantSatisfied: { type: Boolean, default: false }, // Final handshake
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ExitProcess || mongoose.model("ExitProcess", ExitProcessSchema);