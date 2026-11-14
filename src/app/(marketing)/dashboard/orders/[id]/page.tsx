"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { ParentSpaceService } from "@/services/parent-space.service";
import { useParentOrdersSummary, parentOrdersSummaryQueryKey } from "@/hooks/use-parent-space-data";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "react-hot-toast";

const PROBLEMS = [
  "The book arrived damaged",
  "I got the wrong item",
  "It says delivered but I didn't get it",
  "Something else",
];

function mapOrderStatusToStage(status?: string): "placed" | "packed" | "shipped" | "out" | "delivered" | "issue" {
  switch ((status || "").toUpperCase()) {
    case "PLACED":
      return "placed";
    case "PROCESSING":
      return "packed";
    case "SHIPPED":
      return "shipped";
    case "OUT_FOR_DELIVERY":
      return "out";
    case "DELIVERED":
      return "delivered";
    case "ON_HOLD":
    case "CANCELLED":
      return "issue";
    default:
      return "placed";
  }
}

export default function BookTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const {
    data: ordersSummary,
    isPending: loading,
    isError,
    refetch,
  } = useParentOrdersSummary(user?.id);
  const order = ordersSummary?.orders?.find((item) => item.id === id) || null;

  // Report modal
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(PROBLEMS[0]);
  const [problemNotes, setProblemNotes] = useState("");
  const [sendingReport, setSendingReport] = useState(false);
  const [reportTicket, setReportTicket] = useState<string | null>(null);

  // Edit address modal (allowed before shipping)
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [addrLine, setAddrLine] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrPin, setAddrPin] = useState("");
  const [savingAddr, setSavingAddr] = useState(false);

  const handleSendReport = async () => {
    if (!order) return;
    setSendingReport(true);
    try {
      const res: any = await ParentSpaceService.reportOrderIssue(order.id, {
        issueType: selectedProblem,
        notes: problemNotes,
      });
      setReportTicket(res.referenceCode || "TK-NEW");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send report.");
    } finally {
      setSendingReport(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSavingAddr(true);
    try {
      const updated: any = await ParentSpaceService.updateOrderAddress(order.id, {
        shippingAddress: addrLine,
        city: addrCity,
        pincode: addrPin,
      });
      const orderUpdate = updated?.order || updated || {};
      queryClient.setQueryData(
        parentOrdersSummaryQueryKey(user?.id),
        (current: any) => current ? {
          ...current,
          orders: current.orders.map((item: any) =>
            item.id === order.id ? { ...item, ...orderUpdate } : item
          ),
        } : current
      );
      setEditAddressOpen(false);
      toast.success("Delivery address updated!");
    } catch (err: any) {
      toast.error(err?.message || "Could not update address.");
    } finally {
      setSavingAddr(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF8F6] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#C2456A]" />
      </div>
    );
  }

  if (isError && !ordersSummary) {
    return (
      <div className="min-h-screen bg-[#FBF8F6] flex flex-col items-center justify-center gap-3 p-6 text-[#3D2C4A]">
        <p className="font-bold text-lg">Could not load tracking details.</p>
        <button type="button" className="font-bold text-[#A8365A] underline" onClick={() => { void refetch(); }}>
          Try again
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FBF8F6] flex flex-col items-center justify-center gap-3 p-6 text-[#3D2C4A]">
        <p className="font-bold text-lg">Order not found</p>
        <Link
          href="/dashboard/orders"
          className="min-h-[46px] px-5 rounded-full bg-[#3D2C4A] text-white font-bold text-sm inline-flex items-center"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  const st = mapOrderStatusToStage(order.orderStatus);
  const stageOrder = ["placed", "packed", "shipped", "out", "delivered"];
  const at = st === "issue" ? 3 : stageOrder.indexOf(st);
  const canEditAddress = at < 2;

  const STATUS_META: Record<string, { kicker: string; title: string; line: string; bg: string; ink: string }> = {
    placed: {
      kicker: "ORDER PLACED",
      title: "We've got your order",
      line: "We pack books within 1 working day.",
      bg: "#FDEFF0",
      ink: "#A8365A",
    },
    packed: {
      kicker: "PACKED",
      title: "Wrapped and ready to go",
      line: "Your book is packed and waiting for the courier.",
      bg: "#FFF4C7",
      ink: "#7A5A0C",
    },
    shipped: {
      kicker: "ON THE WAY",
      title: "Gigi is on her way!",
      line: "We'll message you on WhatsApp when it's out for delivery.",
      bg: "#D8ECF8",
      ink: "#2F6494",
    },
    out: {
      kicker: "OUT FOR DELIVERY",
      title: "Arriving today",
      line: "The courier will call before delivering. Please keep your phone nearby.",
      bg: "#D4EFE4",
      ink: "#24735A",
    },
    delivered: {
      kicker: "DELIVERED",
      title: "Gigi has arrived!",
      line: "Delivered safely. Enjoy reading together!",
      bg: "#D4EFE4",
      ink: "#24735A",
    },
    issue: {
      kicker: "DELIVERY UPDATE",
      title: "Action needed on your delivery",
      line: "Our team or courier will reach out shortly.",
      bg: "#FFE3CC",
      ink: "#9A4A16",
    },
  };

  const hero = STATUS_META[st];
  const createdStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  const timelineSteps = [
    { name: "Order placed", when: createdStr },
    { name: "Packed", when: at >= 1 ? "Prepared at warehouse" : "Usually within 1 day" },
    { name: "Shipped", when: at >= 2 ? (order.awbNumber ? `AWB ${order.awbNumber}` : "In transit") : "" },
    { name: "Out for delivery", when: at >= 3 ? "Courier on the way" : "" },
    { name: "Delivered", when: st === "delivered" ? "Completed" : "" },
  ];

  const bookTitles =
    order.items?.map((it: any) => it.book?.title || "The Gigi Book").join(", ") || "Gigi Book";

  return (
    <div className="min-h-screen bg-[#FBF8F6] text-[#3D2C4A] font-['Noto_Sans',sans-serif]">
      {/* Header */}
      <header className="bg-white border-b border-[#F1E4E8] sticky top-0 z-20">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-5 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            aria-label="Back to orders"
            className="w-11 h-11 rounded-full border border-[#F1E4E8] hover:border-[#3D2C4A] grid place-items-center text-[#3D2C4A] shrink-0"
          >
            <ArrowLeft size={20} />
          </Link>
          <span className="font-bold text-lg sm:text-xl text-[#3D2C4A]">Track the Gigi book</span>
        </div>
      </header>

      <main className="max-w-[1080px] mx-auto px-4 sm:px-5 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Status Hero + Timeline */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div
            style={{ backgroundColor: hero.bg }}
            className="rounded-[26px] p-5 sm:p-6 flex gap-4 items-center"
          >
            <svg width="80" height="94" viewBox="0 0 86 100" aria-hidden="true" className="shrink-0">
              <rect x="8" y="6" width="66" height="88" rx="8" fill="#F4A3B4" />
              <rect x="8" y="6" width="12" height="88" rx="4" fill="#E8738A" />
              <circle cx="48" cy="40" r="16" fill="#FFF4C7" />
              <circle cx="38" cy="28" r="6" fill="#3D2C4A" />
              <circle cx="58" cy="28" r="6" fill="#3D2C4A" />
              <circle cx="48" cy="42" r="10" fill="#D9A07E" />
              <rect x="26" y="66" width="40" height="6" rx="3" fill="#FFFFFF" />
              <rect x="32" y="76" width="28" height="5" rx="2.5" fill="#FFFFFF" opacity="0.7" />
            </svg>
            <div>
              <div style={{ color: hero.ink }} className="text-xs font-extrabold tracking-wider uppercase">
                {hero.kicker}
              </div>
              <h1 className="m-0 mt-0.5 font-['Baloo_2',sans-serif] text-2xl sm:text-3xl font-bold text-[#3D2C4A] leading-tight">
                {hero.title}
              </h1>
              <p className="m-0 mt-1 text-sm sm:text-base text-[#4A3A57]">{hero.line}</p>
            </div>
          </div>

          {/* 5-step Vertical Timeline */}
          <ol className="list-none m-0 p-5 bg-white border border-[#F1E4E8] rounded-[24px] flex flex-col shadow-2xs">
            {timelineSteps.map((step, k) => {
              const done = k < at || (k === at && st === "delivered");
              const cur = k === at && st !== "delivered";
              return (
                <li key={step.name} className="flex gap-3.5">
                  <div className="flex flex-col items-center">
                    <span
                      className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold shrink-0 ${
                        done
                          ? "bg-[#2F7F62] text-white"
                          : cur
                          ? st === "issue"
                            ? "bg-[#F0AF7E] text-white"
                            : "bg-[#C2456A] text-white"
                          : "bg-[#F6F1F4] text-[#8A7896]"
                      }`}
                    >
                      {done ? "✓" : k + 1}
                    </span>
                    {k < timelineSteps.length - 1 && (
                      <span
                        className={`flex-1 w-[3px] min-h-[24px] ${
                          done ? "bg-[#2F7F62]" : "bg-[#F1E4E8]"
                        }`}
                      />
                    )}
                  </div>
                  <div className="pb-4">
                    <div className={`font-bold text-sm sm:text-base ${k > at ? "text-[#8A7896]" : "text-[#3D2C4A]"}`}>
                      {step.name}
                    </div>
                    {step.when && <div className="text-xs text-[#6E5B7A]">{step.when}</div>}
                  </div>
                </li>
              );
            })}
          </ol>

          {st === "delivered" && (
            <div className="bg-[#EAF7F1] rounded-[22px] p-5 flex flex-col gap-2">
              <strong className="text-base font-bold text-[#1F5A45]">Read it together</strong>
              <span className="text-sm text-[#24533F]">
                The Gigi book and HerNext were made to go together. Read a chapter at bedtime, then explore the matching lesson.
              </span>
              <Link href="/dashboard/parent" className="text-sm font-bold text-[#A8365A] hover:underline">
                Go to parent space →
              </Link>
            </div>
          )}
        </section>

        {/* Right: Delivery Details & Help */}
        <aside className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white border border-[#F1E4E8] rounded-[24px] p-5 flex flex-col gap-3 shadow-2xs">
            <h2 className="m-0 text-base font-bold text-[#3D2C4A]">Delivery details</h2>
            <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-[#6E5B7A]">Order</dt>
              <dd className="m-0 font-semibold text-[#3D2C4A]">
                {order.id.slice(-8).toUpperCase()} · {bookTitles}
              </dd>
              <dt className="text-[#6E5B7A]">AWB</dt>
              <dd className="m-0 font-semibold text-[#3D2C4A]">
                {order.awbNumber || "Assigned on dispatch"}
              </dd>
              <dt className="text-[#6E5B7A]">Deliver to</dt>
              <dd className="m-0 font-semibold text-[#3D2C4A]">
                {[order.guestName, order.shippingAddress, order.city, order.pincode].filter(Boolean).join(", ")}
              </dd>
              {order.guestPhone && (
                <>
                  <dt className="text-[#6E5B7A]">Phone</dt>
                  <dd className="m-0 font-semibold text-[#3D2C4A]">{order.guestPhone}</dd>
                </>
              )}
            </dl>

            {canEditAddress ? (
              <div className="flex flex-col gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAddrLine(order.shippingAddress || "");
                    setAddrCity(order.city || "");
                    setAddrPin(order.pincode || "");
                    setEditAddressOpen(true);
                  }}
                  className="self-start min-h-[42px] px-4 rounded-full border-2 border-[#3D2C4A] bg-white hover:bg-[#FFFAF6] text-[#3D2C4A] font-bold text-xs sm:text-sm cursor-pointer"
                >
                  Change address
                </button>
                <span className="text-xs text-[#6E5B7A]">
                  You can change the address until the book ships.
                </span>
              </div>
            ) : (
              <span className="text-xs text-[#6E5B7A]">
                The book has left our warehouse, so the address can&apos;t change now.
              </span>
            )}
          </div>

          <div className="bg-white border border-[#F1E4E8] rounded-[24px] p-5 flex flex-col gap-2.5 shadow-2xs">
            <h2 className="m-0 text-base font-bold text-[#3D2C4A]">Something wrong?</h2>
            <button
              type="button"
              onClick={() => {
                setReportOpen(true);
                setReportTicket(null);
              }}
              className="min-h-[48px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm cursor-pointer transition-colors"
            >
              Report a problem
            </button>
            <Link href="/dashboard/help" className="text-sm font-semibold text-[#A8365A] hover:underline">
              Delivery questions in Help
            </Link>
            <a
              href="https://wa.me/919243019243"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-[#24735A] hover:underline"
            >
              WhatsApp us
            </a>
          </div>
        </aside>
      </main>

      {/* Report Problem Modal */}
      {reportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D2C4A]/45 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setReportOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-[26px] p-6 flex flex-col gap-3.5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-xl font-bold text-[#3D2C4A]">
                {reportTicket ? "Thanks, we're on it" : "What happened?"}
              </h2>
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FFFAF6] grid place-items-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {!reportTicket ? (
              <>
                <div className="flex flex-col gap-2">
                  {PROBLEMS.map((p) => {
                    const on = selectedProblem === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedProblem(p)}
                        className={`text-left min-h-[48px] px-4 rounded-2xl font-semibold text-sm cursor-pointer border-2 transition-colors ${
                          on
                            ? "border-[#C2456A] bg-[#FDEFF0] text-[#3D2C4A]"
                            : "border-[#E9DDE6] bg-white text-[#3D2C4A]"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <textarea
                  rows={3}
                  value={problemNotes}
                  onChange={(e) => setProblemNotes(e.target.value)}
                  placeholder="Optional note or details..."
                  className="rounded-2xl border border-[#E9DDE6] p-3 text-sm resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={sendingReport}
                    onClick={handleSendReport}
                    className="flex-1 min-h-[48px] rounded-full bg-[#3D2C4A] text-white font-bold text-sm cursor-pointer disabled:opacity-60"
                  >
                    {sendingReport ? "Sending..." : "Send"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportOpen(false)}
                    className="min-h-[48px] px-4 rounded-full text-sm font-semibold text-[#3D2C4A] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="m-0 text-sm text-[#4A3A57]">
                  Reference <strong>{reportTicket}</strong>. For a damaged or wrong book, we send a free replacement. We&apos;ll update you on WhatsApp within 1 working day.
                </p>
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="min-h-[48px] rounded-full bg-[#3D2C4A] text-white font-bold text-sm cursor-pointer"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {editAddressOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D2C4A]/45 backdrop-blur-xs p-4"
          onClick={() => setEditAddressOpen(false)}
        >
          <form
            onSubmit={handleSaveAddress}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-[26px] p-6 flex flex-col gap-3.5 shadow-2xl"
          >
            <h2 className="m-0 text-xl font-bold text-[#3D2C4A]">Update delivery address</h2>
            <label className="text-sm font-semibold flex flex-col gap-1">
              Street / Flat
              <input
                type="text"
                required
                value={addrLine}
                onChange={(e) => setAddrLine(e.target.value)}
                className="min-h-[44px] rounded-xl border border-[#E9DDE6] px-3"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold flex flex-col gap-1">
                City
                <input
                  type="text"
                  required
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  className="min-h-[44px] rounded-xl border border-[#E9DDE6] px-3"
                />
              </label>
              <label className="text-sm font-semibold flex flex-col gap-1">
                Pincode
                <input
                  type="text"
                  required
                  value={addrPin}
                  onChange={(e) => setAddrPin(e.target.value)}
                  className="min-h-[44px] rounded-xl border border-[#E9DDE6] px-3"
                />
              </label>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={savingAddr}
                className="flex-1 min-h-[46px] rounded-full bg-[#C2456A] text-white font-bold text-sm cursor-pointer disabled:opacity-60"
              >
                {savingAddr ? "Saving..." : "Save address"}
              </button>
              <button
                type="button"
                onClick={() => setEditAddressOpen(false)}
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
