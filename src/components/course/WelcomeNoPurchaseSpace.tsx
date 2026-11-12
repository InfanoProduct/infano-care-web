"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  Gift,
  HelpCircle,
  Loader2,
  Lock,
  LogOut,
  MessageCircle,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore, LearnerProfile } from "@/store/auth-store";
import { useCourseCurriculum } from "@/hooks/use-course";
import {
  ParentOrdersSummaryResponse,
  ParentSpaceService,
} from "@/services/parent-space.service";

interface WelcomeNoPurchaseSpaceProps {
  user: any;
  learners: LearnerProfile[];
  ordersSummary: ParentOrdersSummaryResponse | null;
}

const FALLBACK_CHAPTERS = [
  {
    id: "ch1",
    number: 1,
    worldName: "Moon Meadow",
    theme: "Periods, puberty & how your cycle works — gently explained.",
    lessonsCount: 3,
    bg: "#EAF4FB",
    ink: "#2F6494",
    freeTag: "Lesson 1.1 free",
  },
  {
    id: "ch2",
    number: 2,
    worldName: "Care Cove",
    theme: "Hygiene, products, disposal & confidence at school.",
    lessonsCount: 4,
    bg: "#EAF7F1",
    ink: "#24735A",
  },
  {
    id: "ch3",
    number: 3,
    worldName: "Comfort Hills",
    theme: "Ease cramps, spot irregularities & when to ask for help.",
    lessonsCount: 3,
    bg: "#FFF1E6",
    ink: "#9A4A16",
  },
  {
    id: "ch4",
    number: 4,
    worldName: "Brave Heart Valley",
    theme: "Safe boundaries, POCSO rights, friendships & big feelings.",
    lessonsCount: 5,
    bg: "#F4F0FB",
    ink: "#5A4385",
  },
];

export function WelcomeNoPurchaseSpace({
  user,
  learners,
  ordersSummary,
}: WelcomeNoPurchaseSpaceProps) {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const { data: curriculum } = useCourseCurriculum();

  const [whatsappUpdates, setWhatsappUpdates] = useState<boolean>(
    Boolean(user?.marketingOptIn)
  );
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [readerPhone, setReaderPhone] = useState("");
  const [checkingReader, setCheckingReader] = useState(false);
  const [readerResult, setReaderResult] = useState<{
    verified: boolean;
    message: string;
  } | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ParentSpaceService.getSettings()
      .then((settings) => {
        if (!cancelled && typeof settings?.marketingOptIn === "boolean") {
          setWhatsappUpdates(settings.marketingOptIn);
        }
      })
      .catch(() => {
        // Non-blocking
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleWhatsapp = async (checked: boolean) => {
    const prev = whatsappUpdates;
    setWhatsappUpdates(checked);
    setSavingWhatsapp(true);
    try {
      await ParentSpaceService.updateSettings({ marketingOptIn: checked });
      toast.success(
        checked
          ? "You'll get gentle WhatsApp updates on her first lesson & offers."
          : "WhatsApp updates paused."
      );
    } catch {
      setWhatsappUpdates(prev);
      toast.error("Could not update WhatsApp preference right now.");
    } finally {
      setSavingWhatsapp(false);
    }
  };

  const handleCheckReader = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = readerPhone.replace(/\D/g, "").slice(-10);
    if (digits.length !== 10) {
      setReaderResult({
        verified: false,
        message: "Please enter a valid 10-digit mobile number.",
      });
      return;
    }
    setCheckingReader(true);
    setReaderResult(null);
    try {
      const res = await fetch("/api/course/check-reader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
      });
      const json = await res.json();
      setReaderResult({
        verified: Boolean(json?.isReader || json?.verified),
        message:
          json?.message ||
          (json?.verified
            ? "Verified Gigi Reader! Your ₹299 price is unlocked."
            : "We couldn't find a book order for this number."),
      });
    } catch {
      setReaderResult({
        verified: false,
        message: "Unable to verify right now. Please try again.",
      });
    } finally {
      setCheckingReader(false);
    }
  };

  const handleSignOut = () => {
    clearAuth();
    router.push("/login");
  };

  const displayName =
    user?.profile?.displayName?.trim() ||
    user?.username?.trim() ||
    "there";
  const firstName = displayName.split(/\s+/)[0] || "there";

  const hasRefunded = Boolean(
    ordersSummary?.refunds && ordersSummary.refunds.length > 0
  );
  const primaryLearner = learners[0] || null;
  const lessonSetupHref = primaryLearner
    ? "/dashboard/courses/lesson/l1-1"
    : "/onboarding";
  const lessonCtaLabel = primaryLearner
    ? `Try Lesson 1.1 with ${primaryLearner.name}`
    : "Set up her free lesson";

  const liveCourse: any = curriculum?.course || null;
  const courseChapters =
    liveCourse?.chapters && liveCourse.chapters.length > 0
      ? liveCourse.chapters
      : null;

  const totalChapters = liveCourse?.chapterCount || 4;
  const totalLessons = liveCourse?.lessonCount || 15;
  const coursePrice =
    typeof liveCourse?.price === "number" && liveCourse.price > 0
      ? liveCourse.price
      : 999;
  const courseMrp =
    typeof liveCourse?.mrp === "number" && liveCourse.mrp > coursePrice
      ? liveCourse.mrp
      : 1998;
  const bundlePrice = Math.max(coursePrice + 100, 1099);

  return (
    <div className="min-h-screen bg-[#FBF8F6] text-[#3D2C4A] font-['Noto_Sans',sans-serif]">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#F1E4E8] sticky top-0 z-20">
        <div className="max-w-[1180px] mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="relative h-8 w-28 sm:w-32 block shrink-0 hover:opacity-90 transition-opacity"
          >
            <Image
              src="/logo/infano-logo-for-light-bg.png"
              alt="Infano"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>

          <nav className="flex items-center gap-3 sm:gap-5 text-sm font-semibold">
            {primaryLearner && (
              <Link
                href="/dashboard/journey"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#FFF4EB] border border-[#F5DAC5] px-3.5 py-1.5 text-xs font-bold text-[#9A4A16] hover:bg-[#FFEAD9] transition-colors"
              >
                <Sparkles size={13} />
                {primaryLearner.name}&apos;s free preview
              </Link>
            )}
            <Link
              href="/dashboard/help"
              className="inline-flex items-center gap-1.5 text-[#3D2C4A] hover:text-[#C2456A] transition-colors"
            >
              <HelpCircle size={15} />
              <span>Help</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E9DDE6] bg-[#FFFAF6] hover:border-[#C2456A] hover:text-[#C2456A] px-3.5 py-1.5 text-xs sm:text-sm font-bold text-[#3D2C4A] transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-5 py-7 sm:py-9 flex flex-col gap-6">
        {/* Row 1: Personalized Welcome + Gift Code Card */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 items-stretch">
          {hasRefunded ? (
            <div className="bg-[#EAF7F1] border border-[#CFEADD] rounded-[24px] px-6 py-5 sm:px-7 sm:py-6 flex flex-col justify-center">
              <h1 className="m-0 font-['Baloo_2',sans-serif] text-2xl sm:text-[28px] font-bold leading-tight text-[#3D2C4A]">
                Welcome back, {firstName}. Your refund is taken care of.
              </h1>
              <p className="m-0 mt-1.5 text-sm sm:text-[15px] text-[#355A49] leading-relaxed">
                You can come back anytime — Lesson 1.1 is always free, and nothing she wrote or earned is gone.
              </p>
            </div>
          ) : (
            <div className="bg-[#FFF1E6] border border-[#F5DAC5] rounded-[24px] px-6 py-5 sm:px-7 sm:py-6 flex flex-col justify-center">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#9A4A16] mb-1">
                Hi {firstName}
              </div>
              <h1 className="m-0 font-['Baloo_2',sans-serif] text-2xl sm:text-[28px] font-bold leading-tight text-[#3D2C4A]">
                Let&apos;s start with one free lesson — no payment needed
              </h1>
              <p className="m-0 mt-1.5 text-sm sm:text-[15px] text-[#5E4B6B] leading-relaxed">
                Try Lesson 1.1 with your daughter first. Buy the full course only if it feels right for both of you.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setReaderResult(null);
              setGiftModalOpen(true);
            }}
            className="text-left bg-white hover:bg-[#FFFAF6] border border-[#E9DDE6] hover:border-[#C2456A]/50 rounded-[24px] px-5 py-4 flex items-center gap-4 transition-all shadow-2xs cursor-pointer"
          >
            <span className="w-12 h-12 rounded-2xl bg-[#FFF4C7] grid place-items-center shrink-0">
              <Gift size={22} className="text-[#8A6410]" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-['Baloo_2',sans-serif] text-lg font-bold text-[#3D2C4A] leading-tight">
                Got a gift code or Gigi book?
              </div>
              <div className="text-xs sm:text-[13px] text-[#6E5B7A] mt-0.5 leading-snug">
                Verify your Gigi book order for ₹299 reader access, or redeem a gift with support.
              </div>
            </div>
            <ArrowRight size={17} className="text-[#8A7896] shrink-0" />
          </button>
        </section>

        {/* Row 2: Free Lesson 1.1 Hero */}
        <section
          className="rounded-[28px] overflow-hidden border border-[#B7D8EF] shadow-xs"
          style={{
            background: "linear-gradient(135deg, #D8ECF8 0%, #B7D8EF 100%)",
          }}
        >
          <div className="p-6 sm:p-8 lg:p-9 grid grid-cols-1 lg:grid-cols-[1.35fr_auto] gap-6 items-center">
            <div className="flex flex-col gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 bg-white/90 text-[#2F6494] text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full">
                  <Sparkles size={12} />
                  FREE · NO PAYMENT NEEDED
                </span>
              </div>

              <h2 className="m-0 font-['Baloo_2',sans-serif] text-2xl sm:text-[34px] font-bold text-[#3D2C4A] leading-tight">
                Start with Lesson 1.1: The Menstrual Cycle
              </h2>

              <p className="m-0 text-sm sm:text-[15px] text-[#3E4F63] max-w-2xl leading-relaxed">
                Meet Gigi, watch the expert video together, play Build-a-Cycle Moon and earn her first badge.
                Everything she unlocks today stays saved if you decide to buy.
              </p>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {[
                  { n: "1.", label: "Expert video (15m)" },
                  { n: "2.", label: "Build-a-Cycle Moon game" },
                  { n: "3.", label: "First flower + badge" },
                ].map((step) => (
                  <span
                    key={step.label}
                    className="inline-flex items-center gap-1.5 bg-white/90 border border-white rounded-full px-3.5 py-1.5 text-xs sm:text-[13px] font-bold text-[#3D2C4A] shadow-2xs"
                  >
                    <span className="text-[#2F6494] font-extrabold">{step.n}</span>
                    {step.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-stretch lg:items-end gap-2.5 shrink-0">
              <Link
                href={lessonSetupHref}
                className="inline-flex items-center justify-center gap-2 min-h-[54px] px-7 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base shadow-md transition-all active:scale-[0.98]"
              >
                <Play size={16} fill="currentColor" />
                <span>{lessonCtaLabel}</span>
                <ArrowRight size={16} />
              </Link>
              <div className="text-xs font-semibold text-[#2F6494] text-center lg:text-right">
                {primaryLearner ? (
                  <>
                    Profile ready for {primaryLearner.name} ·{" "}
                    <Link
                      href="/dashboard/picker"
                      className="underline hover:text-[#3D2C4A]"
                    >
                      Switch profile
                    </Link>
                  </>
                ) : (
                  "Takes 30 seconds · Her profile stays private"
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Row 3: Choose How to Start (3 Pricing Cards) */}
        <section className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="m-0 font-['Baloo_2',sans-serif] text-xl sm:text-2xl font-bold text-[#3D2C4A]">
                Choose how to start
              </h2>
              <p className="m-0 text-sm text-[#6E5B7A]">
                One-time family purchase · Lifetime access · 7-day no-questions refund
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* Plan 1: The Course */}
            <div className="bg-white border border-[#E9DDE6] rounded-[24px] p-6 flex flex-col justify-between gap-5 shadow-2xs">
              <div className="flex flex-col gap-3">
                <div>
                  <span className="inline-block rounded-full bg-[#FDEFF0] text-[#C2456A] text-[11px] font-extrabold uppercase tracking-wider px-3 py-1">
                    LAUNCH OFFER
                  </span>
                </div>
                <div>
                  <div className="font-['Baloo_2',sans-serif] text-xl font-bold text-[#3D2C4A]">
                    The Course
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-['Baloo_2',sans-serif] text-3xl font-extrabold text-[#3D2C4A]">
                      ₹{coursePrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm text-[#8A7896] line-through">
                      ₹{courseMrp.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <ul className="m-0 p-0 list-none flex flex-col gap-2 text-sm text-[#4A3958]">
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-[#2F7F62] shrink-0 mt-0.5" />
                    <span>All {totalChapters} chapters · {totalLessons} lessons (Hinglish)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-[#2F7F62] shrink-0 mt-0.5" />
                    <span>Parent companion &amp; conversation cards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-[#2F7F62] shrink-0 mt-0.5" />
                    <span>Lifetime access · up to 2 sisters</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/course/checkout?plan=course"
                className="inline-flex items-center justify-center gap-2 min-h-[46px] rounded-full border-2 border-[#3D2C4A] hover:bg-[#3D2C4A] hover:text-white text-[#3D2C4A] font-bold text-sm transition-colors"
              >
                <span>Unlock full course</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Plan 2: Best Value Bundle */}
            <div className="bg-white border-2 border-[#E8738A] rounded-[24px] p-6 flex flex-col justify-between gap-5 shadow-md relative">
              <div className="flex flex-col gap-3">
                <div>
                  <span className="inline-block rounded-full bg-[#E8738A] text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1">
                    BEST VALUE
                  </span>
                </div>
                <div>
                  <div className="font-['Baloo_2',sans-serif] text-xl font-bold text-[#3D2C4A]">
                    Course + The Gigi Book
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-['Baloo_2',sans-serif] text-3xl font-extrabold text-[#C2456A]">
                      ₹{bundlePrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm text-[#8A7896] line-through">₹2,498</span>
                  </div>
                </div>
                <ul className="m-0 p-0 list-none flex flex-col gap-2 text-sm text-[#4A3958]">
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-[#2F7F62] shrink-0 mt-0.5" />
                    <span>Everything in the full digital course</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-[#2F7F62] shrink-0 mt-0.5" />
                    <span>
                      <em>Gigi: The Awkward Age</em> hardcover book delivered home
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-[#2F7F62] shrink-0 mt-0.5" />
                    <span>Course unlocks today · book ships in 3–5 days</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/course/checkout?plan=bundle"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm shadow-sm transition-colors"
              >
                <span>Get course + book</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Plan 3: Reader Price */}
            <div className="bg-[#FFF4C7] border border-[#F0DC8A] rounded-[24px] p-6 flex flex-col justify-between gap-5 shadow-2xs">
              <div className="flex flex-col gap-3">
                <div>
                  <span className="inline-block rounded-full bg-white text-[#8A6410] text-[11px] font-extrabold uppercase tracking-wider px-3 py-1">
                    ALREADY OWN THE GIGI BOOK?
                  </span>
                </div>
                <div>
                  <div className="font-['Baloo_2',sans-serif] text-xl font-bold text-[#3D2C4A]">
                    Gigi Reader Price
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-['Baloo_2',sans-serif] text-3xl font-extrabold text-[#3D2C4A]">
                      ₹299
                    </span>
                    <span className="text-sm text-[#8A6410]/80 line-through">
                      ₹{coursePrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <ul className="m-0 p-0 list-none flex flex-col gap-2 text-sm text-[#544010]">
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-[#8A6410] shrink-0 mt-0.5" />
                    <span>Same full course — save ₹700 as a book owner</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-[#8A6410] shrink-0 mt-0.5" />
                    <span>Verify with the phone number used on your book order</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/course/checkout?plan=reader"
                className="inline-flex items-center justify-center gap-2 min-h-[46px] rounded-full bg-white hover:bg-[#3D2C4A] hover:text-white text-[#3D2C4A] font-bold text-sm border border-[#E2C86B] transition-colors"
              >
                <BookOpen size={15} />
                <span>Unlock for ₹299</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Row 4: What's Inside the Course (4 Chapter Cards) */}
        <section className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="m-0 font-['Baloo_2',sans-serif] text-xl sm:text-2xl font-bold text-[#3D2C4A]">
              What&apos;s inside the course
            </h2>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#C2456A] hover:underline cursor-pointer"
            >
              <span>Preview every lesson</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(courseChapters
              ? courseChapters.map((ch: any, idx: number) => {
                  const fb = FALLBACK_CHAPTERS[idx] || FALLBACK_CHAPTERS[0];
                  return {
                    id: ch.id,
                    number: ch.number,
                    worldName: ch.worldName,
                    theme: ch.theme || fb.theme,
                    lessonsCount: ch.lessons?.length || fb.lessonsCount,
                    bg: ch.colors?.soft || fb.bg,
                    ink: ch.colors?.ink || fb.ink,
                    freeTag: ch.lessons?.some((l: any) => l.freePreview)
                      ? "Lesson 1.1 free"
                      : undefined,
                  };
                })
              : FALLBACK_CHAPTERS
            ).map((ch: any) => (
              <div
                key={ch.id}
                style={{ backgroundColor: ch.bg }}
                className="rounded-[22px] p-5 border border-black/5 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      style={{ color: ch.ink }}
                      className="text-[11px] font-extrabold uppercase tracking-wider"
                    >
                      Chapter {ch.number} · {ch.lessonsCount} lessons
                    </span>
                    {ch.freeTag ? (
                      <span className="text-[10px] font-extrabold bg-white text-[#2F6494] px-2 py-0.5 rounded-full">
                        {ch.freeTag}
                      </span>
                    ) : (
                      <Lock size={13} style={{ color: ch.ink }} className="opacity-70" />
                    )}
                  </div>
                  <div className="font-['Baloo_2',sans-serif] text-lg font-bold text-[#3D2C4A] leading-snug">
                    {ch.worldName}
                  </div>
                  <p className="m-0 mt-1 text-xs sm:text-[13px] text-[#5E4B6B] leading-relaxed">
                    {ch.theme}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Row 5: WhatsApp Updates Opt-in Card */}
        <section className="bg-white border border-[#E9DDE6] rounded-[24px] px-6 py-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <span className="w-11 h-11 rounded-2xl bg-[#EAF7F1] text-[#24735A] grid place-items-center shrink-0">
              <MessageCircle size={20} />
            </span>
            <div>
              <div className="font-bold text-base text-[#3D2C4A]">
                Prefer to take your time?
              </div>
              <div className="text-xs sm:text-sm text-[#6E5B7A]">
                We can WhatsApp you when she finishes Lesson 1.1 or if there&apos;s an offer.
              </div>
            </div>
          </div>

          <label className="inline-flex items-center gap-2.5 bg-[#FFFAF6] border border-[#E9DDE6] rounded-full px-4 py-2 text-sm font-bold text-[#3D2C4A] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={whatsappUpdates}
              disabled={savingWhatsapp}
              onChange={(e) => handleToggleWhatsapp(e.target.checked)}
              className="w-4 h-4 accent-[#C2456A] cursor-pointer"
            />
            <span>Send updates</span>
            {savingWhatsapp && <Loader2 size={14} className="animate-spin text-[#C2456A]" />}
          </label>
        </section>
      </main>

      {/* Gift / Book Reader Verification Modal */}
      {giftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-[#E9DDE6] max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-[#FFF4C7] grid place-items-center shrink-0">
                  <Gift size={18} className="text-[#8A6410]" />
                </span>
                <div>
                  <h3 className="m-0 font-['Baloo_2',sans-serif] text-xl font-bold text-[#3D2C4A]">
                    Gift code or Gigi Book?
                  </h3>
                  <p className="m-0 text-xs text-[#6E5B7A]">
                    Unlock reader pricing (₹299) or get gift help
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGiftModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F7F1F4] text-[#6E5B7A] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCheckReader} className="flex flex-col gap-3">
              <label className="text-xs font-bold text-[#3D2C4A]">
                Verify your Gigi Book mobile number (saves ₹700)
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={readerPhone}
                  onChange={(e) => setReaderPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="flex-1 rounded-xl border border-[#DFD2DA] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C2456A]"
                />
                <button
                  type="submit"
                  disabled={checkingReader}
                  className="px-4 py-2.5 rounded-xl bg-[#C2456A] hover:bg-[#A8365A] text-white text-sm font-bold disabled:opacity-60 cursor-pointer"
                >
                  {checkingReader ? "Checking..." : "Verify"}
                </button>
              </div>
            </form>

            {readerResult && (
              <div
                className={`rounded-2xl p-3.5 text-xs font-semibold ${
                  readerResult.verified
                    ? "bg-[#EAF7F1] text-[#24735A]"
                    : "bg-[#FFF1E6] text-[#9A4A16]"
                }`}
              >
                <p className="m-0">{readerResult.message}</p>
                {readerResult.verified && (
                  <Link
                    href="/course/checkout?plan=reader"
                    className="inline-flex items-center gap-1.5 mt-2 font-bold text-[#C2456A] underline"
                  >
                    Continue to ₹299 checkout <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            )}

            <div className="border-t border-[#F1E4E8] pt-3 flex items-center justify-between text-xs text-[#6E5B7A]">
              <span>Received a WhatsApp gift link or voucher?</span>
              <Link
                href="/dashboard/help"
                className="font-bold text-[#C2456A] hover:underline"
              >
                Contact Help →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Preview Every Lesson Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-[#E9DDE6] max-w-2xl w-full max-h-[82vh] flex flex-col shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1E4E8] flex items-center justify-between">
              <div>
                <h3 className="m-0 font-['Baloo_2',sans-serif] text-xl font-bold text-[#3D2C4A]">
                  Full HerNext Curriculum ({totalChapters} chapters · {totalLessons} lessons)
                </h3>
                <p className="m-0 text-xs text-[#6E5B7A]">
                  Lesson 1.1 is open free · Lessons 1.2–4.5 unlock when you enroll
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F7F1F4] text-[#6E5B7A] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-4">
              {(courseChapters || []).map((ch: any) => (
                <div
                  key={ch.id}
                  style={{ backgroundColor: ch.colors?.soft || "#FBF8F6" }}
                  className="rounded-2xl p-4 border border-black/5"
                >
                  <div
                    style={{ color: ch.colors?.ink || "#3D2C4A" }}
                    className="text-xs font-extrabold uppercase tracking-wider mb-1"
                  >
                    Chapter {ch.number} · {ch.worldName}
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    {(ch.lessons || []).map((l: any) => (
                      <div
                        key={l.id}
                        className="bg-white/90 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-sm font-bold text-[#3D2C4A]">
                            {l.code} · {l.title}
                          </div>
                          {l.tagline && (
                            <div className="text-xs text-[#6E5B7A]">{l.tagline}</div>
                          )}
                        </div>
                        {l.freePreview ? (
                          <Link
                            href={lessonSetupHref}
                            className="inline-flex items-center gap-1 rounded-full bg-[#C2456A] text-white text-xs font-bold px-3 py-1.5 shrink-0"
                          >
                            <Play size={11} fill="currentColor" /> Free
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#F3ECF0] text-[#8A7896] text-xs font-bold px-2.5 py-1 shrink-0">
                            <Lock size={11} /> Locked
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-[#F1E4E8] bg-[#FFFAF6] flex flex-wrap items-center justify-between gap-3">
              <Link
                href={lessonSetupHref}
                className="text-sm font-bold text-[#2F6494] hover:underline"
              >
                Try Lesson 1.1 free first →
              </Link>
              <Link
                href="/course/checkout?plan=course"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white text-sm font-bold px-5 py-2.5"
              >
                <span>Unlock full course · ₹{coursePrice.toLocaleString("en-IN")}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
