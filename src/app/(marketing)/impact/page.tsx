import Link from 'next/link';
import { ArrowRight, Download, Award, Newspaper, Star } from 'lucide-react';

export default function ImpactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Section 8.1 — Hero */}
      <section className="pt-24 pb-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-24 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 leading-tight">
            Numbers tell the story. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-light to-accent-light">Girls live it.</span>
          </h1>
        </div>
      </section>

      {/* Section 8.2 — Impact at a Glance */}
      <section className="py-20 bg-white -mt-10 relative z-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="glass-card bg-white p-8 md:p-12 rounded-3xl shadow-xl grid grid-cols-2 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
            {[
              { num: '10,000+', label: 'Girls Empowered', desc: 'Across partner schools and direct enrolments nationwide' },
              { num: '50+', label: 'Partner Schools', desc: 'From Grades 6–12 across India' },
              { num: '94%', label: 'Confidence Increase', desc: 'Girls report improved confidence and self-worth after 8 weeks' },
              { num: '89%', label: 'Parent Satisfaction', desc: 'Parents feel better connected to their daughter\'s world' },
              { num: '87%', label: 'School Endorsement', desc: 'School leaders report measurable improvements in student wellbeing' },
              { num: '5,000+', label: 'Expert Hours', desc: 'Expert-led circle sessions delivered this year alone' },
            ].map((stat, i) => (
              <div key={i} className={`p-4 ${i > 2 ? 'md:pt-8 md:border-t border-border' : ''} ${i % 2 !== 0 ? 'border-t border-border md:border-t-0' : ''}`}>
                <div className="text-4xl md:text-5xl font-bold font-heading text-primary mb-2">{stat.num}</div>
                <h4 className="font-bold text-foreground mb-2">{stat.label}</h4>
                <p className="text-xs text-muted-foreground">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8.3 — Stories That Matter */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Stories That Matter</h2>
            <p className="text-lg text-muted-foreground">
              Behind every data point is a girl whose world got a little bigger, a little safer, a little more her own. Here are some of their stories.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-border">
              <div className="text-secondary mb-4"><Star fill="currentColor" size={24} /></div>
              <p className="text-muted-foreground leading-relaxed mb-6 italic">
                'I used to dread getting my period at school. I didn't know what to do, who to tell, or what was normal. Then my school introduced Infano. For the first time, I had a tracker that didn't make me feel embarrassed, and a circle of girls who felt exactly the same way. I know my body now. And I'm not scared of it anymore.'
              </p>
              <h4 className="font-bold text-foreground">Aadhya, 13</h4>
              <p className="text-sm text-primary">Jaipur</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-border">
              <div className="text-secondary mb-4"><Star fill="currentColor" size={24} /></div>
              <p className="text-muted-foreground leading-relaxed mb-6 italic">
                'I always felt like I had to be perfect. Good marks, good daughter, good friend. Infano's mental wellness journeys helped me understand that my anxiety wasn't weakness — it was just a part of me that needed care, not hiding. I started the meditation prompts and now I actually sleep.'
              </p>
              <h4 className="font-bold text-foreground">Kavitha, 16</h4>
              <p className="text-sm text-primary">Chennai</p>
            </div>

            <div className="bg-primary text-white p-8 rounded-3xl shadow-sm">
              <div className="text-accent-light mb-4"><Award size={24} /></div>
              <p className="text-primary-100 leading-relaxed mb-6 italic">
                'We piloted Infano with our Grade 7 girls last term. The pastoral team reported a significant reduction in peer conflict and a notable improvement in girls' willingness to seek help. The programme has earned a permanent place in our school calendar.'
              </p>
              <h4 className="font-bold text-white">Principal</h4>
              <p className="text-sm text-accent-light">Oakridge International School</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8.4 — Media & Recognition */}
      <section className="py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-heading mb-4 text-muted-foreground">As seen and recognised by</h2>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 mb-16">
             {/* Placeholders for logos */}
             <div className="text-xl font-bold font-serif">EdTech India</div>
             <div className="text-xl font-bold font-sans tracking-widest uppercase">Parenting Today</div>
             <div className="text-xl font-bold italic">The Health Journal</div>
             <div className="text-xl font-bold border-2 border-current px-2">NEP ALIGNED</div>
             <div className="text-xl font-bold flex items-center gap-2"><Award /> Innovation Award</div>
          </div>

          <div className="max-w-3xl mx-auto text-center border-t border-border pt-12">
             <div className="text-secondary mx-auto mb-4 flex justify-center"><Newspaper size={32} /></div>
             <p className="text-xl md:text-2xl font-medium text-foreground italic mb-6">
               "Infano.care represents the kind of holistic, girl-first thinking that Indian education has needed for decades."
             </p>
             <p className="font-semibold text-primary">— EdTech India</p>
          </div>
        </div>
      </section>

      {/* Section 8.5 — Download Our Impact Report */}
      <section className="py-24 bg-primary/5 text-center">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold font-heading mb-6">Dive Deeper into the Data</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Read our comprehensive annual impact report detailing outcomes across mental wellbeing, physical health awareness, and academic confidence.
          </p>
          <Link href="#" className="btn-primary">
            <Download className="mr-2 inline" size={20} /> Download Full Impact Report (PDF)
          </Link>
        </div>
      </section>

    </div>
  );
}
