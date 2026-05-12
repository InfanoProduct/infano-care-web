'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ProblemItem } from '../../types';

interface ProblemCardProps extends ProblemItem {
  index: number;
}

export function ProblemCard({ title, desc, color, image, link, index }: ProblemCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      className={`${color} rounded-[3rem] p-10 md:p-12 relative overflow-hidden group hover:shadow-[0_40px_80px_-15px_rgba(124,58,237,0.15)] transition-all duration-700 flex flex-col justify-center min-h-[420px] border border-white/50`}
    >
      {/* Background Index Number */}
      <span className="absolute -top-4 -left-4 text-[12rem] font-bold text-black/5 leading-none select-none group-hover:text-black/[0.08] transition-colors duration-700">
        0{index + 1}
      </span>

      <div className="relative z-10 w-[65%]">
        <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-none">{title}</h3>
        <p className="text-slate-800/70 mb-10 leading-relaxed text-base md:text-lg font-medium">
          {desc}
        </p>
        <Link href={link} className="inline-flex items-center gap-3 font-bold text-slate-900 group/link text-lg uppercase tracking-wide">
          Learn More 
          <div className="w-10 h-10 rounded-full border-2 border-slate-900 flex items-center justify-center transition-all group-hover/link:bg-slate-900 group-hover/link:text-white">
            <ArrowRight size={20} className="transition-transform group-hover/link:translate-x-1" />
          </div>
        </Link>
      </div>
      
      <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[55%] h-[90%] transition-all duration-1000 group-hover:scale-110 group-hover:-rotate-6 group-hover:translate-x-4">
        <div className="relative w-full h-full flex items-center justify-center">
           <div className="absolute inset-0 bg-white/40 blur-[80px] rounded-full scale-90 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
           <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-full h-full"
           >
             <Image 
              src={image} 
              alt={title}
              fill
              className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.2)]"
            />
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
