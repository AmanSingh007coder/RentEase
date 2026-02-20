"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Reviews", href: "#reviews" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled || isOpen
          ? "bg-white border-b border-gray-200 py-3 shadow-sm"
          : "bg-white py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* LOGO SECTION */}
        <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
          <div className="hidden md:block relative w-[220px] h-[50px]">
            <Image
              src="/desk.png"
              alt="RentEase Desktop Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
          <div className="block md:hidden relative w-[40px] h-[40px]">
            <Image
              src="/mob.png"
              alt="RentEase Mobile Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* CENTER LINKS - Desktop Only */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[#1F2937] font-medium text-sm hover:text-[#0052CC] transition-colors relative group px-3"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0052CC] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* RIGHT SIDE: CTA & HAMBURGER */}
        <div className="flex items-center space-x-4">
          <button className="hidden sm:block text-sm font-bold text-[#1F2937] px-4 py-2 hover:text-[#0052CC] transition-colors">
            Login
          </button>
          <button className="hidden sm:block bg-[#0052CC] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-[#1E40AF] transition-all transform active:scale-95">
            Get Started
          </button>

          {/* Hamburger Menu Toggle */}
          <button 
            className="md:hidden text-[#1F2937] p-1 outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg 
              className="h-7 w-7 transition-transform duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-semibold text-[#1F2937] hover:text-[#0052CC] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-100 flex flex-col space-y-4">
                <button className="w-full py-3 text-[#1F2937] font-bold border border-gray-200 rounded-xl">
                  Login
                </button>
                <button className="w-full py-4 bg-[#0052CC] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20">
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}