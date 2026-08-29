'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  Lock, 
  ArrowRight, 
  RefreshCw,
  Mail,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Confetti Particle Effect
function ConfettiEffect() {
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

    const colors = ['#9333ea', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    const particleCount = 100;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * -height,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: Math.random() * 3 - 1.5,
      speedY: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 4 - 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="pointer-events-none fixed inset-0 z-30 h-full w-full"
    />
  );
}

function ConsentApproveContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'missing'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('missing');
      return;
    }

    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    const approve = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005/api';
        
        // Attempt POST to the API endpoint
        let response = await fetch(`${apiUrl}/auth/consent/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        // If POST fails with 404 or route differences, try GET fallback
        if (response.status === 404) {
          response = await fetch(`${apiUrl}/consent/approve?token=${encodeURIComponent(token)}`);
        }

        if (response.ok) {
          setStatus('success');
        } else {
          const data = await response.json().catch(() => ({}));
          const msg = data.message || data.error || 'Approval link is invalid or has already been used.';
          setErrorMessage(msg);
          setStatus('error');
        }
      } catch (err: any) {
        console.error('Approval failed:', err);
        setErrorMessage(err.message || 'Unable to connect to the server. Please check your network connection.');
        setStatus('error');
      }
    };

    approve();
  }, [token]);

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {status === 'success' && <ConfettiEffect />}

      <AnimatePresence mode="wait">
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-purple-100/80 shadow-2xl shadow-purple-500/10 rounded-3xl p-8 sm:p-10 text-center relative"
          >
            <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/25 mb-6 animate-pulse">
              <RefreshCw className="w-10 h-10 text-white animate-spin" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
              Verifying Approval
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Please wait while we secure and verify your parental consent with Infano.Care...
            </p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-xl bg-white/95 backdrop-blur-2xl border border-purple-100 shadow-2xl shadow-purple-500/15 rounded-3xl p-8 sm:p-10 text-center relative z-10"
          >
            {/* Success Icon */}
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-40 animate-pulse" />
              <div className="relative w-full h-full bg-gradient-to-tr from-purple-600 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl border border-white/20">
                <span className="text-4xl select-none">🌸</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full ring-4 ring-white shadow-md">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider border border-emerald-200 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Consent Approved
            </div>

            {/* Title & Copy */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              Permission Granted! 🌸
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
              Thank you for approving your daughter's account. Her Infano app has now been unlocked and she can continue her journey safely.
            </p>

            {/* Safety Pillar Callouts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-8">
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100/60 flex items-start gap-3">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">100% Private & Safe</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">No ads, no data selling, strictly COPPA compliant.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-pink-50/60 border border-pink-100/60 flex items-start gap-3">
                <div className="p-2 bg-pink-100 text-pink-700 rounded-xl mt-0.5">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Expert-Led Wellness</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">Curated puberty, cycle & life skills guidance.</p>
                </div>
              </div>
            </div>

            {/* Next Steps for Parent */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 text-left mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Next Step</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your daughter can now open the <strong>Infano.Care</strong> mobile app on her device and complete her setup. Everything is ready for her!
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 transition-all duration-200 active:scale-[0.98]"
              >
                <span>Visit Infano.Care</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/parents"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
              >
                <span>Explore Parents Layer</span>
              </Link>
            </div>
          </motion.div>
        )}

        {(status === 'error' || status === 'missing') && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-lg bg-white/95 backdrop-blur-2xl border border-rose-100 shadow-2xl shadow-rose-500/10 rounded-3xl p-8 sm:p-10 text-center relative z-10"
          >
            {/* Warning Icon */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-lg shadow-rose-500/20 mb-6">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold uppercase tracking-wider border border-rose-200 mb-4">
              {status === 'missing' ? 'Invalid Link' : 'Notice'}
            </div>

            {/* Title & Copy */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              {status === 'missing' ? 'Missing Verification Token' : 'Link Expired or Already Used'}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              {status === 'missing'
                ? 'Please ensure you clicked the full consent link provided in the email sent by your daughter.'
                : errorMessage || 'This consent link has either already been approved or has expired (links are valid for 7 days).'}
            </p>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-left mb-8">
              <h4 className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                What should you do?
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                If your daughter is still waiting to access the app, ask her to open Infano and tap <strong>&quot;Resend Consent Email&quot;</strong> to receive a brand new approval link.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md transition-all duration-200 active:scale-[0.98]"
              >
                <span>Back to Home</span>
              </Link>
              <a
                href="mailto:connect@infano.care"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
              >
                <Mail className="w-4 h-4 text-slate-500" />
                <span>Contact Support</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ConsentApprovePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ConsentApproveContent />
    </Suspense>
  );
}
