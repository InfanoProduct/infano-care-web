'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, Calendar, Clock, MessageSquare, PartyPopper, 
  ArrowRight, ShieldCheck, Heart, AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { isAnalyticsEnabled } from '@/components/common/Analytics';

// Pure React Canvas Confetti effect
function CanvasConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      '#FF007F', '#FF1493', '#D946EF', '#A855F7', '#8B5CF6', 
      '#6366F1', '#3B82F6', '#0EA5E9', '#00F2FE', '#4FACFE',
      '#10B981', '#22C55E', '#FFB800', '#F97316', '#FF4B4B'
    ];
    
    const particleCount = 180;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      wobble: number;
      wobbleSpeed: number;
      shape: 'rect' | 'circle' | 'triangle' | 'line';
    }> = [];

    const shapes: Array<'rect' | 'circle' | 'triangle' | 'line'> = ['rect', 'circle', 'triangle', 'line'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * -height - 40,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 4 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 8 - 4,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.05 + 0.02,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      let active = false;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.wobble) * 0.5; // Wind drift simulation
        p.wobble += p.wobbleSpeed;
        p.rotation += p.rotationSpeed;

        if (p.y < height) {
          active = true;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'line') {
          ctx.beginPath();
          ctx.moveTo(-p.size / 2, 0);
          ctx.lineTo(p.size / 2, 0);
          ctx.stroke();
        }

        ctx.restore();

        // Recycle particle when it falls past the screen
        if (p.y > height + 20) {
          p.y = -40;
          p.x = Math.random() * width;
          p.speedY = Math.random() * 4 + 3;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Stop animation loop after 8 seconds
    const timeoutId = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, width, height);
    }, 8000);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
}

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
  const paymentId = searchParams.get('paymentId') || 'MOCK_PAYMENT_ID';
  const slug = searchParams.get('slug') || 'webinar-decoding-silence';

  const trackFired = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !trackFired.current) {
      trackFired.current = true;
      const parsedAmount = parseFloat(amount) || 149;
      
      if (isAnalyticsEnabled()) {
        const windowObj = window as any;
        windowObj.dataLayer = windowObj.dataLayer || [];
        windowObj.dataLayer.push({ ecommerce: null });   // clear any stale ecommerce data
        windowObj.dataLayer.push({
          event: "purchase",

          // Flat fields — Meta reads these (reuses your existing DLVs)
          value: parsedAmount,
          currency: "INR",
          transaction_id: paymentId,   // real Razorpay payment/order id
          content_ids: [slug],
          content_type: "product",

          // Nested object — GA4 reads this
          ecommerce: {
            transaction_id: paymentId,
            value: parsedAmount,
            currency: "INR",
            items: [{
              item_id: slug,
              item_name: title,
              item_category: "Webinar",
              price: parsedAmount,
              quantity: 1
            }]
          }
        });
      } else {
        console.log("Analytics disabled. Simulated dataLayer push for 'purchase':", {
          event: "purchase",
          value: parsedAmount,
          currency: "INR",
          transaction_id: paymentId,
          content_ids: [slug],
          content_type: "product",
          ecommerce: {
            transaction_id: paymentId,
            value: parsedAmount,
            currency: "INR",
            items: [{
              item_id: slug,
              item_name: title,
              item_category: "Webinar",
              price: parsedAmount,
              quantity: 1
            }]
          }
        });
      }
    }
  }, [amount, paymentId, slug, title]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-rose-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <CanvasConfetti />
      
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-[5%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/50 rounded-full blur-[140px]" />
        <div className="absolute bottom-[5%] right-[-10%] w-[45%] h-[45%] bg-rose-200/50 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-emerald-100/40 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md border border-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(74,30,127,0.05)] p-6 sm:p-10 relative z-10 text-center space-y-8">
        
        {/* Party Popper visual */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 border border-purple-100/50 flex items-center justify-center mx-auto text-purple-500 shadow-inner">
            <PartyPopper size={44} strokeWidth={1.5} className="animate-bounce" />
          </div>
          <h1 className="mt-5 text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
            Seat Confirmed!
          </h1>
          <p className="mt-2 text-xs text-slate-500 font-semibold leading-relaxed">
            Thank you, <strong className="text-slate-800">{name}</strong>. Your payment of <strong className="text-slate-800">₹{amount}</strong> was verified successfully. Your confirmation ID is <strong className="text-slate-800">#{(orderId || '').slice(-8).toUpperCase()}</strong>{email ? <span> and confirmation sent to <strong className="text-slate-800">{email}</strong></span> : ''}.
          </p>
          <p className="mt-1 text-sm font-extrabold text-purple-650 tracking-tight">
            Topic: {title}
          </p>
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
        <div className="max-w-md mx-auto w-full">
          {/* WhatsApp bonus card */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/60 rounded-[2rem] text-center flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <span className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] block mb-2">Exclusive Access</span>
              <h4 className="text-lg font-black text-slate-800 mb-2">🎁 Join Parent Community</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold mb-6 max-w-sm mx-auto">
                Connect directly with other parents and trainers. Ask queries prior to the cohort starting in our private WhatsApp group.
              </p>
            </div>
            <Link
              href="https://chat.whatsapp.com/mock-parent-community-group"
              target="_blank"
              className="py-3.5 px-6 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 relative z-10 w-full sm:w-auto mx-auto"
            >
              <MessageSquare size={16} />
              <span>Join WhatsApp Group</span>
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
