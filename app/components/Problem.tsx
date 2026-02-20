"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Problem() {
  // Define your image paths here
  const ISSUE_1 = "/issue1.jpg";
  const ISSUE_2 = "/issue2.jpg";
  const SOLUTION_1 = "/solution1.jpg";
  const SOLUTION_2 = "/solution2.jpg";

  return (
    <section id="about" className="py-0" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADING */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: '#1F2937' }}
          >
            Renting shouldn't be a gamble
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            See the difference between the old, chaotic way and the new, documented way.
          </motion.p>
        </div>

        {/* MAIN COMPARISON CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm"
        >
          {/* Two-column grid split by a subtle vertical line on desktop */}
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            
            {/* LEFT COLUMN: The Issues (Without RentEase) */}
            <div className="p-8 md:p-20 bg-gray-50/30">
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#1F2937' }}>
                Without RentEase: The Issues
              </h3>
              <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                Relying on memory and verbal agreements leads to lost deposits, ignored maintenance requests, and constant stress.
              </p>

              {/* Image Grid for Issues */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="relative aspect-square rounded-2xl border border-gray-200 bg-gray-100 overflow-hidden shadow-inner">
                  <Image 
                    src={ISSUE_1}
                    alt="Renting issue representation 1"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square rounded-2xl border border-gray-200 bg-gray-100 overflow-hidden shadow-inner">
                  <Image 
                    src={ISSUE_2}
                    alt="Renting issue representation 2"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: The Solution (With RentEase) */}
            <div className="p-8 md:p-20 bg-white">
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#0D9488' }}>
                With RentEase: The Solution
              </h3>
              <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                Our platform provides a secure, timestamped digital paper trail for every photo, request, and agreement with full transparency and accountability.
              </p>

              {/* Image Grid for Solutions */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="relative aspect-square rounded-2xl border-2 border-blue-50 bg-blue-50/10 overflow-hidden shadow-inner">
                  <Image 
                    src={SOLUTION_1}
                    alt="RentEase solution representation 1"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square rounded-2xl border-2 border-blue-50 bg-blue-50/10 overflow-hidden shadow-inner">
                  <Image 
                    src={SOLUTION_2}
                    alt="RentEase solution representation 2"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}