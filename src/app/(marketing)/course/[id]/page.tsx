/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, BookOpen, Clock, Video, CheckCircle2, PlayCircle,
    Tag, Layers, Sparkles, Award, Star, Shield, ArrowRight,
    Monitor, Calendar, ChevronDown, ChevronUp, Paperclip, Play,
    Trophy, Users, Briefcase
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/auth-store";
import { useRegion } from "@/hooks/use-region";
import { apiClient } from "@/lib/api-client";

export default function MarketingCourseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { token, user, isAuthenticated } = useAuthStore();
    const { currencyCode, formatPrice } = useRegion();
    const [course, setCourse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 23, minutes: 59, seconds: 59 });
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [enrollForm, setEnrollForm] = useState({ name: "", phone: "", email: "" });
    const [isEnrolling, setIsEnrolling] = useState(false);

    // Single active accordion module ID
    const [expandedModuleId, setExpandedModuleId] = useState<string>("");

    useEffect(() => {
        const targetDate = new Date();
        targetDate.setHours(24, 0, 0, 0);

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetDate.getTime() - now;

            if (difference <= 0) {
                targetDate.setHours(targetDate.getHours() + 24);
                return;
            }

            const d = Math.floor(difference / (1000 * 60 * 60 * 24));
            const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const [previewOffset, setPreviewOffset] = useState(0);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        setIsDesktop(window.innerWidth >= 1024);
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!expandedModuleId) return;

        const timer = setTimeout(() => {
            const activeEl = document.getElementById(`module-accordion-${expandedModuleId}`);
            const containerEl = document.getElementById("curriculum-grid-container");
            const cardEl = document.getElementById("preview-card");
            if (activeEl && containerEl && cardEl) {
                const activeRect = activeEl.getBoundingClientRect();
                const containerRect = containerEl.getBoundingClientRect();
                const targetTop = activeRect.top - containerRect.top;

                // Let the card sit perfectly beside the active module, bounded inside the lower layout boundaries
                const maxTop = Math.max(0, containerRect.height - cardEl.clientHeight - 40);
                const finalTop = Math.min(targetTop, maxTop);
                setPreviewOffset(finalTop);
            }
        }, 150);
        return () => clearTimeout(timer);
    }, [expandedModuleId, course]);

    useEffect(() => {
        if (id) fetchCourseDetails();
    }, [id]);

    const fetchCourseDetails = async () => {
        try {
            // Parallel loading of course info & enroll status if authenticated
            const endpoints = [apiClient.get(`/lms/${id}`)];
            if (token) {
                endpoints.push(apiClient.get(`/lms/my-courses`).catch(() => []));
            }

            const results = await Promise.all(endpoints);
            const data = results[0] as any;
            const enrolledRes = results[1] || [];

            if (!data) throw new Error("Failed to load course details");

            const isAlreadyEnrolled = Array.isArray(enrolledRes) &&
                enrolledRes.some((e: any) =>
                    e.course?.id === (data as any).id || e.courseId === (data as any).id
                );
            setIsEnrolled(isAlreadyEnrolled);
            setCourse(data);

            // Expand first module by default
            if (data.modules && data.modules.length > 0) {
                const sorted = [...data.modules].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
                setExpandedModuleId(sorted[0].id);
            }
        } catch (error) {
            toast.error("Error loading course details");
            router.push("/course");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleModule = (moduleId: string) => {
        // If opening one, others close automatically (1 time only 1 module can open)
        setExpandedModuleId(prev => prev === moduleId ? "" : moduleId);
    };

    const handlePurchase = async () => {
        if (isAuthenticated) {
            if (isEnrolled) {
                // Scenario 3: user is existing, authenticated, and enrolled -> go to course overview
                router.push(`/dashboard/courses/${course.id}/overview`);
            } else {
                // Scenario 2: user is existing but not enrolled -> navigate to cdp in dashboard
                router.push(`/dashboard/courses/explore/${course.id}`);
            }
            return;
        }

        // Scenario 1: new and not logged in -> open enrollment form modal
        setIsEnrollModalOpen(true);
    };

    const handlePublicEnrollSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!enrollForm.name || !enrollForm.phone || !enrollForm.email) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsEnrolling(true);
        try {
            // Check enrollment status publicly
            const checkRes = await apiClient.post("/lms/public/check-enrollment", {
                email: enrollForm.email,
                phone: enrollForm.phone,
                courseId: course.id
            }) as any;

            if (checkRes.enrolled) {
                toast(checkRes.message || "An account with this email/phone is already enrolled. Please login.", { icon: "ℹ️" });
                setIsEnrollModalOpen(false);
                router.push(`/login?redirect=/dashboard/courses/${course.id}/overview`);
                return;
            }

            // Initiate purchase order publicly
            const purchaseRes = await apiClient.post("/lms/public/purchase", {
                name: enrollForm.name,
                email: enrollForm.email,
                phone: enrollForm.phone,
                courseId: course.id,
                currency: currencyCode,
            }) as any;

            if (course.isFree || !purchaseRes.razorpay) {
                toast.success("Successfully enrolled!");
                setIsEnrollModalOpen(false);
                router.push(`/login?redirect=/dashboard/courses/${course.id}/overview`);
                return;
            }

            // Razorpay flow
            const { orderId, amount, currency, keyId } = purchaseRes.razorpay;

            const options = {
                key: keyId,
                amount: Math.round((amount || course.price) * 100),
                currency: currency || currencyCode,
                name: "Infano Care",
                description: `Enroll in ${course.title}`,
                order_id: orderId,
                handler: async function (response: any) {
                    try {
                        await apiClient.post(`/lms/public/verify-purchase`, {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        toast.success("Payment successful! Please login to start learning.");
                        setIsEnrollModalOpen(false);
                        router.push(`/login?redirect=/dashboard/courses/${course.id}/overview`);
                    } catch (verifyError: any) {
                        toast.error(verifyError.message || "Payment verification failed.");
                    }
                },
                prefill: {
                    name: enrollForm.name,
                    email: enrollForm.email,
                    contact: enrollForm.phone,
                },
                theme: { color: "#4a1e7f" },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on("payment.failed", function () {
                toast.error("Payment failed. Please try again.");
            });
            rzp.open();
        } catch (error: any) {
            toast.error(error.message || "Failed to submit enrollment");
        } finally {
            setIsEnrolling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 bg-white">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                    Loading course details...
                </p>
            </div>
        );
    }

    if (!course) return null;

    const totalChapters = (course.modules || []).reduce(
        (acc: number, m: any) => acc + (m.chapters?.length || 0), 0
    );

    // Active module details for dynamic content update (Right layout card)
    const activeModule = course.modules?.find((m: any) => m.id === expandedModuleId);
    const activeImageUrl = activeModule?.thumbnailUrl || course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";
    const activeTitle = activeModule ? activeModule.title : course.title;
    const activeDesc = activeModule?.description || course.description || "Nunc mattis enim ut tellus elementum sagittis vitae. Nisi lacus sed viverra tellus in hac. Amet dictum sit amet justo donec enim diam. Morbi non arcu risus quis varius quam quisque id. Mi eget mauris pharetra et ultrices neque. Natoque penatibus et magnis dis parturient montes nascetur.";

    return (
        <div className="min-h-screen bg-slate-50/30 text-slate-800 font-sans overflow-x-hidden relative">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            {/* Subtle dot grid background — matching home */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4a1e7f 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            {/* Decorative Blob Elements - Schools/Ecosystem aesthetic */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[5%] right-[-10%] w-[50%] h-[35%] bg-primary/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
                <div className="absolute bottom-[20%] left-[-10%] w-[45%] h-[40%] bg-pink-50 rounded-full blur-[100px] animate-pulse pointer-events-none" />
            </div>

            <div className="relative z-10 w-full flex flex-col">

                {/* HERO SECTION */}
                <section className="relative w-full bg-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-100 overflow-hidden">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12 xl:px-24 z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

                        {/* Left Column: Course details & summary - ordered second on mobile */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-7 space-y-6 order-2 lg:order-1"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50/80 backdrop-blur-sm border border-slate-100/60 rounded-full shadow-[0_2px_8px_rgba(74,30,127,0.01)] animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
                                <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] leading-none">{course.category || "wellness learning"}</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold font-heading leading-tight tracking-tight text-slate-900 border-none animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both" style={{ animationDelay: '100ms' }}>
                                Empower with <span className="text-primary">{course.title}</span>
                            </h1>

                            <p className="text-base md:text-md text-slate-500 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both" style={{ animationDelay: '200ms' }}>
                                {course.description || "Take control of your wellness journey. This structured programme is designed to equip you with expert knowledge, lifetime tools, and practical guidance."}
                            </p>

                            {/* Reference rating & review block */}
                            <div className="flex items-center gap-4 flex-wrap pt-2">
                                <div className="flex items-center gap-1.5 bg-amber-50/40 border border-amber-200/40 px-3.5 py-2 rounded-full shadow-[0_2px_6px_rgba(245,158,11,0.03)]">
                                    <Star size={14} className="fill-amber-400 text-amber-400" />
                                    <span className="text-xs font-black text-slate-700">4.8 Rating</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400">Highly recommended by moms & teen learners</span>
                            </div>

                            {/* Quick Metadata Pillbox */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-b border-slate-200 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Duration</h4>
                                        <p className="text-xs font-extrabold text-slate-800 mt-1">{course.timeDuration || 120} mins total</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0 border border-pink-100/50">
                                        <Layers size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Curriculum</h4>
                                        <p className="text-xs font-extrabold text-slate-800 mt-1">{course.modules?.length || 0} modules</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100/50">
                                        <Video size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Chapters</h4>
                                        <p className="text-xs font-extrabold text-slate-800 mt-1">{totalChapters} resource lessons</p>
                                    </div>
                                </div>
                            </div>

                            {/* Price & Checkout Row */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 pt-4 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both" style={{ animationDelay: '300ms' }}>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-slate-900">
                                        {course.isFree ? "FREE" : `₹${course.price}`}
                                    </span>
                                    {!course.isFree && (
                                        <span className="text-sm font-bold text-slate-400 line-through">
                                            ₹{Math.round(course.price * 1.5)}
                                        </span>
                                    )}
                                </div>

                                {isEnrolled ? (
                                    <button
                                        onClick={() => router.push(`/dashboard/courses/${course.id}/overview`)}
                                        className="btn-primary text-sm px-8 py-4 group shadow-lg shadow-primary/20 inline-flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                                    >
                                        Go to Course Overview
                                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handlePurchase}
                                        disabled={isPurchasing}
                                        className="btn-primary text-sm px-8 py-4 group shadow-lg shadow-primary/20 inline-flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                                    >
                                        {isPurchasing ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </span>
                                        ) : (
                                            <>
                                                {course.isFree ? "Enroll for Free" : "Purchase & Get Access"}
                                                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                                <Shield size={12} className="text-emerald-500" />
                                Secure Checkout · Instant access to learning modules
                            </p>
                        </motion.div>

                        {/* Right Column: Hero Graphic - ordered first on mobile */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.15 }}
                            className="lg:col-span-5 relative flex justify-center items-center order-1 lg:order-2"
                        >
                            {/* Organic purple/pink background blob loop */}
                            <div className="absolute top-[8%] right-[8%] w-[85%] h-[85%] bg-gradient-to-tr from-[#F4E8FF] via-[#FDF2F8] to-[#FFF0EB] rounded-[60%_40%_50%_40%_/_50%_40%_60%_50%] -z-10 animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />

                            {/* Wavy loop border */}
                            <svg className="absolute top-[-5%] left-[-5%] w-[110%] h-[110%] text-primary/20 pointer-events-none z-0" viewBox="0 0 100 100" fill="none">
                                <path d="M12,82 C-5,50 15,22 46,18 C68,15 82,32 62,8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3, 3" strokeLinecap="round" />
                            </svg>

                            {/* Double outline stars on card */}
                            <div className="absolute top-[4%] right-0 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-[0_8px_30px_rgba(74,30,127,0.06)] border border-purple-100/50 flex items-center gap-3 z-20 hover:scale-103 transition-transform">
                                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0 border border-amber-100">
                                    <Award size={14} className="fill-amber-400 text-amber-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[11px] text-slate-800 tracking-tight">NEP Aligned</h4>
                                    <p className="text-[9px] font-medium text-slate-400 mt-0.5">Empowerment curriculum</p>
                                </div>
                            </div>

                            {/* Sticky badge style */}
                            <div className="absolute bottom-[-10px] left-0 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-[0_8px_30px_rgba(74,30,127,0.06)] border border-purple-100/50 flex items-center gap-3 z-20 hover:scale-103 transition-transform">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-100">
                                    <CheckCircle2 size={14} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[11px] text-slate-800 tracking-tight">100% Verified</h4>
                                    <p className="text-[9px] font-medium text-slate-450 mt-0.5">Pediatric approved metrics</p>
                                </div>
                            </div>

                            {/* Main Portrait squircle image */}
                            <div className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[380px] md:h-[380px] rounded-[48px_36px_64px_44px] overflow-hidden shadow-[0_12px_45px_rgba(74,30,127,0.08)] border-[6px] border-white z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-500 bg-slate-50">
                                <img
                                    src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Wavy cursive sticker */}
                            <div className="absolute bottom-[-24px] right-[2%] bg-[#FFF4EC] border border-[#FFD8C0] rounded-3xl p-5 shadow-[0_12px_32px_rgba(251,146,60,0.14)] transform rotate-[6deg] w-[140px] text-center z-20 font-caveat select-none">
                                <p className="text-[17px] font-black text-primary leading-tight">
                                    Self-Paced<br />
                                    Quality &<br />
                                    Confidence ♡
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* SECTION 1: WHAT YOU WILL LEARN & FORMAT/DURATION (combined on same row layout) */}
                <section className="relative w-full bg-slate-50/30 py-16 md:py-20 lg:py-24 border-b border-slate-100 overflow-hidden">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-200 shadow-[0_10px_35px_rgba(74,30,127,0.02)]">

                            {/* Left Column: What You will Learn (60% width) */}
                            <div className="lg:col-span-7 flex flex-col justify-between pr-0 lg:pr-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full mb-4">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Learning Outcomes</span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 tracking-tight leading-tight mb-8">
                                        What you will <span className="text-primary">Learn & Master</span>
                                    </h2>

                                    <div className="grid grid-cols-1 gap-4">
                                        {course.highlights && course.highlights.length > 0 ? (
                                            course.highlights.map((highlight: string, idx: number) => (
                                                <motion.div
                                                    key={idx}
                                                    whileHover={{ scale: 1.01, x: 4 }}
                                                    className="flex items-start gap-4 p-4.5 rounded-2xl bg-[#FAF9FC]/30 hover:bg-[#FAF9FC] border border-slate-100 hover:border-primary/15 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.005)]"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                                                        <CheckCircle2 size={16} />
                                                    </div>
                                                    <span className="text-[14px] font-semibold text-slate-700 leading-relaxed font-sans mt-0.5">
                                                        {highlight}
                                                    </span>
                                                </motion.div>
                                            ))
                                        ) : (
                                            [
                                                "Gain complete awareness of puberty transitions steps and hormonal regulations",
                                                "Learn evidence-based menstrual wellness and health metrics",
                                                "Acquire practical communication skills to foster strong family bonds"
                                            ].map((highlight: string, idx: number) => (
                                                <motion.div
                                                    key={idx}
                                                    whileHover={{ scale: 1.01, x: 4 }}
                                                    className="flex items-start gap-4 p-4.5 rounded-2xl bg-[#FAF9FC]/30 hover:bg-[#FAF9FC] border border-slate-100 hover:border-primary/15 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.005)]"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                                                        <CheckCircle2 size={16} />
                                                    </div>
                                                    <span className="text-[14px] font-semibold text-slate-700 leading-relaxed font-sans mt-0.5">
                                                        {highlight}
                                                    </span>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Cards (40% width, twin grid cards side-by-side on tablet, stacked on mobile and desktop) */}
                            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">

                                {/* Card 1: Course Format */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                    className="bg-gradient-to-tr from-[#FAF5FF] via-white to-purple-50/20 border border-purple-100 rounded-[2rem] p-6.5 shadow-[0_8px_30px_rgba(74,30,127,0.02)] flex flex-col justify-start space-y-5 hover:shadow-[0_12px_40px_rgba(74,30,127,0.06)] transition-all duration-300"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary border border-purple-100 shadow-[0_2px_8px_rgba(74,30,127,0.02)] shrink-0">
                                        <Monitor size={17} />
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-extrabold text-[15px] font-heading text-slate-800 tracking-tight">
                                            Learning Format
                                        </h3>
                                        <ul className="space-y-3">
                                            {[
                                                "Interactive Lessons",
                                                "Knowledge Checks",
                                                "Downloadable Worksheets",
                                                "Accompanying Resources"
                                            ].map((item, idx) => (
                                                <li key={idx} className="flex items-center gap-3 group/item">
                                                    <div className="w-5 h-5 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center text-primary shrink-0 transition-colors group-hover/item:bg-primary group-hover/item:text-white">
                                                        <span className="text-[10px] font-black">✓</span>
                                                    </div>
                                                    <span className="text-[13px] font-semibold text-slate-655 text-slate-600 group-hover/item:text-slate-800 transition-colors leading-none">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>

                                {/* Card 2: Duration Course */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                    className="bg-gradient-to-tr from-[#F0FDF4] via-white to-emerald-50/20 border border-emerald-100 rounded-[2rem] p-6.5 shadow-[0_8px_30px_rgba(16,185,129,0.015)] flex flex-col justify-start space-y-5 hover:shadow-[0_12px_40px_rgba(16,185,129,0.05)] transition-all duration-300"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.02)] shrink-0">
                                        <Calendar size={17} />
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-extrabold text-[15px] font-heading text-slate-800 tracking-tight">
                                            Weekly Schedule
                                        </h3>
                                        <ul className="space-y-3">
                                            {[
                                                "Flexible Self-Pacing",
                                                "Multiple Core Chapters",
                                                "Weekly Wellness Goals",
                                                "Ongoing Expert Panel"
                                            ].map((item, idx) => (
                                                <li key={idx} className="flex items-center gap-3 group/item">
                                                    <div className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-655 text-emerald-600 shrink-0 transition-colors group-hover/item:bg-emerald-600 group-hover/item:text-white">
                                                        <span className="text-[10px] font-black">✓</span>
                                                    </div>
                                                    <span className="text-[13px] font-semibold text-slate-655 text-slate-600 group-hover/item:text-slate-800 transition-colors leading-none">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section >

                {/* PROMOTIONAL SPECIAL OFFER COUNTDOWN SECTION */}
                <section className="relative w-full bg-slate-50/20 py-16 md:py-20 lg:py-24 border-b border-slate-100 overflow-hidden">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

                        {/* Left Column: Heading, Timer, CTA button */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-7 space-y-6 order-2 lg:order-1"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 border border-pink-100 rounded-full">
                                <Sparkles size={12} className="text-pink-500" />
                                <span className="text-[10px] font-bold text-pink-500 uppercase tracking-[0.2em] leading-none">limited enrollment discount</span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 tracking-tight leading-tight">
                                Enroll Today & Get Instant Access to <span className="text-primary">All Practice Tracks</span>
                            </h2>

                            <p className="text-base md:text-md text-slate-500 leading-relaxed font-medium">
                                Take control of your learning process with printable worksheets, self-paced progress logs, and verified pediatric wellness materials. Register today to lock in this special discounted access rate.
                            </p>

                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
                                {/* Countdown Timer Row */}
                                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-[0_4px_22px_rgba(74,30,127,0.015)] flex items-center justify-center gap-4 min-w-[240px] sm:min-w-[280px]">
                                    <div className="text-center font-sans">
                                        <span className="block text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none">
                                            {String(timeLeft.days).padStart(2, '0')}
                                        </span>
                                        <span className="block text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider leading-none">Days</span>
                                    </div>
                                    <span className="text-xl sm:text-2xl font-black text-slate-350 select-none font-sans">:</span>
                                    <div className="text-center font-sans">
                                        <span className="block text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none">
                                            {String(timeLeft.hours).padStart(2, '0')}
                                        </span>
                                        <span className="block text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider leading-none">Hours</span>
                                    </div>
                                    <span className="text-xl sm:text-2xl font-black text-slate-350 select-none font-sans">:</span>
                                    <div className="text-center font-sans">
                                        <span className="block text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none">
                                            {String(timeLeft.minutes).padStart(2, '0')}
                                        </span>
                                        <span className="block text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider leading-none">Mins</span>
                                    </div>
                                    <span className="text-xl sm:text-2xl font-black text-slate-350 select-none font-sans">:</span>
                                    <div className="text-center font-sans">
                                        <span className="block text-2xl sm:text-3xl font-black text-primary tracking-tight leading-none">
                                            {String(timeLeft.seconds).padStart(2, '0')}
                                        </span>
                                        <span className="block text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider leading-none">Secs</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                {isEnrolled ? (
                                    <button
                                        onClick={() => router.push(`/dashboard/courses/${course.id}/overview`)}
                                        className="btn-primary text-sm px-8 py-4 group shadow-lg shadow-primary/20 inline-flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                                    >
                                        Go to Course Dashboard
                                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handlePurchase}
                                        disabled={isPurchasing}
                                        className="btn-primary text-sm px-8 py-4 group shadow-lg shadow-primary/20 inline-flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                                    >
                                        {isPurchasing ? "Processing..." : "Explore Course Admission"}
                                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        {/* Right Column: Graphic student using laptop with offset and diamonds */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                            className="lg:col-span-5 relative flex justify-center items-center order-1 lg:order-2"
                        >
                            {/* Shifted pastel lavender offset box behind target */}
                            <div className="absolute inset-0 bg-primary/5 rounded-[36px] w-[260px] h-[260px] sm:w-[305px] sm:h-[305px] md:w-[340px] md:h-[340px] transform translate-x-4 translate-y-4 -z-10 border border-primary/10" />

                            {/* Floating Pastel Decors */}
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-[8%] left-[-12%] w-14 h-14 bg-pink-100/50 border border-pink-200/20 -rotate-12 rounded-2xl transform skew-x-3 -z-20 shadow-sm opacity-90 hidden sm:block"
                            />
                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-[20%] right-[-10%] w-20 h-20 bg-[#FFF4EC]/75 border border-[#FFD8C0]/30 rotate-45 rounded-[28px] -z-20 shadow-sm opacity-90 pointer-events-none"
                            />

                            {/* Main squircle image container with hover animation */}
                            <motion.div
                                whileHover={{ y: -6, scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="w-[260px] h-[260px] sm:w-[305px] sm:h-[305px] md:w-[340px] md:h-[340px] rounded-[36px] overflow-hidden shadow-[0_12px_45px_rgba(74,30,127,0.08)] border-[6px] border-white z-10 bg-slate-50 cursor-pointer"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80"
                                    alt="Student learning"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>
                        </motion.div>

                    </div>
                </section>

                {/* SECTION 2: COURSE CONTENT (Lower layout section with title, accordion, video & resources) */}
                <section className="relative w-full bg-white py-16 md:py-20 lg:py-24 border-b border-slate-150 border-slate-100">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 space-y-12">
                        <div className="space-y-3 border-b border-slate-200 pb-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Detailed Curriculum</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 tracking-tight leading-tight">
                                Explore the <span className="text-primary">Learning Modules</span>
                            </h2>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                                {course.modules?.length || 0} modules · {totalChapters} lessons outline
                            </p>
                        </div>

                        <div id="curriculum-grid-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative min-h-[650px]">

                            {/* Left Column: Accordion of Sections/Modules (40% width) */}
                            <div className="lg:col-span-5 space-y-4">
                                {course.modules && course.modules.length > 0 ? (
                                    [...course.modules]
                                        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                                        .map((mod: any, index: number) => {
                                            const isExpanded = expandedModuleId === mod.id;
                                            const completedChapters = mod.chapters?.length || 0;

                                            return (
                                                <motion.div
                                                    key={mod.id}
                                                    id={`module-accordion-${mod.id}`}
                                                    initial={{ opacity: 0, y: 15 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded
                                                        ? "bg-white border-primary/20 shadow-[0_8px_30px_rgba(74,30,127,0.03)]"
                                                        : "bg-white border-slate-200 hover:border-primary/10 shadow-[0_4px_16px_rgba(0,0,0,0.005)]"
                                                        }`}
                                                >
                                                    {/* Header Button */}
                                                    <button
                                                        onClick={() => toggleModule(mod.id)}
                                                        className={`w-full p-5 text-left flex items-start justify-between gap-4 select-none transition-colors ${isExpanded ? "bg-primary/[0.01]" : "hover:bg-slate-50/50"
                                                            }`}
                                                    >
                                                        <div className="space-y-1.5 flex-1 min-w-0">
                                                            <h3 className={`font-bold text-[15px] md:text-base leading-snug tracking-tight transition-colors ${isExpanded ? "text-primary" : "text-slate-800"
                                                                }`}>
                                                                {mod.title}
                                                            </h3>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                0/{completedChapters} Completed
                                                            </p>
                                                        </div>
                                                        <div className={`shrink-0 mt-1 transition-transform duration-300 ${isExpanded ? "text-primary rotate-180" : "text-slate-400"
                                                            }`}>
                                                            <ChevronDown size={18} />
                                                        </div>
                                                    </button>

                                                    {/* Collapsible Content - Hierarchical list flow */}
                                                    {isExpanded && (
                                                        <div className="px-6 pb-6 border-t border-slate-100 pt-5 space-y-4 bg-white animate-in fade-in slide-in-from-top-2 duration-300">
                                                            <div className="relative pl-4 space-y-4">
                                                                {/* Step connector vertical line removed */}

                                                                {mod.chapters && mod.chapters.length > 0 ? (
                                                                    mod.chapters
                                                                        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                                                                        .map((chapter: any, cidx: number) => (
                                                                            <div key={chapter.id} className="flex items-start gap-4.5 group relative">
                                                                                {/* Connector dot indicator */}
                                                                                <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200 bg-white mt-1 flex items-center justify-center shrink-0 z-10 transition-colors group-hover:border-primary">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-primary transition-colors" />
                                                                                </div>

                                                                                <div className="space-y-1 flex-1 min-w-0">
                                                                                    <div className="flex items-start justify-between gap-3">
                                                                                        <h4 className="text-[13px] font-bold text-slate-700 leading-snug group-hover:text-primary transition-colors font-sans">
                                                                                            {cidx + 1}. {chapter.title}
                                                                                        </h4>
                                                                                        {chapter.timeDuration && (
                                                                                            <span className="shrink-0 text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100/60 px-2 py-0.5 rounded-md leading-none">
                                                                                                {chapter.timeDuration}m
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    {chapter.description && (
                                                                                        <p className="text-[10.5px] text-slate-400 font-semibold line-clamp-1 leading-normal">
                                                                                            {chapter.description}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                ) : (
                                                                    <p className="text-xs font-bold text-slate-400 italic pl-1">No chapters available.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })
                                ) : (
                                    <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-[0_4px_16px_rgba(0,0,0,0.005)]">
                                        <BookOpen size={24} className="mx-auto mb-2 text-slate-200" />
                                        <p className="text-xs font-semibold text-slate-400">Chapters outline details coming soon.</p>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: VIDEO PREVIEW DECK & ACTIVE MODULE DETAILS */}
                            <div className="lg:col-span-7 relative self-start w-full">
                                <motion.div
                                    id="preview-card"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    style={isDesktop ? { transform: `translateY(${previewOffset}px)` } : undefined}
                                    className="bg-white border border-slate-200 rounded-[36px] p-6 md:p-8.5 space-y-6.5 shadow-[0_12px_40px_rgba(74,30,127,0.015)] transition-transform duration-500 ease-out"
                                >

                                    {/* Media Card with big Play overlay button */}
                                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video group shadow-md border border-slate-100/40">
                                        <img
                                            src={activeImageUrl}
                                            alt={activeTitle}
                                            className="w-full h-full object-cover opacity-85 group-hover:opacity-80 transition-all duration-500 ease-out"
                                        />

                                        {/* Dark gradient shadow */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                                        {/* Big play button centered */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <button
                                                onClick={handlePurchase}
                                                className="w-20 h-20 rounded-full bg-white/95 hover:bg-white shadow-[0_12px_36px_rgba(0,0,0,0.25)] flex items-center justify-center text-slate-900 transform scale-95 group-hover:scale-100 hover:scale-100 transition-all duration-300 ease-out z-10"
                                            >
                                                <Play size={28} className="fill-slate-900 text-slate-900 translate-x-[2px]" />
                                            </button>
                                        </div>

                                        {/* Decorative timeline tracker bottom dot */}
                                        <div className="absolute bottom-4 left-4 w-2.5 h-2.5 rounded-full bg-slate-900/60 backdrop-blur-xs ring-4 ring-white/10" />
                                    </div>

                                    {/* Dynamic Content Details Header and Descriptions */}
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">
                                                {activeModule ? `Section Details` : `Course Overview`}
                                            </span>
                                            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight leading-snug">
                                                {activeTitle}
                                            </h3>
                                        </div>

                                        <div className="space-y-4 font-semibold text-[13px] text-slate-500 leading-relaxed">
                                            <p className="whitespace-pre-wrap">
                                                {activeDesc}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions Footer: Resources Button */}
                                    <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
                                        <button
                                            onClick={handlePurchase}
                                            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-[12px] px-6 py-3 rounded-xl border border-slate-200 shadow-xs active:scale-95 hover:border-slate-300 transition-all"
                                        >
                                            <Paperclip size={14} className="text-slate-400" />
                                            <span>Resources</span>
                                        </button>

                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
                                            Included in curriculum enrollment
                                        </span>
                                    </div>

                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section >

                {/* SECTION 3: COURSE INSTRUCTORS */}
                <section className="relative w-full bg-slate-50/30 py-16 md:py-20 lg:py-24 border-b border-slate-100 overflow-hidden">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 space-y-12">
                        {(() => {
                            const instructor = course?.instructor || {
                                name: "Dr. Isha Kapoor",
                                designation: "Gynaecologist & Adolescent Health Expert",
                                experience: "12+ Years",
                                bio: "Dr. Isha Kapoor is a certified gynaecologist and family wellness speaker at Infano. She has conducted dozens of webinars, workshops, and school adolescent awareness drives. Passionate about empowering individuals with evidence-based health guidance and menstrual wellness education.",
                                avatarUrl: "/assets/images/speakers/isha.png",
                                rating: 4.9,
                                reviewsCount: 22,
                                hours: "120 Hours Total Content",
                                stats: {
                                    mentored: "45+ Persons Mentored",
                                    workshops: "10+ Workshops Attended",
                                    certificates: "8+ Coaching Certificates"
                                }
                            };

                            return (
                                <div className="space-y-12">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-3">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full">
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Expert-Led Education</span>
                                            </div>
                                            <div className="relative pb-2">
                                                <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 tracking-tight leading-tight">
                                                    Meet Your <span className="text-primary">Instructors</span>
                                                </h2>
                                                {/* Underline decoration SVG */}
                                                <svg className="absolute left-0 bottom-[-2px] w-[130px] h-[6px] text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                                    <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Right side decorative paper airplane */}
                                        <div className="hidden md:flex items-center gap-2 text-slate-350 pr-4">
                                            <svg className="w-24 h-8 text-slate-200" viewBox="0 0 100 30" fill="none">
                                                <path d="M0,25 Q30,5 75,20 C85,25 90,10 95,5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
                                            </svg>
                                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-primary transform -rotate-12 border border-purple-100 shadow-[2px_4px_12px_rgba(74,30,127,0.08)]">
                                                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Instructor Card Content */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6 }}
                                        className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_12px_40px_rgba(74,30,127,0.015)]"
                                    >
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                                            {/* Left Side: Instructor Profile Image Container */}
                                            <div className="lg:col-span-4 flex justify-center relative">
                                                {/* Organic shape popping out on left */}
                                                <div className="absolute left-[5%] top-[15%] w-[100px] h-[100px] bg-primary/10 rounded-[30%_70%_70%_30%_/_50%_60%_30%_60%] blur-sm -z-10" />

                                                {/* Dot grid decoration bottom-left */}
                                                <div className="absolute left-[-10px] bottom-[-15px] w-12 h-16 opacity-30 z-0 select-none pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, #4a1e7f 1.5px, transparent 0)', backgroundSize: '8px 8px' }} />

                                                {/* Offset double layer avatar card */}
                                                <div className="relative z-10 w-[240px] h-[250px]">
                                                    <div className="absolute inset-0 bg-[#F4E8FF] rounded-[28px] transform translate-x-2 translate-y-2 -z-10 border border-purple-100/50" />
                                                    <div className="w-full h-full rounded-[28px] overflow-hidden bg-slate-50 border-[3px] border-white shadow-[0_8px_30px_rgba(74,30,127,0.06)]">
                                                        <img
                                                            src={instructor.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop"}
                                                            alt={instructor.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop";
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Hands-Heart Badge icon bottom-right */}
                                                    <div className="absolute bottom-2 right-2 w-11 h-11 bg-gradient-to-br from-[#8b5cf6] to-primary rounded-full border-[3px] border-white flex items-center justify-center text-white shadow-md z-20">
                                                        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Side: Instructor Details */}
                                            <div className="lg:col-span-8 space-y-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-primary shrink-0 shadow-xs">
                                                            <svg className="w-4.5 h-4.5 fill-primary text-primary" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 15l-3.5 2.18.92-3.95-3.05-2.65 4.04-.35L12 8.5l1.59 3.73 4.04.35-3.05 2.65.92 3.95L12 16z" />
                                                            </svg>
                                                        </div>
                                                        <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-none font-heading">
                                                            {instructor.name}
                                                        </h3>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest pt-1">
                                                        {instructor.designation}
                                                    </p>

                                                    {/* Rating and Hours Metadata Row */}
                                                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                                                        <div className="flex items-center gap-2.5 bg-amber-50/50 border border-amber-100/50 rounded-2xl px-4 py-2 hover:shadow-xs transition-shadow">
                                                            <Clock size={16} className="text-amber-500" />
                                                            <div className="text-left">
                                                                <span className="block text-xs font-bold text-slate-700 leading-none">{instructor.hours || `${instructor.experience} Exp`}</span>
                                                                <span className="block text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-wider leading-none">Total Content</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2.5 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl px-4 py-2 hover:shadow-xs transition-shadow">
                                                            <Star size={16} className="text-emerald-500 fill-emerald-500" />
                                                            <div className="text-left">
                                                                <span className="block text-xs font-bold text-slate-700 leading-none">{instructor.rating || "4.9"} ({instructor.reviewsCount || 22} reviews)</span>
                                                                <span className="block text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-wider leading-none">Learner Rating</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Bio Summary */}
                                                    <p className="text-sm font-normal text-slate-500 leading-relaxed max-w-2xl pt-2">
                                                        {instructor.bio}
                                                    </p>
                                                </div>

                                                <div className="h-[1px] bg-slate-100 w-full my-6" />

                                                {/* Lower Stats Grid Row */}
                                                <div className="bg-[#FAF8FE] border border-purple-100/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch justify-around gap-4 sm:gap-0 mt-6 shadow-[0_4px_16px_rgba(74,30,127,0.01)]">
                                                    <div className="flex items-center gap-3.5 flex-1 justify-center sm:justify-start">
                                                        <div className="w-10 h-10 rounded-full bg-purple-100/70 text-primary flex items-center justify-center shrink-0">
                                                            <Users size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="text-lg font-bold text-slate-800 leading-none font-heading">
                                                                {instructor.stats?.mentored?.split(" ")[0] || "45+"}
                                                            </div>
                                                            <div className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">
                                                                {instructor.stats?.mentored?.split(" ").slice(1).join(" ") || "Persons Mentored"}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="hidden sm:block w-[1px] bg-purple-100/60" />

                                                    <div className="flex items-center gap-3.5 flex-1 justify-center">
                                                        <div className="w-10 h-10 rounded-full bg-purple-100/70 text-primary flex items-center justify-center shrink-0">
                                                            <Briefcase size={15} />
                                                        </div>
                                                        <div>
                                                            <div className="text-lg font-bold text-slate-800 leading-none font-heading">
                                                                {instructor.stats?.workshops?.split(" ")[0] || "10+"}
                                                            </div>
                                                            <div className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">
                                                                {instructor.stats?.workshops?.split(" ").slice(1).join(" ") || "Workshops Attended"}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="hidden sm:block w-[1px] bg-purple-100/60" />

                                                    <div className="flex items-center gap-3.5 flex-1 justify-center sm:justify-end">
                                                        <div className="w-10 h-10 rounded-full bg-purple-100/70 text-primary flex items-center justify-center shrink-0">
                                                            <Trophy size={15} />
                                                        </div>
                                                        <div>
                                                            <div className="text-lg font-bold text-slate-800 leading-none font-heading">
                                                                {instructor.stats?.certificates?.split(" ")[0] || "8+"}
                                                            </div>
                                                            <div className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">
                                                                {instructor.stats?.certificates?.split(" ").slice(1).join(" ") || "Coaching Certificates"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>

                                        </div>
                                    </motion.div>
                                </div>
                            );
                        })()}
                    </div>
                </section >

                {/* BOTTOM CTA SIGNUP BANNER */}
                <section className="relative w-full bg-white py-16 lg:py-24 overflow-hidden">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-gradient-to-br from-primary to-primary-dark rounded-[3rem] p-8 sm:p-16 text-center text-white relative overflow-hidden shadow-xl shadow-primary/10"
                        >
                            {/* Background design styling */}
                            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[150%] bg-white/5 rounded-full blur-[50px] pointer-events-none" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[100%] bg-pink-500/10 rounded-full blur-[40px] pointer-events-none" />

                            <div className="relative z-10 max-w-xl mx-auto space-y-6">
                                <span className="text-[10px] font-black text-pink-300 uppercase tracking-[0.25em] leading-none">lifetime access</span>
                                <h2 className="text-3xl sm:text-4xl font-bold font-heading leading-tight tracking-tight">
                                    Unlock Wellness &<br />Build Lifelong Resilience
                                </h2>
                                <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed font-semibold">
                                    Join thousands of mothers and daughters who are transforming their hormonal transition steps with expert, doctor-led learning modules.
                                </p>

                                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                                    {isEnrolled ? (
                                        <button
                                            onClick={() => router.push(`/dashboard/courses/${course.id}/overview`)}
                                            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-primary font-bold text-sm rounded-full shadow-lg active:scale-95 transition-all text-center"
                                        >
                                            Go to Your Course Modules
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handlePurchase}
                                            disabled={isPurchasing}
                                            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-primary font-bold text-sm rounded-full shadow-lg active:scale-95 transition-all text-center"
                                        >
                                            {course.isFree ? "Enroll for Free now" : `Get Access for ₹${course.price}`}
                                        </button>
                                    )}
                                    <Link
                                        href="/course"
                                        className="w-full sm:w-auto px-6 py-3.5 border border-white/20 rounded-full hover:bg-white/10 text-white font-semibold text-sm transition-all text-center"
                                    >
                                        Explore Other Tracks
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section >

                {/* GUEST ENROLLMENT MODAL */}
                <AnimatePresence>
                    {isEnrollModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="bg-white rounded-[32px] border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden relative"
                            >
                                {/* Header */}
                                <div className="p-6 md:p-8 bg-gradient-to-r from-primary/5 to-purple-500/5 border-b border-slate-50 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-850 font-heading">Course Enrollment</h3>
                                        <p className="text-xs text-slate-400 font-semibold mt-1">Provide details to unlock your learning track.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsEnrollModalOpen(false)}
                                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handlePublicEnrollSubmit} className="p-6 md:p-8 space-y-4">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Ananya Sharma"
                                            value={enrollForm.name}
                                            onChange={e => setEnrollForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-slate-800 text-sm font-semibold transition-all placeholder:text-slate-400"
                                        />
                                    </div>

                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Phone Number (with Country Code)</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="e.g. +919999999999"
                                            value={enrollForm.phone}
                                            onChange={e => setEnrollForm(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-slate-800 text-sm font-semibold transition-all placeholder:text-slate-400"
                                        />
                                    </div>

                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="e.g. ananya@domain.com"
                                            value={enrollForm.email}
                                            onChange={e => setEnrollForm(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-slate-800 text-sm font-semibold transition-all placeholder:text-slate-400"
                                        />
                                    </div>

                                    <div className="pt-4 space-y-3">
                                        <button
                                            type="submit"
                                            disabled={isEnrolling}
                                            className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/20 text-white rounded-2xl font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-75 flex items-center justify-center gap-2"
                                        >
                                            {isEnrolling ? (
                                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <PlayCircle size={16} />
                                                    <span>{course.isFree ? "Enroll for Free Now" : `Purchase & Enroll · ₹${course.price}`}</span>
                                                </>
                                            )}
                                        </button>
                                        <p className="text-[10px] font-semibold text-center text-slate-400 leading-snug">
                                            🔒 Safe payment processing · Instant onboarding access will be prepared
                                        </p>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
