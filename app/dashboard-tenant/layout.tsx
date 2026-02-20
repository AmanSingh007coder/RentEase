"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bell, Camera, Wrench, CreditCard, Settings, LogOut, Loader2 } from "lucide-react";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hasProperty, setHasProperty] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkTenancy = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        const res = await fetch(`/api/auth/get-user?email=${email}`);
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          // ✅ If propertyId is NULL, Sidebar stays hidden
          setHasProperty(Boolean(data.user.propertyId)); 
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    checkTenancy();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#1F2937]"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* ✅ SIDEBAR - Controlled by hasProperty state */}
      {hasProperty && (
        <aside className="hidden md:flex w-72 bg-[#1F2937] flex-col justify-between p-6 fixed inset-y-0 left-0 z-50 rounded-r-[40px] shadow-2xl">
          <div>
            <div className="mb-12 px-2"><Image src="/desk.png" alt="Logo" width={150} height={40} className="brightness-200" /></div>
            <nav className="space-y-2">
              {[
                { name: "Overview", href: "/dashboard-tenant", icon: LayoutDashboard },
                { name: "Activity", href: "/dashboard-tenant/activity", icon: Bell },
                { name: "Witness", href: "/dashboard-tenant/witness", icon: Camera },
                { name: "Maintenance", href: "/dashboard-tenant/maintenance", icon: Wrench },
                { name: "Payments", href: "/dashboard-tenant/payments", icon: CreditCard },
                { name: "Settings", href: "/dashboard-tenant/settings", icon: Settings },
                { name: "Exit", href: "/dashboard-tenant/exit", icon: LogOut },
              ].map((item) => (
                <Link key={item.name} href={item.href} className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${pathname === item.href ? "bg-[#0052CC] text-white shadow-lg" : "text-gray-400 hover:text-white"}`}>
                  <item.icon size={22} />
                  <span className="font-bold text-sm tracking-tight">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="w-full flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-red-500 font-bold transition-all"><LogOut size={18} /> Sign Out</button>
        </aside>
      )}

      {/* Main Content Area - Expands to full width if no sidebar */}
      <main className={`flex-1 ${hasProperty ? "md:ml-72" : "w-full"} min-h-screen`}>
        {children}
      </main>
    </div>
  );
}