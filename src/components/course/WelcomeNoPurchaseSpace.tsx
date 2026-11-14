"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Gift,
  HelpCircle,
  Loader2,
  Lock,
  MessageCircle,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { LearnerProfile } from "@/store/auth-store";
import { useCourseCurriculum } from "@/hooks/use-course";
import {
  ParentOrdersSummaryResponse,
  ParentSpaceService,
} from "@/services/parent-space.service";

interface WelcomeNoPurchaseSpaceProps {
  user: any;
  learners: LearnerProfile[];
  ordersSummary: ParentOrdersSummaryResponse | null;
  ownsBook?: boolean;
  bookReaderPriceAvailable?: boolean;
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
  ownsBook = false,
  bookReaderPriceAvailable = false,
}: WelcomeNoPurchaseSpaceProps) {
  const { data: curriculum } = useCourseCurriculum();

  const [whatsappUpdates, setWhatsappUpdates] = useState<boolean>(
    Boolean(user?.marketingOptIn)
  );
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  const [giftModalOpen, setGiftModalOpen] = useState(false);

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
    : ownsBook
      ? bookReaderPriceAvailable
        ? "/course/checkout?plan=reader"
        : "/dashboard/orders"
      : "/course/checkout?plan=course";
  const lessonCtaLabel = primaryLearner
    ? `Try Lesson 1.1 with ${primaryLearner.name}`
    : ownsBook
      ? bookReaderPriceAvailable
        ? "Add the course for ₹299"
        : "View your book order"
      : "Choose a course plan";

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
      {/* Parent space navigation */}
      <header className="bg-white border-b border-[#F1E4E8] sticky top-0 z-20">
        <div className="max-w-[1180px] mx-auto px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/parent"
              className="relative z-10 block h-12 w-40 shrink-0 -ml-2 hover:opacity-90 transition-opacity md:h-14 md:w-48 lg:h-16 lg:w-52"
            >
              <Image
                src="/logo/infano-logo-for-light-bg.png"
                alt="Infano"
                fill
                sizes="(max-width: 768px) 160px, (max-width: 1024px) 192px, 208px"
                className="object-contain object-left"
                priority
              />
            </Link>
            <span className="font-bold text-[18px] sm:text-[20px] text-[#3D2C4A] border-l border-[#F1E4E8] pl-3">
              Parent space
            </span>
          </div>

          <nav aria-label="Parent space navigation" className="flex flex-wrap items-center gap-2 sm:gap-4 text-[14px] sm:text-[15px] font-semibold">
            <Link href="/dashboard/orders" className="inline-flex text-[#3D2C4A] hover:text-[#C2456A] px-2 py-1">
              Orders
            </Link>
            <Link href="/dashboard/settings" className="inline-flex text-[#3D2C4A] hover:text-[#C2456A] px-2 py-1">
              Settings
            </Link>
            <Link
              href="/dashboard/help"
              className="inline-flex items-center gap-1.5 text-[#3D2C4A] hover:text-[#C2456A] transition-colors"
            >
              <HelpCircle size={15} />
              <span>Help</span>
            </Link>
            {primaryLearner && (
              <Link
                href="/dashboard/picker"
                className="inline-flex items-center gap-1.5 text-[#3D2C4A] hover:text-[#C2456A] bg-[#FFFAF6] border border-[#F1E4E8] rounded-full px-3 py-1.5 text-sm"
              >
                Switch profile
              </Link>
            )}
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
                {ownsBook ? `Welcome back, ${firstName}` : `Hi ${firstName}`}
              </div>
              <h1 className="m-0 font-['Baloo_2',sans-serif] text-2xl sm:text-[28px] font-bold leading-tight text-[#3D2C4A]">
                {ownsBook
                  ? bookReaderPriceAvailable
                    ? "Your Gigi book is a lovely place to start"
                    : "Your Gigi book order is underway"
                  : "Let’s start with one free lesson — no payment needed"}
              </h1>
              <p className="m-0 mt-1.5 text-sm sm:text-[15px] text-[#5E4B6B] leading-relaxed">
                {ownsBook
                  ? bookReaderPriceAvailable
                    ? "Add the full HerNext course for ₹299 as a Gigi book owner."
                    : "Once your book arrives and payment is collected, you can add the full HerNext course for ₹299."
                  : "Try Lesson 1.1 with your daughter first. Buy the full course only if it feels right for both of you."}
              </p>
              {ownsBook && bookReaderPriceAvailable && (
                <Link
                  href="/course/checkout?plan=reader"
                  className="mt-4 inline-flex min-h-[44px] w-fit items-center justify-center gap-2 rounded-full bg-[#C2456A] px-5 text-sm font-bold text-white transition-colors hover:bg-[#A8365A]"
                >
                  Add HerNext for ₹299
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setGiftModalOpen(true);
            }}
            className="text-left bg-white hover:bg-[#FFFAF6] border border-[#E9DDE6] hover:border-[#C2456A]/50 rounded-[24px] px-5 py-4 flex items-center gap-4 transition-all shadow-2xs cursor-pointer"
          >
            <span className="w-12 h-12 rounded-2xl bg-[#FFF4C7] grid place-items-center shrink-0">
              <Gift size={22} className="text-[#8A6410]" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-['Baloo_2',sans-serif] text-lg font-bold text-[#3D2C4A] leading-tight">
                Have a gift code?
              </div>
              <div className="text-xs sm:text-[13px] text-[#6E5B7A] mt-0.5 leading-snug">
                Redeem a HerNext gift or contact our team for help.
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
                  {primaryLearner
                    ? "FREE · NO PAYMENT NEEDED"
                    : ownsBook
                      ? "GIGI BOOK OWNER OFFER"
                      : "EXPLORE HERNEXT"}
                </span>
              </div>

              <h2 className="m-0 font-['Baloo_2',sans-serif] text-2xl sm:text-[34px] font-bold text-[#3D2C4A] leading-tight">
                {primaryLearner
                  ? "Start with Lesson 1.1: The Menstrual Cycle"
                  : ownsBook
                    ? "Continue with the HerNext course"
                    : "Start her learning journey with HerNext"}
              </h2>

              <p className="m-0 text-sm sm:text-[15px] text-[#3E4F63] max-w-2xl leading-relaxed">
                {primaryLearner
                  ? "Meet Gigi, watch the expert video together, play Build-a-Cycle Moon and earn her first badge. Everything she unlocks today stays saved if you decide to buy."
                  : ownsBook
                    ? "Your Gigi book is ready to pair with the HerNext course. Add the course whenever you’re ready."
                    : "Explore expert-led lessons, activities and parent guidance. Her profile setup will be ready when you choose a course."}
              </p>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {(primaryLearner
                  ? [
                      { n: "1.", label: "Expert video (15m)" },
                      { n: "2.", label: "Build-a-Cycle Moon game" },
                      { n: "3.", label: "First flower + badge" },
                    ]
                  : [
                      { n: "1.", label: `${totalChapters} chapters · ${totalLessons} lessons` },
                      { n: "2.", label: "Activities and badges" },
                      { n: "3.", label: "Parent guidance" },
                    ]
                ).map((step) => (
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
                ) : ownsBook && !bookReaderPriceAvailable ? (
                  "Reader pricing unlocks after your book order is paid"
                ) : (
                  "Choose a plan to get started"
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
                {ownsBook ? "Add the HerNext course" : "Choose how to start"}
              </h2>
              <p className="m-0 text-sm text-[#6E5B7A]">
                {ownsBook
                  ? "Your book-owner price includes the full course."
                  : "One-time family purchase · Lifetime access · 7-day no-questions refund"}
              </p>
            </div>
          </div>

          <div className={`grid grid-cols-1 gap-4 items-stretch ${ownsBook ? "md:max-w-md" : "md:grid-cols-3"}`}>
            {/* Plan 1: The Course */}
            {!ownsBook && <div className="bg-white border border-[#E9DDE6] rounded-[24px] p-6 flex flex-col justify-between gap-5 shadow-2xs">
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
            </div>}

            {/* Plan 2: Best Value Bundle */}
            {!ownsBook && <div className="bg-white border-2 border-[#E8738A] rounded-[24px] p-6 flex flex-col justify-between gap-5 shadow-md relative">
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
            </div>}

            {/* Recommend the book to non-owners, and the course-owner price to book owners. */}
            {ownsBook ? (
              <div className="bg-[#FFF4C7] border border-[#F0DC8A] rounded-[24px] p-6 flex flex-col justify-between gap-5 shadow-2xs">
                <div className="flex flex-col gap-3">
                  <span className="inline-block self-start rounded-full bg-white text-[#8A6410] text-[11px] font-extrabold uppercase tracking-wider px-3 py-1">
                    YOUR GIGI BOOK PRICE
                  </span>
                  <div>
                    <div className="font-['Baloo_2',sans-serif] text-xl font-bold text-[#3D2C4A]">
                      Add the HerNext Course
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
                  <p className="m-0 text-sm text-[#544010]">
                    Get the full course at the Gigi book-owner price.
                  </p>
                </div>
                {!bookReaderPriceAvailable ? (
                  <Link
                    href="/dashboard/orders"
                    className="inline-flex items-center justify-center gap-2 min-h-[46px] rounded-full bg-white text-[#3D2C4A] font-bold text-sm border border-[#E2C86B] transition-colors"
                  >
                    <BookOpen size={15} />
                    <span>View book order</span>
                  </Link>
                ) : (
                  <Link
                    href="/course/checkout?plan=reader"
                    className="inline-flex items-center justify-center gap-2 min-h-[46px] rounded-full bg-white hover:bg-[#3D2C4A] hover:text-white text-[#3D2C4A] font-bold text-sm border border-[#E2C86B] transition-colors"
                  >
                    <BookOpen size={15} />
                    <span>Unlock for ₹299</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="bg-[#FFF4C7] border border-[#F0DC8A] rounded-[24px] p-6 flex flex-col justify-between gap-5 shadow-2xs">
                <div className="flex flex-col gap-3">
                  <span className="inline-block self-start rounded-full bg-white text-[#8A6410] text-[11px] font-extrabold uppercase tracking-wider px-3 py-1">
                    START WITH THE BOOK
                  </span>
                  <div>
                    <div className="font-['Baloo_2',sans-serif] text-xl font-bold text-[#3D2C4A]">
                      Gigi Book + Workbook
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-['Baloo_2',sans-serif] text-3xl font-extrabold text-[#3D2C4A]">
                        ₹799
                      </span>
                    </div>
                  </div>
                  <p className="m-0 text-sm text-[#544010]">
                    The book and workbook delivered home. Add the course later for ₹299.
                  </p>
                </div>
                <Link
                  href="/gigi-the-awkward-age-book"
                  className="inline-flex items-center justify-center gap-2 min-h-[46px] rounded-full bg-white hover:bg-[#3D2C4A] hover:text-white text-[#3D2C4A] font-bold text-sm border border-[#E2C86B] transition-colors"
                >
                  <BookOpen size={15} />
                  <span>Get the book · ₹799</span>
                </Link>
              </div>
            )}
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

      {/* Gift code help */}
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
                    Have a gift code?
                  </h3>
                  <p className="m-0 text-xs text-[#6E5B7A]">
                    Our team can help you redeem your HerNext gift.
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

            <div className="border-t border-[#F1E4E8] pt-3 flex items-center justify-between text-xs text-[#6E5B7A]">
              <span>Need help with your gift?</span>
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
