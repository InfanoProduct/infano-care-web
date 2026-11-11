'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';
import { Loader2, ArrowLeft, Shield, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, isAuthenticated, user } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // If already authenticated and fully onboarded, redirect to dashboard or picker
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'SCHOOL_COORDINATOR') {
        router.push('/schools/dashboard');
      } else if (user.role === 'OPS_MANAGER' || user.role === 'ADMIN') {
        router.push('/admin/schools');
      } else if (!user.onboardingCompletedAt || !user.learners || user.learners.length === 0) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard/picker');
      }
    }
  }, [isAuthenticated, user, router]);

  // Resend OTP countdown
  useEffect(() => {
    if (step !== 'OTP') return;
    setResendTimer(30);
    setCanResend(false);

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // Focus OTP input when step changes to OTP
  useEffect(() => {
    if (step === 'OTP') {
      setTimeout(() => otpInputRef.current?.focus(), 150);
    }
  }, [step]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(raw);
    setError('');
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setOtp(raw);
    setError('');

    // Auto-verify if 4 digits entered
    if (raw.length === 4) {
      handleVerifyOtp(undefined, raw);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const fullPhone = `+91${phone}`;
      await AuthService.sendOtp(fullPhone);
      setStep('OTP');
      setOtp('');
      toast.success('Verification code sent!');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent, customOtp?: string) => {
    if (e) e.preventDefault();
    const code = customOtp || otp;
    if (code.length !== 4) {
      setError('Please enter the complete 4-digit code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const fullPhone = `+91${phone}`;
      const res: any = await AuthService.verifyOtp(fullPhone, code);

      if (res && res.accessToken) {
        setAuth(res.accessToken, res.refreshToken, {
          id: res.userId,
          phone: fullPhone,
          role: res.role || 'PARENT',
          onboardingStep: res.onboardingStep,
          onboardingCompletedAt: res.isOnboardingCompleted ? new Date().toISOString() : null,
          isOnboardingCompleted: res.isOnboardingCompleted,
          hasParentPin: res.hasParentPin,
          learners: res.learners || [],
          profile: res.profile,
        });

        toast.success('Welcome back!');

        // Check if user has completed onboarding
        if (!res.isOnboardingCompleted || !res.learners || res.learners.length === 0) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard/picker');
        }
      } else {
        throw new Error('Invalid verification response');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const otpBoxes = [0, 1, 2, 3].map((i) => ({
    val: otp[i] || '',
    isActive: i === otp.length,
    isFilled: Boolean(otp[i])
  }));

  return (
    <div className="min-h-screen bg-[#FFFAF6] text-[#3D2C4A] flex flex-col justify-center items-center py-4 sm:py-8 md:py-12 px-3 sm:px-6 font-['Noto_Sans',system-ui,sans-serif]">
      {/* Wave animation style */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .gigi-wave {
          transform-box: fill-box;
          transform-origin: 10% 100%;
          animation: waveArm 1.6s ease-in-out infinite;
        }
        @keyframes waveArm {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-14deg); }
        }
        .pop-in {
          animation: popIn 0.35s cubic-bezier(0.2, 1.4, 0.4, 1);
        }
        @keyframes popIn {
          0% { transform: scale(0.96); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}} />

      {/* Main Login Card - Responsive Mobile & Desktop Layout */}
      <div className="w-full max-w-[420px] md:max-w-[880px] lg:max-w-[960px] bg-white rounded-[32px] md:rounded-[40px] border border-[#F1E4E8] shadow-xl md:shadow-2xl overflow-hidden flex flex-col md:flex-row md:min-h-[580px] transition-all">
        {/* Left / Top Banner: Pink Curved Area with Gigi Illustration */}
        <div className="bg-[#F9D5D3] p-6 sm:p-8 md:p-10 rounded-b-[40px] md:rounded-b-none md:w-[46%] lg:w-[48%] flex flex-col items-center justify-between text-center relative overflow-hidden shrink-0">
          {/* Logo row */}
          <div className="self-start">
            <Link href="/" className="relative h-10 w-36 block hover:opacity-90 transition-opacity">
              <Image
                src="/logo/infano-logo-for-light-bg.png"
                alt="Infano"
                fill
                sizes="144px"
                className="object-contain object-left"
                priority
              />
            </Link>
          </div>

          {/* Heading Content */}
          <div className="my-auto py-4 flex flex-col items-center">
            <div className="italic text-xl sm:text-2xl font-bold text-[#A8365A]">
              Welcome back!
            </div>
            <div className="font-extrabold text-2xl sm:text-3xl leading-tight text-[#3D2C4A] mt-1 max-w-[280px]">
              Her garden missed you.
            </div>

            {/* Gigi Waving Character SVG Illustration */}
            <svg
              width="180"
              height="180"
              viewBox="0 0 120 120"
              role="img"
              aria-label="Gigi waving"
              className="mt-3 block md:w-[210px] md:h-[210px]"
            >
              <circle cx="60" cy="50" r="33" fill="#3D2C4A" />
              <circle cx="31" cy="26" r="11" fill="#3D2C4A" />
              <circle cx="89" cy="26" r="11" fill="#3D2C4A" />
              <circle cx="92" cy="20" r="5" fill="#F4A3B4" />
              <circle cx="60" cy="56" r="25" fill="#D9A07E" />
              <path d="M35 49 C 40 30, 80 30, 85 49 C 76 41, 46 41, 35 49z" fill="#3D2C4A" />
              <circle cx="51" cy="58" r="3" fill="#3D2C4A" />
              <circle cx="69" cy="58" r="3" fill="#3D2C4A" />
              <circle cx="45" cy="66" r="4" fill="#F08FA6" opacity="0.6" />
              <circle cx="75" cy="66" r="4" fill="#F08FA6" opacity="0.6" />
              <path d="M53 68 Q60 75 67 68" stroke="#3D2C4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M30 120 C 32 98, 46 86, 60 86 C 74 86, 88 98, 90 120z" fill="#E3DAF5" />
              <g className="gigi-wave">
                <path d="M86 100 C 96 92, 101 82, 101 72" stroke="#D9A07E" strokeWidth="9" fill="none" strokeLinecap="round" />
                <circle cx="101" cy="68" r="7" fill="#D9A07E" />
              </g>
            </svg>
          </div>

          {/* Desktop Badge Notice */}
          <div className="hidden md:flex items-center gap-2 bg-white/75 backdrop-blur-xs rounded-full px-4 py-1.5 text-xs font-bold text-[#3D2C4A] shadow-xs">
            <Sparkles size={14} className="text-[#C2456A]" />
            <span>Personalized Bloom Garden for her journey</span>
          </div>
        </div>

        {/* Right Side: Form Body */}
        <div className="flex-1 p-6 sm:p-8 md:p-12 flex flex-col justify-between gap-6 bg-white">
          {step === 'PHONE' ? (
            /* Step 1: Mobile Phone Number */
            <form onSubmit={handleSendOtp} className="flex flex-col gap-5 my-auto">
              <div>
                <h1 className="text-2xl sm:text-[28px] font-bold text-[#3D2C4A] leading-snug">
                  Log in with your mobile number
                </h1>
                <p className="text-sm font-semibold text-[#5E4B6B] mt-1">
                  The mobile number you used to enroll or order.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2.5 items-center">
                  <span className="grid place-items-center min-h-[56px] px-4 rounded-2xl bg-[#FFFAF6] border-[1.5px] border-[#E9DDE6] font-bold text-lg text-[#3D2C4A]">
                    +91
                  </span>
                  <input
                    id="lg-ph"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    autoFocus
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="10-digit mobile number"
                    className="flex-1 min-w-0 min-h-[56px] rounded-2xl border-[1.5px] border-[#E9DDE6] px-4 text-xl font-bold text-[#3D2C4A] tracking-wider focus:outline-none focus:border-[#C2456A] transition-colors bg-white shadow-xs"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm font-semibold text-[#A8365A] bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || phone.length !== 10}
                className="w-full min-h-[56px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] active:scale-[0.99] text-white font-bold text-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                {isLoading ? <Loader2 size={22} className="animate-spin" /> : 'Get OTP'}
              </button>
            </form>
          ) : (
            /* Step 2: 4-Digit Verification Code */
            <form onSubmit={(e) => handleVerifyOtp(e)} className="pop-in flex flex-col gap-5 my-auto">
              <div>
                <h1 className="text-2xl sm:text-[28px] font-bold text-[#3D2C4A] leading-snug">
                  Enter the 4-digit code
                </h1>
                <div className="text-sm text-[#5E4B6B] font-semibold mt-1">
                  Sent to +91 {phone} ·{' '}
                  <button
                    type="button"
                    onClick={() => { setStep('PHONE'); setError(''); setOtp(''); }}
                    className="text-[#A8365A] hover:underline font-bold cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* 4 Visual OTP Boxes */}
              <div
                className="grid grid-cols-4 gap-3.5 max-w-[320px] mx-auto w-full relative cursor-text my-2"
                onClick={() => otpInputRef.current?.focus()}
              >
                {otpBoxes.map((b, idx) => (
                  <span
                    key={idx}
                    className={`h-16 rounded-2xl bg-white flex items-center justify-center text-3xl font-extrabold text-[#3D2C4A] transition-all border-[1.5px] ${
                      b.isActive
                        ? 'border-2 border-[#C2456A] ring-4 ring-[#C2456A]/10 shadow-sm'
                        : b.isFilled
                        ? 'border-2 border-[#A992D6] bg-[#FFFAF6]'
                        : 'border-[#E9DDE6]'
                    }`}
                  >
                    {b.val}
                  </span>
                ))}

                {/* Hidden Real Input for Native Keyboard & Paste Handling */}
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  value={otp}
                  onChange={handleOtpChange}
                  className="absolute inset-0 opacity-0 cursor-default"
                />
              </div>

              {error && (
                <div className="text-sm font-semibold text-[#A8365A] bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 4}
                className="w-full min-h-[56px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] active:scale-[0.99] text-white font-bold text-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:bg-[#EADDE4] disabled:text-[#6E5B7A] disabled:cursor-not-allowed shadow-md"
              >
                {isLoading ? <Loader2 size={22} className="animate-spin" /> : 'Log in'}
              </button>

              <div className="text-sm text-[#5E4B6B] flex items-center justify-between pt-1">
                <span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[#A8365A] font-bold hover:underline cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span>Resend in 0:{resendTimer.toString().padStart(2, '0')}</span>
                  )}
                </span>
                <a
                  href="https://wa.me/919243019243"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#24735A] font-bold hover:underline"
                >
                  Get it on WhatsApp
                </a>
              </div>
            </form>
          )}

          {/* Footer Note */}
          <div className="text-center text-sm text-[#5E4B6B] pt-4 border-t border-[#F1E4E8] mt-4">
            New here?{' '}
            <Link href="/course" className="font-bold text-[#A8365A] hover:underline">
              See plans from ₹299
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFAF6] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#C2456A]" size={36} />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
