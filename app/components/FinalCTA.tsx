"use client";

import { motion } from "framer-motion";

export default function FinalCTA() {
  return (
    <section id="contact" className="bg-[#F9FAFB] overflow-hidden mb-30">
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        {/* HEADING */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold tracking-tighter mb-8"
          style={{ color: '#1F2937' }}
        >
          Protect your peace of mind, <br className="hidden md:block" /> 
          one photo at a time.
        </motion.h2>

        {/* CONTENT */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-gray-500 mb-12 leading-relaxed max-w-2xl mx-auto"
        >
          Whether you are a tenant moving in or a landlord managing multiple properties, 
          RentEase provides the digital paper trail you need to eliminate disputes.
        </motion.p>

        {/* TWO BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* PRIMARY BUTTON */}
          <button
            className="w-full sm:w-auto text-white px-10 py-5 rounded-4xl font-bold text-lg hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-blue-500/20"
            style={{ backgroundColor: '#0052CC' }}
          >
            Get Started Free
          </button>

          {/* SECONDARY BUTTON */}
          <button
            className="w-full sm:w-auto px-10 py-5 rounded-4xl font-bold text-lg border border-gray-200 hover:bg-gray-200 transition-all active:scale-95"
            style={{ color: '#1F2937' }}
          >
            Explore Features →
          </button>
        </motion.div>

        {/* TRUST SIGNAL */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-sm font-medium text-gray-400"
        >
          No credit card required • Join 5,000+ verified rentals
        </motion.p>

      </div>
    </section>
  );
}