'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { School, ArrowRight, X, Download, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

export function SchoolHero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/enquiry/submit', {
        type: 'school',
        contactName: formData.name,
        phone: formData.phone,
        details: 'Requested Partnership Guide download from Schools Hero.',
      });

      const link = document.createElement('a');
      link.href = '/InfanoCare School broucher.pdf';
      link.download = 'InfanoCare School broucher.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
        setFormData({ name: '', phone: '' });
      }, 2500);
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="relative pt-20 pb-24  lg:pb-32 overflow-hidden bg-white">
        {/* Background Decorations */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-50 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] left-[-10%] w-[45%] h-[45%] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
        </div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-8 animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both"
              >
                <School size={14} className="text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.2em]">Institutional Partnerships</span>
              </div>

              <h1
                className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
                style={{ animationDelay: '100ms' }}
              >
                Redefining the standard of <br />
                <span className="text-primary font-bold">Holistic Growth.</span>
              </h1>

              <p
                className="text-base md:text-md text-slate-500 leading-relaxed font-medium mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
                style={{ animationDelay: '200ms' }}
              >
                A structured wellness integration programme for leading educational institutions focused on adolescent empowerment and life skills.
              </p>

              <div
                className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
                style={{ animationDelay: '300ms' }}
              >
                <Link href="/contact" className="btn-primary w-full sm:w-auto text-sm px-8 py-3.5 group shadow-lg shadow-primary/20">
                  Request Consultation <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
                </Link>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-outline w-full sm:w-auto text-sm px-8 py-3.5 backdrop-blur-md bg-white/50 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                >
                  Partnership Guide
                </button>
              </div>
            </div>

            <div
              className="lg:col-span-6 relative animate-in fade-in zoom-in-95 duration-700 fill-mode-both"
              style={{ animationDelay: '150ms' }}
            >
              <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl shadow-emerald-900/10 border border-white">
                <Image
                  src="/SchoolHeroimg.png"
                  alt="Institutional campus"
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-emerald-100/50 rounded-full blur-xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Download Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden z-10"
            >
              {/* Header */}
              <div className="bg-primary p-8 text-center relative">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                  <FileText className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Get the Info Pack</h3>
                <p className=" text-sm text-white">Everything you need to know about partnering with Infano.</p>
              </div>

              {/* Form */}
              <form onSubmit={handleDownload} className="p-8 space-y-6">
                {isSuccess ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="text-emerald-500" size={36} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800">Download Started!</h4>
                    <p className="text-sm text-slate-500">Your Info Pack is downloading. We'll be in touch soon.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Jane Doe"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 00000 00000"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <><Loader2 size={20} className="animate-spin" /> Downloading...</>
                      ) : (
                        <><Download size={20} /> Download PDF</>
                      )}
                    </button>

                    <p className="text-xs text-center text-slate-400">
                      By downloading, you agree to receive communication from us regarding the partnership.
                    </p>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
