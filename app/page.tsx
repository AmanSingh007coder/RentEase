import IntroScreen from "./components/IntroScreen";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Problem from "./components/Problem";
import HowItWorks from "./components/HowItWorks";
import SocialProof from "./components/SocialProof";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-white">
      {/* 1. THE INTRO LAYER (2.5s duration) */}
      <IntroScreen />

      {/* 2. THE NAVIGATION (Sticky) */}
      <Navbar />

      {/* 3. THE LANDING PAGE SECTIONS */}
      <div className="flex flex-col w-full">
        
        {/* SECTION 2: HERO SECTION */}
        <section id="hero" className="min-h-screen pt-20">
            <Hero />
        </section>

        {/* SECTION 3: THE PROBLEM */}
        <section id="problem" className="bg-[#F9FAFB] py-20">
           <Problem /> 
        </section>

        {/* SECTION 4: HOW IT WORKS */}
        <section id="how-it-works" className="py-24 bg-[#F9FAFB]">
           <HowItWorks />
        </section>

        {/* SECTION 5: SOCIAL PROOF */}
        <section id="about" className="bg-[#F9FAFB] py-10">
            <SocialProof /> 
        </section>

        {/* SECTION 6: FINAL CTA */}
        <section className="py-10 bg-[#F9FAFB]">
            <FinalCTA /> 
        </section>

        {/* SECTION 7: FOOTER */}
        <footer className="bg-[#1F2937] py-12">
         <Footer /> 
        </footer>

      </div>
    </main>
  );
}