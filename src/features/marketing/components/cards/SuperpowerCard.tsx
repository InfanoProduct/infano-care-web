'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { SuperpowerItem } from '../../types';

interface SuperpowerCardProps extends SuperpowerItem {
  index: number;
}

const themes = [
  { bg: 'bg-[#FDF4FF]', border: 'border-purple-100', text: 'text-purple-600', accent: 'bg-purple-50' }, 
  { bg: 'bg-[#F0FDF4]', border: 'border-emerald-100', text: 'text-emerald-600', accent: 'bg-emerald-50' },
  { bg: 'bg-[#F0F9FF]', border: 'border-sky-100', text: 'text-sky-600', accent: 'bg-sky-50' },
  { bg: 'bg-[#FFF1F2]', border: 'border-rose-100', text: 'text-rose-600', accent: 'bg-rose-50' },
  { bg: 'bg-[#FFFBEB]', border: 'border-amber-100', text: 'text-amber-600', accent: 'bg-amber-50' },
  { bg: 'bg-[#F5F3FF]', border: 'border-indigo-100', text: 'text-indigo-600', accent: 'bg-indigo-50' },
];

export function SuperpowerCard({ title, desc, features, image, link, index }: SuperpowerCardProps) {
  const theme = themes[index % themes.length];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`${theme.bg} rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-700 flex flex-col justify-start gap-2 min-h-[360px] md:min-h-[380px] border ${theme.border}`}
    >
      <div className="relative z-10">
        <div className="max-w-[85%] mb-6">
           <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight group-hover:text-primary transition-colors duration-500 mb-4">{title}</h3>
           <p className="text-slate-500 leading-relaxed text-xs md:text-sm font-medium">
            {desc}
          </p>
        </div>
        
        {/* Features List - Single Column */}
        <div className="flex flex-col gap-y-3.5 max-w-[60%] md:max-w-[50%]">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3">
               <div className={`w-8 h-8 rounded-lg ${theme.accent} flex items-center justify-center ${theme.text} shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0`}>
                  <div className="scale-90">{feature.icon}</div>
               </div>
               <span className="text-xs md:text-sm font-medium text-slate-500 tracking-tight">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Subject Image - More integrated */}
      <div className="absolute right-[-8%] bottom-[-5%] w-[55%] h-[65%] transition-all duration-1000 group-hover:scale-110 group-hover:-rotate-3 origin-bottom-right">
        <div className="relative w-full h-full">
           <div className={`absolute inset-0 ${theme.accent} blur-[100px] rounded-full scale-75 opacity-40 z-0`} />
           <Image 
            src={image} 
            alt={title}
            fill
            className="object-contain drop-shadow-2xl z-10"
          />
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/40 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
}
