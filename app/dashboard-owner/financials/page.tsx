"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  CheckCircle2, Bell, Loader2, Filter, Download, 
  Calendar, Home, TrendingUp, ShieldCheck 
} from "lucide-react";
import { generateReceipt } from "@/lib/generateReceipt";

export default function OwnerFinancials() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ FILTER STATES
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const ownerId = localStorage.getItem("userId");
      const res = await fetch(`/api/payments/get-for-owner?ownerId=${ownerId}`);
      const data = await res.json();
      if (res.ok) setPayments(data.payments);
    } catch (err) {
      console.error("Ledger sync failed", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ DYNAMIC FILTER LOGIC: Handles historical data + virtual records
  const filteredPayments = useMemo(() => {
    return payments.filter((pay: any) => {
      const matchesProperty = selectedProperty === "all" || pay.propertyId.address === selectedProperty;
      const matchesMonth = selectedMonth === "all" || pay.month === selectedMonth;
      return matchesProperty && matchesMonth && pay.type === "rent";
    });
  }, [payments, selectedProperty, selectedMonth]);

  // ✅ STATS CALCULATION: Accurate Deposit & Revenue Tracking
  const stats = useMemo(() => {
    const settledRent = payments
      .filter((p: any) => p.type === "rent" && (p.status === "verified" || p.status === "completed"))
      .filter((p: any) => selectedProperty === "all" || p.propertyId.address === selectedProperty)
      .reduce((sum, p: any) => sum + p.amount, 0);
    
    // Deposit Logic: Pulls deposit amount from Property DB
    const propertiesSeen = new Set();
    let totalDeposits = 0;
    payments.forEach((p: any) => {
      if (!propertiesSeen.has(p.propertyId._id)) {
        if (selectedProperty === "all" || p.propertyId.address === selectedProperty) {
          totalDeposits += p.propertyId.depositAmount || 0;
          propertiesSeen.add(p.propertyId._id);
        }
      }
    });

    const pendingCount = filteredPayments.filter((p: any) => p.status === "overdue").length;

    return { settledRent, totalDeposits, pendingCount };
  }, [payments, filteredPayments, selectedProperty]);

  // ✅ CHART DATA TRANSFORMATION
  const chartData = useMemo(() => {
    const months = ["January", "February", "March", "April"];
    return months.map(m => {
      const monthPayments = payments.filter(p => p.month === m && (selectedProperty === "all" || p.propertyId.address === selectedProperty));
      const collected = monthPayments.filter(p => p.status === "verified" || p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
      const pending = monthPayments.filter(p => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0);
      return { name: m.substring(0, 3), collected, pending };
    });
  }, [payments, selectedProperty]);

  const uniqueProperties = Array.from(new Set(payments.map((p: any) => p.propertyId.address)));

  const handleNudge = async (payment: any) => {
    try {
      const res = await fetch("/api/payments/nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tenantId: payment.tenantId._id,
          month: payment.month,
          propertyAddress: payment.propertyId.address 
        })
      });
      if (res.ok) alert(`Urgent nudge delivered to ${payment.tenantId.name}.`);
    } catch (error) {
      console.error("Nudge failed:", error);
    }
  };

  if (loading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-4 md:p-10 lg:p-12 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-[#1F2937] tracking-tight">Financial Ledger</h1>
          <p className="text-gray-400 font-medium mt-2">Portfolio-wide revenue and deposit tracking.</p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-4 bg-white p-2 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 px-5 border-r border-gray-100">
            <Home size={16} className="text-gray-400" />
            <select 
              className="text-[11px] font-bold text-[#1F2937] bg-transparent outline-none cursor-pointer py-2"
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
            >
              <option value="all">All Properties</option>
              {uniqueProperties.map((addr: any) => (
                <option key={addr} value={addr}>{addr}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 px-5">
            <Calendar size={16} className="text-gray-400" />
            <select 
              className="text-[11px] font-bold text-[#1F2937] bg-transparent outline-none cursor-pointer py-2"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">All Months</option>
              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#1F2937] p-8 rounded-[40px] text-white shadow-2xl">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Rent Collected</p>
          <h3 className="text-3xl font-black text-emerald-400">₹{stats.settledRent.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Security Deposits Held</p>
          <h3 className="text-3xl font-black text-blue-600">₹{stats.totalDeposits.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pending Dues</p>
          <h3 className="text-3xl font-black text-red-500">{stats.pendingCount} Months</h3>
        </div>
      </div>

      {/* REVENUE TREND CHART */}
      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-[#1F2937] flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" /> Collection Trends
          </h3>
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Collected</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400" /> Pending</div>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }} />
              <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="collected" fill="#10B981" radius={[6, 6, 0, 0]} barSize={35} />
              <Bar dataKey="pending" fill="#F87171" radius={[6, 6, 0, 0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RENT HISTORY TABLE */}
      <div className="bg-white rounded-[48px] border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
           <h2 className="text-lg font-bold text-[#1F2937]">Rent History</h2>
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{filteredPayments.length} Rent Records Found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white">
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Details</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((pay: any) => (
                <tr key={pay._id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-8">
                    <p className="text-sm font-bold text-[#1F2937] leading-tight">{pay.propertyId.address}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-black mt-1.5 tracking-wider">
                      {pay.tenantId.name} • {pay.month} {pay.year || '2026'}
                    </p>
                  </td>
                  
                  <td className="px-8 py-8 text-center">
                    <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase border tracking-widest ${
                      (pay.status === 'verified' || pay.status === 'completed') 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-red-50 text-red-600 border-red-100 animate-pulse'
                    }`}>
                      {(pay.status === 'verified' || pay.status === 'completed') ? 'Paid ✅' : 'Overdue ⚠️'}
                    </span>
                  </td>

                  <td className="px-8 py-8 text-right">
                    {(pay.status === 'verified' || pay.status === 'completed') ? (
                      <button 
                        onClick={() => generateReceipt(pay, pay.propertyId, pay.tenantId.name)}
                        className="inline-flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-5 py-3 rounded-2xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <Download size={14} /> Download Receipt
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleNudge(pay)}
                        className="bg-[#1F2937] text-white px-8 py-4 rounded-2xl text-[10px] font-bold flex items-center gap-2 ml-auto hover:bg-black transition-all shadow-lg active:scale-95"
                      >
                        <Bell size={14} /> Send Nudge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && (
            <div className="p-24 text-center text-gray-300 font-bold uppercase tracking-widest text-xs">
               No matching records in this view.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}