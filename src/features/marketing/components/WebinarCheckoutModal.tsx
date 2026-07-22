'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { ShopService } from '@/services/shop.service';
import { useAuthStore } from '@/store/auth-store';
import { Loader2, X, ShieldCheck, AlertCircle, Sparkles, CheckCircle2, User, Mail, Phone, Ticket, Heart, ArrowRight } from 'lucide-react';
import { isAnalyticsEnabled } from '@/components/common/Analytics';

interface WebinarCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  webinar: any;
}

const COUNTRIES = [
  { code: '+91', iso: 'in', name: 'India', digits: 10 },
  { code: '+1', iso: 'us', name: 'United States', digits: 10 },
  { code: '+44', iso: 'gb', name: 'United Kingdom', digits: 10 },
  { code: '+65', iso: 'sg', name: 'Singapore', digits: 8 },
  { code: '+971', iso: 'ae', name: 'United Arab Emirates', digits: 9 },
  { code: '+61', iso: 'au', name: 'Australia', digits: 9 }
];

export function WebinarCheckoutModal({ isOpen, onClose, webinar }: WebinarCheckoutModalProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentFailedMsg, setPaymentFailedMsg] = useState('');
  const rzpRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      const nameVal = user.profile?.displayName || user.username || '';
      // If name contains @ (e.g. email username like Admin@Infano.Care), do not prefill
      if (nameVal && !nameVal.includes('@')) {
        setParentName(nameVal);
      } else {
        setParentName('');
      }
      setEmail(user.email || '');
      let userPhone = user.phone || '';
      for (const country of COUNTRIES) {
        if (userPhone.startsWith(country.code)) {
          setSelectedCountry(country);
          userPhone = userPhone.substring(country.code.length);
          break;
        }
      }
      setPhone(userPhone);
    }
  }, [user]);

  if (!isOpen) return null;

  const getFullNormalizedPhone = () => {
    const cleanPhone = phone.replace(/\D/g, '');
    const normalizedMobile = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
    return `${selectedCountry.code}${normalizedMobile}`;
  };

  const validateForm = () => {
    setError(null);
    if (!parentName.trim()) {
      setError('Please enter your name.');
      return false;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return false;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== selectedCountry.digits) {
      setError(`Please enter a valid ${selectedCountry.digits}-digit mobile number.`);
      return false;
    }
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Please enter a valid email address.');
        return false;
      }
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Push generate_lead event to dataLayer
    if (typeof window !== 'undefined') {
      const eventValue = webinar ? webinar.price : 149;
      const contentName = webinar ? webinar.title : "Decoding Her Silence: Parent Webinar";
      if (isAnalyticsEnabled()) {
        const windowObj = window as any;
        windowObj.dataLayer = windowObj.dataLayer || [];
        windowObj.dataLayer.push({
          event: "generate_lead",
          value: eventValue,
          currency: "INR",
          content_name: contentName
        });
      } else {
        console.log("Analytics disabled. Simulated dataLayer push for 'generate_lead':", {
          event: "generate_lead",
          value: eventValue,
          currency: "INR",
          content_name: contentName
        });
      }
    }

    try {
      setProcessing(true);
      setError(null);

      // Create order via ShopService
      const finalPhone = getFullNormalizedPhone();
      const orderData = {
        guestName: parentName,
        guestEmail: email,
        guestPhone: finalPhone,
        shippingAddress: 'Online Webinar',
        city: 'Online',
        state: 'Online',
        pincode: '000000',
        paymentMethod: 'ONLINE' as const,
        userId: user?.id,
        items: [{ bookId: webinar ? webinar.id : 'webinar-decoding-silence', quantity: 1 }]
      };

      const order = await ShopService.createOrder(orderData);

      if (order.razorpayOrderId) {
        if (typeof (window as any).Razorpay === 'undefined') {
          setError('Payment gateway is loading. Please wait a few seconds and try again.');
          setProcessing(false);
          return;
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mockkeyid',
          amount: order.totalAmount * 100,
          currency: 'INR',
          name: 'Infano.care',
          description: webinar ? `${webinar.title} Registration` : 'Decoding Her Silence: Parent Webinar Registration',
          order_id: order.razorpayOrderId,
          handler: async function (response: any) {
            try {
              setProcessing(true);
              
              // Fire and forget verification to speed up routing
              ShopService.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }).catch(console.error);

              const successParams = new URLSearchParams({
                name: parentName,
                email: email,
                orderId: order.id,
                amount: order.totalAmount.toString(),
                title: webinar?.title || '',
                date: webinar?.date ? new Date(webinar.date).toISOString() : '',
                mode: webinar?.mode || 'ONLINE',
                zoomLink: webinar?.zoomLink || '',
                paymentId: response.razorpay_payment_id || '',
                slug: webinar?.slug || 'webinar-decoding-silence'
              });

              // We do not call onClose() here. Let Next.js navigate to the new page.
              // Closing it manually causes a brief flicker of the underlying page.
              router.push(`/webinar/success?${successParams.toString()}`);
            } catch (err) {
              setError('Payment verification failed. If money was deducted, please contact support.');
              setProcessing(false);
            }
          },
          prefill: {
            name: parentName,
            email: email,
            contact: finalPhone,
          },
          modal: {
            ondismiss: () => {
              setProcessing(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setPaymentFailed(true);
          setPaymentFailedMsg(response.error.description || 'Payment failed. Please try again.');
          setProcessing(false);
        });
        rzpRef.current = rzp;
        rzp.open();
      } else {
        // If razorpayOrderId doesn't exist, it means order creation failed
        throw new Error('Order initialization failed.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'An error occurred during registration. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="relative w-full max-w-[460px] overflow-hidden bg-[#FFFCFA] border border-slate-100 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 bg-gradient-to-b from-white to-[#FFFCFA]">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={processing}
            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors z-20 cursor-pointer bg-slate-100/50"
          >
            <X size={16} />
          </button>

          <div className="p-8 md:p-10 relative z-10">
            {paymentFailed ? (
              <div className="text-center py-6 animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-rose-50 border border-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <AlertCircle size={40} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 font-heading mb-3 tracking-tight">Payment Failed</h3>
                <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed max-w-sm mx-auto">
                  {paymentFailedMsg}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={onClose}
                    className="flex-1 max-w-[140px] px-6 py-3 rounded-full border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer text-sm"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setPaymentFailed(false);
                      setError(null);
                    }}
                    className="flex-1 max-w-[140px] px-6 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer text-sm"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Tag Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-wider animate-fade-in mb-3">
                  <Sparkles size={11} className="text-primary animate-pulse" />
                  <span>Reserve Your Seat</span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-3xl font-extrabold text-slate-950 font-heading leading-tight flex items-center gap-1 flex-wrap">
              {webinar?.title
                ? (() => {
                    const target = "Her Silence";
                    const regex = new RegExp(`(${target})`, 'i');
                    const parts = webinar.title.split(regex);
                    
                    if (parts.length > 1) {
                      return (
                        <>
                          {parts.map((part: string, i: number) => 
                            part.toLowerCase() === target.toLowerCase() ? (
                              <span key={i} className="text-pink-500">{part}</span>
                            ) : (
                              <span key={i}>{part}</span>
                            )
                          )}
                        </>
                      );
                    }
                    
                    // Fallback if "Her Silence" isn't in the title: just color the first word normally and the rest pink
                    const words = webinar.title.split(' ');
                    const first = words[0];
                    const rest = words.slice(1).join(' ');
                    return (
                      <>
                        <span>{first}</span>{rest && <><span> </span><span className="text-pink-500">{rest}</span></>}
                      </>
                    );
                  })()
                : <span>Reserve Your Seat</span>
              }
              <svg className="w-7 h-7 text-pink-500/50 inline-block animate-pulse ml-1 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1.5">
              Join the live 90-minute masterclass for parents.
            </p>

            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs font-semibold leading-relaxed">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4 mt-6">
              
              {/* Full Name Input Box */}
              <div className="flex bg-white border border-slate-200 rounded-2xl p-3 items-center gap-4 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  <User size={18} />
                </div>
                <div className="flex-1 space-y-0.5 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={processing}
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-transparent outline-none text-slate-800 text-sm font-semibold p-0 border-none focus:ring-0"
                  />
                </div>
              </div>

              {/* Phone Input Box */}
              <div className="flex bg-white border border-slate-200 rounded-2xl p-3 items-center gap-4 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-sm relative overflow-visible">
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  <Phone size={18} />
                </div>
                <div className="flex-1 space-y-0.5 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        disabled={processing}
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-1 hover:bg-slate-50 py-0.5 px-1 rounded transition-colors cursor-pointer select-none"
                      >
                        <img
                          src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`}
                          className="w-4 h-2.5 object-cover rounded-sm border border-slate-200/50"
                          alt={selectedCountry.name}
                        />
                        <span className="text-xs font-bold text-slate-700">{selectedCountry.code}</span>
                        <span className="text-[8px] text-slate-400">▼</span>
                      </button>

                      {dropdownOpen && (
                        <div className="absolute left-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in duration-200">
                          {COUNTRIES.map((country) => (
                            <button
                              key={country.iso}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(country);
                                setPhone('');
                                setDropdownOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 transition-colors text-slate-700"
                            >
                              <img
                                src={`https://flagcdn.com/w40/${country.iso}.png`}
                                className="w-5 h-3.5 object-cover rounded-sm shrink-0 border border-slate-200/50"
                                alt={country.name}
                              />
                              <span className="flex-1">{country.name}</span>
                              <span className="text-slate-400 text-[10px]">{country.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="h-5 w-px bg-slate-200"></div>
                    <input
                      type="tel"
                      required
                      disabled={processing}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder={`Enter ${selectedCountry.digits}-digit number`}
                      maxLength={selectedCountry.digits}
                      className="w-full bg-transparent outline-none text-slate-800 text-sm font-semibold p-0 border-none focus:ring-0"
                    />
                  </div>
                </div>
              </div>

              {/* Email Input Box */}
              <div className="flex bg-white border border-slate-200 rounded-2xl p-3 items-center gap-4 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  <Mail size={18} />
                </div>
                <div className="flex-1 space-y-0.5 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                    Email Address <span className="text-slate-300 normal-case">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    disabled={processing}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. parent@email.com"
                    className="w-full bg-transparent outline-none text-slate-800 text-sm font-semibold p-0 border-none focus:ring-0"
                  />
                </div>
              </div>

              {/* Entry Pass details block */}
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-800 shadow-sm gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Ticket size={18} />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <h4 className="text-xs font-extrabold text-slate-800">Webinar Entry Pass</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Access to live session + bonus resources</p>
                  </div>
                </div>
                <span className="text-primary text-xl font-black shrink-0 pr-2">₹{webinar ? webinar.price : 99}</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full py-4 px-4 bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] text-white font-extrabold text-base rounded-full shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Reserve My Seat for ₹{webinar ? webinar.price : 99}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Security note */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold pt-1 relative z-10">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Secure payment powered by Razorpay.</span>
              </div>
            </form>
            </>
            )}
          </div>

          {/* Bottom decorative floral graphics */}
          <div className="absolute bottom-0 left-0 pointer-events-none opacity-20 z-0">
            <svg className="w-20 h-20 text-primary/10" viewBox="0 0 100 100" fill="currentColor">
              <path d="M0,100 C30,80 50,90 60,100 Z" />
              <path d="M10,85 C20,75 25,80 30,90 Z" />
            </svg>
          </div>
          <div className="absolute bottom-0 right-0 pointer-events-none opacity-20 z-0">
            <svg className="w-24 h-24 text-primary/10" viewBox="0 0 100 100" fill="currentColor">
              <path d="M100,100 C70,80 50,90 40,100 Z" />
              <path d="M90,85 C80,75 75,80 70,90 Z" />
            </svg>
          </div>

        </div>
      </div>
    </>
  );
}
