'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Heart, Shield, Users, X, Download, Loader2, CheckCircle2 } from 'lucide-react';

export function ParentsHero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call or just show success for now
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsSubmitted(false);
    setFormData({ name: '', phone: '' });
  };

  return (
    <section className="relative pt-28 pb-24  lg:pb-28 overflow-hidden bg-[#FFFCFA]">
      {/* Background Graphic Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]" />


      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full mb-8 animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both"
            >
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">For Families & Caregivers</span>
            </div>

            <h1
              className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
              style={{ animationDelay: '100ms' }}
            >
              You love her. <br />
              <span className="text-primary">You want to understand her.</span>
            </h1>

            <p
              className="text-base md:text-md text-slate-500 leading-relaxed font-medium mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
              style={{ animationDelay: '200ms' }}
            >
              Infano.care is the safe, expert-supported companion that helps your daughter navigate the questions, emotions, and changes she's facing.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
              style={{ animationDelay: '300ms' }}
            >
              <Link href="/program-enrollment" className="btn-primary w-full text-sm px-8 py-3.5 group shadow-lg shadow-primary/20 text-center sm:w-auto">
                Enrol Your Daughter <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-outline w-full text-sm px-8 py-3.5 backdrop-blur-md bg-white/50 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-center sm:w-auto"
              >
                Download the Parent Guide
              </button>
            </div>
          </div>

          <div
            className="relative animate-in fade-in zoom-in-95 duration-700 fill-mode-both"
            style={{ animationDelay: '150ms' }}
          >
            <div className="relative aspect-[5/4] rounded-2xl overflow-hidden shadow-2xl border border-white">
              <Image
                src="/ParentsImg1.png"
                alt="Parent and daughter"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
            {/* Floating Elements - Layered on top of image */}
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center text-primary z-20 hidden lg:flex"
            >
              <Heart size={24} />
            </motion.div>
            <motion.div
              animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/2 -right-8 w-12 h-12 bg-white shadow-lg rounded-xl flex items-center justify-center text-accent z-20 hidden lg:flex"
            >
              <Shield size={20} />
            </motion.div>

            {/* Floating Info Card */}
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-2xl border border-slate-50 flex items-center gap-4 z-20 max-w-[240px]"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Users size={24} />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-900">2k+ Families</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Trusted Ecosystem</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8 pt-12">
                {!isSubmitted ? (
                  <>
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                      <Download size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Get the Parent Guide</h3>
                    <p className="text-slate-500 mb-8 font-medium">
                      Understand your daughter's journey better with our comprehensive guide for caregivers.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your name"
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Your phone number"
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 mt-4 font-bold"
                      >
                        {isSubmitting ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <>
                            Download Guide
                            <ArrowRight size={20} />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h3>
                    <p className="text-slate-500 mb-8 font-medium">
                      Your guide is being prepared and will be sent to your phone/email shortly.
                    </p>
                    <button
                      onClick={closeModal}
                      className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
