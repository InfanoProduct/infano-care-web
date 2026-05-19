'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const TIERS = [
  {
    name: 'Seeding',
    students: '100 students',
    badgeText: 'Essential',
    theme: 'green' as const,
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
    students: '200 students',
    badgeText: 'Recommended',
    theme: 'purple' as const,
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
    students: '300 students',
    badgeText: 'Complete',
    theme: 'rose' as const,
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

const themeStyles = {
  slate: {
    card: 'bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-2',
    title: 'text-primary',
    badge: 'bg-slate-100 text-slate-600',
    check: 'text-green-500',
    featureText: 'text-slate-600',
    button: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200',
    topBadge: '',
  },
  green: {
    card: 'bg-gradient-to-b from-[#f0fdf4] to-white border-2 border-emerald-200 shadow-xl shadow-emerald-500/10 hover:-translate-y-2 z-10',
    title: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    check: 'text-emerald-500',
    featureText: 'text-slate-800 font-medium',
    button: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg',
    topBadge: 'bg-emerald-500 text-white',
  },
  purple: {
    card: 'bg-gradient-to-b from-[#f8f0ff] to-white border-2 border-purple-200 shadow-xl shadow-purple-500/10 hover:-translate-y-2 z-10',
    title: 'text-primary',
    badge: 'bg-purple-100 text-purple-700',
    check: 'text-primary',
    featureText: 'text-slate-800 font-medium',
    button: 'bg-primary hover:bg-primary/95 text-white shadow-md hover:shadow-lg',
    topBadge: 'bg-primary text-white',
  },
  rose: {
    card: 'bg-gradient-to-b from-[#fff1f2] to-white border-2 border-rose-200 shadow-xl shadow-rose-500/10 hover:-translate-y-2 z-10',
    title: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-700',
    check: 'text-rose-500',
    featureText: 'text-slate-800 font-medium',
    button: 'bg-rose-500 hover:bg-rose-600 text-white shadow-md hover:shadow-lg',
    topBadge: 'bg-rose-500 text-white',
  },
};

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
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-2 font-heading">
            The Partnership
          </h2>
          <p className="text-base md:text-md text-slate-500 font-medium">
            Three Ways To Join
          </p>
        </motion.div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-end max-w-5xl mx-auto mt-8">
          {TIERS.map((tier, i) => {
            const styles = themeStyles[tier.theme];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5, ease: "easeOut" }}
                className={`relative rounded-3xl p-8 transition-all duration-500 ${styles.card}`}
              >
                {tier.badgeText && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className={`${styles.topBadge} text-[11px] font-bold tracking-widest uppercase py-1.5 px-4 rounded-full shadow-md`}>
                      {tier.badgeText}
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-2xl font-bold mb-2 font-heading ${styles.title}`}>
                    {tier.name}
                  </h3>
                  <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
                    {tier.students}
                  </div>
                </div>

                <div className="space-y-4">
                  {tier.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <CheckCircle2
                        size={18}
                        className={`mt-0.5 shrink-0 ${styles.check}`}
                        strokeWidth={2.5}
                      />
                      <span className={`text-sm leading-tight ${styles.featureText}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <button className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${styles.button}`}>
                    Enroll Now
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
