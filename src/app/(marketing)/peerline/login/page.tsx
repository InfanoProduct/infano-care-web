'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Phone, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';

export default function PeerLineLoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    try {
      await AuthService.sendOtp(formattedPhone);
      setStep('OTP');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    try {
      const data = await AuthService.verifyOtp(formattedPhone, otp);
      
      // Check authorization specifically for PeerLine Dashboard
      const isAuthorized = data.role === 'PEER' ||
                           data.role === 'ADMIN' ||
                           data.role === 'EXPERT' ||
                           (data.role === 'TEEN' && data.peerApplicationStatus === 'approved');

      if (!isAuthorized) {
        throw new Error('Access denied. You must be an approved peer mentor to access this dashboard.');
      }
      
      // Set auth in store
      setAuth(data.accessToken, data.refreshToken, {
        id: data.userId,
        role: data.role,
        phone: phone,
        peerApplicationStatus: data.peerApplicationStatus
      });

      // Set cookie for middleware (expires in 7 days)
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `peer-token=${data.accessToken}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;

      router.push('/peerline/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Invalid OTP or access denied.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-full max-w-md space-y-8 animate-fade-in p-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="text-primary" size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tight italic">PeerLine <span className="text-primary">Portal</span></h2>
          <p className="text-muted-foreground font-medium">Mentor access securely verified via OTP</p>
        </div>

        <div className="glass-card p-8 rounded-[2rem] shadow-2xl border-white/40 bg-white/80 backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 pl-1 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60" size={20} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all font-bold text-slate-800"
                    placeholder="Enter 10-digit number"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 group hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Send OTP <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4 text-center">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-black text-slate-700 pl-1 uppercase tracking-wider">Enter 4-Digit OTP</label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setStep('PHONE');
                      setOtp('');
                    }}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Change Number
                  </button>
                </div>
                
                <div className="flex justify-center gap-4">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp[index] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (!val) {
                          // Backspace handling
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
                        
                        // Auto-focus next
                        if (index < 3) {
                          document.getElementById(`otp-${index + 1}`)?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otp[index] && index > 0) {
                          document.getElementById(`otp-${index - 1}`)?.focus();
                        }
                      }}
                      className="w-16 h-20 text-3xl font-black text-center bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all text-slate-800"
                      maxLength={1}
                      required
                    />
                  ))}
                </div>
                
                <p className="text-xs text-muted-foreground font-medium italic">
                  OTP sent to +91 {phone}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 4}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 group hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Verify & Login <Shield className="ml-1" size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
