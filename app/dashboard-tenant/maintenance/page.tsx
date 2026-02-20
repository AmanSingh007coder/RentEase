"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, CheckCircle2, AlertCircle, ChevronRight, 
  Camera, X, Loader2, User, Phone, Calendar, Wrench
} from "lucide-react";

export default function MaintenancePage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReporting, setIsReporting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const [room, setRoom] = useState("Kitchen");
  const [desc, setDesc] = useState("");
  const [tempImages, setTempImages] = useState<any[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => { fetchMaintenance(); }, []);

  const fetchMaintenance = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch(`/api/maintenance/get?tenantId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setIssues(data.issues);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (issueId: string, action: string) => {
    const res = await fetch("/api/maintenance/action", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId, action })
    });
    if (res.ok) fetchMaintenance();
  };

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied.");
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setIsCapturing(false);
  };

  const takePhoto = () => {
    const canvas = document.createElement("canvas");
    if (videoRef.current) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
      setTempImages([...tempImages, { url: canvas.toDataURL("image/jpeg") }]);
      stopCamera();
    }
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/maintenance/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: localStorage.getItem("userId"),
        room,
        description: desc,
        images: tempImages
      })
    });
    if (res.ok) {
      setIsReporting(false);
      setDesc("");
      setTempImages([]);
      fetchMaintenance();
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#0D9488]" size={32} />
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Syncing Vault...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 lg:p-12 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] tracking-tight">Maintenance Log</h1>
          <p className="text-gray-400 font-medium mt-2">Verified repair tracking for your tenancy.</p>
        </div>
        <button onClick={() => setIsReporting(true)} className="bg-[#F59E0B] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
          <Plus size={20} /> Report New Issue
        </button>
      </header>

      {/* 🚀 ACTIVE REQUESTS SECTION */}
      <div className="mb-12">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Current Repairs</h2>
        <div className="space-y-6">
          {issues.filter((i: any) => !i.status.startsWith("resolved") && i.status !== "rejected").length === 0 ? (
            <div className="p-20 text-center border-2 border-dashed border-gray-100 rounded-[48px]">
               <Wrench size={40} className="mx-auto text-gray-200 mb-4" />
               <p className="text-sm text-gray-400 font-medium">Your property is currently in peak condition.</p>
            </div>
          ) : (
            issues.filter((i: any) => !i.status.startsWith("resolved") && i.status !== "rejected").map((issue: any) => (
              <motion.div layout key={issue._id} className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  <div className="flex-1">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                      issue.status === 'contractor_assigned' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-[#F59E0B] border-orange-100'
                    }`}>
                      {issue.status.replace(/_/g, " ")}
                    </span>
                    <h3 className="text-2xl font-bold text-[#1F2937] mt-4">{issue.room} Issue</h3>
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">{issue.description}</p>

                    {/* ✅ DISPLAYING CONTRACTOR DETAILS */}
                    {issue.status === "contractor_assigned" && issue.contractorInfo && (
                      <div className="mt-8 p-6 bg-gray-50 rounded-[32px] border border-gray-100 shadow-inner">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Assigned Professional Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100"><User size={18}/></div>
                            <div>
                               <p className="text-[9px] font-bold text-gray-400 uppercase">Contractor</p>
                               <p className="text-sm font-bold text-blue-900">{issue.contractorInfo.name || "Not specified"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100"><Phone size={18}/></div>
                            <div>
                               <p className="text-[9px] font-bold text-gray-400 uppercase">Contact</p>
                               <p className="text-sm font-bold text-blue-900">{issue.contractorInfo.contact || "Not specified"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100"><Calendar size={18}/></div>
                            <div>
                               <p className="text-[9px] font-bold text-gray-400 uppercase">Estimated Arrival</p>
                               <p className="text-sm font-bold text-blue-900">{issue.contractorInfo.arrivalDesc || "Awaiting Update"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ✅ RESOLUTION ACTION BUTTONS */}
                    <div className="mt-8 flex flex-wrap gap-4">
                      {issue.status === "tenant_fix" && (
                        <button 
                          onClick={() => handleResolve(issue._id, "resolve_by_tenant")} 
                          className="bg-[#0D9488] text-white px-8 py-4 rounded-2xl font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
                        >
                          Confirm Issue Resolved (Self)
                        </button>
                      )}
                      {issue.status === "contractor_assigned" && (
                        <button 
                          onClick={() => handleResolve(issue._id, "resolve_by_contractor")} 
                          className="bg-[#0052CC] text-white px-8 py-4 rounded-2xl font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                        >
                          Confirm Resolved by Contractor
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full lg:w-48 h-48 rounded-[40px] bg-gray-50 overflow-hidden border border-gray-100 shrink-0 shadow-sm">
                    {issue.images?.[0] && <img src={issue.images[0].url} className="w-full h-full object-cover" alt="Evidence" />}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* 📜 REPAIR HISTORY SECTION */}
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Repair History Vault</h2>
      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
         {issues.filter((i: any) => i.status.startsWith("resolved") || i.status === "rejected").length === 0 ? (
           <p className="p-10 text-center text-xs text-gray-400 uppercase tracking-widest">History is currently clear.</p>
         ) : (
           issues.filter((i: any) => i.status.startsWith("resolved") || i.status === "rejected").map((issue: any) => (
             <div key={issue._id} className="p-6 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50 transition-colors group last:border-none">
               <div className="flex items-center gap-5">
                 {issue.status.startsWith("resolved") ? (
                   <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-[#0D9488] shadow-sm"><CheckCircle2 size={24} /></div>
                 ) : (
                   <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shadow-sm"><AlertCircle size={24} /></div>
                 )}
                 <div>
                   <p className="text-sm font-bold text-[#1F2937] group-hover:text-blue-600 transition-colors">{issue.room} Issue</p>
                   <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mt-1">
                     {issue.status.replace(/_/g, " ")} • ID: {issue._id.substring(0,8)}
                   </p>
                 </div>
               </div>
               <div className="text-right shrink-0">
                 <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{new Date(issue.createdAt).toLocaleDateString()}</p>
                 <ChevronRight size={16} className="text-gray-200 mt-1 ml-auto group-hover:text-blue-400 transition-all" />
               </div>
             </div>
           ))
         )}
      </div>

      {/* 📷 REPORTING MODAL */}
      <AnimatePresence>
        {isReporting && (
          <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white w-full max-w-lg rounded-[48px] p-10 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-bold text-2xl text-[#1F2937] tracking-tight">New Repair Request</h2>
                <button onClick={() => setIsReporting(false)} className="p-3 hover:bg-gray-100 rounded-full transition-all"><X size={24}/></button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Location of Issue</p>
                  <select onChange={(e) => setRoom(e.target.value)} className="w-full p-5 bg-gray-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none cursor-pointer">
                    <option>Kitchen</option><option>Living Room</option><option>Bathroom</option><option>Bedroom</option><option>Exterior/Balcony</option>
                  </select>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Problem Description</p>
                  <textarea placeholder="Please describe exactly what needs fixing..." className="w-full p-5 bg-gray-50 rounded-2xl text-sm h-32 outline-none border-none resize-none font-medium" onChange={(e) => setDesc(e.target.value)} />
                </div>
                
                <div className="flex gap-4 items-end">
                  <button onClick={startCamera} className="flex-1 py-6 border-2 border-dashed border-gray-200 rounded-[32px] text-gray-400 flex flex-col items-center gap-3 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-600 transition-all group">
                    <Camera size={28} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Evidence Camera</span>
                  </button>
                  {tempImages.length > 0 && (
                    <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-xl rotate-3">
                      <img src={tempImages[tempImages.length - 1].url} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={!desc || tempImages.length === 0} 
                className="w-full mt-10 py-5 bg-[#F59E0B] text-white rounded-3xl font-bold shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-95 text-sm uppercase tracking-widest"
              >
                Sync to Owner's Queue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📹 LIVE VIEWFINDER */}
      <AnimatePresence>
        {isCapturing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black flex flex-col p-6">
            <div className="flex justify-between items-center text-white mb-6">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 <h3 className="text-xs font-bold uppercase tracking-widest">Live Repair Viewfinder</h3>
              </div>
              <button onClick={stopCamera} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={20} /></button>
            </div>
            <div className="flex-1 rounded-[48px] overflow-hidden border border-white/5 relative bg-gray-900 shadow-2xl">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-4">
                 <button onClick={takePhoto} className="w-24 h-24 bg-white rounded-full border-[10px] border-white/20 shadow-2xl active:scale-90 transition-all flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-black/5" />
                </button>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Tap to Capture Evidence</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}