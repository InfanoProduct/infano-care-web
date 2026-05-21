"use client";

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AboutExperts() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const isInteracting = useRef<boolean>(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speed = 0.8; // Smooth, premium marquee speed (pixels per frame)

  const animate = () => {
    if (!scrollRef.current || isInteracting.current) return;

    const { scrollLeft, scrollWidth } = scrollRef.current;
    const halfWidth = scrollWidth / 2;

    let nextScrollLeft = scrollLeft + speed;

    if (nextScrollLeft >= halfWidth) {
      nextScrollLeft = 0;
    }

    scrollRef.current.scrollLeft = nextScrollLeft;
    animationRef.current = requestAnimationFrame(animate);
  };

  const startScrolling = () => {
    isInteracting.current = false;
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  const stopScrolling = () => {
    isInteracting.current = true;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth } = scrollRef.current;
      const halfWidth = scrollWidth / 2;
      
      // If we cross the halfway mark, seamlessly jump back to the identical item in the first half
      if (scrollLeft >= halfWidth) {
        scrollRef.current.scrollLeft = scrollLeft - halfWidth;
      }
    }
  };

  // Function to schedule resuming autoplay after manual interaction
  const scheduleResume = (delay: number) => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      startScrolling();
    }, delay);
  };

  useEffect(() => {
    // Start marquee autoplay on mount
    startScrolling();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      stopScrolling();
      
      const cardWidth = 350 + 32; // Card width + gap
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      
      // Pause autoplay for 5 seconds after manual chevron click
      scheduleResume(5000);
    }
  };

  const handleTouchStart = () => {
    stopScrolling();
  };

  const handleTouchEnd = () => {
    // Resume autoplay 4 seconds after swipe finishes
    scheduleResume(4000);
  };

  const handleMouseEnter = () => {
    stopScrolling();
  };

  const handleMouseLeave = () => {
    // Resume marquee if user isn't holding touch
    startScrolling();
  };

  const experts = [
    {
      name: 'Dr. Isha Kapoor',
      qual: 'Gynaecology',
      spec: 'Menstrual Health Specialist',
      quote: 'Helping young girls embrace their changing bodies with confidence and zero hesitation is my core focus.',
      profileImage: "/expert-1.png",
      bgColor: 'bg-[#F2A7C3]',
    },
    {
      name: 'Jasika Makhija',
      qual: 'Dietetics',
      spec: 'Clinical Nutritionist',
      quote: 'Good nutrition is the foundation of self-confidence. I help girls build healthy relationships with food so they can shine from the inside out.',
      profileImage: "/expert-2.png",
      bgColor: 'bg-[#B5D8F7]',
    },
    {
      name: 'Ms. Gazal Luthra',
      qual: 'Psychotherapist',
      spec: 'Counselling Psychologist & Psychotherapist',
      quote: 'As a counselling psychologist, I support adolescent girls in understanding and managing their emotions during a crucial stage of their development.',
      profileImage: "/expert-3.png",
      bgColor: 'bg-[#C3E8C8]',
    },
    {
      name: 'Shipra Chawla',
      qual: '',
      spec: 'Soft Skills & communication coach.',
      quote: 'With over 15 years of experience, she has trained 1500+ students in communication, soft skills, and life skills.',
      profileImage: "/expert-4.png",
      bgColor: 'bg-[#FFE2E2]',
    },
  ];

  // We duplicate the list to make the scroll seamless and infinite
  const duplicatedExperts = [...experts, ...experts];

  return (
    <section className="py-32 bg-slate-50/50 overflow-hidden relative">
      <style>{`
        .mask-gradient-expert {
          mask-image: linear-gradient(to right, transparent, white 10%, white 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, white 10%, white 90%, transparent);
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight text-slate-900"
            >
              Meet Our <span className="text-primary">Expert Council</span>
            </motion.h2>
            <p className="text-lg text-slate-500 font-medium">
              Everything on Infano.care is developed with, and reviewed by, qualified professionals in their fields.
            </p>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex gap-3 shrink-0 self-start md:self-end z-20">
            <button
              onClick={() => scroll('left')}
              className="w-14 h-14 rounded-full border border-slate-200 bg-white hover:bg-primary hover:border-primary hover:text-white text-slate-600 flex items-center justify-center transition-all duration-300 shadow-md shadow-slate-900/5 active:scale-95 group"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-14 h-14 rounded-full border border-slate-200 bg-white hover:bg-primary hover:border-primary hover:text-white text-slate-600 flex items-center justify-center transition-all duration-300 shadow-md shadow-slate-900/5 active:scale-95 group"
              aria-label="Scroll Right"
            >
              <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Infinite Autoplay & Interactive Scroll Container */}
      <div className="relative w-full mask-gradient-expert py-4">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex gap-8 overflow-x-auto scrollbar-none px-6 md:px-12 lg:px-24"
        >
          {duplicatedExperts.map((expert, idx) => (
            <div
              key={`expert-${idx}`}
              className="w-[300px] sm:w-[320px] md:w-[350px] bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] group hover:scale-[1.03] transition-all duration-500 shrink-0 mb-4"
            >
              {/* Image area with colored background */}
              <div className={`relative ${expert.bgColor} flex items-end justify-center pt-6 overflow-hidden`} style={{ height: '260px' }}>
                {/* Role badge — top right */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm z-10">
                  <span className="text-[11px] font-bold text-slate-700">{expert.spec}</span>
                </div>
                {/* Expert photo */}
                <div className="relative w-48 h-56 flex-shrink-0">
                  <Image
                    src={expert.profileImage}
                    alt={expert.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700 animate-in fade-in zoom-in duration-500"
                  />
                </div>
              </div>

              {/* Content area */}
              <div className="p-6 whitespace-normal">
                <h4 className="text-lg font-bold font-heading text-slate-900 mb-0.5 tracking-tight">
                  {expert.name} {expert.qual && <span className="font-medium text-slate-500">, {expert.qual}</span>}
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed mt-2 font-medium">
                  "{expert.quote}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
