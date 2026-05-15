"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Sparkles, Quote, Beaker, Users, ShieldCheck, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Section 2.1 — Premium Hero */}
      <section className="relative pt-20 pb-24 lg:pt-20 lg:pb-20 overflow-hidden bg-[#FAF9FF]">
        {/* Decorative Background Graphics */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Large Soft Circles */}
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white rounded-full opacity-50" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white rounded-full opacity-50" />

          {/* Geometric Graphic Elements */}
          <div className="absolute top-[15%] right-[10%] w-32 h-32 border border-primary/10 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 border border-primary/5 rounded-full" />
          </div>

          <div className="absolute bottom-[20%] left-[15%] flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1.5 h-12 bg-primary/10 rounded-full" style={{ opacity: 1 - i * 0.3 }} />
            ))}
          </div>

          <div className="absolute top-[40%] right-[15%] grid grid-cols-4 gap-4 opacity-20">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
            ))}
          </div>

          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #6366f1 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-2 items-center">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3 px-4 py-1.5 bg-white border border-slate-100 rounded-full mb-12 shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles size={10} className="text-primary" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Our Founding Philosophy</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900"
              >
                We started because we <br />
                <span className="text-primary">remembered</span> what it <br /> felt like.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-base md:text-md text-slate-500 leading-relaxed font-medium mb-8 max-w-lg"
              >
                Infano.care was born from a deeply personal understanding of what adolescent girls go through—and a fierce belief that they deserve better tools, better conversations, and better support.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative aspect-video lg:aspect-video rounded-3xl overflow-hidden shadow-xl"
            >
              <Image
                src="/aboutUs.png"
                alt="Our founding story"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2.2 — Our Story (Editorial Layout) */}
      <section className="py-32 bg-[#FAF9FF] relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <div className="grid lg:grid-cols-12 gap-20 items-start">
            {/* Left Column: High-impact Quote */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 relative"
            >
              <div className="absolute -top-10 -left-10 text-primary/10">
                <Quote size={120} />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-8 leading-tight tracking-tight">
                  "We are not a one-size-fits-all solution. We are a living, breathing community."
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Heart size={20} className="fill-current" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">The Infano Team</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Banglore, India</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Narrative */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-7 prose prose-lg prose-slate"
            >
              <p className="text-xl text-slate-500 font-medium leading-relaxed mb-8">
                Infano.care started with a simple observation: the journey from girlhood to womanhood is one of the most complex transitions a human being can make—and yet most girls make it almost entirely alone.
              </p>
              <div className="space-y-6 text-slate-500">
                <p>
                  Our founders, a team of educators, mental health professionals, technologists, and women who remember their own adolescence, came together with a singular mission: to create the ecosystem they wished had existed for them.
                </p>
                <p>
                  We spent years speaking with girls, listening to parents, partnering with schools, and working with experts in psychology, medicine, and education. What emerged is Infano.care—a platform that meets girls where they are, speaks their language, and grows with them.
                </p>
                <p>
                  Today, we are India's leading wellness movement for girls, serving thousands across the country through our app, our school curriculum, and our community initiatives.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2.3 — Mission & Values (Bento Grid) */}
      <section className="py-32 bg-white relative">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[240px]">
            {/* Our Mission - Large Feature Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-8 md:row-span-2 bg-[#F3F0FF] rounded-[3rem] p-12 md:p-16 flex flex-col justify-center relative overflow-hidden group"
            >
              <div className="absolute top-10 right-10 w-24 h-24 bg-white/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="text-5xl mb-8">🎯</div>
              <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Our Mission</h3>
              <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl font-medium">
                To empower every adolescent and young adult girl to become an independent, confident, and empowered woman—through knowledge, community, and care.
              </p>
            </motion.div>

            {/* Our Vision - Tall Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-4 md:row-span-2 bg-[#E8F9F1] rounded-[3rem] p-10 flex flex-col justify-between"
            >
              <div>
                <div className="text-4xl mb-6">🔭</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  A world where no girl grows up feeling alone in her journey—where every question is welcomed and every emotion is valid.
                </p>
              </div>
              <div className="h-1 w-12 bg-emerald-200 rounded-full" />
            </motion.div>

            {/* Our Philosophy - Wide Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-6 md:row-span-1 bg-[#E0F2FE] rounded-[3rem] p-10 flex items-center gap-8"
            >
              <div className="text-4xl">💜</div>
              <div>
                <h3 className="text-xl font-bold font-heading text-slate-900 mb-2 tracking-tight">Girl-First Design</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Every product and piece of content is created with her dignity and agency at the centre.
                </p>
              </div>
            </motion.div>

            {/* Our Promise - Wide Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-6 md:row-span-1 bg-[#FEF3E2] rounded-[3rem] p-10 flex items-center gap-8"
            >
              <div className="text-4xl">🔒</div>
              <div>
                <h3 className="text-xl font-bold font-heading text-slate-900 mb-2 tracking-tight">Our Promise</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Safe. Expert-backed. Stigma-free. A space where her questions are celebrated.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2.4 — Meet Our Expert Council (Premium Cards) */}
      <section className="py-32 bg-slate-50/50">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight text-slate-900"
            >
              Meet Our <span className="text-primary">Expert Council</span>
            </motion.h2>
            <p className="text-lg text-slate-500 font-medium">
              Everything on Infano.care is developed with, and reviewed by, qualified professionals in their fields.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Dr. Ananya Sharma',
                qual: 'MBBS, MD (Gynaecology)',
                spec: 'Menstrual Health Specialist',
                quote: 'I joined Infano because I was tired of girls arriving in my clinic ashamed of questions they should have felt free to ask.',
                profileImage: "/experts/expert.jpeg"
              },
              {
                name: 'Preethi Nair',
                qual: 'M.Phil, Clinical Psychology',
                spec: 'Adolescent Mental Health',
                quote: 'Adolescence is not a problem to be solved—it is a chapter to be supported. Infano makes that support accessible.',
                profileImage: "/experts/expert.jpeg"
              },
              {
                name: 'Ritu Mehrotra',
                qual: 'MEd, Curriculum Design',
                spec: 'Holistic Education Lead',
                quote: 'We designed the learning journeys to feel like stories, not lessons—because girls learn best when they feel seen.',
                profileImage: "/experts/expert.jpeg"
              },
            ].map((expert, idx) => (
              <motion.div
                key={expert.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 group transition-all"
              >
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative w-20 h-20 rounded-[1.25rem] overflow-hidden shadow-lg border border-slate-100 flex-shrink-0 group-hover:shadow-primary/20 transition-all duration-500">
                    <Image
                      src={expert.profileImage}
                      alt={expert.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold font-heading text-slate-900 mb-1 tracking-tight">{expert.name}</h4>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">{expert.qual}</span>
                      <span className="text-xs font-bold text-slate-500">{expert.spec}</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Quote size={20} className="text-primary/20 absolute -top-4 -left-2" />
                  <p className="text-slate-500 leading-relaxed font-medium italic relative z-10 pl-4 border-l-2 border-primary/10">
                    {expert.quote}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2.5 — Our Approach (Elegant Light Theme) */}
      <section className="py-32 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center mb-24">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight text-slate-900"
            >
              Built on evidence. <br />
              <span className="text-slate-400 font-medium italic">Delivered with heart.</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Beaker,
                title: "Evidence-Based",
                desc: "Grounded in adolescent psychology and trauma-informed care principles.",
                color: "bg-[#F3F0FF]",
                iconColor: "text-indigo-600"
              },
              {
                icon: Users,
                title: "Co-Created",
                desc: "Every feature is tested with real girls to ensure it speaks their language.",
                color: "bg-[#FFF0F3]",
                iconColor: "text-rose-600"
              },
              {
                icon: ShieldCheck,
                title: "Safety First",
                desc: "End-to-end encrypted and COPPA-aligned with strict moderation.",
                color: "bg-[#F0FFF4]",
                iconColor: "text-emerald-600"
              },
              {
                icon: Globe,
                title: "Local Context",
                desc: "Designed for the Indian context, sensitive to regional and cultural norms.",
                color: "bg-[#FFF9F0]",
                iconColor: "text-amber-600"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`p-10 rounded-[2.5rem] ${item.color} group hover:scale-[1.02] transition-all duration-500`}
              >
                <div className={`w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${item.iconColor}`}>
                  <item.icon size={32} />
                </div>
                <h4 className="text-xl font-bold font-heading text-slate-900 mb-4 tracking-tight">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2.5 — Crew Behind the Scene */}
      <section className="py-32 bg-slate-50/80">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight text-slate-900"
            >
              Crew <span className="text-primary italic">Behind the Scene</span>
            </motion.h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl">
              Meet the dreamers, builders, and believers working tirelessly to create a safer, kinder world for every girl.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: 'Sanat Kumar', role: 'Founder & CEO', image: '/experts/roushi.jpeg' },
              { name: 'Priya Verma', role: 'Operations Head', image: '/experts/nikhil.jpeg' },
              { name: 'Dr. Sameer', role: 'Medical Director', image: '/experts/expert.jpg' },
              { name: 'Ananya Rao', role: 'Community Manager', image: '/experts/expert.jpg' },
              { name: 'Rohan Gupta', role: 'Tech Lead', image: '/experts/expert.jpg' },
              { name: 'Sonal Singh', role: 'Content Strategist', image: '/experts/expert.jpg' },
              { name: 'Vikram Mehra', role: 'Product Designer', image: '/experts/expert.jpg' },
              { name: 'Nisha Kapoor', role: 'User Research', image: '/experts/expert.jpg' },
              { name: 'Arjun Das', role: 'Growth Lead', image: '/experts/expert.jpg' },
              { name: 'Meera Iyer', role: 'Partnerships', image: '/experts/expert.jpg' },
            ].map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500"
              >
                <div className="p-3 pb-0">
                  <div className="relative aspect-square rounded-2xl overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="text-sm font-bold text-slate-900 mb-0.5 leading-tight">{member.name}</h4>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{member.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2.6 — Why Now? (Pastel CTA) */}
      <section className="py-20 bg-[#FFFBF7] relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-[#FEF3E2] blur-[120px] rounded-full opacity-50" />
          <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-primary/5 blur-[100px] rounded-full opacity-50" />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-12 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl shadow-orange-900/5 text-2xl"
          >
            🇮🇳
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900"
          >
            India has over 120 million <br /> adolescent girls.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-md text-slate-500 leading-relaxed font-medium mb-8"
          >
            Most navigate puberty, body image, and mental health without safe, accurate support.
            Infano.care is the responsible, expert-backed alternative that parents trust, schools adopt, and girls love.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/contact" className="px-12 py-6 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-primary transition-all shadow-2xl shadow-slate-900/20 active:scale-95 inline-flex items-center gap-3 group">
              Join Our Mission <ArrowRight className="transition-transform group-hover:translate-x-2" size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
