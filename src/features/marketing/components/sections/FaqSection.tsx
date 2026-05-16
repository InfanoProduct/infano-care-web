'use client';

import { motion } from 'framer-motion';
import { FaqItem } from '../../types';

interface FaqSectionProps {
  title?: string;
  description?: string;
  items: FaqItem[];
  theme?: 'light' | 'dark' | 'slate' | 'transparent';
  layout?: 'centered' | 'split';
  columns?: 1 | 2;
  sideContent?: React.ReactNode;
}

export function FaqSection({ 
  title = "Frequently Asked Questions", 
  description, 
  items, 
  theme = 'light',
  layout = 'centered',
  columns = 1,
  sideContent
}: FaqSectionProps) {
  
  const themes = {
    light: 'bg-white text-slate-900',
    dark: 'bg-slate-900 text-white',
    slate: 'bg-slate-50 border-t border-slate-100 text-slate-900',
    transparent: 'bg-transparent text-slate-900'
  };

  const itemThemes = {
    light: 'bg-white border-slate-100 shadow-sm hover:shadow-md text-slate-900',
    dark: 'bg-white/5 border-white/10 hover:bg-white/10 text-white',
    slate: 'bg-white border-slate-100 shadow-sm hover:shadow-md text-slate-900',
    transparent: 'bg-white border-slate-100 shadow-sm hover:shadow-md text-slate-900'
  };

  const answerThemes = {
    light: 'text-slate-500',
    dark: 'text-slate-400',
    slate: 'text-slate-500',
    transparent: 'text-slate-500'
  };

  return (
    <section className={`py-32 ${themes[theme]} relative overflow-hidden`}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        {layout === 'centered' ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold font-heading tracking-tight"
              >
                {title}
              </motion.h2>
              {description && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-6 text-lg text-slate-500 font-medium"
                >
                  {description}
                </motion.p>
              )}
            </div>

            <div className={`grid gap-6 ${columns === 2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {items.map((faq, i) => (
                <FaqCard key={i} faq={faq} index={i} itemTheme={itemThemes[theme]} answerTheme={answerThemes[theme]} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              {sideContent || (
                <>
                  <h2 className="text-4xl md:text-6xl font-bold font-heading mb-8 tracking-tight">{title}</h2>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">{description}</p>
                </>
              )}
            </div>
            <div className="space-y-6">
              {items.map((faq, i) => (
                <FaqCard key={i} faq={faq} index={i} itemTheme={itemThemes[theme]} answerTheme={answerThemes[theme]} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function FaqCard({ faq, index, itemTheme, answerTheme }: { faq: FaqItem, index: number, itemTheme: string, answerTheme: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`p-8 rounded-xl border transition-all duration-300 ${itemTheme}`}
    >
      <h4 className="text-lg font-bold font-heading mb-4 tracking-tight">{faq.question}</h4>
      <p className={`leading-relaxed font-medium text-sm md:text-base ${answerTheme}`}>{faq.answer}</p>
    </motion.div>
  );
}
