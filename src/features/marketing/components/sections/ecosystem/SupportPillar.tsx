'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users, Shield } from 'lucide-react';

export function SupportPillar() {
  return (
    <section className="py-16 lg:py-24 bg-[#FAF9FF] relative overflow-hidden">
      {/* Background Graphics */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_#F3E8FF_0%,_transparent_40%)] opacity-50" />
      <div className="absolute bottom-0 right-0 w-1/2 h-full bg-purple-50/30 skew-x-12 translate-x-1/4" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-purple-900/5 border border-purple-100 shrink-0">
                <Users size={28} />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold font-heading text-slate-900 tracking-tighter leading-none">Expert-Led <br /> Support Circles</h2>
            </div>
            <div className="w-16 h-1 bg-purple-400 rounded-full mb-8" />
            <p className="text-sm md:text-base text-slate-500 mb-10 leading-relaxed font-medium max-w-xl">
              Real experts. Real conversations. Moderated group sessions led by qualified professionals in a safe, anonymous environment.
            </p>

            {/* Mobile Image */}
            <div className="lg:hidden relative mx-auto w-full mb-10">
              <div className="absolute -inset-10 bg-emerald-100/50 blur-[100px] rounded-full scale-75" />
              <Image
                src="/Ecosystem5.png"
                alt="Mobile interface"
                width={500}
                height={500}
                className="object-contain w-[920px] relative z-10"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {[
                { name: 'Wellness Circle', desc: 'Mental health and emotional wellbeing' },
                { name: 'Body Circle', desc: 'Puberty and physical development' },
                { name: 'Ambition Circle', desc: 'Career goals and future planning' },
                { name: 'Bond Circle', desc: 'Healthy relationships and boundaries' }
              ].map((circle) => (
                <div key={circle.name} className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-md hover:shadow-purple-900/5 transition-all group">
                  <h4 className="font-bold font-heading text-slate-900 mb-1 group-hover:text-purple-600 transition-colors text-base tracking-tight">{circle.name}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{circle.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-purple-100 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48  rounded-full blur-3xl" />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                <h4 className="text-xl font-bold font-heading tracking-tight text-slate-900">Safe & Verified</h4>
              </div>
              <p className="text-base text-slate-500 leading-relaxed font-medium">
                Every session is moderated by trained Infano professionals. We ensure a kind, respectful, and safe space for every girl.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden lg:block order-2 lg:order-1 relative"
          >
            <div className="absolute -inset-10 bg-emerald-100/50 blur-[100px] rounded-full scale-75" />
            <div className="relative mx-auto w-full ">
              <Image
                src="/eco-4.png"
                alt="Mobile interface"
                width={500}
                height={600}
                className="object-contain max-h-[400px] lg:max-h-[600px] w-auto mx-auto"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
