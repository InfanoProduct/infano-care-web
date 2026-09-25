"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  ArrowRight, 
  KeyRound, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Lock
} from "lucide-react";
import { LibraryService } from "@/services/library.service";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";

function RedeemContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenParam = searchParams.get("token") || searchParams.get("order_id") || searchParams.get("receipt_id") || "";

  const [receiptId, setReceiptId] = useState(tokenParam);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"enter_phone" | "enter_otp">("enter_phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { isAuthenticated, user, setAuth } = useAuthStore();

  useEffect(() => {
    if (tokenParam) {
      setReceiptId(tokenParam);
    }
  }, [tokenParam]);

  // If already logged in, claim immediately
  const handleClaimForLoggedInUser = async () => {
    if (!receiptId.trim()) {
      setError("Please enter your Etsy Order / Receipt Number.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await LibraryService.claimEtsyOrder(receiptId.trim());
      setSuccess("Book unlocked successfully! Opening reader...");
      setTimeout(() => {
        router.push("/dashboard/library/gigi-the-book/read");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to claim order. Please verify your receipt ID.");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || phone.length < 8) {
      setError("Please enter a valid mobile number.");
      return;
    }
    if (!receiptId.trim()) {
      setError("Please enter your Etsy Order / Receipt Number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await AuthService.sendOtp(phone.trim());
      setStep("enter_otp");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Claim
  const handleVerifyOtpAndClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 4) {
      setError("Please enter the complete OTP.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const authRes = await AuthService.verifyOtp(phone.trim(), otp.trim());
      const data = authRes.data || authRes;
      
      if (data.accessToken && data.user) {
        setAuth(data.accessToken, data.refreshToken || data.accessToken, data.user);
      }

      // Automatically claim the eBook order
      await LibraryService.claimEtsyOrder(receiptId.trim());

      setSuccess("Account verified & Gigi the Book unlocked! Launching reader...");
      setTimeout(() => {
        router.push("/dashboard/library/gigi-the-book/read");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Verification failed. Please check the OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Book Showcase */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Instant Etsy eBook Access
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-200 bg-clip-text text-transparent">
              Welcome to the World of Gigi!
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Thank you for purchasing <strong>Gigi the Book</strong> on Etsy. Complete this quick verification to unlock your digital copy inside our secure cloud reader.
            </p>
          </div>

          {/* Key Reader Features */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Full-screen, Kindle-style in-app reading with night mode & bookmarks.</span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200">
              <Smartphone className="w-5 h-5 text-purple-400 shrink-0" />
              <span>Access anywhere on Web and the Infano Care Mobile App.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Activation Card */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl bg-white text-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-600" /> Unlock Your eBook
              </h2>
              <p className="text-xs text-slate-500">
                Quick Phone + OTP verification to link the book to your account
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {isAuthenticated ? (
              // Case A: User is already logged in
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-purple-50 text-purple-900 border border-purple-100 text-xs space-y-1">
                  <p className="font-semibold">Logged in as: {user?.phone || user?.email || "Infano User"}</p>
                  <p className="text-purple-700">Click below to unlock Gigi the Book directly into your Library.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Etsy Order / Receipt Number
                  </label>
                  <input
                    type="text"
                    value={receiptId}
                    onChange={(e) => setReceiptId(e.target.value)}
                    placeholder="e.g. 3482910542 or TEST-GIGI-123"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 text-sm font-mono"
                  />
                </div>

                <button
                  onClick={handleClaimForLoggedInUser}
                  disabled={loading || !receiptId.trim()}
                  className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Unlocking eBook...
                    </>
                  ) : (
                    <>
                      <span>Claim & Open Reader</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : step === "enter_phone" ? (
              // Case B: Step 1 - Enter Phone Number
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Etsy Order / Receipt Number
                  </label>
                  <input
                    type="text"
                    value={receiptId}
                    onChange={(e) => setReceiptId(e.target.value)}
                    placeholder="e.g. 3482910542"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Mobile Number (for OTP Login)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 text-sm font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !phone.trim() || !receiptId.trim()}
                  className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              // Case C: Step 2 - Enter OTP
              <form onSubmit={handleVerifyOtpAndClaim} className="space-y-4 animate-in fade-in">
                <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600">
                  OTP sent to <strong className="text-slate-900">{phone}</strong>.{" "}
                  <button
                    type="button"
                    onClick={() => setStep("enter_phone")}
                    className="text-purple-600 font-semibold underline ml-1"
                  >
                    Change
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Enter 4-Digit or 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="• • • •"
                    maxLength={6}
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 text-center font-mono tracking-widest text-lg font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !otp.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying & Unlocking...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Verify OTP & Unlock Book</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RedeemPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    }>
      <RedeemContent />
    </Suspense>
  );
}
