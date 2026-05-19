"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AboutExperts() {
  return (
    <section className="py-32 bg-slate-50/50 overflow-hidden relative">
      <style>{`
        @keyframes marquee-expert {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-expert {
          display: flex;
          width: max-content;
          animation: marquee-expert 30s linear infinite;
        }
        .animate-marquee-expert:hover {
          animation-play-state: paused;
        }
        .mask-gradient-expert {
          mask-image: linear-gradient(to right, transparent, white 10%, white 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, white 10%, white 90%, transparent);
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 mb-16">
        <div className="text-center max-w-2xl mx-auto">
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
      </div>

      {/* Infinite Scroll Container */}
      <div className="relative w-full mask-gradient-expert py-4">
        <div className="animate-marquee-expert gap-8 flex">
          {[0, 1].map((loopIdx) => (
            <div key={loopIdx} className="flex gap-8">
              {[
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
              ].map((expert, idx) => (
                <div
                  key={`expert-${loopIdx}-${idx}`}
                  className="w-[320px] md:w-[350px] bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] group hover:scale-[1.03] transition-all duration-500 shrink-0"
                >
                  {/* Image area with colored background */}
                  <div className={`relative ${expert.bgColor} flex items-end justify-center pt-6 overflow-hidden`} style={{ height: '260px' }}>
                    {/* Role badge — top right */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                      <span className="text-[11px] font-bold text-slate-700">{expert.spec}</span>
                    </div>
                    {/* Expert photo */}
                    <div className="relative w-48 h-56 flex-shrink-0">
                      <Image
                        src={expert.profileImage}
                        alt={expert.name}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
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
          ))}
        </div>
      </div>
    </section>
  );
}
