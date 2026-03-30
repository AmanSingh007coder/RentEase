"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, AlertCircle, CheckCircle, ArrowRight, 
  Loader2, Hourglass, Send, RefreshCw, 
  ShieldCheck, User, Phone, Download, DollarSign, 
  Heart, PartyPopper, X, Info
} from "lucide-react";

export default function TenantExitManager() {
  const router = useRouter();
  const [exitData, setExitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ids, setIds] = useState({ propertyId: "", ownerId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form States
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [newProposedDate, setNewProposedDate] = useState("");

  useEffect(() => {
    const initialize = async () => {
      try {
        const tenantId = localStorage.getItem("userId");
        const propRes = await fetch(`/api/properties/get-by-tenant?tenantId=${tenantId}`);
        const propData = await propRes.json();
        if (propRes.ok && propData.property) {
          setIds({ propertyId: propData.property._id, ownerId: propData.property.ownerId });
        }
        fetchStatus();
      } catch (err) { console.error("Initialization failed", err); }
    };
    initialize();
  }, []);

  const fetchStatus = async () => {
    try {
      const tenantId = localStorage.getItem("userId");
      const res = await fetch(`/api/exit/get-status?tenantId=${tenantId}`);
      const data = await res.json();
      if (res.ok) setExitData(data.exit);
    } catch (err) { console.error("Status fetch failed", err); }
    finally { setLoading(false); }
  };

  const handleInitialSubmit = async () => {
    setIsSubmitting(true);
    try {
      const tenantId = localStorage.getItem("userId");
      const res = await fetch("/api/exit/serve-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            tenantId, propertyId: ids.propertyId, ownerId: ids.ownerId,       
            moveOutDate: date, reason 
        })
      });
      if (res.ok) fetchStatus();
    } finally { setIsSubmitting(false); }
  };

  const updateStatus = async (newStatus: string, extraData = {}) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/exit/respond-notice", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exitId: exitData._id, status: newStatus, ...extraData })
      });
      
      if (res.ok) {
        if (newStatus === "archived") {
          // ✅ THROW TO SUMMARY PAGE IMMEDIATELY
          router.push(`/dashboard-tenant/lease-summary/${exitData._id}`);
          return;
        }
        fetchStatus();
      }
    } finally { setIsSubmitting(false); setNewProposedDate(""); }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

// 🕒 TEMPORAL PIPELINE LOGIC
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  const moveOutDate = exitData?.moveOutDate ? new Date(exitData.moveOutDate) : null;
  
  // Calculate the unlock date (Move-out minus 7 days)
  const auditUnlockDate = moveOutDate ? new Date(moveOutDate.getTime() - (7 * 24 * 60 * 60 * 1000)) : null;
  if (auditUnlockDate) auditUnlockDate.setHours(0, 0, 0, 0);

  const canStartAudit = auditUnlockDate ? today >= auditUnlockDate : false;
  
  // Calculate remaining days for the UI
  const diffTime = auditUnlockDate ? auditUnlockDate.getTime() - today.getTime() : 0;
  const daysUntilAudit = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // --- STAGE 0: INITIAL FORM ---
  if (!exitData) {
    return (
      <div className="p-10 max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black text-[#1F2937]">Start Move-Out</h1>
          <p className="text-gray-400 mt-2">Formalize your exit to begin the deposit refund process.</p>
        </header>
        <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm space-y-8">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Desired Move-Out Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Reason</label>
              <textarea placeholder="Brief reason for leaving..." rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-6 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" />
            </div>
            <button onClick={handleInitialSubmit} disabled={!date || isSubmitting} className="w-full py-5 bg-[#1F2937] text-white rounded-[24px] font-bold text-xs flex items-center justify-center gap-3 active:scale-95 transition-all">
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>Serve Exit Notice <Send size={16} /></>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-4xl mx-auto pb-40">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-black text-[#1F2937] tracking-tight">Lease Termination</h1>
        <p className="text-gray-400 mt-2 uppercase text-[10px] font-black tracking-widest">Stage: {exitData.status.replace(/_/g, " ")}</p>
      </header>

      {/* CASE 1: NOTICE SERVED */}
      {exitData.status === "notice_served" && (
        <div className="bg-white border border-gray-100 rounded-[40px] p-12 text-center shadow-sm">
          <Hourglass className="text-blue-500 animate-pulse mx-auto mb-6" size={40} />
          <h2 className="text-2xl font-bold">Waiting for Owner Approval</h2>
          <p className="text-gray-400 text-sm mt-2">Requested Date: <b>{new Date(exitData.moveOutDate).toLocaleDateString()}</b></p>
        </div>
      )}

      {/* CASE 2: RESCHEDULE REQUESTED */}
      {exitData.status === "notice_rescheduled" && (
        <div className="bg-orange-50 border border-orange-100 rounded-[40px] p-10 shadow-sm">
          <div className="flex items-center gap-4 mb-6"><Calendar className="text-orange-500" size={24} /><h2 className="text-xl font-bold text-orange-900">Owner Suggested a New Date</h2></div>
          <p className="text-sm text-orange-700/70 mb-8 font-medium">The owner has proposed: <span className="font-black underline">{new Date(exitData.moveOutDate).toLocaleDateString()}</span></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => updateStatus("notice_accepted", { finalDate: exitData.moveOutDate })} className="py-5 bg-emerald-500 text-white rounded-[24px] font-bold text-xs shadow-lg transition-all">Accept Suggested Date</button>
            <div className="bg-white rounded-[24px] border border-orange-200 flex items-center px-4">
               <span className="text-[10px] font-bold text-orange-400 uppercase mr-3">Suggest:</span>
               <input type="date" onChange={(e) => setNewProposedDate(e.target.value)} className="bg-transparent text-xs font-bold outline-none flex-1 py-4" />
            </div>
          </div>
          <AnimatePresence>
            {newProposedDate && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => updateStatus("notice_served", { moveOutDate: newProposedDate })} className="w-full mt-4 py-4 bg-[#1F2937] text-white rounded-2xl font-bold text-[10px] flex items-center justify-center gap-2">
                <RefreshCw size={14} className={isSubmitting ? "animate-spin" : ""} /> Send Counter Offer
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

{/* CASE 3: NOTICE ACCEPTED (The Pipeline Lock) */}
  {exitData.status === "notice_accepted" && (
    <div className="bg-white border border-gray-100 rounded-[40px] p-12 text-center shadow-sm">
      <CheckCircle className="text-emerald-500 mx-auto mb-6" size={40} />
      <h2 className="text-2xl font-bold text-[#1F2937]">Move-Out Scheduled</h2>
      <p className="text-gray-400 text-sm mt-2 mb-10 italic">
        Final Date Confirmed: <b className="text-black">{moveOutDate?.toLocaleDateString()}</b>
      </p>

      {canStartAudit ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <p className="text-blue-600 text-xs font-black uppercase tracking-widest mb-6">Audit Pipeline Active</p>
          <button 
            onClick={() => router.push("/dashboard-tenant/exit/gallery")} 
            className="px-10 py-6 bg-blue-600 text-white rounded-[32px] font-bold text-xs flex items-center gap-3 mx-auto shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
          >
            Start Digital Condition Audit <ArrowRight size={18} />
          </button>
        </motion.div>
      ) : (
        <div className="p-10 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100 max-w-sm mx-auto">
          <ShieldCheck className="mx-auto mb-4 text-gray-300" size={32} />
          <p className="text-gray-800 uppercase text-xs font-black tracking-widest">Audit Protocol Locked</p>
          <p className="text-sm font-bold text-gray-400 mt-2">
            The Digital Witness opens <span className="text-blue-600">7 days</span> before exit. 
            <br/> Come back in <span className="text-black font-black">{daysUntilAudit} days</span>.
          </p>
        </div>
      )}
    </div>
  )}

      {/* CASE 4: PHOTOS SUBMITTED */}
      {exitData.status === "photos_submitted" && (
        <div className="bg-white border border-gray-100 rounded-[40px] p-12 text-center shadow-sm">
          <ShieldCheck className="text-blue-600 mx-auto mb-6" size={40} />
          <h2 className="text-2xl font-bold">Audit Under Review</h2>
          <p className="text-gray-400 text-sm mt-2">The owner is currently performing the digital comparison of your photos.</p>
        </div>
      )}

      {/* CASE 5: PHYSICAL INSPECTION REQUIRED */}
      {exitData.status === "physical_inspection_required" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600"><User size={24} /></div>
            <div className="text-left"><h2 className="text-xl font-bold">Physical Walkthrough Required</h2><p className="text-gray-400 text-xs">A manual visit has been scheduled by the owner.</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-gray-50 rounded-3xl text-left"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Inspector</span><p className="text-sm font-bold">{exitData.inspectorName}</p><p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Phone size={12}/> {exitData.inspectorContact}</p></div>
            <div className="p-6 bg-gray-50 rounded-3xl text-left"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Time Slot</span><p className="text-sm font-bold">{new Date(exitData.inspectionDate).toLocaleString()}</p></div>
          </div>
          <button onClick={() => updateStatus("physical_inspection_done")} className="w-full py-6 bg-emerald-500 text-white rounded-[32px] font-bold text-xs shadow-xl hover:bg-emerald-600 active:scale-95 transition-all">I Have Completed the Inspection</button>
        </motion.div>
      )}

      {/* CASE 6: FINALIZING SETTLEMENT */}
      {exitData.status === "physical_inspection_done" && (
        <div className="bg-white border border-gray-100 rounded-[40px] p-12 text-center shadow-sm">
          <Hourglass className="text-blue-500 animate-pulse mx-auto mb-6" size={40} />
          <h2 className="text-2xl font-bold">Finalizing Settlement</h2>
          <p className="text-gray-400 text-sm mt-2">The owner is finalizing the deductions after the physical walkthrough.</p>
        </div>
      )}

{/* CASE 7: SETTLED - THE FINAL HANDSHAKE */}
      {exitData.status === "settled" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1F2937] text-white rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
          <header className="flex justify-between items-start mb-12 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-2"><DollarSign size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Refund Issued</span></div>
              <h2 className="text-4xl font-black tracking-tighter">₹{exitData.finalRefundAmount.toLocaleString()}</h2>
            </div>
          </header>
          
          <div className="bg-white/5 rounded-[32px] p-8 mb-10 border border-white/5">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Settlement Summary</h4>
             <div className="space-y-4">
                {exitData.deductions?.length > 0 ? (
                  exitData.deductions.map((d: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-gray-300">{d.item}</span><span className="text-red-400 font-bold">- ₹{d.amount}</span>
                    </div>
                  ))
                ) : ( <p className="text-xs text-emerald-400 font-bold text-center">Full Refund Approved! No deductions.</p> )}
             </div>
          </div>

          <button 
            disabled={isSubmitting}
            onClick={() => updateStatus("archived", { isTenantSatisfied: true })}
            className="w-full py-6 bg-emerald-500 rounded-[32px] font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-3"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <>I am Satisfied with this Settlement <Heart size={16} /></>}
          </button>
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
        </motion.div>
      )}
    </div>
  );
}