'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function PartnershipBanner() {
  return (
    <section className="py-32 relative overflow-hidden bg-[#2D1B4D]">
      {/* Thematic Image Overlay with Gradient */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B4D] via-[#4A2B8A] to-[#2D1B4D] mix-blend-multiply opacity-90" />
         <Image 
          src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80" 
          alt="School environment"
          fill
          className="object-cover mix-blend-overlay opacity-30"
          sizes="100vw"
         />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-white rounded-[3rem] p-10 md:p-16 text-center shadow-[0_40px_80px_rgba(0,0,0,0.3)]"
        >
          {/* Highlight Badges */}
          <div className="flex flex-wrap justify-center gap-10 mb-12">
             {[
               { label: "India-Wide", value: "100+ Schools" },
               { label: "Expert-Backed", value: "Verified Impact" },
               { label: "Curriculum", value: "Ready to Use" }
             ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                   <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-2 opacity-50">{item.label}</span>
                   <span className="text-slate-900 font-bold text-base">{item.value}</span>
                </div>
             ))}
          </div>

          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-8 text-slate-900 leading-[1.15] tracking-tight">
            India's most <span className="text-primary">forward-thinking</span> <br /> girls' wellness movement.
          </h2>
          <p className="text-base text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Join our growing network of partner schools. Easy onboarding, full curriculum support, and measurable impact for every girl.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/contact" className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold text-base hover:bg-primary transition-all shadow-xl active:scale-95 group">
              Apply for Partnership <ArrowRight className="inline-block ml-2 transition-transform group-hover:translate-x-1" size={18} />
            </Link>
            <Link href="#" className="px-10 py-4 bg-transparent border border-slate-200 text-slate-900 rounded-full font-bold text-base hover:bg-slate-50 transition-all active:scale-95">
              Download Info Pack
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
