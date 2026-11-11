'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Script from 'next/script';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { ShopService, Book, getBookSlug, slugify } from '@/services/shop.service';
import { useRegion, getBookPrice, getShippingCharge } from '@/hooks/use-region';
import {
  ArrowLeft, CheckCircle2, ShoppingBag, Tag,
  Loader2, CreditCard, Truck, AlertCircle,
  Plus, Minus, Lock, Check, Gift, ChevronRight,
  ChevronLeft, X, Sparkles, Star, Eye
} from 'lucide-react';
import { isAnalyticsEnabled } from '@/components/common/Analytics';

// Real high-resolution pages for the Look Inside Lightbox modal
const LIGHTBOX_PAGES = [
  { n: 1, name: 'Front Cover', part: 'Guide Book', image: '/Page-1.png', bg: '#F7B267', ink: '#9A4A16' },
  { n: 2, name: 'Table of Contents', part: 'Guide Book', image: '/Page-2.png', bg: '#FDEFF0', ink: '#A8365A' },
  { n: 3, name: 'A Day at School', part: 'Guide Book', image: '/page-3.png', bg: '#E3DAF5', ink: '#5A4385' },
  { n: 4, name: 'Talking to Mom', part: 'Guide Book', image: '/Page-4.png', bg: '#FDEFF0', ink: '#A8365A' },
  { n: 5, name: 'Inside Her Mind', part: 'Guide Book', image: '/Page-5.png', bg: '#F1ECFA', ink: '#5A4385' },
  { n: 6, name: 'Field Guide Cover', part: 'Workbook', image: 'https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952570/infano-assets/1-Gigi-Field-Guide-21x27-00-Front-Cover_qpkhza.png', bg: '#D8ECF8', ink: '#2F6494' },
  { n: 7, name: 'My Period Plan', part: 'Workbook', image: 'https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952568/infano-assets/2-Gigi-Field-Guide-21x27-Page-002-How-to-use_kpp2kp.png', bg: '#D4EFE4', ink: '#24735A' },
  { n: 8, name: 'Calm Quest Grid', part: 'Workbook', image: 'https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952569/infano-assets/3-Gigi-Field-Guide-21x27-Page-009-Calm-Quest_zk9dvx.png', bg: '#D4EFE4', ink: '#24735A' },
  { n: 9, name: 'Body Check-in', part: 'Workbook', image: 'https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952571/infano-assets/4-Gigi-Field-Guide-21x27-Page-011-Myth-or-Fact_eklea8.png', bg: '#E3DAF5', ink: '#5A4385' },
  { n: 10, name: 'Crossword Puzzle', part: 'Workbook', image: 'https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952567/infano-assets/6-Gigi-Field-Guide-21x27-Page-020-Heart-to-Heart-Crossword_z9yapq.png', bg: '#D8ECF8', ink: '#2F6494' },
  { n: 11, name: 'Sticker Sheet', part: 'Workbook', image: 'https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952570/infano-assets/8-Gigi-Field-Guide-21x27-Page-106-Sticker-Sheet_fzmcro.png', bg: '#FFF4C7', ink: '#8A6410' },
];

function getEstimatedDeliveryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 4);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

// List of all Indian states & union territories for address selection
const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const routeSlug = (params?.slug as string) || '';
  const bookIdentifier = searchParams.get('book') || searchParams.get('slug') || routeSlug || searchParams.get('bookId') || '';
  const nameParam = searchParams.get('name') || '';
  const phoneParam = searchParams.get('phone') || '';
  const emailParam = searchParams.get('email') || '';
  const giftParam = searchParams.get('gift') === 'true';

  const { user } = useAuthStore();
  const {
    region,
    currencySymbol,
    currencyCode,
    dialCode,
    getLocalizedLink,
    formatPrice
  } = useRegion();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState(''); // Flat / House / Building
  const [addressLine2, setAddressLine2] = useState(''); // Street / Area / Sector
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isGift, setIsGift] = useState(giftParam);
  const [giftNote, setGiftNote] = useState('');

  // Course Addon & Payment
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [addCourse, setAddCourse] = useState(true); // default ON for maximum value as in template
  const [showSummaryDetails, setShowSummaryDetails] = useState(false);

  // Look Inside Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Coupons
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Payment Failed State
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentFailedReason, setPaymentFailedReason] = useState('');

  // Pincode auto-lookup status
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const deliveryDateString = useMemo(() => getEstimatedDeliveryDate(), []);

  // Autofill user details
  useEffect(() => {
    if (user || nameParam || phoneParam || emailParam) {
      if (nameParam && !fullName) setFullName(nameParam);
      else if (user?.profile?.displayName && !fullName) setFullName(user.profile.displayName);

      if (emailParam && !email) setEmail(emailParam);
      else if (user?.email && !email) setEmail(user.email);

      let targetPhone = phoneParam || user?.phone || '';
      if (targetPhone) {
        const cleaned = targetPhone.replace(/[\s\-()]/g, '');
        if (cleaned.startsWith('+91') && cleaned.length === 13) setPhone(cleaned.substring(3));
        else if (cleaned.startsWith('91') && cleaned.length === 12) setPhone(cleaned.substring(2));
        else setPhone(cleaned);
      }
    }
  }, [user, nameParam, phoneParam, emailParam]);

  // Load Book dynamically by slug or ID
  useEffect(() => {
    async function loadBook() {
      try {
        let loadedBook: Book | null = null;
        if (bookIdentifier) {
          try {
            const data = await ShopService.getBook(bookIdentifier);
            if (data && data.id) loadedBook = data;
          } catch {
            // fallback to getBooks
          }
        }

        if (!loadedBook) {
          const books = await ShopService.getBooks();
          if (books && books.length > 0) {
            if (bookIdentifier) {
              const normalized = bookIdentifier.toLowerCase().trim();
              loadedBook = books.find(b => {
                const titleSlug = slugify(b.title || '');
                const bookSlug = (b.slug || '').toLowerCase().trim();
                return (
                  b.id === bookIdentifier ||
                  bookSlug === normalized ||
                  titleSlug === normalized ||
                  normalized.startsWith(titleSlug) ||
                  titleSlug.startsWith(normalized)
                );
              }) || null;
            }
            if (!loadedBook) {
              loadedBook = books.find(b => b.isActive) || books[0];
            }
          }
        }

        if (loadedBook) {
          setBook(loadedBook);
          // If URL contains raw UUID parameter (?bookId=...), cleanly replace with slug parameter in URL bar
          if (typeof window !== 'undefined' && searchParams.has('bookId')) {
            const currentParams = new URLSearchParams(searchParams.toString());
            const canonicalSlug = getBookSlug(loadedBook);
            currentParams.delete('bookId');
            if (canonicalSlug) {
              currentParams.set('book', canonicalSlug);
            }
            const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
            window.history.replaceState(null, '', newUrl);
          }
        }
      } catch (err) {
        console.error('Error loading checkout book:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [bookIdentifier, searchParams]);

  // Pincode auto-lookup
  useEffect(() => {
    const cleanPin = pincode.replace(/\D/g, '');
    if (cleanPin.length === 6 && region === 'IN') {
      setPincodeLoading(true);
      fetch(`/api/pincode?code=${cleanPin}&region=IN`)
        .then(res => res.json())
        .then(data => {
          if (data && data.success) {
            if (data.city) {
              setCity(data.city);
            }
            if (data.state) {
              const matchedState = INDIAN_STATES.find(
                s => s.toLowerCase() === data.state.toLowerCase() ||
                     s.toLowerCase().replace(/\s+/g, '') === data.state.toLowerCase().replace(/\s+/g, '')
              );
              setState(matchedState || data.state);
            }
          }
        })
        .catch(err => {
          console.warn('Pincode lookup error:', err);
        })
        .finally(() => setPincodeLoading(false));
    }
  }, [pincode, region]);

  // Auto-disable course addon if COD is chosen
  useEffect(() => {
    if (paymentMethod === 'COD') {
      setAddCourse(false);
    }
  }, [paymentMethod]);

  // Price calculations
  const rawBookPrice = book ? getBookPrice(book, region) : 499;
  const coursePrice = 299;
  const isCod = paymentMethod === 'COD';
  const isCourseAdded = !isCod && addCourse;
  const codChargeRate = book?.codChargeIN || 49;
  const codFee = isCod ? codChargeRate : 0;
  const shippingFee = 0; // Free delivery as per design

  const subtotalBeforeDiscount = rawBookPrice + (isCourseAdded ? coursePrice : 0) + codFee;
  const totalAmount = Math.max(0, subtotalBeforeDiscount - discountAmount);

  // Validate coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !book) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await ShopService.validateCoupon(couponCode.trim(), [
        { bookId: book.id, quantity: 1, price: rawBookPrice }
      ]);
      if (res && res.coupon) {
        setAppliedCoupon(res.coupon);
        setDiscountAmount(res.discountAmount || 0);
      } else {
        setCouponError('Invalid coupon code');
      }
    } catch (e: any) {
      setCouponError(e.message || 'Failed to apply coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
    setCouponError(null);
  };

  // Form Validation & Normalization
  const getNormalizedPhone = () => {
    let clean = phone.trim().replace(/[\s\-()]/g, '');
    if (clean.startsWith('+91')) clean = clean.slice(3);
    else if (clean.startsWith('91') && clean.length === 12) clean = clean.slice(2);
    else if (clean.startsWith('0') && clean.length === 11) clean = clean.slice(1);
    return clean;
  };

  const validateForm = () => {
    const cleanPhone = getNormalizedPhone();
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!pincode.trim() || (region === 'IN' && pincode.replace(/\D/g, '').length !== 6)) {
      setError('Please enter a valid 6-digit delivery pincode');
      return false;
    }
    if (!address.trim()) {
      setError('Please enter your flat / house and building address');
      return false;
    }
    if (!city.trim()) {
      setError('Please enter your city');
      return false;
    }
    if (!state.trim()) {
      setError('Please select or enter your state');
      return false;
    }
    setError(null);
    return true;
  };

  // Handle Order Placement
  const handlePlaceOrder = async () => {
    if (!validateForm() || !book) return;
    setProcessing(true);
    setError(null);

    try {
      const cleanPhone = getNormalizedPhone();
      const combinedAddress = [
        address.trim(),
        addressLine2.trim(),
        landmark.trim() ? `Landmark: ${landmark.trim()}` : null
      ].filter(Boolean).join(', ');

      const orderData = {
        guestName: fullName.trim(),
        guestPhone: cleanPhone,
        guestEmail: email.trim() || user?.email || (fullName.toLowerCase().replace(/[^a-z0-9]/g, '') + '@guest.infano.care'),
        shippingAddress: combinedAddress,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        paymentMethod: paymentMethod,
        items: [{ bookId: book.id, quantity: 1 }],
        country: region || 'IN',
        currency: currencyCode || 'INR',
        couponCode: appliedCoupon?.code || undefined,
        comments: JSON.stringify({
          addonCourse: isCourseAdded,
          isGift,
          giftNote: isGift ? giftNote.trim() : null,
          country: region,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        })
      };

      const res = await ShopService.createOrder(orderData);

      if (paymentMethod === 'ONLINE') {
        if (!res.razorpayOrderId) {
          throw new Error('Razorpay order initiation failed. Please try again.');
        }

        const options = {
          key: res.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: Math.round(totalAmount * 100),
          currency: currencyCode,
          name: 'Infano Care',
          description: `${book.title}${isCourseAdded ? ' + HerNext Video Course' : ''}`,
          image: '/logo/infano-logo-for-light-bg.png',
          order_id: res.razorpayOrderId,
          handler: async function (response: any) {
            try {
              await ShopService.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });

              const successParams = new URLSearchParams({
                transaction_id: response.razorpay_order_id,
                value: totalAmount.toString(),
                item_name: book.title,
                course: isCourseAdded ? 'true' : 'false',
                cod: 'false',
                gift: isGift ? 'true' : 'false',
                recipient_phone: phone.trim(),
                city: city.trim(),
                pincode: pincode.trim(),
                delivery_date: deliveryDateString,
              });

              router.push(getLocalizedLink(`/purchase-success?${successParams.toString()}`));
            } catch (vErr: any) {
              setPaymentFailed(true);
              setPaymentFailedReason(vErr.message || 'Payment signature verification failed.');
              setProcessing(false);
            }
          },
          prefill: {
            name: fullName.trim(),
            contact: cleanPhone,
            email: email.trim() || user?.email || '',
          },
          theme: {
            color: '#C2456A',
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
            }
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.on('payment.failed', function (resp: any) {
          setPaymentFailed(true);
          setPaymentFailedReason(resp?.error?.description || 'Your transaction was declined.');
          setProcessing(false);
        });
        razorpay.open();
      } else {
        // Cash on delivery - immediate success
        const successParams = new URLSearchParams({
          transaction_id: res.id || `ORD-${Date.now().toString().slice(-8)}`,
          value: totalAmount.toString(),
          item_name: book.title,
          course: 'false',
          cod: 'true',
          gift: isGift ? 'true' : 'false',
          recipient_phone: phone.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
          delivery_date: deliveryDateString,
        });

        router.push(getLocalizedLink(`/purchase-success?${successParams.toString()}`));
      }
    } catch (err: any) {
      console.error('Order error:', err);
      setError(err.message || 'Order placement failed. Please verify your details.');
      setProcessing(false);
    }
  };

  if (loading || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF8F6]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#C2456A]" size={42} />
          <p className="text-sm font-semibold text-[#5E4B6B]">Loading secure checkout...</p>
        </div>
      </div>
    );
  }

  const currentLightboxPage = lightboxIndex !== null ? LIGHTBOX_PAGES[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-[#FBF8F6] text-[#3D2C4A] selection:bg-[#C2456A]/20" style={{ fontFamily: "'Noto Sans', system-ui, sans-serif" }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Embedded Animation & Micro-styling */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .ck-root * { box-sizing: border-box; }
        .ck-root, .ck-root button, .ck-root input, .ck-root textarea, .ck-root select {
          font-family: 'Noto Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        .ck-root button { cursor: pointer; }
        .ck-pop { animation: ckpop .35s cubic-bezier(.2, 1.3, .4, 1); }
        @keyframes ckpop { 0% { transform: scale(0.97); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}} />

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
            <span className="font-extrabold text-xl text-[#3D2C4A] tracking-tight group-hover:text-[#C2456A] transition-colors">infano</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#24735A] bg-[#EAF7F1] px-3 py-1 rounded-full border border-[#24735A]/20">
            <Lock size={14} className="stroke-[2.5]" />
            <span>Secure checkout</span>
          </span>
        </div>
      </header>

      {/* Main Checkout Area */}
      <main className="max-w-[1180px] mx-auto px-4 sm:px-5 py-6 sm:py-8 pb-16 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        
        {/* Left Form Column */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#3D2C4A] leading-tight">Checkout</h1>
            <Link
              href={getLocalizedLink(book ? `/${getBookSlug(book)}` : "/gigi-the-awkward-age-book")}
              className="text-xs font-semibold text-[#5E4B6B] hover:text-[#C2456A] transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to book details
            </Link>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Contact Details */}
          <section aria-labelledby="c1" className="bg-white border border-[#F1E4E8] rounded-3xl p-5 sm:p-6 flex flex-col gap-3.5 shadow-xs">
            <h2 id="c1" className="text-lg font-bold text-[#3D2C4A] m-0">1 · Contact details</h2>
            <p className="text-sm text-[#5E4B6B] -mt-1 leading-relaxed">
              We send order tracking on WhatsApp and your receipt/invoice via email.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm font-semibold text-[#3D2C4A]">
                Mobile number
                <div className="flex gap-2 items-center">
                  <span className="min-h-[48px] px-3.5 rounded-xl bg-[#FBF8F6] border-[1.5px] border-[#E9DDE6] grid place-items-center font-bold text-[#3D2C4A]">
                    {dialCode || '+91'}
                  </span>
                  <input
                    id="ph"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d\s-]/g, ''))}
                    placeholder="98765 43210"
                    className="flex-1 min-w-0 min-h-[48px] rounded-xl border-[1.5px] border-[#E9DDE6] px-3.5 text-base text-[#3D2C4A] font-semibold focus:outline-none focus:border-[#C2456A] transition-colors"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1 text-sm font-semibold text-[#3D2C4A]">
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. priya@gmail.com"
                  className="min-h-[48px] rounded-xl border-[1.5px] border-[#E9DDE6] px-3.5 text-base text-[#3D2C4A] focus:outline-none focus:border-[#C2456A] transition-colors"
                />
              </label>
            </div>
          </section>

          {/* Section 2: Delivery Address */}
          <section aria-labelledby="c2" className="bg-white border border-[#F1E4E8] rounded-3xl p-5 sm:p-6 flex flex-col gap-3.5 shadow-xs">
            <h2 id="c2" className="text-lg font-bold text-[#3D2C4A] m-0">2 · Delivery address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm font-semibold text-[#3D2C4A]">
                Full name
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="min-h-[48px] rounded-xl border-[1.5px] border-[#E9DDE6] px-3.5 text-base text-[#3D2C4A] focus:outline-none focus:border-[#C2456A] transition-colors"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-semibold text-[#3D2C4A]">
                Pincode
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 560038"
                    className="w-full min-h-[48px] rounded-xl border-[1.5px] border-[#E9DDE6] px-3.5 text-base text-[#3D2C4A] focus:outline-none focus:border-[#C2456A] transition-colors"
                  />
                  {pincodeLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-[#C2456A] font-semibold bg-white/90 px-1 py-0.5 rounded">
                      <Loader2 size={15} className="animate-spin text-[#C2456A]" />
                      <span>Checking...</span>
                    </div>
                  )}
                </div>
              </label>

              <label className="sm:col-span-2 flex flex-col gap-1 text-sm font-semibold text-[#3D2C4A]">
                Flat, House no., Building, Apartment
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 4B, Sunflower Apartments"
                  className="min-h-[48px] rounded-xl border-[1.5px] border-[#E9DDE6] px-3.5 text-base text-[#3D2C4A] focus:outline-none focus:border-[#C2456A] transition-colors"
                />
              </label>

              <label className="sm:col-span-2 flex flex-col gap-1 text-sm font-semibold text-[#3D2C4A]">
                Area, Street, Sector, Village
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="e.g. 12th Main Road, HAL 2nd Stage, Indiranagar"
                  className="min-h-[48px] rounded-xl border-[1.5px] border-[#E9DDE6] px-3.5 text-base text-[#3D2C4A] focus:outline-none focus:border-[#C2456A] transition-colors"
                />
              </label>

              {/* City (Separate Field) */}
              <label className="flex flex-col gap-1 text-sm font-semibold text-[#3D2C4A]">
                City
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="min-h-[48px] rounded-xl border-[1.5px] border-[#E9DDE6] px-3.5 text-base text-[#3D2C4A] focus:outline-none focus:border-[#C2456A] transition-colors"
                />
              </label>

              {/* State (Separate Field) */}
              <label className="flex flex-col gap-1 text-sm font-semibold text-[#3D2C4A]">
                State
                {region === 'IN' ? (
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="min-h-[48px] rounded-xl border-[1.5px] border-[#E9DDE6] px-3.5 text-base text-[#3D2C4A] bg-white focus:outline-none focus:border-[#C2456A] transition-colors cursor-pointer"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State / Province"
                    className="min-h-[48px] rounded-xl border-[1.5px] border-[#E9DDE6] px-3.5 text-base text-[#3D2C4A] focus:outline-none focus:border-[#C2456A] transition-colors"
                  />
                )}
              </label>

              <label className="sm:col-span-2 flex flex-col gap-1 text-sm font-semibold text-[#3D2C4A]">
                Landmark (optional)
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near BDA Complex / Opposite Metro Station"
                  className="min-h-[48px] rounded-xl border-[1.5px] border-[#E9DDE6] px-3.5 text-base text-[#3D2C4A] focus:outline-none focus:border-[#C2456A] transition-colors"
                />
              </label>
            </div>

            {/* Delivery Promise Badge */}
            <div className="text-sm font-semibold text-[#24735A] flex items-center gap-1.5 mt-1 bg-[#EAF7F1] px-3 py-1.5 rounded-xl border border-[#24735A]/20 w-fit">
              <Check size={16} className="stroke-[3]" />
              <span>Delivers to {city || 'your city'} {pincode} by {deliveryDateString}</span>
            </div>

            {/* Gift option */}
            <div className="border-t border-[#F1E4E8] pt-3 mt-1">
              <label className="flex gap-2.5 items-center text-sm sm:text-base font-semibold text-[#3D2C4A] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="w-5 h-5 accent-[#C2456A] rounded-md cursor-pointer"
                />
                <span>This is a gift (we’ll add a note and hide the price)</span>
              </label>

              {isGift && (
                <div className="mt-3 ck-pop">
                  <textarea
                    rows={2}
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    placeholder="Write a sweet message for the recipient (printed on a lovely card inside)..."
                    className="w-full rounded-xl border-[1.5px] border-[#E9DDE6] p-3 text-sm text-[#3D2C4A] focus:outline-none focus:border-[#C2456A] transition-colors"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Payment Method */}
          <section aria-labelledby="c3" className="bg-white border border-[#F1E4E8] rounded-3xl p-5 sm:p-6 flex flex-col gap-3 shadow-xs">
            <h2 id="c3" className="text-lg font-bold text-[#3D2C4A] m-0">3 · Payment</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Pay Online */}
              <button
                type="button"
                role="radio"
                aria-checked={paymentMethod === 'ONLINE'}
                onClick={() => setPaymentMethod('ONLINE')}
                className={`text-left flex gap-3 items-center min-h-[64px] h-full p-3 sm:px-4 rounded-2xl transition-all cursor-pointer ${
                  paymentMethod === 'ONLINE'
                    ? 'border-2 border-[#C2456A] bg-[#FDEFF0]'
                    : 'border-[1.5px] border-[#E9DDE6] bg-white hover:border-[#C2456A]/40'
                }`}
              >
                <span className={`w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${
                  paymentMethod === 'ONLINE' ? 'border-[#C2456A]' : 'border-[#C9B9C9]'
                }`}>
                  {paymentMethod === 'ONLINE' && <span className="w-2.5 h-2.5 rounded-full bg-[#C2456A]" />}
                </span>
                <span className="flex-1 min-w-0">
                  <strong className="block text-base font-bold text-[#3D2C4A]">Pay online</strong>
                  <span className="text-xs text-[#5E4B6B] block mt-0.5">UPI, cards, net banking or wallets via Razorpay</span>
                </span>
              </button>

              {/* Option 2: Cash on Delivery */}
              <button
                type="button"
                role="radio"
                aria-checked={paymentMethod === 'COD'}
                onClick={() => setPaymentMethod('COD')}
                className={`text-left flex gap-3 items-center min-h-[64px] h-full p-3 sm:px-4 rounded-2xl transition-all cursor-pointer ${
                  paymentMethod === 'COD'
                    ? 'border-2 border-[#C2456A] bg-[#FDEFF0]'
                    : 'border-[1.5px] border-[#E9DDE6] bg-white hover:border-[#C2456A]/40'
                }`}
              >
                <span className={`w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${
                  paymentMethod === 'COD' ? 'border-[#C2456A]' : 'border-[#C9B9C9]'
                }`}>
                  {paymentMethod === 'COD' && <span className="w-2.5 h-2.5 rounded-full bg-[#C2456A]" />}
                </span>
                <span className="flex-1 min-w-0">
                  <strong className="block text-base font-bold text-[#3D2C4A]">Cash on delivery</strong>
                  <span className="text-xs text-[#5E4B6B] block mt-0.5">₹{codChargeRate} handling fee · book only</span>
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#6E5B7A] shrink-0">
                  + ₹{codChargeRate}
                </span>
              </button>
            </div>
          </section>
        </div>

        {/* Right Order Summary Column */}
        <aside aria-labelledby="sum-h" className="w-full lg:w-[380px] shrink-0 sticky top-20 self-start flex flex-col gap-3.5 z-10">
          <section className="bg-white border border-[#F1E4E8] rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between items-center gap-2">
              <h2 id="sum-h" className="text-lg font-bold text-[#3D2C4A] m-0">Order summary</h2>
              <button
                type="button"
                onClick={() => setShowSummaryDetails(!showSummaryDetails)}
                className="md:hidden text-xs font-bold text-[#C2456A] hover:underline"
              >
                {showSummaryDetails ? 'Hide details' : 'Show details'} · {currencySymbol}{totalAmount}
              </button>
            </div>

            {/* Product summary row */}
            <div className="flex gap-3.5 items-center">
              <div className="w-20 h-20 rounded-2xl bg-[#FDEFF0] border border-[#F1E4E8] overflow-hidden relative shrink-0">
                <Image
                  src={book.imageUrl || '/Page-1.png'}
                  alt={book.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <strong className="block font-bold text-base text-[#3D2C4A] line-clamp-1">{book.title}</strong>
                <span className="text-xs text-[#5E4B6B] block mt-0.5">Book + Activity Field Guide &amp; Workbook</span>
              </div>
              <strong className="text-base font-extrabold text-[#3D2C4A]">{currencySymbol}{rawBookPrice}</strong>
            </div>

            {/* Look Inside Mini Gallery */}
            <div className="bg-[#FBF8F6] border border-[#F1E4E8] rounded-2xl p-3 flex flex-col gap-2">
              <span className="text-xs font-bold text-[#3D2C4A]">230-page guide + 90-page Activity Workbook</span>
              <div className="flex gap-1.5 items-center flex-wrap">
                {LIGHTBOX_PAGES.slice(0, 5).map((page, idx) => {
                  const thumbSrc = idx === 0 && book?.imageUrl ? book.imageUrl : page.image;
                  return (
                    <button
                      key={page.n}
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      aria-label={`Look inside: ${page.name}`}
                      className="w-10 h-14 rounded-lg border-[1.5px] border-[#E9DDE6] overflow-hidden relative group cursor-pointer transition-all hover:scale-105 hover:border-[#C2456A] shadow-xs bg-white shrink-0"
                    >
                      <Image
                        src={thumbSrc}
                        alt={page.name}
                        fill
                        sizes="40px"
                        className="object-cover object-top transition-transform duration-200 group-hover:scale-110"
                        unoptimized={thumbSrc.startsWith('http')}
                      />
                      <div className="absolute inset-0 bg-[#C2456A]/0 group-hover:bg-[#C2456A]/10 transition-colors" />
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setLightboxIndex(5)}
                  aria-label="See all 11 preview pages"
                  className="w-10 h-14 rounded-lg bg-[#3D2C4A] text-white font-extrabold text-xs grid place-items-center hover:bg-[#5A4385] transition-all hover:scale-105 cursor-pointer shrink-0 shadow-xs"
                >
                  +6
                </button>
                <span className="text-xs text-[#6E5B7A] ml-1 font-medium">Tap to look inside</span>
              </div>
            </div>

            {/* Line items list */}
            <dl className="m-0 grid grid-cols-2 gap-2 text-sm text-[#5E4B6B] border-t border-[#F1E4E8] pt-3">
              <dt>Book + workbook</dt>
              <dd className="text-right text-[#3D2C4A] font-semibold">{currencySymbol}{rawBookPrice}</dd>

              {isCourseAdded && (
                <>
                  <dt className="text-[#C2456A] font-bold">HerNext course add-on</dt>
                  <dd className="text-right text-[#C2456A] font-bold">+{currencySymbol}{coursePrice}</dd>
                </>
              )}

              <dt>Shipping</dt>
              <dd className="text-right text-[#2F7F62] font-bold">Free</dd>

              {isCod && (
                <>
                  <dt>Cash on delivery fee</dt>
                  <dd className="text-right text-[#3D2C4A] font-semibold">+{currencySymbol}{codFee}</dd>
                </>
              )}

              {discountAmount > 0 && (
                <>
                  <dt className="text-emerald-600 font-semibold">Coupon discount</dt>
                  <dd className="text-right text-emerald-600 font-bold">-{currencySymbol}{discountAmount}</dd>
                </>
              )}

              <dt className="font-extrabold text-base text-[#3D2C4A] border-t border-[#F1E4E8] pt-2.5 mt-1">
                {isCod ? 'Pay on delivery' : 'Total'}
              </dt>
              <dd className="text-right font-extrabold text-xl text-[#3D2C4A] border-t border-[#F1E4E8] pt-2 mt-1">
                {currencySymbol}{totalAmount}
              </dd>
            </dl>

            {/* HerNext Course Addon Card */}
            <div className={`relative rounded-2xl p-4 flex flex-col gap-2.5 transition-all ${
              isCod
                ? 'bg-[#F6F1F4] border-2 border-dashed border-[#D9C8D3] opacity-85'
                : isCourseAdded
                ? 'bg-[#FDEFF0] border-2 border-[#C2456A] ck-pop shadow-sm'
                : 'bg-white border-2 border-dashed border-[#E8A5B6]'
            }`}>
              <span className="absolute -top-3 left-3 bg-[#3D2C4A] text-white rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide">
                BOOK BUYERS ONLY
              </span>

              <label className={`flex gap-3 items-start ${isCod ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={isCourseAdded}
                  disabled={isCod}
                  onChange={(e) => {
                    if (!isCod) setAddCourse(e.target.checked);
                  }}
                  className="w-5 h-5 mt-0.5 accent-[#C2456A] shrink-0 cursor-pointer"
                />
                <span className="flex-1">
                  <strong className="block text-base font-bold text-[#3D2C4A] leading-tight">Add the Girlhood HerNext course</strong>
                  <span className="text-xs text-[#5E4B6B] block mt-0.5">She can start today, before the book arrives. 26 video lessons, games and badges.</span>
                </span>
                <span className="text-right shrink-0">
                  <strong className="block text-base font-extrabold text-[#C2456A]">₹299</strong>
                  <s className="text-xs text-[#8A7896]">₹999</s>
                </span>
              </label>

              <div className="flex gap-2.5 items-center pt-1 border-t border-[#C2456A]/10">
                <svg width="28" height="46" viewBox="0 0 120 200" aria-hidden="true" className="shrink-0">
                  <rect x="6" y="4" width="108" height="192" rx="18" fill="#3D2C4A" />
                  <rect x="12" y="14" width="96" height="172" rx="12" fill="#D4EFE4" />
                  <path d="M12 140 C 40 120, 80 150, 108 130 V186 H12z" fill="#A8D8BE" />
                  <rect x="22" y="28" width="76" height="40" rx="10" fill="#FFFFFF" />
                  <circle cx="60" cy="96" r="16" fill="#FFFFFF" opacity=".9" />
                  <path d="M55 88v16l13-8z" fill="#C2456A" />
                </svg>
                <span className="text-[11px] text-[#5E4B6B] leading-tight">
                  Book + workbook + course together = ₹{rawBookPrice + coursePrice}, complete story &amp; learning experience.
                </span>
              </div>

              {isCod && (
                <div className="bg-[#FFF4C7] rounded-xl p-2.5 text-xs font-semibold text-[#8A6410]">
                  Pay online to add the course for ₹299. With cash on delivery, the ₹299 reader price unlocks once your payment is collected.
                </div>
              )}
            </div>

            {/* Coupon Code Accordion matching Course Checkout Template */}
            <div className="border-t border-[#F1E4E8] pt-3">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-[#EAF7F1] border border-[#24735A]/20 px-3.5 py-2.5 rounded-xl text-xs">
                  <span className="font-bold text-[#24735A]">
                    Coupon: <span className="font-black tracking-wide">{appliedCoupon.code}</span> (-{currencySymbol}{discountAmount})
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[#C2456A] hover:text-[#A8365A] font-bold text-xs hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <details className="text-[15px] group" open={Boolean(couponCode || couponError)}>
                  <summary className="cursor-pointer font-semibold text-[#A8365A] hover:text-[#C2456A] min-h-[32px] flex items-center gap-1.5 transition-colors select-none">
                    Have a coupon?
                  </summary>
                  <div className="flex gap-2 items-center mt-2">
                    <input
                      type="text"
                      aria-label="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="CODE"
                      className="flex-1 min-w-0 min-h-[46px] rounded-xl border-[1.5px] border-[#E9DDE6] px-3.5 text-sm font-semibold uppercase tracking-wider text-[#3D2C4A] placeholder:text-[#8A7896] placeholder:normal-case placeholder:font-normal focus:outline-none focus:border-[#C2456A] transition-colors"
                    />
                    <button
                      type="button"
                      disabled={validatingCoupon || !couponCode.trim()}
                      onClick={handleApplyCoupon}
                      className="min-h-[46px] px-4 rounded-xl border-2 border-[#3D2C4A] bg-white hover:bg-[#3D2C4A] hover:text-white font-semibold text-sm text-[#3D2C4A] transition-all disabled:opacity-40 cursor-pointer"
                    >
                      {validatingCoupon ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-rose-600 font-semibold mt-1 px-1">{couponError}</p>}
                </details>
              )}
            </div>

            {/* Big Action CTA */}
            <button
              type="button"
              disabled={processing}
              onClick={handlePlaceOrder}
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
              className="w-full hover:bg-[#A8365A] active:bg-[#942C4E] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 px-6 py-3.5 shadow-none"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Processing...</span>
                </>
              ) : (
                <span>
                  {isCod ? `Place order · pay ${currencySymbol}${totalAmount} on delivery` : `Pay ${currencySymbol}${totalAmount.toLocaleString('en-IN')} securely`}
                </span>
              )}
            </button>

            <div className="text-[11px] text-[#6E5B7A] text-center leading-relaxed">
              By placing the order you agree to our Terms, Privacy Policy and Refund Policy. Payments secured by Razorpay.
            </div>
          </section>

          {/* WhatsApp Support Assistance */}
          <div className="text-xs text-[#5E4B6B] text-center font-medium">
            Questions? <a href="https://wa.me/919243019243" target="_blank" rel="noopener noreferrer" className="font-bold text-[#24735A] hover:underline">WhatsApp +91 92430 19243</a>
          </div>
        </aside>
      </main>

      {/* Look Inside Lightbox Dialog */}
      {currentLightboxPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#23182D]/75 backdrop-blur-xs" onClick={() => setLightboxIndex(null)} />
          <div className="ck-pop relative z-10 w-full max-w-[460px] bg-white rounded-3xl p-5 flex flex-col gap-3.5 shadow-2xl border border-[#F1E4E8]">
            <div className="flex justify-between items-center">
              <div>
                <strong className="text-base text-[#3D2C4A] block">{currentLightboxPage.name}</strong>
                <span className="text-xs text-[#5E4B6B]">{currentLightboxPage.part}</span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="w-9 h-9 rounded-full bg-[#FBF8F6] border border-[#E9DDE6] grid place-items-center text-[#3D2C4A] hover:bg-[#FDEFF0] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview Page Frame */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-inner bg-slate-50 border border-slate-100 flex items-center justify-center">
              <Image
                src={lightboxIndex === 0 && book?.imageUrl ? book.imageUrl : currentLightboxPage.image}
                alt={currentLightboxPage.name}
                fill
                sizes="440px"
                className="object-contain"
                unoptimized={(lightboxIndex === 0 && book?.imageUrl ? book.imageUrl : currentLightboxPage.image).startsWith('http')}
              />
            </div>

            {/* Page Navigation Controls */}
            <div className="flex gap-2.5 items-center justify-between">
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex! + 10) % 11)}
                className="w-11 h-11 rounded-full border-2 border-[#3D2C4A] bg-white text-[#3D2C4A] font-extrabold grid place-items-center hover:bg-[#FBF8F6] transition-colors cursor-pointer"
              >
                ‹
              </button>
              <span className="text-sm font-bold text-[#5E4B6B]">
                {currentLightboxPage.n} / {LIGHTBOX_PAGES.length} · {currentLightboxPage.part}
              </span>
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex! + 1) % 11)}
                className="w-11 h-11 rounded-full border-2 border-[#3D2C4A] bg-white text-[#3D2C4A] font-extrabold grid place-items-center hover:bg-[#FBF8F6] transition-colors cursor-pointer"
              >
                ›
              </button>
            </div>

            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="w-full py-3 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm transition-colors cursor-pointer"
            >
              Back to checkout
            </button>
          </div>
        </div>
      )}

      {/* Payment Failed Modal */}
      {paymentFailed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-rose-100 text-center ck-pop">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Payment Failed</h3>
            <p className="text-xs text-slate-500 mb-5">{paymentFailedReason}</p>
            <div className="space-y-2">
              <button
                onClick={() => setPaymentFailed(false)}
                className="w-full py-3 bg-[#C2456A] hover:bg-[#A8365A] text-white rounded-xl font-bold text-sm transition-colors"
              >
                Retry Payment
              </button>
              <button
                onClick={() => setPaymentFailed(false)}
                className="w-full py-2.5 text-slate-600 rounded-xl font-semibold text-xs border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#FBF8F6] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C2456A]" size={42} />
      </div>
    }>
      <CheckoutContent />
    </React.Suspense>
  );
}
