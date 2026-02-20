import mongoose from "mongoose";

const MoveInBaselineSchema = new mongoose.Schema({
  propertyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Property", 
    required: true,
    unique: true // One baseline per property
  },
  images: [{
    category: String, // e.g., "Kitchen", "Living Room"
    url: String,      // URL of the move-in photo
    createdAt: { type: Date, default: Date.now }
  }],
  capturedAt: { type: Date, default: Date.now }
});

export default mongoose.models.MoveInBaseline || mongoose.model("MoveInBaseline", MoveInBaselineSchema);