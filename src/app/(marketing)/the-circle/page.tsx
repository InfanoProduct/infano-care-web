import Link from 'next/link';
import { ArrowRight, ShieldAlert, Heart, Zap, Briefcase, Users, Star } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PeerBanner } from '@/features/marketing/components/sections/the-circle/PeerBanner';
import { PeerMentorsSection } from '@/features/marketing/components/sections/the-circle/PeerMentorsSection';

export default function TheCirclePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Section 6.1 — Hero */}
      <section className="pt-32 pb-24 bg-primary/5 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-accent/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="flex flex-col text-center lg:text-left">
              <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-6 inline-block">
                The Infano Support Circle
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-8 tracking-tight text-slate-900 leading-[1.1]">
                Every girl needs a circle. <br className="hidden lg:block" />
                <span className="text-primary">We help her build one.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-10 font-medium">
                The Infano Support Circle is where expertise meets community. From live sessions with qualified professionals to warm, peer-to-peer connection — it's the space where girls feel truly understood.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="#peer-mentors" className="btn-primary text-base px-12 py-4 w-full sm:w-auto shadow-xl shadow-primary/20 group">
                  I want to connect <ArrowRight size={20} className="ml-2 inline-block transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/10 border-8 border-white/40">
              <Image
                src="/circle-hero.png"
                alt="Girls sitting in a circle"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 6.2 — Expert-Led Circles */}
      <section className="py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 tracking-tight text-slate-900">Expert-Led Circles</h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Our Expert Circles are curated, moderated sessions — live and recorded — hosted by professionals who have dedicated their careers to adolescent wellbeing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              { icon: '💜', title: 'The Wellness Circle', desc: 'Hosted by clinical psychologists and counsellors. Topics: anxiety, confidence, self-worth, academic stress, grief.' },
              { icon: '🌺', title: 'The Body Circle', desc: 'Hosted by gynaecologists and adolescent health doctors. Topics: puberty, periods, PCOS, body image, nutrition.' },
              { icon: '🚀', title: 'The Ambition Circle', desc: 'Hosted by career mentors and entrepreneurs. Topics: goal-setting, career exploration, leadership, confidence.' },
              { icon: '🤝', title: 'The Relationship Circle', desc: 'Hosted by family therapists. Topics: friendships, family conflict, romantic relationships, healthy boundaries.' },
              { icon: '🛡️', title: 'The Crisis Circle', desc: 'Available for urgent support. Staffed by trained crisis counsellors. Always available within 24 hours.', highlight: true },
            ].map((circle) => (
              <div key={circle.title} className={`p-8 rounded-3xl border ${circle.highlight ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-border'} hover:-translate-y-1 transition-transform`}>
                <div className="text-4xl mb-4">{circle.icon}</div>
                <h3 className="text-xl font-bold font-heading mb-3 tracking-tight text-slate-900">{circle.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{circle.desc}</p>
              </div>
            ))}
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-white via-primary/5 to-accent/5 rounded-[2.5rem] p-10 md:p-14 border border-primary/10 shadow-2xl shadow-primary/5">
            {/* Decorative background blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <h3 className="text-3xl font-bold font-heading mb-12 text-center text-slate-900 tracking-tight">Session Format</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                <div className="text-center group flex flex-col items-center">
                  <div className="w-16 h-16 bg-white shadow-md border border-primary/10 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary group-hover:shadow-primary/30 group-hover:-rotate-3">
                    <Star className="text-primary transition-colors duration-300 group-hover:text-white" size={28} />
                  </div>
                  <p className="font-semibold text-slate-700 leading-relaxed">45-60 minute structured session with expert host</p>
                </div>
                <div className="text-center group flex flex-col items-center">
                  <div className="w-16 h-16 bg-white shadow-md border border-primary/10 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary group-hover:shadow-primary/30 group-hover:rotate-3">
                    <ShieldAlert className="text-primary transition-colors duration-300 group-hover:text-white" size={28} />
                  </div>
                  <p className="font-semibold text-slate-700 leading-relaxed">Anonymous Q&A — ask without revealing name</p>
                </div>
                <div className="text-center group flex flex-col items-center">
                  <div className="w-16 h-16 bg-white shadow-md border border-primary/10 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary group-hover:shadow-primary/30 group-hover:-rotate-3">
                    <Heart className="text-primary transition-colors duration-300 group-hover:text-white" size={28} />
                  </div>
                  <p className="font-semibold text-slate-700 leading-relaxed">Live polls and interactive reflection moments</p>
                </div>
                <div className="text-center group flex flex-col items-center">
                  <div className="w-16 h-16 bg-white shadow-md border border-primary/10 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary group-hover:shadow-primary/30 group-hover:rotate-3">
                    <Briefcase className="text-primary transition-colors duration-300 group-hover:text-white" size={28} />
                  </div>
                  <p className="font-semibold text-slate-700 leading-relaxed">Recording available & notes shared after</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6.3 — Peer Community */}
      <section className="py-24 bg-secondary/5">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6 tracking-tight text-slate-900">Learning from each other is one of the most powerful things girls can do.</h2>
              <p className="text-lg text-slate-500 leading-relaxed font-medium mb-8">
                The Infano peer community is a warm, structured, and fully moderated space where girls connect around shared interests and experiences. Unlike social media, there are no follower counts, no viral loops, and no toxic comparison. Just girls supporting girls.
              </p>
              <div className="space-y-6">
                {[
                  { icon: '🎨', title: 'Interest Groups', desc: 'Art, sport, coding, reading, music, cooking, science, and more' },
                  { icon: '🌟', title: 'Peer Mentors', desc: 'Older girls trained by Infano to provide kind, knowledgeable support' },
                  { icon: '📔', title: 'Story Sharing', desc: 'Girls share their wins, learnings, and creative work in a safe space' },
                  { icon: '🏫', title: 'School Circles', desc: 'Exclusive community groups for girls from the same school' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="text-3xl shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="font-bold font-heading text-lg text-slate-900 tracking-tight">{item.title}</h4>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                <h3 className="text-xl font-bold font-heading mb-6 flex items-center gap-2 text-slate-900 tracking-tight">
                  <ShieldAlert className="text-secondary" /> Safety Architecture
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 shrink-0"></div>
                    <p className="text-sm font-medium">Safe and moderated messaging with trained peers</p>
                  </li>
                  <li className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 shrink-0"></div>
                    <p className="text-sm font-medium">All posts reviewed by AI moderation and human moderators within 2 hours</p>
                  </li>
                  <li className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 shrink-0"></div>
                    <p className="text-sm font-medium">Strict community guidelines with instant escalation for safeguarding concerns</p>
                  </li>
                  <li className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 shrink-0"></div>
                    <p className="text-sm font-medium">Girls can report content or flag concerns with one tap</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/contact" className="btn-primary text-lg px-8 py-4">
              Join the Circle Today <ArrowRight className="ml-2 inline" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 6.3.5 — Trained Peer Mentors */}
      <PeerMentorsSection />

      {/* Section 6.4 — Peer Banner */}
      <PeerBanner />

    </div>
  );
}
