import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, 
  address: { type: String, required: true },
  inviteCode: { type: String, unique: true },
  
  // ✅ FINTECH FIELDS
  rentAmount: { type: Number, default: 15000 },
  depositAmount: { type: Number, default: 45000 },
  leaseStartDate: { type: Date, default: Date.now },
  billingDay: { type: Number, default: 1 }, 

  // ✅ STATUS FIELDS
  status: { 
    type: String, 
    enum: ["vacant", "occupied", "under_notice"], 
    default: "vacant" 
  },
  
  // ✅ TENANT HISTORY LOG
  pastTenants: [{
    tenantId: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    movedOutAt: { type: Date, default: Date.now }
  }],

  activeExitId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ExitProcess", 
    default: null 
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Property || mongoose.model("Property", PropertySchema);