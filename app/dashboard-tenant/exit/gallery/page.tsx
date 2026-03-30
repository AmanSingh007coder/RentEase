"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Check, ArrowRight, Loader2, X, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MoveOutGallery() {
  const [slots, setSlots] = useState([]);
  // ✅ FIX: Track uploads by index to prevent category collisions
  const [uploads, setUploads] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [exitId, setExitId] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  
  // ✅ Track index and name separately
  const [activeSlot, setActiveSlot] = useState<{ index: number; name: string } | null>(null);
  const [error, setError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const tenantId = localStorage.getItem("userId");
        const propRes = await fetch(`/api/properties/get-by-tenant?tenantId=${tenantId}`);
        const propData = await propRes.json();
        
        if (propRes.ok && propData.property) {
          setExitId(propData.property.activeExitId);
          const moveInRes = await fetch(`/api/inspections/get-move-in?propertyId=${propData.property._id}`);
          const moveInData = await moveInRes.json();
          if (moveInRes.ok) {
            setSlots(moveInData.slots || []);
          } else {
            setError("No move-in baseline found in vault.");
          }
        }
      } catch (err) {
        setError("Vault synchronization failed.");
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const startCamera = async (index: number, category: string) => {
    setActiveSlot({ index, name: category });
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied.");
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || activeSlot === null) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL("image/jpeg", 0.8);
      
      // ✅ FIX: Save using the unique INDEX
      setUploads(prev => ({ ...prev, [activeSlot.index]: imgData }));
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
    setActiveSlot(null);
  };

  const handleSubmit = async () => {
    // ✅ Map through slots using index to build the final submission array
    const photoArray = slots.map((slot: any, index: number) => ({
      area: slot.category,
      url: uploads[index]
    }));

    const res = await fetch("/api/exit/submit-photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exitId, photos: photoArray })
    });
    if (res.ok) window.location.href = "/dashboard-tenant/exit";
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Baseline Evidence</p>
    </div>
  );

  if (error) return (
    <div className="h-[80vh] flex flex-col items-center justify-center p-10 text-center">
      <AlertCircle className="text-red-500 mb-4" size={48} />
      <h2 className="text-xl font-bold">{error}</h2>
      <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 underline text-xs font-bold uppercase">Retry</button>
    </div>
  );

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto pb-40">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-[#1F2937] tracking-tighter">Exit Condition Audit</h1>
        <p className="text-gray-400 mt-2 font-medium italic">Match your move-out condition with the baseline photos.</p>
      </header>

      <div className="grid grid-cols-1 gap-12">
        {slots.map((item: any, index: number) => (
          <div key={index} className="bg-white border border-gray-100 rounded-[48px] p-8 md:p-10 shadow-sm relative overflow-hidden">
            <h3 className="text-2xl font-black uppercase mb-8 tracking-tight flex items-center gap-3">
               <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">{index + 1}</span>
               {item.category}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Baseline Reference */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Baseline (Move-In)</p>
                <img src={item.url} className="w-full h-72 object-cover rounded-[32px] grayscale opacity-40 border border-gray-50 shadow-inner" alt="Baseline" />
              </div>
              
              {/* Current Evidence */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Your Move-Out Proof</p>
                {uploads[index] ? (
                  <div className="relative rounded-[32px] overflow-hidden border-4 border-emerald-50 shadow-xl">
                    <img src={uploads[index]} className="w-full h-72 object-cover" alt="Proof" />
                    <button 
                      onClick={() => startCamera(index, item.category)} 
                      className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-bold shadow-lg hover:bg-white transition-colors"
                    >
                      Retake Photo
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => startCamera(index, item.category)} 
                    className="w-full h-72 border-4 border-dashed border-gray-50 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Camera size={28} />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Open Camera</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
        <button 
          onClick={handleSubmit} 
          disabled={Object.keys(uploads).length < slots.length}
          className="w-full py-6 bg-[#1F2937] text-white rounded-[32px] font-bold text-sm shadow-2xl flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-20 active:scale-95"
        >
          Submit Audit Report <ArrowRight size={20} />
        </button>
      </div>

      {/* 📸 FULL SCREEN WEBCAM OVERLAY */}
      <AnimatePresence>
        {isCapturing && (
          <motion.div 
            className="fixed inset-0 z-[100] bg-black flex flex-col"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="p-6 flex justify-between items-center text-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h3 className="font-bold uppercase tracking-widest text-[10px]">Live Audit: {activeSlot?.name}</h3>
              </div>
              <button onClick={stopCamera} className="p-2 bg-white/10 rounded-full"><X size={24} /></button>
            </div>

            <div className="flex-1 relative overflow-hidden bg-gray-900 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-[1px] border-white/10 pointer-events-none grid grid-cols-3 grid-rows-3">
                {[...Array(9)].map((_, i) => <div key={i} className="border-[0.5px] border-white/5" />)}
              </div>
            </div>

            <div className="h-40 bg-black flex items-center justify-center relative">
               <button 
                onClick={capturePhoto}
                className="w-20 h-20 bg-white rounded-full border-[6px] border-gray-800 shadow-xl active:scale-90 transition-all flex items-center justify-center"
               >
                 <div className="w-14 h-14 rounded-full border-2 border-black/10" />
               </button>
               <p className="absolute bottom-6 text-[8px] font-black uppercase text-white/30 tracking-[0.4em]">Tap to Capture Condition</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}