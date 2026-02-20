"use client";

import React, { useState, useEffect } from "react";
import { 
  Calculator, Plus, Trash2, ArrowRight, 
  Loader2, DollarSign, ChevronLeft, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FinalSettlement({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const exitId = resolvedParams.id;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  
  const [deductions, setDeductions] = useState([{ item: "", amount: 0 }]);
  const [deposit, setDeposit] = useState(0); 

  useEffect(() => {
    const fetchSettlementData = async () => {
      try {
        const res = await fetch(`/api/exit/get-comparison?exitId=${exitId}`);
        const result = await res.json();
        
        if (res.ok && result.property) {
          setData(result);
          // ✅ FIX: Mapping to 'depositAmount' based on your PropertySchema
          setDeposit(result.property.depositAmount || 0); 
        }
      } catch (err) {
        console.error("Failed to load settlement details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettlementData();
  }, [exitId]);

  // Dynamic Calculation
  const totalDeductions = deductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const finalRefund = deposit - totalDeductions;

  const addDeduction = () => setDeductions([...deductions, { item: "", amount: 0 }]);
  
  const removeDeduction = (index: number) => {
    const updated = deductions.filter((_, i) => i !== index);
    setDeductions(updated.length ? updated : [{ item: "", amount: 0 }]);
  };

  const updateDeduction = (index: number, field: string, value: any) => {
    const updated = [...deductions];
    updated[index] = { ...updated[index], [field]: value };
    setDeductions(updated);
  };

  const handleFinalize = async () => {
    if (finalRefund < 0) {
      alert("Error: Deductions exceed total deposit amount.");
      return;
    }

    setIsPaying(true);
    
    // Simulate Banking Handshake Delay
    setTimeout(async () => {
      try {
        const res = await fetch("/api/exit/finalize-settlement", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            exitId, 
            deductions: deductions.filter(d => d.item !== ""), 
            finalRefundAmount: finalRefund 
          })
        });
        
        if (res.ok) {
          // This marks the financial end. Tenant must now click 'Satisfied' to archive.
          window.location.href = "/dashboard-owner/exit";
        }
      } catch (err) {
        setIsPaying(false);
      }
    }, 3500);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-10 max-w-5xl mx-auto relative min-h-screen pb-60">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-400 hover:text-black mb-4 transition-colors font-bold text-xs uppercase tracking-widest"><ChevronLeft size={16} /> Back</button>
          <h1 className="text-4xl font-black text-[#1F2937] tracking-tight">Final Settlement</h1>
          <p className="text-gray-400 mt-2 font-medium">Closing ledger for property at <span className="text-black font-bold">{data?.property?.address}</span>.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="text-emerald-500" size={20} />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Rent: Fully Paid</span>
        </div>
      </header>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="p-10 bg-gray-50 rounded-[48px] border border-gray-100 flex flex-col items-center justify-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Original Deposit</p>
          <h2 className="text-4xl font-black text-gray-800">₹{deposit.toLocaleString()}</h2>
        </div>
        <div className={`p-10 rounded-[48px] border flex flex-col items-center justify-center transition-all ${totalDeductions > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${totalDeductions > 0 ? 'text-red-400' : 'text-gray-400'}`}>Adjustment Sum</p>
          <h2 className={`text-4xl font-black ${totalDeductions > 0 ? 'text-red-600' : 'text-gray-300'}`}>- ₹{totalDeductions.toLocaleString()}</h2>
        </div>
      </div>

      {/* DEDUCTION BUILDER */}
      <div className="bg-white border border-gray-100 rounded-[56px] p-12 shadow-sm space-y-10">
        <div className="flex justify-between items-center px-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Line-Item Adjustments</h3>
          <button onClick={addDeduction} className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-lg"><Plus size={20} /></button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {deductions.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="flex gap-4 items-center">
                <input 
                  placeholder="Reason (e.g. Wall Repainting)" 
                  className="flex-1 p-6 bg-gray-50 border border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-100 outline-none transition-all"
                  value={d.item}
                  onChange={(e) => updateDeduction(i, "item", e.target.value)}
                />
                <div className="relative w-48">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-bold">₹</span>
                  <input 
                    type="number" 
                    className="w-full pl-12 pr-6 py-6 bg-gray-50 border border-transparent rounded-[24px] text-sm font-black focus:bg-white focus:border-blue-100 outline-none"
                    value={d.amount}
                    onChange={(e) => updateDeduction(i, "amount", e.target.value)}
                  />
                </div>
                <button onClick={() => removeDeduction(i)} className="p-6 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* FINAL REFUND ACTION */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-xl px-10 z-50">
        <button 
          onClick={handleFinalize}
          disabled={isPaying || finalRefund < 0}
          className="w-full py-8 bg-[#1F2937] text-white rounded-[32px] font-black text-sm shadow-2xl flex items-center justify-center gap-4 hover:bg-black transition-all active:scale-95 disabled:opacity-20"
        >
          {isPaying ? <Loader2 className="animate-spin" /> : <>Complete Refund: ₹{finalRefund.toLocaleString()} <ArrowRight /></>}
        </button>
      </div>

      {/* 💳 OVERLAY */}
      <AnimatePresence>
        {isPaying && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-[#1F2937] flex flex-col items-center justify-center text-white p-12 text-center">
            <div className="relative mb-12">
                <div className="w-32 h-32 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <Calculator className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" size={32} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter mb-4">Banking System Handshake</h2>
            <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">Processing transfer of <span className="text-white font-bold">₹{finalRefund.toLocaleString()}</span> to the tenant's linked account.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}