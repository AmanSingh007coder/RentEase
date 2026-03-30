# 🏠 RentEase — The Digital Witness for Rentals

> **Built to solve a ₹30,000 problem.** A mobile-first PWA that eliminates rental deposit disputes through cryptographic evidence and transparent workflows.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)

---

## 💡 The Problem

During my 3rd semester break, I witnessed a neighbor lose their entire security deposit in a rental dispute. The landlord claimed damages. The tenant said the damage was pre-existing. **Neither had proof.**

That ₹30,000 loss happened because rentals operate on trust — but trust breaks when there's no shared record of truth.

**RentEase solves this** by acting as a neutral "Digital Witness" that timestamps property conditions, tracks maintenance issues, and automates deposit settlements.

---

## 🎯 What RentEase Does

RentEase is a **two-sided rental management platform** that creates an immutable audit trail for both tenants and landlords.

### For Tenants 👤
- 📸 **Move-in documentation** with cryptographic timestamps (camera-only, no gallery uploads)
- 🔧 **Maintenance tracking** with photo proof and WhatsApp integration
- 💰 **Rent & deposit ledger** with payment history
- ⚖️ **Side-by-side move-out comparison** to prove property condition
- 🏠 **Residency Vault** — portable rental credibility for future landlords

### For Landlords 🏢
- 🏘️ **Multi-property dashboard** with centralized oversight
- ✅ **Inspection approval workflows** (co-sign move-in/move-out photos)
- 📊 **Revenue analytics** with visual payment tracking (Recharts)
- 🔧 **Maintenance queue** across all properties
- 📄 **Automated discharge certificates** (jsPDF generation)

---

## 🏗️ System Architecture

### Core Principles

1. **Cryptographic Evidence**: Every photo is timestamped at upload (Cloudinary metadata + app timestamp)
2. **Camera-Only Uploads**: Gallery photos blocked to prevent backdating
3. **Inspection Locking**: After landlord approval, baseline photos become immutable
4. **State-Driven UI**: Dashboard changes based on lease status (Fresh → Active → Archived)
5. **Two-Sided Marketplace**: Balanced workflows that protect both parties

### Data Flow
```
Tenant Signs Up
    ↓
Owner Generates Invite Code
    ↓
Tenant Joins Property
    ↓
Move-In Inspection (Photos Locked After Approval)
    ↓
Active Tenancy (Maintenance + Rent Tracking)
    ↓
Move-Out Notice → Exit Inspection
    ↓
Deposit Settlement (Side-by-Side Comparison)
    ↓
Archived Tenancy (Residency Vault)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) + TypeScript | Type-safe, server-side rendering |
| **Styling** | Tailwind CSS + Framer Motion | Responsive design + smooth animations |
| **Database** | MongoDB (Mongoose ODM) | Complex relationships (Users ↔ Properties ↔ Payments ↔ Inspections) |
| **Storage** | Cloudinary | Photo metadata preservation + CDN delivery |
| **Auth** | Firebase Auth (Google) + bcrypt | Passwordless + traditional auth |
| **Charts** | Recharts | Revenue analytics for landlords |
| **PDFs** | jsPDF | Automated discharge certificates |
| **Deployment** | Vercel (planned) | Edge-optimized Next.js hosting |

---

## 📊 Database Schema (Simplified)

### User Model
```typescript
{
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  role: "owner" | "tenant",
  propertyId: ObjectId (ref: Property),
  isOnboarded: Boolean (payment gatekeeper)
}
```

### Property Model
```typescript
{
  ownerId: ObjectId (ref: User),
  tenantId: ObjectId (ref: User, nullable),
  address: String,
  inviteCode: String (unique),
  rentAmount: Number,
  depositAmount: Number,
  status: "vacant" | "occupied" | "under_notice",
  pastTenants: [{ tenantId, name, movedOutAt }],
  activeExitId: ObjectId (ref: ExitProcess)
}
```

### Inspection Model
```typescript
{
  propertyId: ObjectId (ref: Property),
  tenantId: ObjectId (ref: User),
  type: "move-in" | "move-out",
  status: "pending" | "verified" | "rejected",
  images: [
    {
      url: String,
      category: String (Kitchen, Bedroom, etc.),
      timestamp: Date,
      isCameraCaptured: Boolean (anti-tamper flag)
    }
  ]
}
```

### Maintenance Model
```typescript
{
  propertyId: ObjectId,
  tenantId: ObjectId,
  room: String,
  description: String,
  status: "pending" | "contractor_assigned" | "resolved",
  images: [{ url, isCameraCaptured, timestamp }],
  contractorInfo: { name, contact, arrivalDesc }
}
```

### Payment Model
```typescript
{
  propertyId: ObjectId,
  tenantId: ObjectId,
  type: "deposit" | "rent",
  month: String (e.g., "February"),
  year: Number,
  amount: Number,
  gatewayTransactionId: String,
  status: "completed"
}
```

### Exit Process Model
```typescript
{
  propertyId: ObjectId,
  tenantId: ObjectId,
  noticeDate: Date,
  moveOutDate: Date,
  status: "notice_served" | "photos_submitted" | "settled" | "archived",
  moveOutPhotos: [{ area, url, comment }],
  deductions: [{ item, amount, reason }],
  finalRefundAmount: Number,
  isTenantSatisfied: Boolean
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js **v18+**
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (free tier: 25GB storage)
- Firebase project (for Google Auth)

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/rentease.git
cd rentease

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

### Environment Variables
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Cloudinary (Photo Storage)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset

# Firebase Auth
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📸 Key Features (Technical Deep Dive)

### 1. Anti-Tampering Photo System

**Problem**: Users could upload old photos from gallery to fake property condition.

**Solution**:
```typescript
// Force camera-only uploads
<input 
  type="file" 
  accept="image/*" 
  capture="environment" // ← Blocks gallery on mobile
  onChange={verifyFreshPhoto}
/>

// Verify photo is <60 seconds old
const verifyFreshPhoto = (file: File) => {
  const photoAge = Date.now() - file.lastModified;
  if (photoAge > 60000) {
    alert("Please use live camera, not gallery");
    return false;
  }
  return true;
};
```

**Result**: Every photo gets dual timestamps (app + Cloudinary) for legal defensibility.

---

### 2. Inspection Locking Mechanism

**Problem**: After move-in, either party could try to alter baseline photos.

**Solution**:
```typescript
// After landlord approval
await Inspection.findByIdAndUpdate(inspectionId, {
  status: "verified",
  verifiedAt: new Date(),
  verifiedBy: landlordId
});

// MongoDB prevents further edits
InspectionSchema.pre('save', function(next) {
  if (this.status === 'verified' && this.isModified('images')) {
    throw new Error('Cannot modify verified inspection');
  }
  next();
});
```

**Result**: Baseline photos become immutable evidence.

---

### 3. Side-by-Side Move-Out Comparison

**Problem**: During exit, manual comparison of 50+ photos is tedious and error-prone.

**Solution**:
```typescript
// Fetch both inspections
const moveIn = await Inspection.findOne({ 
  propertyId, 
  type: "move-in", 
  status: "verified" 
});

const moveOut = await Inspection.findOne({ 
  propertyId, 
  type: "move-out" 
});

// Match photos by category (Kitchen, Bedroom, etc.)
const comparison = moveIn.images.map(beforeImg => ({
  before: beforeImg,
  after: moveOut.images.find(img => img.category === beforeImg.category),
  category: beforeImg.category
}));
```

**UI**: Slider-based comparison (like Instagram before/after) for each room.

---

### 4. Maintenance WhatsApp Bridge

**Problem**: Landlords ignore in-app notifications, prefer WhatsApp.

**Solution**:
```typescript
// Generate public issue link (no login required)
const issueLink = `${process.env.NEXT_PUBLIC_URL}/public/issue/${issueId}`;

// Pre-filled WhatsApp message
const whatsappMsg = encodeURIComponent(`
🔧 Maintenance Issue Reported

Property: ${property.address}
Issue: ${issue.description}
Urgency: ${issue.urgency}

View & Respond: ${issueLink}
`);

// Redirect to WhatsApp
window.open(`https://wa.me/${landlordPhone}?text=${whatsappMsg}`);
```

**Result**: Landlords can approve/reject issues directly from WhatsApp link (syncs back to app).

---

## 📈 Analytics & Insights

### Landlord Dashboard Charts (Recharts)

1. **Revenue Over Time**: Monthly rent collection trends


### Tenant Dashboard Metrics

1. **Rent Payment Streak**: Consecutive on-time payments
2. **Maintenance Requests**: Resolved vs pending count

---

## 🔐 Security & Privacy

### Data Protection
- **Passwords**: Bcrypt hashed (salt rounds: 10)
- **Photos**: Cloudinary signed URLs (1-hour expiry for sensitive docs)
- **API Routes**: Protected with Next.js middleware (role-based access)

### Privacy Rules
- **Tenant Data**: Only visible to linked landlord + tenant
- **Photo Access**: Landlords lose access to photos after tenancy closes (DPDP compliance)
- **Payment Info**: Masked card numbers, only last 4 digits visible

### Compliance (Planned Phase 2)
- **DPDP Act (India)**: Right to data deletion + export
- **Auto-deletion**: Photos deleted 2 years after tenancy ends

---

## 🧪 Testing (Phase 2)
```bash
# Unit tests
npm run test

# E2E tests (Playwright)
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 🗺️ Roadmap

### Phase 1 (Current) 
- [x] User authentication (Firebase + bcrypt)
- [x] Property management (CRUD)
- [x] Move-in/move-out inspections
- [x] Maintenance tracking
- [x] Rent payment ledger
- [x] Exit process workflow
- [x] Residency Vault (archived profiles)
- [x] PDF certificate generation

### Phase 2 :
- [ ] **Payment Gateway Integration** (Razorpay/Stripe)
- [ ] **JWT-based sessions** (replace Firebase tokens)
- [ ] **Dispute resolution module** (third-party mediation)
- [ ] **Multi-tenant support** (flatmates with role hierarchy)
- [ ] **WhatsApp bot** (automated reminders)
- [ ] **Push notifications** (PWA service workers)

---

## 🤝 Contributing

This is a personal learning project, but feedback and suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📚 Key Learnings

Building RentEase taught me:

### 1. Complex State Management
- Designing **non-linear workflows** (lease lifecycle FSM)
- Handling **conditional UI** based on tenancy status
- Managing **multi-party approval chains**

### 2. MongoDB Relationships
- **One-to-Many**: User → Properties
- **Many-to-Many**: Properties ↔ Inspections ↔ Maintenance
- **Embedded vs Referenced**: When to denormalize for performance

### 3. Mobile-First PWA
- **Service workers** for offline support
- **Camera API** constraints on iOS Safari
- **Touch-first interactions** (swipe gestures, bottom sheets)

### 4. Real-World Edge Cases
- What if tenant forgets to do move-in inspection?
- What if landlord never approves photos?
- What if property is sold mid-tenancy?

---

## 🐛 Known Issues

- [ ] Camera permission prompt inconsistent on iOS Safari
- [ ] Large photo uploads (>5MB) timeout on slow networks
- [ ] Firebase Auth refresh token edge case on session expiry

---

## 🙏 Acknowledgments

- **Inspiration**: My neighbor's ₹30,000 deposit dispute
- **Cloudinary**: Free 25GB storage for indie developers
- **Next.js Team**: For the incredible App Router DX
- **MongoDB University**: For teaching me schema design patterns

---

## 📧 Contact

**Aman Kumar Singh**  
📧 Email: amansighrajput9005@gmail.com  
🔗 LinkedIn: [Aman Kumar Singh](https://www.linkedin.com/in/aman-kumar-singh-be/)  

---

## 🌟 Star History

If this project helped you understand rental tech or PWA development, please consider giving it a ⭐!

---

**Built with 💙 during semester break. From a real problem to a real solution.**

---
