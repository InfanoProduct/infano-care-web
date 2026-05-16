'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const TIERS = [
  {
    name: 'Seeding',
    students: '100 students',
    highlight: false,
    features: [
      'Grades 5–6 (2 grades)',
      '1 physical session / grade',
      'Teacher training (half day)',
      'Platform: Grades 5–6 app',
      'Parent Welcome Packet',
      'Quarterly report',
      'Certified School badge',
    ],
  },
  {
    name: 'Grow',
    students: '150 students',
    highlight: true,
    features: [
      'Grades 5–7 (3 grades)',
      '1 session per grade',
      'Teacher training + handbook',
      'Platform: 3 grades',
      'Parent app + onboarding',
      'Quarterly & annual report',
      'Media coverage support',
      'School dashboard access',
    ],
  },
  {
    name: 'Thrive',
    students: '200 students',
    highlight: false,
    features: [
      'All Grades 5–9 (5 grades)',
      '1 session per grade',
      'Full teacher training',
      'Platform: all 5 grades',
      'Parent full program',
      'Quarterly & annual report',
      'PR + social media pack',
      'Dashboard + alerts',
      'Annual Wellness Day event',
    ],
  },
];

export function PartnershipTiers() {
  return (
    <section className="py-20 bg-[#F8F4FF] relative">
      {/* Decorative arc - top right */}
      <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-50">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="0" r="70" stroke="#C084FC" strokeWidth="20" fill="none" />
          <circle cx="100" cy="0" r="80" stroke="#E67E22" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
      {/* Decorative arc - left */}
      <div className="absolute top-1/4 left-0 w-16 h-48 pointer-events-none opacity-20">
        <svg viewBox="0 0 70 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="100" r="90" stroke="#C084FC" strokeWidth="35" fill="none" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-black text-[#4A1E7F] mb-2 font-heading">
            The Partnership
          </h2>
          <p className="text-sm font-semibold text-slate-500">
            Three Ways To Join
          </p>
        </motion.div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          {TIERS.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-md ${
                tier.highlight
                  ? 'bg-[#FDE8DC] border-orange-200'
                  : 'bg-white border-slate-100 hover:border-[#4A1E7F]/15'
              }`}
            >
              <h3 className={`text-2xl font-black mb-1 font-heading ${
                tier.highlight ? 'text-[#E67E22]' : 'text-[#E67E22]'
              }`}>
                {tier.name}
              </h3>
              <p className="text-xs text-slate-500 mb-5">({tier.students})</p>

              <ul className="space-y-2.5">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2.5">
                    <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                    <span className="text-xs text-slate-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
