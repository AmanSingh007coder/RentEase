"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Download, FileText, Loader2, ShieldCheck, LogOut, Lock } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function LeaseSummary() {
  const { id } = useParams();
  const [exit, setExit] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      const res = await fetch(`/api/exit/get-single-archive?exitId=${id}`);
      const data = await res.json();
      if (res.ok) setExit(data.exit);
    };
    fetchSummary();
  }, [id]);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`RentEase_Discharge_${exit?.tenantId?.name.replace(/\s/g, "_")}.pdf`);
    } catch (error) { console.error("PDF Export failed", error); }
    finally { setIsGenerating(false); }
  };

  if (!exit) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 md:p-20 flex flex-col items-center justify-center">
      
      {/* 📄 HIDDEN PRINT TEMPLATE */}
      <div className="fixed left-[-9999px]">
        <div ref={certificateRef} className="w-[800px] p-20 bg-white text-[#1F2937] font-sans border-[20px] border-gray-50">
          <div className="flex justify-between items-start mb-20">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-[#2563EB] mb-2">Lease Discharge</h1>
              <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">Formal Property Release Record</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold font-mono uppercase">REF: {exit._id.slice(-8)}</p>
              <p className="text-[10px] text-[#9CA3AF] uppercase">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="space-y-12">
            <div className="border-b border-[#F3F4F6] pb-8">
              <p className="text-[10px] font-black text-[#D1D5DB] uppercase tracking-widest mb-4">Resident Information</p>
              <h2 className="text-2xl font-bold text-[#1F2937]">{exit.tenantId?.name}</h2>
              <p className="text-[#6B7280]">{exit.tenantId?.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-12">
              <div><p className="text-[10px] font-black text-[#D1D5DB] uppercase tracking-widest mb-2">Property Address</p><p className="text-sm font-bold leading-relaxed text-[#1F2937]">{exit.propertyId?.address}</p></div>
              <div><p className="text-[10px] font-black text-[#D1D5DB] uppercase tracking-widest mb-2">Final Settlement</p><p className="text-2xl font-black text-[#059669]">₹{exit.finalRefundAmount.toLocaleString()}</p></div>
            </div>
            <div className="bg-[#F9FAFB] p-8 rounded-3xl border border-[#F3F4F6]">
              <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-4">Official Closure Statement</p>
              <p className="text-xs leading-relaxed text-[#4B5563] italic">"The digital condition audit has been verified. No pending dues remain. The resident is discharged from all active obligations."</p>
            </div>
          </div>
          <div className="mt-24 flex justify-between items-end border-t border-[#F3F4F6] pt-10">
            <div className="flex items-center gap-2 text-[#2563EB] opacity-40"><ShieldCheck size={24}/><span className="text-[10px] font-black uppercase tracking-widest">RentEase Digital Seal</span></div>
            <div className="text-right"><div className="h-1 bg-[#1F2937] w-40 mb-2 ml-auto rounded-full" /><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]">Authorized Exit</p></div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white max-w-4xl w-full rounded-[56px] shadow-2xl p-12 md:p-20 relative overflow-hidden">
        <div className="text-center relative z-10 mb-16">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><CheckCircle size={48} /></div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1F2937] tracking-tight">Lease Concluded</h1>
          <p className="text-gray-400 mt-4 text-lg font-medium leading-relaxed">Residency for <span className="text-black font-bold">{exit.propertyId.address}</span> is officially archived.</p>
        </div>
        <div className="flex flex-col gap-4 relative z-10">
          <button onClick={downloadCertificate} disabled={isGenerating} className="w-full py-7 bg-[#1F2937] text-white rounded-[32px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50">
            {isGenerating ? <Loader2 className="animate-spin" /> : <><FileText size={20}/> Download Discharge Certificate <Download size={16}/></>}
          </button>
          <button onClick={() => window.location.href = "/"} className="w-full py-7 bg-white border border-gray-100 text-gray-400 rounded-[32px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:text-red-500 hover:border-red-100 transition-all group">
            Finish & Leave Dashboard <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-emerald-50 blur-[100px] rounded-full" />
      </motion.div>
    </div>
  );
}