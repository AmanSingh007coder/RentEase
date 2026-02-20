import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who sees this?
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who did it?
  title: { type: String, required: true },
  desc: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["payment", "maintenance", "legal", "social", "system"], 
    default: "system" 
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);