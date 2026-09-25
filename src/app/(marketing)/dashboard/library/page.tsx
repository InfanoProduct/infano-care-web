"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  BookOpen, 
  Sparkles, 
  Bookmark, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRight, 
  Search, 
  KeyRound, 
  Loader2, 
  AlertCircle,
  Clock,
  BookMarked,
  ShieldCheck
} from "lucide-react";
import { LibraryService, LibraryBookItem } from "@/services/library.service";

export default function LibraryPage() {
  const [books, setBooks] = useState<LibraryBookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Claim Etsy Modal State
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [receiptIdInput, setReceiptIdInput] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);
  const [claimErrorMsg, setClaimErrorMsg] = useState<string | null>(null);

  const fetchLibrary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await LibraryService.getMyBooks();
      setBooks(data);
    } catch (err: any) {
      console.error("Failed to load library books", err);
      setError(err.message || "Failed to load your library. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleClaimEtsyOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptIdInput.trim()) return;

    setClaiming(true);
    setClaimErrorMsg(null);
    setClaimSuccessMsg(null);

    try {
      const res = await LibraryService.claimEtsyOrder(receiptIdInput.trim());
      setClaimSuccessMsg(res.message || "Book unlocked successfully!");
      setReceiptIdInput("");
      await fetchLibrary();
      setTimeout(() => {
        setShowClaimModal(false);
        setClaimSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      setClaimErrorMsg(err.response?.data?.message || err.message || "Failed to claim order. Please check the receipt ID.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-700 p-6 sm:p-8 md:p-10 text-white shadow-xl shadow-purple-500/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-rose-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" /> Infano eBook Library
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Your Digital Bookshelf
          </h1>
          <p className="text-sm sm:text-base text-rose-100/90 leading-relaxed">
            Read, bookmark, and explore interactive stories and puberty wellness guides anywhere, protected and synced across your devices.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setShowClaimModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-700 font-semibold text-sm shadow-md hover:bg-rose-50 transition active:scale-95"
            >
              <KeyRound className="w-4 h-4 text-purple-600" />
              Claim Etsy Order
            </button>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium text-sm border border-white/20 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              Explore Physical Books
            </Link>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute right-20 bottom-0 -mb-10 w-60 h-60 rounded-full bg-rose-400/20 blur-2xl pointer-events-none" />
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading your library...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      ) : books.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-purple-600" /> My Unlocked Books ({books.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((item) => (
              <div
                key={item.entitlementId}
                className="group relative flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Book Cover Banner */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 to-rose-100 border border-slate-100 flex items-center justify-center">
                    {item.coverImageUrl ? (
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="p-6 text-center space-y-2">
                        <BookOpen className="w-12 h-12 text-purple-600 mx-auto" />
                        <span className="text-xs font-bold text-purple-900 uppercase">Infano eBook</span>
                      </div>
                    )}
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-[11px] font-bold text-white flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5" /> Unlocked
                    </span>
                  </div>

                  {/* Book Details */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                      {item.author}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Reading Progress */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>Progress: Page {item.lastReadPage} of {item.totalPages}</span>
                      <span className="font-bold text-purple-700">{Math.round(item.progressPercent)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(item.progressPercent, 4)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.bookmarksCount} Bookmarks</span>
                  </div>
                  <Link
                    href={`/dashboard/library/${item.slug || item.bookId}/read`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-md shadow-purple-600/20 hover:bg-purple-700 transition active:scale-95"
                  >
                    <span>{item.progressPercent > 0 ? "Continue Reading" : "Start Reading"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl bg-white border border-slate-100 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Your Library is Empty</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Purchased <strong>Gigi the Book</strong> on Etsy? Enter your Etsy Order / Receipt Number below to unlock it instantly.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setShowClaimModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 hover:from-purple-700 hover:to-indigo-700 transition active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              Claim with Etsy Order ID
            </button>
          </div>
        </div>
      )}

      {/* Claim Etsy Order Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Unlock Etsy eBook</h3>
                  <p className="text-xs text-slate-500">Enter your 10-digit Etsy order receipt</p>
                </div>
              </div>
              <button
                onClick={() => setShowClaimModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleClaimEtsyOrder} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Etsy Order / Receipt Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3482910542 or TEST-GIGI-123"
                  value={receiptIdInput}
                  onChange={(e) => setReceiptIdInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 text-sm font-mono placeholder:font-sans"
                  required
                />
                <p className="text-[11px] text-slate-400">
                  Found on your Etsy receipt or confirmation email.
                </p>
              </div>

              {claimErrorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{claimErrorMsg}</span>
                </div>
              )}

              {claimSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{claimSuccessMsg}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="w-1/2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claiming || !receiptIdInput.trim()}
                  className="w-1/2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  {claiming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Unlock Book"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
