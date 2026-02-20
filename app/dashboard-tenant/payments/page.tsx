"use client";

import { useState, useEffect } from "react";
import { 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Home, 
  Download, 
  FileText 
} from "lucide-react";
import { generateReceipt } from "@/lib/generateReceipt";

export default function TenantLedger() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("Session expired. Please log in again.");
        return;
      }
      const res = await fetch(`/api/payments/ledger?userId=${userId}`);
      const d = await res.json();
      if (res.ok && d.property) {
        setData(d);
      } else {
        setError(d.error || "No active lease data found.");
      }
    } catch (err) {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleRentPayment = async (month: string, year: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/verify-rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: localStorage.getItem("userId"),
          month,
          year,
          amount: data.property.rentAmount,
          transactionId: `MOCK_TXN_${Math.random().toString(36).substring(7).toUpperCase()}`
        })
      });

      if (res.ok) {
        await fetchLedger(); 
      } else {
        alert("Payment verification failed.");
      }
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Generating Ledger...</p>
    </div>
  );

  if (error || !data?.property) return (
    <div className="h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mb-6 shadow-inner">
        <Home size={32} />
      </div>
      <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Lease Not Found</h2>
      <p className="text-gray-400 max-w-sm mb-8">No property assigned to your account. Please contact your landlord.</p>
      <button onClick={() => window.location.reload()} className="px-8 py-3 bg-[#1F2937] text-white font-bold rounded-2xl">Retry Sync</button>
    </div>
  );

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
           <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">Verified Tenant</div>
        </div>
        <h1 className="text-4xl font-bold text-[#1F2937] tracking-tight">Monthly Ledger</h1>
        <p className="text-gray-500 font-medium mt-2">
           Tracking rent from {data.property?.leaseStartDate ? new Date(data.property.leaseStartDate).toLocaleDateString() : 'Initial Date'}
        </p>
      </header>

      {/* FINANCIAL OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-[#1F2937] p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
           <div className="relative z-10">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Total Rent Paid</p>
              <h3 className="text-4xl font-black">₹{data.stats?.totalPaid?.toLocaleString() || 0}</h3>
           </div>
           <ShieldCheck size={120} className="absolute -right-8 -bottom-8 text-white/5 opacity-20" />
        </div>
        
        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm flex flex-col justify-center">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Pending Months</p>
           <h3 className="text-4xl font-black text-red-500">{data.stats?.pendingCount || 0} Months</h3>
        </div>
      </div>

      {/* ✅ NEW: ONBOARDING SETTLEMENT CARD */}
      <div className="bg-blue-50 p-8 rounded-[40px] border border-blue-100 flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <FileText size={28} />
          </div>
          <div>
            <p className="font-bold text-[#1F2937] text-lg">Onboarding Settlement</p>
            <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">Security Deposit + January Rent</p>
          </div>
        </div>
        <button 
          onClick={() => generateReceipt(
            { type: 'Deposit + Rent', amount: data.property.depositAmount + data.property.rentAmount, transactionId: 'INITIAL_SETTLEMENT' }, 
            data.property, 
            "Aman Kumar"
          )}
          className="bg-white text-blue-600 border border-blue-200 px-8 py-4 rounded-2xl font-bold text-xs flex items-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
        >
          <Download size={18} /> Download Summary
        </button>
      </div>

      {/* DYNAMIC MONTHLY ROWS */}
      <div className="bg-white rounded-[48px] border border-gray-100 overflow-hidden shadow-sm">
        {data.ledger?.map((item: any, i: number) => (
          <div key={i} className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 last:border-none hover:bg-gray-50/50 transition-colors">
            <div className="text-center md:text-left">
              <h4 className="font-bold text-[#1F2937] text-xl">{item.month} {item.year}</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Due: ₹{item.amount?.toLocaleString()}</p>
            </div>

            {item.status === "Paid" ? (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
                  <CheckCircle2 size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Settled</span>
                </div>
                {/* ✅ INDIVIDUAL MONTH RECEIPT DOWNLOAD */}
                <button 
                  onClick={() => generateReceipt(item, data.property, "Aman Kumar")}
                  className="p-4 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100"
                  title="Download Receipt"
                >
                  <Download size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => handleRentPayment(item.month, item.year)}
                className="bg-[#0052CC] text-white px-10 py-4 rounded-2xl font-bold text-xs flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
              >
                Pay Now <ArrowRight size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}