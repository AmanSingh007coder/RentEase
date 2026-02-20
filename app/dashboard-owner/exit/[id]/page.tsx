"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, AlertTriangle, Loader2, ShieldCheck, 
  X, Calendar, User, Phone, ArrowRight, DollarSign, ImageOff 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OwnerExitReview({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const exitId = resolvedParams.id;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [showPhysicalForm, setShowPhysicalForm] = useState(false);
  const [form, setForm] = useState({ inspectionDate: "", inspectorName: "", inspectorContact: "" });

  useEffect(() => {
    const loadComparison = async () => {
      try {
        const res = await fetch(`/api/exit/get-comparison?exitId=${exitId}`);
        const result = await res.json();
        if (res.ok) setData(result);
      } catch (err) { console.error("Data load failed", err); }
      finally { setLoading(false); }
    };
    loadComparison();
  }, [exitId]);

  const handleDecision = async (status: string) => {
    if (status === "physical_inspection_required") {
      if (!form.inspectionDate || !form.inspectorName || !form.inspectorContact) {
        alert("Please provide all inspection details.");
        return;
      }
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/exit/submit-decision", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exitId, status, ...form })
      });
      if (res.ok) window.location.href = "/dashboard-owner/exit";
    } finally { setIsProcessing(false); }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Condition Evidence</p>
    </div>
  );

  const isPastMoveOut = new Date() >= new Date(data?.exit?.moveOutDate);

  return (
    <div className="p-10 max-w-7xl mx-auto pb-40">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <ShieldCheck size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Audit Mode</span>
          </div>
          <h1 className="text-4xl font-black text-[#1F2937] tracking-tight">Condition Review</h1>
          <p className="text-gray-400 mt-2 font-medium italic">Verify proof against original move-in baseline.</p>
        </div>

        <div className="flex gap-4">
          {data?.exit?.status === "photos_submitted" ? (
            <>
              <button onClick={() => setShowPhysicalForm(true)} className="px-8 py-5 bg-orange-50 text-orange-600 rounded-[24px] font-bold text-xs flex items-center gap-3 border border-orange-100 hover:bg-orange-100 transition-all shadow-sm">
                <AlertTriangle size={18} /> Flag for Physical Audit
              </button>
              <button onClick={() => handleDecision("inspection_completed")} className="px-8 py-5 bg-[#1F2937] text-white rounded-[24px] font-bold text-xs flex items-center gap-3 shadow-xl hover:bg-black transition-all">
                <CheckCircle size={18} /> Approve Condition
              </button>
            </>
          ) : data?.exit?.status === "physical_inspection_done" ? (
            <button 
              disabled={!isPastMoveOut}
              onClick={() => window.location.href = `/dashboard-owner/exit/${exitId}/settlement`}
              className={`px-8 py-5 rounded-[24px] font-bold text-xs flex items-center gap-3 shadow-xl transition-all ${
                isPastMoveOut ? "bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600" : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              }`}
            >
              <DollarSign size={18} /> 
              {isPastMoveOut ? "Finalize Settlement" : `Unlock on ${new Date(data.exit.moveOutDate).toLocaleDateString()}`}
            </button>
          ) : (
            <div className="px-6 py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100">
              Stage: {data?.exit?.status.replace(/_/g, " ")}
            </div>
          )}
        </div>
      </header>

      {/* --- COMPARISON GRID --- */}
      <div className="space-y-20">
        {data?.comparisonGrid?.map((item: any, idx: number) => (
          <div key={idx} className="group">
            <h3 className="text-sm font-black text-gray-300 uppercase tracking-[0.2em] mb-8 flex items-center gap-6">
              {item.area} <div className="h-[1px] flex-1 bg-gray-100" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Baseline Side */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Original (Move-In)</p>
                {item.baselineUrl ? (
                  <img src={item.baselineUrl} className="rounded-[48px] grayscale opacity-50 h-[450px] w-full object-cover border border-gray-100 transition-all group-hover:grayscale-0 group-hover:opacity-100" alt="Baseline" />
                ) : (
                  <div className="h-[450px] w-full bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
                    <ImageOff size={48} className="mb-4" />
                    <p className="font-bold text-[9px] uppercase tracking-widest">No Baseline Proof Found</p>
                  </div>
                )}
              </div>
              
              {/* Tenant Proof Side */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Proof (Aman's Webcam)</p>
                {item.proofUrl ? (
                  <img src={item.proofUrl} className="rounded-[48px] border-4 border-blue-50 h-[450px] w-full object-cover shadow-2xl" alt="Proof" />
                ) : (
                  <div className="h-[450px] w-full bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
                    <ImageOff size={48} className="mb-4" />
                    <p className="font-bold text-[9px] uppercase tracking-widest">No Exit Proof Submitted</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PHYSICAL AUDIT MODAL */}
      <AnimatePresence>
        {showPhysicalForm && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[48px] p-10 max-w-lg w-full shadow-2xl relative border border-white/20">
              <button onClick={() => setShowPhysicalForm(false)} className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"><X size={24} /></button>
              <h2 className="text-2xl font-black mb-2 tracking-tight">Schedule Physical Audit</h2>
              <div className="space-y-6 mt-8">
                <div className="text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Scheduled Date</label>
                  <input type="datetime-local" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold" onChange={(e) => setForm({...form, inspectionDate: e.target.value})} />
                </div>
                <div className="text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Inspector Name</label>
                  <input placeholder="Name" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold" onChange={(e) => setForm({...form, inspectorName: e.target.value})} />
                </div>
                <div className="text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Contact</label>
                  <input placeholder="Phone" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold" onChange={(e) => setForm({...form, inspectorContact: e.target.value})} />
                </div>
                <button onClick={() => handleDecision("physical_inspection_required")} className="w-full py-6 bg-orange-500 text-white rounded-[32px] font-black text-xs uppercase shadow-xl hover:bg-orange-600 transition-all">Send Inspection Notice</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}