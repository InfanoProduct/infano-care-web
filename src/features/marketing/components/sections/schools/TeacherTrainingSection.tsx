'use client';

import { motion } from 'framer-motion';
import { 
  HeartPulse, 
  MessageCircle, 
  ShieldAlert, 
  Users, 
  HandHeart, 
  Smartphone 
} from 'lucide-react';

const TRAINING_TOPICS = [
  {
    title: 'Puberty & Menstruation Literacy',
    desc: 'What teachers must know—and the exact language to use.',
    icon: HeartPulse,
    color: 'text-pink-500',
  },
  {
    title: 'Recognising Anxiety & Depression',
    desc: 'Quiet signs. What to say. When to escalate.',
    icon: MessageCircle,
    color: 'text-blue-500',
  },
  {
    title: 'POCSO & Mandatory Reporting',
    desc: 'Legal obligations. Word-for-word scripts for every scenario.',
    icon: ShieldAlert,
    color: 'text-orange-500',
  },
  {
    title: 'Supporting LGBTQ+ Students',
    desc: 'Not advocacy — basic dignity and whatnot to say.',
    icon: Users,
    color: 'text-purple-500',
  },
  {
    title: 'Responding to Self-Harm',
    desc: 'Support, not punishment. How to get the right help immediately.',
    icon: HandHeart,
    color: 'text-rose-500',
  },
  {
    title: 'Digital Safety in the Classroom',
    desc: 'How to talk about cyberbullying and consent online.',
    icon: Smartphone,
    color: 'text-slate-500',
  },
];

export function TeacherTrainingSection() {
  return (
    <section className="py-24 bg-[#FAF9FF] relative overflow-hidden">
      {/* Decorative Arcs */}
      <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 opacity-[0.05] pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="200" r="150" fill="#4A1E7F" />
          <circle cx="0" cy="200" r="170" stroke="#E67E22" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:max-w-xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-heading">
              Teacher Training
            </h2>
            <p className="text-base md:text-md text-slate-500 font-medium">
              Your Staff Becomes Your Girl&apos;s First Line Of Support
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/70 backdrop-blur-sm p-8 rounded-[2rem] border border-white shadow-sm flex items-center gap-8 max-w-md"
          >
            <span className="text-7xl font-black text-[#E67E22] leading-none">7%</span>
            <p className="text-slate-600 font-medium leading-tight italic">
              of Indian girls received menstrual health info from a teacher.
            </p>
          </motion.div>
        </div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#F8F4FF] border border-white p-12 rounded-[3rem] shadow-sm relative overflow-hidden"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900 font-heading">
              What The INFANO.CARE Teacher Training Covers
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
            {TRAINING_TOPICS.map((topic, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 group"
              >
                <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-50 transition-transform group-hover:scale-110">
                  <topic.icon className={topic.color} size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#4A1E7F] mb-1 font-heading">
                    {topic.title}
                  </h4>
                  <p className="text-slate-600 text-sm italic leading-relaxed">
                    {topic.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer Text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-base md:text-md text-slate-600 font-medium">
            Teachers aren&apos;t failing girls. They were never trained to help
          </p>
        </motion.div>
      </div>
    </section>
  );
}
