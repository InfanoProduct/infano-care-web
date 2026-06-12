'use client';

import Image from 'next/image';

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

      <div style={{ overflow: 'hidden', width: '100%' }}>
        <div className="news-scroll-track">
          {allImages.map((src, index) => (
            <div className="news-scroll-item" key={index}>
              <Image
                src={src}
                alt={`Media coverage ${(index % newsImages.length) + 1}`}
                width={190}
                height={100}
                style={{ objectFit: 'contain', display: 'block' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
