'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const FOUNDING_BENEFITS = [
  'Infano Team personal welcome visit to your school',
  'Brass founding coin for the principal\'s desk',
  'Your school on every Infano.Care case study',
  'Priority access to new grades & features',
  'CSR partnership introductions',
];

export function FoundingSchoolsSection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

          {/* Left: Invitation Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-[55%]"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-heading">
              A Special Invitation To Founding Schools
            </h2>
            <p className="text-sm text-slate-500  mb-8 leading-relaxed">
              That status is permanent. It will be referenced in every piece of Infano.Care&apos;s national marketing as the program grows across India.
            </p>

            <ul className="space-y-4">
              {FOUNDING_BENEFITS.map((benefit, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                  <span className="text-sm text-slate-700 font-medium">{benefit}</span>
                </motion.li>
              ))}
            </ul>

            {/* Footer brand */}
            <div className="mt-16">
              <div className="relative w-44 h-20 ">
                <Image
                  src="/logo/infano-logo-for-light-bg.png"
                  alt="Infano Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <p className="text-xs text-slate-400 italic">
                Building Confident Girls, One School at a Time
              </p>
            </div>
          </motion.div>

          {/* Right: CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-[45%] flex items-center justify-center"
          >
            <div className="bg-[#F8F4FF] border border-slate-100 rounded-2xl p-8 w-full text-center">
              <p className="text-xs text-slate-500 mb-3 font-medium">
                Your next step:
              </p>
              <h3 className="text-2xl font-bold text-primary mb-5 font-heading leading-tight">
                Schedule a<br />30-minute demo
              </h3>
              <p className="text-sm text-slate-700 font-medium mb-8 leading-relaxed">
                We&apos;ll bring the Student Activity Booklet, the Care KIT, and a live platform walk-through to your school.
              </p>

              <Link
                href="/contact"
                className="btn-primary block w-full text-sm px-8 py-3.5 text-center group shadow-lg shadow-primary/20 mb-4"
              >
                Contact Us Today
              </Link>
              <p className="text-xs text-slate-500">
                infano.care &nbsp;|&nbsp; support@infano.care
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
