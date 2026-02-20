"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Bell, 
  Smartphone, 
  Download, 
  Trash2, 
  HelpCircle, 
  ChevronRight,
  User,
  Mail,
  Lock
} from "lucide-react";

export default function SettingsPage() {
  // MOCK DATA FOR FLATMATES
  const flatmates = [
    { name: "Priya Sharma", email: "priya@example.com", role: "Occupant", joined: "Feb 02, 2024" },
    { name: "Rahul Kumar", email: "rahul@example.com", role: "Occupant", joined: "Feb 05, 2024" },
  ];

  return (
    <div className="p-4 md:p-10 lg:p-12">
      {/* HEADER */}
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] tracking-tight">Settings & Management</h1>
        <p className="text-gray-400 font-medium mt-2">Manage your profile, flatmates, and data privacy.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: FLATMATES & PROFILE (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* FLATMATE MANAGEMENT (PRIMARY TENANT ONLY) */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-xl font-bold text-[#1F2937]">Flatmates</h3>
                <p className="text-xs text-gray-400 mt-1">Manage occupants for 123 MG Road.</p>
              </div>
              <button className="flex items-center gap-3 bg-[#0052CC] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                <UserPlus size={16} />
                Invite Flatmate
              </button>
            </div>

            <div className="p-4 space-y-2">
              {flatmates.map((member, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#0052CC] font-bold text-lg">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1F2937]">{member.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{member.role} • Joined {member.joined}</p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* PROFILE SETTINGS */}
          <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-[#1F2937] mb-8">Personal Information</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input type="text" defaultValue="Aman Kumar Singh" className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:bg-white focus:border-[#0052CC] transition-all text-sm font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input type="email" defaultValue="aman@example.com" className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:bg-white focus:border-[#0052CC] transition-all text-sm font-medium" />
                </div>
              </div>
              <div className="md:col-span-2">
                <button type="button" className="bg-[#1F2937] text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-black transition-all">
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: SECURITY & DATA (4 Cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* SECURITY & PRIVACY */}
          <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-[#1F2937] mb-6">Security & Privacy</h3>
            <div className="space-y-2">
              {[
                { icon: Lock, label: "Change Password", color: "text-blue-500" },
                { icon: Bell, label: "Notifications", color: "text-orange-500" },
                { icon: Smartphone, label: "PWA Settings", color: "text-purple-500" },
                { icon: Download, label: "Download My Data", color: "text-teal-500" },
              ].map((item, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <item.icon size={18} className={item.color} />
                    <span className="text-sm font-bold text-[#1F2937]">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1F2937] transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* HELP & SUPPORT */}
          <div className="bg-[#0052CC] rounded-[32px] p-8 text-white shadow-xl shadow-blue-500/20">
             <HelpCircle size={32} className="mb-6 opacity-50" />
             <h3 className="text-xl font-bold mb-2">Need help?</h3>
             <p className="text-blue-100 text-xs leading-relaxed mb-6">
               Check our student-renter FAQs or contact our support team for documentation assistance.
             </p>
             <button className="w-full py-4 bg-white text-[#0052CC] rounded-2xl font-bold text-xs hover:bg-blue-50 transition-all">
                Contact RentEase Support
             </button>
          </div>

          {/* DATA RETENTION COMPLIANCE */}
          <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
             <div className="flex items-center gap-3 mb-3">
                <Trash2 size={18} className="text-red-500" />
                <span className="text-sm font-bold text-red-700">Danger Zone</span>
             </div>
             <p className="text-[10px] text-red-600/70 leading-relaxed mb-4">
                Deleting your account will trigger the **DPDP (India)** data retention policy. Your metadata is stored for 2 years post-tenancy for legal reasons.
             </p>
             <button className="text-xs font-bold text-red-500 hover:underline uppercase tracking-widest">
                Request Account Deletion
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}