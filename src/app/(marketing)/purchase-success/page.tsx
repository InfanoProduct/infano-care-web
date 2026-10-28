'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Copy, Check, BookOpen, FileText, HelpCircle, ArrowRight, Sparkles, Star, Play, Video } from 'lucide-react';
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

    const particleCount = 180;
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
        p.x += p.speedX + Math.sin(p.wobble) * 0.5; // Wind drift simulation
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

        // Recycle particle when it falls past the screen
        if (p.y > height + 20) {
          p.y = -40;
          p.x = Math.random() * width;
          p.speedY = Math.random() * 4 + 3;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Stop animation loop after 8 seconds
    const timeoutId = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, width, height);
    }, 8000);

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
  const { currencySymbol, currencyCode } = useRegion();
  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');

  const [featuredCourse, setFeaturedCourse] = useState<any>({
    id: '53dd5354-fad3-460b-b60c-687d4082cc0f',
    title: 'Adolescent & Parenting Masterclass',
    description: 'Evidence-based video lessons on puberty transitions, emotional regulation, and confident communication.',
    thumbnailUrl: 'https://infano-prod.duckdns.org/images/CourseImageM1.png',
    timeDuration: 345,
    category: 'Parenting & Adolescent Care',
    price: 999,
    isFree: false,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchCourses = async () => {
      try {
        const res: any = await apiClient.get('/lms/explore');
        if (isMounted && Array.isArray(res) && res.length > 0) {
          const masterclass = res.find((c: any) => c.title?.toLowerCase().includes('masterclass')) || res[0];
          if (masterclass) {
            setFeaturedCourse(masterclass);
          }
        }
      } catch (err) {
        // Fallback gracefully
      }
    };
    fetchCourses();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const idFromParams = searchParams.get('transaction_id');
    setTransactionId(idFromParams || 'ORDER_' + Math.floor(Math.random() * 1000000));
  }, [searchParams]);

  const valueStr = searchParams.get('value') || '499';
  const qtyStr = searchParams.get('quantity') || '1';
  const itemId = searchParams.get('item_id') || '5e569d64-9678-4689-a594-ec9c0020f07b';
  const itemName = searchParams.get('item_name') || 'Gigi - The Awkward Age';
  const priceStr = searchParams.get('price') || '499';
  const imageUrl = searchParams.get('image_url') || '/Page-1.png';

  // Extra parameters with smart fallback calculations
  const unitPrice = parseFloat(priceStr);
  const qty = parseInt(qtyStr, 10);
  const totalAmount = parseFloat(valueStr);

  const discount = parseFloat(searchParams.get('discount') || '0');
  const deliveryParam = searchParams.get('delivery');
  const codChargeParam = searchParams.get('cod_charge');

  const calculatedSubtotal = unitPrice * qty;
  const paymentMethodParam = searchParams.get('payment_method');

  const paymentMethod = paymentMethodParam
    ? paymentMethodParam
    : (totalAmount > calculatedSubtotal ? 'COD' : 'ONLINE');

  const delivery = deliveryParam
    ? parseFloat(deliveryParam)
    : 0;

  const codCharge = codChargeParam
    ? parseFloat(codChargeParam)
    : (paymentMethod === 'COD' ? Math.max(0, totalAmount - (calculatedSubtotal + delivery - discount)) : 0);

  const subtotalStr = searchParams.get('subtotal');
  const subtotal = subtotalStr ? parseFloat(subtotalStr) : calculatedSubtotal;

  const formattedOrderId = transactionId ? formatOrderId(transactionId) : 'Loading...';

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedOrderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (isAnalyticsEnabled() && transactionId) {
      const windowObj = window as any;
      windowObj.dataLayer = windowObj.dataLayer || [];
      windowObj.dataLayer.push({
        event: 'purchase',
        value: totalAmount,
        currency: currencyCode,
        transaction_id: transactionId,
        content_ids: [itemId],
        content_type: 'product',
        ecommerce: {
          transaction_id: transactionId,
          currency: currencyCode,
          value: totalAmount,
          items: [{
            item_id: itemId,
            item_name: itemName,
            price: unitPrice,
            quantity: qty
          }]
        }
      });
    }
  }, [transactionId, totalAmount, qty, itemId, itemName, unitPrice, currencyCode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#FAF5FF] via-[#FDF8F6] to-[#EFF6FF] p-4 sm:p-6 md:p-8 font-sans relative overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-slow {
          animation: bounceSlow 3s ease-in-out infinite;
        }
      `}} />
      <CanvasConfetti />

      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] aspect-square rounded-full bg-purple-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] aspect-square rounded-full bg-rose-200/20 blur-3xl pointer-events-none" />

      <div className="max-w-5xl w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 relative z-10">
        <div className="grid md:grid-cols-12">

          {/* Left Column: Success Message & Course Promotion */}
          <div className="md:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
            <div>
              {/* Header with checkmark badge */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-13 h-13 sm:w-14 sm:h-14 bg-linear-to-tr from-emerald-400 to-teal-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-450/25 border border-emerald-300/30 shrink-0 animate-bounce-slow">
                  <CheckCircle2 size={30} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Order Placed Successfully
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    Order Confirmed! 🎉
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-0.5 font-medium">
                    Thank you! Your book is on its way. We'll share tracking updates via WhatsApp & email.
                  </p>
                </div>
              </div>

              {/* Course Advertisement Card */}
              <div className="bg-linear-to-br from-purple-50/70 via-indigo-50/40 to-pink-50/60 border border-purple-200/80 hover:border-purple-300 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden group mb-5">
                {/* Decorative glow */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

                {/* Card Header Tag Row */}
                <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider border border-primary/15">
                    <Sparkles size={11} className="text-primary" />
                    Recommended Next Step
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    <span>4.9 (500+ Parents)</span>
                  </div>
                </div>

                {/* Main course info row */}
                <div className="flex gap-3.5 sm:gap-4 items-start relative z-10">
                  {/* Course Thumbnail */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-purple-100/80 shadow-xs group-hover:scale-[1.02] transition-transform">
                    <img
                      src={featuredCourse.thumbnailUrl || 'https://infano-prod.duckdns.org/images/CourseImageM1.png'}
                      alt={featuredCourse.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <div className="w-7 h-7 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-xs">
                        <Play size={11} className="fill-primary text-primary ml-0.5" />
                      </div>
                    </div>
                    {featuredCourse.timeDuration && (
                      <div className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {Math.round(featuredCourse.timeDuration / 60)}h {featuredCourse.timeDuration % 60}m
                      </div>
                    )}
                  </div>

                  {/* Course Details */}
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-primary mb-0.5">
                      {featuredCourse.category || 'Parenting & Adolescent Care'}
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors font-heading">
                      {featuredCourse.title}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                      While waiting for your book, dive into expert-led video lessons to navigate puberty transitions, mood swings, and build lifelong confidence.
                    </p>
                  </div>
                </div>

                {/* Highlights Pill Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-purple-150/70 relative z-10">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-650 bg-white/80 px-2 py-0.5 rounded-lg border border-purple-100/60 shadow-3xs">
                    <Video size={11} className="text-primary" /> 19 Video Lessons
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-650 bg-white/80 px-2 py-0.5 rounded-lg border border-purple-100/60 shadow-3xs">
                    <CheckCircle2 size={11} className="text-emerald-600" /> Pediatrician Guided
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-650 bg-white/80 px-2 py-0.5 rounded-lg border border-purple-100/60 shadow-3xs">
                    <BookOpen size={11} className="text-primary" /> Practical Quizzes
                  </span>
                </div>

                {/* CTA Action inside Card */}
                <div className="mt-4 flex flex-col sm:flex-row items-center gap-2.5 relative z-10">
                  <button
                    onClick={() => router.push(featuredCourse.id ? `/course/${featuredCourse.id}` : '/course')}
                    className="w-full sm:flex-1 py-2.5 px-4 bg-linear-to-r from-primary via-purple-700 to-indigo-700 hover:from-primary/95 hover:to-indigo-800 text-white rounded-xl font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer group/btn"
                  >
                    <span>Explore Masterclass Course</span>
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => router.push('/course')}
                    className="text-xs font-bold text-slate-600 hover:text-primary transition-colors py-1.5 px-3 text-center cursor-pointer"
                  >
                    Browse all courses →
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions & Compact Contact Info */}
            <div className="mt-auto pt-2 space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer text-center text-xs sm:text-sm flex items-center justify-center gap-1.5"
              >
                Back to Home <ArrowRight size={13} />
              </button>

              {/* Repositioned Contact Information as subtle, accessible text */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-1.5 text-slate-650">
                  <HelpCircle size={13} className="text-slate-400 shrink-0" />
                  <span>Need help with your order?</span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="mailto:connect@infano.care"
                    className="inline-flex items-center gap-1 text-slate-650 hover:text-primary transition-colors hover:underline"
                  >
                    <span>📧</span>
                    <span className="font-semibold">connect@infano.care</span>
                  </a>
                  <span className="text-slate-300">•</span>
                  <a
                    href="https://wa.me/916362994347"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-650 hover:text-emerald-600 transition-colors hover:underline"
                  >
                    <span>💬</span>
                    <span className="font-semibold">+91 6362994347</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Receipt & Breakdown */}
          <div className="md:col-span-5 bg-slate-50/50 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText size={16} className="text-slate-400" />
              Receipt Details
            </h2>

            {/* Receipt Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 sm:p-6 shadow-xl shadow-slate-100/50 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-primary via-indigo-500 to-purple-600" />

              {/* Order ID: Shortened display */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Order ID</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-lg text-slate-700 font-bold select-all">
                    {formattedOrderId}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-slate-400 hover:text-slate-650 transition-colors p-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200/50"
                    title="Copy Order ID"
                  >
                    {copied ? (
                      <Check size={12} className="text-green-600 animate-in fade-in" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>

              {/* Item Info */}
              <div className="flex gap-3.5 pt-4 border-t border-slate-100">
                <div className="w-12 h-16 relative rounded-lg overflow-hidden bg-slate-50 shrink-0 border border-slate-100 shadow-3xs">
                  <img
                    src={imageUrl}
                    alt={itemName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-extrabold text-slate-800 truncate">{itemName}</h4>
                  <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Quantity: {qty}</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-3.5 pt-4 border-t border-slate-100 text-xs font-bold">
                <div className="flex justify-between items-center text-slate-500 font-medium">
                  <span>Unit Price</span>
                  <span className="text-slate-800 font-extrabold"><span>{currencySymbol}</span><span>{unitPrice}</span></span>
                </div>

                <div className="flex justify-between items-center text-slate-500 font-medium">
                  <span>Item Subtotal</span>
                  <span className="text-slate-800 font-extrabold"><span>{currencySymbol}</span><span>{subtotal}</span></span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span>Discount</span>
                    <span>-<span>{currencySymbol}</span><span>{discount}</span></span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-500 font-medium">
                  <span>Shipping</span>
                  {delivery > 0 ? (
                    <span className="text-slate-800 font-extrabold"><span>{currencySymbol}</span><span>{delivery}</span></span>
                  ) : (
                    <span className="text-emerald-600 font-extrabold">Free</span>
                  )}
                </div>

                {paymentMethod === 'COD' && codCharge > 0 && (
                  <div className="flex justify-between items-center text-slate-500 font-medium">
                    <span>Cash on Delivery (COD)</span>
                    <span className="text-slate-800 font-extrabold"><span>{currencySymbol}</span><span>{codCharge}</span></span>
                  </div>
                )}
              </div>

              {/* Total Paid */}
              <div className="pt-4 border-t border-dashed border-slate-200 flex justify-between items-end">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Paid</span>
                  <p className="text-[9px] text-slate-400 font-medium">All taxes included</p>
                </div>
                <span className="text-3xl font-black text-slate-900 tracking-tight"><span>{currencySymbol}</span><span>{totalAmount}</span></span>
              </div>
            </div>

            {/* Guarantee / Security info */}
            <div className="mt-4 text-center text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1.5">
              <span>🔒 Secure checkout transaction</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <PurchaseSuccessContent />
    </React.Suspense>
  );
}
