"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, Clock, Calendar, Camera, Home, 
  Loader2, Info, CheckCircle2, AlertTriangle, DollarSign, X, ShieldCheck
} from "lucide-react";

export default function OwnerExitInbox() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNegotiation, setActiveNegotiation] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const ownerId = localStorage.getItem("userId");
      const res = await fetch(`/api/exit/get-owner-requests?ownerId=${ownerId}`);
      const data = await res.json();
      if (res.ok) setRequests(data.requests);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleNoticeAction = async (status: string, chosenDate: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/exit/respond-notice", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exitId: activeNegotiation._id, status, moveOutDate: chosenDate })
      });
      if (res.ok) {
        setActiveNegotiation(null);
        fetchRequests();
      }
    } finally { setIsSubmitting(false); }
  };

  // --- REFINED FILTERING LOGIC ---
  const freshNotices = requests.filter((r: any) => r.status === "notice_served");
  const disputes = requests.filter((r: any) => r.status === "disputed");

  // ✅ FIX: Added 'inspection_completed' and 'disputed' so they stay in the pipeline
  const auditPipeline = requests.filter((r: any) => 
    ["photos_submitted", "physical_inspection_required", "physical_inspection_done", "inspection_completed", "settled", "disputed"].includes(r.status)
  );

  const scheduledDepartures = requests.filter((r: any) => r.status === "notice_accepted");

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Pipeline</p>
    </div>
  );

  return (
    <div className="p-10 max-w-6xl mx-auto pb-40">
      <header className="mb-16">
        <h1 className="text-4xl font-black text-[#1F2937] tracking-tight">Exit Management</h1>
        <p className="text-gray-400 mt-2 font-medium italic">Command center for move-out notices and condition audits.</p>
      </header>

      {/* --- DISPUTES SECTION --- */}
      {disputes.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 animate-pulse"><AlertTriangle size={20} /></div>
            <h2 className="text-xl font-black text-red-600 uppercase tracking-wider">Settlement Disputes</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {disputes.map((req: any) => (
              <div key={req._id} onClick={() => router.push(`/dashboard-owner/exit/${req._id}`)} className="bg-red-50 border border-red-100 p-8 rounded-[40px] flex items-center justify-between hover:bg-red-100/50 transition-all cursor-pointer">
                <div className="flex items-center gap-8">
                  <div className="w-14 h-14 rounded-3xl bg-white text-red-500 flex items-center justify-center shadow-sm"><X size={24} /></div>
                  <div>
                    <h3 className="font-bold text-red-900 text-lg">{req.tenantId?.name}</h3>
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mt-1">Action Required: Settlement Disputed</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   <p className="hidden md:block text-xs font-bold text-red-700 bg-white px-4 py-2 rounded-xl shadow-sm italic">"{req.tenantDisputeComment?.substring(0, 30)}..."</p>
                   <ArrowRight className="text-red-300" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- AUDIT PIPELINE SECTION --- */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600"><Camera size={20} /></div>
          <h2 className="text-xl font-black text-[#1F2937] uppercase tracking-wider">Active Audit Pipeline</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {auditPipeline.map((req: any) => (
            <div key={req._id} onClick={() => router.push(`/dashboard-owner/exit/${req._id}`)} className="group bg-white border border-gray-100 p-8 rounded-[40px] flex items-center justify-between hover:shadow-xl transition-all cursor-pointer">
              <div className="flex items-center gap-8">
                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center ${req.status === "settled" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                  {req.status === "settled" ? <DollarSign size={24}/> : <Camera size={24}/>}
                </div>
                <div>
                  <h3 className="font-bold text-[#1F2937] text-lg">{req.tenantId?.name}</h3>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${req.status === 'inspection_completed' ? 'text-emerald-500' : 'text-blue-600'}`}>
                    {req.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-[#1F2937] group-hover:text-white transition-all"><ArrowRight size={20} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FRESH NOTICES SECTION --- */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600"><Clock size={20} /></div>
          <h2 className="text-xl font-black text-[#1F2937] uppercase tracking-wider">Fresh Notices</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {freshNotices.map((req: any) => (
            <div key={req._id} onClick={() => setActiveNegotiation(req)} className="bg-white border border-gray-100 p-8 rounded-[40px] flex items-center justify-between hover:border-orange-200 cursor-pointer">
              <div className="flex items-center gap-8">
                <div className="w-14 h-14 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center"><Calendar size={24} /></div>
                <div><h3 className="font-bold text-[#1F2937] text-lg">{req.tenantId?.name}</h3><p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-1">Review Date</p></div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-300 uppercase">Proposed</p>
                <p className="text-sm font-bold text-orange-600">{new Date(req.moveOutDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Negotiation Modal... (No changes needed here) */}
      {activeNegotiation && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[48px] p-10 max-w-lg w-full shadow-2xl relative border border-white/20">
            <button onClick={() => setActiveNegotiation(null)} className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"><X size={24} /></button>
            <h2 className="text-2xl font-black mb-1 tracking-tight text-left">Review Exit Proposal</h2>
            <div className="p-8 bg-orange-50 rounded-3xl border border-orange-100 my-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">Proposed Move-Out Date</p>
                <p className="text-3xl font-black text-orange-900">{new Date(activeNegotiation.moveOutDate).toLocaleDateString()}</p>
            </div>
            <div className="space-y-4">
              <button onClick={() => handleNoticeAction("notice_accepted", activeNegotiation.moveOutDate)} className="w-full py-6 bg-emerald-500 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Accept Move-Out Date</button>
              <div className="relative"><Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} /><input type="date" onChange={(e) => setRescheduleDate(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold outline-none" /></div>
              <button disabled={!rescheduleDate || isSubmitting} onClick={() => handleNoticeAction("notice_rescheduled", rescheduleDate)} className="w-full py-5 bg-[#1F2937] text-white rounded-2xl font-bold text-xs disabled:opacity-20 active:scale-95 transition-all">Suggest Different Date</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}