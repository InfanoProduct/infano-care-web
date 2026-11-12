"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Download, Gift, Loader2, ShoppingBag } from "lucide-react";
import { ParentSpaceSubHeader } from "@/components/parent/ParentSpaceSubHeader";
import { ParentSpaceService } from "@/services/parent-space.service";
import { InvoiceModal } from "@/components/common/InvoiceModal";
import { getCurrencySymbol } from "@/lib/utils";
import { toast } from "react-hot-toast";

const REFUND_REASONS = [
  "Not right for my daughter",
  "Technical problem",
  "Bought by mistake",
  "Too expensive",
  "Other",
];

function getBookStepIndex(status?: string): number {
  switch ((status || "").toUpperCase()) {
    case "PLACED":
      return 0;
    case "PROCESSING":
      return 1;
    case "SHIPPED":
      return 2;
    case "DELIVERED":
      return 3;
    default:
      return 0;
  }
}

export default function ParentOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<any[]>([]);
  const [programEnrollments, setProgramEnrollments] = useState<any[]>([]);
  const [learnerName, setLearnerName] = useState("your daughter");

  // Invoice modal
  const [activeInvoice, setActiveInvoice] = useState<{
    type: "PROGRAM" | "BOOK";
    data: any;
  } | null>(null);

  // Refund sidebar state
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [refundStage, setRefundStage] = useState<"idle" | "form" | "requested">("idle");
  const [selectedReason, setSelectedReason] = useState(REFUND_REASONS[0]);
  const [refundFeedback, setRefundFeedback] = useState("");
  const [dataOption, setDataOption] = useState<"keep" | "delete">("keep");
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [createdRefund, setCreatedRefund] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ParentSpaceService.getOrdersSummary();
      setOrders(res.orders || []);
      setCourseEnrollments(res.courseEnrollments || res.lmsEnrollments || []);
      setProgramEnrollments(res.programEnrollments || []);
      if (res.learners && res.learners.length > 0) {
        setLearnerName(res.learners[0].name);
      }

      // Auto-select latest order/enrollment for 7-day refund sidebar
      const latestOrder = res.orders?.[0] || res.courseEnrollments?.[0] || res.lmsEnrollments?.[0] || res.programEnrollments?.[0];
      if (latestOrder) {
        setRefundOrderId(latestOrder.id);
        if (latestOrder.refundRequest) {
          setCreatedRefund(latestOrder.refundRequest);
          setRefundStage("requested");
        } else if (res.refunds && res.refunds.length > 0 && res.refunds[0].orderId === latestOrder.id) {
          setCreatedRefund(res.refunds[0]);
          setRefundStage("requested");
        }
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast.error("Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Unified list of orders & enrollments
  const unifiedOrders = [
    ...orders.map((o) => ({
      kind: "BOOK" as const,
      id: o.id,
      orderCode: o.id.slice(-8).toUpperCase(),
      title:
        o.items?.map((it: any) => `${it.book?.title || "Gigi Book"} (×${it.quantity})`).join(", ") ||
        "The Gigi Book",
      amount: o.totalAmount,
      currencySymbol: getCurrencySymbol(o),
      statusLabel:
        o.paymentStatus === "REFUNDED"
          ? "Refunded"
          : o.paymentStatus === "COMPLETED"
          ? "Paid"
          : o.orderStatus || "Placed",
      createdAt: new Date(o.createdAt),
      paymentMethod: o.paypalOrderId ? "PayPal" : o.paymentMethod === "COD" ? "Cash on delivery" : "UPI / Card via Razorpay",
      accessText: "Physical delivery",
      hasBookDelivery: true,
      orderStatus: o.orderStatus,
      addressText: [o.shippingAddress, o.city, o.pincode].filter(Boolean).join(", "),
      raw: o,
      refundRequest: o.refundRequest || null,
    })),
    ...courseEnrollments.map((e) => ({
      kind: "COURSE" as const,
      id: e.id,
      orderCode: e.id.slice(-8).toUpperCase(),
      title: e.course?.title || "Girlhood: HerNext",
      amount: e.pricePaid || 0,
      currencySymbol: e.currency === "USD" ? "$" : e.currency === "GBP" ? "£" : "₹",
      statusLabel: e.status === "ACTIVE" ? "Paid" : e.status,
      createdAt: new Date(e.createdAt),
      paymentMethod: "Online payment",
      accessText: `Lifetime · ${learnerName}`,
      hasBookDelivery: false,
      orderStatus: null,
      addressText: "",
      raw: e,
      refundRequest: null,
    })),
    ...programEnrollments.map((p) => ({
      kind: "PROGRAM" as const,
      id: p.id,
      orderCode: p.id.slice(-8).toUpperCase(),
      title: p.program?.title || "Infano Program",
      amount: p.amountPaid || 0,
      currencySymbol: "₹",
      statusLabel: p.status === "ACTIVE" ? "Paid" : p.status,
      createdAt: new Date(p.createdAt),
      paymentMethod: "UPI / Card via Razorpay",
      accessText: `Active · ${learnerName}`,
      hasBookDelivery: false,
      orderStatus: null,
      addressText: "",
      raw: p,
      refundRequest: null,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const targetOrder = unifiedOrders.find((u) => u.id === refundOrderId) || unifiedOrders[0] || null;
  const daysElapsed = targetOrder
    ? Math.max(0, Math.floor((Date.now() - targetOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const daysLeft = Math.max(0, 7 - daysElapsed);
  const windowOpen = targetOrder ? daysElapsed <= 7 : false;
  const refundDeadline = targetOrder
    ? new Date(targetOrder.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    : "";

  const handleSubmitRefund = async () => {
    if (!targetOrder) return;
    setSubmittingRefund(true);
    try {
      const res = await ParentSpaceService.requestRefund(targetOrder.id, {
        reason: selectedReason,
        feedback: refundFeedback,
        dataOption,
      });
      setCreatedRefund(res);
      setRefundStage("requested");
      toast.success("Refund request submitted.");
    } catch (err: any) {
      toast.error(err?.message || "Could not submit refund request.");
    } finally {
      setSubmittingRefund(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F6] text-[#3D2C4A] font-['Noto_Sans',sans-serif]">
      <ParentSpaceSubHeader />

      <main className="max-w-[1080px] mx-auto px-4 sm:px-5 py-7 sm:py-9 flex flex-col gap-6">
        <div>
          <h1 className="m-0 font-extrabold text-2xl sm:text-4xl tracking-tight text-[#3D2C4A]">
            Orders &amp; billing
          </h1>
          <p className="mt-1 mb-0 text-sm sm:text-base font-medium text-[#5E4B6B]">
            Receipts, delivery and refunds, all in one place.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-[#C2456A]" />
          </div>
        ) : unifiedOrders.length === 0 ? (
          <div className="bg-white border border-[#F1E4E8] rounded-[24px] p-10 text-center flex flex-col items-center gap-3 shadow-2xs">
            <ShoppingBag size={42} className="text-[#C9B9C9]" />
            <h2 className="m-0 font-bold text-xl text-[#3D2C4A]">No orders yet</h2>
            <p className="m-0 text-sm text-[#5E4B6B] max-w-md">
              When you purchase the HerNext course, a program, or the Gigi book, your receipts and delivery tracking will appear here.
            </p>
            <Link
              href="/course"
              className="mt-2 min-h-[46px] px-6 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm inline-flex items-center"
            >
              Explore plans
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Main Column: Order Cards */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-5">
              {unifiedOrders.map((ord) => {
                const bookStep = getBookStepIndex(ord.orderStatus);
                return (
                  <section
                    key={ord.id}
                    className="bg-white border border-[#F1E4E8] rounded-[24px] overflow-hidden shadow-2xs"
                  >
                    {/* Green Card Header */}
                    <div className="bg-[#EAF7F1] px-5 py-4 flex flex-wrap items-center gap-3.5">
                      <svg width="44" height="52" viewBox="0 0 40 48" aria-hidden="true" className="shrink-0">
                        <rect x="2" y="2" width="34" height="44" rx="4" fill="#F4A3B4" />
                        <rect x="2" y="2" width="6" height="44" rx="2" fill="#E8738A" />
                        <circle cx="22" cy="20" r="7" fill="#FFF4C7" />
                      </svg>
                      <div className="flex-1 min-w-[180px]">
                        <div className="text-[11px] font-extrabold tracking-wider text-[#24735A] uppercase">
                          ORDER {ord.orderCode}
                        </div>
                        <h2 className="m-0 text-lg sm:text-xl font-bold text-[#3D2C4A] leading-snug">
                          {ord.title}
                        </h2>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-extrabold text-[#3D2C4A]">
                          {ord.currencySymbol}
                          {ord.amount}
                        </div>
                        <span className="inline-block bg-[#2F7F62] text-white rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase">
                          {ord.statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <dl className="m-0 px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <dt className="text-xs font-medium text-[#6E5B7A]">Paid on</dt>
                        <dd className="m-0 font-semibold text-[#3D2C4A]">
                          {ord.createdAt.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-[#6E5B7A]">Paid with</dt>
                        <dd className="m-0 font-semibold text-[#3D2C4A]">{ord.paymentMethod}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-[#6E5B7A]">Access</dt>
                        <dd className="m-0 font-semibold text-[#3D2C4A]">{ord.accessText}</dd>
                      </div>
                    </dl>

                    {/* Invoice & Problem Actions */}
                    <div className="px-5 pb-4 flex flex-wrap items-center gap-3">
                      {ord.kind !== "COURSE" && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveInvoice({
                              type: ord.kind === "PROGRAM" ? "PROGRAM" : "BOOK",
                              data: ord.raw,
                            })
                          }
                          className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full border-2 border-[#3D2C4A] bg-white hover:bg-[#FFFAF6] text-[#3D2C4A] font-bold text-xs sm:text-sm cursor-pointer transition-colors"
                        >
                          <Download size={16} />
                          <span>Download invoice (PDF)</span>
                        </button>
                      )}
                      <Link
                        href="/dashboard/help"
                        className="inline-flex items-center min-h-[44px] px-2 font-bold text-sm text-[#A8365A] hover:underline"
                      >
                        Problem with this order?
                      </Link>
                    </div>

                    {/* Gigi Book Delivery Summary */}
                    {ord.hasBookDelivery && (
                      <div className="border-t border-[#F3E9EE] px-5 py-4 flex flex-col gap-3.5">
                        <div className="flex flex-wrap justify-between gap-2 text-sm">
                          <strong className="font-bold text-[#3D2C4A]">Gigi book delivery</strong>
                          <span className="font-semibold text-[#5E4B6B]">
                            Status: {ord.orderStatus || "Placed"}
                          </span>
                        </div>

                        <ol className="list-none m-0 p-0 grid grid-cols-4 gap-1 text-center text-xs font-semibold">
                          {["Ordered", "Packed", "Shipped", "Delivered"].map((label, stepIdx) => {
                            const done = stepIdx < bookStep || (stepIdx === 3 && bookStep === 3);
                            const current = stepIdx === bookStep && bookStep < 3;
                            return (
                              <li key={label} className="flex flex-col items-center gap-1.5">
                                <span
                                  className={`w-8 h-8 rounded-full grid place-items-center font-extrabold text-xs ${
                                    done
                                      ? "bg-[#2F7F62] text-white"
                                      : current
                                      ? "bg-[#FFE3CC] border-2 border-[#F0AF7E] text-[#3D2C4A]"
                                      : "bg-[#F6F1F4] text-[#8A7896]"
                                  }`}
                                >
                                  {done ? "✓" : stepIdx + 1}
                                </span>
                                <span className={stepIdx > bookStep ? "text-[#6E5B7A]" : "text-[#3D2C4A]"}>
                                  {label}
                                </span>
                              </li>
                            );
                          })}
                        </ol>

                        <div className="flex flex-wrap justify-between gap-2 text-xs sm:text-sm font-semibold">
                          <span className="text-[#5E4B6B]">
                            {ord.addressText ? `Delivering to ${ord.addressText}` : ""}
                          </span>
                          <Link
                            href={`/dashboard/orders/${ord.id}`}
                            className="text-[#A8365A] hover:underline font-bold"
                          >
                            Track parcel →
                          </Link>
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            {/* Right Column: 7-Day Happiness Promise & Refund */}
            <aside className="lg:col-span-5 xl:col-span-4 bg-white border border-[#F1E4E8] rounded-[24px] p-5 flex flex-col gap-4 shadow-2xs">
              <h2 className="m-0 text-lg font-bold text-[#3D2C4A]">7-day happiness promise</h2>

              {refundStage === "requested" && createdRefund ? (
                <div className="flex flex-col gap-3.5 animate-in fade-in">
                  <div className="bg-[#EAF7F1] rounded-2xl p-3.5 text-sm font-semibold text-[#1F5A45]">
                    Refund requested. Reference <strong>{createdRefund.referenceCode}</strong>. We&apos;ve sent the details on WhatsApp.
                  </div>
                  <ol className="list-none m-0 p-0 flex flex-col gap-3.5">
                    <li className="flex gap-3 items-start">
                      <span className="w-7 h-7 rounded-full bg-[#2F7F62] text-white grid place-items-center text-xs font-extrabold shrink-0">
                        ✓
                      </span>
                      <div>
                        <strong className="text-sm font-bold block">Requested</strong>
                        <span className="text-xs text-[#5E4B6B]">
                          {new Date(createdRefund.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="w-7 h-7 rounded-full bg-[#FFF4C7] border-2 border-[#E8C55A] grid place-items-center text-xs font-extrabold shrink-0">
                        2
                      </span>
                      <div>
                        <strong className="text-sm font-bold block">Approved</strong>
                        <span className="text-xs text-[#5E4B6B]">Usually within 1 working day</span>
                      </div>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="w-7 h-7 rounded-full bg-[#F6F1F4] grid place-items-center text-xs font-extrabold shrink-0">
                        3
                      </span>
                      <div>
                        <strong className="text-sm font-bold block">Money back</strong>
                        <span className="text-xs text-[#5E4B6B]">5 to 7 working days after approval</span>
                      </div>
                    </li>
                  </ol>
                </div>
              ) : !windowOpen ? (
                <div className="text-sm text-[#5E4B6B] space-y-2">
                  <p className="m-0">
                    Your 7-day refund window for this order has ended. Need help with anything?
                  </p>
                  <Link href="/dashboard/help" className="font-bold text-[#A8365A] hover:underline inline-block">
                    Talk to our support team →
                  </Link>
                </div>
              ) : refundStage === "idle" ? (
                <>
                  <p className="m-0 text-sm text-[#5E4B6B]">
                    If HerNext isn&apos;t right for your family, you can get a full refund until{" "}
                    <strong className="text-[#3D2C4A]">{refundDeadline}</strong>.
                  </p>

                  {/* 7-day progress bar */}
                  <div className="grid grid-cols-7 gap-1" aria-label={`${daysLeft} of 7 days left`}>
                    {Array.from({ length: 7 }, (_, i) => (
                      <span
                        key={i}
                        className={`h-2.5 rounded-full ${
                          i < 7 - daysLeft ? "bg-[#E9DDE6]" : "bg-[#7FC3A3]"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs font-bold text-[#24735A]">{daysLeft} days left</div>

                  <div className="bg-[#FBF8F6] rounded-2xl p-3.5 text-xs sm:text-sm text-[#4A3A57]">
                    Before you decide: something not working, or a topic worrying you?{" "}
                    <Link href="/dashboard/help" className="font-bold text-[#A8365A] hover:underline">
                      Talk to us first
                    </Link>
                    . We often fix it the same day.
                  </div>

                  <button
                    type="button"
                    onClick={() => setRefundStage("form")}
                    className="min-h-[48px] rounded-full border-2 border-[#3D2C4A] bg-white hover:bg-[#FFFAF6] text-[#3D2C4A] font-bold text-sm cursor-pointer transition-colors"
                  >
                    Request a refund
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-4 animate-in fade-in">
                  <div>
                    <div className="text-sm font-bold text-[#3D2C4A] mb-2">
                      What&apos;s the main reason?
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {REFUND_REASONS.map((r) => {
                        const on = selectedReason === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setSelectedReason(r)}
                            className={`min-h-[38px] px-3.5 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
                              on
                                ? "bg-[#3D2C4A] text-white border-[#3D2C4A]"
                                : "bg-white text-[#3D2C4A] border-[#E9DDE6] hover:border-[#3D2C4A]"
                            }`}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="flex flex-col gap-1.5 text-sm font-bold text-[#3D2C4A]">
                    <span>
                      Anything we could do better?{" "}
                      <span className="font-medium text-[#6E5B7A]">(optional)</span>
                    </span>
                    <textarea
                      rows={3}
                      value={refundFeedback}
                      onChange={(e) => setRefundFeedback(e.target.value)}
                      className="rounded-2xl border border-[#E9DDE6] p-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[#F4A3B4]"
                    />
                  </label>

                  <div className="bg-[#FBF8F6] rounded-2xl p-3.5 flex flex-col gap-2.5">
                    <div className="text-xs font-bold text-[#3D2C4A]">
                      {learnerName}&apos;s progress and data
                    </div>
                    {[
                      {
                        id: "keep" as const,
                        title: "Keep her garden & data",
                        sub: "If you come back later, her flowers and badges will be waiting.",
                      },
                      {
                        id: "delete" as const,
                        title: "Delete everything",
                        sub: "Removes her profile, journal and diary within 30 days.",
                      },
                    ].map((opt) => {
                      const on = dataOption === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDataOption(opt.id)}
                          className="text-left flex gap-2.5 items-start cursor-pointer"
                        >
                          <span
                            className={`w-5 h-5 mt-0.5 rounded-full border-2 grid place-items-center shrink-0 ${
                              on ? "border-[#C2456A]" : "border-[#C9B9C9]"
                            }`}
                          >
                            {on && <span className="w-2.5 h-2.5 rounded-full bg-[#C2456A]" />}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-[#3D2C4A]">
                              {opt.title}
                            </span>
                            <span className="block text-xs text-[#5E4B6B]">{opt.sub}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-xs text-[#5E4B6B]">
                    {targetOrder?.currencySymbol}
                    {targetOrder?.amount} goes back to your UPI or card in 5 to 7 working days. Access ends when the refund is processed.
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={submittingRefund}
                      onClick={handleSubmitRefund}
                      className="flex-1 min-h-[46px] px-4 rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold text-sm cursor-pointer disabled:opacity-60"
                    >
                      {submittingRefund ? "Submitting..." : "Confirm refund request"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRefundStage("idle")}
                      className="min-h-[46px] px-4 rounded-full text-sm font-bold text-[#3D2C4A] hover:bg-[#F6F1F4] cursor-pointer"
                    >
                      Keep the course
                    </button>
                  </div>
                </div>
              )}

              {/* Gift Quick Link */}
              <div className="border-t border-[#F3E9EE] pt-3 mt-1 flex items-center gap-3 text-xs text-[#5E4B6B]">
                <Gift size={18} className="text-[#A8365A] shrink-0" />
                <span>Want to gift HerNext to a friend or niece? Visit the course page anytime.</span>
              </div>
            </aside>
          </div>
        )}
      </main>

      {activeInvoice && (
        <InvoiceModal
          isOpen={Boolean(activeInvoice)}
          onClose={() => setActiveInvoice(null)}
          type={activeInvoice.type}
          data={activeInvoice.data}
        />
      )}
    </div>
  );
}
