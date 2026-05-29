'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Phone, ArrowRight, Loader2, KeyRound, Heart, Star, Sparkles } from 'lucide-react';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';

export default function CustomerLoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'ROLE_SELECT'>('PHONE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  
  // Store temporary login details for role onboarding selection
  const [tempAuthData, setTempAuthData] = useState<any>(null);

  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    // If already authenticated, redirect straight to dashboard
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (!mounted) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    try {
      const response = await AuthService.sendOtp(formattedPhone);
      
      // Support test number bypass
      if (response && (response as any).autoLogin) {
        toast.success('Test number verified instantly!');
        const data = (response as any).autoLogin;
        handlePostVerifyRedirect(data);
        return;
      }

      toast.success('OTP sent successfully!');
      setStep('OTP');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to send OTP. Please try again.');
      toast.error('Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    try {
      const data = await AuthService.verifyOtp(formattedPhone, otp);
      handlePostVerifyRedirect(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Invalid OTP. Please check and try again.');
      toast.error('Verification failed.');
      setIsLoading(false);
    }
  };

  const handlePostVerifyRedirect = (data: any) => {
    // Enforce that role selection is only required if they are a new user OR still in PENDING_SETUP AND their role is TEEN and onboardingStep <= 1 (haven't completed role selection step)
    const requiresRoleOnboarding = 
      (data.isNewUser || data.accountStatus === 'PENDING_SETUP') && 
      data.role === 'TEEN' && 
      (data.onboardingStep === 1 || data.onboardingStep === 0);

    if (requiresRoleOnboarding && data.role !== 'ADMIN' && data.role !== 'EXPERT' && data.role !== 'PEER') {
      setTempAuthData(data);
      setStep('ROLE_SELECT');
      setIsLoading(false);
    } else {
      // Normal flow: Set auth and redirect directly to dashboard
      saveSessionAndRedirect(data.accessToken, data.refreshToken, {
        id: data.userId,
        role: data.role,
        phone: phone || data.phone,
        peerApplicationStatus: data.peerApplicationStatus
      });
    }
  };

  const selectRoleAndRegister = async (role: 'TEEN' | 'PARENT') => {
    if (!tempAuthData) return;
    
    setIsLoading(true);
    setError('');

    try {
      // Set temporary auth token in zustand store first so that the API call is authorized
      setAuth(tempAuthData.accessToken, tempAuthData.refreshToken, {
        id: tempAuthData.userId,
        role: tempAuthData.role, // Default 'TEEN'
        phone: phone || tempAuthData.phone,
        peerApplicationStatus: tempAuthData.peerApplicationStatus
      });

      // Update the user role in the backend
      await AuthService.updateRole(role);
      toast.success(`Welcome aboard! Profile completed as ${role === 'TEEN' ? 'Teen (Daughter)' : 'Parent (Mother)'}`);

      // Set cookie for middleware (expires in 7 days)
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `customer-token=${tempAuthData.accessToken}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;

      // Save final auth profile in store
      setAuth(tempAuthData.accessToken, tempAuthData.refreshToken, {
        id: tempAuthData.userId,
        role: role,
        phone: phone || tempAuthData.phone,
        peerApplicationStatus: tempAuthData.peerApplicationStatus
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to complete profile registration.');
      toast.error('Registration failed.');
      setIsLoading(false);
    }
  };

  const saveSessionAndRedirect = (accessToken: string, refreshToken: string, userPayload: any) => {
    // Set auth in store
    setAuth(accessToken, refreshToken, userPayload);

    // Set cookie for middleware (expires in 7 days)
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    document.cookie = `customer-token=${accessToken}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;

    toast.success('Signed in successfully!');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#FFFAF7] relative overflow-hidden py-12 px-6">
      {/* Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-accent/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-md">
            <Shield className="text-primary animate-pulse" size={28} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight font-heading text-slate-800">
            Welcome to <span className="text-primary">Infano Care</span>
          </h2>
          <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto">
            Securely sign in to access your learning dashboards and active sessions
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-2xl text-center">
              {error}
            </div>
          )}

          {step === 'PHONE' && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400 font-bold border-r border-slate-200 pr-3">
                    <span className="text-xs text-slate-500 font-black">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-4 pl-20 pr-4 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all font-bold text-slate-800 text-base"
                    placeholder="Enter 10-digit mobile"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 group hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 duration-200"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Send Verification Code <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4 text-center">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">
                    Enter Verification Code
                  </label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setStep('PHONE');
                      setOtp('');
                    }}
                    className="text-xs font-bold text-primary hover:underline hover:text-primary-dark"
                  >
                    Change Mobile
                  </button>
                </div>
                
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      id={`otp-box-${index}`}
                      type="text"
                      inputMode="numeric"
                      value={otp[index] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (!val) {
                          const newOtp = otp.split('');
                          newOtp[index] = '';
                          setOtp(newOtp.join(''));
                          return;
                        }
                        
                        const char = val.charAt(val.length - 1);
                        const newOtp = otp.split('');
                        newOtp[index] = char;
                        const finalOtp = newOtp.join('');
                        setOtp(finalOtp);
                        
                        if (index < 3) {
                          document.getElementById(`otp-box-${index + 1}`)?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otp[index] && index > 0) {
                          document.getElementById(`otp-box-${index - 1}`)?.focus();
                        }
                      }}
                      className="w-14 h-16 text-2xl font-black text-center bg-slate-50/50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all text-slate-800"
                      maxLength={1}
                      required
                    />
                  ))}
                </div>
                
                <p className="text-xs text-slate-400 font-medium">
                  Verification code sent to <span className="font-bold text-slate-600">+91 {phone}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 4}
                className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 group hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Verify & Continue <Shield className="ml-1" size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'ROLE_SELECT' && (
            <div className="space-y-6 animate-in fade-in duration-400">
              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                  <Sparkles size={10} /> Profile Setup
                </span>
                <h3 className="text-lg font-black text-slate-800">Who is using this workspace?</h3>
                <p className="text-xs font-semibold text-slate-400">Choose your workspace dashboard to customize your journey.</p>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => selectRoleAndRegister('TEEN')}
                  className="flex items-start gap-4 p-5 bg-gradient-to-br from-purple-50/60 to-violet-50/30 hover:from-purple-50 hover:to-violet-50/60 border border-purple-100 hover:border-purple-300 rounded-3xl text-left transition-all duration-300 group hover:shadow-lg hover:shadow-purple-100/30"
                >
                  <div className="w-12 h-12 bg-white text-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform border border-purple-100">
                    <Heart className="fill-purple-200 text-purple-600" size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-purple-700 transition-colors">I am a Teen (Daughter)</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-semibold mt-1">
                      Check your Period Tracker logs, attend live expert cohort sessions, and access your self-learning gamified journey.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectRoleAndRegister('PARENT')}
                  className="flex items-start gap-4 p-5 bg-gradient-to-br from-rose-50/60 to-orange-50/30 hover:from-rose-50 hover:to-orange-50/60 border border-rose-100 hover:border-rose-300 rounded-3xl text-left transition-all duration-300 group hover:shadow-lg hover:shadow-rose-100/30"
                >
                  <div className="w-12 h-12 bg-white text-rose-500 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform border border-rose-100">
                    <Star className="fill-rose-100 text-rose-500" size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-rose-600 transition-colors">I am a Parent (Mother)</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-semibold mt-1">
                      Monitor developmental progress, manage learning program enrollments, track booked demo slots, and read curated dinner conversation starters.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
