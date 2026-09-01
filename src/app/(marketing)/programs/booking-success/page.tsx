'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Mail, Phone } from 'lucide-react';
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
        p.x += p.speedX + Math.sin(p.wobble) * 0.5;
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
      }

      if (active) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 w-full h-full" />;
}

function BookingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const name = searchParams.get('name') || 'Parent';
  const programTitle = searchParams.get('program') || 'our Program';
  const slotDate = searchParams.get('date') || '';
  const slotTime = searchParams.get('time') || '';
  const amount = searchParams.get('amount') || '9';
  const paymentId = searchParams.get('paymentId') || '';

  const purchaseTrackFired = useRef(false);

  // Push purchase & generate_lead events to dataLayer (GA4 & Meta Pixel compatible)
  useEffect(() => {
    if (typeof window !== 'undefined' && !purchaseTrackFired.current) {
      purchaseTrackFired.current = true;
      const targetProgramName = programTitle && programTitle !== 'our Program' ? programTitle : 'The Unfiltered Journey';
      const parsedAmount = parseFloat(amount) || 9;
      const txId = paymentId || `demo_txn_${Date.now()}`;
      const itemId = `demo_${targetProgramName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;

      const windowObj = window as any;
      windowObj.dataLayer = windowObj.dataLayer || [];

      // Clear any stale ecommerce data first (GA4 standard requirement)
      windowObj.dataLayer.push({ ecommerce: null });

      const purchaseData = {
        event: 'purchase',

        // Flat fields — Meta Pixel / Google Ads read these
        value: parsedAmount,
        currency: 'INR',
        transaction_id: txId,
        content_ids: [itemId],
        content_name: `${targetProgramName} - Demo Session`,
        content_type: 'product',

        // Nested object — GA4 reads this
        ecommerce: {
          transaction_id: txId,
          currency: 'INR',
          value: parsedAmount,
          items: [{
            item_id: itemId,
            item_name: `${targetProgramName} - Demo Session`,
            item_category: 'Demo Session',
            price: parsedAmount,
            quantity: 1
          }]
        }
      };

      if (isAnalyticsEnabled()) {
        windowObj.dataLayer.push(purchaseData);
        windowObj.dataLayer.push({
          event: 'generate_lead',
          content_name: targetProgramName,
          value: parsedAmount,
          currency: 'INR'
        });
      } else {
        console.log("Analytics disabled. Simulated dataLayer push for 'purchase' (Demo Session):", purchaseData);
      }
    }
  }, [programTitle, amount, paymentId]);

  // Format Date for display
  const getFormattedDateTime = () => {
    if (!slotDate) return 'your preferred date';
    const dateObj = new Date(slotDate);
    const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    return `${dateStr}${slotTime ? ` at ${slotTime}` : ''}`;
  };

  return (
    <div className="relative min-h-[85vh] bg-slate-50/50 flex items-center justify-center py-16 px-4 overflow-hidden">
      <CanvasConfetti />

      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-45">
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-violet-200/30 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[45%] h-[45%] bg-rose-200/30 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-[620px] bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 text-center">
        {/* Animated Check Circle Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 mb-6 border border-emerald-100 shadow-sm animate-bounce">
          <CheckCircle2 size={42} strokeWidth={1.5} />
        </div>

        {/* Payment Confirmation Pill */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-750 text-xs font-black rounded-full border border-emerald-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Paid ₹{amount} INR</span>
            {paymentId && (
              <>
                <span className="w-1 h-1 rounded-full bg-emerald-300" />
                <span className="font-mono text-[10px] text-emerald-800">Ref: {paymentId.slice(0, 18)}</span>
              </>
            )}
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-slate-800 tracking-tight leading-tight mb-4">
          Demo Session Scheduled!
        </h1>

        {/* Primary Confirmation message */}
        <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium mb-8 px-1">
          Thank you, <strong className="text-slate-800 font-extrabold">{name}</strong>. Your Demo Session for <strong className="text-slate-850 font-extrabold">{programTitle}</strong> has been successfully scheduled on <strong className="text-primary font-extrabold">{getFormattedDateTime()}</strong>.
        </p>

        {/* Contact Details Section */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left mb-8 space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200/60 pb-2">
            Support & Inquiry Contacts
          </h4>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            A confirmation notification has been dispatched to your records. If you need to make changes, reschedule, or have questions, please reach out to us:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-1">
            <a href="mailto:support@infano.care" className="flex items-center gap-2.5 text-xs font-bold text-slate-700 hover:text-primary transition-colors">
              <Mail size={16} className="text-slate-400" />
              <span>support@infano.care</span>
            </a>
            <a href="tel:+919243019243" className="flex items-center gap-2.5 text-xs font-bold text-slate-700 hover:text-primary transition-colors">
              <Phone size={16} className="text-slate-400" />
              <span>+91 92430 19243</span>
            </a>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/login')}
            className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-2xl transition-all shadow-md active:scale-98"
          >
            <span>Login to Dashboard</span>
            <ArrowRight size={16} />
          </button>
          
          <button
            onClick={() => router.push('/gigi-the-awkward-age-book')}
            className="w-full py-3.5 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all"
          >
            Explore The Awkward Age Book
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
