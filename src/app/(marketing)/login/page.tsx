'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowRight, ArrowLeft, Loader2, Heart, Star, Sparkles, ChevronDown } from 'lucide-react';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

const DECORATIVE_ILLUSTRATION = '/uploads/assets/file-1780746441981-afa7cd5c-8d92-47b1-bfe6-cae0602d520a-4b79479e-8d37-4608-ab32-67223c47bc9b.png';

function getAssetUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005/api').replace(/\/api$/, '');
  return `${apiBase}${path}`;
}

const COUNTRIES = [
  { code: '+91', iso: 'in', name: 'India', digits: 10 },
  { code: '+1', iso: 'us', name: 'United States', digits: 10 },
  { code: '+44', iso: 'gb', name: 'United Kingdom', digits: 10 },
  { code: '+65', iso: 'sg', name: 'Singapore', digits: 8 },
  { code: '+971', iso: 'ae', name: 'United Arab Emirates', digits: 9 },
  { code: '+61', iso: 'au', name: 'Australia', digits: 9 }
];

export default function CustomerLoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'ROLE_SELECT'>('PHONE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Country Code Dropdown State
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: '+91', iso: 'in', name: 'India', digits: 10 });

  // Resend Timer States
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resendTrigger, setResendTrigger] = useState(0);

  // Store temporary login details for role onboarding selection
  const [tempAuthData, setTempAuthData] = useState<any>(null);

  const router = useRouter();
  const { setAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    // Role-based already authenticated checks
    if (isAuthenticated && user) {
      if (user.role === 'SCHOOL_COORDINATOR') {
        router.push('/schools/dashboard');
      } else if (user.role === 'OPS_MANAGER' || user.role === 'ADMIN') {
        router.push('/admin/schools');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  // Resend OTP timer effect
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
  }, [step, resendTrigger]);

  if (!mounted) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone || phone.length < 7) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    const normalizedMobile = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
    const formattedPhone = `${selectedCountryCode}${normalizedMobile}`;

    try {
      const response = await AuthService.sendOtp(formattedPhone);

      // Support test number bypass
      if (response && (response as any).autoLogin) {
        toast.success('Test number verified instantly!');
        const data = (response as any).autoLogin;
        handlePostVerifyRedirect(data);
        return;
      }

      toast.success('Verification code sent successfully!');
      setStep('OTP');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to send OTP. Please try again.');
      toast.error('Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;

    setIsLoading(true);
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    const normalizedMobile = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
    const formattedPhone = `${selectedCountryCode}${normalizedMobile}`;

    try {
      await AuthService.sendOtp(formattedPhone);
      toast.success('Verification code resent successfully!');
      setResendTrigger(prev => prev + 1);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to resend code. Please try again.');
      toast.error('Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter a valid 4-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    const normalizedMobile = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
    const formattedPhone = `${selectedCountryCode}${normalizedMobile}`;

    try {
      const data = await AuthService.verifyOtp(formattedPhone, otp);
      handlePostVerifyRedirect(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Invalid code. Please check and try again.');
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
      const cleanPhone = phone.replace(/\D/g, '');
      const normalizedMobile = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
      const formattedPhone = `${selectedCountryCode}${normalizedMobile}`;

      saveSessionAndRedirect(data.accessToken, data.refreshToken, {
        id: data.userId,
        role: data.role,
        phone: formattedPhone || data.phone,
        peerApplicationStatus: data.peerApplicationStatus
      });
    }
  };

  const selectRoleAndRegister = async (role: 'TEEN' | 'PARENT') => {
    if (!tempAuthData) return;

    setIsLoading(true);
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    const normalizedMobile = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
    const formattedPhone = `${selectedCountryCode}${normalizedMobile}`;

    try {
      // Set temporary auth token in zustand store first so that the API call is authorized
      setAuth(tempAuthData.accessToken, tempAuthData.refreshToken, {
        id: tempAuthData.userId,
        role: tempAuthData.role, // Default 'TEEN'
        phone: formattedPhone || tempAuthData.phone,
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
        phone: formattedPhone || tempAuthData.phone,
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

    if (userPayload.role === 'SCHOOL_COORDINATOR') {
      router.push('/schools/dashboard');
    } else if (userPayload.role === 'OPS_MANAGER' || userPayload.role === 'ADMIN') {
      router.push('/admin/schools');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex  justify-center bg-[#FFFAF7] relative overflow-hidden py-12 px-6">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 text-xs sm:text-sm font-bold backdrop-blur-md"
      >
        <ArrowLeft size={16} className="text-slate-500" />
        <span>Back to Home</span>
      </Link>

      {/* Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-accent/5 rounded-full blur-[120px]" />

      {/* Decorative Illustration - Bottom Right */}
      <img
        src={getAssetUrl(DECORATIVE_ILLUSTRATION)}
        alt=""
        aria-hidden="true"
        className="absolute bottom-[-10%] left-[-10%] w-[400px] sm:w-[520px] lg:w-[1000px] opacity-100 pointer-events-none select-none translate-x-[10%] translate-y-[10%]"
        draggable={false}
      />

      {/* Decorative Illustration - Top Left (mirrored) */}


      <div className="w-full max-w-md space-y-6 animate-fade-in relative z-10 mt-40">
        <div className="text-center space-y-2.5">
          <div className="w-40 h-10  flex items-center justify-center mx-auto mb-3 ">
            <Image src="/logo/infano-logo-for-light-bg.png" alt="Infano Logo" width={500} height={500} className="text-primary" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-800">
            Welcome to <span className="text-primary">Infano.care</span>
          </h2>
          <p className="text-sm text-slate-900 max-w-xs mx-auto">
            Securely sign in to access your learning dashboards and active sessions
          </p>
        </div>

        <div className="bg-white/95 border border-slate-100 p-8 rounded-xl shadow-xl shadow-slate-200/30">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-lg text-center">
              {error}
            </div>
          )}

          {step === 'PHONE' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 pl-0.5">
                  Phone Number
                </label>

                <div className="flex bg-slate-50 border border-slate-200 rounded-lg focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-primary/5 transition-colors overflow-visible relative shadow-sm">
                  {/* Dropdown Container */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-1.5 pl-3.5 pr-2.5 py-3 border-r border-slate-200 bg-transparent hover:bg-slate-100/50 transition-colors cursor-pointer select-none h-full"
                    >
                      <img
                        src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`}
                        className="w-5 h-3.5 object-cover rounded-sm shrink-0 border border-slate-200/50"
                        alt={selectedCountry.name}
                      />
                      <span className="text-sm font-bold text-slate-700">{selectedCountry.code}</span>
                      <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        {COUNTRIES.map((country) => (
                          <button
                            key={country.iso}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(country);
                              setSelectedCountryCode(country.code);
                              setPhone('');
                              setError('');
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold hover:bg-slate-50 transition-colors text-slate-700"
                          >
                            <img
                              src={`https://flagcdn.com/w40/${country.iso}.png`}
                              className="w-5.5 h-4 object-cover rounded-sm border border-slate-200/50 shrink-0"
                              alt={country.name}
                            />
                            <span className="flex-1">{country.name}</span>
                            <span className="text-slate-400 font-bold text-xs">{country.code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder={`Enter ${selectedCountry.digits}-digit number`}
                    maxLength={selectedCountry.digits}
                    className="w-full px-4 py-3 outline-none text-slate-800 text-sm font-semibold bg-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || phone.length !== selectedCountry.digits}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg flex items-center justify-center gap-2 group hover:shadow-md transition-all active:scale-95 disabled:opacity-50 duration-200 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Send verification code <ArrowRight className="group-hover:translate-x-0.5 transition-transform" size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="max-w-[240px] mx-auto w-full space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 pl-0.5">
                    Enter Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('PHONE');
                      setOtp('');
                    }}
                    className="text-xs font-bold text-primary hover:underline hover:text-primary-dark cursor-pointer"
                  >
                    Change mobile
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
                      className="w-12 h-14 text-xl font-bold text-center bg-slate-50 border border-slate-200 rounded-lg focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all text-slate-800"
                      maxLength={1}
                      required
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-400 font-medium text-center">
                  Verification code sent to <span className="font-bold text-slate-600">{selectedCountryCode} {phone}</span>
                </p>

                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 px-1">
                  <span>Didn't receive code?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-primary hover:underline hover:text-primary-dark font-bold cursor-pointer"
                    >
                      Resend code
                    </button>
                  ) : (
                    <span className="text-slate-400 font-medium">
                      Resend in {resendTimer}s
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 4}
                className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg flex items-center justify-center gap-2 group hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:grayscale transition-all duration-200 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Verify & continue <Shield className="ml-1" size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'ROLE_SELECT' && (
            <div className="space-y-5 animate-in fade-in duration-400">
              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  <Sparkles size={10} /> Profile Setup
                </span>
                <h3 className="text-lg font-bold text-slate-800">Who is using this workspace?</h3>
                <p className="text-xs font-semibold text-slate-400">Choose your workspace dashboard to customize your journey.</p>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => selectRoleAndRegister('TEEN')}
                  className="flex items-start gap-4 p-5 bg-gradient-to-br from-purple-50/60 to-violet-50/30 hover:from-purple-50 hover:to-violet-50/60 border border-purple-100 hover:border-purple-300 rounded-xl text-left transition-all duration-300 group hover:shadow-md hover:shadow-purple-100/10 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-white text-purple-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform border border-purple-100">
                    <Heart className="fill-purple-200 text-purple-600" size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-purple-700 transition-colors">I am a Teen (Daughter)</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-semibold mt-1">
                      Check your Period Tracker logs, attend live expert cohort sessions, and access your self-learning gamified journey.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectRoleAndRegister('PARENT')}
                  className="flex items-start gap-4 p-5 bg-gradient-to-br from-rose-50/60 to-orange-50/30 hover:from-rose-50 hover:to-orange-50/60 border border-rose-100 hover:border-rose-300 rounded-xl text-left transition-all duration-300 group hover:shadow-md hover:shadow-rose-100/10 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-white text-rose-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform border border-rose-100">
                    <Star className="fill-rose-100 text-rose-500" size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-rose-600 transition-colors">I am a Parent (Mother)</h4>
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
