'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, Calendar, Clock, MessageSquare, Download, 
  ArrowRight, ShieldCheck, Heart, AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function WebinarSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const name = searchParams.get('name') || 'Parent';
  const email = searchParams.get('email') || '';
  const orderId = searchParams.get('orderId') || 'MOCK_REF';
  const amount = searchParams.get('amount') || '99';
  const title = searchParams.get('title') || 'Decoding Her Silence: Parent Webinar';
  const mode = searchParams.get('mode') || 'ONLINE';
  const zoomLink = searchParams.get('zoomLink') || '';
  const dateParam = searchParams.get('date');

  const targetDate = dateParam ? new Date(dateParam).getTime() : new Date('2026-07-25T17:00:00+05:30').getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const formattedDate = dateParam
    ? new Date(dateParam).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Saturday, July 25, 2026 at 05:00 PM';

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[10%] left-[-15%] w-[50%] h-[50%] bg-purple-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-15%] w-[45%] h-[45%] bg-rose-200/40 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-10 relative z-10 text-center space-y-8">
        
        {/* Confetti / Success GIF Placeholder */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-500 shadow-md">
            <CheckCircle2 size={44} strokeWidth={1.5} className="animate-bounce" />
          </div>
          <h1 className="mt-5 text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
            Seat Confirmed!
          </h1>
          <p className="mt-2 text-xs text-slate-500 font-semibold leading-relaxed">
            Thank you, <strong className="text-slate-800">{name}</strong>. Your payment of <strong className="text-slate-800">₹{amount}</strong> was verified successfully.
          </p>
          <p className="mt-1 text-sm font-extrabold text-purple-650 tracking-tight">
            Topic: {title}
          </p>
        </div>

        {/* Reference / Invoice Box */}
        <div className="p-4 bg-[#FAF8FD] border border-purple-100/50 rounded-2xl flex flex-wrap items-center justify-between text-left gap-4 text-xs font-bold text-slate-700">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Order ID Reference</span>
            <span className="text-purple-650 font-black">#{(orderId || '').slice(-8).toUpperCase()}</span>
          </div>
          {email && (
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Confirmation Sent To</span>
              <span className="text-slate-800 font-bold">{email}</span>
            </div>
          )}
        </div>

        {/* Countdown Timer */}
        <div className="space-y-3">
          <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Webinar Countdown</span>
          <div className="flex items-center justify-center gap-4">
            <div className="bg-slate-50 border border-slate-100/80 px-4 py-3 rounded-2xl min-w-16 shadow-sm">
              <span className="block text-xl font-black font-heading text-slate-900 leading-tight">{timeLeft.days}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Days</span>
            </div>
            <div className="bg-slate-50 border border-slate-100/80 px-4 py-3 rounded-2xl min-w-16 shadow-sm">
              <span className="block text-xl font-black font-heading text-slate-900 leading-tight">{timeLeft.hours}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hours</span>
            </div>
            <div className="bg-slate-50 border border-slate-100/80 px-4 py-3 rounded-2xl min-w-16 shadow-sm">
              <span className="block text-xl font-black font-heading text-slate-900 leading-tight">{timeLeft.minutes}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mins</span>
            </div>
            <div className="bg-slate-50 border border-slate-100/80 px-4 py-3 rounded-2xl min-w-16 shadow-sm">
              <span className="block text-xl font-black font-heading text-slate-900 leading-tight">{timeLeft.seconds}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Secs</span>
            </div>
          </div>
        </div>

        {/* Schedule & Meeting Details */}
        <div className="p-5 border border-slate-100 rounded-2xl bg-white shadow-sm space-y-4">
          <h3 className="text-left font-black text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar size={14} className="text-purple-600" />
            <span>Webinar Details</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-slate-400 shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-slate-400 shrink-0" />
              <span>Platform: {mode === 'ONLINE' ? 'Live Zoom Call' : 'Offline Session'}</span>
            </div>
            {mode === 'OFFLINE' && zoomLink && (
              <div className="flex items-start gap-2 sm:col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 shrink-0">Venue:</span>
                <span className="text-slate-800 font-extrabold">{zoomLink}</span>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-left text-[11px] text-amber-800 font-semibold flex gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>Check your email! We have sent you the official entry meeting details and receipt details. Reminders will follow.</span>
          </div>
        </div>

        {/* Action / Bonus Download Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* WhatsApp bonus card */}
          <div className="p-6 bg-emerald-50/20 border border-emerald-100 rounded-3xl text-center flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider block mb-1">Parent Community</span>
              <h4 className="text-sm font-black text-slate-800 mb-2">🎁 Join Private WhatsApp Group</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold mb-4">
                Connect directly with other parents and trainers. Ask queries prior to the cohort starting.
              </p>
            </div>
            <Link
              href="https://chat.whatsapp.com/mock-parent-community-group"
              target="_blank"
              className="py-3 px-4 bg-[#25D366] hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare size={14} />
              <span>Join Group Chat</span>
            </Link>
          </div>

          {/* Download PDF card */}
          <div className="p-6 bg-purple-50/20 border border-purple-100 rounded-3xl text-center flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-purple-650 font-bold text-xs uppercase tracking-wider block mb-1">Webinar Bonus</span>
              <h4 className="text-sm font-black text-slate-800 mb-2">🎁 Download 3 Signals PDF Card</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold mb-4">
                Printable laminated decision card summarizing the body, mirror, and mood signals.
              </p>
            </div>
            <Link
              href="https://api.infano.care/uploads/assets/3_Signals_Decision_Card.pdf"
              target="_blank"
              className="py-3 px-4 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </Link>
          </div>
        </div>

        {/* Bottom CTA to return */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-100">
          <Link
            href="/parents"
            className="text-xs font-bold text-slate-400 hover:text-slate-650 flex items-center gap-1 group uppercase tracking-widest"
          >
            <span>Back to Programs</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 duration-300" />
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-450 font-semibold">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Infano Care Secure Ticket Registration.</span>
        </div>
      </div>
    </div>
  );
}
