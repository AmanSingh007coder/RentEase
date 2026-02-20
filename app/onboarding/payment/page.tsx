"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CreditCard, ArrowRight, Loader2, CheckCircle2, Lock, AlertCircle, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingPayment() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch property data from sessionStorage (set after invite code verification)
    const data = sessionStorage.getItem("propertyData");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setPropertyData(parsed);
      } catch (err) {
        setError("Failed to load property details. Please try again.");
      }
    } else {
      // If no property data, redirect back to invite code
      router.push("/onboarding/invite-code");
    }
    setLoading(false);
  }, [router]);

  const handleMockPayment = async () => {
    if (!propertyData) {
      setError("Property data not found. Please start again.");
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/payments/verify-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: localStorage.getItem("userId"),
          transactionId: `MOCK_TXN_${Math.random().toString(36).toUpperCase().substring(2, 10)}`
        })
      });

      if (response.ok) {
        // 2. Show success state before redirecting
        setTimeout(() => {
          setIsProcessing(false);
          setIsSuccess(true);
          // Clear sessionStorage after successful payment
          sessionStorage.removeItem("propertyData");
          setTimeout(() => {
            router.push("/dashboard-tenant");
          }, 2000);
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || "Payment failed. Please try again.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error(error);
      setError("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const totalAmount = propertyData ? 
    propertyData.depositAmount + propertyData.rentAmount : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error && !propertyData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="max-w-md w-full bg-white rounded-[48px] p-10 shadow-2xl border border-gray-100"
        >
          <AlertCircle size={64} className="mx-auto mb-8 text-red-500" />
          <h2 className="text-2xl font-bold text-center text-[#1F2937] mb-4">
            Something went wrong
          </h2>
          <p className="text-center text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/onboarding/invite-code")}
            className="w-full py-4 bg-blue-600 text-white rounded-3xl font-bold"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-[48px] p-10 shadow-2xl border border-gray-100">
        
        {!isSuccess ? (
          <>
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-[#0052CC] shadow-inner">
                <ShieldCheck size={40} />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-[#1F2937] tracking-tight mb-3">Tenancy Activation</h1>
            <p className="text-center text-gray-400 text-sm font-medium mb-6 leading-relaxed px-4">
              Pay your security deposit and first month rent to unlock your digital vault and dashboard.
            </p>

            {/* Property Address */}
            {propertyData && (
              <div className="bg-blue-50 rounded-[24px] p-4 mb-8 border border-blue-100 flex items-center gap-3">
                <MapPin size={18} className="text-blue-600 flex-shrink-0" />
                <p className="text-sm font-bold text-blue-900">{propertyData.address}</p>
              </div>
            )}

            {/* Payment Breakdown */}
            <div className="bg-gray-50 rounded-[32px] p-8 mb-8 space-y-4 border border-gray-100">
              <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">
                <span>Security Deposit</span>
                <span className="text-[#1F2937] text-sm">₹{propertyData?.depositAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">
                <span>First Month Rent</span>
                <span className="text-[#1F2937] text-sm">₹{propertyData?.rentAmount?.toLocaleString()}</span>
              </div>
              <div className="h-[1px] bg-gray-200 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-[#1F2937]">Total Amount</span>
                <span className="text-2xl font-black text-[#0052CC]">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-[24px] p-4 mb-6 flex gap-3 items-start"
              >
                <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </motion.div>
            )}

            <button 
              onClick={handleMockPayment}
              disabled={isProcessing || !propertyData}
              className="w-full py-5 bg-[#1F2937] text-white rounded-3xl font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-70 group"
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Lock size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                  <span>Secure Checkout</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            
            <p className="mt-6 text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center justify-center gap-2">
              <CheckCircle2 size={12}/> PCI-DSS Compliant Simulation
            </p>
          </>
        ) : (
          <div className="py-10 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
              <CheckCircle2 size={100} className="mx-auto text-emerald-500 mb-8" />
            </motion.div>
            <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Vault Unlocked!</h2>
            <p className="text-gray-400 font-medium">Welcome home. Your dashboard is now active.</p>
          </div>
        )}
      </motion.div>

      {/* MOCK OVERLAY (Simulating Stripe/Razorpay logic) */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white">
            <Loader2 className="animate-spin text-blue-500 mb-6" size={48} />
            <h3 className="text-lg font-bold tracking-widest uppercase">Authorizing with Bank...</h3>
            <p className="text-gray-400 text-xs mt-2 font-medium">Please do not refresh the page.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}