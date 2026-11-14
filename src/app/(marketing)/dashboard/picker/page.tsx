'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore, LearnerProfile } from '@/store/auth-store';
import { OnboardingService } from '@/services/onboarding.service';
import { hasActiveCourseEnrollment, ParentSpaceService } from '@/services/parent-space.service';
import { useDashboardLearners, dashboardLearnersQueryKey } from '@/hooks/use-dashboard-data';
import { parentOrdersSummaryQueryKey } from '@/hooks/use-parent-space-data';
import { Lock, X, Plus, Loader2, Sparkles, UserPlus, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AGES = ['9', '10', '11', '12', '13', '14', '15+'];
const PERIOD_STATUSES = ['Yes', 'Not yet', 'Not sure', 'Prefer not to say'];

export default function ProfilePickerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    user,
    isAuthenticated,
    learners: storedLearners,
    setLearners,
    setActiveProfile,
    setParentPinUnlocked,
    clearAuth
  } = useAuthStore();

  const {
    data: learners = storedLearners,
    isPending: loading,
    isSuccess: learnersLoaded,
  } = useDashboardLearners(user?.id, storedLearners);
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinVerifying, setPinVerifying] = useState(false);

  // PIN Reset state — 'idle' | 'sending' | 'otp' | 'newpin' | 'done'
  const [resetStage, setResetStage] = useState<'idle' | 'sending' | 'otp' | 'newpin' | 'done'>('idle');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPin, setResetNewPin] = useState('');
  const [resetConfirmPin, setResetConfirmPin] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const resetOtpRef = useRef<HTMLInputElement>(null);
  const resetNewPinRef = useRef<HTMLInputElement>(null);

  // Add Sister modal state
  const [addSisterOpen, setAddSisterOpen] = useState(false);
  const [sisterName, setSisterName] = useState('');
  const [sisterAge, setSisterAge] = useState('11');
  const [sisterPeriodStatus, setSisterPeriodStatus] = useState('Not yet');
  const [addingSister, setAddingSister] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      router.push('/login');
    }
  }, [isAuthenticated, user?.id, router]);

  useEffect(() => {
    if (learnersLoaded && learners !== storedLearners) {
      setLearners(learners);
    }
  }, [learners, learnersLoaded, setLearners, storedLearners]);

  useEffect(() => {
    if (!learnersLoaded || learners.length > 0 || !user?.id) return;

    const redirectWithoutLearners = async () => {
      try {
        const summary = await queryClient.fetchQuery({
          queryKey: parentOrdersSummaryQueryKey(user.id),
          queryFn: () => ParentSpaceService.getOrdersSummary(),
        });
        router.replace(hasActiveCourseEnrollment(summary) ? '/onboarding' : '/dashboard');
      } catch {
        toast.error('We couldn’t verify course access. Please continue from your dashboard.');
        router.replace('/dashboard');
      }
    };

    void redirectWithoutLearners();
  }, [learners.length, learnersLoaded, queryClient, router, user?.id]);

  // Handle keyboard input for PIN when modal is open
  useEffect(() => {
    if (!pinOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePinPress(e.key);
      } else if (e.key === 'Backspace') {
        handlePinDelete();
      } else if (e.key === 'Escape') {
        setPinOpen(false);
        setPin('');
        setPinError('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinOpen, pin]);

  // Handle PIN button press
  const handlePinPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setPinError('');
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handlePinDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setPinError('');
  };

  const verifyPin = async (code: string) => {
    setPinVerifying(true);
    setPinError('');
    try {
      const res = await OnboardingService.verifyParentPin(code);
      if (res.verified) {
        setParentPinUnlocked(true);
        setActiveProfile({ type: 'PARENT' });
        router.push('/dashboard/parent');
      } else {
        setPinError('Incorrect PIN. Please try again.');
        setPin('');
      }
    } catch (err: any) {
      setPinError(err.message || 'Incorrect PIN. Please try again.');
      setPin('');
    } finally {
      setPinVerifying(false);
    }
  };

  const handleSelectLearner = (learner: LearnerProfile) => {
    setActiveProfile({ type: 'DAUGHTER', learner });
    router.push('/dashboard');
  };

  const handleAddSisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sisterName.trim()) {
      toast.error('Please enter her name');
      return;
    }
    setAddingSister(true);
    try {
      const res = await OnboardingService.addLearner({
        name: sisterName.trim(),
        age: sisterAge,
        periodStatus: sisterPeriodStatus,
        worries: []
      });
      if (res.learner) {
        const updated = [...learners, res.learner];
        queryClient.setQueryData(dashboardLearnersQueryKey(user?.id), updated);
        setLearners(updated);
        void queryClient.invalidateQueries({
          queryKey: parentOrdersSummaryQueryKey(user?.id),
        });
        toast.success(`${sisterName} has been added!`);
        setAddSisterOpen(false);
        setSisterName('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to add learner profile');
    } finally {
      setAddingSister(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  // ── PIN Reset Handlers ────────────────────────────────────────────────────
  const closePinModal = () => {
    setPinOpen(false);
    setPin('');
    setPinError('');
    setResetStage('idle');
    setResetOtp('');
    setResetNewPin('');
    setResetConfirmPin('');
    setResetError('');
  };

  const handleRequestReset = async () => {
    setResetLoading(true);
    setResetError('');
    try {
      await OnboardingService.requestPinReset();
      setResetStage('otp');
      setTimeout(() => resetOtpRef.current?.focus(), 150);
    } catch (err: any) {
      setResetError(err.message || 'Failed to send code. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyResetOtp = () => {
    if (resetOtp.length !== 4) {
      setResetError('Please enter the full 4-digit code.');
      return;
    }
    setResetStage('newpin');
    setResetError('');
    setTimeout(() => resetNewPinRef.current?.focus(), 150);
  };

  const handleConfirmReset = async () => {
    if (resetNewPin.length !== 4) {
      setResetError('New PIN must be 4 digits.');
      return;
    }
    if (resetNewPin !== resetConfirmPin) {
      setResetError('PINs do not match. Please try again.');
      return;
    }
    setResetLoading(true);
    setResetError('');
    try {
      await OnboardingService.confirmPinReset({ otp: resetOtp, newPin: resetNewPin });
      setResetStage('done');
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset PIN. Please try again.');
      setResetStage('otp');
      setResetOtp('');
      setTimeout(() => resetOtpRef.current?.focus(), 150);
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFAF6] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C2456A]" size={36} />
      </div>
    );
  }

  const phoneDisplay = user?.phone
    ? user.phone.replace(/(\+91\d{2})\d{4}(\d{3})/, '$1XXXX$2')
    : user?.email || '+91 98XXX XX123';

  return (
    <div className="min-h-screen bg-[#FFFAF6] text-[#3D2C4A] font-['Noto_Sans',sans-serif] flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 relative overflow-hidden">
      {/* Background soft ambient circles on desktop */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F9D5D3]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E3DAF5]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[420px] sm:max-w-[640px] md:max-w-[840px] lg:max-w-[960px] flex flex-col items-center gap-8 py-6 z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#F1E4E8] text-xs font-bold text-[#A8365A] shadow-2xs">
            <Sparkles size={14} />
            <span>Infano Learning Space</span>
          </div>
          <h1 className="font-extrabold text-[32px] sm:text-[38px] md:text-[44px] leading-tight text-[#3D2C4A] tracking-tight">
            Who's learning today?
          </h1>
          <p className="text-sm sm:text-base text-[#6E5B7A] max-w-md mx-auto">
            Choose a learner profile to grow her garden, or enter your PIN-protected Parent Space.
          </p>
        </div>

        {/* Profile Grid - Responsive Desktop 2 or 3 Columns */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {/* Daughter Cards */}
          {learners.map((learner) => (
            <button
              key={learner.id}
              type="button"
              onClick={() => handleSelectLearner(learner)}
              className="bg-white border-2 border-[#F1E4E8] hover:border-[#C2456A] rounded-[32px] p-6 sm:p-7 flex flex-col items-center justify-between gap-3 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1.5 cursor-pointer group text-center min-h-[240px] md:min-h-[260px]"
            >
              <div className="relative">
                <svg
                  width="100"
                  height="100"
                  viewBox="0 0 80 80"
                  aria-hidden="true"
                  className="group-hover:scale-108 transition-transform duration-300"
                >
                  <circle cx="40" cy="40" r="40" fill="#F9D5D3" />
                  <circle cx="40" cy="36" r="22" fill="#3D2C4A" />
                  <circle cx="21" cy="20" r="8" fill="#3D2C4A" />
                  <circle cx="59" cy="20" r="8" fill="#3D2C4A" />
                  <circle cx="40" cy="42" r="16" fill="#D9A07E" />
                  <circle cx="34" cy="42" r="2" fill="#3D2C4A" />
                  <circle cx="46" cy="42" r="2" fill="#3D2C4A" />
                  <path d="M35 49 Q40 53 45 49" stroke="#3D2C4A" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M20 80 C 22 66, 30 60, 40 60 C 50 60, 58 66, 60 80z" fill="#FFFFFF" opacity=".85" />
                </svg>
              </div>

              <div>
                <span className="font-extrabold text-xl sm:text-2xl text-[#3D2C4A] block truncate max-w-[180px]">
                  {learner.name}
                </span>
                <span className="text-xs font-semibold text-[#6E5B7A] block mt-0.5">
                  Age {learner.age}
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#24735A] bg-[#EAF7F1] border border-[#24735A]/15 rounded-full px-3 py-1 shadow-2xs">
                🌸 {learner.flowersCount || 0} flowers
              </span>
            </button>
          ))}

          {/* Parent Space Card */}
          <button
            type="button"
            onClick={() => {
              setPinOpen(true);
              setPin('');
              setPinError('');
            }}
            className="bg-white border-2 border-[#F1E4E8] hover:border-[#5A4385] rounded-[32px] p-6 sm:p-7 flex flex-col items-center justify-between gap-3 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1.5 cursor-pointer group text-center min-h-[240px] md:min-h-[260px]"
          >
            <div className="relative w-[100px] h-[100px] rounded-full bg-[#E3DAF5] flex items-center justify-center group-hover:scale-108 transition-transform duration-300">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#5A4385" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <span className="absolute right-0 bottom-0 w-8 h-8 rounded-full bg-[#3D2C4A] flex items-center justify-center shadow-md">
                <Lock size={15} className="text-white" />
              </span>
            </div>

            <div>
              <span className="font-extrabold text-xl sm:text-2xl text-[#3D2C4A] block">
                Parent space
              </span>
              <span className="text-xs font-semibold text-[#6E5B7A] block mt-0.5">
                Dashboard & Settings
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A4385] bg-[#F1ECFA] border border-[#5A4385]/15 rounded-full px-3 py-1 shadow-2xs">
              <Lock size={12} />
              PIN protected
            </span>
          </button>

          {/* Add Learner Tile in Grid on Desktop */}
          <button
            type="button"
            onClick={() => setAddSisterOpen(true)}
            className="border-2 border-dashed border-[#D9C3CF] hover:border-[#A8365A] bg-[#FFFAF6]/60 hover:bg-white rounded-[32px] p-6 sm:p-7 flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer text-center min-h-[240px] md:min-h-[260px] group shadow-2xs hover:shadow-md"
          >
            <span className="w-14 h-14 rounded-full bg-[#FDEFF0] group-hover:bg-[#C2456A] group-hover:text-white transition-colors flex items-center justify-center text-2xl text-[#A8365A] font-bold shadow-xs">
              +
            </span>
            <div>
              <strong className="block font-bold text-base sm:text-lg text-[#3D2C4A] group-hover:text-[#A8365A] transition-colors">
                Add a learner
              </strong>
              <span className="text-xs font-semibold text-[#6E5B7A] block mt-0.5">
                A sister · No extra cost
              </span>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-[#6E5B7A] pt-4 border-t border-[#F1E4E8]/60 w-full max-w-md">
          Logged in as <strong className="text-[#3D2C4A]">{phoneDisplay}</strong> ·{' '}
          <button
            type="button"
            onClick={handleLogout}
            className="text-[#A8365A] font-bold hover:underline cursor-pointer"
          >
            Not you? Log out
          </button>
        </div>
      </div>

      {/* Add Sister Modal */}
      {addSisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D2C4A]/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-[460px] bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl relative border border-[#F1E4E8] animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setAddSisterOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#FFFAF6] flex items-center justify-center text-[#3D2C4A] hover:bg-[#F1E4E8] cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <UserPlus size={20} className="text-[#C2456A]" />
              <h2 className="text-2xl font-bold text-[#3D2C4A]">Add her sister</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6E5B7A] mb-5">
              She gets her own personalized bloom garden and separate progress tracker.
            </p>

            <form onSubmit={handleAddSisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3D2C4A] mb-1">Sister's name</label>
                <input
                  type="text"
                  value={sisterName}
                  onChange={(e) => setSisterName(e.target.value)}
                  placeholder="e.g. Meera"
                  className="w-full min-h-[48px] px-4 rounded-xl border border-[#D9C3CF] text-sm font-bold text-[#3D2C4A] focus:outline-none focus:border-[#C2456A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3D2C4A] mb-1.5">Her age</label>
                <div className="flex flex-wrap gap-2">
                  {AGES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setSisterAge(a)}
                      className={`min-h-[38px] px-4 rounded-full text-xs font-bold cursor-pointer transition-all ${
                        sisterAge === a
                          ? 'bg-[#3D2C4A] text-white shadow-xs'
                          : 'bg-[#FFFAF6] text-[#3D2C4A] border border-[#E9DDE6] hover:border-[#3D2C4A]'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3D2C4A] mb-1.5">Has she had her first period?</label>
                <div className="flex flex-wrap gap-2">
                  {PERIOD_STATUSES.map((ps) => (
                    <button
                      key={ps}
                      type="button"
                      onClick={() => setSisterPeriodStatus(ps)}
                      className={`min-h-[36px] px-3.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                        sisterPeriodStatus === ps
                          ? 'bg-[#24735A] text-white shadow-xs'
                          : 'bg-[#EAF7F1] text-[#24735A] hover:bg-[#D4EFE4]'
                      }`}
                    >
                      {ps}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={addingSister}
                  className="w-full min-h-[50px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 transition-all"
                >
                  {addingSister ? <Loader2 size={18} className="animate-spin" /> : 'Create profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PIN Bottom Sheet / Desktop Modal */}
      {pinOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#3D2C4A]/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-[420px] bg-white rounded-t-[36px] sm:rounded-[36px] p-6 sm:p-7 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">

            {/* ── Normal PIN Entry ──────────────────────────────────────── */}
            {resetStage === 'idle' && (
              <>
                <div className="flex justify-between items-center">
                  <strong className="text-xl font-bold text-[#3D2C4A]">Enter your parent PIN</strong>
                  <button
                    type="button"
                    onClick={closePinModal}
                    className="w-10 h-10 rounded-full bg-[#FFFAF6] flex items-center justify-center text-[#3D2C4A] hover:bg-[#F1E4E8] cursor-pointer transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-xs text-[#6E5B7A] -mt-1">Type your 4-digit PIN using the keyboard.</p>

                {pinError && (
                  <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-center">
                    {pinError}
                  </div>
                )}

                <div className="flex justify-center gap-4 py-4" aria-live="polite">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`w-5 h-5 rounded-full transition-all ${
                        i < pin.length ? 'bg-[#3D2C4A] scale-110 shadow-xs' : 'bg-white border-2 border-[#C9B9C9]'
                      }`}
                    />
                  ))}
                </div>

                {pin.length === 4 && (
                  <button type="button" disabled={pinVerifying} onClick={() => verifyPin(pin)}
                    className="w-full min-h-[50px] rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-1 transition-all">
                    {pinVerifying ? <Loader2 size={18} className="animate-spin" /> : 'Open Parent space'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => { setResetStage('sending'); handleRequestReset(); }}
                  className="text-center font-bold text-xs text-[#A8365A] hover:underline cursor-pointer pt-1"
                >
                  Forgot PIN? Reset via OTP →
                </button>
              </>
            )}

            {/* ── Reset: Sending OTP ───────────────────────────────────── */}
            {resetStage === 'sending' && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 size={32} className="animate-spin text-[#C2456A]" />
                <p className="text-sm font-semibold text-[#6E5B7A]">Sending verification code…</p>
              </div>
            )}

            {/* ── Reset: Enter OTP ─────────────────────────────────────── */}
            {resetStage === 'otp' && (
              <>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { setResetStage('idle'); setResetError(''); }}
                    className="w-9 h-9 rounded-full bg-[#FFFAF6] flex items-center justify-center text-[#3D2C4A] hover:bg-[#F1E4E8] cursor-pointer">
                    <ArrowLeft size={16} />
                  </button>
                  <strong className="text-xl font-bold text-[#3D2C4A]">Verify your identity</strong>
                  <button type="button" onClick={closePinModal}
                    className="ml-auto w-9 h-9 rounded-full bg-[#FFFAF6] flex items-center justify-center text-[#3D2C4A] hover:bg-[#F1E4E8] cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                <p className="text-xs text-[#6E5B7A] -mt-1">
                  We sent a 4-digit code to your registered phone/email. Enter it below.
                </p>

                {resetError && (
                  <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-center">
                    {resetError}
                  </div>
                )}

                <div className="relative">
                  <label className="text-xs font-bold text-[#3D2C4A] block mb-1.5">OTP code</label>
                  <input
                    ref={resetOtpRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={resetOtp}
                    onChange={(e) => { setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 4)); setResetError(''); }}
                    placeholder="· · · ·"
                    className="w-full min-h-[52px] rounded-2xl border-2 border-[#D3C6EE] text-center text-2xl font-bold tracking-[0.5em] text-[#3D2C4A] bg-[#F9F5FF] focus:outline-none focus:border-[#6B4FA0]"
                  />
                </div>

                <button
                  type="button"
                  disabled={resetOtp.length !== 4}
                  onClick={handleVerifyResetOtp}
                  className="w-full min-h-[50px] rounded-full bg-[#6B4FA0] hover:bg-[#5A4385] text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40 transition-all"
                >
                  <KeyRound size={16} /> Continue
                </button>
              </>
            )}

            {/* ── Reset: Set New PIN ───────────────────────────────────── */}
            {resetStage === 'newpin' && (
              <>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { setResetStage('otp'); setResetError(''); }}
                    className="w-9 h-9 rounded-full bg-[#FFFAF6] flex items-center justify-center text-[#3D2C4A] hover:bg-[#F1E4E8] cursor-pointer">
                    <ArrowLeft size={16} />
                  </button>
                  <strong className="text-xl font-bold text-[#3D2C4A]">Set a new PIN</strong>
                  <button type="button" onClick={closePinModal}
                    className="ml-auto w-9 h-9 rounded-full bg-[#FFFAF6] flex items-center justify-center text-[#3D2C4A] hover:bg-[#F1E4E8] cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                {resetError && (
                  <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-center">
                    {resetError}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#3D2C4A] block mb-1.5">New 4-digit PIN</label>
                    <input
                      ref={resetNewPinRef}
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={resetNewPin}
                      onChange={(e) => { setResetNewPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setResetError(''); }}
                      placeholder="· · · ·"
                      className="w-full min-h-[52px] rounded-2xl border-2 border-[#D3C6EE] text-center text-2xl font-bold tracking-[0.5em] text-[#3D2C4A] bg-[#F9F5FF] focus:outline-none focus:border-[#6B4FA0]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#3D2C4A] block mb-1.5">Confirm PIN</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={resetConfirmPin}
                      onChange={(e) => { setResetConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setResetError(''); }}
                      placeholder="· · · ·"
                      className={`w-full min-h-[52px] rounded-2xl border-2 text-center text-2xl font-bold tracking-[0.5em] text-[#3D2C4A] bg-[#F9F5FF] focus:outline-none transition-colors ${
                        resetConfirmPin.length === 4
                          ? resetConfirmPin === resetNewPin
                            ? 'border-[#2F7F62]'
                            : 'border-rose-400'
                          : 'border-[#D3C6EE] focus:border-[#6B4FA0]'
                      }`}
                    />
                    {resetConfirmPin.length === 4 && resetConfirmPin !== resetNewPin && (
                      <p className="text-[11px] text-rose-500 font-semibold mt-1">PINs don't match.</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={resetLoading || resetNewPin.length !== 4 || resetNewPin !== resetConfirmPin}
                  onClick={handleConfirmReset}
                  className="w-full min-h-[50px] rounded-full bg-[#6B4FA0] hover:bg-[#5A4385] text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40 transition-all"
                >
                  {resetLoading ? <Loader2 size={18} className="animate-spin" /> : <><KeyRound size={16} /> Save new PIN</>}
                </button>
              </>
            )}

            {/* ── Reset: Done ──────────────────────────────────────────── */}
            {resetStage === 'done' && (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <CheckCircle2 size={48} className="text-[#2F7F62]" />
                <div>
                  <strong className="block text-xl font-bold text-[#3D2C4A]">PIN reset successfully!</strong>
                  <p className="text-sm text-[#6E5B7A] mt-1">You can now use your new 4-digit PIN to access Parent space.</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setResetStage('idle'); setResetOtp(''); setResetNewPin(''); setResetConfirmPin(''); setPin(''); setResetError(''); }}
                  className="w-full min-h-[50px] rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  Open Parent space with new PIN
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
