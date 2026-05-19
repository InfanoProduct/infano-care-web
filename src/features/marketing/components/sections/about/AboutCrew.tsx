"use client";

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AboutCrew() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let intervalId: NodeJS.Timeout;

    const startAutoScroll = () => {
      intervalId = setInterval(() => {
        if (isHovered) return;

        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }, 3000);
    };

    startAutoScroll();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isHovered]);

  const handlePrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-32 bg-slate-50/80">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight text-slate-900"
          >
            Crew <span className="text-primary italic">Behind the Scene</span>
          </motion.h2>
          <p className="text-lg text-slate-500 font-medium max-w-2xl">
            Meet the dreamers, builders, and believers working tirelessly to create a safer, kinder world for every girl.
          </p>
        </div>

        {/* Crew Members Autoscrolling Row */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-8 scrollbar-none [&::-webkit-scrollbar]:hidden"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {[
            { name: 'Sanat Kumar', role: 'Founder & CEO', image: '/experts/roushi.jpeg' },
            { name: 'Priya Verma', role: 'Operations Head', image: '/experts/nikhil.jpeg' },
            { name: 'Dr. Sameer', role: 'Medical Director', image: '/experts/expert.jpg' },
            { name: 'Ananya Rao', role: 'Community Manager', image: '/experts/expert.jpg' },
            { name: 'Rohan Gupta', role: 'Tech Lead', image: '/experts/expert.jpg' },
            { name: 'Sonal Singh', role: 'Content Strategist', image: '/experts/expert.jpg' },
            { name: 'Vikram Mehra', role: 'Product Designer', image: '/experts/expert.jpg' },
            { name: 'Nisha Kapoor', role: 'User Research', image: '/experts/expert.jpg' },
            { name: 'Arjun Das', role: 'Growth Lead', image: '/experts/expert.jpg' },
            { name: 'Meera Iyer', role: 'Partnerships', image: '/experts/expert.jpg' },
          ].map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="flex-shrink-0 w-[240px] md:w-[260px] snap-start group bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500"
            >
              <div className="p-3 pb-0">
                <div className="relative aspect-square rounded-2xl overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                </div>
              </div>
              <div className="p-5">
                <h4 className="text-sm font-bold text-slate-900 mb-0.5 leading-tight">{member.name}</h4>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{member.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Manual Carousel Slide Navigation Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
