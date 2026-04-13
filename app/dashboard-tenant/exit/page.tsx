"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, AlertCircle, CheckCircle, ArrowRight, 
  Loader2, Hourglass, Send, RefreshCw, 
  ShieldCheck, User, Phone, Download, DollarSign, 
  Heart, PartyPopper, X, Info, MessageSquareWarning
} from "lucide-react";

export default function TenantExitManager() {
  const router = useRouter();
  const [exitData, setExitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ids, setIds] = useState({ propertyId: "", ownerId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [newProposedDate, setNewProposedDate] = useState("");

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const tenantId = localStorage.getItem("userId");
      const propRes = await fetch(`/api/properties/get-by-tenant?tenantId=${tenantId}`);
      const propData = await propRes.json();
      if (propRes.ok && propData.property) {
        setIds({ propertyId: propData.property._id, ownerId: propData.property.ownerId });
      }
      fetchStatus();
    } catch (err) { console.error(err); }
  };

  const fetchStatus = async () => {
    try {
      const tenantId = localStorage.getItem("userId");
      const res = await fetch(`/api/exit/get-status?tenantId=${tenantId}`);
      const data = await res.json();
      if (res.ok) setExitData(data.exit);
    } finally { setLoading(false); }
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
          router.push(`/dashboard-tenant/lease-summary/${exitData._id}`);
          return;
        }
        fetchStatus();
      }
    } finally { setIsSubmitting(false); setShowDisputeModal(false); }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const moveOutDate = exitData?.moveOutDate ? new Date(exitData.moveOutDate) : null;
  const auditUnlockDate = moveOutDate ? new Date(moveOutDate.getTime() - (7 * 24 * 60 * 60 * 1000)) : null;
  const canStartAudit = auditUnlockDate ? today >= auditUnlockDate : false;

  if (!exitData) return <div className="p-10 text-center">No active exit process.</div>;

  return (
    <div className="p-10 max-w-4xl mx-auto pb-40">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-black text-[#1F2937] tracking-tight">Lease Termination</h1>
        <p className="text-gray-400 mt-2 uppercase text-[10px] font-black tracking-widest">Stage: {exitData.status.replace(/_/g, " ")}</p>
      </header>

      {/* RENDER BASED ON STATUS */}
      {exitData.status === "notice_served" && (
        <div className="bg-white border border-gray-100 rounded-[40px] p-12 text-center shadow-sm">
          <Hourglass className="text-blue-500 animate-pulse mx-auto mb-6" size={40} />
          <h2 className="text-2xl font-bold text-[#1F2937]">Waiting for Owner Approval</h2>
          <p className="text-gray-400 text-sm mt-2">Requested Date: <b>{new Date(exitData.moveOutDate).toLocaleDateString()}</b></p>
        </div>
      )}

      {exitData.status === "notice_accepted" && (
        <div className="bg-white border border-gray-100 rounded-[40px] p-12 text-center shadow-sm">
          <CheckCircle className="text-emerald-500 mx-auto mb-6" size={40} />
          <h2 className="text-2xl font-bold text-[#1F2937]">Move-Out Scheduled</h2>
          <p className="text-gray-400 text-sm mt-2 mb-10">Confirmed for <b>{moveOutDate?.toLocaleDateString()}</b></p>
          {canStartAudit ? (
            <button onClick={() => router.push("/dashboard-tenant/exit/gallery")} className="px-10 py-6 bg-blue-600 text-white rounded-[32px] font-bold text-xs flex items-center gap-3 mx-auto shadow-xl">Start Digital Condition Audit <ArrowRight size={18} /></button>
          ) : (
            <div className="p-10 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100 max-w-sm mx-auto">
              <ShieldCheck className="mx-auto mb-4 text-gray-300" size={32} />
              <p className="text-gray-800 uppercase text-xs font-black">Audit Protocol Locked</p>
            </div>
          )}
        </div>
      )}

      {exitData.status === "photos_submitted" && (
        <div className="bg-white border border-gray-100 rounded-[40px] p-12 text-center shadow-sm">
          <ShieldCheck className="text-blue-600 mx-auto mb-6" size={40} />
          <h2 className="text-2xl font-bold">Audit Under Review</h2>
          <p className="text-gray-400 text-sm mt-2">The owner is currently performing the digital comparison of your photos.</p>
        </div>
      )}

      {/* ✅ NEW BRIDGE STATE: INSPECTION COMPLETED */}
      {exitData.status === "inspection_completed" && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-[40px] p-12 text-center shadow-sm">
          <CheckCircle className="text-emerald-600 mx-auto mb-6" size={40} />
          <h2 className="text-2xl font-bold text-emerald-900">Condition Approved!</h2>
          <p className="text-emerald-700/70 text-sm mt-2">The owner has verified your condition audit. They are now calculating the final settlement amount.</p>
        </div>
      )}

      {exitData.status === "settled" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1F2937] text-white rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-400 mb-2"><DollarSign size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Refund Calculated</span></div>
            <h2 className="text-4xl font-black tracking-tighter">₹{exitData.finalRefundAmount.toLocaleString()}</h2>
            
            <div className="bg-white/5 rounded-[32px] p-8 my-10 border border-white/5">
               <h4 className="text-[10px] font-black text-gray-400 uppercase mb-6">Adjustment Summary</h4>
               <div className="space-y-4">
                  {exitData.deductions?.map((d: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-gray-300">{d.item}</span><span className="text-red-400 font-bold">- ₹{d.amount}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex flex-col gap-4">
              <button onClick={() => updateStatus("archived", { isTenantSatisfied: true })} className="w-full py-6 bg-emerald-500 rounded-[32px] font-black uppercase text-xs shadow-xl flex items-center justify-center gap-3">I am Satisfied with this Settlement <Heart size={16} /></button>
              <button onClick={() => setShowDisputeModal(true)} className="w-full py-4 text-gray-400 hover:text-red-400 text-xs font-bold uppercase transition-colors">I Disagree with these Deductions</button>
            </div>
          </div>
        </motion.div>
      )}

      {exitData.status === "disputed" && (
        <div className="bg-white border border-red-100 rounded-[40px] p-12 text-center shadow-sm">
          <AlertCircle className="text-red-500 mx-auto mb-6" size={40} />
          <h2 className="text-2xl font-bold">Settlement Disputed</h2>
          <p className="text-gray-400 text-sm mt-2">The owner has been notified of your disagreement.</p>
          <div className="mt-8 p-6 bg-gray-50 rounded-2xl text-left border italic text-gray-500 text-sm">" {exitData.tenantDisputeComment} "</div>
        </div>
      )}

      {/* DISPUTE MODAL */}
      <AnimatePresence>
        {showDisputeModal && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl">
               <h2 className="text-2xl font-black mb-4 flex items-center gap-3"><MessageSquareWarning className="text-red-500"/> Raise Dispute</h2>
               <textarea rows={5} placeholder="Explain why you find these deductions unfair..." className="w-full p-6 bg-gray-50 border rounded-3xl text-sm mb-8 outline-none focus:border-red-400" onChange={(e) => setDisputeReason(e.target.value)} />
               <div className="flex gap-4">
                  <button onClick={() => setShowDisputeModal(false)} className="flex-1 font-bold text-gray-400">Cancel</button>
                  <button onClick={() => updateStatus("disputed", { tenantDisputeComment: disputeReason })} className="flex-[2] py-5 bg-red-500 text-white rounded-3xl font-bold text-xs uppercase tracking-widest shadow-xl">Submit Dispute</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}