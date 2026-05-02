import Link from 'next/link';
import { ArrowRight, BookOpen, Brain, Calendar, Heart, Shield, Users, Activity, PlayCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Section 1.2 — Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
          {/* Decorative blobs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold font-heading text-foreground mb-6 leading-tight">
              She's growing up fast. <br className="hidden md:block" />
              <span className="premium-gradient-text">She deserves a world that grows with her.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Infano.care is India's most holistic ecosystem for adolescent and young adult girls — blending story-led learning, menstrual wellness, mental health, expert guidance, and peer community into one safe, empowering space.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/contact" className="btn-primary w-full sm:w-auto text-lg px-8 py-4">
                Bring Infano.care to Your School <ArrowRight className="ml-2 inline" size={20} />
              </Link>
              <Link href="/parents" className="btn-outline w-full sm:w-auto text-lg px-8 py-4">
                I'm a Parent — Explore the App
              </Link>
            </div>

            {/* Trust Indicator Strip */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 pt-8 border-t border-border">
              <div className="flex items-center gap-2">
                <Shield className="text-accent" />
                <span className="font-semibold text-foreground">Trusted by 50+ Schools</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="text-primary" />
                <span className="font-semibold text-foreground">10,000+ Girls Empowered</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="text-secondary" />
                <span className="font-semibold text-foreground">Expert-Backed</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="text-accent" />
                <span className="font-semibold text-foreground">Safe & Secure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1.3 — The Problem We're Solving */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
              Adolescence is the most defining — and the most neglected — chapter in a girl's life.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Between the ages of 10 and 21, a girl navigates her changing body, shifting relationships, academic pressures, mental health struggles, and the weight of a world that often tells her to be quieter, smaller, and less. Most schools don't have the resources. Most parents don't have the roadmap. And most girls don't have a safe space to ask the questions that matter most.
              <br /><br />
              <span className="font-semibold text-primary">That's why we built Infano.care.</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-3xl text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 mx-auto bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 text-3xl">📊</div>
              <h3 className="text-4xl font-bold text-foreground mb-2">1 in 2</h3>
              <p className="text-lg font-semibold mb-2">adolescent girls</p>
              <p className="text-muted-foreground">experiences anxiety or low self-esteem by age 14</p>
            </div>
            <div className="glass-card p-8 rounded-3xl text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 mx-auto bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 text-3xl">📊</div>
              <h3 className="text-4xl font-bold text-foreground mb-2">73%</h3>
              <p className="text-lg font-semibold mb-2">of girls</p>
              <p className="text-muted-foreground">have no trusted adult to discuss menstrual health with</p>
            </div>
            <div className="glass-card p-8 rounded-3xl text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 text-3xl">📊</div>
              <h3 className="text-4xl font-bold text-foreground mb-2">Only 9%</h3>
              <p className="text-lg font-semibold mb-2">of schools</p>
              <p className="text-muted-foreground">offer structured emotional wellness programs for girls</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1.4 — What Is Infano.care? */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
              One ecosystem. Six superpowers for your girl.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '📚', title: 'Story-Based Learning', desc: 'Interactive journeys that teach life skills through narrative' },
              { icon: '🌙', title: 'Menstrual Wellness Tracker', desc: 'AI-powered, stigma-free, and medically informed' },
              { icon: '🧠', title: 'Mental Wellness', desc: 'Mood tracking, mindfulness, and expert-curated content' },
              { icon: '🎮', title: 'Gamified Education', desc: 'Learning that feels like play — badges, streaks, and rewards' },
              { icon: '🤝', title: 'Expert-Led Circles', desc: 'Live and async sessions with counsellors, doctors, and mentors' },
              { icon: '👯', title: 'Peer Community', desc: 'Make friends, share stories, and learn from each other safely' },
            ].map((feature) => (
              <div key={feature.title} className="bg-white p-6 rounded-3xl shadow-sm border border-border hover:shadow-md transition-shadow flex items-start gap-4">
                <div className="text-4xl">{feature.icon}</div>
                <div>
                  <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/ecosystem" className="btn-secondary">
              See the Full Ecosystem &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Section 1.5 — Who Is Infano.care For? */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary text-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-20" />
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-center mb-16 text-white">
            Every girl. Every school. Every family.
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card-dark p-10 rounded-3xl">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">🏫</span> For Schools
              </h3>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Integrate Infano.care as a structured wellness and life-skills programme within your school. Curriculum-aligned, safe, and measurable — with teacher dashboards and school-level impact reports.
              </p>
              <Link href="/schools" className="text-white font-semibold hover:text-primary-light flex items-center gap-2">
                Explore School Partnerships <ArrowRight size={16} />
              </Link>
            </div>

            <div className="glass-card-dark p-10 rounded-3xl">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">👩‍👧</span> For Parents & Carers
              </h3>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Give your daughter a private, expert-supported space to explore, grow, and ask the questions she might not ask you. You stay informed. She stays safe. You both grow closer.
              </p>
              <Link href="/parents" className="text-white font-semibold hover:text-secondary-light flex items-center gap-2">
                Explore Parent Access <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1.6 — Impact Snapshot */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
              Real girls. Real change. Real results.
            </h2>
          </div>

          <div className="max-w-4xl mx-auto glass-card bg-secondary/30 p-10 rounded-3xl mb-16 text-center">
            <p className="text-2xl md:text-3xl font-medium text-foreground italic mb-6 leading-relaxed">
              "Before Infano, I thought what I was feeling was just me being dramatic. Now I know my emotions are real — and I have the tools to understand them."
            </p>
            <p className="font-semibold text-primary">— Priya, 15, Mumbai</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-5xl font-bold text-accent mb-2">94%</div>
              <p className="text-muted-foreground">of enrolled girls reported feeling more confident about their bodies after 8 weeks</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-accent mb-2">87%</div>
              <p className="text-muted-foreground">of school principals reported improved classroom emotional regulation</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-accent mb-2">89%</div>
              <p className="text-muted-foreground">of parents said they felt better connected to their daughter's inner world</p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/impact" className="btn-outline">
              Read All Impact Stories &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Section 1.7 — The Book */}
      <section className="py-24 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[3/4] max-w-sm mx-auto w-full shadow-2xl rounded-lg overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform duration-500">
               {/* Book Cover Placeholder */}
               <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary p-8 flex flex-col justify-between">
                  <div>
                    <p className="text-white/80 font-semibold mb-2">Infano.care Presents</p>
                    <h3 className="text-4xl font-bold font-heading text-white leading-tight">The <br/>Companion <br/>Guide</h3>
                  </div>
                  <div className="w-16 h-1 bg-white/50 rounded-full"></div>
               </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold font-heading mb-6">
                The companion guide every adolescent girl needs on her bookshelf.
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Alongside the app and school programme, Infano.care has authored a thoughtfully crafted book for adolescent girls — a warm, honest, and empowering guide that tackles the questions girls are afraid to ask and the answers they deserve to hear. Available for individual purchase and school bulk adoption.
              </p>
              <Link href="/the-book" className="btn-primary">
                Discover the Book &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1.8 — School Partnership CTA Banner */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary text-white">
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 text-white">
            Your school can be part of India's most forward-thinking girls' wellness movement.
          </h2>
          <p className="text-xl text-primary-200 mb-10">
            Join our growing network of partner schools. Easy onboarding. Curriculum support. Measurable impact.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact" className="px-8 py-4 bg-white text-primary rounded-full font-bold hover:bg-slate-100 transition-colors shadow-lg">
              Apply for a School Partnership &rarr;
            </Link>
            <Link href="#" className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-full font-bold hover:bg-white/10 transition-colors">
              Download School Information Pack
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
