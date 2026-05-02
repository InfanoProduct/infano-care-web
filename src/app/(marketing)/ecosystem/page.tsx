import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function EcosystemPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Section 3.1 — Hero */}
      <section className="pt-24 pb-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-10" />
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">
            Six pillars. One journey. Infinite possibility.
          </h1>
          <p className="text-xl text-primary-100 leading-relaxed max-w-3xl mx-auto">
            The Infano ecosystem is not just an app. It is a whole-girl approach to growing up — combining technology, storytelling, community, expert guidance, and wellness into one seamless experience.
          </p>
        </div>
      </section>

      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-32">
          
          {/* Section 3.2 — Pillar 1 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 text-secondary text-3xl mb-6">📚</div>
              <h2 className="text-3xl font-bold font-heading mb-2">Pillar 1: Story-Based Learning Journeys</h2>
              <h3 className="text-xl font-semibold text-primary mb-6">Learning That Feels Like Living</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our signature learning journeys use the power of narrative to teach life skills that schools often cannot. Through relatable characters, real-world dilemmas, and interactive choices, girls explore topics like self-worth, boundaries, communication, financial independence, career exploration, relationships, and more.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  '12+ unique story worlds, each designed around a specific life skill theme',
                  'Interactive branching narratives — girls choose their path',
                  'Reflective journaling prompts after each chapter',
                  'Badges and progress markers to celebrate growth',
                  'Content for ages 10–21, with age-appropriate segmentation'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-accent shrink-0 mt-0.5" size={20} />
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-slate-50 p-6 rounded-2xl border border-border">
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Sample Journey Titles</h4>
                <div className="flex flex-wrap gap-2">
                  {['The Courage Code', 'Body Talks', 'Her Money Mind', 'Unfiltered', 'Friendship Lab'].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-white border border-border rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 bg-slate-100 rounded-3xl aspect-square flex items-center justify-center p-8">
              {/* Placeholder for App Screenshot */}
              <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-pink-50 p-6 flex flex-col">
                  <div className="w-3/4 h-8 bg-slate-200 rounded mb-4"></div>
                  <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                     <div className="w-full h-32 bg-slate-100 rounded-lg mb-4"></div>
                     <div className="w-5/6 h-4 bg-slate-200 rounded mb-2"></div>
                     <div className="w-4/6 h-4 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3.3 — Pillar 2 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-slate-100 rounded-3xl aspect-square flex items-center justify-center p-8">
              {/* Placeholder for App Screenshot */}
              <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-teal-50 p-6 flex flex-col items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-8 border-accent/20 flex items-center justify-center">
                     <div className="text-4xl font-bold text-accent">Day 14</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent text-3xl mb-6">🌙</div>
              <h2 className="text-3xl font-bold font-heading mb-2">Pillar 2: AI-Based Menstrual & Mental Wellness Tracker</h2>
              <h3 className="text-xl font-semibold text-primary mb-6">Know Your Body. Trust Your Mind.</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our intelligent tracker goes beyond logging dates. It learns a girl's unique cycle, identifies patterns in mood and energy, and provides personalised, medically accurate insights. Combined with mental wellness check-ins, it helps girls understand the connection between their physical and emotional health.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Personalised period predictions with smart reminders',
                  'Daily mood and energy tracking with AI pattern recognition',
                  'Symptom logging with expert-backed explanations',
                  'Cycle-synced wellness tips (nutrition, exercise, rest)',
                  'Mental health check-in with escalation protocols to trusted adults',
                  'Completely private — girls control what, if anything, is shared'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-secondary shrink-0 mt-0.5" size={20} />
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
                <h4 className="font-bold text-orange-800 mb-2">Safety Note for Parents & Schools</h4>
                <p className="text-sm text-orange-700">
                  The tracker is designed to be a tool of self-knowledge, not surveillance. Girls control their data entirely. Infano.care never shares individual health data with parents or schools without the girl's explicit consent.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3.4 — Pillar 3 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 text-3xl mb-6">🎮</div>
              <h2 className="text-3xl font-bold font-heading mb-2">Pillar 3: Gamified Education</h2>
              <h3 className="text-xl font-semibold text-primary mb-6">Learning That Doesn't Feel Like Learning</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We believe education sticks when it's joyful. Our gamified modules reward curiosity, celebrate milestones, and create healthy motivation through a carefully designed progression system that makes girls want to come back every day.
              </p>
              <ul className="space-y-3">
                {[
                  'Daily quests and micro-learning modules (5–10 minutes)',
                  'Achievement badges across 20+ life skill categories',
                  'Leaderboards within school groups (optional, moderated)',
                  'Streak rewards and seasonal challenges',
                  'Parent visibility dashboard — see progress without invasion'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-blue-500 shrink-0 mt-0.5" size={20} />
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 md:order-2 bg-slate-100 rounded-3xl aspect-square flex items-center justify-center p-8">
              <div className="grid grid-cols-2 gap-4 w-full h-full">
                 <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center justify-center border border-slate-100"><div className="text-4xl mb-2">🏆</div><div className="h-2 w-16 bg-slate-200 rounded"></div></div>
                 <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center justify-center border border-slate-100"><div className="text-4xl mb-2">⭐</div><div className="h-2 w-16 bg-slate-200 rounded"></div></div>
                 <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center justify-center border border-slate-100"><div className="text-4xl mb-2">🔥</div><div className="h-2 w-16 bg-slate-200 rounded"></div></div>
                 <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center justify-center border border-slate-100"><div className="text-4xl mb-2">💎</div><div className="h-2 w-16 bg-slate-200 rounded"></div></div>
              </div>
            </div>
          </div>

          {/* Section 3.5 — Pillar 4 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
             <div className="bg-slate-100 rounded-3xl aspect-square flex items-center justify-center p-8">
              <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
                <div className="absolute inset-0 bg-slate-800 p-6 flex flex-col">
                  <div className="flex-1 bg-slate-700 rounded-xl mb-4 flex items-center justify-center">
                     <div className="text-6xl">👩‍⚕️</div>
                  </div>
                  <div className="h-24 bg-slate-900 rounded-xl p-4 flex gap-2">
                     <div className="w-12 h-12 bg-slate-600 rounded-full"></div>
                     <div className="w-12 h-12 bg-slate-600 rounded-full"></div>
                     <div className="w-12 h-12 bg-slate-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 text-3xl mb-6">🤝</div>
              <h2 className="text-3xl font-bold font-heading mb-2">Pillar 4: Expert-Led Support Circles</h2>
              <h3 className="text-xl font-semibold text-primary mb-6">Real Experts. Real Conversations. Real Help.</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our Support Circles are moderated group sessions led by qualified psychologists, gynaecologists, counsellors, nutritionists, and career mentors. Girls can join live sessions, ask anonymous questions, and access recordings at any time.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { name: 'The Wellness Circle', desc: 'Mental health, stress, and emotional wellbeing' },
                  { name: 'The Body Circle', desc: 'Puberty, menstruation, and reproductive health' },
                  { name: 'The Ambition Circle', desc: 'Careers, goals, and self-belief' },
                  { name: 'The Relationship Circle', desc: 'Friendships, family, and healthy boundaries' }
                ].map((circle) => (
                  <div key={circle.name} className="border border-border p-4 rounded-xl">
                    <h4 className="font-bold text-sm mb-1">{circle.name}</h4>
                    <p className="text-xs text-muted-foreground">{circle.desc}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 border border-border p-6 rounded-2xl">
                <h4 className="font-bold mb-2">Safety & Moderation</h4>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                  <li>All circles are moderated by trained Infano professionals</li>
                  <li>Anonymous question submission available in all sessions</li>
                  <li>24-hour escalation protocol for disclosures of harm</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3.6 — Pillar 5 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-100 text-pink-600 text-3xl mb-6">👯</div>
              <h2 className="text-3xl font-bold font-heading mb-2">Pillar 5: Peer Community</h2>
              <h3 className="text-xl font-semibold text-primary mb-6">Because Sometimes, the Best Support Comes from Someone Who Gets It</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The Infano peer community connects girls with others their age in a safe, moderated environment. Structured around shared interests, experiences, and learning journeys, it's designed to foster genuine friendship and mutual growth — not comparison or competition.
              </p>
              <ul className="space-y-3">
                {[
                  'Interest-based groups (art, sport, coding, books, wellness)',
                  'Story-sharing and achievement celebration',
                  'Peer mentorship from older girls in the Infano network',
                  'Fully moderated — no direct messaging, no unsolicited contact',
                  'School-specific community groups for enrolled institutions'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-pink-500 shrink-0 mt-0.5" size={20} />
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 md:order-2 bg-slate-100 rounded-3xl aspect-square flex items-center justify-center p-8">
              <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-6 flex flex-col gap-4">
                 <div className="h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center px-4 gap-3"><div className="w-8 h-8 rounded-full bg-slate-200"></div><div className="flex-1"><div className="w-1/3 h-2 bg-slate-200 rounded mb-2"></div><div className="w-2/3 h-2 bg-slate-100 rounded"></div></div></div>
                 <div className="h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center px-4 gap-3"><div className="w-8 h-8 rounded-full bg-slate-200"></div><div className="flex-1"><div className="w-1/3 h-2 bg-slate-200 rounded mb-2"></div><div className="w-2/3 h-2 bg-slate-100 rounded"></div></div></div>
                 <div className="h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center px-4 gap-3"><div className="w-8 h-8 rounded-full bg-slate-200"></div><div className="flex-1"><div className="w-1/3 h-2 bg-slate-200 rounded mb-2"></div><div className="w-2/3 h-2 bg-slate-100 rounded"></div></div></div>
              </div>
            </div>
          </div>

          {/* Section 3.7 — Pillar 6 */}
          <div className="bg-primary/5 rounded-3xl p-10 md:p-16 text-center mb-24">
            <h2 className="text-3xl font-bold font-heading mb-4">Pillar 6: The Book</h2>
            <h3 className="text-xl font-semibold text-primary mb-6">A Companion for Every Chapter</h3>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Our specially authored book for adolescent girls is the perfect offline companion to the Infano digital ecosystem. Warm, honest, and beautifully designed, it covers the essential topics every girl deserves to understand — from her body to her brilliance.
            </p>
            <Link href="/the-book" className="btn-primary">
              Explore The Book <ArrowRight className="ml-2 inline" size={20} />
            </Link>
          </div>

          {/* About the Platform FAQ */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-heading mb-4">About the Platform</h2>
              <p className="text-lg text-muted-foreground">Frequently asked questions about technical requirements and availability.</p>
            </div>
            
            <div className="space-y-6">
              {[
                {
                  q: "Is the platform available offline?",
                  a: "Core content — including story journeys and the wellness tracker — is available offline and syncs when your daughter is connected. Live Expert Circle sessions require internet connectivity."
                },
                {
                  q: "In which languages is Infano available?",
                  a: "Infano is currently available in English, Hindi, Tamil, Telugu, Marathi, and Kannada. We are actively developing content in Bengali, Gujarati, and Malayalam."
                },
                {
                  q: "Is Infano available on iOS and Android?",
                  a: "Yes. The Infano app is available on both iOS and Android. It is also accessible via any web browser for schools that prefer a browser-based experience."
                }
              ].map((faq, i) => (
                <div key={i} className="p-6 rounded-2xl border border-border bg-slate-50 shadow-sm">
                  <h4 className="text-lg font-bold mb-3 text-foreground">{faq.q}</h4>
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
