'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { AuthService } from '@/services/auth.service';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Shield, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ExpertSettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  // Password reset state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const data = await AuthService.getMe();
      setProfileData(data);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      toast.error(err.message || 'Failed to load profile details.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSendOtp = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setSendingOtp(true);
      await AuthService.sendSettingsEmailOtp();
      setOtpSent(true);
      setCooldown(60);
      toast.success('Verification code sent to your registered email!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setVerifying(true);
      await AuthService.verifySettingsEmailOtpAndResetPassword(otpCode, newPassword);
      toast.success('Password reset successfully!');
      // Reset form
      setNewPassword('');
      setConfirmPassword('');
      setOtpCode('');
      setOtpSent(false);
      setIsResettingPassword(false);
    } catch (err: any) {
      toast.error(err.message || 'Password reset failed.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your profile details and update security preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 outline-none ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 outline-none ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          Account Security
        </button>
      </div>

      {/* Profile Details Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
          {loadingProfile ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <span className="text-sm text-slate-500 font-medium">Loading profile details...</span>
            </div>
          ) : (
            <>
              {/* Header Card */}
              <div className="p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 bg-slate-50/50">
                <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-inner uppercase">
                  {profileData?.profile?.displayName?.slice(0, 2) || profileData?.username?.slice(0, 2) || 'EX'}
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h2 className="text-lg font-bold text-slate-800">
                    {profileData?.profile?.displayName || 'Expert User'}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 border border-indigo-100/50 text-indigo-600">
                      {profileData?.role || 'EXPERT'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-100/50 text-emerald-600 capitalize">
                      {profileData?.accountStatus?.toLowerCase() || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details List */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Display Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Display Name</label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-slate-700 text-sm font-medium">
                      <User className="w-4 h-4 text-slate-400" />
                      {profileData?.profile?.displayName || 'Not Set'}
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-slate-700 text-sm font-medium">
                      <User className="w-4 h-4 text-slate-400" />
                      {profileData?.username || 'Not Set'}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-slate-700 text-sm font-medium">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {profileData?.email || 'Not Set'}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-slate-700 text-sm font-medium">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {profileData?.phone || 'Not Set'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Account Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-500" />
              Reset Password
            </h2>
            <p className="text-xs text-slate-500 mt-1">To update your password, we will verify your identity via a one-time passcode sent to your registered email address.</p>
          </div>

          {!isResettingPassword && !otpSent ? (
            <div className="p-8 flex flex-col items-center justify-center text-center gap-4 py-12">
              <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-650 flex items-center justify-center shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-sm font-bold text-slate-800">Password Settings</h3>
                <p className="text-xs text-slate-500">We recommend changing your password regularly to ensure your expert account remains secure.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsResettingPassword(true)}
                className="mt-2 flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                Change Password
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="p-6 md:p-8 space-y-6">
              {!otpSent ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* New Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsResettingPassword(false)}
                      className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-150 active:scale-98 cursor-pointer"
                    >
                      {sendingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending Code...
                        </>
                      ) : (
                        'Send Verification OTP'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto space-y-6 text-center py-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 mb-2">
                    <Mail className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800">Enter Verification Code</h3>
                    <p className="text-xs text-slate-500">We have sent a 6-digit OTP code to <strong className="text-slate-700">{profileData?.email}</strong>.</p>
                  </div>

                  {/* OTP Input */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-40 text-center tracking-widest font-black text-2xl border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-slate-50"
                      required
                    />
                    <div className="text-xs text-slate-400">
                      {cooldown > 0 ? (
                        `Resend code in ${cooldown}s`
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-indigo-600 hover:underline font-semibold"
                        >
                          Resend OTP Code
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                      }}
                      className="flex-1 px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Change Password
                    </button>
                    <button
                      type="submit"
                      disabled={verifying}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify & Save Password'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
