import Link from 'next/link';
import { ArrowRight, Book, ShoppingCart, Gift, LibraryBig } from 'lucide-react';

export default function TheBookPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Section 7.1 — Hero */}
      <section className="pt-24 pb-20 bg-accent text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 leading-tight">
                The book your daughter will read under the covers with a torch. <br/>
                <span className="text-accent-100 text-3xl md:text-4xl">And thank you for later.</span>
              </h1>
              <p className="text-xl text-accent-50 leading-relaxed mb-10">
                Written with warmth, honesty, and deep respect for adolescent girls, the Infano book is a comprehensive guide to growing up — addressing the questions that don't make it into school textbooks or family dinners.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#" className="btn-primary bg-white text-accent hover:bg-slate-100 px-8 py-4">
                  Buy Your Copy <ArrowRight className="ml-2 inline" size={20} />
                </Link>
                <Link href="/contact" className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-full font-bold hover:bg-white/10 transition-colors text-center">
                  Adopt for Your School
                </Link>
              </div>
            </div>
            
            <div className="relative aspect-[3/4] max-w-sm mx-auto w-full shadow-2xl rounded-r-3xl rounded-l-lg overflow-hidden transform rotate-2">
               {/* Book Cover Placeholder */}
               <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary p-8 flex flex-col justify-between border-l-8 border-primary-dark">
                  <div>
                    <p className="text-white/80 font-semibold mb-2">Infano.care</p>
                    <h3 className="text-5xl font-bold font-heading text-white leading-tight mt-4">Growing<br/>Up<br/>Honest</h3>
                  </div>
                  <div>
                     <p className="text-white/90 text-sm font-medium">The companion guide every adolescent girl needs.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7.2 — About the Book */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold font-heading mb-8">About the Book</h2>
          <div className="prose prose-lg text-muted-foreground prose-p:leading-relaxed mx-auto text-left">
            <p>
              Adolescence is full of questions. Am I normal? Why does my body feel like a stranger? How do I know if what I'm feeling is okay? What if my friends don't understand? What do I actually want from my life?
            </p>
            <p>
              Most books for girls either treat them as too young to know the truth or too fragile to handle it. Ours does neither. <strong className="text-foreground">The Infano book speaks to girls as the intelligent, curious, capable young women they are.</strong> It is warm, frank, medically accurate, and deeply kind.
            </p>
            <p>
              From the first signs of puberty to navigating friendships, social media, mental health, career dreams, and self-identity — this book covers the full arc of adolescent girlhood. Illustrated, relatable, and written to be picked up again and again.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7.3 — What's Inside */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">What's Inside</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🌸', title: 'Chapter 1: Your Body, Your Story', desc: 'Understanding puberty, periods, and physical change with accuracy and ease' },
              { icon: '🧠', title: 'Chapter 2: The Emotional Landscape', desc: 'Feelings, moods, anxiety, and why your emotions are trying to tell you something' },
              { icon: '👯', title: 'Chapter 3: The Relationship Web', desc: 'Friendships, family, and how to build connections that lift you up' },
              { icon: '📱', title: 'Chapter 4: You & The Screen', desc: 'Social media, self-image, comparison, and creating a healthy digital life' },
              { icon: '🌟', title: 'Chapter 5: What Do YOU Want?', desc: 'Goals, ambitions, discovering your strengths, and imagining your future' },
              { icon: '🛡️', title: 'Chapter 6: Safety, Consent & Your Rights', desc: 'Age-appropriate, empowering content on safety and personal boundaries' },
            ].map((chapter) => (
              <div key={chapter.title} className="bg-white p-6 rounded-2xl shadow-sm border border-border flex gap-4 items-start hover:-translate-y-1 transition-transform">
                <div className="text-3xl shrink-0">{chapter.icon}</div>
                <div>
                  <h4 className="font-bold text-lg mb-2 text-primary-dark">{chapter.title}</h4>
                  <p className="text-muted-foreground text-sm">{chapter.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7.4 — Reader Voices */}
      <section className="py-24 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-heading mb-4">Reader Voices</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "I didn't know a book could feel like a hug. I've read mine three times.", author: "Sneha, 14, Pune" },
              { quote: "I bought a copy for every girl in my daughter's class. It started conversations we'd never had before.", author: "Parent, Chennai" },
              { quote: "We've added the Infano book to our Grade 8 wellness curriculum. The girls are asking more questions than ever — and that is exactly what we wanted.", author: "Wellness Coordinator, International School, Hyderabad" },
            ].map((voice, i) => (
              <div key={i} className="glass-card p-8 rounded-3xl relative">
                <div className="text-4xl text-primary/20 absolute top-4 left-4 font-serif">"</div>
                <p className="text-lg italic text-foreground mb-6 relative z-10">{voice.quote}</p>
                <p className="font-semibold text-primary">{voice.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7.5 — How to Get the Book */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-heading mb-4">How to Get the Book</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="border border-border p-8 rounded-3xl text-center hover:border-primary transition-colors">
              <ShoppingCart className="mx-auto text-primary mb-4" size={40} />
              <h3 className="text-xl font-bold mb-3">Individual Purchase</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Buy online — delivered to your door. Available in English, Hindi, Tamil, and Telugu.
              </p>
            </div>
            
            <div className="border border-border p-8 rounded-3xl text-center hover:border-secondary transition-colors">
              <LibraryBig className="mx-auto text-secondary mb-4" size={40} />
              <h3 className="text-xl font-bold mb-3">School Adoption</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Bulk orders for schools with curriculum guidance, discussion guides, and teacher notes included.
              </p>
            </div>
            
            <div className="border border-border p-8 rounded-3xl text-center hover:border-accent transition-colors">
              <Gift className="mx-auto text-accent mb-4" size={40} />
              <h3 className="text-xl font-bold mb-3">Gift a Copy</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Beautiful gift packaging available. Give the gift of self-knowledge to a girl you care about.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="#" className="btn-primary text-lg px-8 py-4">
              Order Your Copy Now <ArrowRight className="ml-2 inline" size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
