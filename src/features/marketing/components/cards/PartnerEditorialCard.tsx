'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PartnerEditorialItem } from '../../types';

export function PartnerEditorialCard({ title, desc, features, image, link, icon, themeColor }: PartnerEditorialItem) {
  const dotColor = themeColor.includes('emerald') ? 'bg-emerald-400' : 'bg-rose-300';
  const underlineColor = themeColor.includes('emerald') ? 'bg-emerald-400' : 'bg-rose-300';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all duration-700 flex flex-col h-full border border-slate-100/50"
    >
      {/* Editorial Image Header */}
      <div className="relative h-[260px] overflow-hidden">
        <Image 
          src={image} 
          alt={title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute top-6 left-6 w-12 h-12 bg-white/95 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl shadow-xl shadow-black/5 z-20">
           {icon}
        </div>
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700" />
      </div>

      {/* Content Area */}
      <div className="p-8 md:p-10 flex flex-col flex-grow">
        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 tracking-tight leading-none group-hover:text-primary transition-colors duration-500">{title}</h3>
        <p className="text-slate-500 mb-8 leading-relaxed font-medium text-base">
          {desc}
        </p>

        {/* Minimalist Feature List */}
        <div className="space-y-4 mb-8">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-4 group/item">
               <div className={`w-2 h-2 rounded-full ${dotColor} transition-all duration-500 group-hover/item:scale-150 group-hover/item:shadow-[0_0_15px_rgba(0,0,0,0.1)]`} />
               <span className="text-sm font-medium text-slate-500 opacity-80 group-hover/item:opacity-100 transition-opacity">{feature.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-50">
          <Link href={link} className="inline-flex items-center gap-4 text-slate-900 font-bold group/link text-base">
            <span className="relative">
               Explore Details
               <div className={`absolute -bottom-1 left-0 w-full h-0.5 ${underlineColor} scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left rounded-full`} />
            </span>
            <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center transition-all duration-500 group-hover/link:bg-slate-900 group-hover/link:text-white group-hover/link:border-slate-900 group-hover/link:rotate-[-45deg]">
               <ArrowRight size={18} className="transition-transform group-hover/link:translate-x-0.5" />
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
