'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Star, Clock, Calendar, X, ChevronRight, ChevronLeft,
  Loader2, CheckCircle2, User, Mail, Phone, Info, ShieldCheck, ArrowRight
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { ParentService } from '@/services/parent.service';
import toast from 'react-hot-toast';

interface Expert {
  id: string;
  displayName: string;
  specialisation: string;
  consultationPrice: number;
  avatarUrl?: string;
  availableSlots: string[];
}

const SPECIALISATION_FILTERS = [
  { label: 'All Experts', value: '' },
  { label: 'Gynecologist', value: 'Gynecologist' },
  { label: 'Psychologist', value: 'Psychologist' },
  { label: 'Educator', value: 'Educator' },
];

export function ExpertShowcase() {
  const { user } = useAuthStore();
  const isLoggedIn = !!user;

  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  // Booking Modal States
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Form states for guest checkout
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Booking Flow Steps
  const [bookingStep, setBookingStep] = useState<'slot' | 'details' | 'confirm' | 'processing' | 'success'>('slot');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    fetchExperts();
  }, [activeFilter]);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      // Retrieve using public endpoint
      const data = await ParentService.getPublicExperts(activeFilter || undefined);
      setExperts(data || []);
    } catch (err) {
      console.error('Failed to fetch experts:', err);
      toast.error('Failed to load experts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openBookingModal = async (expert: Expert) => {
    setSelectedExpert(expert);
    setSelectedSlot(null);
    setSelectedDate(null);
    setCurrentMonth(new Date());
    setBookingStep('slot');
    setBookingError('');
    setSlotsLoading(true);
    
    // Clear guest form
    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');

    try {
      const res = await ParentService.getPublicExpertSlots(expert.id);
      setAvailableSlots(res.availableSlots || []);
    } catch (err) {
      console.error('Failed to fetch expert slots:', err);
      toast.error('Could not load slots for this expert.');
    } finally {
      setSlotsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedExpert(null);
    setSelectedSlot(null);
    setSelectedDate(null);
    setBookingStep('slot');
    setBookingError('');
  };

  const handleNextStep = () => {
    if (bookingStep === 'slot') {
      if (!selectedSlot) {
        toast.error('Please select a time slot.');
        return;
      }
      if (isLoggedIn) {
        setBookingStep('confirm');
      } else {
        setBookingStep('details');
      }
    } else if (bookingStep === 'details') {
      if (!guestName.trim() || !guestPhone.trim() || !guestEmail.trim()) {
        toast.error('Please fill in all contact fields.');
        return;
      }
      // Basic phone/email format check
      if (guestPhone.length < 10) {
        toast.error('Please enter a valid phone number.');
        return;
      }
      if (!guestEmail.includes('@')) {
        toast.error('Please enter a valid email address.');
        return;
      }
      setBookingStep('confirm');
    }
  };

  const handleBookSession = async () => {
    if (!selectedExpert || !selectedSlot) return;
    setBookingStep('processing');
    setBookingError('');

    try {
      let order;
      if (isLoggedIn) {
        order = await ParentService.bookExpertSession(selectedExpert.id, selectedSlot);
      } else {
        order = await ParentService.bookPublicExpertSession({
          expertId: selectedExpert.id,
          scheduledAt: selectedSlot,
          name: guestName,
          phone: guestPhone,
          email: guestEmail
        });
      }

      if (order.razorpayOrderId) {
        if (typeof (window as any).Razorpay === 'undefined') {
          setBookingError('Payment gateway is still loading. Please wait a moment and try again.');
          setBookingStep('confirm');
          return;
        }

        const options = {
          key: order.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'Infano.care',
          description: `Expert Session: ${selectedExpert.displayName}`,
          order_id: order.razorpayOrderId,
          handler: async function (response: any) {
            try {
              if (isLoggedIn) {
                await ParentService.verifyExpertSessionPayment({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  expertId: selectedExpert.id,
                  scheduledAt: selectedSlot
                });
              } else {
                await ParentService.verifyPublicExpertSessionPayment({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  expertId: selectedExpert.id,
                  scheduledAt: selectedSlot,
                  name: guestName,
                  phone: guestPhone,
                  email: guestEmail
                });
              }
              setBookingStep('success');
            } catch (err) {
              setBookingError('Payment verification failed. Please contact support.');
              setBookingStep('confirm');
            }
          },
          prefill: {
            name: isLoggedIn ? user?.username : guestName,
            contact: isLoggedIn ? user?.phone : guestPhone,
            email: isLoggedIn ? user?.email : guestEmail
          },
          modal: {
            ondismiss: () => {
              setBookingStep('confirm');
            }
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      setBookingError(err.message || 'Failed to initiate booking');
      setBookingStep('confirm');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  // Helper arrays for calendar generation
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentMonth);

  const getSlotTimesForDate = (dateString: string) => {
    return availableSlots.filter(slot => {
      const slotDate = new Date(slot).toISOString().split('T')[0];
      return slotDate === dateString;
    });
  };

  const filteredExperts = experts.filter(e =>
    e.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.specialisation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="experts" className="py-24 bg-slate-50 relative overflow-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Decorative background vectors */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] translate-x-1/2" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px] -translate-x-1/2" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 inline-block">
              1:1 Consultations
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 tracking-tight text-slate-900">
              Consult with Our Verified Experts
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Book a private, highly confidential consultation session with certified psychologists, gynecologists, and counselors specialized in adolescent care.
            </p>
          </motion.div>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-4xl mx-auto justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-semibold text-sm shadow-sm text-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            {SPECIALISATION_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-4 py-2.5 rounded-full text-xs font-black border transition-all whitespace-nowrap ${
                  activeFilter === f.value
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-655 border-slate-200 hover:border-slate-350 hover:text-slate-805'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Experts Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={36} />
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-6 max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-350">
              <Search size={22} />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">No experts found</h4>
            <p className="text-slate-500 font-semibold text-xs mt-1">Try matching other keywords or select a different filter.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExperts.map((expert, index) => (
              <motion.div
                key={expert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-50 flex items-center justify-center text-primary font-black text-xl border border-primary/20 shrink-0">
                      {getInitials(expert.displayName)}
                    </div>
                    <div className="min-w-0 space-y-1 mt-1">
                      <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-primary transition-colors truncate">
                        {expert.displayName}
                      </h3>
                      <p className="text-xs font-bold text-slate-500">{expert.specialisation}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 mb-6">
                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200/50">
                      <Star size={11} fill="currentColor" className="text-amber-500" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Verified Profile</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60">
                      <Clock size={11} />
                      <span className="text-[9px] font-black uppercase tracking-wider">45-Min Video Call</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6 z-10 relative">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Consultation</span>
                    <span className="text-2xl font-black text-slate-900">₹{expert.consultationPrice}</span>
                  </div>
                  <button
                    onClick={() => openBookingModal(expert)}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    Book Session
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Unified Booking Modal */}
      <AnimatePresence>
        {selectedExpert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center gap-4 relative shrink-0">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-full transition-colors shadow-sm"
                >
                  <X size={16} />
                </button>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-indigo-50 flex items-center justify-center text-primary font-black border border-primary/20 shrink-0">
                  {getInitials(selectedExpert.displayName)}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Book {selectedExpert.displayName}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold">{selectedExpert.specialisation}</p>
                </div>
              </div>

              {/* Progress Step Indicator */}
              <div className="bg-slate-50/55 px-6 py-3 border-b border-slate-100/60 flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 shrink-0">
                <span className={bookingStep === 'slot' ? 'text-primary font-black' : 'text-slate-500'}>1. Select Date & Time</span>
                <ChevronRight size={10} />
                <span className={bookingStep === 'details' ? 'text-primary font-black' : bookingStep === 'slot' ? 'text-slate-400' : 'text-slate-500'}>2. Details</span>
                <ChevronRight size={10} />
                <span className={bookingStep === 'confirm' ? 'text-primary font-black' : 'text-slate-400'}>3. Confirm & Pay</span>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto flex-grow space-y-6">
                
                {/* Error Banner */}
                {bookingError && (
                  <div className="p-4 bg-red-50 border border-red-205 rounded-2xl flex items-start gap-3">
                    <Info className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-red-700 font-semibold leading-relaxed">{bookingError}</p>
                  </div>
                )}

                {/* STEP 1: SLOT SELECTION */}
                {bookingStep === 'slot' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Select Consultation Date</h4>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handlePrevMonth}
                            className="p-1.5 hover:bg-slate-150 rounded-lg text-slate-500"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-xs font-black text-slate-800 min-w-[90px] text-center">
                            {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                          <button
                            onClick={handleNextMonth}
                            className="p-1.5 hover:bg-slate-150 rounded-lg text-slate-500"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1 text-center bg-slate-50 p-4 rounded-3xl border border-slate-100">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                          <div key={day} className="text-[10px] font-black text-slate-400 pb-2">{day}</div>
                        ))}

                        {/* Blank spots for preceding month days */}
                        {Array.from({ length: firstDayIndex }).map((_, i) => (
                          <div key={`empty-${i}`} />
                        ))}

                        {/* Day numbers */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const dObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                          const dateString = dObj.toISOString().split('T')[0];
                          const dateSlots = getSlotTimesForDate(dateString);
                          const hasSlots = dateSlots.length > 0;
                          const isSelected = selectedDate === dateString;

                          return (
                            <button
                              key={`day-${day}`}
                              disabled={!hasSlots || dObj < new Date(new Date().setHours(0,0,0,0))}
                              onClick={() => {
                                setSelectedDate(dateString);
                                setSelectedSlot(null);
                              }}
                              className={`aspect-square rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-primary text-white font-black shadow-md shadow-primary/20 scale-105'
                                  : hasSlots
                                  ? 'hover:bg-slate-200 text-slate-800 font-extrabold cursor-pointer border border-primary/20'
                                  : 'text-slate-300 pointer-events-none'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time slots */}
                    {selectedDate && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Available Times</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {getSlotTimesForDate(selectedDate).map((slot) => {
                            const timeStr = new Date(slot).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            });
                            const isSelected = selectedSlot === slot;

                            return (
                              <button
                                key={slot}
                                onClick={() => setSelectedSlot(slot)}
                                className={`py-3 px-2 rounded-2xl text-[11px] font-black tracking-wide border transition-all ${
                                  isSelected
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                    : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                {timeStr}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: GUEST DETAILS */}
                {bookingStep === 'details' && (
                  <div className="space-y-4">
                    <div className="bg-primary/5 p-4.5 rounded-2xl border border-primary/10 text-xs text-primary font-bold flex gap-2">
                      <Info className="shrink-0 mt-0.5" size={15} />
                      <p>Since you are not logged in, please provide your contact info to receive the secure Google Meet link, confirmation, and receipt.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <User size={13} /> Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="Your full name"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-semibold text-sm text-slate-800"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Phone size={13} /> Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-semibold text-sm text-slate-800"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Mail size={13} /> Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="your.email@example.com"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-semibold text-sm text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: CONFIRM & BILLING */}
                {bookingStep === 'confirm' && (
                  <div className="space-y-5">
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5.5 space-y-4">
                      <h4 className="text-xs font-black text-slate-505 uppercase tracking-wider">Booking Review</h4>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 block font-bold mb-0.5">Expert Partner</span>
                          <span className="font-extrabold text-slate-800">{selectedExpert.displayName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold mb-0.5">Specialty</span>
                          <span className="font-extrabold text-slate-800">{selectedExpert.specialisation}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold mb-0.5">Scheduled Date</span>
                          <span className="font-extrabold text-slate-800">
                            {new Date(selectedSlot!).toLocaleDateString('en-IN', {
                              weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold mb-0.5">Scheduled Time</span>
                          <span className="font-extrabold text-slate-800">
                            {new Date(selectedSlot!).toLocaleTimeString('en-IN', {
                              hour: '2-digit', minute: '2-digit', hour12: true
                            })}
                          </span>
                        </div>
                      </div>

                      {!isLoggedIn && (
                        <div className="border-t border-slate-200/60 pt-4 text-xs grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-slate-400 block font-bold mb-0.5">Booked By</span>
                            <span className="font-extrabold text-slate-800">{guestName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold mb-0.5">Contact</span>
                            <span className="font-extrabold text-slate-800 truncate block">{guestPhone}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center bg-slate-900 text-white rounded-3xl p-6 shadow-md">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Payable</span>
                        <span className="text-3xl font-black">₹{selectedExpert.consultationPrice}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 text-[10px] font-black uppercase text-slate-300">
                        <ShieldCheck size={13} className="text-green-400" /> Secure Payment
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: PROCESSING STATE */}
                {bookingStep === 'processing' && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-primary" size={44} />
                    <h4 className="font-black text-slate-800 text-base">Securing Your Session...</h4>
                    <p className="text-xs text-slate-500 font-semibold text-center max-w-xs">
                      Redirecting to our payment gateway. Please do not close this window or refresh the page.
                    </p>
                  </div>
                )}

                {/* STEP 5: SUCCESS STATE */}
                {bookingStep === 'success' && (
                  <div className="py-10 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-green-50 border border-green-200 rounded-full flex items-center justify-center text-green-500 shadow-md">
                      <CheckCircle2 size={44} className="stroke-[2.5]" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900">Session Confirmed!</h3>
                      <p className="text-sm text-slate-500 font-semibold max-w-xs mx-auto">
                        Your session with {selectedExpert.displayName} is scheduled successfully.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 font-medium max-w-sm w-full space-y-1.5 text-left">
                      <div className="flex justify-between font-bold">
                        <span>Date & Time:</span>
                        <span className="font-extrabold text-slate-800">
                          {new Date(selectedSlot!).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Contact Number:</span>
                        <span className="font-extrabold text-slate-800">{isLoggedIn ? user?.phone : guestPhone}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed pt-2 border-t border-slate-200/60 mt-2">
                        A verification email with the Google Meet conference link and receipt has been sent. Please join 5 minutes before scheduled start.
                      </p>
                    </div>

                    <button
                      onClick={closeModal}
                      className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-extrabold text-xs shadow-md transition-all duration-200 flex items-center gap-1"
                    >
                      Done <ArrowRight size={14} />
                    </button>
                  </div>
                )}

              </div>

              {/* Footer Actions (Static for non-terminal steps) */}
              {(bookingStep === 'slot' || bookingStep === 'details' || bookingStep === 'confirm') && (
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                  {bookingStep === 'slot' ? (
                    <button
                      onClick={closeModal}
                      className="px-5 py-2.5 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-extrabold transition-all"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (bookingStep === 'details') setBookingStep('slot');
                        if (bookingStep === 'confirm') setBookingStep(isLoggedIn ? 'slot' : 'details');
                      }}
                      className="px-5 py-2.5 hover:bg-slate-200 text-slate-655 rounded-xl text-xs font-extrabold transition-all"
                    >
                      Back
                    </button>
                  )}

                  {bookingStep === 'confirm' ? (
                    <button
                      onClick={handleBookSession}
                      className="px-6 py-3 bg-primary text-white hover:bg-primary/95 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      Pay & Book
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={handleNextStep}
                      disabled={!selectedSlot}
                      className="px-6 py-3 bg-slate-900 text-white hover:bg-slate-850 disabled:opacity-50 disabled:pointer-events-none rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      Continue
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
