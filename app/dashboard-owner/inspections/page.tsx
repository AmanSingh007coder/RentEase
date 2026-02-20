"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CheckCircle2, XCircle, Eye, MessageSquare, Loader2 } from "lucide-react";

export default function OwnerInspections() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchInspections = async () => {
      const ownerId = localStorage.getItem("userId");
      const res = await fetch(`/api/inspections/get-for-owner?ownerId=${ownerId}`);
      const data = await res.json();
      if (res.ok) setInspections(data.inspections);
      setLoading(false);
    };
    fetchInspections();
  }, []);

  const handleAction = async (id: string, action: "verify" | "reject") => {
    const res = await fetch("/api/inspections/action", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inspectionId: id, action, feedback })
    });
    if (res.ok) window.location.reload();
  };

  if (loading) return <div className="p-12 text-center text-gray-400">Loading Inspections...</div>;

  return (
    <div className="p-4 md:p-10 lg:p-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#1F2937]">Move-In Inspections</h1>
        <p className="text-gray-400 mt-2 font-medium italic">Verify tenant-submitted evidence for your properties.</p>
      </header>

      <div className="grid gap-6">
        {inspections.length === 0 ? (
          <div className="p-20 bg-white rounded-[40px] border border-dashed text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
            No pending inspections
          </div>
        ) : (
          inspections.map((ins: any) => (
            <motion.div key={ins._id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0052CC]">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1F2937] text-lg">{ins.propertyId.address}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Submitted by: {ins.tenantId.name} • {ins.images.length} Photos
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedInspection(ins)}
                className="px-6 py-3 bg-[#1F2937] text-white rounded-xl font-bold text-xs hover:bg-black transition-all flex items-center gap-2"
              >
                <Eye size={16} /> Review Evidence
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* REVIEW MODAL */}
      <AnimatePresence>
        {selectedInspection && (
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-8 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Reviewing Move-In Evidence</h2>
                <button onClick={() => setSelectedInspection(null)} className="text-gray-400 hover:text-black font-bold">Close</button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 gap-4">
                {selectedInspection.images.map((img: any, i: number) => (
                  <div key={i} className="aspect-video bg-gray-100 rounded-2xl overflow-hidden border">
                    <img src={img.url} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="p-8 bg-gray-50 border-t space-y-4">
                <textarea 
                  placeholder="Optional: Provide feedback if rejecting..."
                  className="w-full p-4 rounded-2xl border outline-none text-sm resize-none"
                  onChange={(e) => setFeedback(e.target.value)}
                />
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleAction(selectedInspection._id, "reject")}
                    className="flex-1 py-4 border border-red-100 text-red-500 rounded-2xl font-bold text-xs hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} /> Request Retake
                  </button>
                  <button 
                    onClick={() => handleAction(selectedInspection._id, "verify")}
                    className="flex-1 py-4 bg-[#0D9488] text-white rounded-2xl font-bold text-xs hover:bg-[#0A7A6F] transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
                  >
                    <CheckCircle2 size={16} /> Verify & Lock Record
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}