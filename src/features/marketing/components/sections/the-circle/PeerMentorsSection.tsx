'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X, CheckCircle2, Loader2, ArrowRight, User } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

interface PeerMentor {
  id: string;
  name: string;
  headline?: string;
  image?: string;
  topics?: string[];
  bio?: string;
  about?: string;
}

export function PeerMentorsSection() {
  const [mentors, setMentors] = useState<PeerMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<PeerMentor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: 'Morning (9AM - 12PM)'
  });

  useEffect(() => {
    async function fetchMentors() {
      try {
        const res: any = await apiClient.get('/peerline/mentor/search');
        if (res?.mentors && Array.isArray(res.mentors)) {
          setMentors(res.mentors);
        }
      } catch (err) {
        setMentors([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMentors();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;

    setIsSubmitting(true);
    try {
      await apiClient.post('/enquiry/submit', {
        type: 'peer_connect',
        contactName: formData.name,
        email: formData.email,
        phone: formData.phone,
        peerMentorName: selectedMentor.name,
        preferredDate: formData.date,
        preferredTime: formData.time,
        details: `Requested connection with Peer Mentor: ${selectedMentor.name}`,
      });

      setIsSuccess(true);
      setTimeout(() => {
        closeModal();
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedMentor(null);
    setIsSuccess(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      date: '',
      time: 'Morning (9AM - 12PM)'
    });
  };

  return (
    <section id="peer-mentors" className="py-24 bg-white relative">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 inline-block">
              Guided by Experience
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 tracking-tight text-slate-900">
              Meet Our Trained Peer Mentors
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Connect 1-on-1 with older girls who have been in your shoes. Our peer mentors are rigorously trained to provide empathetic, lived-experience support.
            </p>
          </motion.div>
        </div>

        {/* Mentor Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-100 max-w-lg mx-auto p-8">
            <User className="mx-auto text-slate-400 mb-3" size={40} />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Peer Mentors Available</h3>
            <p className="text-sm text-slate-500">
              There are currently no certified peer mentors listed. Check back soon or apply to become one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mentors.map((mentor, index) => {
              const initial = mentor.name?.trim()?.charAt(0)?.toUpperCase() || 'P';
              const topics = mentor.topics || [];
              const bio = mentor.bio || mentor.about || mentor.headline || 'Certified Peer Mentor dedicated to supportive, empathetic listening.';
              return (
                <motion.div
                  key={mentor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  {/* Image & Header */}
                  <div className="p-6 pb-0 flex items-center gap-5 relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-sm shrink-0 relative z-10 bg-primary/10 flex items-center justify-center">
                      {mentor.image ? (
                        <Image 
                          src={mentor.image} 
                          alt={mentor.name} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <span className="text-2xl font-bold text-primary">{initial}</span>
                      )}
                    </div>
                    <div className="relative z-10 flex flex-col">
                      <h3 className="text-xl font-bold font-heading text-slate-900 tracking-tight leading-tight">{mentor.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Certified Peer</p>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-0 transition-colors group-hover:bg-primary/20" />
                  </div>

                  {/* Tags */}
                  {topics.length > 0 && (
                    <div className="px-6 pt-4 flex flex-wrap gap-2">
                      {topics.map((tag: any) => {
                        const tagName = typeof tag === 'string' ? tag : tag?.name || '';
                        return (
                          <span key={tagName} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                            {tagName}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Bio */}
                  <div className="p-6 flex-grow">
                    <p className="text-slate-500 text-sm leading-relaxed font-medium line-clamp-3">
                      "{bio}"
                    </p>
                  </div>

                  {/* Action */}
                  <div className="p-6 pt-0 mt-auto">
                    <button 
                      onClick={() => setSelectedMentor(mentor)}
                      className="w-full py-4 bg-white border-2 border-slate-900 text-slate-900 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center gap-2 group/btn"
                    >
                      Connect <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Connection Popup Modal */}
      <AnimatePresence>
        {selectedMentor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center gap-4 relative shrink-0">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-full transition-colors shadow-sm"
                >
                  <X size={16} />
                </button>
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm bg-primary/10 flex items-center justify-center">
                  {selectedMentor.image ? (
                    <Image src={selectedMentor.image} alt={selectedMentor.name} width={48} height={48} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-lg font-bold text-primary">{selectedMentor.name?.charAt(0)?.toUpperCase() || 'P'}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">Connect with {selectedMentor.name.split(' ')[0]}</h3>
                  <p className="text-xs text-slate-500 font-medium">Schedule a 1-on-1 session</p>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 overflow-y-auto">
                {isSuccess ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="text-emerald-500" size={36} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800">Request Sent!</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      We've received your request to connect with {selectedMentor.name}. Our team will reach out shortly to confirm your session.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleConnect} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Calendar size={12}/> Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={e => setFormData({ ...formData, date: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Clock size={12}/> Time *</label>
                        <select
                          required
                          value={formData.time}
                          onChange={e => setFormData({ ...formData, time: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                        >
                          <option>Morning (9AM - 12PM)</option>
                          <option>Afternoon (12PM - 4PM)</option>
                          <option>Evening (4PM - 7PM)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <><Loader2 size={18} className="animate-spin" /> Scheduling...</>
                        ) : (
                          <>Schedule Session</>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
