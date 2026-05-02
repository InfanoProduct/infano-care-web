import Link from 'next/link';
import { ArrowRight, ShieldCheck, HeartHandshake, EyeOff, BellRing, BookOpen } from 'lucide-react';

export default function ParentsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Section 5.1 — Hero */}
      <section className="pt-24 pb-20 bg-gradient-to-b from-secondary/10 to-background">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 text-foreground">
            You love her. You want to protect her. <br className="hidden md:block"/>
            <span className="text-secondary">You want to understand her.</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10">
            Infano.care is the safe, expert-supported companion that helps your daughter navigate the questions, emotions, and changes she's facing — and helps you stay meaningfully connected through every stage of her journey.
          </p>
          <div className="flex justify-center">
            <Link href="/contact" className="btn-secondary">
              Enrol Your Daughter Today <ArrowRight className="ml-2 inline" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 5.2 — What Parents Worry About */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">We heard you. This is how Infano responds.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { q: "'Is it safe?'", a: "Completely. No ads, no strangers, no public spaces. Everything is moderated.", icon: <ShieldCheck className="text-primary" size={32} /> },
              { q: "'Will it replace me?'", a: "Never. Infano helps girls open up — often, that means talking more, not less, with you.", icon: <HeartHandshake className="text-secondary" size={32} /> },
              { q: "'What will she see?'", a: "Only age-appropriate, expert-reviewed content — thoughtfully designed to inform and empower.", icon: <EyeOff className="text-accent" size={32} /> },
              { q: "'Will I know what's happening?'", a: "You have a parent dashboard showing her progress (not her private journal entries or health data).", icon: <BellRing className="text-blue-500" size={32} /> },
            ].map((worry, i) => (
              <div key={i} className="flex gap-6 p-8 bg-slate-50 rounded-3xl border border-border">
                <div className="shrink-0">{worry.icon}</div>
                <div>
                  <h4 className="text-xl font-bold font-heading mb-2 text-foreground">{worry.q}</h4>
                  <p className="text-muted-foreground">{worry.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5.3 — What Your Daughter Will Experience */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">What Your Daughter Will Experience</h2>
              <p className="text-lg text-slate-300 leading-relaxed mb-10">
                From the moment your daughter opens Infano, she enters a world designed entirely for her. She's greeted warmly, guided gently, and celebrated genuinely. Here's what a typical week might look like:
              </p>
              
              <div className="space-y-6">
                {[
                  { day: '🌅 Monday', desc: "10-minute story chapter from 'The Courage Code'. Reflective prompt in her journal." },
                  { day: '🌙 Tuesday', desc: "Period tracker log. AI provides a wellness tip based on her cycle day." },
                  { day: '🎮 Wednesday', desc: "Gamified quiz on emotional intelligence. Earns a 'Self-Awareness' badge." },
                  { day: '🤝 Thursday', desc: "Joins a live Expert Circle on managing exam stress. Asks an anonymous question." },
                  { day: '👯 Friday', desc: "Shares a thought in her school's Infano community. Gets encouragement from peers." },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pb-6 border-b border-slate-800 last:border-0 last:pb-0">
                    <div className="font-semibold text-secondary-light w-40 shrink-0">{item.day}</div>
                    <div className="text-slate-300 text-sm sm:text-base">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              {/* App UI Placeholder */}
              <div className="bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-700 relative z-10 transform lg:rotate-3">
                 <div className="bg-slate-900 rounded-2xl h-[600px] p-6 flex flex-col gap-4 overflow-hidden border border-slate-700">
                    <div className="h-16 bg-slate-800 rounded-xl flex items-center px-4 justify-between"><div className="w-10 h-10 bg-slate-700 rounded-full"></div><div className="w-24 h-4 bg-slate-700 rounded-full"></div></div>
                    <div className="h-32 bg-gradient-to-r from-primary to-secondary rounded-2xl p-6"></div>
                    <div className="h-24 bg-slate-800 rounded-xl"></div>
                    <div className="h-24 bg-slate-800 rounded-xl"></div>
                    <div className="h-24 bg-slate-800 rounded-xl"></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5.4 — Parent Dashboard */}
      <section className="py-24 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Stay informed without invading.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Your parent dashboard gives you a meaningful, non-intrusive view of your daughter's Infano journey. You can see which learning journeys she's completed, which badges she's earned, and how she's engaging with the community. Her health data, journal entries, and private messages are entirely her own.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { title: 'Weekly Summary', desc: 'Learning modules completed and topics explored' },
              { title: 'Wellness Flags', desc: 'If our system detects a concern (and she consents), you are notified' },
              { title: 'Monthly Progress', desc: 'Skills developed, milestones reached' },
              { title: 'Curated Prompts', desc: 'Weekly conversation starter suggestions to use at home' },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-border">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary font-bold">{i+1}</div>
                <h4 className="font-bold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto glass-card bg-white p-10 rounded-3xl text-center shadow-lg">
            <p className="text-xl md:text-2xl font-medium text-foreground italic mb-6 leading-relaxed">
              "Infano has given me a bridge back to my daughter. We use the weekly prompts over dinner and she actually talks to me now."
            </p>
            <p className="font-semibold text-secondary">— Parent, Bengaluru</p>
          </div>
        </div>
      </section>

      {/* Section 5.5 — Access Options for Parents */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-16 text-center">Access Options for Parents</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="border border-border p-8 rounded-3xl text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🏫</div>
              <h3 className="text-xl font-bold mb-3">Option 1: Through Your School</h3>
              <p className="text-muted-foreground text-sm mb-6">
                If your daughter's school is an Infano partner, she may already have access. Ask your school's wellness coordinator or contact us to find out.
              </p>
            </div>
            
            <div className="border-2 border-secondary bg-secondary/5 p-8 rounded-3xl text-center relative transform md:-translate-y-4 shadow-lg">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary text-white px-4 py-1 rounded-full text-sm font-bold">Most Popular</div>
              <div className="text-4xl mb-4 mt-2">📱</div>
              <h3 className="text-xl font-bold mb-3">Option 2: Direct Family Access</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Enrol directly through the website or app. Available as a monthly or annual subscription. Includes full app access for your daughter and the parent dashboard.
              </p>
            </div>
            
            <div className="border border-border p-8 rounded-3xl text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="text-xl font-bold mb-3">Option 3: Gift the Book</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Start the conversation with the Infano book — a beautiful, honest guide for adolescent girls. Available for purchase online and in select bookstores.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/contact" className="btn-primary text-lg px-8 py-4">
              Enrol Your Daughter Today <ArrowRight className="ml-2 inline" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Parents FAQ */}
      <section className="py-24 bg-slate-50 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-heading mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-6">
            {[
              {
                q: "Will my daughter's health data be shared with the school?",
                a: "Never, without your daughter's explicit consent. Health data — including period tracking, mood logs, and journal entries — is entirely private to your daughter. The school sees only aggregated, anonymised wellness engagement data, never individual student health information."
              },
              {
                q: "What age is the app suitable for?",
                a: "Infano is designed for girls aged 10 to 21. Content is segmented by age group and unlocks progressively. A 10-year-old and a 19-year-old will have completely different, age-appropriate experiences on the platform."
              },
              {
                q: "What if my daughter encounters something that upsets her?",
                a: "Infano is a closed, moderated environment. All content is pre-approved by our expert council. However, if your daughter ever encounters something that concerns her — or if she raises a concern about herself — our system flags it and our team responds within hours. You will be notified (with her consent) if there is a welfare concern."
              },
              {
                q: "Can I see what she's doing on the app?",
                a: "You have access to a parent dashboard that shows her learning journey progress, badges earned, and community engagement. Her private health data and journal entries are not visible to you — or to anyone else. This privacy is intentional: research shows girls engage more honestly and benefit more when they have a private space of their own."
              },
              {
                q: "How much does it cost for a family?",
                a: "We offer monthly and annual subscription plans at accessible pricing. Families whose school is a partner school often receive subsidised or free access as part of the school partnership. See our pricing page or contact us for details."
              },
              {
                q: "Is there a trial available?",
                a: "Yes. We offer a 14-day free trial for all direct family enrolments. No credit card required to start."
              }
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-white shadow-sm">
                <h4 className="text-lg font-bold mb-3 text-foreground">{faq.q}</h4>
                <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
