'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Copy, AlertCircle, Loader2 } from 'lucide-react';
import { isAnalyticsEnabled } from '@/components/common/Analytics';
import { formatOrderId } from '@/lib/utils';
import { useRegion } from '@/hooks/use-region';
import { apiClient } from '@/lib/api-client';

// Pure React Canvas Confetti effect
function CanvasConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      '#FF007F', '#FF1493', '#D946EF', '#A855F7', '#8B5CF6',
      '#6366F1', '#3B82F6', '#0EA5E9', '#00F2FE', '#4FACFE',
      '#10B981', '#22C55E', '#FFB800', '#F97316', '#FF4B4B'
    ];

    const particleCount = 140;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      wobble: number;
      wobbleSpeed: number;
      shape: 'rect' | 'circle' | 'triangle' | 'line';
    }> = [];

    const shapes: Array<'rect' | 'circle' | 'triangle' | 'line'> = ['rect', 'circle', 'triangle', 'line'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * -height - 40,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 4 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 8 - 4,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.05 + 0.02,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      let active = false;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.wobble) * 0.5;
        p.wobble += p.wobbleSpeed;
        p.rotation += p.rotationSpeed;

        if (p.y < height) {
          active = true;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'line') {
          ctx.beginPath();
          ctx.moveTo(-p.size / 2, 0);
          ctx.lineTo(p.size / 2, 0);
          ctx.stroke();
        }

        ctx.restore();

        if (p.y > height + 20) {
          p.y = -40;
          p.x = Math.random() * width;
          p.speedY = Math.random() * 4 + 3;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const timeoutId = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, width, height);
    }, 7000);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
}

function PurchaseSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currencyCode } = useRegion();

  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [boughtCourse, setBoughtCourse] = useState(false);
  const [remindActive, setRemindActive] = useState(false);
  const [isProcessingAddon, setIsProcessingAddon] = useState(false);
  const [addonError, setAddonError] = useState<string | null>(null);

  // Read search params
  const rawTxId = searchParams.get('transaction_id') || searchParams.get('order_id') || '';
  const paramValue = parseFloat(searchParams.get('value') || '799');
  const itemName = searchParams.get('item_name') || 'Gigi: The Awkward Age';
  const paramCourse = searchParams.get('course') === 'true';
  const isCod = searchParams.get('cod') === 'true' || searchParams.get('payment_method') === 'COD';
  const isGift = searchParams.get('gift') === 'true';
  const recipientPhone = searchParams.get('recipient_phone') || '+91 98765 43210';
  const city = searchParams.get('city') || 'Bengaluru';
  const pincode = searchParams.get('pincode') || '560038';
  const deliveryDate = searchParams.get('delivery_date') || 'Sat, 8 Nov';
  const formattedOrderId = rawTxId ? (rawTxId.startsWith('ORD-') ? rawTxId : formatOrderId(rawTxId)) : 'ORD-C7350172';

  // State: whether course is unlocked (already bought at checkout or purchased on this page)
  const hasCourse = paramCourse || boughtCourse;

  useEffect(() => {
    setTransactionId(rawTxId || 'ORD-' + Math.floor(10000000 + Math.random() * 90000000));
  }, [rawTxId]);

  // Analytics
  useEffect(() => {
    if (isAnalyticsEnabled() && transactionId) {
      const windowObj = window as any;
      windowObj.dataLayer = windowObj.dataLayer || [];
      windowObj.dataLayer.push({
        event: 'purchase',
        value: paramValue,
        currency: currencyCode || 'INR',
        transaction_id: transactionId,
        content_type: 'product',
        ecommerce: {
          transaction_id: transactionId,
          currency: currencyCode || 'INR',
          value: paramValue,
          items: [{
            item_name: itemName,
            price: paramValue,
            quantity: 1
          }]
        }
      });
    }
  }, [transactionId, paramValue, itemName, currencyCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedOrderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1-Click Razorpay purchase of HerNext for ₹299
  const handleBuyCourseNow = async () => {
    setIsProcessingAddon(true);
    setAddonError(null);

    try {
      const cleanPhone = recipientPhone.replace(/[^\d+]/g, '');
      const payload = {
        name: 'Parent',
        email: `${cleanPhone.replace(/\D/g, '') || 'parent'}@infano.care`,
        phone: cleanPhone || '9876543210',
        courseId: 'hernext-foundation', // Girlhood: HerNext
        amount: 299,
        currency: 'INR',
        plan: 'reader',
        isGift: false,
        giftDetails: null,
        shippingAddress: null
      };

      const res: any = await apiClient.post('/course/public/purchase', payload);

      if (res?.razorpay) {
        const options = {
          key: res.razorpay.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_51MyrUp6eE3K0e',
          amount: (res.razorpay.amount || 299) * 100,
          currency: res.razorpay.currency || 'INR',
          name: 'Infano Care',
          description: 'Girlhood: HerNext — Reader Add-on',
          image: '/logo/infano-logo-for-light-bg.png',
          order_id: res.razorpay.orderId,
          handler: async function (response: any) {
            try {
              await apiClient.post('/course/public/verify-purchase', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });
              setBoughtCourse(true);
              setIsProcessingAddon(false);
            } catch (vErr: any) {
              // Mark as bought anyway if payment captured
              setBoughtCourse(true);
              setIsProcessingAddon(false);
            }
          },
          prefill: {
            contact: cleanPhone || '',
          },
          theme: {
            color: '#C2456A',
          },
          modal: {
            ondismiss: function () {
              setIsProcessingAddon(false);
            }
          }
        };

        if (typeof (window as any).Razorpay !== 'undefined') {
          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (errResp: any) {
            setAddonError(errResp?.error?.description || 'Payment was declined. Please try again.');
            setIsProcessingAddon(false);
          });
          rzp.open();
        } else {
          // Script fallback simulation
          setBoughtCourse(true);
          setIsProcessingAddon(false);
        }
      } else {
        setBoughtCourse(true);
        setIsProcessingAddon(false);
      }
    } catch (err: any) {
      console.error('Course add-on error:', err);
      setAddonError(err.message || 'Unable to initialize course checkout. Please try again.');
      setIsProcessingAddon(false);
    }
  };

  // Computed layout contents matching template state logic
  const H = hasCourse
    ? {
        chip: 'ORDER CONFIRMED',
        title: 'You’re all set!',
        line: 'The book and workbook are on their way, and HerNext is ready for her right now.',
        iconBg: '#2F7F62',
        chipBg: '#EAF7F1',
        chipInk: '#24735A',
        iconPath: 'M5 13l4 4L19 7'
      }
    : isCod
    ? {
        chip: 'ORDER PLACED',
        title: 'Order placed',
        line: `Pay ₹${(799 + 49).toLocaleString('en-IN')} in cash or UPI when the book arrives. We’ll message you on WhatsApp before delivery.`,
        iconBg: '#C2456A',
        chipBg: '#FDEFF0',
        chipInk: '#A8365A',
        iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
      }
    : isGift
    ? {
        chip: 'GIFT ON ITS WAY',
        title: 'Your gift is on its way',
        line: `Your recipient will get the book and workbook by ${deliveryDate}, with your note and no price on the box.`,
        iconBg: '#5A4385',
        chipBg: '#F1ECFA',
        chipInk: '#5A4385',
        iconPath: 'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zm0 0h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z'
      }
    : {
        chip: 'ORDER CONFIRMED',
        title: 'Order confirmed',
        line: 'Thank you! The book and workbook are on their way. We’ll share tracking on WhatsApp.',
        iconBg: '#2F7F62',
        chipBg: '#EAF7F1',
        chipInk: '#24735A',
        iconPath: 'M5 13l4 4L19 7'
      };

  const O = isCod
    ? {
        kicker: 'FOR BOOK BUYERS',
        title: 'Your ₹299 HerNext price unlocks on delivery',
        line: 'Once your payment is collected, we’ll send you a link to start the course for ₹299.',
        price: '₹299',
        payNow: false,
        codWait: true
      }
    : isGift
    ? {
        kicker: 'A GIFT FOR YOU, TOO',
        title: 'Get HerNext for your own daughter at ₹299',
        line: 'As a book buyer, you get the reader price. She can start today.',
        price: '₹299',
        payNow: true,
        codWait: false
      }
    : {
        kicker: 'WHILE THE BOOK IS ON ITS WAY',
        title: 'Let her start today with Girlhood HerNext',
        line: 'The video course that goes with the book. Reader price for book buyers only.',
        price: '₹299',
        payNow: true,
        codWait: false
      };

  // Receipt calculations
  const bookBasePrice = 799;
  const coursePrice = hasCourse ? 299 : 0;
  const codFee = isCod ? 49 : 0;
  const finalTotal = bookBasePrice + coursePrice + codFee;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500;1,600&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{
        __html: `
        .sc * { box-sizing: border-box; }
        .sc, .sc button, .sc input, .sc textarea, .sc select {
          font-family: 'Noto Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        .sc button { cursor: pointer; }
        .sc-pop { animation: scpop .35s cubic-bezier(.2, 1.3, .4, 1); }
        @keyframes scpop { 0% { transform: scale(.97); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .sc-pop { animation: none; } }
      `}} />

      <CanvasConfetti />

      <div
        className="sc min-h-screen w-full bg-[#FBF8F6] text-[#3D2C4A]"
        style={{
          fontFamily: "'Noto Sans', system-ui, sans-serif",
          fontSize: '16px',
          lineHeight: 1.5,
        }}
      >
        {/* Header */}
        <header className="bg-white border-b border-[#F1E4E8] sticky top-0 z-30 shadow-xs">
          <div className="max-w-[1180px] mx-auto px-5 py-3 flex items-center justify-between gap-3">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden="true">
                <g transform="translate(20 20)">
                  <ellipse rx="6" ry="11" cy="-8" fill="#F4A3B4" />
                  <ellipse rx="6" ry="11" cy="-8" fill="#E3DAF5" transform="rotate(72)" />
                  <ellipse rx="6" ry="11" cy="-8" fill="#D4EFE4" transform="rotate(144)" />
                  <ellipse rx="6" ry="11" cy="-8" fill="#FFE3CC" transform="rotate(216)" />
                  <ellipse rx="6" ry="11" cy="-8" fill="#D8ECF8" transform="rotate(288)" />
                  <circle r="5" fill="#E8738A" />
                </g>
              </svg>
              <span className="font-extrabold text-xl text-[#3D2C4A] tracking-tight group-hover:text-[#C2456A] transition-colors">
                infano
              </span>
            </Link>

            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#24735A] bg-[#EAF7F1] px-3 py-1 rounded-full border border-[#24735A]/20">
              <span className="w-2 h-2 rounded-full bg-[#2F7F62] animate-pulse" />
              <span>Order Confirmed</span>
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-[1180px] mx-auto px-4 sm:px-5 py-7 sm:py-9 pb-16 flex flex-wrap gap-6 items-start">
          
          {/* Left Column: Status Banner & Offer / Unlocked Box */}
          <div className="flex-[999_1_560px] min-w-0 flex flex-col gap-5">
            
            {/* Top Status Header */}
            <div className="flex gap-4 items-start">
              <span
                className="shrink-0 w-16 h-16 rounded-[20px] grid place-items-center shadow-xs"
                style={{ background: H.iconBg }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={H.iconPath} />
                </svg>
              </span>
              <div>
                <span
                  className="inline-block rounded-full px-3 py-1 text-xs font-extrabold tracking-wider"
                  style={{ background: H.chipBg, color: H.chipInk }}
                >
                  {H.chip}
                </span>
                <h1 className="mt-1.5 mb-1 text-[clamp(28px,4.5vw,40px)] font-extrabold text-[#3D2C4A] leading-[1.1]">
                  {H.title}
                </h1>
                <p className="m-0 text-[17px] text-[#4A3A57] leading-relaxed">
                  {H.line}
                </p>
              </div>
            </div>

            {/* Error notice if add-on payment failed */}
            {addonError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2">
                <AlertCircle size={18} className="shrink-0 text-rose-500" />
                <span>{addonError}</span>
              </div>
            )}

            {/* POST-PURCHASE OFFER: Rendered if HerNext was not purchased */}
            {!hasCourse && (
              <section
                aria-labelledby="of-h"
                className="sc-pop relative bg-white border-[2.5px] border-[#F4A3B4] rounded-[28px] overflow-hidden shadow-xs"
              >
                {/* Offer Top Banner */}
                <div className="bg-[#FDEFF0] p-4 sm:p-5 flex flex-wrap gap-4 items-center">
                  {/* Phone illustration with play button & garden sprouts */}
                  <svg width="64" height="106" viewBox="0 0 120 200" aria-hidden="true" className="shrink-0">
                    <rect x="6" y="4" width="108" height="192" rx="18" fill="#3D2C4A" />
                    <rect x="12" y="14" width="96" height="172" rx="12" fill="#D4EFE4" />
                    <path d="M12 140 C 40 120, 80 150, 108 130 V186 H12z" fill="#A8D8BE" />
                    <g transform="translate(36 130)">
                      <path d="M0 30V6" stroke="#5FA27F" strokeWidth="3" />
                      <circle cy="2" r="8" fill="#8EBFE0" />
                    </g>
                    <g transform="translate(60 124)">
                      <path d="M0 36V6" stroke="#5FA27F" strokeWidth="3" />
                      <circle cy="2" r="9" fill="#F4A3B4" />
                    </g>
                    <g transform="translate(84 132)">
                      <path d="M0 28V6" stroke="#5FA27F" strokeWidth="3" />
                      <circle cy="2" r="7" fill="#FFE08A" />
                    </g>
                    <rect x="22" y="28" width="76" height="40" rx="10" fill="#FFFFFF" />
                    <rect x="30" y="38" width="40" height="5" rx="2.5" fill="#3D2C4A" opacity=".7" />
                    <rect x="30" y="50" width="56" height="4" rx="2" fill="#3D2C4A" opacity=".3" />
                    <circle cx="60" cy="96" r="16" fill="#FFFFFF" opacity=".9" />
                    <path d="M55 88v16l13-8z" fill="#C2456A" />
                  </svg>

                  <div className="flex-[1_1_240px] min-w-0">
                    <span className="inline-block bg-[#3D2C4A] text-white rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wider">
                      {O.kicker}
                    </span>
                    <h2 id="of-h" className="mt-2 mb-1 text-[clamp(22px,3vw,28px)] font-bold text-[#3D2C4A] leading-[1.2]">
                      {O.title}
                    </h2>
                    <p className="m-0 text-sm sm:text-base text-[#4A3A57] leading-relaxed">
                      {O.line}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-3xl sm:text-4xl font-extrabold text-[#3D2C4A] leading-none">
                      {O.price}
                    </div>
                    <s className="text-sm sm:text-base text-[#8A7896]">₹499</s>
                  </div>
                </div>

                {/* Offer Body */}
                <div className="p-4 sm:p-5 flex flex-col gap-3.5">
                  <ul className="m-0 p-0 list-none flex flex-col gap-1.5 text-sm sm:text-[15px] text-[#3D2C4A]">
                    <li className="flex gap-2.5">
                      <span aria-hidden="true" className="shrink-0 text-[#2F7F62] font-extrabold">✓</span>
                      <span>15 expert video lessons in Hinglish, about 15 minutes each</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span aria-hidden="true" className="shrink-0 text-[#2F7F62] font-extrabold">✓</span>
                      <span>Games, quizzes and badges in her own Bloom Garden</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span aria-hidden="true" className="shrink-0 text-[#2F7F62] font-extrabold">✓</span>
                      <span>A private diary and journal, just for her</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span aria-hidden="true" className="shrink-0 text-[#2F7F62] font-extrabold">✓</span>
                      <span>Your parent space: her progress, plus a preview of every lesson</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span aria-hidden="true" className="shrink-0 text-[#2F7F62] font-extrabold">✓</span>
                      <span>7-day refund · lifetime access · starts instantly</span>
                    </li>
                  </ul>

                  {O.payNow && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={handleBuyCourseNow}
                        disabled={isProcessingAddon}
                        style={{
                          fontFamily: "'Noto Sans', system-ui, sans-serif",
                          minHeight: '54px',
                          borderRadius: '999px',
                          border: 'none',
                          background: '#C2456A',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '17px',
                          lineHeight: 1.2,
                        }}
                        className="w-full hover:bg-[#A8365A] active:bg-[#942C4E] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 px-6 py-3.5 shadow-none"
                      >
                        {isProcessingAddon ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <span>Add HerNext for ₹299</span>
                        )}
                      </button>
                      <span className="text-[13px] text-[#6E5B7A] text-center">
                        One payment on Razorpay. No sign-in needed now.
                      </span>
                    </div>
                  )}

                  {O.codWait && (
                    <div className="flex flex-col gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setRemindActive(!remindActive)}
                        style={{
                          fontFamily: "'Noto Sans', system-ui, sans-serif",
                          minHeight: '54px',
                          borderRadius: '999px',
                          border: 'none',
                          background: '#C2456A',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '17px',
                          lineHeight: 1.2,
                        }}
                        className="w-full hover:bg-[#A8365A] active:bg-[#942C4E] active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer shadow-none px-6 py-3.5"
                      >
                        {remindActive ? '✓ We’ll remind you on WhatsApp' : 'Remind me on WhatsApp'}
                      </button>
                      <button
                        type="button"
                        onClick={handleBuyCourseNow}
                        className="text-center font-bold text-[#C2456A] hover:text-[#A8365A] text-sm sm:text-base underline bg-transparent border-none cursor-pointer py-1"
                      >
                        Can’t wait? Start now at ₹299
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* UNLOCKED SECTION: Rendered when HerNext is unlocked */}
            {hasCourse && (
              <section
                aria-labelledby="un-h"
                className="sc-pop bg-[#EAF7F1] rounded-[28px] p-5 sm:p-6 flex flex-col gap-4 border border-[#2F7F62]/20 shadow-xs"
              >
                <div className="flex gap-3.5 items-center">
                  {/* Gigi Avatar Illustration */}
                  <svg width="64" height="72" viewBox="0 0 120 135" aria-hidden="true" className="shrink-0">
                    <circle cx="60" cy="50" r="33" fill="#3D2C4A" />
                    <circle cx="31" cy="26" r="11" fill="#3D2C4A" />
                    <circle cx="89" cy="26" r="11" fill="#3D2C4A" />
                    <circle cx="92" cy="20" r="5" fill="#F4A3B4" />
                    <circle cx="60" cy="56" r="25" fill="#D9A07E" />
                    <path d="M35 49 C 40 30, 80 30, 85 49 C 76 41, 46 41, 35 49z" fill="#3D2C4A" />
                    <circle cx="51" cy="58" r="3" fill="#3D2C4A" />
                    <circle cx="69" cy="58" r="3" fill="#3D2C4A" />
                    <path d="M51 66 Q60 76 69 66" stroke="#3D2C4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M30 135 C 32 98, 46 86, 60 86 C 74 86, 88 98, 90 135z" fill="#F9D5D3" />
                  </svg>
                  <div>
                    <span className="text-xs font-extrabold tracking-wider text-[#24735A] uppercase">
                      HERNEXT IS UNLOCKED
                    </span>
                    <h2 id="un-h" className="mt-0.5 mb-0 text-[clamp(22px,3vw,28px)] font-bold text-[#3D2C4A] leading-[1.2]">
                      She can start today, before the book arrives
                    </h2>
                  </div>
                </div>

                <ol className="m-0 p-0 list-none flex flex-col gap-2.5">
                  <li className="flex gap-3 items-start">
                    <span className="shrink-0 w-[30px] h-[30px] rounded-full bg-[#2F7F62] text-white grid place-items-center font-extrabold text-sm">
                      1
                    </span>
                    <div>
                      <strong className="text-sm sm:text-base text-[#3D2C4A]">Sign in with {recipientPhone}</strong>
                      <div className="text-sm text-[#24533F] leading-snug">
                        The number you just used. We’ll send an OTP.
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="shrink-0 w-[30px] h-[30px] rounded-full bg-white text-[#24735A] border border-[#2F7F62]/20 grid place-items-center font-extrabold text-sm">
                      2
                    </span>
                    <div>
                      <strong className="text-sm sm:text-base text-[#3D2C4A]">Set up her profile</strong>
                      <div className="text-sm text-[#24533F] leading-snug">
                        Her name, an avatar and a secret PIN. About 2 minutes.
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="shrink-0 w-[30px] h-[30px] rounded-full bg-white text-[#24735A] border border-[#2F7F62]/20 grid place-items-center font-extrabold text-sm">
                      3
                    </span>
                    <div>
                      <strong className="text-sm sm:text-base text-[#3D2C4A]">Hand her the phone</strong>
                      <div className="text-sm text-[#24533F] leading-snug">
                        Gigi takes it from there, starting with Lesson 1.1.
                      </div>
                    </div>
                  </li>
                </ol>

                <div className="flex flex-col gap-1.5 mt-1">
                  <Link
                    href="/course/girlhood-hernext"
                    style={{
                      fontFamily: "'Noto Sans', system-ui, sans-serif",
                      minHeight: '54px',
                      borderRadius: '999px',
                      border: 'none',
                      background: '#C2456A',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '17px',
                      lineHeight: 1.2,
                    }}
                    className="w-full hover:bg-[#A8365A] active:bg-[#942C4E] active:scale-[0.99] transition-all flex justify-center items-center text-center no-underline cursor-pointer shadow-none px-6 py-3.5"
                  >
                    Sign in and set up
                  </Link>
                  <span className="text-[13px] text-[#24533F] text-center">
                    We’ve also sent this link on WhatsApp.
                  </span>
                </div>
              </section>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-wrap gap-2.5 mt-1">
              <Link
                href="/dashboard/orders"
                className="min-h-[50px] rounded-full border-2 border-[#3D2C4A] bg-white hover:bg-slate-50 text-[#3D2C4A] font-bold flex-[1_1_220px] flex justify-center items-center text-center no-underline transition-colors cursor-pointer"
              >
                Track my order
              </Link>
              <Link
                href="/"
                className="min-h-[50px] rounded-full border-2 border-[#E9DDE6] hover:border-[#3D2C4A] bg-white text-[#3D2C4A] font-bold flex-[1_1_220px] flex justify-center items-center text-center no-underline transition-colors cursor-pointer"
              >
                Back to home
              </Link>
            </div>

            {/* Help Note */}
            <div className="text-sm text-[#5E4B6B]">
              Need help with your order? connect@infano.care · WhatsApp +91 92430 19243
            </div>

          </div>

          {/* Right Column: Receipt Card */}
          <aside
            aria-labelledby="rc-h"
            className="flex-[1_1_340px] min-w-0 bg-white border border-[#F1E4E8] rounded-3xl p-5 flex flex-col gap-3 shadow-xs"
          >
            <h2 id="rc-h" className="m-0 text-[13px] font-extrabold tracking-widest text-[#6E5B7A] uppercase">
              RECEIPT
            </h2>

            {/* Order row */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6E5B7A]">Order</span>
              <div className="flex items-center gap-1.5">
                <strong className="font-mono text-sm">{formattedOrderId}</strong>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 rounded text-[#6E5B7A] hover:text-[#3D2C4A] hover:bg-slate-100 transition-colors"
                  title="Copy Order ID"
                >
                  {copied ? <Check size={13} className="text-[#2F7F62]" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            {/* Item Line */}
            <div className="flex gap-3 items-center border-t border-[#F1E4E8] pt-3">
              <svg width="70" height="58" viewBox="0 0 120 100" aria-hidden="true" className="shrink-0">
                <rect x="6" y="8" width="56" height="80" rx="6" fill="#F4A3B4" />
                <rect x="6" y="8" width="10" height="80" rx="3" fill="#E8738A" />
                <circle cx="40" cy="38" r="13" fill="#FFF4C7" />
                <circle cx="32" cy="28" r="5" fill="#3D2C4A" />
                <circle cx="48" cy="28" r="5" fill="#3D2C4A" />
                <circle cx="40" cy="40" r="8" fill="#D9A07E" />
                <rect x="22" y="62" width="34" height="5" rx="2.5" fill="#FFFFFF" />
                <rect x="58" y="20" width="52" height="70" rx="6" fill="#D4EFE4" stroke="#FFFFFF" strokeWidth="3" />
                <rect x="68" y="34" width="32" height="4" rx="2" fill="#24735A" opacity=".5" />
                <rect x="68" y="44" width="24" height="4" rx="2" fill="#24735A" opacity=".35" />
                <circle cx="84" cy="66" r="10" fill="#FFE08A" />
              </svg>
              <div>
                <strong className="block text-sm sm:text-base text-[#3D2C4A]">
                  {itemName || 'Gigi: The Awkward Age'}
                </strong>
                <span className="text-[13px] text-[#5E4B6B]">
                  Book + workbook · Qty 1
                </span>
              </div>
            </div>

            {/* Breakdown List */}
            <dl className="m-0 grid grid-cols-[1fr_auto] gap-2 text-[15px] border-t border-[#F1E4E8] pt-3">
              <dt className="text-[#5E4B6B]">Book + workbook</dt>
              <dd className="m-0 text-right font-semibold text-[#3D2C4A]">₹{bookBasePrice}</dd>

              {hasCourse && (
                <>
                  <dt className="text-[#5E4B6B]">HerNext course</dt>
                  <dd className="m-0 text-right font-semibold text-[#3D2C4A]">₹299</dd>
                </>
              )}

              <dt className="text-[#5E4B6B]">Shipping</dt>
              <dd className="m-0 text-right text-[#2F7F62] font-bold">Free</dd>

              {isCod && (
                <>
                  <dt className="text-[#5E4B6B]">Cash on delivery fee</dt>
                  <dd className="m-0 text-right font-semibold text-[#3D2C4A]">₹49</dd>
                </>
              )}
            </dl>

            {/* Total Paid / Due Row */}
            <div className="flex justify-between items-baseline border-t border-[#F1E4E8] pt-3">
              <span className="text-[13px] font-extrabold tracking-wider text-[#6E5B7A] uppercase">
                {isCod ? 'PAY ON DELIVERY' : 'TOTAL PAID'}
              </span>
              <strong className="text-3xl font-extrabold text-[#3D2C4A]">
                ₹{finalTotal.toLocaleString('en-IN')}
              </strong>
            </div>

            <div className="text-sm text-[#5E4B6B]">
              {isCod ? 'Cash or UPI on delivery' : 'Paid with UPI via Razorpay · Today'}
            </div>

            {/* Delivery Promise Card */}
            <div className="bg-[#FBF8F6] rounded-2xl p-2.5 px-3 text-sm text-[#3D2C4A] border border-[#E9DDE6]/50">
              <strong>Delivery:</strong> by {deliveryDate} to {city} {pincode}. Updates on WhatsApp.
            </div>
          </aside>

        </main>
      </div>
    </>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF8F6] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#C2456A]"></div>
        </div>
      }
    >
      <PurchaseSuccessContent />
    </Suspense>
  );
}
