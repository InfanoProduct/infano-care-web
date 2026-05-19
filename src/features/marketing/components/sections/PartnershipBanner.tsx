'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Download, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

export function PartnershipBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Submit lead to enquiry admin panel as type school
      await apiClient.post('/enquiry/submit', {
        type: 'school',
        contactName: formData.name,
        phone: formData.phone,
        details: 'Requested Info Pack download from home page.',
      });

      // Download local PDF from public folder
      const link = document.createElement('a');
      link.href = '/dummy-pdf.pdf';
      link.download = 'Infano_Partnership_Info_Pack.pdf';
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
      <section className="py-20 relative overflow-hidden bg-[#2D1B4D]">
        {/* Thematic Image Overlay with Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B4D] via-[#4A2B8A] to-[#2D1B4D] mix-blend-multiply opacity-90" />
          <Image
            src="https://images.unsplash.com/photo-1523050853063-880693006d0a?auto=format&fit=crop&q=80"
            alt="School environment"
            fill
            className="object-cover mix-blend-overlay opacity-30"
          />
        </div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto bg-white rounded-3xl md:rounded-[2.5rem] p-6 sm:p-10 md:p-14 text-center shadow-[0_50px_100px_rgba(0,0,0,0.4)]"
          >
            {/* Highlight Badges */}
            <div className="flex flex-wrap justify-center gap-8 sm:gap-12 mb-10">
              {[
                { label: "India-Wide", value: "20+ Schools" },
                { label: "Expert-Backed", value: "Verified Impact" },
                { label: "Curriculum", value: "Ready to Use" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-black mb-2 opacity-60">{item.label}</span>
                  <span className="text-slate-900 font-bold text-base sm:text-lg">{item.value}</span>
                </div>
              ))}
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-heading mb-6 text-slate-900 leading-[1.2] tracking-tight">
              India's most <span className="text-primary">forward-thinking</span> <br className="hidden md:inline" /> girls' wellness movement.
            </h2>
            <p className="text-base text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
              Join our growing network of partner schools. Easy onboarding, full curriculum support, and measurable impact for every girl.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              <Link href="/contact" className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-base hover:bg-primary transition-all shadow-xl active:scale-95 group">
                Apply for Partnership <ArrowRight className="inline-block ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-4 bg-transparent border-2 border-slate-200 text-slate-900 rounded-full font-bold text-base hover:bg-slate-50 transition-all active:scale-95"
              >
                Download Info Pack
              </button>
            </div>
          </motion.div>
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
