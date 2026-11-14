'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen, Calendar, ShieldCheck, Star, Sparkles,
  ChevronRight, Play, Loader2, Award, Layers, Compass, X, Check, ArrowRight, User, Users, Bookmark, Heart, GraduationCap,
  Package, ShoppingBag, Truck, Video, Clock, DollarSign, Settings
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { ProgramsService, Program } from '@/services/programs.service';
import { toast } from 'react-hot-toast';
import { DashboardSummary } from "@/features/parent/components/DashboardSummary";
import { ResourceCard } from '@/features/parent/components/ResourceCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useParentOrdersSummary } from '@/hooks/use-parent-space-data';
import {
  dashboardOverviewQueryKey,
  useDashboardOverview,
} from '@/hooks/use-dashboard-data';
import Script from 'next/script';
import { isAnalyticsEnabled } from '@/components/common/Analytics';
import { getCurrencySymbol } from '@/lib/utils';
import { HerBloomGarden } from '@/features/daughter/HerBloomGarden';
import { WelcomeNoPurchaseSpace } from '@/components/course/WelcomeNoPurchaseSpace';

// Same STYLES_MAP as ParentsPrograms.tsx for exact match
const STYLES_MAP: Record<string, any> = {
  'SPARK': {
    bg: 'bg-[#FFF0F2]', border: 'border-rose-200/80 hover:border-rose-300', text: 'text-rose-600',
    glow: 'rgba(244,63,94,0.15)', badge: 'bg-rose-50 border-rose-200 text-rose-700',
    btnBg: 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/20 hover:shadow-rose-500/35',
    bulletBg: 'bg-rose-100/80 text-rose-600', metaBg: 'bg-white/90 border-rose-100', pricingBg: 'bg-white border-rose-100'
  },
  'RISE': {
    bg: 'bg-[#F5F2FF]', border: 'border-violet-200/80 hover:border-violet-300', text: 'text-violet-600',
    glow: 'rgba(124,58,237,0.15)', badge: 'bg-violet-50 border-violet-200 text-violet-700',
    btnBg: 'bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 shadow-violet-500/20 hover:shadow-violet-500/35',
    bulletBg: 'bg-violet-100/80 text-violet-600', metaBg: 'bg-white/90 border-violet-100', pricingBg: 'bg-white border-violet-100'
  },
  'BLOOM': {
    bg: 'bg-[#ECFDF5]', border: 'border-emerald-200/80 hover:border-emerald-300', text: 'text-emerald-600',
    glow: 'rgba(5,150,105,0.15)', badge: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    btnBg: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/20 hover:shadow-emerald-500/35',
    bulletBg: 'bg-emerald-100/80 text-emerald-600', metaBg: 'bg-white/90 border-emerald-100', pricingBg: 'bg-white border-emerald-100'
  },
  'IGNITE': {
    bg: 'bg-[#FDF2FF]', border: 'border-fuchsia-200/80 hover:border-fuchsia-300', text: 'text-fuchsia-600',
    glow: 'rgba(192,38,211,0.15)', badge: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700',
    btnBg: 'bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 hover:from-fuchsia-600 hover:to-fuchsia-700 shadow-fuchsia-500/20 hover:shadow-fuchsia-500/35',
    bulletBg: 'bg-fuchsia-100/80 text-fuchsia-600', metaBg: 'bg-white/90 border-fuchsia-100', pricingBg: 'bg-white border-fuchsia-100'
  },
  'UNSTOPPABLE': {
    bg: 'bg-[#FFFDF0]', border: 'border-amber-200/80 hover:border-amber-300', text: 'text-amber-600',
    glow: 'rgba(217,119,6,0.15)', badge: 'bg-amber-50 border-amber-200 text-amber-700',
    btnBg: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/20 hover:shadow-amber-500/35',
    bulletBg: 'bg-amber-100/80 text-amber-600', metaBg: 'bg-white/90 border-amber-100', pricingBg: 'bg-white border-amber-100'
  },
};

const DEFAULT_STYLE = {
  bg: 'bg-slate-50', border: 'border-slate-200 hover:border-slate-300', text: 'text-slate-700',
  glow: 'rgba(71,85,105,0.06)', badge: 'bg-slate-100 border-slate-200 text-slate-700',
  btnBg: 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/10 hover:shadow-slate-900/25',
  bulletBg: 'bg-slate-200/80 text-slate-700', metaBg: 'bg-white border-slate-100', pricingBg: 'bg-white border-slate-100'
};

const ENROLLED_THEMES: Record<string, { accent: string; gradient: string; border: string; badge: string; }> = {
  'SPARK': { accent: 'text-rose-600', gradient: 'from-rose-500 to-pink-600', border: 'border-rose-100', badge: 'bg-rose-50 border-rose-100 text-rose-700' },
  'RISE': { accent: 'text-violet-600', gradient: 'from-violet-500 to-indigo-600', border: 'border-violet-100', badge: 'bg-violet-50 border-violet-100 text-violet-700' },
  'BLOOM': { accent: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-600', border: 'border-emerald-100', badge: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
  'IGNITE': { accent: 'text-fuchsia-600', gradient: 'from-fuchsia-500 to-pink-600', border: 'border-fuchsia-100', badge: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-700' },
  'UNSTOPPABLE': { accent: 'text-amber-600', gradient: 'from-amber-500 to-orange-600', border: 'border-amber-100', badge: 'bg-amber-50 border-amber-100 text-amber-700' },
};
const DEFAULT_ENROLLED_THEME = { accent: 'text-primary', gradient: 'from-primary to-accent', border: 'border-primary/20', badge: 'bg-primary/10 border-primary/20 text-primary' };

const looksLikeBookItem = (item: any) => {
  if (!item) return false;
  if (item.book || item.productType === 'BOOK' || item.type === 'BOOK' || item.category === 'BOOK') return true;
  const name = String(item.productName || item.name || item.book?.title || item.book?.name || '').toLowerCase();
  return name.includes('book') || name.includes('workbook') || name.includes('gigi');
};

const isCourseActive = (entry: any) => {
  const status = String(entry?.status || '').toUpperCase();
  return status === 'ACTIVE' || status === 'ENROLLED' || status === 'PAID';
};

const getProgramStyles = (program: any, index: number) => {
  const titleUpper = (program?.title || '').toUpperCase();
  const metaTheme = program?.metadata?.themeColor || program?.themeColor || program?.metadata?.theme;
  if (metaTheme && typeof metaTheme === 'string') {
    const key = metaTheme.toUpperCase();
    if (STYLES_MAP[key]) return STYLES_MAP[key];
  }
  if (titleUpper.includes('SPARK')) return STYLES_MAP['SPARK'];
  if (titleUpper.includes('RISE')) return STYLES_MAP['RISE'];
  if (titleUpper.includes('BLOOM')) return STYLES_MAP['BLOOM'];
  if (titleUpper.includes('IGNITE')) return STYLES_MAP['IGNITE'];
  if (titleUpper.includes('UNSTOPPABLE')) return STYLES_MAP['UNSTOPPABLE'];

  const themeKeys = Object.keys(STYLES_MAP);
  return STYLES_MAP[themeKeys[index % themeKeys.length]] || DEFAULT_STYLE;
};

const getEnrolledTheme = (title: string = '') => {
  const tUpper = title.toUpperCase();
  if (tUpper.includes('SPARK')) return ENROLLED_THEMES['SPARK'];
  if (tUpper.includes('RISE')) return ENROLLED_THEMES['RISE'];
  if (tUpper.includes('BLOOM')) return ENROLLED_THEMES['BLOOM'];
  if (tUpper.includes('IGNITE')) return ENROLLED_THEMES['IGNITE'];
  if (tUpper.includes('UNSTOPPABLE')) return ENROLLED_THEMES['UNSTOPPABLE'];
  return DEFAULT_ENROLLED_THEME;
};


export default function CustomerDashboardOverview() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const { user, activeProfile, learners } = useAuthStore();
  const isTeen = user?.role === 'TEEN' || (user?.role === 'PEER' && user?.contentTier && user?.contentTier !== 'ADULT');
  const dashboardQuery = useDashboardOverview(user?.id, user?.role, Boolean(isTeen));
  const shouldLoadOrdersSummary = user?.role !== 'EXPERT' && user?.role !== 'ADMIN';
  const {
    data: ordersSummary = null,
    isPending: ordersSummaryLoading,
  } = useParentOrdersSummary(user?.id, shouldLoadOrdersSummary);
  const dashboardData = dashboardQuery.data;
  const enrollments = dashboardData?.enrollments || [];
  const allPrograms = dashboardData?.programs || [];
  const isLinked = dashboardData?.isLinked || false;
  const parentBookmarks = dashboardData?.parentBookmarks || [];
  const demoSessions = dashboardData?.demoSessions || [];
  const orders = dashboardData?.orders || [];
  const peerStats = dashboardData?.peerStats || null;
  const expertSessions = dashboardData?.expertSessions || [];
  const enrollmentChecked =
    !dashboardQuery.isPending &&
    (!shouldLoadOrdersSummary || !ordersSummaryLoading);
  const loading = !enrollmentChecked;

  const hasCourseEnrollment = Boolean(
    (ordersSummary?.courseEnrollments || []).some(isCourseActive) ||
    (enrollments || []).some(isCourseActive)
  );
  const bookOrders = [...(ordersSummary?.orders || []), ...orders].filter((order: any) =>
    order?.isActive !== false &&
    order?.orderStatus !== 'CANCELLED' &&
    order?.paymentStatus !== 'FAILED' &&
    Array.isArray(order?.items) &&
    order.items.some((item: any) => looksLikeBookItem(item))
  );
  const hasBookOrder = bookOrders.length > 0;
  const bookReaderPriceAvailable = bookOrders.some((order: any) =>
    order.paymentStatus === 'COMPLETED' || order.paymentMethod === 'COD'
  );

  useEffect(() => {
    if (mounted && user && enrollmentChecked && hasCourseEnrollment) {
      if (activeProfile?.type === 'PARENT') {
        router.push('/dashboard/parent');
      }
    }
  }, [mounted, user, enrollmentChecked, hasCourseEnrollment, activeProfile, router]);

  // Demo booking modal state
  const [demoModalProg, setDemoModalProg] = useState<Program | null>(null);
  const [demoName, setDemoName] = useState(user?.profile?.displayName || user?.username || '');
  const [demoEmail, setDemoEmail] = useState(user?.email || '');
  const [demoPhone, setDemoPhone] = useState(user?.phone || '');
  const [demoSlotDate, setDemoSlotDate] = useState('');
  const [demoSlotTime, setDemoSlotTime] = useState('');
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setDemoName(user.profile?.displayName || user.username || '');
      setDemoEmail(user.email || '');
      setDemoPhone(user.phone || '');
    }
  }, [user]);

  const handleBookDemoClick = (program: Program) => {
    setDemoModalProg(program);
    setDemoName(user?.profile?.displayName || user?.username || '');
    setDemoEmail(user?.email || '');
    setDemoPhone(user?.phone || '');
    setDemoSlotDate('');
    setDemoSlotTime('');
    setDemoSuccess(false);
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoModalProg) return;
    if (!demoName.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    if (!demoPhone.trim()) {
      toast.error('Please enter your phone number.');
      return;
    }
    if (!demoSlotDate) {
      toast.error('Please select a date for your demo.');
      return;
    }
    const parts = demoSlotDate.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts.map(Number);
      const selected = new Date(y, m - 1, d);
      selected.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxD = new Date(today);
      maxD.setDate(today.getDate() + 7);
      maxD.setHours(23, 59, 59, 999);

      if (selected < today) {
        toast.error('Cannot select a past date for demo booking.');
        return;
      }
      if (selected > maxD) {
        toast.error('Demo sessions can only be booked up to 7 days in advance.');
        return;
      }
    }
    if (!demoSlotTime) {
      toast.error('Please select a time slot.');
      return;
    }

    setDemoSubmitting(true);
    try {
      const bookingData = {
        parentName: demoName,
        phone: demoPhone,
        email: demoEmail || null,
        classRange: "General",
        confidence: "",
        interests: [],
        hasMentor: "",
        challenges: [],
        learningPref: "1:1 Private Mentoring",
        parentInvolvement: "",
        suggestedPrograms: [demoModalProg.title],
        slotDate: demoSlotDate,
        slotTime: demoSlotTime
      };

      const result = await ProgramsService.bookDemoSession(bookingData);
      if (result.success) {
        const razorpayInfo = result.razorpay;

        if (typeof (window as any).Razorpay !== 'undefined' && razorpayInfo?.orderId && !razorpayInfo.orderId.startsWith('demo_mock_')) {
          const options = {
            key: razorpayInfo.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: (razorpayInfo.amount || 9) * 100,
            currency: razorpayInfo.currency || 'INR',
            name: 'Infano Care',
            description: `Demo Session Booking: ${demoModalProg.title}`,
            order_id: razorpayInfo.orderId,
            handler: async function (response: any) {
              try {
                setDemoSubmitting(true);
                await ProgramsService.verifyDemoPayment({
                  razorpayOrderId: response.razorpay_order_id || razorpayInfo.orderId,
                  razorpayPaymentId: response.razorpay_payment_id || '',
                  razorpaySignature: response.razorpay_signature || ''
                });

                // Fire DataLayer Purchase Event
                if (typeof window !== 'undefined') {
                  const windowObj = window as any;
                  windowObj.dataLayer = windowObj.dataLayer || [];
                  windowObj.dataLayer.push({ ecommerce: null });
                  const purchaseData = {
                    event: 'purchase',
                    value: 9,
                    currency: 'INR',
                    transaction_id: response.razorpay_payment_id || `demo_txn_${Date.now()}`,
                    content_ids: [`demo_${demoModalProg.id || 'program'}`],
                    content_name: `${demoModalProg.title} - Demo Session`,
                    content_type: 'product',
                    ecommerce: {
                      transaction_id: response.razorpay_payment_id || `demo_txn_${Date.now()}`,
                      currency: 'INR',
                      value: 9,
                      items: [{
                        item_id: `demo_${demoModalProg.id || 'program'}`,
                        item_name: `${demoModalProg.title} - Demo Session`,
                        item_category: 'Demo Session',
                        price: 9,
                        quantity: 1
                      }]
                    }
                  };

                  if (isAnalyticsEnabled()) {
                    windowObj.dataLayer.push(purchaseData);
                  } else {
                    console.log("Analytics disabled. Simulated dataLayer push for 'purchase' (Demo Session):", purchaseData);
                  }
                }

                setDemoSuccess(true);
                toast.success('Demo session booked successfully! (Paid ₹9)');
                void queryClient.invalidateQueries({
                  queryKey: dashboardOverviewQueryKey(user?.id),
                });
              } catch (err: any) {
                toast.error(err.message || 'Payment verification failed. Please contact support.');
              } finally {
                setDemoSubmitting(false);
              }
            },
            prefill: {
              name: demoName,
              email: demoEmail || undefined,
              contact: demoPhone
            },
            modal: {
              ondismiss: () => {
                setDemoSubmitting(false);
                toast('Payment cancelled. You can complete your booking when ready.');
              }
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (resp: any) {
            toast.error(resp.error?.description || 'Payment failed. Please try again.');
            setDemoSubmitting(false);
          });
          rzp.open();
        } else {
          // Fallback / mock mode
          if (razorpayInfo?.orderId) {
            await ProgramsService.verifyDemoPayment({
              razorpayOrderId: razorpayInfo.orderId,
              razorpayPaymentId: 'pay_mock_' + Date.now(),
              razorpaySignature: 'mock_signature'
            });
          }

          if (typeof window !== 'undefined') {
            const windowObj = window as any;
            windowObj.dataLayer = windowObj.dataLayer || [];
            windowObj.dataLayer.push({ ecommerce: null });
            const purchaseData = {
              event: 'purchase',
              value: 9,
              currency: 'INR',
              transaction_id: `demo_mock_${Date.now()}`,
              content_ids: [`demo_${demoModalProg.id || 'program'}`],
              content_name: `${demoModalProg.title} - Demo Session`,
              content_type: 'product',
              ecommerce: {
                transaction_id: `demo_mock_${Date.now()}`,
                currency: 'INR',
                value: 9,
                items: [{
                  item_id: `demo_${demoModalProg.id || 'program'}`,
                  item_name: `${demoModalProg.title} - Demo Session`,
                  item_category: 'Demo Session',
                  price: 9,
                  quantity: 1
                }]
              }
            };
            if (isAnalyticsEnabled()) {
              windowObj.dataLayer.push(purchaseData);
            } else {
              console.log("Analytics disabled. Simulated dataLayer push for 'purchase' (Demo Session):", purchaseData);
            }
          }

          setDemoSuccess(true);
          toast.success('Demo session booked successfully!');
          void queryClient.invalidateQueries({
            queryKey: dashboardOverviewQueryKey(user?.id),
          });
          setDemoSubmitting(false);
        }
      } else {
        throw new Error('Booking failed');
      }

    } catch (err: any) {
      toast.error(err.message || 'Failed to book demo session.');
      setDemoSubmitting(false);
    }
  };

  // Render the correct shell for each real ownership state instead of assuming a single "enrolled" dashboard.
  const hasLearners = Boolean((user?.learners && user.learners.length > 0) || (learners && learners.length > 0));
  if (
    mounted &&
    user &&
    user.role !== 'EXPERT' &&
    user.role !== 'ADMIN' &&
    (user.role !== 'PEER' || activeProfile?.type === 'DAUGHTER' || activeProfile?.type === 'PARENT' || hasLearners)
  ) {
    if (!enrollmentChecked) {
      return (
        <div className="min-h-screen bg-[#FBF8F6] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#C2456A]" size={32} />
        </div>
      );
    }

    if (hasCourseEnrollment) {
      if (activeProfile?.type === 'PARENT') {
        return (
          <div className="min-h-screen bg-[#FBF8F6] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#C2456A]" size={32} />
          </div>
        );
      }
      return <HerBloomGarden />;
    }

    if (activeProfile?.type === 'DAUGHTER') {
      return (
        <div className="min-h-screen bg-[#FBF8F6] px-5 py-10 text-[#3D2C4A]">
          <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center text-center">
            <div className="w-full rounded-[28px] border border-[#B7D8EF] bg-gradient-to-br from-[#D8ECF8] to-[#B7D8EF] p-7 shadow-sm sm:p-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#2F6494]">
                <Sparkles size={14} />
                Your free preview
              </span>
              <h1 className="mt-4 font-['Baloo_2',sans-serif] text-3xl font-bold sm:text-4xl">
                Welcome, {activeProfile.learner.name}!
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-base text-[#3E4F63] sm:text-lg">
                Your first lesson is ready. Let’s learn about the menstrual cycle with Gigi.
              </p>
              <Link
                href="/dashboard/courses/lesson/l1-1"
                className="mt-7 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#C2456A] px-6 font-bold text-white shadow-md transition-colors hover:bg-[#A8365A]"
              >
                <Play size={16} fill="currentColor" />
                Start Lesson 1.1
                <ArrowRight size={16} />
              </Link>
              <div className="mt-5">
                <Link
                  href="/dashboard/picker"
                  className="text-sm font-bold text-[#3D2C4A] underline decoration-[#8A7896] underline-offset-4 hover:text-[#A8365A]"
                >
                  Switch profile
                </Link>
              </div>
            </div>
          </main>
        </div>
      );
    }

    return (
      <WelcomeNoPurchaseSpace
        user={user}
        learners={learners}
        ordersSummary={ordersSummary}
        ownsBook={hasBookOrder}
        bookReaderPriceAvailable={bookReaderPriceAvailable}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-primary">
        <Loader2 className="animate-spin text-primary" size={44} />
        <span className="font-extrabold text-lg text-slate-600 tracking-wide">Assembling Workspace...</span>
      </div>
    );
  }

  const enrolledProgramIds = (enrollments || []).map(e => e.programId);
  const availablePrograms = (allPrograms || []).filter(p => p && !enrolledProgramIds.includes(p.id));
  const showSidebar = isTeen && parentBookmarks.length > 0;

  const isProgramItem = (it: any) => {
    const book = it?.book || {};
    const bookId = (it?.bookId || '').toLowerCase();
    const bookTitle = (book.title || it?.bookTitle || '').toLowerCase();
    if ((book as any).curriculum?.length || book.duration) return true;
    if (bookId.includes('program') || bookId.includes('private') || bookId.includes('group') || bookId.includes('cohort')) return true;
    if (bookTitle.includes('program') || bookTitle.includes('mentoring') || bookTitle.includes('cohort')) return true;
    return false;
  };
  const productOrders = (orders || []).filter((o: any) => (o?.items || []).some((it: any) => !isProgramItem(it)));


  if (user?.role === 'EXPERT') {
    const totalSessions = expertSessions.length;
    const upcomingSessionsList = expertSessions
      .filter(s => s.status === 'SCHEDULED' || s.status === 'RESCHEDULED')
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    const upcomingCount = upcomingSessionsList.length;
    const completedCount = expertSessions.filter(s => s.status === 'COMPLETED').length;
    const consultationPrice = user?.profile?.consultationPrice || 500;
    const totalEarnings = completedCount * consultationPrice;

    const formatDate = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    const formatTime = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      } catch {
        return '';
      }
    };

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto pb-8 font-sans">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden bg-linear-to-br from-indigo-900 to-indigo-950 text-white rounded-[2rem] p-8 md:p-10 shadow-lg border border-indigo-950">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[30%] h-[80%] bg-violet-500/10 rounded-full blur-[60px] pointer-events-none" />
          
          <div className="relative z-10 space-y-4 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase">
              <Sparkles size={12} className="animate-pulse" /> Expert Workspace
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Hello, <span className="text-indigo-200">{user?.profile?.displayName || user?.username || 'Consultant'}</span>!
            </h1>
            <p className="text-indigo-100 text-sm font-semibold leading-relaxed">
              Your professional panel is ready. Here you can view your scheduled 1:1 sessions, track your earnings, and set your calendar availability for bookings.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link 
                href="/dashboard/program-sessions" 
                className="px-5 py-3 bg-white text-indigo-900 hover:bg-slate-50 transition-all font-bold text-xs rounded-xl shadow-md active:scale-95 flex items-center gap-2"
              >
                <Layers size={15} /> Program Sessions
              </Link>
              <Link 
                href="/dashboard/expert-consultations" 
                className="px-5 py-3 bg-indigo-600 text-white border border-indigo-500/40 hover:bg-indigo-700 transition-all font-bold text-xs rounded-xl shadow-md active:scale-95 flex items-center gap-2"
              >
                <Users size={15} /> 1:1 Consultations
              </Link>
              <Link 
                href="/dashboard/calendar" 
                className="px-5 py-3 bg-indigo-950/80 text-indigo-200 border border-indigo-700/60 hover:bg-indigo-900 transition-all font-bold text-xs rounded-xl shadow-md active:scale-95 flex items-center gap-2"
              >
                <Calendar size={15} /> Slot Availability
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Bookings', value: totalSessions, desc: 'Overall client consultations', icon: Users, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
            { label: 'Upcoming Sessions', value: upcomingCount, desc: 'Scheduled & Active', icon: Calendar, color: 'text-amber-600 bg-amber-50 border-amber-100' },
            { label: 'Completed Sessions', value: completedCount, desc: 'Successfully delivered', icon: Check, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { label: 'Estimated Earnings', value: `₹${totalEarnings}`, desc: `₹${consultationPrice} per 1:1 session`, icon: DollarSign, color: 'text-rose-600 bg-rose-50 border-rose-100' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-xs flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${stat.color} group-hover:scale-105 transition-transform`}>
                  <Icon size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">{stat.label}</span>
                  <span className="text-xl md:text-2xl font-black text-slate-800 tracking-tight block mt-0.5">{stat.value}</span>
                  <span className="text-[10px] font-semibold text-slate-400 block mt-1">{stat.desc}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Consultations */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Upcoming Consultations</h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Your next scheduled video call sessions</p>
              </div>
              <span className="text-xs font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                {upcomingCount} Sessions
              </span>
            </div>

            {upcomingCount === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-2xs">
                <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Calendar size={22} className="text-slate-400" />
                </div>
                <h4 className="font-bold text-slate-700">No upcoming consultations</h4>
                <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto font-medium">
                  When clients book slots, they will appear here. Ensure your calendar slots are configured in calendar settings.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessionsList.slice(0, 5).map((session) => (
                  <div key={session.id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between relative overflow-hidden group">
                    <div className="flex gap-3.5 items-center">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0 border border-indigo-100">
                        {session.user?.profile?.displayName?.charAt(0).toUpperCase() || session.user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-900 transition-colors">
                          {session.user?.profile?.displayName || session.user?.username || 'Client'}
                        </h4>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-500 text-[11px] font-semibold">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-indigo-400" /> {formatDate(session.scheduledAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-indigo-400" /> {formatTime(session.scheduledAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 w-full md:w-auto">
                      {session.meetLink ? (
                        <a 
                          href={session.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 md:flex-none text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Video size={13} /> Join Call
                        </a>
                      ) : (
                        <span className="flex-1 md:flex-none text-center text-xs font-semibold text-slate-400 border border-slate-200 px-3 py-2 rounded-xl bg-slate-50">
                          No Link Yet
                        </span>
                      )}
                      <Link 
                        href={`/dashboard/expert-consultations?session=${session.id}`} 
                        className="flex-1 md:flex-none text-center px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl font-bold text-xs transition-colors"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
                
                {upcomingCount > 5 && (
                  <div className="text-center pt-2">
                    <Link href="/dashboard/expert-consultations" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
                      View All {upcomingCount} Scheduled Sessions <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Config Cards */}
          <div className="space-y-5">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
                <Settings size={16} className="text-indigo-500" /> Availability Setup
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Set up your working timezone, weekly schedule, slot intervals, and customize block dates when you are unavailable.
              </p>
              <Link 
                href="/dashboard/calendar" 
                className="w-full text-center block py-3.5 bg-slate-50 border border-slate-200/80 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all rounded-2xl text-xs font-bold"
              >
                Go to Availability Calendar
              </Link>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
                <User size={16} className="text-indigo-500" /> Consultation Profile
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Your specialisation, biography, profile avatar, and consultation charges are visible to potential parent and teen clients on the platform.
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-2 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-400">Speciality:</span>
                  <span className="text-slate-700 font-extrabold">{user?.profile?.specialisation || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Charges:</span>
                  <span className="text-slate-700 font-extrabold">₹{consultationPrice}</span>
                </div>
              </div>
              <Link 
                href="/dashboard/profile" 
                className="w-full text-center block py-3.5 bg-slate-50 border border-slate-200/80 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all rounded-2xl text-xs font-bold"
              >
                Update Profile Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto pb-8">

      {/* Demo Booking Modal */}
      {mounted && demoModalProg && createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDemoModalProg(null)} />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden z-10000 border border-slate-100 animate-in zoom-in-95">
            {(() => {
              const theme = ENROLLED_THEMES[demoModalProg.title?.toUpperCase()] || DEFAULT_ENROLLED_THEME;
              return (
                <>
                  <div className={`h-1.5 w-full bg-linear-to-r ${theme.gradient}`} />
                  <div className="p-6">
                    <button onClick={() => setDemoModalProg(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-655 hover:bg-slate-50 rounded-lg transition-all z-20">
                      <X size={16} />
                    </button>

                    {demoSuccess ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600 shadow-sm">
                          <Check size={24} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1.5">Demo Booked Successfully!</h3>
                        <p className="text-slate-505 text-xs leading-relaxed mb-5 font-medium">
                          Your demo session for <strong className={theme.accent}>{demoModalProg.title} Program</strong> is requested for <strong className="text-slate-800">{demoSlotDate}</strong> at <strong className="text-slate-800">{demoSlotTime}</strong>. A guide will call you at <strong className="text-slate-800">{demoPhone}</strong>.
                        </p>
                        <button
                          onClick={() => setDemoModalProg(null)}
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-855 text-white font-bold text-xs rounded-lg transition-all active:scale-95 animate-in fade-in"
                        >
                          Close Window
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${theme.badge}`}>Book Demo Session</span>
                          <h3 className={`text-xl font-bold mt-1.5 ${theme.accent}`}>{demoModalProg.title} Program</h3>
                          <p className="text-xs text-slate-505 font-medium mt-0.5">{demoModalProg.curriculum?.length || 8} Sessions • {demoModalProg.duration}</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-600 mb-4">
                          <span className="font-bold text-slate-700 block mb-0.5">Booking Profile Details:</span>
                          <span className="font-semibold text-slate-800">{demoName}</span> • <span className="font-medium">{demoPhone}</span>{demoEmail && <span className="font-medium"> • {demoEmail}</span>}
                        </div>

                        <form onSubmit={handleDemoSubmit} className="space-y-3.5">
                          <div className="grid grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date *</label>
                              <input
                                type="date"
                                required
                                min={(() => {
                                  const today = new Date();
                                  const yyyy = today.getFullYear();
                                  const mm = String(today.getMonth() + 1).padStart(2, '0');
                                  const dd = String(today.getDate()).padStart(2, '0');
                                  return `${yyyy}-${mm}-${dd}`;
                                })()}
                                max={(() => {
                                  const today = new Date();
                                  const maxD = new Date(today);
                                  maxD.setDate(today.getDate() + 7);
                                  const yyyy = maxD.getFullYear();
                                  const mm = String(maxD.getMonth() + 1).padStart(2, '0');
                                  const dd = String(maxD.getDate()).padStart(2, '0');
                                  return `${yyyy}-${mm}-${dd}`;
                                })()}
                                value={demoSlotDate}
                                onChange={e => {
                                  setDemoSlotDate(e.target.value);
                                  setDemoSlotTime('');
                                }}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time *</label>
                              <select
                                required
                                value={demoSlotTime}
                                onChange={e => setDemoSlotTime(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-205 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                              >
                                <option value="">Select Time</option>
                                {(() => {
                                  const allSlots = [
                                    "09:00 AM - 09:30 AM", "09:30 AM - 10:00 AM", "10:00 AM - 10:30 AM",
                                    "10:30 AM - 11:00 AM", "11:00 AM - 11:30 AM", "11:30 AM - 12:00 PM",
                                    "12:00 PM - 12:30 PM", "12:30 PM - 01:00 PM", "02:00 PM - 02:30 PM",
                                    "02:30 PM - 03:00 PM", "03:00 PM - 03:30 PM", "03:30 PM - 04:00 PM",
                                    "04:00 PM - 04:30 PM", "04:30 PM - 05:00 PM", "05:00 PM - 05:30 PM",
                                    "05:30 PM - 06:00 PM", "06:00 PM - 06:30 PM", "06:30 PM - 07:00 PM"
                                  ];
                                  const now = new Date();
                                  const yyyy = now.getFullYear();
                                  const mm = String(now.getMonth() + 1).padStart(2, '0');
                                  const dd = String(now.getDate()).padStart(2, '0');
                                  const todayStr = `${yyyy}-${mm}-${dd}`;
                                  const isToday = demoSlotDate === todayStr;

                                  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
                                  const minAllowedMinutes = currentTotalMinutes + 90;

                                  return allSlots
                                    .filter(slot => {
                                      if (!isToday) return true;
                                      const [startTime] = slot.split(' - ');
                                      const [timePart, modifier] = startTime.split(' ');
                                      let [hours, minutes] = timePart.split(':').map(Number);
                                      if (modifier === 'PM' && hours !== 12) hours += 12;
                                      if (modifier === 'AM' && hours === 12) hours = 0;
                                      const slotMinutes = hours * 60 + minutes;
                                      return slotMinutes >= minAllowedMinutes;
                                    })
                                    .map(slot => (
                                      <option key={slot} value={slot}>{slot}</option>
                                    ));
                                })()}
                              </select>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={demoSubmitting}
                            className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-lg shadow-sm flex items-center justify-center gap-2 text-xs transition-all active:scale-95 disabled:opacity-70 mt-3 cursor-pointer"
                          >
                            {demoSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={14} /> Pay ₹9 & Book Demo Session</>}
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-purple-200 via-purple-100 to-purple-50/80 p-6 sm:p-7 rounded-[26px] border border-rose-100/80 shadow-[0_4px_25px_rgba(244,63,94,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 border border-rose-200 rounded-full text-[10px] font-extrabold text-rose-600 shadow-2xs">
              <Sparkles size={12} className="text-rose-500" /> Welcome to Gigi's Circle
            </div>
            {isLinked && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 text-indigo-700 rounded-full text-[10px] font-extrabold shadow-2xs border border-indigo-200">
                <Check size={12} /> {isTeen ? 'Parent Linked' : 'Teen Linked'}
              </div>
            )}
            {user?.role === 'PEER' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-[10px] font-extrabold shadow-2xs">
                <ShieldCheck size={12} /> Certified Peer Mentor
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            {isTeen ? 'Hey there, Champion! 🌟' : 'Empowering Her Journey 🤍'}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-xl leading-relaxed">
            {isTeen
              ? "Track your daily quests, learning journeys, and cycle insights — all in one place."
              : "Review your daughter's progress, learning journeys, and personalized resources."}
          </p>
        </div>
      </div>

      {/* 4-Card Overview Summary matching reference design */}
      <DashboardSummary
        enrollments={enrollments}
        demoSessions={demoSessions}
        learningJourneys={[]}
        learningProgress={[]}
      />

      {/* Peer Mentor Stats (if PEER) */}
      {user?.role === 'PEER' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="text-4xl font-black text-slate-900 mb-1">{peerStats?.sessionsTotal || 0}</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Completed Chats</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4">
              <Star size={24} />
            </div>
            <div>
              <div className="text-4xl font-black text-slate-900 mb-1">{peerStats?.avgScore?.toFixed(1) || '0.0'}</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Avg Rating</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-[2rem] text-white shadow-xl shadow-purple-200/40 relative overflow-hidden hover:scale-[1.02] transition-transform flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
                <Award size={24} />
              </div>
              <span className="text-[10px] font-black tracking-widest px-3 py-1 bg-white text-purple-700 rounded-full">{peerStats?.badgeTier?.toUpperCase() || 'BRONZE'}</span>
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-black mb-1">{(peerStats?.sessionsTotal || 0) * 10}</div>
              <div className="text-sm font-bold text-white/80 uppercase tracking-widest">Points Earned</div>
            </div>
          </div>
        </div>
      )}

      <div className={showSidebar ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : "space-y-6 w-full"}>
        <div className={showSidebar ? "lg:col-span-2 space-y-6" : "space-y-6 w-full"}>
          {/* LATEST ORDERS GLIMPSE */}
          {productOrders.length > 0 && (
            <div className="grid grid-cols-1 gap-6">
              {/* LATEST ORDER DETAILS GLIMPSE */}
              <div className="bg-[#F0F4FF] border border-indigo-200/70 rounded-[26px] p-6 shadow-[0_4px_25px_rgba(99,102,241,0.06)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">


                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between border-b border-indigo-200/60 pb-4">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white/90 border border-indigo-200 text-indigo-600 shadow-2xs">
                            <ShoppingBag size={16} />
                          </div>
                          Latest Order Details
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 mt-1">Physical product delivery updates</p>
                      </div>
                      <Link href="/dashboard/orders" className="text-xs font-extrabold text-indigo-600 hover:underline flex items-center gap-0.5 shrink-0">
                        View All Orders <ChevronRight size={14} />
                      </Link>
                    </div>

                    {(() => {
                      const latest = productOrders[0];
                      if (!latest) return null;
                      const item = latest.items?.find((it: any) => !isProgramItem(it)) || latest.items?.[0];
                      const book = item?.book || {};
                      const title = book.title || item?.bookTitle || item?.name || 'Book Order';
                      const quantity = item?.quantity || 1;
                      const currencySymbol = getCurrencySymbol(latest);

                      return (
                        <div className="p-4 bg-white/90 border border-indigo-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-md transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-14 rounded-xl overflow-hidden bg-white shrink-0 border border-indigo-100 shadow-2xs flex items-center justify-center">
                              {book.imageUrl ? (
                                <img src={book.imageUrl} alt={title} className="w-full h-full object-cover" />
                              ) : (
                                <Package size={22} className="text-indigo-400" />
                              )}
                            </div>
                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                                  #{latest.id ? latest.id.slice(0, 8) : ''}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                                  <Calendar size={11} />
                                  {new Date(latest.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-sm text-slate-800 truncate">{title} <span className="text-slate-400 text-xs font-medium">(x{quantity})</span></h4>
                              <p className="text-xs font-extrabold text-indigo-700">Total: {currencySymbol}{latest.totalAmount?.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 border-slate-200/60 pt-3 sm:pt-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-extrabold px-3 py-1 rounded-full border ${latest.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                latest.orderStatus === 'SHIPPED' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                                  latest.orderStatus === 'PROCESSING' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                    'bg-amber-50 text-amber-600 border-amber-200'
                                }`}>
                                {latest.orderStatus}
                              </span>
                            </div>
                            <Link
                              href={`/dashboard/orders/${latest.id}`}
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all active:scale-95"
                            >
                              Details <ArrowRight size={12} />
                            </Link>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
            </div>
          )}



          {/* AVAILABLE PROGRAMS CATALOG */}






        </div>
        {/* RIGHT SIDEBAR: PARENT BOOKMARKS FOR TEEN */}
        {showSidebar && (
          <div className="space-y-0">
            <div className="bg-white border border-slate-100 rounded-[26px] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-7 h-7 rounded-xl bg-linear-to-br from-rose-100 to-pink-100 flex items-center justify-center shrink-0">
                      <Heart size={14} className="text-rose-500 fill-rose-500" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-800">Recommended by Parent</h4>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 ml-9">Your parent bookmarked these articles for you</p>
                </div>
                <span className="text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-0.5 rounded-full">
                  {parentBookmarks.length}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {parentBookmarks.slice(0, 6).map((post: any) => (
                  <ResourceCard
                    key={post.id}
                    post={post}
                    isBookmarkedInitial={false}
                    hideBookmark={true}
                    compact={true}
                  />
                ))}
              </div>

              {parentBookmarks.length > 6 && (
                <div className="text-center mt-3 pt-3 border-t border-slate-100">
                  <Link
                    href="/dashboard/resources"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    View All {parentBookmarks.length} Articles <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
