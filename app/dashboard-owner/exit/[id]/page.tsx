"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, AlertTriangle, Loader2, ShieldCheck, 
  X, Calendar, User, Phone, ArrowRight, DollarSign, ImageOff, Camera 
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

  // ✅ DATE SCORE LOGIC
  const getDateScore = (dateInput: any) => {
    if (!dateInput) return 0;
    const d = new Date(dateInput);
    return (d.getFullYear() * 10000) + ((d.getMonth() + 1) * 100) + d.getDate();
  };

  const todayScore = getDateScore(new Date());
  const moveOutScore = data?.exit?.moveOutDate ? getDateScore(data.exit.moveOutDate) : 99999999;
  const isPastMoveOut = todayScore >= moveOutScore;

  const handleDecision = async (status: string) => {
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

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-10 max-w-7xl mx-auto pb-40">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <ShieldCheck size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Audit Mode</span>
          </div>
          <h1 className="text-4xl font-black text-[#1F2937] tracking-tight">Condition Review</h1>
          <p className="text-gray-400 mt-2 font-medium italic">Final comparison before financial settlement.</p>
        </div>

        <div className="flex gap-4">
          {/* ✅ CONDITION 1: Photos just submitted, need approval or physical flag */}
          {data?.exit?.status === "photos_submitted" ? (
            <>
              <button onClick={() => setShowPhysicalForm(true)} className="px-8 py-5 bg-orange-50 text-orange-600 rounded-[24px] font-bold text-xs flex items-center gap-3 border border-orange-100 shadow-sm">
                <AlertTriangle size={18} /> Flag for Physical Audit
              </button>
              <button onClick={() => handleDecision("inspection_completed")} className="px-8 py-5 bg-[#1F2937] text-white rounded-[24px] font-bold text-xs flex items-center gap-3 shadow-xl hover:bg-black transition-all">
                <CheckCircle size={18} /> Approve Condition
              </button>
            </>
          ) : 
          /* ✅ CONDITION 2: Condition is approved (either via web or physical), show Settlement button */
          ["physical_inspection_done", "inspection_completed", "disputed"].includes(data?.exit?.status) ? (
            <button 
              disabled={!isPastMoveOut}
              onClick={() => window.location.href = `/dashboard-owner/exit/${exitId}/settlement`}
              className={`px-8 py-5 rounded-[24px] font-bold text-xs flex items-center gap-3 shadow-xl transition-all ${
                isPastMoveOut ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-gray-100 text-gray-400 cursor-not-allowed border"
              }`}
            >
              <DollarSign size={18} /> 
              {isPastMoveOut ? "Finalize Settlement" : `Unlocks on ${new Date(data.exit.moveOutDate).toLocaleDateString()}`}
            </button>
          ) : (
            /* FALLBACK: Show current stage */
            <div className="px-6 py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100">
              Stage: {data?.exit?.status.replace(/_/g, " ")}
            </div>
          )}
        </div>
      </header>

      {/* --- RECONCILIATION GRID --- */}
      <div className="space-y-24">
        {data?.comparisonGrid?.map((item: any, idx: number) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group">
            <div className="flex items-center gap-6 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-gray-300 text-sm border border-gray-100">0{idx + 1}</div>
                <h3 className="text-sm font-black text-[#1F2937] uppercase tracking-[0.2em]">{item.area} Comparison</h3>
                <div className="h-[1px] flex-1 bg-gray-100" />
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                    <CheckCircle size={12} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Matched Slot</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">Original Move-In State</p>
                <div className="relative rounded-[56px] overflow-hidden border border-gray-100 shadow-sm bg-gray-50 aspect-video">
                  {item.baselineUrl ? (
                    <img src={item.baselineUrl} className="grayscale opacity-60 h-full w-full object-cover transition-all group-hover:grayscale-0 group-hover:opacity-100" alt="Baseline" />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-gray-300"><ImageOff size={48} /><p className="mt-2 text-[9px] uppercase">Missing</p></div>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest px-4">Current Exit Proof</p>
                <div className="relative rounded-[56px] overflow-hidden border-4 border-white shadow-2xl bg-gray-900 aspect-video">
                  {item.proofUrl ? (
                    <img src={item.proofUrl} className="h-full w-full object-cover" alt="Proof" />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-blue-300"><Loader2 size={48} className="animate-spin" /><p className="mt-2 text-[9px] uppercase">Awaiting Capture</p></div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showPhysicalForm && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[48px] p-12 max-w-lg w-full shadow-2xl relative">
              <button onClick={() => setShowPhysicalForm(false)} className="absolute top-8 right-8 text-gray-400 hover:text-black"><X size={24} /></button>
              <h2 className="text-3xl font-black mb-10 tracking-tight">Physical Audit</h2>
              <div className="space-y-6">
                <input type="datetime-local" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" onChange={(e) => setForm({...form, inspectionDate: e.target.value})} />
                <input placeholder="Inspector Name" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" onChange={(e) => setForm({...form, inspectorName: e.target.value})} />
                <input placeholder="Contact Number" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" onChange={(e) => setForm({...form, inspectorContact: e.target.value})} />
                <button onClick={() => handleDecision("physical_inspection_required")} className="w-full py-6 bg-orange-500 text-white rounded-[32px] font-black text-xs uppercase">Issue Notice</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}