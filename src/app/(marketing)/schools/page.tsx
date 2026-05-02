import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileText, Activity, BookOpen, Lock, Globe2, Heart } from 'lucide-react';

export default function SchoolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Section 4.1 — Hero */}
      <section className="pt-24 pb-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 leading-tight">
            Your school shapes futures. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent-light">Let us help shape the whole girl.</span>
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto mb-10">
            The Infano School Partnership Programme gives your institution a structured, expert-backed, and curriculum-integrated approach to adolescent girl wellness, life skills, and empowerment. Simple to implement. Measurable in impact. Transformative in outcome.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact" className="btn-primary">
              Apply for a School Partnership <ArrowRight className="ml-2 inline" size={20} />
            </Link>
            <Link href="#" className="px-6 py-3 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors">
              Download the Brochure (PDF)
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4.2 — Why Schools Choose Infano */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-foreground">
              What CBSE, ICSE, and IB schools across India are saying:
            </h2>
          </div>

          <div className="max-w-4xl mx-auto glass-card bg-primary/5 p-10 rounded-3xl mb-16 text-center border-primary/10">
            <p className="text-xl md:text-2xl font-medium text-foreground italic mb-6 leading-relaxed">
              "We've always cared about our girls' academic success. Infano helped us realise we were missing half the equation — their emotional and physical wellness. Within one term, our pastoral team noticed a measurable difference."
            </p>
            <p className="font-semibold text-primary">— Principal, Delhi Public School</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <BookOpen className="text-primary mb-4" size={32} />, title: 'Curriculum-Aligned', desc: 'Mapped to NEP 2020 wellness and life skills frameworks' },
              { icon: <Activity className="text-accent mb-4" size={32} />, title: 'Data-Backed Reports', desc: 'School-level impact dashboards and termly insight reports' },
              { icon: <UsersIcon className="text-secondary mb-4" size={32} />, title: 'Teacher-Ready', desc: 'No extra burden on staff — we handle content, facilitation, and tracking' },
              { icon: <Lock className="text-slate-600 mb-4" size={32} />, title: 'Fully Safe', desc: 'DPDP Act compliant, end-to-end encrypted, with strict content moderation' },
              { icon: <Globe2 className="text-blue-500 mb-4" size={32} />, title: 'Multilingual', desc: 'Available in English, Hindi, Tamil, Telugu, Marathi, and more' },
              { icon: <Heart className="text-pink-500 mb-4" size={32} />, title: 'Holistic & Inclusive', desc: 'Addresses mental health, menstrual wellness, life skills, and community' },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                {feature.icon}
                <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4.3 — The Partnership Model */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Flexible enough to fit your school. Structured enough to deliver results.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Option A */}
            <div className="bg-white p-8 rounded-3xl border border-border shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-foreground mb-2">Option A</h3>
              <div className="text-2xl font-bold font-heading text-primary mb-6">Digital-First Programme</div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  'App access for all enrolled girls (Grades 6–12)',
                  'School-branded experience with your logo and colours',
                  'Teacher dashboard with student progress visibility',
                  'Monthly school impact report',
                  'Quarterly virtual check-in with Infano team',
                  'Annual student and teacher appreciation recognition'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary shrink-0 mt-0.5" size={18} />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="btn-outline w-full">Enquire Now</Link>
            </div>

            {/* Option B */}
            <div className="bg-white p-8 rounded-3xl border-2 border-secondary shadow-xl relative flex flex-col transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">Recommended</div>
              <h3 className="text-xl font-bold text-foreground mb-2 mt-2">Option B</h3>
              <div className="text-2xl font-bold font-heading text-secondary mb-6">Blended Programme</div>
              <p className="text-sm font-medium mb-4 text-slate-800">Everything in Option A, plus:</p>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  'Monthly in-app expert circle sessions specific to your school',
                  'Bulk copies of the Infano book for all enrolled students',
                  'Curriculum integration support with lesson plan templates',
                  'Dedicated school success manager',
                  'Optional parent engagement workshops (2 per term)'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-secondary shrink-0 mt-0.5" size={18} />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="btn-secondary w-full">Enquire Now</Link>
            </div>

            {/* Option C */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-300 mb-2">Option C</h3>
              <div className="text-2xl font-bold font-heading text-white mb-6">Premium Partnership</div>
              <p className="text-sm font-medium mb-4 text-slate-400">Everything in Option B, plus:</p>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  'On-campus orientation workshop for girls and teachers',
                  'Custom content module designed for your school\'s specific needs',
                  'Leadership and peer mentor training for senior girls',
                  'Annual school impact presentation to board/trustees',
                  'Recognised as an \'Infano Partner School\' with digital badge and certificate'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-accent shrink-0 mt-0.5" size={18} />
                    <span className="text-sm text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="px-6 py-3 bg-white text-slate-900 rounded-full font-semibold transition-all hover:bg-slate-200 active:scale-95 text-center w-full">Enquire Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4.4 — How It Works: Onboarding in 4 Steps */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Onboarding in 4 Steps</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-10 right-10 h-0.5 bg-slate-100 z-0"></div>
            {[
              { num: '1️⃣', title: 'Apply & Consult', desc: 'Submit an expression of interest. We schedule a 45-minute consultation call to understand your school\'s needs.' },
              { num: '2️⃣', title: 'Customise', desc: 'We work with your pastoral/wellness team to configure the programme — age groups, language, modules, and goals.' },
              { num: '3️⃣', title: 'Launch', desc: 'We onboard your students and teachers. We handle all technical setup. Your school is live within 2 weeks.' },
              { num: '4️⃣', title: 'Grow', desc: 'Monthly reports, quarterly check-ins, and ongoing expert support ensure the programme delivers lasting impact.' },
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white border-4 border-primary/20 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">
                  {step.num}
                </div>
                <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4.5 — NEP 2020 Alignment */}
      <section className="py-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">NEP 2020 Alignment</h2>
            <p className="text-lg text-primary-100 leading-relaxed mb-8">
              The National Education Policy 2020 places significant emphasis on holistic development, socio-emotional learning, health and wellness, and the cultivation of 21st-century life skills. Infano.care is specifically designed to complement these goals — providing structured, measurable, and age-appropriate programming that fills the gaps that traditional curriculum cannot address.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Socio-Emotional Learning (SEL)', desc: "Infano's core journeys directly address SEL competencies" },
              { title: 'Health & Wellness', desc: 'Menstrual and mental wellness tracker addresses WHO adolescent health guidelines' },
              { title: 'Life Skills Education', desc: '20+ life skill modules across communication, resilience, financial literacy, and self-awareness' },
              { title: 'Gender Equity', desc: 'All content is gender-responsive and promotes positive self-identity' },
            ].map((area) => (
              <div key={area.title} className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm">
                <h4 className="font-bold mb-2">{area.title}</h4>
                <p className="text-sm text-primary-100">{area.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4.6 — FAQ for Schools */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-heading mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Questions about pricing, burden, or safety? We've compiled answers to the most common questions school administrators ask us.
            </p>
          </div>
          
          <div className="space-y-6 mb-16">
            {[
              {
                q: "How is Infano different from other school wellness programmes?",
                a: "Most school wellness programmes are one-off workshops or static resources. Infano is a living ecosystem — it learns with your girls, grows with them over time, and delivers continuous, personalised support through technology, community, and expert guidance. We are not a box to tick. We are a long-term partner in your students' development."
              },
              {
                q: "Do we need technical infrastructure to implement Infano?",
                a: "No. Infano runs on any smartphone or tablet. We provide login credentials for all enrolled students and teachers. There is no installation or IT burden on your school. We handle all setup, onboarding, and technical support."
              },
              {
                q: "Can we customise the content for our school's values?",
                a: "Yes. Our Blended and Premium Partnership tiers include custom content modules aligned to your school's ethos, language preference, and specific student needs. We work closely with your pastoral team to ensure the programme feels like an extension of your school."
              },
              {
                q: "What safeguarding protocols does Infano have in place?",
                a: "Infano has a comprehensive Child Safety Policy developed with guidance from child psychologists and legal advisors. The platform is a closed environment with no external links or unmoderated spaces. We have a 24-hour escalation protocol for any disclosures of harm, with immediate notification to school authorities and, where required, appropriate agencies. All staff are DBS-equivalent cleared."
              },
              {
                q: "Is the programme aligned with NEP 2020?",
                a: "Yes. Infano is specifically designed to support the NEP 2020 goals of holistic development, socio-emotional learning, health and wellness, and 21st-century life skills. We can provide a detailed alignment document on request."
              }
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-white shadow-sm">
                <h4 className="text-lg font-bold mb-3 text-foreground">{faq.q}</h4>
                <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/contact" className="btn-primary">
              Apply for a School Partnership <ArrowRight className="ml-2 inline" size={20} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
