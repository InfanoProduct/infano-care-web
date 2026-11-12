"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ParentSpaceSubHeader } from "@/components/parent/ParentSpaceSubHeader";
import { ParentSpaceService } from "@/services/parent-space.service";
import { useAuthStore } from "@/store/auth-store";
import { Mail, MessageCircle, Search, Shield, X } from "lucide-react";
import { toast } from "react-hot-toast";

const TOPICS: Record<string, string> = {
  all: "All topics",
  login: "Login & OTP",
  pay: "Payments & refunds",
  book: "Gigi book delivery",
  course: "Using the course",
  safe: "Safety & privacy",
};

const FAQS: Array<{ topic: string; q: string; a: string }> = [
  {
    topic: "login",
    q: "I'm not getting the OTP",
    a: 'Wait 30 seconds and tap Resend, or choose "Get it on WhatsApp". Check that the number is the one you paid with. Still stuck? Message us on WhatsApp and we will verify you by hand.',
  },
  {
    topic: "login",
    q: "Can I log in on my phone and my laptop?",
    a: "Yes. Log in with the same mobile number on any device. Her progress stays in sync.",
  },
  {
    topic: "pay",
    q: "How do I get a refund?",
    a: 'Within 7 days of buying, go to Orders and tap "Request a refund". The money returns to your UPI or card in 5 to 7 working days.',
  },
  {
    topic: "pay",
    q: "I paid but the course didn't unlock",
    a: "Sometimes banks take a few minutes to confirm. If it has been over 30 minutes, message us with your payment reference and we will unlock it right away. You will never be charged twice.",
  },
  {
    topic: "pay",
    q: "Where is my invoice?",
    a: 'Open Orders and tap "Download invoice (PDF)". A copy was also emailed to you when you paid.',
  },
  {
    topic: "book",
    q: "When will the Gigi book arrive?",
    a: "Usually 3 to 5 working days after you order. Track it from Orders or your Parent space.",
  },
  {
    topic: "book",
    q: "My pincode was not accepted",
    a: "We may not deliver there yet. You can buy the course on its own, and we will tell you when delivery reaches your area.",
  },
  {
    topic: "course",
    q: "Why is the next chapter locked for her?",
    a: "Chapters open one at a time so each idea builds on the last. Finishing a chapter check-in opens the next one. You can preview every chapter anytime from your Parent space.",
  },
  {
    topic: "course",
    q: "Is there an app?",
    a: 'For now HerNext runs in the browser on any phone, tablet or laptop. Tip: tap "Add to Home screen" so it opens like an app.',
  },
  {
    topic: "safe",
    q: "Who can see her journal?",
    a: "Only her. You see her progress, scores and badges, but never her journal or diary entries.",
  },
  {
    topic: "safe",
    q: "How do I delete her data?",
    a: "Go to Settings › Privacy & her data › Delete profile. Everything is removed cleanly.",
  },
  {
    topic: "safe",
    q: "Something in the course worried my daughter",
    a: 'Thank you for telling us. Use "Share a concern privately" on this page and a counsellor from our team will reach out.',
  },
];

export default function ParentHelpPage() {
  const { user, learners } = useAuthStore();
  const parentName = user?.profile?.displayName || "there";

  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const [openIdx, setOpenIdx] = useState<number>(0);

  // Waitlist & Concern modal
  const [waitlistJoined, setWaitlistJoined] = useState(false);
  const [concernOpen, setConcernOpen] = useState(false);
  const [concernMsg, setConcernMsg] = useState("");
  const [submittingConcern, setSubmittingConcern] = useState(false);

  useEffect(() => {
    ParentSpaceService.getSettings()
      .then((s) => setWaitlistJoined(Boolean(s.communityWaitlist)))
      .catch(() => {});
  }, []);

  const filteredFaqs = FAQS.filter(
    (f) =>
      (topic === "all" || f.topic === topic) &&
      (!query.trim() ||
        `${f.q} ${f.a}`.toLowerCase().includes(query.trim().toLowerCase()))
  );

  const handleToggleWaitlist = async () => {
    const next = !waitlistJoined;
    setWaitlistJoined(next);
    try {
      await ParentSpaceService.updateSettings({ communityWaitlist: next });
      toast.success(next ? "Added to parent community waitlist!" : "Removed from waitlist.");
    } catch {
      toast.error("Could not update waitlist status.");
    }
  };

  const handleSubmitConcern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (concernMsg.trim().length < 5) {
      toast.error("Please describe your concern.");
      return;
    }
    setSubmittingConcern(true);
    try {
      await ParentSpaceService.submitConcern({
        message: concernMsg,
        learnerId: learners?.[0]?.id,
      });
      setConcernMsg("");
      setConcernOpen(false);
      toast.success("Concern shared privately. Our team will reach out soon.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send concern.");
    } finally {
      setSubmittingConcern(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F6] text-[#3D2C4A] font-['Noto_Sans',sans-serif]">
      <ParentSpaceSubHeader />

      {/* Lavender Search Hero */}
      <section className="bg-[#E3DAF5] relative overflow-hidden">
        <svg
          aria-hidden="true"
          width="360"
          height="360"
          viewBox="0 0 600 600"
          className="absolute -right-24 -top-28 pointer-events-none"
        >
          <path
            d="M421 81c66 44 117 128 108 211-9 82-79 163-161 199-83 36-178 27-243-23C60 418 25 327 47 248 69 168 149 99 232 69c83-30 123-32 189 12z"
            fill="#D6C9F0"
          />
        </svg>

        <div className="relative max-w-[1080px] mx-auto px-4 sm:px-5 py-9 flex flex-col gap-4">
          <h1 className="m-0 font-extrabold text-2xl sm:text-4xl tracking-tight text-[#3D2C4A]">
            Hi {parentName}, how can we help?
          </h1>

          <label className="relative block max-w-2xl">
            <span className="sr-only">Search help</span>
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E5B7A]"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenIdx(0);
              }}
              placeholder="Try 'OTP', 'refund' or 'locked chapter'"
              className="w-full min-h-[54px] rounded-full border-none bg-white pl-12 pr-5 text-base text-[#3D2C4A] shadow-md focus:outline-none focus:ring-2 focus:ring-[#A8365A]"
            />
          </label>

          <div role="tablist" aria-label="Topics" className="flex flex-wrap gap-2">
            {Object.entries(TOPICS).map(([key, label]) => {
              const active = topic === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setTopic(key);
                    setOpenIdx(0);
                  }}
                  className={`min-h-[40px] px-4 rounded-full text-xs sm:text-sm font-semibold cursor-pointer transition-colors ${
                    active
                      ? "bg-[#3D2C4A] text-white"
                      : "bg-white text-[#3D2C4A] hover:bg-[#FFFAF6]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-[1080px] mx-auto px-4 sm:px-5 py-7 sm:py-9 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* FAQs Accordion */}
        <section className="lg:col-span-7 flex flex-col gap-2.5">
          <h2 className="m-0 mb-1 text-xl font-bold text-[#3D2C4A]">
            {query.trim()
              ? `${filteredFaqs.length} answer${filteredFaqs.length === 1 ? "" : "s"} found`
              : "Common questions"}
          </h2>

          {filteredFaqs.map((f, i) => {
            const open = openIdx === i;
            return (
              <div
                key={f.q}
                className="bg-white border border-[#F1E4E8] rounded-2xl overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenIdx(open ? -1 : i)}
                  className="w-full min-h-[58px] px-4 py-3 flex items-center justify-between gap-3 text-left text-[#3D2C4A] cursor-pointer"
                >
                  <span>
                    <span className="block text-[11px] font-bold text-[#8A6A9A] uppercase">
                      {TOPICS[f.topic]}
                    </span>
                    <span className="block text-sm sm:text-base font-semibold">{f.q}</span>
                  </span>
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#F1ECFA] grid place-items-center font-bold text-[#5A4385]">
                    {open ? "−" : "+"}
                  </span>
                </button>
                {open && (
                  <div className="px-4 pb-4 text-sm text-[#4A3A57] leading-relaxed animate-in fade-in">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="bg-white border border-dashed border-[#D9C3CF] rounded-2xl p-5 text-sm font-medium text-[#5E4B6B]">
              No answers match &ldquo;{query}&rdquo; yet. Our team can help directly on WhatsApp or email.
            </div>
          )}
        </section>

        {/* Right Sidebar */}
        <aside className="lg:col-span-5 flex flex-col gap-4">
          <section className="bg-white border border-[#F1E4E8] rounded-[24px] p-5 flex flex-col gap-3 shadow-2xs">
            <h2 className="m-0 text-lg font-bold text-[#3D2C4A]">Talk to a real person</h2>
            <a
              href="https://wa.me/919243019243"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 bg-[#EAF7F1] hover:bg-[#D4EFE4] rounded-2xl p-3.5 text-[#3D2C4A] transition-colors"
            >
              <span className="w-10 h-10 rounded-xl bg-white grid place-items-center shrink-0">
                <MessageCircle size={20} className="text-[#24735A]" />
              </span>
              <span>
                <strong className="block text-sm font-bold">WhatsApp</strong>
                <span className="text-xs text-[#24533F]">Replies in about an hour, 9 am to 8 pm</span>
              </span>
            </a>
            <a
              href="mailto:connect@infano.care"
              className="flex items-center gap-3 bg-[#FBF8F6] hover:bg-[#F3E9EE] rounded-2xl p-3.5 text-[#3D2C4A] transition-colors"
            >
              <span className="w-10 h-10 rounded-xl bg-white grid place-items-center shrink-0">
                <Mail size={20} className="text-[#5E4B6B]" />
              </span>
              <span>
                <strong className="block text-sm font-bold">connect@infano.care</strong>
                <span className="text-xs text-[#5E4B6B]">Replies within 24 hours</span>
              </span>
            </a>
          </section>

          <section className="bg-[#FFF1E6] rounded-[24px] p-5 flex flex-col gap-2.5">
            <h2 className="m-0 text-lg font-bold text-[#3D2C4A] flex items-center gap-2">
              <Shield size={19} className="text-[#9A4A16]" />
              Something worried her?
            </h2>
            <p className="m-0 text-sm text-[#3D2C4A] leading-relaxed">
              If a lesson upset your daughter, or she shared something that concerns you, tell us privately. A counsellor from our team will get back to you.
            </p>
            <button
              type="button"
              onClick={() => setConcernOpen(true)}
              className="self-start min-h-[44px] px-5 rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold text-sm cursor-pointer"
            >
              Share a concern privately
            </button>
            <div className="text-xs font-medium text-[#6B3A16]">
              If a child is in danger, call 112 now. Child Helpline: 1098.
            </div>
          </section>

          <section id="waitlist" className="bg-[#F1ECFA] rounded-[24px] p-5 flex flex-col gap-2">
            <strong className="text-base font-bold text-[#3D2C4A]">
              Parent community, coming soon
            </strong>
            <span className="text-sm text-[#4A3A57]">
              Swap notes with other parents in a space our experts moderate.
            </span>
            <button
              type="button"
              onClick={handleToggleWaitlist}
              className={`self-start min-h-[42px] px-4 rounded-full font-bold text-xs sm:text-sm cursor-pointer transition-colors ${
                waitlistJoined
                  ? "bg-[#2F7F62] text-white"
                  : "bg-white border-2 border-[#3D2C4A] text-[#3D2C4A]"
              }`}
            >
              {waitlistJoined ? "✓ You're on the list" : "Join the waitlist"}
            </button>
          </section>

          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm font-semibold px-1">
            <Link href="/legal" className="text-[#A8365A] hover:underline">
              Privacy Policy &amp; Terms
            </Link>
            <Link href="/dashboard/orders" className="text-[#A8365A] hover:underline">
              Refund Policy
            </Link>
          </nav>
        </aside>
      </main>

      {/* Share a Concern Modal */}
      {concernOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D2C4A]/45 backdrop-blur-xs p-4"
          onClick={() => setConcernOpen(false)}
        >
          <form
            onSubmit={handleSubmitConcern}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-[26px] p-6 flex flex-col gap-3.5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-xl font-bold text-[#3D2C4A]">Share a concern privately</h2>
              <button
                type="button"
                onClick={() => setConcernOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FFFAF6] grid place-items-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <p className="m-0 text-xs sm:text-sm text-[#5E4B6B]">
              Only our safeguarding counsellor sees this message. We&apos;ll reply on your registered phone or email.
            </p>
            <textarea
              rows={4}
              required
              value={concernMsg}
              onChange={(e) => setConcernMsg(e.target.value)}
              placeholder="Write what's on your mind..."
              className="rounded-2xl border border-[#E9DDE6] p-3 text-sm resize-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submittingConcern}
                className="flex-1 min-h-[46px] rounded-full bg-[#3D2C4A] text-white font-bold text-sm cursor-pointer disabled:opacity-60"
              >
                {submittingConcern ? "Sending..." : "Send privately"}
              </button>
              <button
                type="button"
                onClick={() => setConcernOpen(false)}
                className="min-h-[46px] px-4 rounded-full text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

