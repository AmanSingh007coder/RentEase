import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["deposit", "rent"], required: true },
  month: { type: String }, // e.g., "February"
  year: { type: Number },
  amount: { type: Number, required: true },
  gatewayTransactionId: { type: String, required: true }, // The ID from Razorpay/Stripe
  status: { type: String, default: "completed" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);