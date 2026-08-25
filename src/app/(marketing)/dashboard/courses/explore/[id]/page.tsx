"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, BookOpen, Clock, Video, CheckCircle2, PlayCircle,
  Tag, Layers, Sparkles, Zap, ChevronDown, ChevronUp, FileText, Award, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";
import Script from "next/script";

export default function CourseExplorePage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (course?.modules?.length > 0) {
      const firstModule = [...course.modules].sort((a: any, b: any) => (a.order || 0) - (b.order || 0))[0];
      if (firstModule) {
        setExpandedModules({ [firstModule.id]: true });
      }
    }
  }, [course]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  useEffect(() => {
    if (id) fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const [data, enrolledRes] = await Promise.all([
        apiClient.get(`/lms/${id}`),
        apiClient.get(`/lms/my-courses`).catch(() => []),
      ]);
      if (!data) throw new Error("Failed to load course");

      // Store enrolled status instead of redirecting
      const isAlreadyEnrolled = Array.isArray(enrolledRes) &&
        enrolledRes.some((e: any) =>
          e.course?.id === (data as any).id || e.courseId === (data as any).id
        );
      setIsEnrolled(isAlreadyEnrolled);
      setCourse(data);
    } catch (error) {
      toast.error("Error loading course details");
      router.push("/dashboard/courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const res = await apiClient.post(`/lms/${course.id}/purchase`, {}) as any;

      if (course.isFree || !res.razorpay) {
        toast.success("Successfully enrolled!");
        router.push(`/dashboard/courses/${course.id}/overview`);
        return;
      }

      const { orderId, amount, currency, keyId } = res.razorpay;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "Infano Care",
        description: `Enroll in ${course.title}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            await apiClient.post(`/lms/${course.id}/verify-purchase`, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment successful! Enrolled in course.");
            router.push(`/dashboard/courses/${course.id}/overview`);
          } catch (verifyError: any) {
            toast.error(verifyError.message || "Payment verification failed.");
          }
        },
        prefill: {
          name: (user as any)?.profile?.displayName || (user as any)?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#7c3aed" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function () {
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate purchase.");
    } finally {
      setIsPurchasing(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
          Loading course details...
        </p>
      </div>
    );
  }

  if (!course) return null;

  const totalChapters = (course.modules || []).reduce(
    (acc: number, m: any) => acc + (m.chapters?.length || 0), 0
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto pb-12 font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* ── Back nav ── */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/courses"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300"
        >
          <ArrowLeft size={15} /> Explore Courses
        </Link>
        {course.category && (
          <span className="px-3 py-1 bg-violet-50 border border-violet-200/70 text-violet-700 text-[11px] font-black rounded-full uppercase tracking-wider">
            {course.category}
          </span>
        )}
      </div>

      {/* ── HERO — full-width premium card ── */}
      <div className="bg-white rounded-[26px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">

          {/* ── Thumbnail — full height, wider container ── */}
          <div className="relative lg:w-[55%] shrink-0 self-stretch overflow-hidden bg-gradient-to-br from-violet-100 to-purple-50 min-h-[300px]">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-violet-200">
                <BookOpen size={88} strokeWidth={1} />
              </div>
            )}

            {/* Price badge — top-left */}
            <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3.5 py-2 rounded-full font-black text-sm shadow-lg backdrop-blur-sm border ${course.isFree ? "bg-emerald-500 text-white border-emerald-400" : "bg-white/95 text-violet-700 border-violet-200"}`}>
              <Tag size={14} />
              {course.isFree ? "FREE" : `₹${course.price}`}
            </div>

            {/* Module count badge — bottom-left */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-[11px] font-bold rounded-full">
              <Layers size={12} /> {course.modules?.length || 0} Modules · {totalChapters} Chapters
            </div>
          </div>

          {/* ── Right content ── */}
          <div className="flex-1 flex flex-col justify-between p-7 md:p-10">
            {/* Top section */}
            <div className="space-y-4">
              {/* Tag row */}
              <div className="flex items-center flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                  <Sparkles size={10} className="animate-pulse" /> Expert-Led Course
                </span>
                {course.isFree && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                    <CheckCircle2 size={10} /> Free Enrollment
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-snug">
                {course.title}
              </h1>

              {/* Description */}
              {course.description && (
                <p className="text-slate-500 text-sm md:text-base font-semibold leading-relaxed line-clamp-3">
                  {course.description}
                </p>
              )}

              {/* Quick-stat chips */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {course.timeDuration && (
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl">
                    <Clock size={13} className="text-violet-500" />
                    {course.timeDuration} mins total
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl">
                  <BookOpen size={13} className="text-violet-500" />
                  {course.modules?.length || 0} Modules
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl">
                  <PlayCircle size={13} className="text-violet-500" />
                  {totalChapters} Chapters
                </div>
              </div>
            </div>

            {/* CTA section — bottom */}
            <div className="mt-7 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {isEnrolled ? (
                <button
                  onClick={() => router.push(`/dashboard/courses/${course.id}/overview`)}
                  className="w-full sm:w-auto flex-1 sm:flex-none inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-extrabold text-base shadow-[0_8px_24px_-4px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_32px_-4px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <CheckCircle2 size={20} />
                  <span>Go to Course Overview</span>
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="w-full sm:w-auto flex-1 sm:flex-none inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-70 text-white rounded-2xl font-extrabold text-base shadow-[0_8px_24px_-4px_rgba(124,58,237,0.4)] hover:shadow-[0_12px_32px_-4px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  {isPurchasing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      <PlayCircle size={20} />
                      {course.isFree ? "Enroll for Free" : `Purchase & Enroll · ₹${course.price}`}
                    </>
                  )}
                </button>
              )}
              <p className="text-[11px] font-semibold text-slate-400 leading-snug">
                🔒 Secure checkout · Instant access after enrollment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body — 2-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left col: What you'll learn + Curriculum Accordion + Description ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* What you'll learn — green pastel */}
          {course.highlights?.length > 0 && (
            <div className="bg-[#F0FDF4] border border-emerald-200/70 rounded-[26px] p-6 md:p-8 shadow-[0_4px_20px_rgba(16,185,129,0.06)] hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-white/90 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                  <Zap size={17} />
                </div>
                <h2 className="text-lg font-extrabold text-slate-800 uppercase tracking-wide">What You'll Learn</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {course.highlights.map((h: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/80 rounded-2xl border border-emerald-100/70 hover:bg-white transition-colors duration-200">
                    <div className="w-5 h-5 rounded-full bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5 shadow-sm">
                      <CheckCircle2 size={12} />
                    </div>
                    <span className="text-[13px] text-slate-600 font-semibold leading-snug">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Curriculum — Accoridon UI */}
          <div className="bg-white border border-slate-100 rounded-[26px] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 shadow-sm">
                  <Video size={17} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 uppercase tracking-wide">Course Curriculum</h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {course.modules?.length || 0} modules · {totalChapters} chapters
                  </p>
                </div>
              </div>
            </div>

            {/* Modules Accordion */}
            <div className="space-y-4">
              {course.modules?.length > 0 ? (
                [...course.modules]
                  .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                  .map((mod: any, index: number) => {
                    const isExpanded = !!expandedModules[mod.id];
                    return (
                      <div
                        key={mod.id}
                        className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                          isExpanded
                            ? "border-violet-200/80 bg-violet-50/10 shadow-sm"
                            : "border-slate-100 bg-white hover:border-slate-200"
                        }`}
                      >
                        {/* Module Header Toggle Button */}
                        <button
                          onClick={() => toggleModule(mod.id)}
                          className="w-full text-left p-5 flex items-start sm:items-center justify-between gap-4 select-none focus:outline-none"
                        >
                          <div className="flex items-start sm:items-center gap-4">
                            {/* Module Number badge */}
                            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                              isExpanded
                                ? "bg-violet-600 text-white shadow-sm"
                                : "bg-slate-100 text-slate-500"
                            }`}>
                              0{index + 1}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800 text-[14px] sm:text-base leading-snug group-hover:text-violet-700 transition-colors">
                                {mod.title}
                              </h3>
                              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                {mod.timeDuration && (
                                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                    {mod.timeDuration} mins
                                  </span>
                                )}
                                {mod.chapters?.length > 0 && (
                                  <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">
                                    {mod.chapters.length} chapter{mod.chapters.length !== 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={`w-8 h-8 rounded-full border border-slate-150 flex items-center justify-center text-slate-400 shrink-0 transform transition-transform duration-300 ${isExpanded ? "rotate-180 text-violet-600 border-violet-200" : ""}`}>
                            <ChevronDown size={16} />
                          </div>
                        </button>

                        {/* Chapters list inside expanded Module */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-white p-5 space-y-4">
                            {mod.description && (
                              <p className="text-xs text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-200 pl-3.5 mb-5">
                                {mod.description}
                              </p>
                            )}

                            {mod.chapters?.length > 0 ? (
                              <div className="space-y-4 pl-4 relative before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-100">
                                {[...mod.chapters]
                                  .sort((c1: any, c2: any) => (c1.order || 0) - (c2.order || 0))
                                  .map((chapter: any, cIdx: number) => {
                                    const isVideo = chapter.type === "VIDEO";
                                    return (
                                      <div key={chapter.id} className="relative pl-7 group">
                                        {/* Indicator bullet */}
                                        <div className="absolute left-[3.5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-200 bg-white group-hover:border-violet-400 group-hover:bg-violet-50 transition-all duration-200 flex items-center justify-center z-10">
                                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-violet-400 transition-all duration-200" />
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 p-3.5 rounded-xl border border-slate-50 hover:border-violet-100/70 hover:bg-slate-50/40 transition-all duration-200">
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              {isVideo ? (
                                                <Video size={13} className="text-violet-500 shrink-0" />
                                              ) : (
                                                <FileText size={13} className="text-emerald-500 shrink-0" />
                                              )}
                                              <h4 className="font-bold text-slate-800 text-[13px] leading-snug">
                                                {chapter.title}
                                              </h4>
                                            </div>
                                            {chapter.description && (
                                              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                                {chapter.description}
                                              </p>
                                            )}

                                            {/* Good to know points */}
                                            {chapter.goodToKnowPoints?.length > 0 && (
                                              <div className="pt-2 pl-1 space-y-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Key Takeaways:</span>
                                                <ul className="list-disc list-inside space-y-0.5 pl-1.5">
                                                  {chapter.goodToKnowPoints.map((pt: string, ptIdx: number) => (
                                                    <li key={ptIdx} className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                                      {pt}
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}
                                          </div>

                                          <div className="flex items-center gap-2 self-start shrink-0">
                                            {chapter.video?.duration && (
                                              <span className="text-[10px] font-black text-slate-400 bg-slate-100/80 px-2 py-0.5 rounded-md">
                                                {Math.ceil(chapter.video.duration / 60)} mins
                                              </span>
                                            )}
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                              isVideo
                                                ? "bg-violet-50 text-violet-600 border border-violet-100"
                                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                            }`}>
                                              {chapter.type}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 font-semibold text-center py-4">No chapters added to this module yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
              ) : (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl">
                  <BookOpen size={32} className="mx-auto mb-3 text-slate-200 animate-pulse" />
                  <p className="text-sm font-semibold text-slate-400">Curriculum contents are being finalized.</p>
                </div>
              )}
            </div>
          </div>

          {/* Course Description — purple pastel */}
          <div className="bg-[#FAF5FF] border border-purple-200/70 rounded-[26px] p-6 md:p-8 shadow-[0_4px_20px_rgba(168,85,247,0.06)] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-white/90 border border-purple-200 flex items-center justify-center text-purple-600 shadow-sm">
                <BookOpen size={17} />
              </div>
              <h2 className="text-lg font-extrabold text-slate-800 uppercase tracking-wide">Course Description</h2>
            </div>
            <p className="text-slate-600 text-sm font-semibold leading-relaxed whitespace-pre-wrap">
              {course.description}
            </p>
          </div>

          {/* Enroll CTA bar — rose pastel (or green if enrolled) */}
          {isEnrolled ? (
            <div className="bg-[#F0FDF4] border border-emerald-200/70 rounded-[26px] p-6 shadow-[0_4px_20px_rgba(16,185,129,0.06)] hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">You are enrolled in this course!</h3>
                <p className="text-[12px] font-semibold text-slate-500 mt-0.5">
                  Start learning today and track your progress.
                </p>
              </div>
              <button
                onClick={() => router.push(`/dashboard/courses/${course.id}/overview`)}
                className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-full shadow-sm transition-all active:scale-95 whitespace-nowrap"
              >
                <CheckCircle2 size={16} />
                Go to Overview →
              </button>
            </div>
          ) : (
            <div className="bg-[#FFF4F6] border border-rose-200/70 rounded-[26px] p-6 shadow-[0_4px_20px_rgba(244,63,94,0.06)] hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Ready to start learning?</h3>
                <p className="text-[12px] font-semibold text-slate-500 mt-0.5">
                  {course.isFree ? "This course is completely free. Enroll now!" : `One-time payment of ₹${course.price} for lifetime access.`}
                </p>
              </div>
              <button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm rounded-full shadow-sm transition-all active:scale-95 disabled:opacity-70 whitespace-nowrap"
              >
                <PlayCircle size={16} />
                {course.isFree ? "Enroll for Free →" : "Purchase Now →"}
              </button>
            </div>
          )}
        </div>

        {/* ── Right col: Sticky Course Inclusions & Details Widget ── */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-[26px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sticky top-6 space-y-6">
            
            {/* Quick stats grid */}
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-4 font-heading">Course Details</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50/70 border border-slate-100/70 p-3 rounded-2xl text-center">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Modules</span>
                  <span className="text-base font-extrabold text-slate-800">{course.modules?.length || 0}</span>
                </div>
                <div className="bg-slate-50/70 border border-slate-100/70 p-3 rounded-2xl text-center">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Chapters</span>
                  <span className="text-base font-extrabold text-slate-800">{totalChapters}</span>
                </div>
                <div className="bg-slate-50/70 border border-slate-100/70 p-3 rounded-2xl text-center">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Duration</span>
                  <span className="text-xs font-extrabold text-slate-800 truncate block mt-0.5">{course.timeDuration || 120} mins</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-50" />

            {/* Course Inclusions checklist */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest text-slate-400 pl-1">This Course Includes:</h4>
              <div className="space-y-3">
                {[
                  { label: "Self-paced interactive video lessons", icon: <Video size={14} className="text-violet-500" /> },
                  { label: "End-of-chapter knowledge checks", icon: <FileText size={14} className="text-emerald-500" /> },
                  { label: "Certified progress achievements badge", icon: <Award size={14} className="text-amber-500" /> },
                  { label: "Designated community forum support", icon: <ShieldCheck size={14} className="text-sky-500" /> },
                  { label: "Optimized mobile & tablet viewing", icon: <CheckCircle2 size={14} className="text-purple-500" /> },
                  { label: "Lifetime access & regular content updates", icon: <CheckCircle2 size={14} className="text-rose-500" /> },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-slate-100/60">
                      {item.icon}
                    </div>
                    <span className="text-[12px] text-slate-600 font-semibold leading-relaxed">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-50" />

            {/* Primary Sticky Action Widget */}
            <div className="space-y-3.5">
              {isEnrolled ? (
                <button
                  onClick={() => router.push(`/dashboard/courses/${course.id}/overview`)}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25 transition-all duration-200 active:scale-98"
                >
                  <CheckCircle2 size={16} />
                  <span>Go to Overview</span>
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-md shadow-violet-600/10 hover:shadow-violet-600/25 transition-all duration-200 active:scale-98 disabled:opacity-75"
                >
                  {isPurchasing ? (
                    <span className="w-4.5 h-4.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <PlayCircle size={16} />
                      <span>{course.isFree ? "Enroll Now for Free" : `Buy Course · ₹${course.price}`}</span>
                    </>
                  )}
                </button>
              )}
              <p className="text-[10px] font-bold text-center text-slate-400">
                🔒 Secure payment validation · Instant enrollment
              </p>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
