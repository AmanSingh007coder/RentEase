import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  // The person receiving the alert (e.g., Aman the Tenant)
  recipientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
  // The person who triggered it (e.g., the Property Owner)
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  
  // Categorize for UI icons: 'nudge', 'payment', 'maintenance'
  type: { 
    type: String, 
    required: true,
    enum: ["nudge", "payment", "maintenance", "system"],
    default: "system"
  },
  
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // Optional: Link to redirect the tenant to the payment page
  actionLink: { type: String, default: "/dashboard-tenant/payments" },
  
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Avoid "OverwriteModelError" in Next.js dev mode
export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);