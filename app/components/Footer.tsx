"use client";

import Image from "next/image";
import Link from "next/link";
import { Twitter, Instagram, Facebook, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#1F2937] text-white">
      {/* 1. THE MOUNTAIN RISE CURVE */}
      {/* This convex arch rises from left to right to meet the CTA section */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform -translate-y-[99%]">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-[60px] md:h-[120px]"
          fill="#1F2937"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,120 C300,0 900,0 1200,120 H0 Z"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-12">
        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-16 gap-x-12 mb-24">
          
          {/* COLUMN 1 & 2: BRAND & LOGO */}
          <div className="col-span-2 lg:col-span-2">
            <div className="relative w-[220px] h-[55px] mb-8">
              <Image 
                src="/desk.png" 
                alt="RentEase Logo" 
                fill 
                className="object-contain object-left brightness-170" 
                priority
              />
            </div>
            <p className="text-gray-400 max-w-sm mb-10 text-lg leading-relaxed">
              Your digital witness in every rental transaction. Documenting 
              property states with cryptographic certainty.
            </p>
            
            {/* SOCIAL ICONS - Standard Professional Style */}
            <div className="flex gap-6">
              <Link href="#" className="text-gray-400 hover:text-[#0052CC] transition-colors border border-gray-500 rounded-xl p-1.5">
                <Twitter size={24} strokeWidth={1.5} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#cc006d] transition-colors border border-gray-500 rounded-xl p-1.5">
                <Instagram size={24} strokeWidth={1.5} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#0765f3] transition-colors border border-gray-500 rounded-xl p-1.5">
                <Facebook size={24} strokeWidth={1.5} />
              </Link>
              <Link href="mailto:support@rentease.com" className="text-gray-400 hover:text-[#cefa09] transition-colors border border-gray-500 rounded-xl p-1.5">
                <Mail size={24} strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          {/* COLUMN 3: PRODUCT */}
          <div>
            <h4 className="text-white font-bold mb-8 uppercase tracking-[0.2em] text-[10px]">Product</h4>
            <ul className="space-y-5 text-gray-400 text-sm font-medium">
              <li><Link href="#hero" className="hover:text-white transition-colors">Move-in Protocol</Link></li>
              <li><Link href="#problem" className="hover:text-white transition-colors">Dispute Settle</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">Maintenance Tracking</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Security Vault</Link></li>
            </ul>
          </div>

          {/* COLUMN 4: RESOURCES */}
          <div>
            <h4 className="text-white font-bold mb-8 uppercase tracking-[0.2em] text-[10px]">Resources</h4>
            <ul className="space-y-5 text-gray-400 text-sm font-medium">
              <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Legal Templates</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Rental Guide</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">API Access</Link></li>
            </ul>
          </div>

          {/* COLUMN 5: LEGAL */}
          <div>
            <h4 className="text-white font-bold mb-8 uppercase tracking-[0.2em] text-[10px]">Legal</h4>
            <ul className="space-y-5 text-gray-400 text-sm font-medium">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Trust & Safety</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Evidence Law</Link></li>
            </ul>
          </div>
        </div>

        {/* BOTTOM UTILITY BAR */}
        <div className="pt-10 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
             <p className="text-gray-500 text-xs">© 2026 RentEase Tech. All rights reserved.</p>
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D9488]/10 border border-[#0D9488]/20">
               <div className="w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-pulse" />
               <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-widest">Digital Witness Active</span>
             </div>
          </div>
          
          <div className="flex items-center gap-8">
            <p className="text-gray-500 text-[11px] uppercase tracking-widest font-semibold">Bengaluru • London • Dubai</p>
            <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
            <p className="text-gray-500 text-xs italic">Secure. Documented. Settled.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}