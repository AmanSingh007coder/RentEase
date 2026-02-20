"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, Loader2, CheckCircle2, History, 
  Download, PlusCircle, ShieldCheck, MapPin, FileText, Home, ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function TenantDashboard() {
  const [user, setUser] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const email = localStorage.getItem("userEmail");

        const userRes = await fetch(`/api/auth/get-user?email=${email}`);
        const userData = await userRes.json();
        setUser(userData.user);

        if (userData.user.propertyId) {
          const propRes = await fetch(`/api/properties/tenant-view?tenantId=${userData.user._id}`);
          const propData = await propRes.json();
          setProperty(propData.property);
        }

        const historyRes = await fetch(`/api/exit/get-history?tenantId=${userId}`);
        const historyData = await historyRes.json();
        if (historyRes.ok) setHistory(historyData.history);

      } catch (err) { console.error("Sync Error:", err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#F9FAFB]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronizing Vault...</p>
    </div>
  );

  // 🚪 CASE A: DISCONNECTED/ARCHIVED USER (Sidebar will be hidden by Layout)
  if (!user?.propertyId) {
    return (
      <div className="p-10 max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[#1F2937] tracking-tight">
              {history.length > 0 ? `Hey, ${user?.name.split(" ")[0]} 👋` : "Welcome Home"}
            </h1>
            <p className="text-gray-400 mt-2 font-medium">
              {history.length > 0 ? "Access your residency history or join a new property." : "Link a property to unlock your dashboard."}
            </p>
          </div>
          <Link href="/onboarding/invite-code">
            <button className="px-10 py-5 bg-[#0052CC] text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
              <PlusCircle size={20}/> Join New Property
            </button>
          </Link>
        </header>

        {/* Informational State for unlinked users */}
        <section className="bg-white border border-gray-100 rounded-[56px] p-20 text-center shadow-sm">
           <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
             <Home size={40} />
           </div>
           <h3 className="text-2xl font-black text-[#1F2937]">No Active Residency</h3>
           <p className="text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
             You are currently unlinked from any property. Enter an invite code to begin your digital condition audit.
           </p>
        </section>

        {/* 📜 RENTAL LEGACY: Previous Tenancy Cards */}
        {history.length > 0 && (
          <section className="pt-10 border-t border-gray-100">
            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
              <History size={14}/> Residency Legacy Vault
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {history.map((record: any) => (
                <motion.div 
                  key={record._id} 
                  whileHover={{ y: -5 }} 
                  className="bg-white border border-gray-100 p-8 rounded-[48px] shadow-sm flex justify-between items-center group relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <FileText size={10}/> Archived Tenancy
                    </p>
                    <h4 className="font-bold text-lg text-[#1F2937] group-hover:text-blue-600 transition-colors">
                      {record.propertyId?.address}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase">
                      Settled: ₹{record.finalRefundAmount?.toLocaleString()}
                    </p>
                  </div>
                  <Link 
                    href={`/dashboard-tenant/lease-summary/${record._id}`} 
                    className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:bg-emerald-50 hover:text-emerald-500 transition-all shadow-sm relative z-10"
                  >
                    <Download size={24}/>
                  </Link>
                  <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-blue-50/50 blur-[40px] rounded-full" />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // 🎉 CASE B: ACTIVE RESIDENCY (Sidebar visible via Layout)
  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12 pb-32">
      <header>
        <h1 className="text-5xl font-black text-[#1F2937] tracking-tight mb-2">My Residence</h1>
        <p className="text-gray-400 font-medium italic">Digital Witness is protecting <span className="text-black font-bold">{property?.address}</span></p>
      </header>
      
      <div className="bg-white rounded-[56px] p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#0D9488] mb-6 font-black uppercase text-[10px] tracking-widest"><CheckCircle2 size={18}/> Active & Protected</div>
          <h2 className="text-3xl font-black text-[#1F2937] mb-2">{property?.address}</h2>
          <div className="flex gap-10 mt-10">
             <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Monthly Rent</p><p className="text-2xl font-bold text-emerald-600">₹{property?.rentAmount?.toLocaleString()}</p></div>
             <div className="w-[1px] bg-gray-100 h-12" />
             <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p><p className="text-2xl font-bold text-gray-800 uppercase tracking-tighter">{property?.status}</p></div>
          </div>
        </div>
        <div className="mt-10 md:mt-0 flex flex-col gap-4 relative z-10 w-full md:w-auto">
           <Link href="/dashboard-tenant/maintenance" className="px-10 py-5 bg-[#1F2937] text-white rounded-3xl font-bold text-xs uppercase tracking-widest text-center hover:bg-black transition-all shadow-lg">Report Issue</Link>
           <Link href="/dashboard-tenant/exit" className="text-xs font-black text-gray-300 hover:text-red-500 transition-colors uppercase tracking-widest text-center py-2">Terminate Lease</Link>
        </div>
        <div className="absolute top-0 right-0 w-80 h-full bg-blue-50/20 group-hover:bg-blue-50/40 transition-colors" style={{ clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)' }} />
      </div>

      {/* Legacy Vault also shows at the bottom for active tenants */}
      {history.length > 0 && (
         <section className="pt-10 border-t border-gray-50 opacity-60">
            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-8 flex items-center gap-2"><History size={14}/> Residency Vault</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {history.map((record: any) => (
                  <div key={record._id} className="bg-white p-6 rounded-[32px] border border-gray-50 flex justify-between items-center shadow-sm">
                     <p className="font-bold text-sm text-gray-700">{record.propertyId?.address}</p>
                     <Link href={`/dashboard-tenant/lease-summary/${record._id}`} className="text-blue-600 font-bold text-xs">View Report</Link>
                  </div>
               ))}
            </div>
         </section>
      )}
    </div>
  );
}