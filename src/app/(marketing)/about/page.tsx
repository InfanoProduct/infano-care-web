import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Section 2.1 — Hero */}
      <section className="pt-24 pb-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 text-foreground">
            We started because we remembered what it felt like.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Infano.care was born from a deeply personal understanding of what adolescent girls go through — and a fierce belief that they deserve better tools, better conversations, and better support.
          </p>
        </div>
      </section>

      {/* Section 2.2 — Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="prose prose-lg text-muted-foreground prose-p:leading-relaxed mx-auto">
            <p>
              <strong className="text-foreground">Infano.care started with a simple observation:</strong> the journey from girlhood to womanhood is one of the most complex transitions a human being can make — and yet most girls make it almost entirely alone.
            </p>
            <p>
              Our founders, a team of educators, mental health professionals, technologists, and women who remember their own adolescence, came together with a singular mission: to create the ecosystem they wished had existed for them.
            </p>
            <p>
              We spent years speaking with girls, listening to parents, partnering with schools, and working with experts in psychology, medicine, and education. What emerged is Infano.care — a platform that meets girls where they are, speaks their language, and grows with them.
            </p>
            <p className="text-xl font-semibold text-primary italic text-center my-10">
              "We are not a one-size-fits-all solution. We are a living, breathing community — part app, part curriculum, part book, part family."
            </p>
          </div>
        </div>
      </section>

      {/* Section 2.3 — Mission, Vision & Values */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-10 rounded-3xl">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold font-heading mb-3">Our Mission</h3>
              <p className="text-muted-foreground">
                To empower every adolescent and young adult girl to become an independent, confident, and empowered woman — through knowledge, community, and care.
              </p>
            </div>
            <div className="glass-card p-10 rounded-3xl">
              <div className="text-4xl mb-4">🔭</div>
              <h3 className="text-2xl font-bold font-heading mb-3">Our Vision</h3>
              <p className="text-muted-foreground">
                A world where no girl grows up feeling alone in her journey — where every question is welcomed, every emotion is valid, and every girl has access to the tools she needs to thrive.
              </p>
            </div>
            <div className="glass-card p-10 rounded-3xl">
              <div className="text-4xl mb-4">💜</div>
              <h3 className="text-2xl font-bold font-heading mb-3">Our Philosophy</h3>
              <p className="text-muted-foreground">
                We believe in girl-first design. Every product, every piece of content, every feature is created with the girl at the centre — her dignity, her safety, and her agency above all.
              </p>
            </div>
            <div className="glass-card p-10 rounded-3xl">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold font-heading mb-3">Our Promise</h3>
              <p className="text-muted-foreground">
                Safe. Expert-backed. Stigma-free. We are a space where questions are celebrated, emotions are honoured, and every girl is seen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2.4 — Meet Our Expert Council */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Meet Our Expert Council</h2>
            <p className="text-lg text-muted-foreground">
              Everything on Infano.care is developed with, and reviewed by, qualified professionals in their fields.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Dr. Ananya Sharma',
                qual: 'MBBS, MD (Obstetrics & Gynaecology)',
                spec: 'Menstrual Health & Adolescent Medicine',
                quote: 'I joined Infano because I was tired of girls arriving in my clinic ashamed of questions they should have felt free to ask years earlier.',
              },
              {
                name: 'Preethi Nair',
                qual: 'M.Phil, Clinical Psychology',
                spec: 'Adolescent Mental Health & CBT',
                quote: 'Adolescence is not a problem to be solved — it is a chapter to be supported. Infano makes that support accessible to every girl.',
              },
              {
                name: 'Ritu Mehrotra',
                qual: 'MEd, Curriculum Design',
                spec: 'Holistic Education & Life Skills',
                quote: 'We designed the learning journeys to feel like stories, not lessons — because girls learn best when they feel seen in the narrative.',
              },
            ].map((expert) => (
              <div key={expert.name} className="border border-border rounded-3xl p-8 hover:shadow-lg transition-shadow bg-white">
                <div className="w-20 h-20 bg-secondary/20 rounded-full mb-6 mx-auto"></div>
                <div className="text-center">
                  <h4 className="text-xl font-bold mb-1">{expert.name}</h4>
                  <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">{expert.qual}</p>
                  <p className="text-sm font-medium text-foreground mb-6">{expert.spec}</p>
                  <p className="text-sm text-muted-foreground italic">"{expert.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2.5 — Our Approach */}
      <section className="py-24 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-white">
              Built on evidence. Delivered with heart.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl mb-4">🧪</div>
              <h4 className="text-white font-bold mb-2">Evidence-Based</h4>
              <p className="text-sm">Grounded in adolescent psychology, gender-responsive education, and trauma-informed care principles.</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🗣️</div>
              <h4 className="text-white font-bold mb-2">Co-Created with Girls</h4>
              <p className="text-sm">Every feature, journey, and piece of content is tested with real girls before launch.</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🛡️</div>
              <h4 className="text-white font-bold mb-2">Safety First</h4>
              <p className="text-sm">End-to-end encrypted, COPPA-aligned, with strict moderation and no ads or third-party data sharing.</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🌍</div>
              <h4 className="text-white font-bold mb-2">Culturally Relevant</h4>
              <p className="text-sm">Designed for the Indian context — available in multiple languages, sensitive to regional norms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2.6 — Why Now? */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold font-heading mb-6">Why Now?</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            India has over 120 million adolescent girls. Most of them navigate puberty, relationships, academic stress, body image, and mental health without adequate support. The digital revolution has put unprecedented information at their fingertips — but not all of it is safe, accurate, or kind.
            <br /><br />
            Infano.care is the responsible, expert-backed alternative. We are building the platform that parents can trust, schools can adopt, and girls can love.
          </p>
          <Link href="/contact" className="btn-primary">
            Join Our Mission <ArrowRight className="ml-2 inline" size={20} />
          </Link>
        </div>
      </section>

    </div>
  );
}
