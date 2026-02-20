"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function IntroScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Total duration: 2.5 seconds (Matching your roadmap)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F9FAFB]"
        >
          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <div className="relative w-24 h-24 mb-4">
              <Image
                src="/DesktopLogo.png" // Using the compact logo for the splash
                alt="RentEase Logo"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Text Animation */}
            <motion.h1
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-3xl font-bold tracking-tight text-[#1F2937]"
            >
              RentEase
            </motion.h1>
            
            {/* Subtle Tagline Fade */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-2 text-[#0D9488] font-medium text-sm tracking-widest uppercase"
            >
              Document. Track. Settle.
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}