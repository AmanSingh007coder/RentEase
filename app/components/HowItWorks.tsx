"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const steps = [
  {
    title: "Document Move-In",
    description: "Take timestamped photos of every room. Both tenant and landlord approve the initial state. Once verified, photos are cryptographically locked in the cloud forever.",
    color: "#0052CC",
    image: "/step1.jpg", 
  },
  {
    title: "Track Maintenance",
    description: "Report issues directly with photo evidence. Landlords get notified instantly via WhatsApp. Track the repair progress from 'Reported' to 'Resolved' with a clear paper trail.",
    color: "#0D9488",
    image: "/step2.png",
  },
  {
    title: "Settle Deposits Fairly",
    description: "At move-out, compare the original photos with the current state side-by-side. Our digital witness proves what's normal wear and tear and what's actual damage.",
    color: "#0052CC",
    image: "/step3.jpg",
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#F9FAFB] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* SECTION HEADING */}
        <div className="text-center mb-14">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-4"
          >
            How RentEase Works
          </motion.h2>
          <div className="w-20 h-1.5 bg-[#0052CC] mx-auto rounded-full" />
        </div>

        <div className="space-y-20">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16 md:gap-32`}
            >
              {/* TEXT CONTENT */}
              <div className="flex-1 text-center md:text-left">
                <div 
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-8 text-white font-bold text-2xl shadow-xl"
                  style={{ backgroundColor: step.color }}
                >
                  0{index + 1}
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-[#1F2937] mb-6 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-lg md:text-xl leading-relaxed mb-10">
                  {step.description}
                </p>
                <button 
                  className="group px-8 py-4 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-3 mx-auto md:mx-0"
                  style={{ backgroundColor: step.color }}
                >
                  Learn More
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>

              {/* ISOMETRIC IMAGE PLATFORM */}
              <div className="flex-1 w-full flex justify-center relative">
                {/* Visual Background Glow */}
                <div 
                  className="absolute inset-0 m-auto w-[70%] h-[50%] blur-[100px] opacity-10"
                  style={{ backgroundColor: step.color }}
                />

                <div className="relative w-full max-w-[550px] aspect-square">
                  {/* The Floating Screen */}
                  <motion.div 
                    animate={{ 
                      y: [0, -15, 0],
                      rotateX: [15, 15, 15], // Adjusted for better image visibility
                      rotateZ: [-10, -10, -10]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 m-auto w-[90%] h-[70%] rounded-[40px] bg-white shadow-2xl overflow-hidden border border-gray-100"
                    style={{ 
                      transform: 'rotateX(15deg) rotateZ(-10deg)',
                      transformStyle: 'preserve-3d',
                      boxShadow: '30px 30px 60px rgba(0,0,0,0.12), -10px -10px 40px rgba(0,0,0,0.02)'
                    }}
                  >
                    {/* The Image inside the platform */}
                    <div className="relative w-full h-full p-3 bg-gray-50">
                      <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-white shadow-inner">
                        <Image 
                          src={step.image}
                          alt={step.title}
                          fill
                          className="object-cover"
                        />
                        {/* Glass Overlay to make it look like a screen */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}