'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, Gift, LibraryBig, Loader2 } from 'lucide-react';
import { ShopService, Book } from '@/services/shop.service';

export default function TheBookPage() {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  const displayTitle = book?.title || "The companion guide every adolescent girl needs.";
  const displayDesc = book?.description || "Written with warmth, honesty, and deep respect for adolescent girls, the Infano book is a comprehensive guide to growing up.";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Section 7.1 — Hero */}
      <section className="pt-24 pb-20 bg-accent text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
              <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 leading-tight">
                {displayTitle} <br/>
                <span className="text-accent-100 text-3xl md:text-4xl italic">Because girlhood deserves a roadmap.</span>
              </h1>
              <p className="text-xl text-accent-50 leading-relaxed mb-10 max-w-2xl">
                {displayDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href={book ? `/checkout?bookId=${book.id}` : '/checkout'} 
                  className="px-10 py-5 bg-white text-accent rounded-full font-black text-lg hover:bg-slate-100 transition-all shadow-2xl shadow-black/20 flex items-center justify-center group"
                >
                  Buy Your Copy <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" size={24} />
                </Link>
                <Link href="/contact" className="px-8 py-5 bg-transparent border-2 border-white/30 text-white rounded-full font-bold hover:bg-white/10 transition-colors text-center">
                  Adopt for Your School
                </Link>
              </div>
            </div>
            
            <div className="relative aspect-[3/4] max-w-sm mx-auto w-full group animate-in fade-in slide-in-from-right-8 duration-1000">
               {/* Book Cover Container */}
               <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-r-[3rem] rounded-l-xl -rotate-6 group-hover:rotate-0 transition-transform duration-700"></div>
               <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-r-[3rem] rounded-l-xl rotate-3 group-hover:rotate-0 transition-transform duration-700 delay-75"></div>
               
               <div className="relative h-full w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-r-[3rem] rounded-l-xl overflow-hidden border-l-8 border-black/20 group-hover:scale-105 transition-transform duration-700">
                  {book?.imageUrl ? (
                    <img 
                      src={book.imageUrl} 
                      alt={book.title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-primary to-purple-700 p-12 flex flex-col justify-between">
                      <div>
                        <p className="text-white/60 font-black uppercase tracking-[0.3em] text-xs mb-4">Infano Original</p>
                        <h3 className="text-5xl font-black font-heading text-white leading-tight uppercase italic">{book?.title || 'Growing Up'}</h3>
                        <div className="h-1.5 w-20 bg-white/30 rounded-full mt-6"></div>
                      </div>
                      <div>
                         <p className="text-white/90 text-sm font-bold leading-relaxed">The companion guide every adolescent girl needs.</p>
                      </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7.2 — About the Book */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center relative z-10">
          <h2 className="text-4xl font-black font-heading mb-10 italic">About the <span className="text-primary">Book</span></h2>
          <div className="prose prose-lg text-slate-600 prose-p:leading-relaxed mx-auto text-left font-medium">
            <p>
              Adolescence is full of questions. Am I normal? Why does my body feel like a stranger? How do I know if what I'm feeling is okay? What if my friends don't understand? What do I actually want from my life?
            </p>
            <p>
              Most books for girls either treat them as too young to know the truth or too fragile to handle it. Ours does neither. <strong className="text-slate-900 font-black">The Infano book speaks to girls as the intelligent, curious, capable young women they are.</strong> It is warm, frank, medically accurate, and deeply kind.
            </p>
            <p>
              From the first signs of puberty to navigating friendships, social media, mental health, career dreams, and self-identity — this book covers the full arc of adolescent girlhood. Illustrated, relatable, and written to be picked up again and again.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7.3 — What's Inside */}
      <section className="py-32 bg-slate-50 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black font-heading mb-4 italic">What's <span className="text-primary">Inside</span></h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">A comprehensive guide to modern girlhood</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🌸', title: 'Chapter 1: Your Body, Your Story', desc: 'Understanding puberty, periods, and physical change with accuracy and ease' },
              { icon: '🧠', title: 'Chapter 2: The Emotional Landscape', desc: 'Feelings, moods, anxiety, and why your emotions are trying to tell you something' },
              { icon: '👯', title: 'Chapter 3: The Relationship Web', desc: 'Friendships, family, and how to build connections that lift you up' },
              { icon: '📱', title: 'Chapter 4: You & The Screen', desc: 'Social media, self-image, comparison, and creating a healthy digital life' },
              { icon: '🌟', title: 'Chapter 5: What Do YOU Want?', desc: 'Goals, ambitions, discovering your strengths, and imagining your future' },
              { icon: '🛡️', title: 'Chapter 6: Safety, Consent & Your Rights', desc: 'Age-appropriate, empowering content on safety and personal boundaries' },
            ].map((chapter) => (
              <div key={chapter.title} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 flex flex-col gap-6 items-start hover:shadow-xl hover:border-primary/20 transition-all hover:-translate-y-2 group">
                <div className="text-5xl group-hover:scale-125 transition-transform duration-500">{chapter.icon}</div>
                <div>
                  <h4 className="font-black text-xl mb-3 text-slate-900 group-hover:text-primary transition-colors">{chapter.title}</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">{chapter.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7.4 — Reader Voices */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black font-heading mb-4 italic text-primary">Reader Voices</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { quote: "I didn't know a book could feel like a hug. I've read mine three times.", author: "Sneha, 14, Pune" },
              { quote: "I bought a copy for every girl in my daughter's class. It started conversations we'd never had before.", author: "Parent, Chennai" },
              { quote: "We've added the Infano book to our Grade 8 wellness curriculum. The girls are asking more questions than ever.", author: "Wellness Coordinator, Hyderabad" },
            ].map((voice, i) => (
              <div key={i} className="bg-slate-50 p-10 rounded-[3rem] relative border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group">
                <div className="text-8xl text-primary/10 absolute top-2 left-6 font-serif select-none group-hover:text-primary/20 transition-colors">"</div>
                <p className="text-xl font-bold italic text-slate-800 mb-8 relative z-10 leading-relaxed">{voice.quote}</p>
                <p className="font-black uppercase tracking-widest text-xs text-primary">{voice.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7.5 — How to Get the Book */}
      <section className="py-32 bg-slate-900 text-white rounded-t-[5rem]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black font-heading mb-20 italic">How to <span className="text-primary">Get the Book</span></h2>

          <div className="grid md:grid-cols-3 gap-12 mb-24">
            <div className="p-8 space-y-6">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
                <ShoppingCart size={40} />
              </div>
              <h3 className="text-2xl font-black italic">Individual Purchase</h3>
              <p className="text-slate-400 font-medium">
                Buy online — delivered to your door. Available in English, Hindi, Tamil, and Telugu.
              </p>
            </div>
            
            <div className="p-8 space-y-6 border-x border-white/10">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto text-secondary">
                <LibraryBig size={40} />
              </div>
              <h3 className="text-2xl font-black italic">School Adoption</h3>
              <p className="text-slate-400 font-medium">
                Bulk orders for schools with curriculum guidance, discussion guides, and teacher notes included.
              </p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto text-accent">
                <Gift size={40} />
              </div>
              <h3 className="text-2xl font-black italic">Gift a Copy</h3>
              <p className="text-slate-400 font-medium">
                Beautiful gift packaging available. Give the gift of self-knowledge to a girl you care about.
              </p>
            </div>
          </div>

          <div className="animate-bounce">
            <Link 
              href={book ? `/checkout?bookId=${book.id}` : '/checkout'} 
              className="px-12 py-6 bg-primary text-white rounded-full font-black text-2xl hover:bg-primary-dark transition-all shadow-2xl shadow-primary/20 inline-flex items-center gap-4"
            >
              Order Your Copy Now <ArrowRight size={28} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
