'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const newsImages = [
  '/news/1.png',
  '/news/2.png',
  '/news/3.png',
  '/news/4.png',
  '/news/5.png',
  '/news/6.png',
];

const allImages = [...newsImages, ...newsImages];

export function NewsScrollerSection() {
  return (
    <section
      style={{
        padding: '80px 0 25px',
        overflow: 'hidden',
        background: '#fff',
        width: '100%',
      }}
    >
      <style>{`
        @keyframes news-scroll-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .news-scroll-track {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          gap: 56px;
          width: max-content;
          animation: news-scroll-left 24s linear infinite;
          will-change: transform;
        }
        .news-scroll-track:hover {
          animation-play-state: paused;
        }
        .news-scroll-item {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }
        .news-scroll-item:hover {
          opacity: 1;
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4"
          >
            Media
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4 leading-tight tracking-tight text-slate-900">
            In the <span className="text-primary">Spotlight</span>
          </h2>
          <p className="text-base md:text-md text-slate-500 leading-relaxed font-medium">
            Leading national media platforms are talking about the change we are bringing to girls across India.
          </p>
          <div className="mt-8 h-1 w-24 bg-primary/20 mx-auto rounded-full" />
        </div>
      </div>

      <div style={{ overflow: 'hidden', width: '100%' }}>
        <div className="news-scroll-track">
          {allImages.map((src, index) => (
            <div className="news-scroll-item" key={index}>
              <Image
                src={src}
                alt={`Media coverage ${(index % newsImages.length) + 1}`}
                width={190}
                height={100}
                style={{ objectFit: 'contain', display: 'block', width: '190px', height: '100px' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
