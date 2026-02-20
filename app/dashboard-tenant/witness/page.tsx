"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2,
  Clock,
  Zap,
  RefreshCw
} from "lucide-react";

export default function DigitalWitness() {
  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [tempImages, setTempImages] = useState<{url: string, category: string, timestamp: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Camera Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 1. GATEKEEPER: Sync with Vault
  useEffect(() => {
    const fetchInspection = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const res = await fetch(`/api/inspections/get?tenantId=${userId}&type=move-in`);
        const data = await res.json();
        if (res.ok) setInspection(data.inspection);
      } catch (err) {
        console.error("Vault sync failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInspection();
  }, []);

  // 2. VIEW FINDER LOGIC
  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied. Please allow camera permissions to capture evidence.");
      setIsCapturing(false);
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL("image/jpeg", 0.8);
      
      const newPhoto = {
        url: imgData,
        category: "General",
        timestamp: new Date().toISOString()
      };
      
      setTempImages(prev => [...prev, newPhoto]);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  const submitInspection = async () => {
    if (tempImages.length === 0) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/inspections/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: localStorage.getItem("userId"),
          images: tempImages
        })
      });

      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      alert("Failed to sync evidence with vault.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#0D9488]" size={32} />
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Synchronizing Vault...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 lg:p-12 max-w-7xl mx-auto">
      {/* HEADER */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#0D9488] mb-2">
            <ShieldCheck size={20} />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Move-In Protocol</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] tracking-tight">Digital Witness</h1>
          <p className="text-sm text-gray-400 mt-2">Cryptographically signed evidence for your security deposit.</p>
        </div>

        {/* DYNAMIC STATUS BADGE */}
        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            inspection?.status === 'verified' ? 'bg-[#0D9488]/10 text-[#0D9488]' : 'bg-orange-50 text-orange-500'
          }`}>
            {inspection?.status === 'verified' ? <Lock size={20} /> : <Zap size={20} className="animate-pulse" />}
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inspection Status</p>
            <p className="text-sm font-bold text-[#1F2937] capitalize">
              {inspection ? inspection.status : "Not Started"}
            </p>
          </div>
        </div>
      </header>

      {/* 📸 ACTION: START INSPECTION (Only if no inspection or rejected) */}
      {(!inspection || inspection.status === 'rejected') && !isCapturing && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-12 bg-[#1F2937] rounded-[48px] text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-xl">
              <Camera size={40} className="text-[#0D9488]" />
            </div>
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Initial Move-In Evidence</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-10 leading-relaxed">
              Capture live photos of the property to lock in its current state. Verified photos protect your <span className="text-white font-bold">₹30,000 deposit</span>.
            </p>
            <button 
              onClick={startCamera} 
              className="bg-[#0D9488] hover:bg-[#0A7A6F] px-12 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl shadow-teal-900/40"
            >
              Start Live Viewfinder
            </button>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[#0D9488]/10 blur-[100px] rounded-full" />
        </motion.div>
      )}

      {/* 📑 REJECTION ALERT */}
      {inspection?.status === 'rejected' && (
        <div className="mt-8 p-8 rounded-[32px] bg-red-50 border border-red-100 flex items-start gap-5">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-red-900">Re-take Requested by Owner</h3>
            <p className="text-sm text-red-700/70 mt-1 italic">"{inspection.ownerFeedback || "Photos were unclear."}"</p>
          </div>
        </div>
      )}

      {/* 📑 PENDING ALERT */}
      {inspection?.status === 'pending' && (
        <div className="p-8 rounded-[32px] bg-blue-50 border border-blue-100 flex items-start gap-5 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 uppercase text-xs tracking-widest">Awaiting Verification</h3>
            <p className="text-sm text-blue-700/70 mt-1">Mr. Gupta has been notified to verify your move-in evidence. Status will update once locked.</p>
          </div>
        </div>
      )}

      {/* 🖼️ GALLERY OF CAPTURED PHOTOS */}
      {(inspection?.images || tempImages.length > 0) && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[#1F2937]">Evidence Gallery</h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{inspection?.images?.length || tempImages.length} Photos Captured</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-20">
            {(inspection?.images || tempImages).map((img: any, i: number) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="aspect-[4/5] bg-white rounded-[32px] overflow-hidden border border-gray-100 relative group shadow-sm"
              >
                <img src={img.url} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-[#0D9488] flex items-center gap-1 shadow-sm">
                  <CheckCircle2 size={10} /> Verified Source
                </div>
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-[8px] text-white/80 font-mono">{img.category || "General"}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 📱 LIVE VIEW FINDER MODAL */}
      <AnimatePresence>
        {isCapturing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[200] bg-black flex flex-col p-4 md:p-8"
          >
            <div className="flex justify-between items-center text-white mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Live Viewfinder</h3>
              </div>
              <button onClick={stopCamera} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 bg-gray-900 rounded-[40px] border border-white/5 overflow-hidden relative shadow-2xl flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover mirror"
              />
              
              {/* SHUTTER UI */}
              <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-6">
                <div className="flex items-center gap-8">
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/40">
                    <RefreshCw size={20} />
                  </div>
                  <button 
                    onClick={takePhoto}
                    className="w-24 h-24 bg-white rounded-full border-[10px] border-white/20 active:scale-90 transition-all shadow-2xl flex items-center justify-center"
                  >
                    <div className="w-16 h-16 rounded-full border-2 border-black/5" />
                  </button>
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs">
                    {tempImages.length}
                  </div>
                </div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Tap to Capture Evidence</p>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <div className="flex -space-x-3">
                {tempImages.slice(-4).map((img, i) => (
                  <div key={i} className="w-12 h-12 rounded-xl border-2 border-black bg-gray-800 overflow-hidden shadow-xl">
                    <img src={img.url} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <button 
                onClick={submitInspection}
                disabled={isSubmitting || tempImages.length === 0}
                className="px-10 py-5 bg-[#0D9488] text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-teal-500/20 disabled:opacity-50 transition-all active:scale-95"
              >
                {isSubmitting ? "Syncing Vault..." : "Submit Inspection"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}