"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, Loader2, CheckCircle2, History, 
  Download, PlusCircle, ShieldAlert, Zap, Home, FileText, ArrowRight, Clock
} from "lucide-react";
import Link from "next/link";

export default function TenantDashboard() {
  const [user, setUser] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [inspection, setInspection] = useState<any>(null);
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

          // ✅ Fetch Move-In Inspection Status
          const insRes = await fetch(`/api/inspections/get?tenantId=${userId}&type=move-in`);
          const insData = await insRes.json();
          if (insRes.ok) setInspection(insData.inspection);
        }

        const historyRes = await fetch(`/api/exit/get-history?tenantId=${userId}`);
        const historyData = await historyRes.json();
        if (historyRes.ok) setHistory(historyData.history);

      } catch (err) { console.error("Dashboard Error:", err); }
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

  // 🚪 CASE A: DISCONNECTED/ARCHIVED USER
  if (!user?.propertyId) {
    return (
      <div className="p-10 max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[#1F2937] tracking-tight">
              {history.length > 0 ? `Hey, ${user?.name.split(" ")[0]} 👋` : "Welcome Home"}
            </h1>
            <p className="text-gray-400 mt-2 font-medium">Link a property to unlock your dashboard.</p>
          </div>
          <Link href="/onboarding/invite-code">
            <button className="px-10 py-5 bg-[#0052CC] text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl active:scale-95 transition-all">
              <PlusCircle size={20}/> Join New Property
            </button>
          </Link>
        </header>

        <section className="bg-white border border-gray-100 rounded-[56px] p-20 text-center shadow-sm">
           <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
             <Home size={40} />
           </div>
           <h3 className="text-2xl font-black text-[#1F2937]">No Active Residency</h3>
           <p className="text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
             Enter an invite code to begin your digital condition audit.
           </p>
        </section>
        
        {/* Previous Tenancy History logic remains the same... */}
      </div>
    );
  }

  // 🎉 CASE B: ACTIVE RESIDENCY (Gatekeeper Logic Applied)
  const isVerified = inspection?.status === "verified";

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12 pb-32">
      <header>
        <h1 className="text-5xl font-black text-[#1F2937] tracking-tight mb-2">My Residence</h1>
        <p className="text-gray-400 font-medium italic">
            {isVerified ? "Digital Witness is protecting" : "Pending Verification for"} 
            <span className="text-black font-bold ml-1">{property?.address}</span>
        </p>
      </header>
      
      <div className={`rounded-[56px] p-12 shadow-sm border flex flex-col md:flex-row justify-between items-center relative overflow-hidden group transition-all duration-500 ${
        isVerified ? 'bg-white border-gray-100' : 'bg-orange-50/40 border-orange-100'
      }`}>
        <div className="relative z-10">
          <div className={`flex items-center gap-2 mb-6 font-black uppercase text-[10px] tracking-widest ${
            isVerified ? 'text-[#0D9488]' : 'text-orange-500'
          }`}>
            {isVerified ? <><CheckCircle2 size={18}/> Active & Protected</> : <><ShieldAlert size={18} className="animate-pulse"/> Audit Verification Pending</>}
          </div>
          <h2 className="text-3xl font-black text-[#1F2937] mb-2">{property?.address}</h2>
          
          <div className="flex gap-10 mt-10">
             <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Monthly Rent</p><p className="text-2xl font-bold text-emerald-600">₹{property?.rentAmount?.toLocaleString()}</p></div>
             <div className="w-[1px] bg-gray-100 h-12" />
             <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tenancy State</p><p className="text-2xl font-bold text-gray-800 uppercase tracking-tighter">{isVerified ? "Active" : "Provisional"}</p></div>
          </div>
        </div>

        <div className="mt-10 md:mt-0 flex flex-col gap-4 relative z-10 w-full md:w-auto">
           {isVerified ? (
             <>
               <Link href="/dashboard-tenant/maintenance" className="px-10 py-5 bg-[#1F2937] text-white rounded-3xl font-bold text-xs uppercase tracking-widest text-center hover:bg-black transition-all shadow-lg">Report Issue</Link>
               <Link href="/dashboard-tenant/exit" className="text-xs font-black text-gray-300 hover:text-red-500 transition-colors uppercase tracking-widest text-center py-2">Terminate Lease</Link>
             </>
           ) : (
             <Link href="/dashboard-tenant/witness" className="px-10 py-5 bg-[#0D9488] text-white rounded-3xl font-bold text-xs uppercase tracking-widest text-center hover:bg-[#0A7A6F] transition-all shadow-lg flex items-center gap-2">
               <Zap size={16} /> {inspection ? "Review Submission" : "Start Digital Audit"}
             </Link>
           )}
        </div>
        {!isVerified && <div className="absolute top-0 right-0 w-80 h-full bg-orange-200/10" style={{ clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)' }} />}
      </div>

      {/* 🔒 LOCKED FEATURES OVERLAY MESSAGE */}
      {!isVerified && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-dashed border-gray-100 p-12 rounded-[56px] text-center"
        >
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Clock size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#1F2937] mb-2">Features Locked</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                Payments, Maintenance, and Exit portals will unlock once your landlord verifies the move-in inspection.
            </p>
        </motion.div>
      )}

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