'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Mail, Lock, Loader2, Sparkles, Building, 
  ChevronRight, Key, ShieldAlert, CheckCircle2, Copy, ClipboardCheck, Eye, EyeOff 
} from 'lucide-react';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';
import { copyToClipboard } from '@/lib/utils';

export default function SchoolLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Password Recovery / Request Credentials State
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveredCredentials, setRecoveredCredentials] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Mandatory Password Reset State
  const [requiresReset, setRequiresReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [tempAuthData, setTempAuthData] = useState<any>(null);

  // Show/Hide password toggles
  const [showPwd, setShowPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const router = useRouter();
  const { setAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    // If already logged in and active, redirect directly to their workspace
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

  if (!mounted) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all credential fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await AuthService.adminLogin(username, password);

      if (data.requiresPasswordReset) {
        // Stop the redirect and transition to the Password Reset screen
        setTempAuthData(data);
        setRequiresReset(true);
        toast.success('Temporary password verified. Please choose a permanent password.');
      } else {
        // Save tokens and session payload in Zustand store
        setAuth(data.accessToken, data.refreshToken, {
          id: data.userId,
          username: data.username,
          role: data.role,
        });

        // Write cookie for auth middleware
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        document.cookie = `customer-token=${data.accessToken}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;

        toast.success('Signed in successfully! Welcome to your school portal.');

        if (data.role === 'SCHOOL_COORDINATOR') {
          router.push('/schools/dashboard');
        } else if (data.role === 'OPS_MANAGER' || data.role === 'ADMIN') {
          router.push('/admin/schools');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Invalid login coordinates. Please check and try again.';
      setError(msg);
      toast.error('Sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!newPassword || !confirmPassword) {
      setResetError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetLoading(true);

    try {
      await AuthService.resetCoordinatorPassword(newPassword, tempAuthData.accessToken);

      // Now complete the auth process with active status
      setAuth(tempAuthData.accessToken, tempAuthData.refreshToken, {
        id: tempAuthData.userId,
        username: tempAuthData.username,
        role: tempAuthData.role,
      });

      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `customer-token=${tempAuthData.accessToken}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;

      toast.success('Password updated successfully! Welcome to your workspace.');
      router.push('/schools/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to update password. Please try again.';
      setResetError(msg);
      toast.error('Password reset failed.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleRequestCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoveredCredentials(null);

    if (!recoveryEmail || !recoveryPhone) {
      setRecoveryError('Please fill in both Email and Phone fields.');
      return;
    }

    setRecoveryLoading(true);

    try {
      const response = await AuthService.requestNewCredentials(recoveryEmail, recoveryPhone);
      setRecoveredCredentials(response.tempPassword);
      toast.success('New temporary password generated successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Could not verify details. Please check and try again.';
      setRecoveryError(msg);
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleCopyRecoveredPassword = async () => {
    if (!recoveredCredentials) return;
    const success = await copyToClipboard(recoveredCredentials);
    if (success) {
      setIsCopied(true);
      toast.success('Password copied!');
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      toast.error('Failed to copy password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFAF7] relative overflow-hidden py-12 px-6 font-sans">
      {/* Premium background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-accent/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
        
        {/* Portal Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-md">
            <Building className="text-primary" size={28} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Partner <span className="text-primary">Dashboard</span>
          </h2>
          <p className="text-sm font-semibold text-slate-400 max-w-xs mx-auto">
            {requiresReset ? 'Choose a secure permanent password' : 'Secure login for School Coordinators & Program Operations Leads'}
          </p>
        </div>

        {/* 1. MANDATORY PASSWORD RESET VIEW */}
        {requiresReset ? (
          <div className="bg-white/90 backdrop-blur-xl border border-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100 shadow-sm">
                <Key size={22} />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight mt-2">First-time Security Reset</h3>
              <p className="text-[10px] font-semibold text-slate-400 leading-normal max-w-[260px] mx-auto">
                For security, your temporary password must be replaced with a permanent one before entering your dashboard.
              </p>
            </div>

            {resetError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-2xl text-center">
                {resetError}
              </div>
            )}

            <form onSubmit={handlePasswordResetSubmit} className="space-y-5">
              
              {/* New Password */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest block">
                  New Password (min. 6 chars)
                </label>
                <div className="relative">
                  <input 
                    type={showNewPwd ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new secure password"
                    className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-4 pl-5 pr-12 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all font-bold text-slate-800 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest block">
                  Confirm Password
                </label>
                <div className="relative">
                  <input 
                    type={showConfirmPwd ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-4 pl-5 pr-12 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all font-bold text-slate-800 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 group hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 duration-200 text-sm uppercase tracking-wider mt-2"
              >
                {resetLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Save & Enter Workspace 
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* 2. STANDARD LOGIN CARD */
          <div className="bg-white/70 backdrop-blur-xl border border-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 space-y-6">
            
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-left space-y-2 animate-in slide-in-from-top-2 duration-200">
                <p className="text-rose-600 text-xs font-bold text-center">{error}</p>
                {error.includes('expired') && (
                  <button
                    type="button"
                    onClick={() => setShowRecovery(true)}
                    className="w-full text-center py-2 border border-rose-200 bg-white text-rose-600 rounded-xl hover:bg-rose-50/50 text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    🔐 Request New Credentials
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest block">
                  School ID / Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter School ID or Email"
                    className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all font-bold text-slate-800 text-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">
                    Access Password
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setShowRecovery(true)}
                    className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type={showPwd ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-12 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all font-bold text-slate-800 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 group hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 duration-200 text-sm uppercase tracking-wider mt-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Enter School Workspace 
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Sub-brand citation */}
        <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          🔐 Compliant with India's DPDP Act 2023
        </div>

      </div>

      {/* 3. CREDENTIAL RECOVERY MODAL */}
      {showRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Background design */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl" />

            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="text-md font-black text-slate-800 tracking-tight">Request Credentials</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Generate Temporary Password</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowRecovery(false);
                  setRecoveryEmail('');
                  setRecoveryPhone('');
                  setRecoveryError('');
                  setRecoveredCredentials(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-black p-1.5 hover:bg-slate-50 rounded-xl transition-all"
              >
                ✕
              </button>
            </div>

            {/* Display Credentials if successfully generated */}
            {recoveredCredentials ? (
              <div className="space-y-5 py-2 animate-in zoom-in-95 duration-300">
                <div className="text-center space-y-2 bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 size={24} className="animate-bounce" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">New Temporary Password</span>
                  <div className="flex items-center justify-center gap-2.5 mt-2 bg-white border border-slate-200 rounded-xl p-3 shadow-inner">
                    <code className="text-lg font-black text-primary select-all tracking-wider">
                      {recoveredCredentials}
                    </code>
                    <button
                      onClick={handleCopyRecoveredPassword}
                      className="text-slate-400 hover:text-primary transition-all p-1 hover:bg-slate-50 rounded-lg"
                      title="Copy Password"
                    >
                      {isCopied ? <ClipboardCheck className="text-emerald-600" size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 leading-normal max-w-xs mx-auto mt-3">
                    Copy and use this password to login. Note: This temporary credential will expire in **24 hours**.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowRecovery(false);
                    setPassword(recoveredCredentials);
                    setRecoveredCredentials(null);
                    setRecoveryEmail('');
                    setRecoveryPhone('');
                  }}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                >
                  Proceed to Login
                  <ChevronRight size={14} />
                </button>
              </div>
            ) : (
              /* Request Form */
              <form onSubmit={handleRequestCredentialsSubmit} className="space-y-4">
                
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-[10px] font-bold text-rose-500 leading-relaxed flex gap-2">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>Only coordinators with accounts in pending setup status can request credentials. Expired passwords can be regenerated here.</span>
                </div>

                {recoveryError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl text-center">
                    {recoveryError}
                  </div>
                )}

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 pl-1 uppercase tracking-widest">
                    Coordinator Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="coordinator@school.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 pl-1 uppercase tracking-widest">
                    Registered Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={recoveryPhone}
                    onChange={(e) => setRecoveryPhone(e.target.value)}
                    placeholder="10-digit phone (e.g. 9876543210)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecovery(false);
                      setRecoveryEmail('');
                      setRecoveryPhone('');
                      setRecoveryError('');
                    }}
                    className="flex-1 py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-black rounded-xl uppercase tracking-wider transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                  >
                    {recoveryLoading ? <Loader2 className="animate-spin" size={14} /> : 'Generate'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
