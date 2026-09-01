import Link from 'next/link';
import { ArrowRight, ShieldAlert, Heart, Zap, Briefcase, Users, Star, Activity, Rocket } from 'lucide-react';
import Image from 'next/image';
import { PeerBanner } from '@/features/marketing/components/sections/the-circle/PeerBanner';
import { ExpertShowcase } from '@/features/marketing/components/sections/the-circle/ExpertShowcase';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'The Support Circle | Safe Community for Adolescent Girls | Infano Care',
  },
  description: "Join the Infano Support Circle — a secure, moderated peer community and expert-led wellness space designed specifically to empower teenage girls through safe dialogue.",
  openGraph: {
    title: 'The Support Circle | Safe Community for Adolescent Girls | Infano Care',
    description: "Join the Infano Support Circle — a secure, moderated peer community and expert-led wellness space designed specifically to empower teenage girls through safe dialogue.",
    url: 'https://infano.care/the-support-circle',
    images: [
      {
        url: '/og-images/circle-og.png',
        width: 1200,
        height: 630,
        alt: 'Infano Support Circle',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Support Circle | Safe Community for Adolescent Girls | Infano Care',
    description: "Join the Infano Support Circle — a secure, moderated peer community and expert-led wellness space designed specifically to empower teenage girls through safe dialogue.",
    images: ['/og-images/circle-og.png'],
  },
};

const circleServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "The Infano Support Circle",
  "alternateName": "Infano Circle",
  "description": "A secure, fully moderated online community and expert-led wellness space for adolescent girls. Combines live and recorded sessions with qualified professionals across 5 themed circles — wellness, body health, ambition, relationships, and crisis support — with warm peer-to-peer connection through interest groups, peer mentors, and school-exclusive communities. No follower counts, no viral loops, no toxic comparison.",
  "url": "https://infano.care/the-support-circle",
  "image": "https://infano.care/api/og?title=The+Support+Circle&category=Community&author=Infano+Care",
  "serviceType": "Online Peer Community & Expert Wellness Sessions",
  "provider": {
    "@type": "Organization",
    "name": "Infano Care",
    "legalName": "BerryBird Technologies Private Limited",
    "url": "https://infano.care",
    "email": "connect@infano.care"
  },
  "areaServed": { "@type": "Country", "name": "India" },
  "audience": {
    "@type": "Audience",
    "audienceType": "Adolescent girls aged 10–21 and their parents in India"
  },
  "availableChannel": {
    "@type": "ServiceChannel",
    "name": "Join the Circle",
    "serviceUrl": "https://infano.care/contact",
    "availableLanguage": "English"
  },
  "serviceOutput": "Access to 5 expert-led themed circles (live and recorded, 45–60 minutes each), anonymous Q&A with qualified professionals, moderated peer community with interest-based groups, school-exclusive community circles, trained peer mentor 1-on-1 connection, story sharing space, AI and human moderation within 2 hours, session recordings and notes post-session",
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "Content moderation response time", "value": "All posts reviewed by AI and human moderators within 2 hours" },
    { "@type": "PropertyValue", "name": "Crisis support availability", "value": "Crisis Circle staffed by trained counsellors, response within 24 hours" },
    { "@type": "PropertyValue", "name": "Session format", "value": "45–60 minutes, expert-hosted, anonymous Q&A, live polls, recording and notes shared after" },
    { "@type": "PropertyValue", "name": "Peer mentor specialisations available", "value": "Anxiety, academic stress, peer pressure, body image, relationships, self-esteem, bullying, confidence, friendships" }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Expert-Led Circles",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "The Wellness Circle",
        "description": "Live and recorded sessions hosted by clinical psychologists and counsellors. Topics include anxiety, confidence, self-worth, academic stress, and grief. 45–60 minutes with anonymous Q&A.",
        "url": "https://infano.care/the-support-circle",
        "itemOffered": { "@type": "Service", "name": "Wellness Circle — Mental health expert sessions", "provider": { "@type": "Organization", "name": "Infano Care" } },
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "The Body Circle",
        "description": "Live and recorded sessions hosted by gynaecologists and adolescent health doctors. Topics include puberty, periods, PCOS, body image, and nutrition. 45–60 minutes with anonymous Q&A.",
        "url": "https://infano.care/the-support-circle",
        "itemOffered": { "@type": "Service", "name": "Body Circle — Adolescent health and menstrual expert sessions", "provider": { "@type": "Organization", "name": "Infano Care" } },
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "The Ambition Circle",
        "description": "Live and recorded sessions hosted by career mentors and entrepreneurs. Topics include goal-setting, career exploration, leadership, and confidence. 45–60 minutes with anonymous Q&A.",
        "url": "https://infano.care/the-support-circle",
        "itemOffered": { "@type": "Service", "name": "Ambition Circle — Career and leadership mentoring sessions", "provider": { "@type": "Organization", "name": "Infano Care" } },
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "The Relationship Circle",
        "description": "Live and recorded sessions hosted by family therapists. Topics include friendships, family conflict, romantic relationships, and healthy boundaries. 45–60 minutes with anonymous Q&A.",
        "url": "https://infano.care/the-support-circle",
        "itemOffered": { "@type": "Service", "name": "Relationship Circle — Family therapy and healthy relationships sessions", "provider": { "@type": "Organization", "name": "Infano Care" } },
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "The Crisis Circle",
        "description": "Urgent support staffed by trained crisis counsellors. Always available with a response guaranteed within 24 hours. For girls who need immediate, confidential emotional support.",
        "url": "https://infano.care/the-support-circle",
        "itemOffered": { "@type": "Service", "name": "Crisis Circle — Urgent counsellor support within 24 hours", "provider": { "@type": "Organization", "name": "Infano Care" } },
        "availability": "https://schema.org/InStock"
      }
    ]
  }
};

const circleProgramSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalProgram",
  "name": "Infano Peer Mentor Training Programme",
  "alternateName": "PeerLine Mentor Certification",
  "description": "A structured multi-step leadership and mentoring training programme for older adolescent girls who want to guide and support younger girls in the Infano community. Participants complete expert-designed training modules, earn an Infano Peer Mentor certification, and progress through reward tiers for sustained mentoring contribution. Mentors specialise in areas including anxiety, academic stress, body image, relationships, confidence, and bullying prevention.",
  "url": "https://infano.care/dashboard/peer-training",
  "educationalProgramMode": "online",
  "programType": "Peer Mentorship & Leadership Training",
  "typicalAgeRange": "16-21",
  "educationalCredentialAwarded": "Infano Certified Peer Mentor",
  "provider": {
    "@type": "Organization",
    "name": "Infano Care",
    "legalName": "BerryBird Technologies Private Limited",
    "url": "https://infano.care"
  },
  "applicationContact": {
    "@type": "ContactPoint",
    "contactType": "admissions",
    "url": "https://infano.care/dashboard/peer-training",
    "email": "connect@infano.care"
  },
  "occupationalCategory": "Peer Support, Adolescent Wellness Mentoring",
  "programPrerequisites": {
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "Infano platform member in good standing, older adolescent girl with lived experience"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR",
    "description": "Free to apply. Includes multi-step expert training, Infano Certified Peer Mentor credential, reward tier progression, and leadership skill development.",
    "availability": "https://schema.org/InStock",
    "url": "https://infano.care/dashboard/peer-training"
  },
  "hasCourse": [
    {
      "@type": "Course",
      "name": "Anxiety & Academic Stress Mentoring",
      "description": "Training to support girls navigating exam pressure, academic anxiety, and peer stress. Includes evidence-based listening techniques and safe escalation protocols.",
      "provider": { "@type": "Organization", "name": "Infano Care" }
    },
    {
      "@type": "Course",
      "name": "Body Image & Self-Esteem Mentoring",
      "description": "Training in body-positive communication, self-worth conversations, and supporting girls with body image challenges during adolescence.",
      "provider": { "@type": "Organization", "name": "Infano Care" }
    },
    {
      "@type": "Course",
      "name": "Bullying, Confidence & Friendships Mentoring",
      "description": "Training to help girls find their voice, set healthy boundaries, and navigate bullying and social dynamics with resilience.",
      "provider": { "@type": "Organization", "name": "Infano Care" }
    }
  ]
};

export default function TheCirclePage() {

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(circleServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(circleProgramSchema) }}
      />
      {/* Section 6.1 — Hero */}
      <section className="pt-20 pb-20 bg-primary/5 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-accent/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="flex flex-col text-center lg:text-left">
              <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-6 inline-block animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both">
                The Infano Support Circle
              </span>
              <h1
                className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
                style={{ animationDelay: '100ms' }}
              >
                Every girl needs a circle. <br className="hidden lg:block" />
                <span className="text-primary">We help her build one.</span>
              </h1>
              <p
                className="text-base md:text-md text-slate-500 leading-relaxed font-medium mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
                style={{ animationDelay: '200ms' }}
              >
                The Infano Support Circle is where expertise meets community. From live sessions with qualified professionals to warm, peer-to-peer connection — it's the space where girls feel truly understood.
              </p>

              <div
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
                style={{ animationDelay: '300ms' }}
              >
                <Link href="#peer-mentors" className="btn-primary text-base px-12 py-4 w-full sm:w-auto shadow-xl shadow-primary/20 group">
                  I want to connect <ArrowRight size={20} className="ml-2 inline-block transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right Hero Image */}
            <div
              className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/10 border-8 border-white/40 animate-in fade-in zoom-in-95 duration-700 fill-mode-both"
              style={{ animationDelay: '150ms' }}
            >
              <Image
                src="/circle-hero-img.png"
                alt="Girls sitting in a circle"
                fill
                className="object-cover"
                priority
                unoptimized
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
              {
                icon: Heart,
                title: 'The Wellness Circle',
                desc: 'Hosted by clinical psychologists and counsellors. Topics: anxiety, confidence, self-worth, academic stress, grief.',
                colorStyles: {
                  bg: 'bg-primary/5',
                  border: 'border-primary/10',
                  hoverBorder: 'hover:border-primary/30',
                  shadow: 'hover:shadow-primary/5',
                  iconBg: 'bg-primary/10 text-primary',
                }
              },
              {
                icon: Activity,
                title: 'The Body Circle',
                desc: 'Hosted by gynaecologists and adolescent health doctors. Topics: puberty, periods, PCOS, body image, nutrition.',
                colorStyles: {
                  bg: 'bg-accent/5',
                  border: 'border-accent/10',
                  hoverBorder: 'hover:border-accent/30',
                  shadow: 'hover:shadow-accent/5',
                  iconBg: 'bg-accent/10 text-accent',
                }
              },
              {
                icon: Rocket,
                title: 'The Ambition Circle',
                desc: 'Hosted by career mentors and entrepreneurs. Topics: goal-setting, career exploration, leadership, confidence.',
                colorStyles: {
                  bg: 'bg-indigo-50/40',
                  border: 'border-indigo-100',
                  hoverBorder: 'hover:border-indigo-300',
                  shadow: 'hover:shadow-indigo-500/5',
                  iconBg: 'bg-indigo-100 text-indigo-600',
                }
              },
              {
                icon: Users,
                title: 'The Relationship Circle',
                desc: 'Hosted by family therapists. Topics: friendships, family conflict, romantic relationships, healthy boundaries.',
                colorStyles: {
                  bg: 'bg-rose-50/40',
                  border: 'border-rose-100',
                  hoverBorder: 'hover:border-rose-300',
                  shadow: 'hover:shadow-rose-500/5',
                  iconBg: 'bg-rose-100 text-rose-600',
                }
              },
              {
                icon: ShieldAlert,
                title: 'The Crisis Circle',
                desc: 'Available for urgent support. Staffed by trained crisis counsellors. Always available within 24 hours.',
                colorStyles: {
                  bg: 'bg-red-50/50',
                  border: 'border-red-100',
                  hoverBorder: 'hover:border-red-300',
                  shadow: 'hover:shadow-red-500/5',
                  iconBg: 'bg-red-100 text-red-600',
                }
              },
            ].map((circle) => {
              const Icon = circle.icon;
              return (
                <div
                  key={circle.title}
                  className={`group p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${circle.colorStyles.bg} ${circle.colorStyles.border} ${circle.colorStyles.hoverBorder} ${circle.colorStyles.shadow}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 ${circle.colorStyles.iconBg}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold font-heading mb-3 tracking-tight text-slate-900">{circle.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{circle.desc}</p>
                </div>
              );
            })}
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


      {/* Section 6.3.8 — Verified Experts Showcase & Booking */}
      <ExpertShowcase />

      {/* Section 6.4 — Peer Banner */}
      <PeerBanner />

    </div>
  );
}
