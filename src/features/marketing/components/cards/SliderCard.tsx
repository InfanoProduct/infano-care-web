'use client';

import Image from 'next/image';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { BookOpen, Users, Star, ChevronRight } from 'lucide-react';
import { SliderCourse } from '../../types';

interface SliderCardProps {
  card: SliderCourse;
  index: number;
  isFirst: boolean;
  onDragEnd: () => void;
  onClick: () => void;
}

const bgColors: Record<number, string> = {
  1: 'bg-[#FDF4FF] border-purple-100', // Lavender
  2: 'bg-[#F0FDF4] border-emerald-100', // Emerald
  3: 'bg-[#F0F9FF] border-sky-100',     // Sky
};

export function SliderCard({ card, index, isFirst, onDragEnd, onClick }: SliderCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -120, 0, 120, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: unknown, info: import('framer-motion').PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      onDragEnd();
    }
  };

  const bgColor = bgColors[card.id] || 'bg-white border-slate-100';

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
        zIndex: 50 - index,
        willChange: 'transform',
      }}
      drag={isFirst ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      animate={{
        scale: 1 - index * 0.05,
        y: index * 12,
        x: index * 14,
        rotate: index * 2,
        opacity: 1 - index * 0.2,
        zIndex: 50 - index
      }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        mass: 0.8,
      }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className={`glass-card p-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] h-full flex flex-col gap-4 border ${bgColor}`} style={{ contain: 'layout style' }}>
        <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden">
          <Image
            src={card.image}
            alt={card.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={isFirst}
            unoptimized
          />
        </div>

        <div className="flex items-center gap-4 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen size={10} />
            </div>
            {card.episodes} Episodes
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <Users size={10} />
            </div>
            {card.students}+ Students Empowered
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 leading-tight">{card.title}</h3>
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
          {card.desc}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100/60">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={10} className="text-yellow-500 fill-yellow-500" />
                ))}
                <span className="text-[9px] font-bold text-slate-400 ml-1">({card.reviews})</span>
              </div>
              <div className="text-lg font-bold text-slate-900"> Free
                <span className="text-xs text-slate-400 line-through font-normal ml-1">₹ {card.price} /-</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-primary hover:gap-2 transition-all cursor-pointer">
              LEARN MORE <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
