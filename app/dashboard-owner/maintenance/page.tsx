"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wrench, CheckCircle2, AlertCircle, MapPin, User, 
  Loader2, Phone, Calendar, XCircle 
} from "lucide-react";

export default function MaintenanceQueue() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cArrival, setCArrival] = useState("");

  useEffect(() => { fetchQueue(); }, []);

  const fetchQueue = async () => {
    try {
      const res = await fetch(`/api/maintenance/get-for-owner?ownerId=${localStorage.getItem("userId")}`);
      const data = await res.json();
      if (res.ok) setIssues(data.issues);
    } catch (err) {
      console.error("Queue fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (issueId: string, action: string) => {
    const feedback = action === "reject" ? prompt("Reason for rejection?") : null;
    if (action === "reject" && !feedback) return;

    const res = await fetch("/api/maintenance/action", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        issueId, 
        action, 
        contractorName: cName, 
        contractorContact: cPhone, 
        arrivalDesc: cArrival,
        feedback 
      })
    });

    if (res.ok) {
      setSelectedIssue(null);
      fetchQueue();
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>;

  return (
    <div className="p-4 md:p-10 lg:p-12 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1F2937] mb-10 tracking-tight">Maintenance Queue</h1>

      <div className="space-y-8 mb-20">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Portfolio Requests</h2>
        {issues.filter((i: any) => !i.status.startsWith("resolved") && i.status !== "rejected").map((issue: any) => (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={issue._id} className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${
                  issue.status === 'pending' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  {issue.status.replace(/_/g, " ")}
                </span>
                <h3 className="text-xl font-bold text-[#1F2937] mt-4">{issue.description}</h3>
                <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest">{issue.propertyId.address} • {issue.tenantId.name}</p>

                {/* CONTRACTOR FORM */}
                {selectedIssue === issue._id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-8 p-6 bg-gray-50 rounded-3xl space-y-4 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Assignment Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input placeholder="Contractor Name" className="p-4 bg-white border-none rounded-2xl text-xs outline-none" onChange={e => setCName(e.target.value)} />
                      <input placeholder="Phone Number" className="p-4 bg-white border-none rounded-2xl text-xs outline-none" onChange={e => setCPhone(e.target.value)} />
                      <input placeholder="Arrival (e.g. Mon 9AM)" className="p-4 bg-white border-none rounded-2xl text-xs outline-none" onChange={e => setCArrival(e.target.value)} />
                    </div>
                    <button onClick={() => handleAction(issue._id, "approve_contractor")} className="bg-[#0052CC] text-white px-10 py-4 rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/20">Send to Tenant</button>
                  </motion.div>
                )}
              </div>

              <div className="lg:w-80 flex flex-col gap-3 justify-center lg:border-l lg:pl-10 border-gray-100">
                {issue.status === "pending" && (
                  <>
                    <button onClick={() => setSelectedIssue(issue._id)} className="w-full py-4 bg-[#0052CC] text-white rounded-2xl font-bold text-xs shadow-lg shadow-blue-500/10">Approve Professional</button>
                    <button onClick={() => handleAction(issue._id, "tenant_fix")} className="w-full py-4 bg-white border border-gray-100 rounded-2xl font-bold text-xs hover:bg-gray-50">Assign to Tenant</button>
                  </>
                )}
                <button onClick={() => handleAction(issue._id, "reject")} className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">Decline Request</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* RESOLVED LOG */}
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Completed Repairs</h2>
      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
         {issues.filter((i: any) => i.status.startsWith("resolved") || i.status === "rejected").map((issue: any) => (
           <div key={issue._id} className="p-6 border-b flex justify-between items-center bg-gray-50/20">
             <div className="flex items-center gap-4 text-gray-500">
               {issue.status.startsWith("resolved") ? <CheckCircle2 size={18} className="text-[#0D9488]" /> : <XCircle size={18} />}
               <p className="text-xs font-bold uppercase tracking-widest">{issue.room} Repair — {issue.propertyId.address}</p>
             </div>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{issue.status.replace(/_/g, " ")}</span>
           </div>
         ))}
      </div>
    </div>
  );
}