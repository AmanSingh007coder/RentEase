"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InviteCodePage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyCode = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch("/api/properties/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: inviteCode.trim().toUpperCase(),
          tenantId: userId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Store property data for the next step
        sessionStorage.setItem(
          "propertyData",
          JSON.stringify({
            propertyId: data.property._id,
            address: data.property.address,
            depositAmount: data.property.depositAmount,
            rentAmount: data.property.rentAmount,
          })
        );
        // Redirect to payment with property details
        router.push("/onboarding/agreement");
      } else {
        setError(data.error || "Invalid invite code. Please check and try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[48px] p-10 shadow-2xl border border-gray-100"
      >
        {/* Header */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner">
            <ShieldCheck size={40} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-[#1F2937] tracking-tight mb-3">
          Enter Invite Code
        </h1>

        <p className="text-center text-gray-400 text-sm font-medium mb-10 leading-relaxed px-4">
          Your landlord sent you an invite. Enter it to unlock your digital vault.
        </p>

        {/* Error Message */}
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

        {/* Invite Code Input */}
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => {
            setInviteCode(e.target.value.toUpperCase());
            setError("");
          }}
          placeholder="RE-XXXX"
          maxLength={8}
          className="w-full p-4 text-center text-3xl font-mono font-black bg-gray-50 rounded-[24px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none mb-6 transition-colors"
        />

        {/* Verify Button */}
        <button
          onClick={handleVerifyCode}
          disabled={isVerifying || inviteCode.length < 4}
          className="w-full py-5 bg-[#0052CC] text-white rounded-[24px] font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Unlocking...</span>
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Help Text */}
        <p className="mt-6 text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          Don't have an invite code?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Contact your landlord
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
