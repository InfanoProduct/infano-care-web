'use client';

import { useState } from 'react';
import { Book as BookIcon, ChevronRight } from 'lucide-react';

const TABLE_OF_CONTENTS = [
  { id: 1, title: "Chapter 1: Your Body, Your Story", pages: "1-45", desc: "Understanding puberty, periods, and physical change with accuracy and ease." },
  { id: 2, title: "Chapter 2: The Emotional Landscape", pages: "46-82", desc: "Feelings, moods, anxiety, and why your emotions are trying to tell you something." },
  { id: 3, title: "Chapter 3: The Relationship Web", pages: "83-120", desc: "Friendships, family, and how to build connections that lift you up." },
  { id: 4, title: "Chapter 4: You & The Screen", pages: "121-155", desc: "Social media, self-image, comparison, and creating a healthy digital life." },
  { id: 5, title: "Chapter 5: What Do YOU Want?", pages: "156-190", desc: "Goals, ambitions, discovering your strengths, and imagining your future." },
  { id: 6, title: "Chapter 6: Safety & Consent", pages: "191-230", desc: "Age-appropriate, empowering content on safety and personal boundaries." },
];

export function BookPreview() {
  const [activeChapter, setActiveChapter] = useState(0);

  return (
    <section id="read" className="py-32 bg-[#F0FDF4] relative overflow-hidden scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center mb-16">
          <span className="text-emerald-600 font-black uppercase tracking-[0.2em] text-[10px] mb-4 inline-block">Free Preview</span>
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight text-slate-900">
             Take a look <span className="text-emerald-500/40">inside.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
           {/* Left: Table of Contents */}
           <div className="lg:col-span-4 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                 <BookIcon size={16} /> Table of Contents
              </h3>
              {TABLE_OF_CONTENTS.map((chapter, i) => (
                <button
                  key={chapter.id}
                  onClick={() => setActiveChapter(i)}
                  className={`w-full text-left p-5 rounded-2xl transition-all border ${
                    activeChapter === i 
                      ? 'bg-white border-emerald-100 shadow-lg shadow-emerald-500/5' 
                      : 'bg-transparent border-transparent hover:bg-white/50 text-slate-500'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${activeChapter === i ? 'text-emerald-500' : 'text-slate-400'}`}>
                        Pages {chapter.pages}
                     </span>
                     {activeChapter === i && <ChevronRight size={14} className="text-emerald-500" />}
                  </div>
                  <h4 className={`font-bold font-heading tracking-tight ${activeChapter === i ? 'text-slate-900' : 'text-slate-500'}`}>{chapter.title}</h4>
                  {activeChapter === i && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed animate-in fade-in duration-500">{chapter.desc}</p>
                  )}
                </button>
              ))}
           </div>

           {/* Right: Reading UI Mockup */}
           <div className="lg:col-span-8">
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 border border-white overflow-hidden aspect-[1.4] relative group">
                 {/* Book Texture Overlay */}
                 <div className="absolute inset-y-0 left-1/2 w-px bg-slate-100 z-10 shadow-[0_0_10px_rgba(0,0,0,0.05)]" />
                 
                 <div className="grid grid-cols-2 h-full">
                    {/* Page Left */}
                    <div className="p-10 md:p-16 flex flex-col justify-between border-r border-slate-50">
                       <div className="space-y-4">
                          <div className="w-12 h-1 bg-emerald-100 rounded-full mb-8" />
                          <h4 className="text-xl font-bold font-heading text-slate-900 leading-tight tracking-tight">
                             {TABLE_OF_CONTENTS[activeChapter].title}
                          </h4>
                          <div className="space-y-2 pt-4">
                             <div className="h-2 w-full bg-slate-50 rounded-full" />
                             <div className="h-2 w-[90%] bg-slate-50 rounded-full" />
                             <div className="h-2 w-[95%] bg-slate-50 rounded-full" />
                             <div className="h-2 w-[80%] bg-slate-50 rounded-full" />
                             <div className="h-2 w-[85%] bg-slate-50 rounded-full" />
                          </div>
                       </div>
                       <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">Page {TABLE_OF_CONTENTS[activeChapter].pages.split('-')[0]}</span>
                    </div>

                    {/* Page Right */}
                    <div className="p-10 md:p-16 flex flex-col justify-between bg-slate-50/30">
                       <div className="space-y-6">
                          <div className="aspect-[4/3] bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-200">
                             <BookIcon size={48} />
                          </div>
                          <div className="space-y-2">
                             <div className="h-2 w-full bg-slate-50 rounded-full" />
                             <div className="h-2 w-full bg-slate-50 rounded-full" />
                             <div className="h-2 w-[60%] bg-slate-50 rounded-full" />
                          </div>
                       </div>
                       <span className="text-right text-[10px] font-black text-slate-300 tracking-widest uppercase">Page {parseInt(TABLE_OF_CONTENTS[activeChapter].pages.split('-')[0]) + 1}</span>
                    </div>
                 </div>

                 {/* Scroll Hint */}
                 <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="px-6 py-3 bg-slate-900 text-white rounded-full text-xs font-bold shadow-xl">
                       Scroll to read more...
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
