'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

const testimonials = [
  {
    quote: "Before Infano, I thought what I was feeling was just me being dramatic. Now I know my emotions are real — and I have the tools to understand them.",
    author: "Priya, 15",
    location: "Mumbai, India",
    bgColor: "bg-[#F3F0FF]",
    span: "md:col-span-8",
    isLarge: true
  },
  {
    quote: "I used to hide in the back of the class. Now, I feel confident enough to raise my hand and share my thoughts without fear.",
    author: "Ananya, 14",
    location: "Bangalore, India",
    bgColor: "bg-[#E8F9F1]",
    span: "md:col-span-4"
  },
  {
    quote: "Learning about my body and health in a safe space has given me so much confidence. I feel empowered every day.",
    author: "Sara, 16",
    location: "Delhi, India",
    bgColor: "bg-[#E0F2FE]",
    span: "md:col-span-4"
  },
  {
    quote: "The workshops on emotional intelligence helped me navigate tough times. I feel much more resilient now.",
    author: "Diya, 15",
    location: "Hyderabad, India",
    bgColor: "bg-[#FEF3E2]",
    span: "md:col-span-4"
  },
  {
    quote: "Seeing my daughter grow more self-assured and happy is the greatest gift. Infano has been a blessing for our family.",
    author: "Meera, Parent",
    location: "Pune, India",
    bgColor: "bg-[#FFF1F2]",
    span: "md:col-span-4"
  }
];

function TestimonialCard({ quote, author, location, bgColor, span, isLarge }: {
  quote: string,
  author: string,
  location: string,
  bgColor: string,
  span: string,
  isLarge?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={`${span} ${bgColor} rounded-[2.5rem] ${isLarge ? 'p-10 md:p-16 min-h-[440px]' : 'p-10 min-h-[300px]'} flex flex-col justify-between relative overflow-hidden group`}
    >
      <div className={`absolute top-8 left-8 ${isLarge ? 'text-[12rem]' : 'text-[8rem]'} font-serif text-white/40 select-none leading-none opacity-50`}>“</div>
      <p className={`${isLarge ? 'text-2xl md:text-3xl' : 'text-xl'} font-medium text-slate-900 leading-[1.4] relative z-10 tracking-tight max-w-[90%] mt-8`}>
        "{quote}"
      </p>
      <div className="flex items-center gap-4 relative z-10 mt-8">
        <div className="w-16 h-16 rounded-full bg-slate-900/5 flex items-center justify-center">
          <Users size={28} className="text-slate-400" />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-lg">{author}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{location}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function ImpactSection() {
  return (
    <section className="pt-8 pb-8 lg:pt-10 lg:pb-20 bg-white relative overflow-hidden">
      {/* Graphic Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-sky-50 blur-[140px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-40" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-rose-50 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 opacity-40" />

      {/* Subtle Decorative Circles */}
      <div className="absolute top-20 left-10 w-64 h-64 border border-[#111827]/5 rounded-full" />
      <div className="absolute bottom-40 -right-20 w-96 h-96 border border-[#111827]/5 rounded-full" />
      <div className="absolute top-1/2 right-1/4 w-32 h-32 border border-[#111827]/5 rounded-full" />
      <div className="absolute -bottom-10 left-1/3 w-48 h-48 border border-[#111827]/5 rounded-full" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-slate-900">
            Real girls. <span className="text-primary">Real change.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}

