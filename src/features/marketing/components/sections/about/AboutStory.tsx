"use client";

import { motion } from 'framer-motion';
import { Quote, Heart } from 'lucide-react';

export default function AboutStory() {
  return (
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
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Bangalore, India</p>
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
  );
}
