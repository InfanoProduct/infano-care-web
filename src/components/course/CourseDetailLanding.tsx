/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/auth-store";
import { useRegion } from "@/hooks/use-region";
import { apiClient } from "@/lib/api-client";

interface CourseDetailLandingProps {
  slugOrId?: string;
}

export default function CourseDetailLanding({ slugOrId: propSlugOrId }: CourseDetailLandingProps = {}) {
  const router = useRouter();
  const routeParams = useParams();
  const routeSlugOrId = (routeParams?.slug as string) || (routeParams?.id as string) || undefined;
  const slugOrId = propSlugOrId || routeSlugOrId;
  const { token, isAuthenticated } = useAuthStore();
  const { currencyCode } = useRegion();

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Guest enrollment modal state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ name: "", phone: "", email: "" });
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Countdown timer state (seconds remaining)
  const [secs, setSecs] = useState(2 * 86400 + 14 * 3600 + 33 * 60 + 8);

  // Video preview player state
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Try-it-now demo tab state: 'myth' | 'kit' | 'safe'
  const [activeTab, setActiveTab] = useState<"myth" | "kit" | "safe">("myth");

  // Myth or Fact game state
  const [mythIndex, setMythIndex] = useState(0);
  const [mythAns, setMythAns] = useState<string | null>(null);
  const [mythScore, setMythScore] = useState(0);
  const [mythDone, setMythDone] = useState(false);

  // Pack Her Period Kit state
  const [kitState, setKitState] = useState<Record<string, boolean>>({});
  const [kitMsg, setKitMsg] = useState("Tap an item to pack it.");

  // Safe Circle scenario answers
  const [safeAnswers, setSafeAnswers] = useState<Record<number, string>>({});

  // 3D Flip cards state (Did you know?)
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  // Curriculum accordion state
  const [openMod, setOpenMod] = useState<number>(0);

  // FAQ category & accordion state
  const [faqCat, setFaqCat] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number>(0);

  // Book Reader OTP verification state
  const [bkStep, setBkStep] = useState<"idle" | "phone" | "otp" | "done">("idle");
  const [bkPhone, setBkPhone] = useState("");
  const [bkOtp, setBkOtp] = useState("");
  const [bkErr, setBkErr] = useState("");

  // Countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecs((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch course details
  useEffect(() => {
    fetchCourseDetails();
  }, [slugOrId]);

  const fetchCourseDetails = async () => {
    try {
      let data: any = null;

      // 1. If slugOrId is given, try fetching directly
      if (slugOrId) {
        try {
          data = await apiClient.get(`/course/details/${slugOrId}`);
        } catch (e) {
          // If not found by specific slug, will fallback to catalog
        }
      }

      // 2. If no data yet, fetch from catalog courses (single active course)
      if (!data) {
        try {
          const exploreRes = (await apiClient.get<any[]>("/course/catalog")) as any;
          const coursesList = Array.isArray(exploreRes)
            ? exploreRes
            : exploreRes?.courses || [];

          if (coursesList.length > 0) {
            let matched = null;
            if (slugOrId) {
              const cleanSlug = slugOrId.toLowerCase().replace(/[^a-z0-9]/g, "");
              matched = coursesList.find((c: any) => {
                const cSlug = (c.slug || c.title || "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, "");
                return cSlug.includes(cleanSlug) || cleanSlug.includes(cSlug);
              });
            }
            const targetCourse = matched || coursesList[0];
            data = await apiClient.get(`/course/details/${targetCourse.id}`);
          }
        } catch (e) {
          // Ignore
        }
      }

      // 3. Check enrollment status if authenticated
      if (token && data?.id) {
        try {
          const enrolledRes = (await apiClient.get<any[]>("/course/my-enrollments")) as any;
          const enrolledList = Array.isArray(enrolledRes) ? enrolledRes : [];
          const isAlreadyEnrolled = enrolledList.some(
            (e: any) => e.course?.id === data.id || e.courseId === data.id
          );
          setIsEnrolled(isAlreadyEnrolled);
        } catch (e) {
          // Ignore
        }
      }

      if (data) {
        setCourse(data);
      }
    } catch (error) {
      console.error("Error loading course details", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert raw title to slug
  const courseSlug =
    course?.slug ||
    course?.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    "girlhood-hernext";

  // Keep browser URL cleanly synced to /course/[slug]
  useEffect(() => {
    if (typeof window === "undefined" || !courseSlug) return;
    const currentPath = window.location.pathname.replace(/\/+$/, "");
    const targetPath = `/course/${courseSlug}`;

    const isBareCourse = currentPath === "/course" || currentPath === "";
    const isUuid =
      slugOrId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        slugOrId
      );

    if ((isBareCourse || isUuid) && currentPath !== targetPath) {
      window.history.replaceState(null, "", targetPath);
    }
  }, [slugOrId, courseSlug]);

  const handlePurchase = (planKey?: string | React.MouseEvent) => {
    if (isAuthenticated && isEnrolled) {
      router.push('/dashboard/courses');
      return;
    }
    const key = typeof planKey === "string" ? planKey : undefined;
    const query = key ? `?plan=${key}` : "";
    router.push(`/course/checkout${query}`);
  };

  const handlePublicEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollForm.name || !enrollForm.phone || !enrollForm.email) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsEnrolling(true);
    try {
      const checkRes = (await apiClient.post("/course/public/check-enrollment", {
        email: enrollForm.email,
        phone: enrollForm.phone,
        courseId: course.id,
      })) as any;

      if (checkRes.enrolled) {
        toast(
          checkRes.message ||
            "An account with this email/phone is already enrolled. Please login.",
          { icon: "ℹ️" }
        );
        setIsEnrollModalOpen(false);
        router.push('/login?redirect=/dashboard/courses');
        return;
      }

      const purchaseRes = (await apiClient.post("/course/public/purchase", {
        name: enrollForm.name,
        email: enrollForm.email,
        phone: enrollForm.phone,
        courseId: course.id,
        currency: currencyCode,
      })) as any;

      if (course.isFree || !purchaseRes.razorpay) {
        toast.success("Successfully enrolled!");
        setIsEnrollModalOpen(false);
        router.push('/login?redirect=/dashboard/courses');
        return;
      }

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
            await apiClient.post(`/course/public/verify-purchase`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment successful! Please login to start learning.");
            setIsEnrollModalOpen(false);
            router.push('/login?redirect=/dashboard/courses');
          } catch (verifyError: any) {
            toast.error(verifyError.message || "Payment verification failed.");
          }
        },
        prefill: {
          name: enrollForm.name,
          email: enrollForm.email,
          contact: enrollForm.phone,
        },
        theme: { color: "#A8365A" },
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

  // Timer helpers
  const pad = (n: number) => String(n).padStart(2, "0");
  const cd = {
    d: pad(Math.floor(secs / 86400)),
    h: pad(Math.floor((secs % 86400) / 3600)),
    m: pad(Math.floor((secs % 3600) / 60)),
    s: pad(secs % 60),
  };

  // Myth or fact data
  const myths = [
    {
      q: "You shouldn't exercise or play sports during your period.",
      a: "myth",
      why: "Gentle movement often eases cramps. She can play, dance and stay active whenever she feels up to it.",
    },
    {
      q: "For the first year or two, periods can be irregular.",
      a: "fact",
      why: "The body takes time to find its rhythm. Cycles of 21 to 45 days are common in the early years.",
    },
    {
      q: "Period blood is dirty or impure.",
      a: "myth",
      why: "It is simply blood and tissue from the lining of the uterus. Completely natural and healthy.",
    },
    {
      q: "Pads should be changed every 4 to 6 hours.",
      a: "fact",
      why: "Changing on time keeps her fresh and helps prevent rashes and infections.",
    },
    {
      q: "Only older girls and women get period cramps.",
      a: "myth",
      why: "Cramps can happen at any age. Heat, rest and movement help, and severe pain should be checked by a doctor.",
    },
  ];

  const curMyth = myths[mythIndex];
  const mythAnswered = mythAns !== null;
  const mythCorrect = mythAnswered && mythAns === curMyth.a;

  const handleMythChoice = (choice: "myth" | "fact") => {
    if (mythAnswered) return;
    setMythAns(choice);
    if (choice === curMyth.a) {
      setMythScore((prev) => prev + 1);
    }
  };

  const handleNextMyth = () => {
    if (mythIndex < myths.length - 1) {
      setMythIndex((prev) => prev + 1);
      setMythAns(null);
    } else {
      setMythDone(true);
    }
  };

  const handleRestartMyth = () => {
    setMythIndex(0);
    setMythAns(null);
    setMythScore(0);
    setMythDone(false);
  };

  // Period Kit items
  const kitItems = [
    { id: "pad", label: "Sanitary pads", need: true, msg: "Essential. Pack 2 or 3 so she is never caught short." },
    { id: "under", label: "Spare underwear", need: true, msg: "A lifesaver if there is a leak." },
    { id: "wipes", label: "Gentle wipes", need: true, msg: "Great for freshening up between changes." },
    { id: "bag", label: "Paper bag", need: true, msg: "To wrap and dispose of used pads hygienically." },
    { id: "snack", label: "Small snack", need: true, msg: "A little energy helps with tiredness and cramps." },
    { id: "perfume", label: "Perfume", need: false, msg: "Not needed. Gentle washing is enough, and strong scents can irritate skin." },
    { id: "toy", label: "Fidget toy", need: false, msg: "Cute, but it does not belong in the period kit!" },
    { id: "bottle", label: "Hot water bag", need: false, msg: "Lovely for cramps, but better kept at home." },
  ];

  const packedEssentialCount = kitItems.filter((it) => it.need && kitState[it.id]).length;

  const toggleKitItem = (item: (typeof kitItems)[0]) => {
    const nextVal = !kitState[item.id];
    setKitState((prev) => ({ ...prev, [item.id]: nextVal }));
    setKitMsg(
      nextVal
        ? (item.need ? "Good pick. " : "Leave it out. ") + item.msg
        : `Removed ${item.label}.`
    );
  };

  // Safe Circle Scenarios
  const scenarios = [
    {
      q: "A doctor examines you while your parent is in the room.",
      a: "ok",
      why: "Check-ups with a trusted adult present are safe and normal.",
    },
    {
      q: "Someone asks you to keep a secret about touching.",
      a: "no",
      why: "Secrets about touching are never OK. Say no, get away, and tell a trusted adult.",
    },
    {
      q: "Your best friend hugs you after you win a race, and you feel happy about it.",
      a: "ok",
      why: "A hug you are comfortable with is a safe touch. You can always say no to any hug.",
    },
    {
      q: 'Someone online sends photos and says, "Don’t tell your parents."',
      a: "no",
      why: "Being asked to hide things from parents is a warning sign. Tell a trusted adult right away.",
    },
  ];

  // Did you know flip facts
  const factData = [
    {
      q: "How many eggs is a girl born with?",
      big: "1 to 2 million",
      a: "By puberty about 300,000 to 400,000 remain, and only around 400 are ever released.",
      bg: "#FFF4C7",
    },
    {
      q: "How much blood is lost in one period?",
      big: "Just 2 to 3 tablespoons",
      a: "Around 30 to 40 ml over the whole period. It often looks like more than it is.",
      bg: "#F9D5D3",
    },
    {
      q: "Why do cramps happen?",
      big: "Prostaglandins",
      a: "These chemicals make the uterus muscle squeeze to shed its lining. Heat, gentle movement and rest help.",
      bg: "#FFE3CC",
    },
    {
      q: "Is a 40-day cycle normal for a teen?",
      big: "It can be",
      a: "In the first 1 to 2 years, cycles of 21 to 45 days are common while the body finds its rhythm.",
      bg: "#D8ECF8",
    },
    {
      q: "How long does a plastic pad take to break down?",
      big: "Hundreds of years",
      a: "That is why the course explores cups, cloth pads and period underwear too.",
      bg: "#D4EFE4",
    },
    {
      q: "Can naming a feeling make it smaller?",
      big: "Yes",
      a: 'Research shows putting feelings into words ("I feel anxious") calms the brain’s alarm system.',
      bg: "#E3DAF5",
    },
  ];

  // Curriculum Modules fallback / enricher
  const defaultModules = [
    {
      title: "Understanding Menstruation",
      meta: "3 lessons · 45 min",
      headBg: "#D8ECF8",
      border: "#C6DFF0",
      assess: "Module check-in: 10 questions · Badge: Cycle Explorer",
      lessons: [
        { t: "1.1 The Menstrual Cycle", act: "Build-a-Cycle Wheel", free: true },
        { t: "1.2 Menstruation and Puberty", act: "Body Changes Timeline", free: false },
        { t: "1.3 Menstrual Flow and Irregularities", act: "Flow Detective", free: false },
      ],
    },
    {
      title: "Menstrual Hygiene",
      meta: "4 lessons · 55 min",
      headBg: "#D4EFE4",
      border: "#B9E1CF",
      assess: "Module check-in: 10 questions · Badge: Care Captain",
      lessons: [
        { t: "2.1 Importance of Menstrual Hygiene", act: "Hygiene Routine Builder", free: false },
        { t: "2.2 Menstrual Products & Sustainability", act: "Product Matchmaker", free: false },
        { t: "2.3 Proper Usage and Disposal", act: "Wrap It Right", free: false },
        { t: "2.4 Menstrual Hygiene in Public", act: "School Day Surprise story", free: false },
      ],
    },
    {
      title: "Menstrual Discomfort, Disorders & Infections",
      meta: "3 lessons · 45 min",
      headBg: "#FFE3CC",
      border: "#F7CDAA",
      assess: "Module check-in: 10 questions · Badge: Body Listener",
      lessons: [
        { t: "3.1 Understanding Menstrual Discomfort", act: "Comfort Toolbox", free: false },
        { t: "3.2 Menstrual Disorders", act: "Symptom Sorter", free: false },
        { t: "3.3 Menstrual Infections", act: "Germ Defender", free: false },
      ],
    },
    {
      title: "Understanding Safety and Well-being",
      meta: "5 lessons · 60 min",
      headBg: "#E3DAF5",
      border: "#D3C6EE",
      assess: "Module check-in: 10 questions + reflection · Badge: Brave Heart",
      lessons: [
        { t: "4.1 Building a Safe School Environment", act: "Safe Map", free: false },
        { t: "4.2 Understanding Abuse and Touch", act: "No, Go, Tell role-play", free: false },
        { t: "4.3 The POCSO Act", act: "Know Your Rights cards", free: false },
        { t: "4.4 Nurturing Positive Relationships", act: "Green Flags, Red Flags", free: false },
        { t: "4.5 Understanding Emotional Wellbeing", act: "Mood Garden", free: false },
      ],
    },
  ];

  // Dynamic modules from backend if available, mapped with consistent styling
  const courseModules =
    course?.modules && course.modules.length > 0
      ? course.modules.map((m: any, idx: number) => {
          const stylePalette = [
            { headBg: "#D8ECF8", border: "#C6DFF0" },
            { headBg: "#D4EFE4", border: "#B9E1CF" },
            { headBg: "#FFE3CC", border: "#F7CDAA" },
            { headBg: "#E3DAF5", border: "#D3C6EE" },
          ];
          const pal = stylePalette[idx % stylePalette.length];
          return {
            title: m.title,
            meta: `${m.chapters?.length || 0} lessons · ${m.timeDuration || 45} min`,
            headBg: pal.headBg,
            border: pal.border,
            assess: `Module check-in: ${m.chapters?.length || 10} questions · Badge: Module ${idx + 1} Champion`,
            lessons: (m.chapters || []).map((ch: any, chIdx: number) => ({
              t: ch.title,
              act: ch.type === "ASSESSMENT" ? "Assessment Quiz" : "Interactive Lesson",
              free: idx === 0 && chIdx === 0,
            })),
          };
        })
      : defaultModules;

  // FAQ Data
  const faqData = [
    {
      cat: "About the course",
      items: [
        {
          q: "What age is HerNext Foundation for?",
          a: "Girls aged 9 to 15. The ideal time is before her first period, around 9 to 11, but it is just as valuable after periods begin.",
        },
        {
          q: "Is it only recorded videos?",
          a: "No. Every lesson follows Watch, Play, Discover, Reflect: a short animated video, a game or activity, a science fact card, a journal prompt and a quiz. Each module ends with an assessment and a badge.",
        },
        {
          q: "What language is it in?",
          a: "Videos are in Hinglish, the easy Hindi-English mix girls actually speak. Activities, quizzes and worksheets are in English.",
        },
        {
          q: "Who created the content?",
          a: "Infano's team of gynaecologists, adolescent health educators and child psychologists. Every lesson is medically reviewed.",
        },
        {
          q: "How long does it take?",
          a: "About 3.5 hours of video plus activities. Most girls finish in 3 to 4 weeks at 15 to 20 minutes a few times a week.",
        },
      ],
    },
    {
      cat: "For my daughter",
      items: [
        {
          q: "She hasn't had her first period yet. Is it too early?",
          a: "Not at all. Learning before the first period is the best time, so she feels prepared instead of scared.",
        },
        {
          q: "Should I watch with her?",
          a: "We suggest watching Module 1 together and using the conversation cards after each module. Some older girls prefer to learn alone first. Both work.",
        },
        {
          q: "Can I see her progress?",
          a: "Yes. Your parent view shows completed lessons, quiz scores and badges. Her journal entries stay private to her.",
        },
        {
          q: "Is it useful for fathers too?",
          a: "Absolutely. The parent guide includes tips for dads and single parents.",
        },
      ],
    },
    {
      cat: "Safety topics",
      items: [
        {
          q: "Will the safety module scare her?",
          a: "No. It focuses on body autonomy, trusted adults and the No, Go, Tell rule, through calm, age-appropriate stories. You can preview it first.",
        },
        {
          q: "Why does it cover the POCSO Act?",
          a: "Knowing her rights helps a child speak up. We explain the law in simple words, along with helplines such as Childline 1098.",
        },
        {
          q: "Does it replace a doctor?",
          a: "No. The course teaches when to seek help and what to tell a doctor. It is not a substitute for medical advice.",
        },
      ],
    },
    {
      cat: "Payment & access",
      items: [
        {
          q: "I own the Gigi book. How do I get the ₹299 price?",
          a: 'Choose "Already have the Gigi book?", enter the phone number you used to buy the book and confirm with the OTP. The reader price applies instantly.',
        },
        {
          q: "How long do we have access?",
          a: "Lifetime access, including future updates to the Foundation course.",
        },
        {
          q: "What if it is not right for us?",
          a: "You get a full refund within 7 days of purchase. Just write to our support team.",
        },
        {
          q: "Which payment methods can I use?",
          a: "UPI, debit and credit cards, and net banking.",
        },
        {
          q: "Who do I contact for help?",
          a: "Our support team on WhatsApp or email. A parent community is coming soon.",
        },
      ],
    },
  ];

  // Book Reader OTP verification handlers
  const handleSendBkOtp = () => {
    if (bkPhone.length !== 10) {
      setBkErr("Please enter a 10-digit mobile number.");
    } else {
      setBkErr("");
      setBkStep("otp");
      setBkOtp("");
    }
  };

  const handleVerifyBkOtp = () => {
    if (bkOtp.length !== 4) {
      setBkErr("Please enter all 4 digits.");
    } else {
      setBkErr("");
      setBkStep("done");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#FFFAF6] text-[#3D2C4A]">
        <div className="w-12 h-12 rounded-full border-4 border-[#C2456A]/20 border-t-[#C2456A] animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#8A7896]">
          Loading course details...
        </p>
      </div>
    );
  }

  // Fallback defaults for metadata
  const courseTitle = course?.title || "Girlhood: HerNext · Foundation";
  const courseDesc =
    course?.description ||
    "Periods, body, safety and feelings. A doctor-designed, story-led course with games, activities and quizzes that help your daughter understand her changing body and stay safe, while giving you the words to support her.";
  const coursePrice = course?.isFree ? 0 : course?.price ?? 499;
  const coursePriceOriginal = Math.round(coursePrice * 2);
  const totalModulesCount = course?.modules?.length || 4;
  const totalChaptersCount =
    (course?.modules || []).reduce(
      (acc: number, m: any) => acc + (m.chapters?.length || 0),
      0
    ) || 15;
  const courseDurationText = course?.timeDuration
    ? `${(course.timeDuration / 60).toFixed(1)} hrs`
    : "3.5 hrs";
  const courseCategory = course?.category || "Wellness & Puberty";

  return (
    <>
      {/* External Scripts & Fonts */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Nunito:wght@400;600;700;800;900&family=Caveat:wght@600;700&display=swap"
        rel="stylesheet"
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        .hn-wrapper {
          background: #FFFAF6;
          color: #3D2C4A;
          font-family: 'Nunito', system-ui, sans-serif;
          font-size: 17px;
          line-height: 1.6;
          overflow-x: hidden;
          width: 100%;
        }
        .hn-wrapper * { box-sizing: border-box; }
        .hn-wrapper button { font-family: inherit; cursor: pointer; }
        .hn-wrapper input { font-family: inherit; }
        .hn-wrapper a { color: #A8365A; text-decoration: none; }
        .hn-wrapper a:hover { color: #7E2343; }
        .hn-lift { transition: transform .25s ease, box-shadow .25s ease; }
        .hn-lift:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(61,44,74,.12); }
        .hn-flip { perspective: 1200px; }
        .hn-flip-inner {
          position: relative;
          display: block;
          width: 100%;
          height: 230px;
          transition: transform .7s cubic-bezier(.2,.7,.2,1);
          transform-style: preserve-3d;
        }
        .hn-flip-inner.on { transform: rotateY(180deg); }
        .hn-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 24px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        .hn-face.back { transform: rotateY(180deg); }
        .hn-float1 { animation: hnfloat 6s ease-in-out infinite; }
        .hn-float2 { animation: hnfloat 7s ease-in-out -2s infinite; }
        .hn-float3 { animation: hnfloat 8s ease-in-out -4s infinite; }
        .hn-sway { transform-origin: 50% 100%; animation: hnsway 5s ease-in-out infinite; }
        .hn-pop { animation: hnpop .5s cubic-bezier(.2,1.4,.4,1); }
        @keyframes hnfloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes hnsway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes hnpop {
          0% { transform: scale(.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 860px) {
          .hn-nav-links { display: none !important; }
          .hn-hide-sm { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hn-float1, .hn-float2, .hn-float3, .hn-sway, .hn-pop { animation: none; }
          .hn-flip-inner { transition: none; }
        }
        `
      }} />

      <div className="hn-wrapper min-h-screen">

        {/* 1. ANNOUNCEMENT BAR */}
        <div style={{ background: "#FFF4C7", borderBottom: "1px solid #F3E3A1", padding: "10px 16px", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "6px 18px", fontSize: "14px", fontWeight: 700, textAlign: "center" }}>
          <span>
            Launch offer: 50% off · Now{" "}
            <span style={{ color: "#A8365A" }}>
              {course?.isFree ? "FREE" : `₹${coursePrice}`}
            </span>{" "}
            {!course?.isFree && <s style={{ opacity: 0.6 }}>₹{coursePriceOriginal}</s>}
          </span>
          <span style={{ display: "inline-flex", gap: "4px", alignItems: "center", background: "#3D2C4A", color: "#FFF4C7", borderRadius: "999px", padding: "3px 12px", fontVariantNumeric: "tabular-nums" }}>
            Ends in {cd.d}d : {cd.h}h : {cd.m}m : {cd.s}s
          </span>
          <Link href="/course/checkout?plan=reader" style={{ color: "#3D2C4A", fontWeight: 800 }}>
            Own the Gigi book? Unlock it for ₹299 →
          </Link>
        </div>

        {/* 2. HEADER */}
        <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,250,246,.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid #F1E4E8" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
            <Link href="/" className="relative shrink-0 group w-44 sm:w-52 md:w-56 h-10 sm:h-12 flex items-center -ml-2">
              <Image
                src="/logo/infano-logo-for-light-bg.png"
                alt="Infano"
                fill
                sizes="(max-width: 768px) 180px, 240px"
                className="object-contain object-left transition-transform group-hover:scale-102"
                priority
              />
            </Link>

            <nav className="hn-nav-links" aria-label="Page sections" style={{ display: "flex", alignItems: "center", gap: "28px", fontWeight: 700, fontSize: "15px" }}>
              <a href="#journey" style={{ color: "#3D2C4A" }}>Journey</a>
              <a href="#preview" style={{ color: "#3D2C4A" }}>Free preview</a>
              <a href="#curriculum" style={{ color: "#3D2C4A" }}>Curriculum</a>
              <a href="#experts" style={{ color: "#3D2C4A" }}>Experts</a>
              <a href="#faq" style={{ color: "#3D2C4A" }}>FAQ</a>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {isAuthenticated ? (
                <Link href="/dashboard" className="hn-hide-sm" style={{ color: "#3D2C4A", fontWeight: 700, fontSize: "15px" }}>
                  Dashboard
                </Link>
              ) : (
                <Link href="/login" className="hn-hide-sm" style={{ color: "#3D2C4A", fontWeight: 700, fontSize: "15px" }}>
                  Login
                </Link>
              )}
              {isEnrolled ? (
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/courses')}
                  style={{ display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 20px", borderRadius: "999px", background: "#2F8F6B", color: "#FFFFFF", fontWeight: 800, fontSize: "15px", border: "none", cursor: "pointer" }}
                >
                  Go to Course
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePurchase("course")}
                  style={{ display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 20px", borderRadius: "999px", background: "#C2456A", color: "#FFFFFF", fontWeight: 800, fontSize: "15px", border: "none", cursor: "pointer" }}
                >
                  {course?.isFree ? "Enroll Free" : "Enroll now"}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* 3. HERO */}
        <section id="top" style={{ position: "relative", padding: "56px 0 72px" }}>
          <svg aria-hidden="true" width="620" height="620" viewBox="0 0 600 600" style={{ position: "absolute", right: "-160px", top: "-120px", opacity: 0.9, pointerEvents: "none" }}>
            <path d="M421 81c66 44 117 128 108 211-9 82-79 163-161 199-83 36-178 27-243-23C60 418 25 327 47 248 69 168 149 99 232 69c83-30 123-32 189 12z" fill="#F9D5D3" />
          </svg>
          <svg aria-hidden="true" width="380" height="380" viewBox="0 0 600 600" style={{ position: "absolute", left: "-180px", bottom: "-60px", opacity: 0.8, pointerEvents: "none" }}>
            <path d="M421 81c66 44 117 128 108 211-9 82-79 163-161 199-83 36-178 27-243-23C60 418 25 327 47 248 69 168 149 99 232 69c83-30 123-32 189 12z" fill="#E3DAF5" />
          </svg>

          <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "48px" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0, display: "flex", flexDirection: "column", gap: "22px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#FFFFFF", border: "1px solid #F1D6DD", borderRadius: "999px", padding: "6px 14px", fontSize: "14px", fontWeight: 800, color: "#A8365A" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
                  </svg>
                  {courseCategory}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", background: "#3D2C4A", color: "#FFFAF6", borderRadius: "999px", padding: "6px 14px", fontSize: "14px", fontWeight: 800 }}>
                  {courseTitle}
                </span>
              </div>

              <h1 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(36px, 4.5vw, 60px)", lineHeight: 1.08, letterSpacing: "-.02em" }}>
                The talk you've been meaning to have, <em style={{ color: "#C2456A", fontStyle: "italic" }}>made beautiful.</em>
              </h1>

              <p style={{ margin: 0, fontSize: "19px", color: "#5E4B6B", maxWidth: "560px", lineHeight: 1.6 }}>
                {courseDesc}
              </p>

              {/* Feature Pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ background: "#D8ECF8", borderRadius: "12px", padding: "6px 12px", fontSize: "14px", fontWeight: 700 }}>
                  [{totalChaptersCount}+] bite-sized lessons
                </span>
                <span style={{ background: "#D4EFE4", borderRadius: "12px", padding: "6px 12px", fontSize: "14px", fontWeight: 700 }}>
                  [40+] games &amp; activities
                </span>
                <span style={{ background: "#FFE3CC", borderRadius: "12px", padding: "6px 12px", fontSize: "14px", fontWeight: 700 }}>
                  {totalModulesCount} modules · {courseDurationText}
                </span>
                <span style={{ background: "#E3DAF5", borderRadius: "12px", padding: "6px 12px", fontSize: "14px", fontWeight: 700 }}>
                  Hinglish videos
                </span>
                <span style={{ background: "#FFF4C7", borderRadius: "12px", padding: "6px 12px", fontSize: "14px", fontWeight: 700 }}>
                  Certificate · Lifetime access
                </span>
              </div>

              {/* CTAs */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px", marginTop: "6px" }}>
                {isEnrolled ? (
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/courses')}
                    style={{ display: "inline-flex", alignItems: "center", gap: "10px", minHeight: "56px", padding: "0 28px", borderRadius: "999px", background: "#2F8F6B", color: "#FFFFFF", fontWeight: 800, fontSize: "18px", border: "none", boxShadow: "0 12px 28px rgba(47,143,107,.28)", cursor: "pointer" }}
                  >
                    Go to Course Dashboard →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePurchase("course")}
                    disabled={isPurchasing}
                    style={{ display: "inline-flex", alignItems: "center", gap: "10px", minHeight: "56px", padding: "0 28px", borderRadius: "999px", background: "#C2456A", color: "#FFFFFF", fontWeight: 800, fontSize: "18px", border: "none", boxShadow: "0 12px 28px rgba(194,69,106,.28)", cursor: "pointer" }}
                  >
                    {course?.isFree
                      ? "Start her journey · Free"
                      : `Start her journey · ₹${coursePrice}`}
                    {!course?.isFree && (
                      <s style={{ opacity: 0.75, fontWeight: 700, fontSize: "15px" }}>
                        ₹{coursePriceOriginal}
                      </s>
                    )}
                  </button>
                )}
                <a
                  href="#preview"
                  style={{ display: "inline-flex", alignItems: "center", gap: "10px", minHeight: "56px", padding: "0 22px", borderRadius: "999px", border: "2px solid #3D2C4A", color: "#3D2C4A", fontWeight: 800, fontSize: "17px", background: "#FFFFFF" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch free preview
                </a>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", fontSize: "14px", fontWeight: 700, color: "#5E4B6B" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#F2B544" aria-hidden="true">
                    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
                  </svg>
                  [4.9] from [1,200] parents
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2F8F6B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  Reviewed by gynaecologists &amp; psychologists
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2F8F6B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  7-day refund
                </span>
              </div>
            </div>

            {/* Right Hero Graphic with Floating Badges */}
            <div style={{ flex: "1 1 440px", minWidth: 0, position: "relative" }}>
              <div style={{ position: "relative", background: "#FFFFFF", borderRadius: "36px", border: "1px solid #F1E4E8", boxShadow: "0 24px 60px rgba(61,44,74,.10)", overflow: "hidden", aspectRatio: "7 / 6" }}>
                {course?.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={courseTitle}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <svg viewBox="0 0 560 480" width="100%" height="100%" role="img" aria-label="Hero illustration">
                    <rect width="560" height="480" fill="#FDEFF0" />
                    <circle cx="290" cy="250" r="190" fill="#F9D5D3" />
                    <path d="M470 70a36 36 0 1 0 30 52 30 30 0 1 1-30-52z" fill="#FFF4C7" />
                    <circle cx="90" cy="96" r="5" fill="#E3DAF5" />
                    <circle cx="120" cy="60" r="3" fill="#FFFFFF" />
                    <circle cx="420" cy="40" r="4" fill="#FFFFFF" />
                    <ellipse cx="270" cy="420" rx="210" ry="34" fill="#F4C3CC" />
                    <g transform="rotate(-6 260 260)">
                      <rect x="140" y="140" width="250" height="190" rx="22" fill="#3D2C4A" />
                      <rect x="152" y="152" width="226" height="166" rx="12" fill="#FFFAF6" />
                      <path d="M176 290 C 210 250, 240 300, 270 250 S 330 230, 352 190" stroke="#E8DCE6" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="2 12" />
                      <circle cx="176" cy="290" r="13" fill="#D8ECF8" stroke="#8EBFE0" strokeWidth="3" />
                      <circle cx="236" cy="268" r="13" fill="#D4EFE4" stroke="#7FC3A3" strokeWidth="3" />
                      <circle cx="296" cy="240" r="13" fill="#FFE3CC" stroke="#F0AF7E" strokeWidth="3" />
                      <circle cx="352" cy="190" r="15" fill="#E3DAF5" stroke="#A992D6" strokeWidth="3" />
                      <rect x="168" y="166" width="96" height="12" rx="6" fill="#3D2C4A" opacity="0.85" />
                      <rect x="168" y="186" width="62" height="8" rx="4" fill="#C9B9C9" />
                      <circle cx="352" cy="190" r="5" fill="#A992D6" />
                    </g>
                    <g className="hn-sway" style={{ transformBox: "fill-box" }}>
                      <path d="M470 400 C 466 350, 474 320, 468 270" stroke="#7FB89A" strokeWidth="6" fill="none" strokeLinecap="round" />
                      <path d="M470 350 C 448 336, 432 344, 426 356 C 442 362, 460 360, 470 350z" fill="#A8D8BE" />
                      <path d="M469 312 C 490 298, 506 304, 512 316 C 496 322, 480 320, 469 312z" fill="#A8D8BE" />
                      <path d="M468 220 C 486 238, 486 262, 468 274 C 450 262, 450 238, 468 220z" fill="#F08FA6" />
                      <path d="M468 274 C 458 266, 452 258, 454 250 L 468 262 L 482 250 C 484 258, 478 266, 468 274z" fill="#7FB89A" />
                    </g>
                    <path d="M436 400 h 66 l -8 56 h -50 z" fill="#E89F84" />
                    <rect x="430" y="394" width="78" height="14" rx="6" fill="#D98A6F" />
                    <g fill="#F4A3B4" opacity="0.9">
                      <ellipse cx="80" cy="200" rx="7" ry="12" transform="rotate(30 80 200)" />
                      <ellipse cx="120" cy="330" rx="6" ry="10" transform="rotate(-20 120 330)" />
                      <ellipse cx="410" cy="150" rx="6" ry="10" transform="rotate(50 410 150)" />
                    </g>
                  </svg>
                )}
              </div>

              {/* Float 1: Badge Unlocked */}
              <div className="hn-float1" style={{ position: "absolute", left: "-18px", top: "28px", background: "#FFF4C7", borderRadius: "18px", padding: "10px 14px", boxShadow: "0 12px 28px rgba(61,44,74,.12)", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 800 }}>
                <span style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#FFFFFF", display: "grid", placeItems: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#F2B544" aria-hidden="true">
                    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
                  </svg>
                </span>
                <span>
                  Badge unlocked<br />
                  <span style={{ fontWeight: 600, color: "#5E4B6B" }}>Cycle Explorer</span>
                </span>
              </div>

              {/* Float 2: Module 1 Quiz */}
              <div className="hn-float2" style={{ position: "absolute", right: "-10px", top: "46%", background: "#D4EFE4", borderRadius: "18px", padding: "10px 14px", boxShadow: "0 12px 28px rgba(61,44,74,.12)", fontSize: "14px", fontWeight: 800 }}>
                Module 1 quiz<br />
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: "24px" }}>9/10</span>
              </div>

              {/* Float 3: Day 14 */}
              <div className="hn-float3" style={{ position: "absolute", left: "18%", bottom: "-18px", background: "#E3DAF5", borderRadius: "18px", padding: "10px 16px", boxShadow: "0 12px 28px rgba(61,44,74,.12)", fontSize: "14px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B4FA0" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
                </svg>
                Day 14 of her journey
              </div>
            </div>
          </div>
        </section>

        {/* 4. TRUST STRIP */}
        <section aria-label="Why families trust Infano" style={{ padding: "8px 0 40px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #F1E4E8", borderRadius: "28px", padding: "28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", textAlign: "center" }}>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: "40px", fontWeight: 600, color: "#C2456A", lineHeight: 1.1 }}>10,000+</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#5E4B6B" }}>girls &amp; families on the Infano journey</div>
              </div>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: "40px", fontWeight: 600, color: "#6B4FA0", lineHeight: 1.1 }}>[50+]</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#5E4B6B" }}>partner schools</div>
              </div>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: "40px", fontWeight: 600, color: "#2F8F6B", lineHeight: 1.1 }}>[15+]</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#5E4B6B" }}>doctors &amp; psychologists reviewing</div>
              </div>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: "40px", fontWeight: 600, color: "#C46A2E", lineHeight: 1.1 }}>[4.9]/5</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#5E4B6B" }}>average parent rating</div>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 26px", marginTop: "18px", fontSize: "14px", fontWeight: 800, color: "#6E5B7A" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
                </svg>
                Safe space
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="9" r="6" />
                  <path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7" />
                </svg>
                Expert verified
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                Private &amp; ad-free
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#9C8AA6" }}>
                Trusted by leading schools &amp; paediatricians across India
              </span>
            </div>
          </div>
        </section>

        {/* 5. THE TALK, REIMAGINED */}
        <section style={{ padding: "72px 0" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: "28px", fontWeight: 700, color: "#C2456A" }}>
              We get it
            </div>
            <h2 style={{ margin: "4px 0 40px", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(30px, 3.8vw, 48px)", lineHeight: 1.12, letterSpacing: "-.015em", maxWidth: "760px" }}>
              You want to tell her everything. You just don't know where to begin.
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "36px", alignItems: "center" }}>
              <div style={{ flex: "1 1 460px", minWidth: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px" }}>
                <div style={{ background: "#FFF4C7", borderRadius: "6px 22px 22px 22px", padding: "22px", transform: "rotate(-2deg)", boxShadow: "0 10px 24px rgba(61,44,74,.08)", fontFamily: "'Caveat', cursive", fontSize: "25px", lineHeight: 1.2, fontWeight: 600 }}>
                  "What if her first period starts at school and she panics?"
                </div>
                <div style={{ background: "#F9D5D3", borderRadius: "22px 6px 22px 22px", padding: "22px", transform: "rotate(1.5deg)", boxShadow: "0 10px 24px rgba(61,44,74,.08)", fontFamily: "'Caveat', cursive", fontSize: "25px", lineHeight: 1.2, fontWeight: 600 }}>
                  "She's already Googling things. I'm scared of what she's finding."
                </div>
                <div style={{ background: "#E3DAF5", borderRadius: "22px 22px 6px 22px", padding: "22px", transform: "rotate(1deg)", boxShadow: "0 10px 24px rgba(61,44,74,.08)", fontFamily: "'Caveat', cursive", fontSize: "25px", lineHeight: 1.2, fontWeight: 600 }}>
                  "How do I explain safe and unsafe touch without frightening her?"
                </div>
                <div style={{ background: "#D4EFE4", borderRadius: "22px 22px 22px 6px", padding: "22px", transform: "rotate(-1.5deg)", boxShadow: "0 10px 24px rgba(61,44,74,.08)", fontFamily: "'Caveat', cursive", fontSize: "25px", lineHeight: 1.2, fontWeight: 600 }}>
                  "Nobody explained this to me. I want it to be different for her."
                </div>
              </div>

              <div style={{ flex: "1 1 380px", minWidth: 0, background: "#FFFFFF", border: "1px solid #F1E4E8", borderRadius: "28px", padding: "32px", boxShadow: "0 18px 40px rgba(61,44,74,.08)" }}>
                <svg width="44" height="44" viewBox="0 0 120 120" aria-hidden="true">
                  <path d="M60 22 C 78 42, 78 68, 60 80 C 42 68, 42 42, 60 22z" fill="#F08FA6" />
                  <path d="M60 80 C 48 72, 42 62, 44 52 L 60 66 L 76 52 C 78 62, 72 72, 60 80z" fill="#7FB89A" />
                  <path d="M60 80 V 112" stroke="#7FB89A" strokeWidth="6" strokeLinecap="round" />
                </svg>
                <p style={{ margin: "14px 0 0", fontSize: "18px" }}>
                  Most of us grew up with silence, whispers, or one awkward conversation. Our daughters deserve better.
                </p>
                <p style={{ margin: "14px 0 0", fontSize: "18px" }}>
                  <strong>HerNext</strong> gives her clear, science-backed answers in a voice she trusts, and gives you gentle prompts to keep the conversation going at home.
                </p>
                <p style={{ margin: "14px 0 0", fontFamily: "'Fraunces', serif", fontSize: "22px", fontStyle: "italic", color: "#A8365A" }}>
                  No awkwardness. No myths. Just confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. THE BLOOM JOURNEY */}
        <section id="journey" style={{ position: "relative", padding: "88px 0", background: "#FFFFFF" }}>
          <svg aria-hidden="true" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ position: "absolute", top: "-1px", left: 0, width: "100%", height: "50px" }}>
            <path d="M0 0h1440v20c-120 30-240 30-360 10S840 0 720 18 480 50 360 34 120 0 0 20z" fill="#FFFAF6" />
          </svg>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 48px" }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "28px", fontWeight: 700, color: "#C2456A" }}>
                What she'll learn &amp; master
              </div>
              <h2 style={{ margin: "4px 0 12px", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(30px, 3.8vw, 48px)", lineHeight: 1.12, letterSpacing: "-.015em" }}>
                Her journey from curious to confident
              </h2>
              <p style={{ margin: 0, color: "#5E4B6B", fontSize: "18px" }}>
                Four chapters. One story. She follows Gigi through the changes every girl goes through, at her own pace, earning a badge at every stop.
              </p>
            </div>

            <div style={{ position: "relative" }}>
              <svg className="hn-hide-sm" aria-hidden="true" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, top: "34px", width: "100%", height: "120px", pointerEvents: "none" }}>
                <path d="M40 60 C 200 0, 300 120, 450 60 S 700 0, 800 60 1050 120, 1160 50" stroke="#EBCFD8" strokeWidth="4" fill="none" strokeDasharray="2 14" strokeLinecap="round" />
              </svg>

              <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "22px" }}>
                {/* Chapter 1 */}
                <article className="hn-lift" style={{ background: "#FFFFFF", border: "1.5px solid #C6DFF0", borderRadius: "26px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ background: "#D8ECF8", padding: "22px 22px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#FFFFFF", display: "grid", placeItems: "center" }}>
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#3E7CAD" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
                      </svg>
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "#3E7CAD" }}>Chapter 1</span>
                  </div>
                  <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                    <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: "23px", fontWeight: 600, lineHeight: 1.2 }}>The Moon Inside Me</h3>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#6E5B7A" }}>Understanding Menstruation</div>
                    <p style={{ margin: 0, fontStyle: "italic", color: "#5E4B6B", fontSize: "15px" }}>
                      Gigi wakes up to something new and discovers her body has been preparing for this all along.
                    </p>
                    <ul style={{ margin: "4px 0 0", paddingLeft: "18px", fontSize: "15px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <li>Explain the menstrual cycle in her own words</li>
                      <li>Connect periods to the bigger changes of puberty</li>
                      <li>Know a normal flow, and when to see a doctor</li>
                    </ul>
                    <div style={{ marginTop: "auto", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: 800 }}>
                      <span style={{ color: "#6E5B7A" }}>3 lessons</span>
                      <span style={{ background: "#FFF4C7", borderRadius: "999px", padding: "4px 10px" }}>Badge: Cycle Explorer</span>
                    </div>
                  </div>
                </article>

                {/* Chapter 2 */}
                <article className="hn-lift" style={{ background: "#FFFFFF", border: "1.5px solid #B9E1CF", borderRadius: "26px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ background: "#D4EFE4", padding: "22px 22px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#FFFFFF", display: "grid", placeItems: "center" }}>
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2F8F6B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" />
                        <path d="M5 19l7-7" />
                      </svg>
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "#2F8F6B" }}>Chapter 2</span>
                  </div>
                  <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                    <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: "23px", fontWeight: 600, lineHeight: 1.2 }}>My Care Kit</h3>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#6E5B7A" }}>Menstrual Hygiene</div>
                    <p style={{ margin: 0, fontStyle: "italic", color: "#5E4B6B", fontSize: "15px" }}>
                      Gigi packs her very first period kit and learns that caring for herself is a superpower.
                    </p>
                    <ul style={{ margin: "4px 0 0", paddingLeft: "18px", fontSize: "15px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <li>Build a simple daily hygiene routine</li>
                      <li>Compare pads, cups &amp; period underwear, and their eco-impact</li>
                      <li>Use, dispose and manage periods at school or outside</li>
                    </ul>
                    <div style={{ marginTop: "auto", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: 800 }}>
                      <span style={{ color: "#6E5B7A" }}>4 lessons</span>
                      <span style={{ background: "#FFF4C7", borderRadius: "999px", padding: "4px 10px" }}>Badge: Care Captain</span>
                    </div>
                  </div>
                </article>

                {/* Chapter 3 */}
                <article className="hn-lift" style={{ background: "#FFFFFF", border: "1.5px solid #F7CDAA", borderRadius: "26px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ background: "#FFE3CC", padding: "22px 22px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#FFFFFF", display: "grid", placeItems: "center" }}>
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#C46A2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
                        <path d="M8 11h2l1-2 2 4 1-2h2" />
                      </svg>
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "#B05A20" }}>Chapter 3</span>
                  </div>
                  <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                    <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: "23px", fontWeight: 600, lineHeight: 1.2 }}>Listening to My Body</h3>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#6E5B7A" }}>Discomfort, Disorders &amp; Infections</div>
                    <p style={{ margin: 0, fontStyle: "italic", color: "#5E4B6B", fontSize: "15px" }}>
                      Cramps on sports day? Gigi learns what her body is saying, and when to ask for help.
                    </p>
                    <ul style={{ margin: "4px 0 0", paddingLeft: "18px", fontSize: "15px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <li>Ease cramps with heat, movement and rest</li>
                      <li>Spot signs of PCOS, heavy bleeding and other disorders</li>
                      <li>Prevent infections with everyday habits</li>
                    </ul>
                    <div style={{ marginTop: "auto", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: 800 }}>
                      <span style={{ color: "#6E5B7A" }}>3 lessons</span>
                      <span style={{ background: "#FFF4C7", borderRadius: "999px", padding: "4px 10px" }}>Badge: Body Listener</span>
                    </div>
                  </div>
                </article>

                {/* Chapter 4 */}
                <article className="hn-lift" style={{ background: "#FFFFFF", border: "1.5px solid #D3C6EE", borderRadius: "26px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ background: "#E3DAF5", padding: "22px 22px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#FFFFFF", display: "grid", placeItems: "center" }}>
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#6B4FA0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "#6B4FA0" }}>Chapter 4</span>
                  </div>
                  <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                    <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: "23px", fontWeight: 600, lineHeight: 1.2 }}>Safe, Strong &amp; Me</h3>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#6E5B7A" }}>Safety &amp; Well-being</div>
                    <p style={{ margin: 0, fontStyle: "italic", color: "#5E4B6B", fontSize: "15px" }}>
                      Gigi learns her body belongs to her, her voice matters, and every feeling is welcome.
                    </p>
                    <ul style={{ margin: "4px 0 0", paddingLeft: "18px", fontSize: "15px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <li>Know safe vs unsafe touch, and say "No, Go, Tell"</li>
                      <li>Understand her rights under the POCSO Act</li>
                      <li>Build healthy friendships and manage big emotions</li>
                    </ul>
                    <div style={{ marginTop: "auto", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: 800 }}>
                      <span style={{ color: "#6E5B7A" }}>5 lessons</span>
                      <span style={{ background: "#FFF4C7", borderRadius: "999px", padding: "4px 10px" }}>Badge: Brave Heart</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            {/* Finish Line Certificate Banner */}
            <div style={{ marginTop: "40px", background: "#FFFAF6", border: "2px dashed #EBCFD8", borderRadius: "28px", padding: "28px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "28px" }}>
              <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true" style={{ flex: "none" }}>
                <g transform="translate(60 52)">
                  <ellipse rx="15" ry="26" cy="-22" fill="#F4A3B4" />
                  <ellipse rx="15" ry="26" cy="-22" fill="#F9C2CD" transform="rotate(60)" />
                  <ellipse rx="15" ry="26" cy="-22" fill="#F4A3B4" transform="rotate(120)" />
                  <ellipse rx="15" ry="26" cy="-22" fill="#F9C2CD" transform="rotate(180)" />
                  <ellipse rx="15" ry="26" cy="-22" fill="#F4A3B4" transform="rotate(240)" />
                  <ellipse rx="15" ry="26" cy="-22" fill="#F9C2CD" transform="rotate(300)" />
                  <circle r="12" fill="#FFE08A" />
                </g>
                <path d="M60 78 V 118" stroke="#7FB89A" strokeWidth="5" strokeLinecap="round" />
                <path d="M60 100 C 46 94, 38 100, 36 106 C 46 108, 56 105, 60 100z" fill="#A8D8BE" />
              </svg>
              <div style={{ flex: "1 1 300px", minWidth: 0 }}>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "26px", fontWeight: 700, color: "#2F8F6B" }}>
                  Finish line
                </div>
                <h3 style={{ margin: "0 0 6px", fontFamily: "'Fraunces', serif", fontSize: "26px", fontWeight: 600 }}>
                  A Certificate of Confidence with her name on it
                </h3>
                <p style={{ margin: 0, color: "#5E4B6B" }}>
                  And a girl who knows her body, her rights and her worth.
                </p>
              </div>
              <div style={{ flex: "0 1 300px", background: "#FFFFFF", borderRadius: "16px", border: "6px double #F4C3CC", padding: "18px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", fontWeight: 900, letterSpacing: ".14em", color: "#A8365A" }}>
                  CERTIFICATE OF CONFIDENCE
                </div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "34px", fontWeight: 700, lineHeight: 1.2 }}>
                  [Daughter's name]
                </div>
                <div style={{ fontSize: "12px", color: "#6E5B7A" }}>
                  completed {courseTitle}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. ACTIVITY LEARNING JOURNEY */}
        <section id="preview" style={{ padding: "88px 0", background: "#FDF1F4" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 36px" }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "28px", fontWeight: 700, color: "#C2456A" }}>
                Explore the activity learning journey
              </div>
              <h2 style={{ margin: "4px 0 12px", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(30px, 3.8vw, 48px)", lineHeight: 1.12, letterSpacing: "-.015em" }}>
                Not just videos. A world she'll want to come back to.
              </h2>
              <p style={{ margin: 0, color: "#5E4B6B", fontSize: "18px" }}>
                Every lesson follows one simple rhythm. Try a piece of it right now, free.
              </p>
            </div>

            {/* 4 Rhythm Steps */}
            <ol style={{ listStyle: "none", margin: "0 0 40px", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
              <li style={{ background: "#FFFFFF", borderRadius: "22px", padding: "18px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{ flex: "none", width: "48px", height: "48px", borderRadius: "16px", background: "#D8ECF8", display: "grid", placeItems: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#3E7CAD" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span>
                  <strong style={{ display: "block", fontSize: "17px" }}>1 · Watch</strong>
                  <span style={{ fontSize: "15px", color: "#5E4B6B" }}>A 3 to 6 min animated story with Gigi, in Hinglish.</span>
                </span>
              </li>
              <li style={{ background: "#FFFFFF", borderRadius: "22px", padding: "18px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{ flex: "none", width: "48px", height: "48px", borderRadius: "16px", background: "#D4EFE4", display: "grid", placeItems: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F8F6B" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <rect x="3" y="8" width="18" height="10" rx="5" />
                    <path d="M8 11v4M6 13h4" />
                    <circle cx="16" cy="12" r="0.8" fill="#2F8F6B" />
                    <circle cx="18" cy="14" r="0.8" fill="#2F8F6B" />
                  </svg>
                </span>
                <span>
                  <strong style={{ display: "block", fontSize: "17px" }}>2 · Play</strong>
                  <span style={{ fontSize: "15px", color: "#5E4B6B" }}>A game or hands-on activity that turns ideas into action.</span>
                </span>
              </li>
              <li style={{ background: "#FFFFFF", borderRadius: "22px", padding: "18px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{ flex: "none", width: "48px", height: "48px", borderRadius: "16px", background: "#FFF4C7", display: "grid", placeItems: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A97C10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
                  </svg>
                </span>
                <span>
                  <strong style={{ display: "block", fontSize: "17px" }}>3 · Discover</strong>
                  <span style={{ fontSize: "15px", color: "#5E4B6B" }}>A myth-buster or science fact card, doctor reviewed.</span>
                </span>
              </li>
              <li style={{ background: "#FFFFFF", borderRadius: "22px", padding: "18px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{ flex: "none", width: "48px", height: "48px", borderRadius: "16px", background: "#E3DAF5", display: "grid", placeItems: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B4FA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
                  </svg>
                </span>
                <span>
                  <strong style={{ display: "block", fontSize: "17px" }}>4 · Reflect</strong>
                  <span style={{ fontSize: "15px", color: "#5E4B6B" }}>A private journal prompt and a quick quiz to unlock what's next.</span>
                </span>
              </li>
            </ol>

            {/* Video Player + Try-It-Now Section */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "28px", alignItems: "stretch" }}>
              {/* Left Column: Preview Player */}
              <div style={{ flex: "1 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ position: "relative", aspectRatio: "16 / 9", background: "#D8ECF8", borderRadius: "28px", overflow: "hidden", border: "6px solid #FFFFFF", boxShadow: "0 20px 44px rgba(61,44,74,.12)" }}>
                  {!isPlayingPreview ? (
                    <>
                      <svg viewBox="0 0 640 360" width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
                        <rect width="640" height="360" fill="#D8ECF8" />
                        <g transform="translate(470 190)">
                          <path d="M0 -110 A110 110 0 0 1 110 0 L0 0z" fill="#F9D5D3" />
                          <path d="M110 0 A110 110 0 0 1 0 110 L0 0z" fill="#D4EFE4" />
                          <path d="M0 110 A110 110 0 0 1 -110 0 L0 0z" fill="#FFF4C7" />
                          <path d="M-110 0 A110 110 0 0 1 0 -110 L0 0z" fill="#E3DAF5" />
                          <circle r="44" fill="#FFFAF6" />
                          <path d="M14 -14a22 22 0 1 0 16 28 18 18 0 1 1-16-28z" fill="#3D2C4A" opacity="0.85" />
                        </g>
                        <circle cx="80" cy="60" r="4" fill="#FFFFFF" />
                        <circle cx="560" cy="40" r="3" fill="#FFFFFF" />
                        <circle cx="330" cy="320" r="5" fill="#FFFFFF" />
                      </svg>
                      <div style={{ position: "absolute", left: "28px", top: "26px", maxWidth: "56%" }}>
                        <span style={{ display: "inline-block", background: "#FFFFFF", borderRadius: "999px", padding: "4px 12px", fontSize: "13px", fontWeight: 800 }}>
                          Free preview · 1:00 · Lesson 1.1
                        </span>
                        <div style={{ marginTop: "12px", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(22px, 2.6vw, 34px)", lineHeight: 1.1 }}>
                          What is a period, really?
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPlayingPreview(true)}
                        aria-label="Play the free 1-minute preview"
                        style={{ position: "absolute", left: "28px", bottom: "26px", width: "76px", height: "76px", borderRadius: "50%", border: "none", background: "#C2456A", color: "#FFFFFF", display: "grid", placeItems: "center", boxShadow: "0 12px 30px rgba(194,69,106,.35)" }}
                      >
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div className="hn-pop" style={{ position: "absolute", inset: 0, background: "#3D2C4A", color: "#FFFAF6", padding: "28px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: ".1em", color: "#F9D5D3" }}>
                        PREVIEW VIDEO EMBED
                      </div>
                      <div style={{ fontFamily: "'Fraunces', serif", fontSize: "24px", lineHeight: 1.3 }}>
                        "Hi! I'm Gigi. Aaj hum tumhari body ka ek bahut cool secret unlock karenge!"
                      </div>
                      <div style={{ fontSize: "14px", opacity: 0.8 }}>
                        0:00 Gigi waves · 0:08 the uterus as a cozy room · 0:22 the moon-cycle calendar · 0:38 myth-buster · 0:50 cycle-wheel game teaser
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPlayingPreview(false)}
                        style={{ alignSelf: "flex-start", marginTop: "6px", minHeight: "44px", padding: "0 18px", borderRadius: "999px", border: "2px solid #FFFAF6", background: "transparent", color: "#FFFAF6", fontWeight: 800 }}
                      >
                        Close preview
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "8px", fontSize: "14px", fontWeight: 700, color: "#5E4B6B" }}>
                  <span>Hinglish video · English captions &amp; activities</span>
                  <span style={{ fontFamily: "'Caveat', cursive", fontSize: "22px", color: "#A8365A" }}>
                    Watch it together, it's made for both of you
                  </span>
                </div>
              </div>

              {/* Right Column: Try-it-now Demos */}
              <div style={{ flex: "1 1 400px", minWidth: 0, background: "#FFFFFF", borderRadius: "28px", padding: "24px", boxShadow: "0 20px 44px rgba(61,44,74,.08)", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: "24px", fontWeight: 600 }}>
                    Try it now: pick one to play
                  </div>
                  <div style={{ fontSize: "14px", color: "#6E5B7A" }}>
                    Three of the [40+] activities inside the course.
                  </div>
                </div>

                {/* Tab buttons */}
                <div role="tablist" aria-label="Demo activities" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {[
                    { id: "myth", label: "Myth or Fact?" },
                    { id: "kit", label: "Pack her period kit" },
                    { id: "safe", label: "Safe circle" },
                  ].map((t) => {
                    const sel = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={sel}
                        onClick={() => setActiveTab(t.id as any)}
                        style={{
                          minHeight: "44px",
                          padding: "0 16px",
                          borderRadius: "999px",
                          border: "1.5px solid",
                          fontWeight: 800,
                          fontSize: "14px",
                          background: sel ? "#3D2C4A" : "#FFFFFF",
                          color: sel ? "#FFFAF6" : "#3D2C4A",
                          borderColor: sel ? "#3D2C4A" : "#E9DDE6",
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab 1: Myth or Fact */}
                {activeTab === "myth" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
                    {!mythDone ? (
                      <>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#6E5B7A" }}>
                          Card {mythIndex + 1} of 5 · Score {mythScore}
                        </div>
                        <div style={{ background: "#FFF4C7", borderRadius: "22px", padding: "22px", minHeight: "120px", display: "flex", alignItems: "center", fontFamily: "'Fraunces', serif", fontSize: "22px", lineHeight: 1.3 }}>
                          "{curMyth.q}"
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
                          <button
                            type="button"
                            onClick={() => handleMythChoice("myth")}
                            style={{
                              minHeight: "52px",
                              borderRadius: "16px",
                              border: "2px solid #E8738A",
                              fontWeight: 900,
                              fontSize: "17px",
                              background: !mythAnswered
                                ? "#FDEFF0"
                                : curMyth.a === "myth"
                                ? "#2F8F6B"
                                : mythAns === "myth"
                                ? "#F3EFF6"
                                : "#FFFFFF",
                              color: !mythAnswered
                                ? "#3D2C4A"
                                : curMyth.a === "myth"
                                ? "#FFFFFF"
                                : "#8A7896",
                              borderColor: !mythAnswered
                                ? "#E8738A"
                                : curMyth.a === "myth"
                                ? "#2F8F6B"
                                : "#D9CFE0",
                            }}
                          >
                            Myth
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMythChoice("fact")}
                            style={{
                              minHeight: "52px",
                              borderRadius: "16px",
                              border: "2px solid #5FB28C",
                              fontWeight: 900,
                              fontSize: "17px",
                              background: !mythAnswered
                                ? "#EAF7F1"
                                : curMyth.a === "fact"
                                ? "#2F8F6B"
                                : mythAns === "fact"
                                ? "#F3EFF6"
                                : "#FFFFFF",
                              color: !mythAnswered
                                ? "#3D2C4A"
                                : curMyth.a === "fact"
                                ? "#FFFFFF"
                                : "#8A7896",
                              borderColor: !mythAnswered
                                ? "#5FB28C"
                                : curMyth.a === "fact"
                                ? "#2F8F6B"
                                : "#D9CFE0",
                            }}
                          >
                            Fact
                          </button>
                        </div>
                        {mythAnswered && (
                          <div className="hn-pop" style={{ background: "#FFFAF6", border: "1px solid #F1E4E8", borderRadius: "18px", padding: "14px 16px", fontSize: "15px" }}>
                            <strong>{mythCorrect ? "Correct!" : "Not quite."}</strong>{" "}
                            {curMyth.a === "myth" ? "It's a myth." : "It's a fact."}{" "}
                            {curMyth.why}
                            <div style={{ marginTop: "10px" }}>
                              <button
                                type="button"
                                onClick={handleNextMyth}
                                style={{ minHeight: "44px", padding: "0 18px", borderRadius: "999px", border: "none", background: "#3D2C4A", color: "#FFFAF6", fontWeight: 800 }}
                              >
                                {mythIndex < myths.length - 1 ? "Next card →" : "See my score"}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="hn-pop" style={{ textAlign: "center", background: "#D4EFE4", borderRadius: "22px", padding: "26px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="#F2B544" aria-hidden="true">
                          <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
                        </svg>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: "30px", fontWeight: 600 }}>
                          {mythScore}/5
                        </div>
                        <div style={{ fontWeight: 800 }}>
                          {mythScore >= 4
                            ? "You're a natural Myth Buster!"
                            : mythScore >= 2
                            ? "Nice work. A few more myths to bust inside!"
                            : "Myths are tricky. That is exactly why this course exists."}
                        </div>
                        <div style={{ fontSize: "14px", color: "#3F5E50" }}>
                          Inside the course she unlocks the Myth Buster badge.
                        </div>
                        <button
                          type="button"
                          onClick={handleRestartMyth}
                          style={{ marginTop: "6px", minHeight: "44px", padding: "0 18px", borderRadius: "999px", border: "2px solid #3D2C4A", background: "#FFFFFF", color: "#3D2C4A", fontWeight: 800 }}
                        >
                          Play again
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Period Kit */}
                {activeTab === "kit" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ fontSize: "15px" }}>
                      Tap what belongs in her school period pouch.{" "}
                      <strong>{packedEssentialCount}/5 essentials packed</strong>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                      {kitItems.map((it) => {
                        const picked = !!kitState[it.id];
                        let bg = "#FFFFFF";
                        let color = "#3D2C4A";
                        let border = "#E9DDE6";
                        let mark = "+";
                        if (picked && it.need) {
                          bg = "#D4EFE4";
                          color = "#1F5A45";
                          border = "#5FB28C";
                          mark = "✓";
                        }
                        if (picked && !it.need) {
                          bg = "#FFE3CC";
                          color = "#7A3F14";
                          border = "#F0AF7E";
                          mark = "×";
                        }
                        return (
                          <button
                            key={it.id}
                            type="button"
                            onClick={() => toggleKitItem(it)}
                            aria-pressed={picked}
                            style={{
                              minHeight: "48px",
                              borderRadius: "14px",
                              border: `1.5px solid ${border}`,
                              background: bg,
                              color: color,
                              fontWeight: 800,
                              fontSize: "15px",
                              textAlign: "left",
                              padding: "0 14px",
                            }}
                          >
                            {mark} {it.label}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ background: "#FFFAF6", border: "1px solid #F1E4E8", borderRadius: "16px", padding: "12px 14px", fontSize: "15px", minHeight: "48px" }}>
                      {packedEssentialCount === 5
                        ? "All 5 essentials packed! Care Captain in the making."
                        : kitMsg}
                    </div>
                  </div>
                )}

                {/* Tab 3: Safe Circle */}
                {activeTab === "safe" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ fontSize: "15px" }}>
                      Is it OK, or is it time to say <strong>No, Go, Tell</strong>?
                    </div>
                    {scenarios.map((sc, i) => {
                      const ans = safeAnswers[i];
                      const has = ans !== undefined;
                      const right = has && ans === sc.a;
                      return (
                        <div key={i} style={{ background: "#FFFAF6", border: "1px solid #F1E4E8", borderRadius: "16px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ fontSize: "15px", fontWeight: 700 }}>{sc.q}</div>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              onClick={() => setSafeAnswers((prev) => ({ ...prev, [i]: "ok" }))}
                              style={{
                                minHeight: "44px",
                                padding: "0 14px",
                                borderRadius: "999px",
                                border: "1.5px solid #5FB28C",
                                fontWeight: 800,
                                fontSize: "14px",
                                background: ans === "ok" ? "#3D2C4A" : "#FFFFFF",
                                color: ans === "ok" ? "#FFFAF6" : "#3D2C4A",
                              }}
                            >
                              It's OK
                            </button>
                            <button
                              type="button"
                              onClick={() => setSafeAnswers((prev) => ({ ...prev, [i]: "no" }))}
                              style={{
                                minHeight: "44px",
                                padding: "0 14px",
                                borderRadius: "999px",
                                border: "1.5px solid #A992D6",
                                fontWeight: 800,
                                fontSize: "14px",
                                background: ans === "no" ? "#3D2C4A" : "#FFFFFF",
                                color: ans === "no" ? "#FFFAF6" : "#3D2C4A",
                              }}
                            >
                              No, Go, Tell
                            </button>
                          </div>
                          {has && (
                            <div className="hn-pop" style={{ fontSize: "14px", color: "#4A3A57" }}>
                              <strong>{right ? "Well spotted." : "Good to think again."}</strong>{" "}
                              {sc.why}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <a href="#pricing" style={{ marginTop: "auto", fontWeight: 800, fontSize: "15px" }}>
                  Liked that? There are [40+] more inside →
                </a>
              </div>
            </div>

            {/* App Showcase Preview Phones */}
            <div style={{ marginTop: "56px", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 6px", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(24px, 2.6vw, 32px)" }}>
                A peek inside her learning space
              </h3>
              <p style={{ margin: "0 0 28px", color: "#5E4B6B" }}>
                Her own garden grows with every lesson she completes.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "28px" }}>
                {/* Phone 1: Bloom Garden */}
                <figure style={{ margin: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "236px", height: "470px", borderRadius: "36px", background: "#3D2C4A", padding: "10px", boxShadow: "0 24px 50px rgba(61,44,74,.18)", transform: "rotate(-3deg)" }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: "28px", background: "#FFFAF6", padding: "18px 14px", display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", overflow: "hidden" }}>
                      <div style={{ fontSize: "12px", fontWeight: 800, color: "#6E5B7A" }}>Hi Aanya</div>
                      <div style={{ fontFamily: "'Fraunces', serif", fontSize: "19px", fontWeight: 600, lineHeight: 1.2 }}>Your Bloom Garden</div>
                      <div style={{ background: "#D4EFE4", borderRadius: "18px", height: "150px", position: "relative", overflow: "hidden" }}>
                        <svg viewBox="0 0 200 150" width="100%" height="100%" aria-hidden="true">
                          <rect y="110" width="200" height="40" fill="#A8D8BE" />
                          <g transform="translate(40 80)">
                            <path d="M0 30V0" stroke="#5FA27F" strokeWidth="3" />
                            <circle r="12" fill="#D8ECF8" />
                            <circle r="5" fill="#FFE08A" />
                          </g>
                          <g transform="translate(90 70)">
                            <path d="M0 40V0" stroke="#5FA27F" strokeWidth="3" />
                            <circle r="14" fill="#F9D5D3" />
                            <circle r="6" fill="#FFE08A" />
                          </g>
                          <g transform="translate(140 84)">
                            <path d="M0 26V0" stroke="#5FA27F" strokeWidth="3" />
                            <path d="M0 -14 C 8 -6, 8 6, 0 10 C -8 6, -8 -6, 0 -14z" fill="#F7CDAA" />
                          </g>
                          <g transform="translate(176 104)">
                            <path d="M0 6V0" stroke="#5FA27F" strokeWidth="3" />
                            <circle cy="-2" r="4" fill="#7FB89A" />
                          </g>
                        </svg>
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 800 }}>7 of 15 lessons · 340 petals</div>
                      <div style={{ height: "8px", background: "#F1E4E8", borderRadius: "99px" }}>
                        <div style={{ width: "47%", height: "100%", background: "#E8738A", borderRadius: "99px" }} />
                      </div>
                      <div style={{ background: "#FFFFFF", border: "1px solid #F1E4E8", borderRadius: "14px", padding: "10px", fontSize: "12px" }}>
                        <strong style={{ display: "block" }}>Next up · 3.1</strong>Understanding discomfort
                      </div>
                    </div>
                  </div>
                  <figcaption style={{ fontSize: "14px", fontWeight: 800 }}>Journey &amp; garden</figcaption>
                </figure>

                {/* Phone 2: Badges & Streaks */}
                <figure style={{ margin: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "236px", height: "470px", borderRadius: "36px", background: "#3D2C4A", padding: "10px", boxShadow: "0 24px 50px rgba(61,44,74,.18)", marginTop: "24px" }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: "28px", background: "#FFFAF6", padding: "18px 14px", display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", overflow: "hidden" }}>
                      <div style={{ fontFamily: "'Fraunces', serif", fontSize: "19px", fontWeight: 600 }}>My badges</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                        <div style={{ background: "#D8ECF8", borderRadius: "14px", padding: "10px 6px", textAlign: "center", fontSize: "11px", fontWeight: 800 }}>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3E7CAD" strokeWidth="2" aria-hidden="true" style={{ margin: "0 auto" }}>
                            <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
                          </svg>
                          Cycle Explorer
                        </div>
                        <div style={{ background: "#D4EFE4", borderRadius: "14px", padding: "10px 6px", textAlign: "center", fontSize: "11px", fontWeight: 800 }}>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2F8F6B" strokeWidth="2" aria-hidden="true" style={{ margin: "0 auto" }}>
                            <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" />
                          </svg>
                          Care Captain
                        </div>
                        <div style={{ background: "#FFF4C7", borderRadius: "14px", padding: "10px 6px", textAlign: "center", fontSize: "11px", fontWeight: 800 }}>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="#F2B544" aria-hidden="true" style={{ margin: "0 auto" }}>
                            <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
                          </svg>
                          Myth Buster
                        </div>
                        <div style={{ background: "#F9D5D3", borderRadius: "14px", padding: "10px 6px", textAlign: "center", fontSize: "11px", fontWeight: 800 }}>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C2456A" strokeWidth="2" aria-hidden="true" style={{ margin: "0 auto" }}>
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" />
                          </svg>
                          7-day streak
                        </div>
                      </div>
                      <div style={{ background: "#FFFFFF", border: "1px solid #F1E4E8", borderRadius: "14px", padding: "10px", fontSize: "12px" }}>
                        <strong>2 more</strong> to your Certificate of Confidence
                      </div>
                    </div>
                  </div>
                  <figcaption style={{ fontSize: "14px", fontWeight: 800 }}>Badges &amp; streaks</figcaption>
                </figure>

                {/* Phone 3: Cycle Diary */}
                <figure style={{ margin: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "236px", height: "470px", borderRadius: "36px", background: "#3D2C4A", padding: "10px", boxShadow: "0 24px 50px rgba(61,44,74,.18)", transform: "rotate(3deg)" }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: "28px", background: "#FFFAF6", padding: "18px 14px", display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", overflow: "hidden" }}>
                      <div style={{ fontFamily: "'Fraunces', serif", fontSize: "19px", fontWeight: 600 }}>My Cycle Diary</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "4px", fontSize: "10px", fontWeight: 800, textAlign: "center" }}>
                        <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                        <span style={{ background: "#F1E4E8", borderRadius: "8px", padding: "5px 0" }}>1</span>
                        <span style={{ background: "#F1E4E8", borderRadius: "8px", padding: "5px 0" }}>2</span>
                        <span style={{ background: "#F4A3B4", borderRadius: "8px", padding: "5px 0" }}>3</span>
                        <span style={{ background: "#F4A3B4", borderRadius: "8px", padding: "5px 0" }}>4</span>
                        <span style={{ background: "#F4A3B4", borderRadius: "8px", padding: "5px 0" }}>5</span>
                        <span style={{ background: "#F9D5D3", borderRadius: "8px", padding: "5px 0" }}>6</span>
                        <span style={{ background: "#F1E4E8", borderRadius: "8px", padding: "5px 0" }}>7</span>
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 800 }}>How do you feel today?</div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{ background: "#FFF4C7", borderRadius: "99px", padding: "4px 10px", fontSize: "11px", fontWeight: 800 }}>Happy</span>
                        <span style={{ background: "#E3DAF5", borderRadius: "99px", padding: "4px 10px", fontSize: "11px", fontWeight: 800, outline: "2px solid #A992D6" }}>Tired</span>
                        <span style={{ background: "#FFE3CC", borderRadius: "99px", padding: "4px 10px", fontSize: "11px", fontWeight: 800 }}>Crampy</span>
                      </div>
                      <div style={{ background: "#D4EFE4", borderRadius: "14px", padding: "10px", fontSize: "12px" }}>
                        <strong style={{ display: "block" }}>Gigi's tip</strong>A warm water bottle and a short stretch can help today.
                      </div>
                    </div>
                  </div>
                  <figcaption style={{ fontSize: "14px", fontWeight: 800 }}>Cycle &amp; mood diary</figcaption>
                </figure>
              </div>
            </div>

            {/* Feature Tags List */}
            <div style={{ marginTop: "36px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px" }}>
              {[
                "Animated stories", "Swipe games", "Drag & drop", "Quizzes",
                "Private journal", "Myth busters", "Cycle tracker", "Badges & streaks",
                "Parent conversation cards", "Worksheets"
              ].map((pill, idx) => (
                <span key={idx} style={{ background: "#FFFFFF", border: "1px solid #F1E4E8", borderRadius: "999px", padding: "6px 14px", fontSize: "14px", fontWeight: 700 }}>
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 8. DID YOU KNOW (3D Flip Cards) */}
        <section style={{ padding: "88px 0" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px", marginBottom: "32px" }}>
              <div style={{ maxWidth: "640px" }}>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "28px", fontWeight: 700, color: "#C2456A" }}>
                  Did you know?
                </div>
                <h2 style={{ margin: "4px 0 0", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(30px, 3.8vw, 48px)", lineHeight: 1.12, letterSpacing: "-.015em" }}>
                  Science she'll love. Facts you'll wish you'd known.
                </h2>
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#6E5B7A" }}>
                Tap a card to flip it
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
              {factData.map((f, i) => {
                const isFlipped = !!flippedCards[i];
                return (
                  <button
                    key={i}
                    type="button"
                    className="hn-flip"
                    onClick={() => setFlippedCards((prev) => ({ ...prev, [i]: !prev[i] }))}
                    aria-pressed={isFlipped}
                    style={{ border: "none", background: "transparent", padding: 0, display: "block", width: "100%" }}
                  >
                    <span className={`hn-flip-inner ${isFlipped ? "on" : ""}`}>
                      <span className="hn-face" style={{ background: f.bg, justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", fontWeight: 900, letterSpacing: ".1em", color: "#6E5B7A" }}>
                          FACT {i + 1}
                        </span>
                        <span style={{ fontFamily: "'Fraunces', serif", fontSize: "23px", fontWeight: 600, lineHeight: 1.2, color: "#3D2C4A" }}>
                          {f.q}
                        </span>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: "#A8365A" }}>
                          Tap to reveal →
                        </span>
                      </span>
                      <span className="hn-face back" style={{ background: "#3D2C4A", color: "#FFFAF6", justifyContent: "center", gap: "10px" }}>
                        <span style={{ fontFamily: "'Fraunces', serif", fontSize: "22px", fontWeight: 600, color: "#FFE3CC" }}>
                          {f.big}
                        </span>
                        <span style={{ fontSize: "15px", lineHeight: 1.5 }}>{f.a}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p style={{ margin: "20px 0 0", fontSize: "14px", color: "#6E5B7A", textAlign: "center" }}>
              Every lesson includes a Discover card like these, reviewed by our medical panel.
            </p>
          </div>
        </section>

        {/* 9. LEARN TOGETHER */}
        <section style={{ padding: "88px 0", background: "#FFFFFF" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 40px" }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "28px", fontWeight: 700, color: "#C2456A" }}>
                Learn together
              </div>
              <h2 style={{ margin: "4px 0 0", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(30px, 3.8vw, 48px)", lineHeight: 1.12, letterSpacing: "-.015em" }}>
                Made for her. Made for you. Made for the two of you.
              </h2>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "stretch" }}>
              {/* For Her */}
              <div style={{ flex: "1 1 320px", minWidth: 0, background: "#FDEFF0", borderRadius: "28px", padding: "30px" }}>
                <div style={{ fontSize: "13px", fontWeight: 900, letterSpacing: ".1em", color: "#A8365A" }}>
                  FOR HER
                </div>
                <h3 style={{ margin: "6px 0 14px", fontFamily: "'Fraunces', serif", fontSize: "26px", fontWeight: 600 }}>
                  A space that feels like hers
                </h3>
                <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <li>Animated story lessons with Gigi, in Hinglish</li>
                  <li>Games, quizzes, badges and her own Bloom Garden</li>
                  <li>A private journal and cycle &amp; mood diary</li>
                  <li>Learn at her pace, rewatch any time</li>
                  <li>A Certificate of Confidence at the end</li>
                </ul>
              </div>

              {/* Together */}
              <div style={{ flex: "0 1 260px", minWidth: 0, background: "#FFF4C7", borderRadius: "28px", padding: "30px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: "10px" }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#E8738A" aria-hidden="true">
                  <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
                </svg>
                <div style={{ fontSize: "13px", fontWeight: 900, letterSpacing: ".1em", color: "#8A6410" }}>
                  TOGETHER
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: "22px", fontWeight: 600, lineHeight: 1.25 }}>
                  Kitchen Table Talks
                </div>
                <div style={{ fontSize: "15px" }}>
                  One 10-minute activity per module that you do side by side.
                </div>
              </div>

              {/* For You */}
              <div style={{ flex: "1 1 320px", minWidth: 0, background: "#F1ECFA", borderRadius: "28px", padding: "30px" }}>
                <div style={{ fontSize: "13px", fontWeight: 900, letterSpacing: ".1em", color: "#6B4FA0" }}>
                  FOR YOU
                </div>
                <h3 style={{ margin: "6px 0 14px", fontFamily: "'Fraunces', serif", fontSize: "26px", fontWeight: 600 }}>
                  The words, and the confidence
                </h3>
                <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <li>A Parent Companion Guide for each module</li>
                  <li>Conversation starter cards: 3 questions after each module</li>
                  <li>Progress view: lessons, quiz scores, badges (her journal stays private)</li>
                  <li>Signs to watch for, and when to see a doctor</li>
                  <li>Direct help from the Infano support team</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 10. CURRICULUM */}
        <section id="curriculum" style={{ padding: "88px 0" }}>
          <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "28px", fontWeight: 700, color: "#C2456A" }}>
                Full curriculum
              </div>
              <h2 style={{ margin: "4px 0 10px", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(30px, 3.8vw, 48px)", lineHeight: 1.12, letterSpacing: "-.015em" }}>
                Everything inside the course
              </h2>
              <p style={{ margin: 0, color: "#5E4B6B", fontWeight: 700 }}>
                {totalModulesCount} modules · {totalChaptersCount} lessons · {courseDurationText} of content · [40+] activities · assessments
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {courseModules.map((md: any, i: number) => {
                const isOpen = openMod === i;
                return (
                  <div key={i} style={{ background: "#FFFFFF", borderRadius: "22px", border: `1.5px solid ${md.border}`, overflow: "hidden" }}>
                    <button
                      type="button"
                      onClick={() => setOpenMod(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      style={{ width: "100%", minHeight: "72px", padding: "16px 20px", border: "none", background: md.headBg, display: "flex", alignItems: "center", gap: "14px", textAlign: "left", color: "#3D2C4A" }}
                    >
                      <span style={{ flex: "none", width: "40px", height: "40px", borderRadius: "12px", background: "#FFFFFF", display: "grid", placeItems: "center", fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "18px" }}>
                        {i + 1}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontFamily: "'Fraunces', serif", fontSize: "20px", fontWeight: 600, lineHeight: 1.25 }}>
                          {md.title}
                        </span>
                        <span style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#5E4B6B" }}>
                          {md.meta}
                        </span>
                      </span>
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        aria-hidden="true"
                        style={{ flex: "none", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .25s" }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>

                    {isOpen && (
                      <div className="hn-pop" style={{ padding: "6px 20px 18px" }}>
                        {md.lessons.map((ls: any, idx: number) => (
                          <div key={idx} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 14px", padding: "12px 0", borderBottom: "1px solid #F3E9EE" }}>
                            <span style={{ flex: "none", width: "30px", height: "30px", borderRadius: "50%", background: "#FFFAF6", border: "1px solid #F1E4E8", display: "grid", placeItems: "center" }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="#3D2C4A" aria-hidden="true">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </span>
                            <span style={{ flex: "1 1 220px", minWidth: 0, fontWeight: 700 }}>
                              {ls.t}
                            </span>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#4A3A57", background: "#FFF8E1", borderRadius: "999px", padding: "3px 10px" }}>
                              Activity: {ls.act}
                            </span>
                            {ls.free && (
                              <span style={{ fontSize: "12px", fontWeight: 900, color: "#FFFFFF", background: "#2F8F6B", borderRadius: "999px", padding: "3px 10px" }}>
                                Free preview
                              </span>
                            )}
                          </div>
                        ))}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "14px", fontWeight: 800, fontSize: "15px" }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A8365A" strokeWidth="2" aria-hidden="true">
                            <circle cx="12" cy="9" r="6" />
                            <path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7" />
                          </svg>
                          {md.assess}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 11. INSTRUCTORS */}
        <section id="experts" style={{ padding: "88px 0", background: "#FFFFFF" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 40px" }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "28px", fontWeight: 700, color: "#C2456A" }}>
                Meet your instructors
              </div>
              <h2 style={{ margin: "4px 0 0", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(30px, 3.8vw, 48px)", lineHeight: 1.12, letterSpacing: "-.015em" }}>
                Guided by experts who are also mothers, sisters and mentors
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "22px" }}>
              {/* Dynamic or Default Instructor 1 */}
              <article className="hn-lift" style={{ background: "#FFFAF6", border: "1px solid #F1E4E8", borderRadius: "28px", padding: "26px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {course?.instructor?.avatarUrl ? (
                    <img
                      src={course.instructor.avatarUrl}
                      alt={course.instructor.name || "Instructor"}
                      style={{ width: "104px", height: "104px", borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <svg width="104" height="104" viewBox="0 0 104 104" role="img" aria-label="Dr. Meera Iyer">
                      <path d="M52 4c26 0 48 18 48 46s-20 50-48 50S4 80 4 52 26 4 52 4z" fill="#D8ECF8" />
                      <circle cx="52" cy="44" r="18" fill="#C98B67" />
                      <path d="M33 44c0-14 9-22 19-22s19 8 19 22c-4-6-10-10-19-10s-15 4-19 10z" fill="#3D2C4A" />
                      <path d="M22 96c4-18 16-26 30-26s26 8 30 26z" fill="#FFFFFF" />
                      <path d="M44 74c0 8 4 12 8 12s8-4 8-12" stroke="#7FB0D8" strokeWidth="3" fill="none" />
                    </svg>
                  )}
                  <span style={{ fontSize: "11px", fontWeight: 900, letterSpacing: ".08em", color: "#8A6410", background: "#FFF4C7", borderRadius: "999px", padding: "4px 10px" }}>
                    LEAD FACULTY
                  </span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: "24px", fontWeight: 600 }}>
                    {course?.instructor?.name || "Dr. Meera Iyer"}
                  </h3>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#5E4B6B" }}>
                    {course?.instructor?.designation || "MBBS, MD (Obstetrics & Gynaecology) · 15 yrs"}
                  </div>
                </div>
                <p style={{ margin: 0, fontFamily: "'Caveat', cursive", fontSize: "24px", lineHeight: 1.2, color: "#A8365A" }}>
                  "I wish someone had told me this at 11. Now I get to tell your daughter."
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "auto" }}>
                  <span style={{ background: "#D8ECF8", borderRadius: "999px", padding: "3px 10px", fontSize: "12px", fontWeight: 800 }}>Module 1</span>
                  <span style={{ background: "#FFE3CC", borderRadius: "999px", padding: "3px 10px", fontSize: "12px", fontWeight: 800 }}>Module 3</span>
                </div>
                <a href="#experts" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "15px", minHeight: "44px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch her 30-sec hello
                </a>
              </article>

              {/* Instructor 2 */}
              <article className="hn-lift" style={{ background: "#FFFAF6", border: "1px solid #F1E4E8", borderRadius: "28px", padding: "26px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <svg width="104" height="104" viewBox="0 0 104 104" role="img" aria-label="Riya Kapoor">
                    <path d="M52 4c26 0 48 18 48 46s-20 50-48 50S4 80 4 52 26 4 52 4z" fill="#D4EFE4" />
                    <circle cx="34" cy="38" r="10" fill="#3D2C4A" />
                    <circle cx="70" cy="38" r="10" fill="#3D2C4A" />
                    <circle cx="52" cy="30" r="12" fill="#3D2C4A" />
                    <circle cx="52" cy="46" r="17" fill="#B9785A" />
                    <path d="M22 96c4-18 16-26 30-26s26 8 30 26z" fill="#E8738A" />
                  </svg>
                  <span style={{ fontSize: "11px", fontWeight: 900, letterSpacing: ".08em", color: "#8A6410", background: "#FFF4C7", borderRadius: "999px", padding: "4px 10px" }}>
                    EDUCATOR
                  </span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: "24px", fontWeight: 600 }}>Riya Kapoor</h3>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#5E4B6B" }}>
                    Adolescent Health Educator · 9 yrs · [5,000+] girls taught
                  </div>
                </div>
                <p style={{ margin: 0, fontFamily: "'Caveat', cursive", fontSize: "24px", lineHeight: 1.2, color: "#A8365A" }}>
                  "Every question is a good question. No giggles, no shame."
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "auto" }}>
                  <span style={{ background: "#D4EFE4", borderRadius: "999px", padding: "3px 10px", fontSize: "12px", fontWeight: 800 }}>Module 2</span>
                  <span style={{ background: "#F1E4E8", borderRadius: "999px", padding: "3px 10px", fontSize: "12px", fontWeight: 800 }}>Journey host</span>
                </div>
                <a href="#experts" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "15px", minHeight: "44px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch her 30-sec hello
                </a>
              </article>

              {/* Instructor 3 */}
              <article className="hn-lift" style={{ background: "#FFFAF6", border: "1px solid #F1E4E8", borderRadius: "28px", padding: "26px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <svg width="104" height="104" viewBox="0 0 104 104" role="img" aria-label="Dr. Sana Qureshi">
                    <path d="M52 4c26 0 48 18 48 46s-20 50-48 50S4 80 4 52 26 4 52 4z" fill="#E3DAF5" />
                    <path d="M32 46c0-16 9-26 20-26s20 10 20 26v30h-8V50H40v26h-8z" fill="#3D2C4A" />
                    <circle cx="52" cy="46" r="16" fill="#D59C78" />
                    <path d="M22 96c4-18 16-26 30-26s26 8 30 26z" fill="#FFE3CC" />
                  </svg>
                  <span style={{ fontSize: "11px", fontWeight: 900, letterSpacing: ".08em", color: "#8A6410", background: "#FFF4C7", borderRadius: "999px", padding: "4px 10px" }}>
                    PSYCHOLOGIST
                  </span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: "24px", fontWeight: 600 }}>Dr. Sana Qureshi</h3>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#5E4B6B" }}>
                    Child &amp; Adolescent Psychologist · 12 yrs
                  </div>
                </div>
                <p style={{ margin: 0, fontFamily: "'Caveat', cursive", fontSize: "24px", lineHeight: 1.2, color: "#A8365A" }}>
                  "Safety isn't about fear. It's about knowing your voice matters."
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "auto" }}>
                  <span style={{ background: "#E3DAF5", borderRadius: "999px", padding: "3px 10px", fontSize: "12px", fontWeight: 800 }}>Module 4</span>
                </div>
                <a href="#experts" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "15px", minHeight: "44px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch her 30-sec hello
                </a>
              </article>
            </div>

            <div style={{ marginTop: "28px", background: "#FFFAF6", border: "1px solid #F1E4E8", borderRadius: "22px", padding: "18px 22px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px 24px" }}>
              <strong style={{ fontSize: "15px" }}>Every lesson is reviewed by:</strong>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 700 }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#D8ECF8" }} />
                Paediatrician
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 700 }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#D4EFE4" }} />
                Nutritionist
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 700 }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#E3DAF5" }} />
                Child-rights lawyer
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 700 }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#FFE3CC" }} />
                School counsellor
              </span>
            </div>
          </div>
        </section>

        {/* 12. VOICES / TESTIMONIALS */}
        <section style={{ padding: "88px 0" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px", marginBottom: "32px" }}>
              <div style={{ maxWidth: "640px" }}>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "28px", fontWeight: 700, color: "#C2456A" }}>
                  Parent &amp; girl voices
                </div>
                <h2 style={{ margin: "4px 0 0", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(30px, 3.8vw, 48px)", lineHeight: 1.12, letterSpacing: "-.015em" }}>
                  Families who started the conversation
                </h2>
              </div>
              <div style={{ background: "#FFFFFF", border: "1px solid #F1E4E8", borderRadius: "18px", padding: "12px 18px", fontWeight: 800 }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: "28px" }}>[4.9]</span> / 5 · from [1,200] parents
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px" }}>
              <figure style={{ margin: 0, background: "#FFFFFF", border: "1px solid #F1E4E8", borderRadius: "24px", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ color: "#F2B544", letterSpacing: "2px" }} aria-label="5 stars">★★★★★</div>
                <blockquote style={{ margin: 0, fontSize: "17px" }}>
                  "The interactive activities made discussing bodily changes and first periods completely stress-free. My daughter actually looks forward to learning modules."
                </blockquote>
                <figcaption style={{ fontSize: "14px", fontWeight: 800, color: "#5E4B6B" }}>
                  Ananya Sharma, mother of an 11-year-old · Mumbai
                </figcaption>
              </figure>

              <figure style={{ margin: 0, background: "#3D2C4A", color: "#FFFAF6", borderRadius: "24px", aspectRatio: "9 / 12", padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <span style={{ alignSelf: "flex-start", background: "rgba(255,255,255,.15)", borderRadius: "999px", padding: "4px 12px", fontSize: "12px", fontWeight: 800 }}>
                  Video testimonial · 0:45
                </span>
                <button
                  type="button"
                  aria-label="Play parent video testimonial"
                  onClick={() => setIsPlayingPreview(true)}
                  style={{ alignSelf: "center", width: "68px", height: "68px", borderRadius: "50%", border: "none", background: "#FFFAF6", color: "#3D2C4A", display: "grid", placeItems: "center" }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <figcaption style={{ fontSize: "15px", fontWeight: 800 }}>
                  Rajesh Verma, father of a 12-year-old · Bengaluru
                </figcaption>
              </figure>

              <figure style={{ margin: 0, background: "#FFF4C7", borderRadius: "6px 24px 24px 24px", padding: "24px", transform: "rotate(-1deg)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "12px", fontWeight: 900, letterSpacing: ".1em", color: "#8A6410" }}>
                  A NOTE FROM A GIRL
                </span>
                <blockquote style={{ margin: 0, fontFamily: "'Caveat', cursive", fontSize: "27px", lineHeight: 1.2 }}>
                  "I was so terrified about my period starting in school. Gigi showed me how to pack my kit, and now I'm ready!"
                </blockquote>
                <figcaption style={{ fontSize: "14px", fontWeight: 800 }}>
                  Aditi, 12 years old
                </figcaption>
              </figure>

              <figure style={{ margin: 0, background: "#FFFFFF", border: "1px solid #F1E4E8", borderRadius: "24px", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ color: "#F2B544", letterSpacing: "2px" }} aria-label="5 stars">★★★★★</div>
                <blockquote style={{ margin: 0, fontSize: "17px" }}>
                  "The safety and POCSO lessons were handled with such grace and empowerment. She knows her boundaries and feels safe talking to me."
                </blockquote>
                <figcaption style={{ fontSize: "14px", fontWeight: 800, color: "#5E4B6B" }}>
                  Pooja Nair, mother of a 13-year-old · Delhi
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 13. COMPARISON */}
        <section style={{ padding: "88px 0", background: "#FFFFFF" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "28px", fontWeight: 700, color: "#C2456A" }}>
                Why HerNext
              </div>
              <h2 style={{ margin: "4px 0 0", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(30px, 3.8vw, 48px)", lineHeight: 1.12, letterSpacing: "-.015em" }}>
                Why not just YouTube or a school talk?
              </h2>
            </div>
            <div style={{ overflowX: "auto", borderRadius: "24px", border: "1px solid #F1E4E8" }}>
              <table style={{ width: "100%", minWidth: "640px", borderCollapse: "collapse", fontSize: "15px" }}>
                <thead>
                  <tr>
                    <th scope="col" style={{ textAlign: "left", padding: "18px", background: "#FFFAF6" }} />
                    <th scope="col" style={{ padding: "18px", background: "#F9D5D3", fontFamily: "'Fraunces', serif", fontSize: "18px", position: "relative" }}>
                      HerNext by Infano
                      <span style={{ display: "block", fontFamily: "'Nunito', sans-serif", fontSize: "11px", fontWeight: 900, letterSpacing: ".08em", color: "#A8365A" }}>
                        BEST FOR YOUR DAUGHTER
                      </span>
                    </th>
                    <th scope="col" style={{ padding: "18px", background: "#FFFAF6", fontWeight: 800 }}>Internet videos</th>
                    <th scope="col" style={{ padding: "18px", background: "#FFFAF6", fontWeight: 800 }}>One-time school talk</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Reviewed by doctors & psychologists", "Yes", "Rarely", "Sometimes"],
                    ["Age-appropriate & safe to watch", "Yes", "Unpredictable", "Yes"],
                    ["Games, activities & quizzes", "[40+]", "No", "No"],
                    ["Covers safety, POCSO & emotions", "Yes", "Scattered", "Rarely"],
                    ["Parent guide & conversation cards", "Yes", "No", "No"],
                    ["Rewatch anytime, privately", "Yes", "Yes", "No"],
                    ["Progress tracking & certificate", "Yes", "No", "No"],
                  ].map(([rowTitle, c1, c2, c3], rIdx) => (
                    <tr key={rIdx}>
                      <th scope="row" style={{ textAlign: "left", padding: "14px 18px", fontWeight: 700, borderTop: "1px solid #F3E9EE" }}>
                        {rowTitle}
                      </th>
                      <td style={{ textAlign: "center", padding: "14px", background: "#FDEFF0", fontWeight: 900, color: "#2F8F6B", borderTop: "1px solid #F3E9EE" }}>
                        {c1}
                      </td>
                      <td style={{ textAlign: "center", padding: "14px", color: "#6E5B7A", borderTop: "1px solid #F3E9EE" }}>
                        {c2}
                      </td>
                      <td style={{ textAlign: "center", padding: "14px", color: "#6E5B7A", borderTop: "1px solid #F3E9EE" }}>
                        {c3}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 14. PRICING */}
        <section id="pricing" style={{ padding: "88px 0", background: "#FFF3EA" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 36px" }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "28px", fontWeight: 700, color: "#C2456A" }}>
                Enroll today &amp; get instant access
              </div>
              <h2 style={{ margin: "4px 0 10px", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(30px, 3.8vw, 48px)", lineHeight: 1.12, letterSpacing: "-.015em" }}>
                Give her the gift of confidence today
              </h2>
              <p style={{ margin: 0, color: "#5E4B6B", fontSize: "18px" }}>
                One-time payment. Lifetime access. For one daughter, and a parent who learns alongside.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "22px", alignItems: "stretch" }}>
              {/* Card 1: The Course */}
              <div style={{ position: "relative", background: "#FFFFFF", borderRadius: "28px", padding: "28px", border: "1.5px solid #F1E4E8", display: "flex", flexDirection: "column", gap: "14px" }}>
                <span style={{ alignSelf: "flex-start", background: "#F9D5D3", color: "#A8365A", borderRadius: "999px", padding: "4px 12px", fontSize: "12px", fontWeight: 900, letterSpacing: ".06em" }}>
                  LAUNCH OFFER · 50% OFF
                </span>
                <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: "26px", fontWeight: 600 }}>
                  The Course
                </h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: "52px", fontWeight: 700, lineHeight: 1 }}>
                    {course?.isFree ? "FREE" : `₹${coursePrice}`}
                  </span>
                  {!course?.isFree && (
                    <s style={{ fontSize: "20px", color: "#8A7896" }}>₹{coursePriceOriginal}</s>
                  )}
                </div>
                <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "15px" }}>
                  <li>All {totalModulesCount} modules · {totalChaptersCount} video lessons (Hinglish)</li>
                  <li>[40+] activities, games &amp; {totalModulesCount} assessments</li>
                  <li>Parent Companion Guide &amp; conversation cards</li>
                  <li>Cycle diary, badges &amp; certificate</li>
                  <li>Lifetime access</li>
                </ul>
                <button
                  type="button"
                  onClick={() => handlePurchase("course")}
                  style={{ marginTop: "auto", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "54px", borderRadius: "999px", background: "#C2456A", color: "#FFFFFF", fontWeight: 800, fontSize: "17px", border: "none", cursor: "pointer" }}
                >
                  {isEnrolled
                    ? "Go to Course Overview"
                    : course?.isFree
                    ? "Enroll now · Free"
                    : `Enroll now · ₹${coursePrice}`}
                </button>
              </div>

              {/* Card 2: Course + Gigi Book Bundle */}
              <div style={{ position: "relative", background: "#FFFFFF", borderRadius: "28px", padding: "28px", border: "3px solid #E8738A", boxShadow: "0 24px 50px rgba(194,69,106,.16)", display: "flex", flexDirection: "column", gap: "14px" }}>
                <span style={{ position: "absolute", top: "-15px", left: "50%", transform: "translateX(-50%)", background: "#3D2C4A", color: "#FFFAF6", borderRadius: "999px", padding: "6px 16px", fontSize: "12px", fontWeight: 900, letterSpacing: ".08em", whiteSpace: "nowrap" }}>
                  BEST VALUE
                </span>
                <span style={{ alignSelf: "flex-start", background: "#D4EFE4", color: "#24735A", borderRadius: "999px", padding: "4px 12px", fontSize: "12px", fontWeight: 900, letterSpacing: ".06em" }}>
                  COURSE + BOOK
                </span>
                <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: "26px", fontWeight: 600 }}>
                  Course + Gigi Book Bundle
                </h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: "52px", fontWeight: 700, lineHeight: 1 }}>
                    ₹1,099
                  </span>
                </div>
                <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "15px" }}>
                  <li>Everything in the course</li>
                  <li><em>Gigi: The Awkward Age</em> book, delivered home</li>
                  <li>Read the book, then play the lessons: one story, two ways</li>
                  <li>A thoughtful gift for birthdays and first periods</li>
                </ul>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#FFF4C7", borderRadius: "16px", padding: "10px 12px" }}>
                  <svg width="40" height="48" viewBox="0 0 40 48" aria-hidden="true">
                    <rect x="2" y="2" width="34" height="44" rx="4" fill="#F4A3B4" />
                    <rect x="2" y="2" width="6" height="44" rx="2" fill="#E8738A" />
                    <circle cx="22" cy="20" r="7" fill="#FFF4C7" />
                    <rect x="13" y="32" width="18" height="3" rx="1.5" fill="#FFFAF6" />
                  </svg>
                  <span style={{ fontSize: "14px", fontWeight: 700 }}>Gigi: The Awkward Age book</span>
                </div>
                <button
                  type="button"
                  onClick={() => handlePurchase("bundle")}
                  style={{ marginTop: "auto", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "54px", borderRadius: "999px", background: "#3D2C4A", color: "#FFFFFF", fontWeight: 800, fontSize: "17px", border: "none", cursor: "pointer" }}
                >
                  Get the bundle · ₹1,099
                </button>
              </div>

              {/* Card 3: Already have Gigi book? */}
              <div style={{ position: "relative", background: "#FFF4C7", borderRadius: "28px", padding: "28px", border: "1.5px solid #F3E3A1", display: "flex", flexDirection: "column", gap: "14px" }}>
                <span style={{ alignSelf: "flex-start", background: "#FFFFFF", color: "#8A6410", borderRadius: "999px", padding: "4px 12px", fontSize: "12px", fontWeight: 900, letterSpacing: ".06em" }}>
                  FOR GIGI BOOK READERS
                </span>
                <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: "26px", fontWeight: 600 }}>
                  Already have the Gigi book?
                </h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: "52px", fontWeight: 700, lineHeight: 1 }}>
                    ₹299
                  </span>
                  <s style={{ fontSize: "20px", color: "#8A7896" }}>₹999</s>
                </div>
                <p style={{ margin: 0, fontSize: "15px" }}>
                  Get the full course at our reader's price. Verify with the phone number you used to buy the book.
                </p>

                {bkStep === "idle" && (
                  <button
                    type="button"
                    onClick={() => handlePurchase("reader")}
                    style={{ marginTop: "auto", minHeight: "54px", borderRadius: "999px", border: "2px solid #3D2C4A", background: "#FFFFFF", color: "#3D2C4A", fontWeight: 800, fontSize: "17px", cursor: "pointer" }}
                  >
                    Verify &amp; unlock
                  </button>
                )}

                {bkStep === "phone" && (
                  <div className="hn-pop" style={{ marginTop: "auto", background: "#FFFFFF", borderRadius: "18px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label htmlFor="bk-phone" style={{ fontSize: "14px", fontWeight: 800 }}>
                      Phone number used to buy the book
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ display: "grid", placeItems: "center", padding: "0 12px", borderRadius: "12px", background: "#FFFAF6", border: "1.5px solid #E9DDE6", fontWeight: 800 }}>
                        +91
                      </span>
                      <input
                        id="bk-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={bkPhone}
                        onChange={(e) => setBkPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="98XXXXXXXX"
                        style={{ flex: "1 1 0%", minWidth: 0, minHeight: "48px", borderRadius: "12px", border: "1.5px solid #E9DDE6", padding: "0 12px", fontSize: "17px", fontWeight: 700, color: "#3D2C4A" }}
                      />
                    </div>
                    {bkErr && <div style={{ fontSize: "13px", fontWeight: 700, color: "#A8365A" }}>{bkErr}</div>}
                    <button
                      type="button"
                      onClick={handleSendBkOtp}
                      style={{ minHeight: "48px", borderRadius: "999px", border: "none", background: "#3D2C4A", color: "#FFFAF6", fontWeight: 800 }}
                    >
                      Send OTP
                    </button>
                  </div>
                )}

                {bkStep === "otp" && (
                  <div className="hn-pop" style={{ marginTop: "auto", background: "#FFFFFF", borderRadius: "18px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label htmlFor="bk-otp" style={{ fontSize: "14px", fontWeight: 800 }}>
                      Enter the 4-digit OTP sent to +91 {bkPhone}
                    </label>
                    <input
                      id="bk-otp"
                      type="text"
                      inputMode="numeric"
                      value={bkOtp}
                      onChange={(e) => setBkOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="• • • •"
                      style={{ minHeight: "52px", borderRadius: "12px", border: "1.5px solid #E9DDE6", padding: "0 14px", fontSize: "24px", fontWeight: 800, letterSpacing: ".4em", textAlign: "center", color: "#3D2C4A" }}
                    />
                    {bkErr && <div style={{ fontSize: "13px", fontWeight: 700, color: "#A8365A" }}>{bkErr}</div>}
                    <button
                      type="button"
                      onClick={handleVerifyBkOtp}
                      style={{ minHeight: "48px", borderRadius: "999px", border: "none", background: "#3D2C4A", color: "#FFFAF6", fontWeight: 800 }}
                    >
                      Verify
                    </button>
                    <div style={{ fontSize: "12px", color: "#6E5B7A" }}>
                      Any 4 digits work.{" "}
                      <button
                        type="button"
                        onClick={() => { setBkStep("phone"); setBkOtp(""); setBkErr(""); }}
                        style={{ border: "none", background: "none", padding: 0, color: "#A8365A", fontWeight: 800, textDecoration: "underline" }}
                      >
                        Change number
                      </button>
                    </div>
                  </div>
                )}

                {bkStep === "done" && (
                  <div className="hn-pop" style={{ marginTop: "auto", background: "#D4EFE4", borderRadius: "18px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 900 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F8F6B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                      Welcome back, reader!
                    </div>
                    <div style={{ fontSize: "14px" }}>
                      Gigi is excited to see you again. Your ₹299 reader price is unlocked.
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePurchase("reader")}
                      style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50px", borderRadius: "999px", background: "#C2456A", color: "#FFFFFF", fontWeight: 800, border: "none", cursor: "pointer" }}
                    >
                      Continue · Pay ₹299
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Trust Badges */}
            <div style={{ marginTop: "28px", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "12px 28px", fontSize: "14px", fontWeight: 800, color: "#4A3A57" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#3D2C4A", color: "#FFF4C7", borderRadius: "999px", padding: "6px 14px", fontVariantNumeric: "tabular-nums" }}>
                Launch price ends in {cd.d} : {cd.h} : {cd.m} : {cd.s}
              </span>
              <span>UPI · Cards · Net banking</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                Secure payment
              </span>
              <span>7-day refund</span>
              <span>Instant access by email &amp; WhatsApp</span>
            </div>

            <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px 28px", fontSize: "15px" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 700, minHeight: "44px" }}>
                <input type="checkbox" style={{ width: "20px", height: "20px", accentColor: "#C2456A" }} />
                This is a gift (send a gift card instead)
              </label>
              <Link href="/schools" style={{ display: "inline-flex", alignItems: "center", minHeight: "44px", fontWeight: 800 }}>
                Buying for a school or group?
              </Link>
            </div>
          </div>
        </section>

        {/* 15. SUPPORTING BANNER */}
        <section style={{ padding: "72px 0" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ position: "relative", overflow: "hidden", background: "#F9D5D3", borderRadius: "36px", padding: "clamp(28px, 5vw, 64px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "32px" }}>
              <svg aria-hidden="true" width="520" height="520" viewBox="0 0 600 600" style={{ position: "absolute", right: "-140px", top: "-120px", pointerEvents: "none" }}>
                <path d="M421 81c66 44 117 128 108 211-9 82-79 163-161 199-83 36-178 27-243-23C60 418 25 327 47 248 69 168 149 99 232 69c83-30 123-32 189 12z" fill="#F4C3CC" />
              </svg>
              <div style={{ position: "relative", flex: "1 1 440px", minWidth: 0 }}>
                <h2 style={{ margin: "0 0 18px", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(28px, 3.6vw, 46px)", lineHeight: 1.15, letterSpacing: "-.015em" }}>
                  Her first period is a moment she'll remember forever.{" "}
                  <em style={{ color: "#A8365A" }}>Let her remember it as the day she felt ready.</em>
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
                  <button
                    type="button"
                    onClick={handlePurchase}
                    style={{ display: "inline-flex", alignItems: "center", minHeight: "56px", padding: "0 28px", borderRadius: "999px", background: "#3D2C4A", color: "#FFFFFF", fontWeight: 800, fontSize: "18px", border: "none" }}
                  >
                    Start her journey · ₹{coursePrice}
                  </button>
                  <span style={{ fontWeight: 800 }}>Join 10,000+ families</span>
                </div>
              </div>
              <div style={{ position: "relative", flex: "0 1 300px", display: "flex", justifyContent: "center" }}>
                <svg className="hn-sway" width="240" height="280" viewBox="0 0 120 140" aria-hidden="true">
                  <g transform="translate(60 52)">
                    <ellipse rx="16" ry="28" cy="-24" fill="#FFFAF6" />
                    <ellipse rx="16" ry="28" cy="-24" fill="#FDE3E8" transform="rotate(60)" />
                    <ellipse rx="16" ry="28" cy="-24" fill="#FFFAF6" transform="rotate(120)" />
                    <ellipse rx="16" ry="28" cy="-24" fill="#FDE3E8" transform="rotate(180)" />
                    <ellipse rx="16" ry="28" cy="-24" fill="#FFFAF6" transform="rotate(240)" />
                    <ellipse rx="16" ry="28" cy="-24" fill="#FDE3E8" transform="rotate(300)" />
                    <circle r="13" fill="#FFE08A" />
                  </g>
                  <path d="M60 80 V 138" stroke="#7FB89A" strokeWidth="5" strokeLinecap="round" />
                  <path d="M60 112 C 44 104, 34 110, 32 118 C 44 122, 56 118, 60 112z" fill="#A8D8BE" />
                  <path d="M60 98 C 76 90, 86 96, 88 104 C 76 108, 64 104, 60 98z" fill="#A8D8BE" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* 16. STEPS */}
        <section style={{ padding: "72px 0 88px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "28px", fontWeight: 700, color: "#C2456A" }}>
                It takes 2 minutes
              </div>
              <h2 style={{ margin: "4px 0 0", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(30px, 3.8vw, 48px)", lineHeight: 1.12, letterSpacing: "-.015em" }}>
                Start in 3 simple steps
              </h2>
            </div>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "22px" }}>
              <li style={{ background: "#FFFFFF", border: "1px solid #F1E4E8", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#F9D5D3", display: "grid", placeItems: "center", fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "24px" }}>1</span>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#A8365A" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                    <rect x="7" y="2" width="10" height="20" rx="2" />
                    <path d="M11 18h2" />
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: "22px", fontWeight: 600 }}>Choose your plan</h3>
                <p style={{ margin: 0, color: "#5E4B6B" }}>
                  The course, the bundle, or the ₹299 reader price if you own the Gigi book.
                </p>
              </li>

              <li style={{ background: "#FFFFFF", border: "1px solid #F1E4E8", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#D4EFE4", display: "grid", placeItems: "center", fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "24px" }}>2</span>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2F8F6B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: "22px", fontWeight: 600 }}>Pay securely in seconds</h3>
                <p style={{ margin: 0, color: "#5E4B6B" }}>
                  UPI, card or net banking. Your login arrives on email and WhatsApp instantly.
                </p>
              </li>

              <li style={{ background: "#FFFFFF", border: "1px solid #F1E4E8", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#E3DAF5", display: "grid", placeItems: "center", fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "24px" }}>3</span>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#6B4FA0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: "22px", fontWeight: 600 }}>Start learning together</h3>
                <p style={{ margin: 0, color: "#5E4B6B" }}>
                  Set up her profile, let her pick an avatar, and press play on Chapter 1.
                </p>
              </li>
            </ol>
            <p style={{ margin: "22px 0 0", textAlign: "center", fontSize: "15px", fontWeight: 700, color: "#6E5B7A" }}>
              Works on any phone, tablet or laptop. No app download needed.
            </p>
          </div>
        </section>

        {/* 17. PROMISE */}
        <section style={{ padding: "72px 0", background: "#FFFFFF" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <h2 style={{ margin: "0 0 28px", textAlign: "center", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(28px, 3.4vw, 42px)", letterSpacing: "-.015em" }}>
              A safe space, by design
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
              <div style={{ background: "#EAF7F1", borderRadius: "24px", padding: "24px" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2F8F6B" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="9" r="6" />
                  <path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7" />
                </svg>
                <h3 style={{ margin: "10px 0 6px", fontSize: "18px", fontWeight: 900 }}>Expert verified</h3>
                <p style={{ margin: 0, fontSize: "15px", color: "#3F5E50" }}>
                  Every lesson is reviewed by doctors, psychologists and a child-rights expert.
                </p>
              </div>

              <div style={{ background: "#EAF7F1", borderRadius: "24px", padding: "24px" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2F8F6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
                </svg>
                <h3 style={{ margin: "10px 0 6px", fontSize: "18px", fontWeight: 900 }}>Age-appropriate</h3>
                <p style={{ margin: 0, fontSize: "15px", color: "#3F5E50" }}>
                  Safety is taught with empowerment, never fear. Parents can preview Module 4 first.
                </p>
              </div>

              <div style={{ background: "#EAF7F1", borderRadius: "24px", padding: "24px" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2F8F6B" strokeWidth="2" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                <h3 style={{ margin: "10px 0 6px", fontSize: "18px", fontWeight: 900 }}>Private &amp; ad-free</h3>
                <p style={{ margin: 0, fontSize: "15px", color: "#3F5E50" }}>
                  No ads, no public comments. Her journal stays private, and her data is never sold.
                </p>
              </div>

              <div style={{ background: "#EAF7F1", borderRadius: "24px", padding: "24px" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2F8F6B" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <path d="M3 4v5h5" />
                </svg>
                <h3 style={{ margin: "10px 0 6px", fontSize: "18px", fontWeight: 900 }}>7-day refund</h3>
                <p style={{ margin: 0, fontSize: "15px", color: "#3F5E50" }}>
                  Not right for your family? Get a full refund within 7 days, no questions asked.
                </p>
              </div>
            </div>
            <p style={{ margin: "18px 0 0", textAlign: "center", fontSize: "13px", color: "#6E5B7A" }}>
              HerNext educates and supports. It is not a substitute for professional medical advice.
            </p>
          </div>
        </section>

        {/* 18. FAQ */}
        <section id="faq" style={{ padding: "88px 0" }}>
          <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "18px", marginBottom: "26px" }}>
              <div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "28px", fontWeight: 700, color: "#C2456A" }}>
                  Gigi asks…
                </div>
                <h2 style={{ margin: "4px 0 0", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(30px, 3.8vw, 48px)", lineHeight: 1.12, letterSpacing: "-.015em" }}>
                  Questions parents ask us
                </h2>
              </div>
              <svg width="84" height="96" viewBox="0 0 84 96" role="img" aria-label="Gigi holding a question balloon">
                <path d="M58 6c12 0 20 8 20 18s-8 18-20 18-20-8-20-18 8-18 20-18z" fill="#E3DAF5" />
                <text x="58" y="32" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="22" fontWeight="700" fill="#6B4FA0">?</text>
                <path d="M58 42 C 54 54, 44 58, 38 62" stroke="#A992D6" strokeWidth="2" fill="none" />
                <circle cx="26" cy="58" r="14" fill="#F4A3B4" />
                <path d="M10 96c2-14 8-22 16-22s14 8 16 22z" fill="#F9D5D3" />
                <circle cx="26" cy="60" r="10" fill="#FFFAF6" />
              </svg>
            </div>

            {/* Category Filter Pills */}
            <div role="tablist" aria-label="FAQ topics" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "18px" }}>
              {faqData.map((ft, i) => {
                const sel = faqCat === i;
                return (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={sel}
                    onClick={() => { setFaqCat(i); setOpenFaq(0); }}
                    style={{
                      minHeight: "44px",
                      padding: "0 16px",
                      borderRadius: "999px",
                      border: "1.5px solid",
                      fontWeight: 800,
                      fontSize: "14px",
                      background: sel ? "#3D2C4A" : "#FFFFFF",
                      color: sel ? "#FFFAF6" : "#3D2C4A",
                      borderColor: sel ? "#3D2C4A" : "#E9DDE6",
                    }}
                  >
                    {ft.cat}
                  </button>
                );
              })}
            </div>

            {/* Accordion Questions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {faqData[faqCat].items.map((q, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} style={{ background: "#FFFFFF", border: "1px solid #F1E4E8", borderRadius: "18px", overflow: "hidden" }}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      style={{ width: "100%", minHeight: "60px", padding: "14px 18px", border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", textAlign: "left", fontSize: "17px", fontWeight: 800, color: "#3D2C4A" }}
                    >
                      <span>{q.q}</span>
                      <span style={{ flex: "none", width: "30px", height: "30px", borderRadius: "50%", background: "#FDEFF0", display: "grid", placeItems: "center", fontSize: "20px", fontWeight: 700, color: "#A8365A" }}>
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="hn-pop" style={{ padding: "0 18px 18px", color: "#4A3A57", fontSize: "16px" }}>
                        {q.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* WhatsApp / Email direct support */}
            <div style={{ marginTop: "22px", background: "#D4EFE4", borderRadius: "22px", padding: "20px 22px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "14px" }}>
              <div>
                <strong style={{ display: "block", fontSize: "18px" }}>Still have a question?</strong>
                <span style={{ fontSize: "15px", color: "#3F5E50" }}>
                  Our support team is happy to help. A parent community is coming soon.
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                <a
                  href="https://wa.me/919243019243"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", minHeight: "48px", padding: "0 20px", borderRadius: "999px", background: "#3D2C4A", color: "#FFFFFF", fontWeight: 800, textDecoration: "none" }}
                >
                  Chat on WhatsApp
                </a>
                <a
                  href="mailto:connect@infano.care"
                  style={{ display: "inline-flex", alignItems: "center", minHeight: "48px", padding: "0 20px", borderRadius: "999px", border: "2px solid #3D2C4A", color: "#3D2C4A", fontWeight: 800, textDecoration: "none" }}
                >
                  Email support
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 19. FINAL CTA & FOOTER */}
        <section style={{ padding: "88px 0", background: "#FFFFFF", textAlign: "center" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <svg width="150" height="170" viewBox="0 0 120 140" aria-hidden="true">
              <g transform="translate(60 52)">
                <ellipse rx="16" ry="28" cy="-24" fill="#F4A3B4" />
                <ellipse rx="16" ry="28" cy="-24" fill="#E3DAF5" transform="rotate(60)" />
                <ellipse rx="16" ry="28" cy="-24" fill="#D4EFE4" transform="rotate(120)" />
                <ellipse rx="16" ry="28" cy="-24" fill="#FFE3CC" transform="rotate(180)" />
                <ellipse rx="16" ry="28" cy="-24" fill="#D8ECF8" transform="rotate(240)" />
                <ellipse rx="16" ry="28" cy="-24" fill="#FFF4C7" transform="rotate(300)" />
                <circle r="13" fill="#E8738A" />
              </g>
              <path d="M60 80 V 138" stroke="#7FB89A" strokeWidth="5" strokeLinecap="round" />
              <path d="M60 112 C 44 104, 34 110, 32 118 C 44 122, 56 118, 60 112z" fill="#A8D8BE" />
            </svg>
            <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(32px, 4.4vw, 56px)", lineHeight: 1.08, letterSpacing: "-.02em" }}>
              She's growing up. <em style={{ color: "#C2456A" }}>Let her grow up confident.</em>
            </h2>
            <p style={{ margin: 0, fontSize: "19px", color: "#5E4B6B" }}>
              Join 10,000+ families on the Infano journey.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
              <button
                type="button"
                onClick={() => handlePurchase("course")}
                style={{ display: "inline-flex", alignItems: "center", minHeight: "56px", padding: "0 28px", borderRadius: "999px", background: "#C2456A", color: "#FFFFFF", fontWeight: 800, fontSize: "18px", border: "none", cursor: "pointer" }}
              >
                {isEnrolled
                  ? "Go to Course Overview"
                  : course?.isFree
                  ? "Enroll now · Free"
                  : `Enroll now · ₹${coursePrice}`}
              </button>
              <a
                href="#preview"
                style={{ display: "inline-flex", alignItems: "center", minHeight: "56px", padding: "0 24px", borderRadius: "999px", border: "2px solid #3D2C4A", color: "#3D2C4A", fontWeight: 800, fontSize: "17px" }}
              >
                Watch free preview
              </a>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#6E5B7A" }}>
              7-day refund · Lifetime access · Expert verified
            </div>
          </div>
        </section>



        {/* GUEST ENROLLMENT MODAL */}
        {isEnrollModalOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "rgba(61,44,74,.65)", backdropFilter: "blur(6px)" }}>
            <div className="hn-pop" style={{ background: "#FFFFFF", borderRadius: "32px", border: "1px solid #F1E4E8", boxShadow: "0 24px 60px rgba(61,44,74,.2)", width: "100%", maxWidth: "460px", overflow: "hidden", position: "relative" }}>
              {/* Header */}
              <div style={{ padding: "24px 28px", background: "linear-gradient(to right, #FFF4F7, #FAF5FF)", borderBottom: "1px solid #F1E4E8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700, fontFamily: "'Fraunces', serif" }}>
                    Course Enrollment
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6E5B7A" }}>
                    Provide details to unlock your learning track.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#FFFFFF", border: "1px solid #F1E4E8", color: "#6E5B7A", display: "grid", placeItems: "center", fontSize: "16px", fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handlePublicEnrollSubmit} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "#5E4B6B" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma"
                    value={enrollForm.name}
                    onChange={(e) => setEnrollForm((prev) => ({ ...prev, name: e.target.value }))}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "14px", border: "1.5px solid #E9DDE6", fontSize: "15px", fontWeight: 600, color: "#3D2C4A", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "#5E4B6B" }}>
                    Phone Number (with Country Code)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +919999999999"
                    value={enrollForm.phone}
                    onChange={(e) => setEnrollForm((prev) => ({ ...prev, phone: e.target.value }))}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "14px", border: "1.5px solid #E9DDE6", fontSize: "15px", fontWeight: 600, color: "#3D2C4A", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "#5E4B6B" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ananya@domain.com"
                    value={enrollForm.email}
                    onChange={(e) => setEnrollForm((prev) => ({ ...prev, email: e.target.value }))}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "14px", border: "1.5px solid #E9DDE6", fontSize: "15px", fontWeight: 600, color: "#3D2C4A", outline: "none" }}
                  />
                </div>

                <div style={{ paddingTop: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    type="submit"
                    disabled={isEnrolling}
                    style={{ width: "100%", padding: "14px", background: "#C2456A", color: "#FFFFFF", borderRadius: "16px", fontWeight: 800, fontSize: "16px", border: "none", boxShadow: "0 10px 24px rgba(194,69,106,.25)", cursor: isEnrolling ? "not-allowed" : "pointer" }}
                  >
                    {isEnrolling ? (
                      "Processing..."
                    ) : course?.isFree ? (
                      "Enroll for Free Now"
                    ) : (
                      `Purchase & Enroll · ₹${coursePrice}`
                    )}
                  </button>
                  <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, textAlign: "center", color: "#8A7896" }}>
                    🔒 Safe payment processing · Instant onboarding access prepared
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
