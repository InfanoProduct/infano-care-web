'use client';

import { CheckCircle2 } from 'lucide-react';

export function BookAbout() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900">
            Why every girl deserves this guide.
          </h2>
          <p className="text-base md:text-lg text-slate-500 leading-relaxed font-medium">
            Most books for girls either treat them as too young to know the truth or too fragile to handle it.
            The Infano book speaks to girls as the intelligent, curious, and capable young women they are.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Medically Accurate", desc: "Verified by doctors and counsellors for age-appropriate accuracy." },
            { title: "Culturally Aware", desc: "Designed specifically for the nuances of modern Indian families." },
            { title: "Interactive Growth", desc: "Packed with exercises that spark confidence and reflection." }
          ].map((item, i) => (
            <div key={i} className="bg-[#FAF9FF] p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <CheckCircle2 className="text-emerald-500 mb-4" size={24} />
              <h3 className="font-bold font-heading text-lg mb-2 text-slate-900 tracking-tight">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
