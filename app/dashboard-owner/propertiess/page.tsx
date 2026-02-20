"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
// ✅ Correctly split imports
import { motion, AnimatePresence } from "framer-motion"; 
import { 
  Trash2, Edit3, Building2, IndianRupee, Eye, Search, 
  MoreVertical, MapPin, Clock, Plus, User, Mail 
} from "lucide-react";
import { useProperty } from "../../context/PropertyContext";

export default function PropertiesList() {
  const { openModal } = useProperty();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch(`/api/properties/get?ownerId=${userId}`);
      const data = await res.json();
      if (res.ok) setProperties(data.properties);
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((prop: any) => 
    prop.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure? This will permanently delete this property and all linked evidence.")) {
      try {
        const res = await fetch(`/api/properties/delete?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          setProperties(properties.filter((p: any) => p._id !== id));
        }
      } catch (err) { alert("Delete failed"); }
    }
  };

  return (
    <div className="p-4 md:p-10 lg:p-12">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#1F2937] tracking-tight">Your Properties</h1>
          <p className="text-gray-400 font-medium mt-2">
            {loading ? "Syncing with Vault..." : `Manage all ${properties.length} assets in your portfolio.`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" 
              placeholder="Search address..." 
              className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#0052CC] transition-all w-64 shadow-sm"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={openModal}
            className="px-6 py-3 bg-[#0052CC] text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-2"
          >
            <Plus size={16} /> Add New
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => <div key={n} className="h-80 bg-white rounded-[32px] border border-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((prop: any, i: number) => (
            <motion.div 
              key={prop._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group flex flex-col"
            >
              <div className="p-6 pb-0 flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    prop.status === 'vacant' ? 'bg-[#F59E0B]' : 
                    prop.status === 'under_notice' ? 'bg-red-500 animate-pulse' : 'bg-[#10B981]'
                  }`} />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {prop.status.replace("_", " ")}
                  </span>
                </div>
                <span className="px-3 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-full border border-gray-100 uppercase">
                  {prop.inviteCode}
                </span>
              </div>

              <div className="p-6 pt-4 flex-1">
                <h3 className="text-xl font-bold text-[#1F2937] mb-6 line-clamp-1">{prop.address}</h3>
                
                {/* ACTIVE RESIDENT CARD */}
                <div className="mb-8">
                  {prop.tenantId ? (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm"><User size={14} /></div>
                        <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Resident</p>
                          <p className="text-sm font-bold text-emerald-900">{prop.tenantId.name}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-emerald-700/60 font-medium flex items-center gap-1.5 ml-11"><Mail size={10} /> {prop.tenantId.email}</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Unit Vacant</p>
                      <p className="text-[9px] text-gray-300 font-medium text-center italic mt-1 uppercase tracking-tighter">Waiting for link</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                   <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Monthly Rent</p>
                      <p className="text-sm font-black text-gray-800">₹{prop.rentAmount?.toLocaleString()}</p>
                   </div>
                   <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Security Deposit</p>
                      <p className="text-sm font-black text-gray-800">₹{prop.depositAmount?.toLocaleString()}</p>
                   </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex gap-3 mt-auto relative">
                <button 
                  onClick={() => router.push(`/dashboard-owner/propertiess/${prop._id}`)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#1F2937] text-white rounded-2xl text-xs font-bold hover:bg-black transition-all"
                >
                  <Eye size={16} /> Asset Details
                </button>
                
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === prop._id ? null : prop._id);
                    }}
                    className={`p-4 border rounded-2xl transition-all ${activeMenu === prop._id ? 'bg-[#1F2937] text-white border-[#1F2937]' : 'bg-white text-gray-400 border-gray-100'}`}
                  >
                    <MoreVertical size={18} />
                  </button>
                  
                  <AnimatePresence>
                    {activeMenu === prop._id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-full right-0 mb-4 w-48 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 z-20 overflow-hidden">
                          <button onClick={() => { openModal(prop); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"><Edit3 size={14} className="text-[#0052CC]" /> Edit Asset</button>
                          <button onClick={() => { handleDelete(prop._id); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-6 py-4 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /> Remove asset</button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}