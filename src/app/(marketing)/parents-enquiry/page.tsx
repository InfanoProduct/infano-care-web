'use client';

import { useState } from 'react';
import { ParentsEnquiryForm } from '@/features/marketing/components/sections/parents/ParentsEnquiryForm';
import { motion, AnimatePresence } from 'framer-motion';

export default function ParentsEnquiryPage() {
  const [phase, setPhase] = useState<'questions' | 'recommendation' | 'success'>('questions');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-4 sm:py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        layout
        transition={{ duration: 0.5, type: 'spring', damping: 25 }}
        className={`w-full space-y-4 relative z-10 transition-all duration-500 ${
          phase === 'recommendation' ? 'max-w-7xl' : 'max-w-2xl'
        }`}
      >
        <AnimatePresence mode="wait">
          {phase === 'questions' && (
            <motion.div 
              key="header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-slate-900 font-heading sm:text-4xl">
                Start Your Child's <span className="text-primary">Journey</span>
              </h2>
              <p className="mt-3 text-base text-slate-500 font-medium">
                Help us personalize the best experience for your daughter.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          layout="position"
          transition={{ duration: 0.5, type: 'spring', damping: 25 }}
          className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <ParentsEnquiryForm phase={phase} onPhaseChange={setPhase} />
        </motion.div>
      </motion.div>
    </div>
  );
}

