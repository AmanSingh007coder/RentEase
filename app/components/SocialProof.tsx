"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const testimonials = [
  {
    quote: "Saved me ₹8,000 in false damage claims. The side-by-side photos proved the wall was already cracked when I moved in.",
    author: "Rahul Kumar",
    role: "Tenant",
    location: "Bangalore",
    rating: 5
  },
  {
    quote: "Finally, a landlord who fixes things! I report issues with photos and he responds the same day. No more WhatsApp ghosting.",
    author: "Priya Sharma",
    role: "Tenant",
    location: "Mumbai",
    rating: 5
  },
  {
    quote: "Managing 5 properties used to be a documentation nightmare. RentEase keeps everything in one secure vault for my peace of mind.",
    author: "Mr. Gupta",
    role: "Landlord",
    location: "Delhi",
    rating: 5
  },
  {
    quote: "The 'locked' timestamps are a game changer. There's no room for arguments when the data is cryptographically verified.",
    author: "Ananya Iyer",
    role: "Property Manager",
    location: "Chennai",
    rating: 4.8
  },
  {
    quote: "I was skeptical at first, but after using RentEase for a year, I can't imagine going back. It's like having a digital witness for every rental transaction.",
    author: "Aman Kumar Singh",
    role: "Property Manager",
    location: "Jharkhand",
    rating: 4.7
  },
  {
    quote: "RentEase has transformed how I handle rentals. The transparency and accountability it provides have made my life so much easier.",
    author: "Shubham Verma",
    role: "Tenant",
    location: "Pune",
    rating: 4.6
  }
];

export default function SocialProof() {
  const [index, setIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update card width based on screen size + gap (24px for gap-6)
  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth < 768 ? 324 : 424; // 300+24 or 400+24
      setCardWidth(width);
    };
    
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const next = () => {
    if (index < testimonials.length - 1) setIndex(index + 1);
  };

  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const onDragEnd = (event: any, info: any) => {
    const threshold = 50;
    // If dragged left (negative x), go to next
    if (info.offset.x < -threshold && index < testimonials.length - 1) {
      setIndex(index + 1);
    } 
    // If dragged right (positive x), go to prev
    else if (info.offset.x > threshold && index > 0) {
      setIndex(index - 1);
    }
  };

  return (
    <section id="reviews" className="bg-[#F9FAFB] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
             <h2 className="text-4xl md:text-6xl font-bold text-[#1F2937] tracking-tighter mb-4">
               Trusted across <br /> the ecosystem
             </h2>
          </div>
          <div className="max-w-sm">
            <p className="text-gray-500 text-lg leading-relaxed">
              Join 500+ happy tenants and landlords who have eliminated deposit 
              disputes using our digital witness protocol.
            </p>
          </div>
        </div>

        {/* SLIDING CARDS CONTAINER */}
        <div className="relative overflow-visible" ref={containerRef}>
          <motion.div 
            drag="x"
            // Constraints ensure we can't drag beyond the first or last card
            dragConstraints={{ 
              left: -(cardWidth * (testimonials.length - 1)), 
              right: 0 
            }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
            className="flex gap-6 cursor-grab active:cursor-grabbing"
            animate={{ x: -(index * cardWidth) }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {testimonials.map((t, i) => (
              <motion.div 
                key={i}
                // FIXED: Responsive padding (p-6 on mobile) and min-width adjustments
                className="min-w-[300px] md:min-w-[400px] bg-white border border-gray-200 p-6 md:p-10 rounded-3xl shadow-sm flex flex-col justify-between h-[400px] md:h-[380px] hover:border-[#0052CC]/30 transition-colors select-none"
              >
                <div className="overflow-hidden">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, star) => (
                      <span key={star} className="text-[#0D9488]">★</span>
                    ))}
                  </div>
                  {/* FIXED: break-words and responsive text to prevent overflow */}
                  <p className="text-[#1F2937] text-lg md:text-xl font-medium leading-relaxed italic break-words">
                    "{t.quote}"
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="min-w-0">
                    <h4 className="font-bold text-[#1F2937] truncate">{t.author}</h4>
                    <p className="text-xs md:text-sm text-gray-500 truncate">{t.role} • {t.location}</p>
                  </div>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0052CC]/10 flex items-center justify-center ml-4">
                     <span className="text-[#0052CC] font-bold text-xs">{t.author[0]}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* NAVIGATION ARROWS */}
        <div className="flex justify-center mt-12 md:mt-16 gap-4">
          <button 
            onClick={prev}
            disabled={index === 0}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full border flex items-center justify-center transition-all active:scale-90 ${
              index === 0 
              ? 'border-gray-200 text-gray-300' 
              : 'border-gray-300 text-[#1F2937] hover:bg-white hover:shadow-lg'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={next}
            disabled={index === testimonials.length - 1}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full border flex items-center justify-center transition-all active:scale-90 ${
              index === testimonials.length - 1 
              ? 'border-gray-200 text-gray-300' 
              : 'border-gray-300 text-[#1F2937] hover:bg-white hover:shadow-lg'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
}