"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  MapPin, IndianRupee, ShieldCheck, ArrowLeft, 
  Copy, Check, Share2, Building2, Calendar, User, Mail, History, UserX 
} from "lucide-react";

export default function PropertyDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/properties/get-single?id=${id}`);
        const data = await res.json();
        // API must use .populate("tenantId")
        if (res.ok) setProperty(data.property);
      } catch (err) { console.error("Fetch error:", err); }
    };
    fetchDetails();
  }, [id]);

  const copyCode = () => {
    navigator.clipboard.writeText(property.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const message = `Hey! Use code *${property.inviteCode}* to join the property at *${property.address}* on RentEase.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (!property) return <div className="h-screen flex items-center justify-center font-black uppercase text-[10px] tracking-widest text-gray-300">Accessing Vault...</div>;

  return (
    <div className="p-6 md:p-12 lg:p-16 max-w-7xl mx-auto">
      <button onClick={() => router.push("/dashboard-owner/propertiess")} className="group flex items-center gap-2 text-gray-400 hover:text-[#1F2937] mb-12 font-bold text-xs uppercase tracking-widest transition-all">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Portfolio
      </button>

      <div className="grid lg:grid-cols-12 gap-16">
        {/* LEFT COLUMN: ACTIVE INFO */}
        <div className="lg:col-span-5 space-y-12">
          <header>
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                property.status === 'vacant' ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-600'
              }`}>{property.status.replace("_", " ")}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Calendar size={12} /> Managed Since {new Date(property.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#1F2937] leading-[1.1] tracking-tight">{property.address}</h1>
          </header>

          {/* SIDEBAR CARD: RESIDENT VS INVITE */}
          {property.tenantId ? (
             <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[48px] relative overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-emerald-500 shadow-sm"><User size={28}/></div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Current Occupant</p>
                        <h3 className="text-2xl font-black text-emerald-900">{property.tenantId.name}</h3>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-medium text-emerald-800/60"><Mail size={16}/> {property.tenantId.email}</div>
                    <div className="flex items-center gap-3 text-sm font-medium text-emerald-800/60"><IndianRupee size={16}/> ₹{property.rentAmount.toLocaleString()}/mo</div>
                </div>
                <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-emerald-200/40 blur-[50px] rounded-full" />
             </div>
          ) : (
            <div className="bg-[#1F2937] p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                <h3 className="text-xl font-bold mb-2">Find Next Tenant</h3>
                <p className="text-gray-400 text-sm mb-10 leading-relaxed">This property is ready for occupancy. Provide this code to the new resident.</p>
                <div className="flex items-center justify-between bg-white/5 p-6 rounded-3xl border border-white/10 mb-8 font-mono font-black tracking-[0.3em] text-3xl uppercase text-center">{property.inviteCode} <button onClick={copyCode}>{copied ? <Check className="text-emerald-400"/> : <Copy className="text-gray-500"/>}</button></div>
                <button onClick={shareToWhatsApp} className="w-full py-5 bg-[#0052CC] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 active:scale-95 transition-all"><Share2 size={18} /> Send WhatsApp Invite</button>
            </div>
          )}

          {/* ✅ OCCUPANCY HISTORY SECTION */}
          <section className="space-y-6 pt-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                <History size={14}/> Residency History
            </h4>
            {property.pastTenants?.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {property.pastTenants.map((past: any, idx: number) => (
                        <div key={idx} className="bg-white border border-gray-50 p-6 rounded-[32px] flex justify-between items-center opacity-60 hover:opacity-100 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400"><UserX size={20}/></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-700">{past.name}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">{past.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Moved Out</p>
                                <p className="text-xs font-bold text-gray-400">{new Date(past.movedOutAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-8 border-2 border-dashed border-gray-50 rounded-[40px] text-center">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No Previous Tenants recorded</p>
                </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: GALLERY */}
        <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-8 px-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Baseline Evidence</h4>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full">{property.images?.length || 0} Photos Locked</span>
            </div>
            <div className="grid grid-cols-2 gap-6">
                {property.images?.map((img: any, i: number) => (
                    <div key={i} className="relative aspect-[4/3] rounded-[48px] overflow-hidden border border-gray-100 shadow-md group">
                        <img src={img.url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Digital Baseline Proof</p>
                            <p className="text-[9px] text-white/60 uppercase font-bold tracking-tighter">Timestamp: {new Date(img.timestamp).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}