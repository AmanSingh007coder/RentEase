"use client";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, ArrowRight, ShieldCheck, Home, Download, FileText, CreditCard } from "lucide-react";
import { generateReceipt } from "@/lib/generateReceipt";
import Script from "next/script";

declare var Razorpay: any;

export default function TenantLedger() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchLedger(); }, []);

  const fetchLedger = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch(`/api/payments/ledger?userId=${userId}`);
      const d = await res.json();
      if (res.ok && d.property) setData(d);
      else setError(d.error || "No active lease found.");
    } catch (err) { setError("Network error."); }
    finally { setLoading(false); }
  };

  const handleRentPayment = async (month: string, year: number) => {
    try {
      setLoading(true);
      const amount = data.property.rentAmount;

      // 1. Create Real Razorpay Order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: amount, 
          receiptId: `rent_${month}_${year}_${localStorage.getItem("userId")}` 
        }),
      });
      const orderData = await orderRes.json();

      // 2. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "RentEase Monthly",
        description: `Rent for ${month} ${year}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. Verify Signature on Backend
          const verifyRes = await fetch("/api/payments/verify-rent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: localStorage.getItem("userId"),
              month,
              year,
              amount,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyRes.ok) {
            await fetchLedger(); // Refresh UI
          } else {
            alert("Payment signature verification failed.");
          }
        },
        prefill: { email: localStorage.getItem("userEmail") || "" },
        theme: { color: "#0052CC" },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Gateway error.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <>
      <Script id="razorpay-checkout" src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="p-6 md:p-12 max-w-6xl mx-auto">
        {/* ... Header and Overview Cards stay the same ... */}
        
        {/* DYNAMIC MONTHLY ROWS */}
        <div className="bg-white rounded-[48px] border border-gray-100 overflow-hidden shadow-sm">
          {data.ledger?.map((item: any, i: number) => (
            <div key={i} className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h4 className="font-bold text-[#1F2937] text-xl">{item.month} {item.year}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Due: ₹{item.amount?.toLocaleString()}</p>
              </div>

              {item.status === "Paid" ? (
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
                    <CheckCircle2 size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Vault Secured</span>
                  </div>
                  <button onClick={() => generateReceipt(item, data.property, "Aman Kumar")} className="p-4 text-gray-400 hover:text-blue-600">
                    <Download size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleRentPayment(item.month, item.year)}
                  className="bg-[#0052CC] text-white px-10 py-4 rounded-2xl font-bold text-xs flex items-center gap-3 shadow-xl"
                >
                  <CreditCard size={16} /> Pay Monthly Rent
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}