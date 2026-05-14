'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, BookOpen, ShoppingCart, ChevronRight, Book as BookIcon, Users, Gift } from 'lucide-react';
import { ShopService, Book } from '@/services/shop.service';

const TABLE_OF_CONTENTS = [
  { id: 1, title: "Chapter 1: Your Body, Your Story", pages: "1-45", desc: "Understanding puberty, periods, and physical change with accuracy and ease." },
  { id: 2, title: "Chapter 2: The Emotional Landscape", pages: "46-82", desc: "Feelings, moods, anxiety, and why your emotions are trying to tell you something." },
  { id: 3, title: "Chapter 3: The Relationship Web", pages: "83-120", desc: "Friendships, family, and how to build connections that lift you up." },
  { id: 4, title: "Chapter 4: You & The Screen", pages: "121-155", desc: "Social media, self-image, comparison, and creating a healthy digital life." },
  { id: 5, title: "Chapter 5: What Do YOU Want?", pages: "156-190", desc: "Goals, ambitions, discovering your strengths, and imagining your future." },
  { id: 6, title: "Chapter 6: Safety & Consent", pages: "191-230", desc: "Age-appropriate, empowering content on safety and personal boundaries." },
];

export default function TheBookPage() {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const books = await ShopService.getBooks();
        if (books.length > 0) {
          setBook(books[0]);
        }
      } catch (error) {
        console.error('Failed to load book data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Pastel Lavender */}
      <section className="pt-32 pb-24 bg-[#F5F3FF] relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white/40 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: Content */}
            <div className="flex flex-col">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-6"
              >
                 <div className="h-px w-6 bg-primary/20" />
                 <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                   India's first book on Adolescent Girls
                 </span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900"
              >
                A story of Every <br /> <span className="text-primary/40">Adolescent Girl</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base md:text-lg text-slate-500 leading-relaxed font-medium mb-10 max-w-lg"
              >
                A warm, illustrated guide to the adolescent journey—built to spark reflection, confidence, and conversations at home. Short chapters, friendly visuals, and practical prompts.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link href={book ? `/checkout?bookId=${book.id}` : '#'} className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold text-base hover:bg-primary transition-all shadow-xl shadow-slate-900/10 active:scale-95 group flex items-center gap-2">
                   Buy Now <span className="opacity-50">₹499</span> <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <button 
                  onClick={() => document.getElementById('read')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-10 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold text-base hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2"
                >
                   <BookOpen size={18} className="text-primary" /> Read Sample
                </button>
              </motion.div>

              {/* Trust Indicator */}
              <div className="mt-12 flex items-center gap-3">
                 <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                    ))}
                 </div>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    Trusted by 2,000+ families
                 </p>
              </div>
            </div>

            {/* Right: Book Bundle Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="relative"
            >
               <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full scale-90" />
               <Image 
                 src="/book-bundle.png"
                 alt="The Awkward Age Book Bundle"
                 width={700}
                 height={700}
                 className="relative z-10 drop-shadow-[0_40px_80px_rgba(0,0,0,0.1)]"
               />
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section - White */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="max-w-3xl mx-auto text-center mb-20">
             <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6 tracking-tight text-slate-900">
               Why every girl deserves this guide.
             </h2>
             <p className="text-base md:text-lg text-slate-500 leading-relaxed font-medium">
               Most books for girls either treat them as too young to know the truth or too fragile to handle it. 
               The Infano book speaks to girls as the intelligent, curious, and capable young women they are.
             </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             {[
               { title: "Medically Accurate", desc: "Verified by doctors and counsellors for age-appropriate accuracy." },
               { title: "Culturally Aware", desc: "Designed specifically for the nuances of modern Indian families." },
               { title: "Interactive Growth", desc: "Packed with exercises that spark confidence and reflection." }
             ].map((item, i) => (
               <div key={i} className="bg-[#FAF9FF] p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <CheckCircle2 className="text-emerald-500 mb-4" size={24} />
                  <h3 className="font-bold text-lg mb-2 text-slate-900">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Demo Reader Section - Pastel Green */}
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
                    <h4 className={`font-bold ${activeChapter === i ? 'text-slate-900' : 'text-slate-600'}`}>{chapter.title}</h4>
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
                            <h4 className="text-xl font-bold text-slate-900 leading-tight">
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

      {/* Reader Voices - Pastel Blue */}
      <section className="py-32 bg-[#F0F9FF] relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6 tracking-tight text-slate-900">Reader Voices</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { quote: "I didn't know a book could feel like a hug. I've read mine three times already.", author: "Sneha, 14", location: "Pune" },
              { quote: "I bought a copy for every girl in my daughter's class. It started conversations we'd never had before.", author: "Meera", location: "Chennai" },
              { quote: "We've added the Infano book to our Grade 8 wellness curriculum. The girls are asking more questions.", author: "Dr. Kavita", location: "School Principal" },
              { quote: "The interactive prompts made it so much easier for me to journal my feelings. It feels like a friend who understands.", author: "Aisha, 13", location: "Delhi" },
              { quote: "Finally, a book that doesn't talk down to us. The illustrations are beautiful and the advice is actually useful.", author: "Riya, 16", location: "Bangalore" },
              { quote: "My daughter and I read a chapter every Sunday. It's become our favorite bonding time.", author: "Rajesh", location: "Parent" },
            ].map((voice, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/60 backdrop-blur-sm p-8 rounded-[2.5rem] relative border border-white shadow-sm hover:shadow-xl transition-all group h-full flex flex-col"
              >
                <div className="text-6xl text-primary/10 absolute top-4 left-6 font-serif select-none group-hover:text-primary/20 transition-colors">“</div>
                <p className="text-base font-medium italic text-slate-600 mb-8 relative z-10 leading-relaxed">"{voice.quote}"</p>
                <div className="flex items-center gap-3 mt-auto">
                   <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <Users size={14} />
                   </div>
                   <div>
                      <p className="text-slate-900 font-bold text-sm leading-none">{voice.author}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{voice.location}</p>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Purchase Options - White */}
      <section className="py-32 bg-white relative overflow-hidden">
         <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
            <div className="text-center mb-20">
               <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6 tracking-tight text-slate-900">Get the Book</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
               <div className="flex flex-col items-center text-center p-8 bg-[#FAF9FF] rounded-[2.5rem] border border-slate-50 transition-transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                     <ShoppingCart size={32} />
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-slate-900">Individual Purchase</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">Buy online — delivered to your door. Available in English, Hindi, Tamil, and Telugu.</p>
                  <Link href={book ? `/checkout?bookId=${book.id}` : '#'} className="mt-auto text-primary font-bold hover:underline flex items-center gap-2">Order Now <ArrowRight size={16} /></Link>
               </div>

               <div className="flex flex-col items-center text-center p-8 bg-[#F0FDF4] rounded-[2.5rem] border border-slate-50 transition-transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                     <BookIcon size={32} />
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-slate-900">School Adoption</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">Bulk orders for schools with curriculum guidance, discussion guides, and teacher notes included.</p>
                  <Link href="/contact" className="mt-auto text-emerald-600 font-bold hover:underline flex items-center gap-2">Contact Sales <ArrowRight size={16} /></Link>
               </div>

               <div className="flex flex-col items-center text-center p-8 bg-[#FFF1F2] rounded-[2.5rem] border border-slate-50 transition-transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                     <Gift size={32} />
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-slate-900">Gift a Copy</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">Beautiful gift packaging available. Give the gift of self-knowledge to a girl you care about.</p>
                  <Link href={book ? `/checkout?bookId=${book.id}&gift=true` : '#'} className="mt-auto text-rose-500 font-bold hover:underline flex items-center gap-2">Send as Gift <ArrowRight size={16} /></Link>
               </div>
            </div>
         </div>
      </section>

      {/* Call to Action - Pastel Pink */}
      <section className="py-24 bg-[#FFF1F2] relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 text-center">
           <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6 tracking-tight text-slate-900">
                Ready to start the journey?
              </h2>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                Order your copy today and get a private, expert-supported space for your girl to grow.
              </p>
              <Link href={book ? `/checkout?bookId=${book.id}` : '#'} className="px-12 py-6 bg-rose-500 text-white rounded-full font-bold text-xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 active:scale-95 inline-flex items-center gap-3">
                 <ShoppingCart size={24} /> Get My Copy ₹499
              </Link>
           </div>
        </div>
      </section>
    </div>
  );
}
