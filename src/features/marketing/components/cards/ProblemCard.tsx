'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, User, Heart, MessageCircle, BookOpen, AlertCircle, Droplets, Compass, GraduationCap, Sparkles, Zap, Eye } from 'lucide-react';
import { ProblemItem } from '../../types';

interface ProblemCardProps extends ProblemItem {
  index: number;
}

const getTagIcon = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes('mental')) return <Brain size={10} />;
  if (t.includes('adolescence')) return <User size={10} />;
  if (t.includes('esteem')) return <Heart size={10} />;
  if (t.includes('support')) return <MessageCircle size={10} />;
  if (t.includes('literacy')) return <BookOpen size={10} />;
  if (t.includes('gap')) return <AlertCircle size={10} />;
  if (t.includes('menstrual')) return <Droplets size={10} />;
  if (t.includes('guidance')) return <Compass size={10} />;
  if (t.includes('education')) return <GraduationCap size={10} />;
  if (t.includes('wellness')) return <Sparkles size={10} />;
  if (t.includes('empowerment')) return <Zap size={10} />;
  if (t.includes('awareness')) return <Eye size={10} />;
  return <Sparkles size={10} />;
};

export function ProblemCard({ title, desc, color, image, link, index, tags }: ProblemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      className={`${color} rounded-[2.5rem] relative overflow-hidden hover:shadow-[0_40px_80px_-15px_rgba(124,58,237,0.15)] p-8 md:p-10 border border-white/50 h-full flex flex-col group`}
    >
      {/* Background Index Number */}
      <span className="absolute -top-6 -left-6 text-[12rem] font-bold text-black/5 leading-none select-none group-hover:text-black/[0.08] transition-all duration-700 pointer-events-none">
        0{index + 1}
      </span>

      <div className='flex flex-col relative z-10 gap-6 md:gap-8 h-full'>
        <h3 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 tracking-tight leading-tight">{title}</h3>
        
        <p className="text-slate-500 leading-relaxed text-base md:text-lg font-medium">
          {desc}
        </p>

        <div className="flex flex-wrap gap-2">
          {tags?.map((tag, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 backdrop-blur-md text-slate-900 text-[10px] font-bold tracking-wide rounded-full border border-white/50 shadow-sm"
            >
              {getTagIcon(tag)}
              {tag}
            </span>
          ))}
        </div>

        {/* Image Container */}
        <div className="mt-auto -mx-8 -mb-8 md:-mx-10 md:-mb-10 overflow-hidden rounded-b-[2.5rem]">
          <Image
            src={image}
            alt={title}
            width={600}
            height={400}
            className="w-full h-auto object-contain object-bottom transition-transform duration-700 group-hover:scale-110"
            priority={index === 0}
          />
        </div>
      </div>
    </motion.div>
  );
}
