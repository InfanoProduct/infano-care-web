'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, ArrowRight, Download, X, Sparkles } from 'lucide-react';

export function EcosystemHero() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNavigate = () => {
    setIsModalOpen(false);
    router.push('/parents-enquiry');
  };

  return (
    <>
      <section className="relative pt-8  overflow-hidden bg-[#FAF9FF]">
        {/* Background Graphics - Enriched */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[5%] right-[-5%] w-[45%] h-[45%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />

          {/* Animated Graphic Blobs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              x: [0, 50, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-[40%_60%_70%_30%/40%_50%_60%_40%] blur-[80px]"
          />

          <div className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #6366f1 1.5px, transparent 0)', backgroundSize: '48px 48px' }} />

          {/* Floating Decorative Elements */}
          <div className="absolute top-[15%] right-[5%] opacity-20">
            <div className="w-24 h-24 border-2 border-primary rounded-full animate-spin-slow" />
          </div>
          <div className="absolute top-[30%] right-[40%] opacity-20">
            <div className="w-10 h-10 border-2 border-primary rounded-full animate-spin-slow" />
          </div>
          <div className="absolute bottom-[25%] left-[40%] opacity-20">
            <div className="w-32 h-32 border-2 border-accent rounded-2xl rotate-45 animate-bounce-slow" />
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden lg:flex justify-end w-full"
            >
              <Image
                src="/Ecosystem1.png"
                alt="Mobile interface"
                width={500}
                height={500}
                className="object-contain w-full max-w-[540px] h-auto"
                priority
              />
            </motion.div>

            <div className="w-full max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-full mb-8 shadow-md"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Smartphone size={12} />
                </div>
                <span className="text-sm font-medium text-slate-600 ">The Infano Mobile Platform</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900"
              >
                Six pillars. <br />
                <span className="text-primary">One universe.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-base md:text-md text-slate-500 leading-relaxed font-medium mb-8 max-w-xl"
              >
                The Infano ecosystem is a holistic digital home for every girl—blending technology, stories, and guidance.
              </motion.p>

              {/* Mobile Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="block lg:hidden w-full mb-8"
              >
                <Image
                  src="/Ecosystem1.png"
                  alt="Mobile interface"
                  width={500}
                  height={500}
                  className="object-contain w-full max-h-[350px] mx-auto"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-row items-center justify-between lg:justify-start gap-3 lg:gap-4 w-full"
              >
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 lg:flex-none justify-center px-2 sm:px-4 lg:px-8 py-3 lg:py-4 bg-primary text-white rounded-full font-bold text-xs sm:text-sm lg:text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center gap-1.5 lg:gap-2 group whitespace-nowrap cursor-pointer"
                >
                  <span className="sm:hidden">Download</span>
                  <span className="hidden sm:inline">Download the App</span>
                  <Download className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>

                <Link href="#pillars" className="flex-1 lg:flex-none justify-center px-2 sm:px-4 lg:px-8 py-3 lg:py-4 border-2 border-primary/20 text-primary rounded-full font-bold text-xs sm:text-sm lg:text-lg hover:bg-primary/5 hover:border-primary/40 transition-all active:scale-95 flex items-center gap-1.5 lg:gap-2 whitespace-nowrap">
                  <span className="sm:hidden">Explore</span>
                  <span className="hidden sm:inline">Explore the Pillars</span>
                  <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              {/* Decorative elements in modal */}
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles size={120} className="text-primary" />
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>

              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                  <Smartphone size={32} />
                </div>

                <h2 className="text-3xl font-bold font-heading text-slate-900 mb-4 tracking-tight">
                  Coming Soon!
                </h2>

                <p className="text-slate-500 text-lg leading-relaxed mb-8">
                  We're currently putting the final touches on the Infano mobile experience. Stay tuned for our launch!
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Get Notified</p>
                    <p className="text-xs text-slate-500">We'll announce the launch on our social platforms soon.</p>
                  </div>
                </div>

                <button
                  onClick={() => handleNavigate()}
                  className="w-full mt-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                  Explore Journey
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
