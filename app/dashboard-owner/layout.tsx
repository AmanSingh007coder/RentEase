"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, Building2, Wrench, ShieldCheck, IndianRupee, 
  Settings, LogOut, PlusCircle, X, Plus 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PropertyProvider, useProperty } from "../context/PropertyContext";

const ownerNavItems = [
  { name: "Portfolio", href: "/dashboard-owner", icon: LayoutGrid, color: "#1F2937" },
  { name: "Properties", href: "/dashboard-owner/propertiess", icon: Building2, color: "#0052CC" },
  { name: "Maintenance", href: "/dashboard-owner/maintenance", icon: Wrench, color: "#F59E0B" },
  { name: "Inspections", href: "/dashboard-owner/inspections", icon: ShieldCheck, color: "#0D9488" },
  { name: "Financials", href: "/dashboard-owner/financials", icon: IndianRupee, color: "#10B981" },
  { name: "Settings", href: "/dashboard-owner/settingss", icon: Settings, color: "#6B7280" },
  { name: "Exit Notices", href: "/dashboard-owner/exit", icon: LogOut, color: "#6B7280" },
];

function ModalManager() {
  const { isModalOpen, editingProperty, closeModal } = useProperty();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [propertyData, setPropertyData] = useState({
    address: "",
    rentAmount: "",
    depositAmount: "",
    rooms: "1",
    furnishing: "unfurnished",
    guidelines: "",
    images: [] as string[]
  });


  // ✅ ADD THIS: Sync form with the property being edited
useEffect(() => {
  if (isModalOpen && editingProperty) {
    // ✅ Logging to verify data is reaching the modal
    console.log("Editing Mode Active:", editingProperty);

    setPropertyData({
      address: editingProperty.address || "",
      rentAmount: editingProperty.rentAmount?.toString() || "",
      depositAmount: editingProperty.depositAmount?.toString() || "",
      rooms: editingProperty.roomDetails?.rooms?.toString() || "1",
      furnishing: editingProperty.roomDetails?.furnishing || "unfurnished",
      guidelines: Array.isArray(editingProperty.guidelines) 
        ? editingProperty.guidelines.join(", ") 
        : editingProperty.guidelines || "",
      images: [] // We don't edit images in this step to save bandwidth
    });
    setStep(1); // Ensure we start at Step 1 for edits
  } else if (isModalOpen && !editingProperty) {
    // Reset for fresh "Add"
    setPropertyData({ address: "", rentAmount: "", depositAmount: "", rooms: "1", furnishing: "unfurnished", guidelines: "", images: [] });
    setStep(1);
  }
}, [editingProperty, isModalOpen]);



  // ✅ UPDATE THIS: Handle both Create and Update
const handleSubmit = async () => {
  setLoading(true);
  try {
    // 1. Determine if this is a NEW property or an EDIT
    const isEditing = !!editingProperty; 
    const endpoint = isEditing ? "/api/properties/update" : "/api/properties/create";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...propertyData,
        // 2. If editing, we MUST send the property ID so Mongo knows which one to fix
        propertyId: isEditing ? editingProperty._id : null,
        ownerId: localStorage.getItem("userId"),
        roomDetails: { 
          rooms: propertyData.rooms, 
          furnishing: propertyData.furnishing 
        }
      }),
    });

    if (res.ok) {
      closeModal();
      window.location.reload(); 
    } else {
      const errorData = await res.json();
      alert(errorData.error || "Save failed");
    }
  } catch (err) {
    alert("System error. Check console.");
  } finally {
    setLoading(false);
  }
};

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPropertyData(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCreateProperty = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/properties/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...propertyData,
          ownerId: localStorage.getItem("userId"),
          roomDetails: { rooms: propertyData.rooms, furnishing: propertyData.furnishing }
        }),
      });
      if (res.ok) {
        closeModal();
        window.location.reload();
      }
    } catch (err) { alert("Failed to create property"); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button onClick={closeModal} className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"><X size={24} /></button>
            
            <div className="p-8 md:p-12">
              <div className="flex gap-2 mb-10">
                {[1, 2].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-[#0052CC]' : 'bg-gray-100'}`} />)}
              </div>

              {step === 1 ? (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-[#1F2937]">Basic Details</h2>
                  <input type="text" value={propertyData.address} placeholder="Property Address" className="w-full p-5 bg-gray-50 rounded-2xl outline-none border border-gray-100 focus:border-[#0052CC] text-gray-800" onChange={e => setPropertyData({...propertyData, address: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={propertyData.rentAmount} placeholder="Rent (₹)" className="p-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none text-gray-800" onChange={e => setPropertyData({...propertyData, rentAmount: e.target.value})} />
                    <input type="number" value={propertyData.depositAmount} placeholder="Deposit (₹)" className="p-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none text-gray-800" onChange={e => setPropertyData({...propertyData, depositAmount: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select value={propertyData.rooms} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none text-gray-800" onChange={e => setPropertyData({...propertyData, rooms: e.target.value})}>
                      <option value="1">1 BHK</option>
                      <option value="2">2 BHK</option>
                      <option value="3">3 BHK</option>
                    </select>
                    <select value={propertyData.furnishing} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none text-gray-800" onChange={e => setPropertyData({...propertyData, furnishing: e.target.value})}>
                      <option value="unfurnished">Unfurnished</option>
                      <option value="semi">Semi-Furnished</option>
                      <option value="fully">Fully-Furnished</option>
                    </select>
                  </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-2">Amenities & Guidelines</label>
                          <textarea 
                            value={propertyData.guidelines} placeholder="e.g. WiFi included, No pets, Smoking allowed in balcony only..."
                            rows={3}
                            className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-[#0052CC] text-gray-800 resize-none transition-all"
                            onChange={e => setPropertyData({...propertyData, guidelines: e.target.value})}
                          />
                        </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-[#1F2937]">Upload Photos</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {propertyData.images.map((img, i) => <img key={i} src={img} className="aspect-square rounded-2xl object-cover border" />)}
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                      <Plus size={20} className="text-gray-400" />
                      <input type="file" multiple className="hidden" onChange={handleImage} />
                    </label>
                  </div>
                </div>
              )}

              <div className="mt-12 flex gap-4">
                {step > 1 && <button onClick={() => setStep(1)} className="px-8 py-4 font-bold text-gray-400">Back</button>}
                <button onClick={() => step === 1 ? setStep(2) : handleSubmit()} className="flex-1 bg-[#0052CC] text-white py-5 rounded-2xl font-bold">
                  {loading ? "Syncing..." : step === 1 ? "Next" : "List Property"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Sidebar({ userName, openModal, pathname }: { userName: string, openModal: () => void, pathname: string }) {
  return (
    <aside className="hidden md:flex w-72 bg-[#1F2937] flex-col justify-between p-6 fixed inset-y-0 left-0 z-50 rounded-r-[32px] shadow-2xl">
      <div>
        <div className="mb-12 px-2">
          <Image src="/desk.png" alt="RentEase" width={150} height={40} className="brightness-200" />
        </div>
        <nav className="space-y-2">
          {ownerNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${isActive ? "bg-[#0052CC] text-white shadow-lg shadow-blue-500/20 scale-105" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
                <item.icon size={22} style={{ color: isActive ? "#FFFFFF" : item.color }} />
                <span className="font-bold text-sm tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="pt-6 border-t border-white/10">
        <button onClick={openModal} className="w-full flex items-center justify-center gap-3 bg-[#0052CC] text-white p-4 rounded-2xl font-bold text-xs mb-6 hover:bg-[#0041a3] transition-all">
          <PlusCircle size={18} /> Add New Property
        </button>
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-[#0052CC]/20 flex items-center justify-center font-bold text-white border border-white/10 uppercase">{userName.charAt(0)}</div>
          <div><p className="text-sm font-bold text-white">{userName}</p><p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Landlord</p></div>
        </div>
      </div>
    </aside>
  );
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PropertyProvider>
      <LayoutContent>{children}</LayoutContent>
    </PropertyProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { openModal } = useProperty();
  const [user, setUser] = useState({ name: "User" });

  useEffect(() => {
    const fetchUser = async () => {
      const email = localStorage.getItem("userEmail");
      const res = await fetch(`/api/auth/get-user?email=${email}`);
      const data = await res.json();
      if (res.ok) setUser(data.user);
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      <Sidebar userName={user.name} openModal={openModal} pathname={pathname} />
      <main className="flex-1 md:ml-72 min-h-screen">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
      <ModalManager />
    </div>
  );
}