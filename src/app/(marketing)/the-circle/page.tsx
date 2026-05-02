import Link from 'next/link';
import { ArrowRight, ShieldAlert, Heart, Zap, Briefcase, Users, Star } from 'lucide-react';

export default function TheCirclePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Section 6.1 — Hero */}
      <section className="pt-24 pb-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 text-foreground">
            Every girl needs a circle. <br className="hidden md:block"/>
            <span className="text-primary">We help her build one.</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10">
            The Infano Support Circle is where expertise meets community. From live sessions with qualified professionals to warm, peer-to-peer connection — it's the space where girls feel truly understood.
          </p>
        </div>
      </section>

      {/* Section 6.2 — Expert-Led Circles */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Expert-Led Circles</h2>
            <p className="text-lg text-muted-foreground">
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
                <h3 className="text-xl font-bold mb-3">{circle.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{circle.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl font-bold font-heading mb-8 text-center">Session Format</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"><Star className="text-accent-light" /></div>
                <p className="font-semibold text-sm">45-60 minute structured session with expert host</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"><ShieldAlert className="text-accent-light" /></div>
                <p className="font-semibold text-sm">Anonymous Q&A — ask without revealing name</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"><Heart className="text-accent-light" /></div>
                <p className="font-semibold text-sm">Live polls and interactive reflection moments</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"><Briefcase className="text-accent-light" /></div>
                <p className="font-semibold text-sm">Recording available & notes shared after</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6.3 — Peer Community */}
      <section className="py-24 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Learning from each other is one of the most powerful things girls can do.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
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
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                <h3 className="text-xl font-bold font-heading mb-6 flex items-center gap-2">
                  <ShieldAlert className="text-secondary" /> Safety Architecture
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 shrink-0"></div>
                    <p className="text-sm font-medium">No direct messaging between girls</p>
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

    </div>
  );
}
