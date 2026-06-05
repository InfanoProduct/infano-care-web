'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { ShopService, Book } from '@/services/shop.service';
import {
  ArrowLeft, CheckCircle2, ShoppingBag, Tag,
  Loader2, CreditCard, Truck, AlertCircle, ShieldCheck
} from 'lucide-react';

const bookImages = [
  '/Page-1.png',
  '/Page-2.png',
  '/page-3.png',
  '/Page-4.png',
  '/Page-5.png',
  '/Page-6.png',
  '/Page-7.png'
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');
  const nameParam = searchParams.get('name') || '';
  const phoneParam = searchParams.get('phone') || '';
  const emailParam = searchParams.get('email') || '';
  const classParam = searchParams.get('class') || '';
  const formatParam = searchParams.get('format') || '';
  const dateParam = searchParams.get('date') || '';
  const timeParam = searchParams.get('time') || '';
  const { user, isAuthenticated } = useAuthStore();

  const [book, setBook] = useState<Book | null>(null);
  const isProgram = book ? (book.id.endsWith('-private') || book.id.endsWith('-group')) : false;

  const getProgramInfo = () => {
    const slug = book ? book.id.split('-')[0].toLowerCase() : 'spark';
    switch (slug) {
      case 'spark':
        return {
          sessions: 8,
          duration: '2 Months',
          benefits: [
            'Early puberty & self-awareness',
            'Body positivity & boundaries',
            'Breaking family biological myths',
            'Certified female senior guides'
          ]
        };
      case 'rise':
        return {
          sessions: 10,
          duration: '2.5 Months',
          benefits: [
            'Consent & grooming boundaries',
            'Permanent digital footprint mapping',
            'Identifying relationship red flags',
            'Healthy self-expression guidance'
          ]
        };
      case 'bloom':
        return {
          sessions: 10,
          duration: '2.5 Months',
          benefits: [
            'Anxiety & depression decoders',
            'Academic peer pressure mapping',
            'Friendship power dynamics',
            'Sleek parent updates & coaching'
          ]
        };
      case 'ignite':
        return {
          sessions: 12,
          duration: '3 Months',
          benefits: [
            'Financial literacy 101 lessons',
            'Media bias & critical thinking',
            'Negotiation & boundary setting',
            'Certified leadership curriculum'
          ]
        };
      case 'unstoppable':
        return {
          sessions: 12,
          duration: '3 Months',
          benefits: [
            'Career path & skill mapping',
            'Independent adulting & transition',
            'Healthy relationship building',
            'Stress mitigation & colleges prep'
          ]
        };
      default:
        return {
          sessions: 8,
          duration: '2 Months',
          benefits: [
            '3 Free Consultation',
            'Certified Female Senior Guides',
            'Flexible session rescheduling',
            'Safe learning & parents updates'
          ]
        };
    }
  };

  const programInfo = getProgramInfo();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(bookImages[0]);
  const [countdown, setCountdown] = useState(5);

  // Financials
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [missingDetails, setMissingDetails] = useState(false);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    shippingAddress: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'ONLINE' as 'ONLINE' | 'COD',
    gstNumber: '',
  });

  useEffect(() => {
    if (!loading && book) {
      const isProg = book.id.endsWith('-private') || book.id.endsWith('-group');
      if (isProg && !user && (!nameParam || !phoneParam)) {
        setMissingDetails(true);
      }
    }
  }, [loading, book, nameParam, phoneParam, user]);

  useEffect(() => {
    if (missingDetails) {
      const timer = setTimeout(() => {
        const slug = book ? book.id.split('-')[0].toLowerCase() : 'spark';
        router.push(`/programs/${slug}`);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [missingDetails, book, router]);

  useEffect(() => {
    if (nameParam || phoneParam || emailParam || user) {
      setFormData(prev => ({
        ...prev,
        guestName: nameParam || prev.guestName || user?.profile?.displayName || user?.username || '',
        guestPhone: phoneParam || prev.guestPhone || user?.phone || '',
        guestEmail: emailParam || prev.guestEmail || user?.email || ''
      }));
    }
  }, [nameParam, phoneParam, emailParam, user]);

  useEffect(() => {
    if (isProgram) {
      setFormData(prev => ({
        ...prev,
        paymentMethod: 'ONLINE'
      }));
    }
  }, [isProgram]);

  useEffect(() => {
    if (orderSuccess && isProgram) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [orderSuccess, isProgram, router]);

  useEffect(() => {
    async function loadBook() {
      try {
        if (bookId) {
          const data = await ShopService.getBook(bookId);
          if (data) {
            setBook(data);
          } else {
            throw new Error('Book not found');
          }
        } else {
          const books = await ShopService.getBooks();
          if (books && books.length > 0) {
            const targetBook = books.find(b => b.id === '7e248707-c9e8-462c-a716-99f3852ef8c0') || books[0];
            setBook(targetBook);
          } else {
            // Fallback if no books are active or found
            setBook({
              id: 'default',
              title: 'The Awkward Age',
              description: 'A story of Every Adolescent Girl',
              price: 499,
              stock: 100,
              isActive: true
            });
          }
        }
      } catch (err) {
        console.error('Error loading checkout book:', err);
        setBook({
          id: 'default',
          title: 'The Awkward Age',
          description: 'A story of Every Adolescent Girl',
          price: 499,
          stock: 100,
          isActive: true
        });
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [bookId]);

  useEffect(() => {
    if (formData.pincode.length === 6) {
      const fetchPincodeData = async () => {
        setPincodeLoading(true);
        try {
          const res = await fetch(`/api/pincode?code=${formData.pincode}`);
          if (!res.ok) throw new Error('Failed to fetch pincode data');
          const data = await res.json();
          if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice[0]) {
            const postOffice = data[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              city: postOffice.District,
              state: postOffice.State
            }));
          }
        } catch (err) {
          console.error('Pincode lookup failed:', err);
        } finally {
          setPincodeLoading(false);
        }
      };
      fetchPincodeData();
    }
  }, [formData.pincode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const applyCoupon = async () => {
    if (!couponCode || !book) return;
    setValidatingCoupon(true);
    setError(null);
    try {
      const result = await ShopService.validateCoupon(couponCode, [{ bookId: book.id, quantity: 1, price: book.price }]);
      setAppliedCoupon(result.coupon);
      setDiscountAmount(result.discountAmount);
    } catch (err: any) {
      setError(err.message || 'Invalid coupon');
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const calculateTotal = () => {
    if (!book) return { subtotal: 0, gst: 0, delivery: 0, total: 0 };
    const baseSubtotal = book.price * quantity;
    const priceAfterDiscount = baseSubtotal - discountAmount;
    const delivery = 0; // Free delivery for all orders
    const taxableValue = Math.round((priceAfterDiscount / 1.05) * 100) / 100;
    const gst = Math.round((priceAfterDiscount - taxableValue) * 100) / 100;
    const total = priceAfterDiscount + delivery;
    return { subtotal: baseSubtotal, gst, delivery, total };
  };

  const { subtotal, gst, delivery, total } = calculateTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;
    setProcessing(true);
    setError(null);

    // Safeguard for dynamic programs to ensure details are pre-filled
    if (isProgram && (!formData.guestName || !formData.guestPhone)) {
      setError('Please fill in your personal details first on the program page.');
      setProcessing(false);
      return;
    }

    try {
      const orderData = {
        ...formData,
        shippingAddress: isProgram ? "Virtual Enrollment" : formData.shippingAddress,
        city: isProgram ? "Online" : formData.city,
        state: isProgram ? "Online" : formData.state,
        pincode: isProgram ? "000000" : formData.pincode,
        paymentMethod: isProgram ? 'ONLINE' : formData.paymentMethod,
        userId: user?.id,
        items: [{ bookId: book.id, quantity }],
        couponCode: appliedCoupon?.code,
      };

      const order = await ShopService.createOrder(orderData);

      if ((isProgram || formData.paymentMethod === 'ONLINE') && order.razorpayOrderId) {
        if (typeof (window as any).Razorpay === 'undefined') {
          setError('Payment gateway is still loading. Please wait a few seconds and try again.');
          setProcessing(false);
          return;
        }
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.totalAmount * 100,
          currency: 'INR',
          name: 'Infano.care',
          description: `Purchase: ${book.title}`,
          order_id: order.razorpayOrderId,
          handler: async function (response: any) {
            try {
              await ShopService.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              setOrderSuccess(true);
            } catch (err) {
              setError('Payment verification failed.');
            } finally {
              setProcessing(false);
            }
          },
          prefill: {
            name: isAuthenticated ? user?.username : formData.guestName,
            email: formData.guestEmail,
            contact: formData.guestPhone,
          },
          modal: { ondismiss: () => setProcessing(false) }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        setOrderSuccess(true);
        setProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Order placement failed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (missingDetails) {
    const slug = book ? book.id.split('-')[0].toLowerCase() : 'spark';
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6 pt-24 md:pt-32">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-8 md:p-10 text-center relative overflow-hidden backdrop-blur-xl animate-in zoom-in duration-300">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700" />
          
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-100/80 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-alert"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          </div>

          <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Secure Checkout Redirect</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
            To ensure enrollment security and register your daughter correctly, we need your personal details. It looks like you haven't filled out your name and phone number on the program details page yet.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-center gap-3 border border-slate-100 mb-6 text-xs text-slate-600 font-semibold">
            <Loader2 className="animate-spin text-primary" size={16} />
            <span>Redirecting to program details page...</span>
          </div>

          <button
            onClick={() => router.push(`/programs/${slug}`)}
            className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/95 transition-all animate-pulse"
          >
            Go back to Program Page
          </button>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    if (isProgram) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] p-4 relative overflow-hidden font-sans">
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-xl w-full bg-white rounded-[2.5rem] border border-slate-200/80 shadow-2xl p-10 text-center relative z-10 animate-in zoom-in duration-500">
            <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 rounded-t-[2.5rem]" />

            <div className="w-24 h-24 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-8 border border-violet-100/80 shadow-md">
              <CheckCircle2 size={48} className="animate-pulse" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mb-4">
              Enrollment Confirmed! 🚀
            </h1>
            <p className="text-slate-500 font-semibold text-base leading-relaxed mb-8">
              Thank you for enrolling in the <span className="font-extrabold text-violet-600">{book?.title || 'Learning Program'}</span>. Your payment has been successfully verified!
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left mb-8 space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-500 pb-2.5 border-b border-slate-200/60">
                <span>Program Cost</span>
                <span className="text-slate-800">₹{total}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500 pt-1">
                <span>Target Class</span>
                <span className="text-slate-800">{classParam || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Learning Format</span>
                <span className="text-slate-800">{formatParam || '1:1 Private Mentoring'}</span>
              </div>
            </div>

            <div className="bg-violet-50/50 border border-violet-100 rounded-2xl p-5 mb-8 text-xs text-violet-700 font-bold flex items-center justify-center gap-3">
              <Loader2 className="animate-spin text-violet-600" size={16} />
              <span>Redirecting you to the Login page in <span className="text-sm font-black text-violet-900">{countdown}s</span> to access her dashboard...</span>
            </div>

            <button 
              onClick={() => router.push('/login')} 
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all hover:scale-[1.01] active:scale-[0.99] text-sm"
            >
              Proceed to Login Now
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-10 text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-slate-900">Order Confirmed! 🎉</h1>
          <p className="text-slate-600 mb-6 text-lg leading-relaxed">
            Thank you for ordering your book. Your order has been successfully placed, and we will get it delivered to you soon! Our team will connect with you shortly with further updates.
          </p>
          
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left mb-8 max-w-sm mx-auto">
            <h3 className="font-bold text-slate-900 mb-4 text-center">Need help? We're here for you:</h3>
            <div className="space-y-3 font-medium text-slate-700">
              <p className="flex items-center justify-center gap-2">
                <span>📧</span> Email: <a href="mailto:support@infano.care" className="text-primary hover:underline font-bold">support@infano.care</a>
              </p>
              <p className="flex items-center justify-center gap-2">
                <span>💬</span> WhatsApp: <a href="https://wa.me/916362994347" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">+91 6362994347</a>
              </p>
            </div>
          </div>

          <button onClick={() => router.push('/')} className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all active:scale-95">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-slate-900 pt-24 md:pt-32 pb-16 md:pb-24 overflow-x-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-6xl mx-auto px-6">
        <Link 
          href={book && (book.id.endsWith('-private') || book.id.endsWith('-group')) ? `/parents` : "/gigi-the-awkward-age-book"} 
          className="inline-flex items-center text-slate-500 hover:text-primary mb-8 md:mb-12 transition-colors text-sm font-medium group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> {book && (book.id.endsWith('-private') || book.id.endsWith('-group')) ? 'Back to Programs' : 'Back to product'}
        </Link>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Product Gallery & Summary */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32 w-full max-w-full">
            {/* Title & Tagline at the very top of left column */}
            <div className="space-y-2 max-w-[400px] mx-auto lg:mx-0 text-center lg:text-left">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
                {book?.title || 'The Awkward Age'}
              </h1>
              <p className="text-slate-500 font-medium text-sm italic">
                {book?.description || 'A story of every adolescent girl'}
              </p>
            </div>

            {book && !(book.id.endsWith('-private') || book.id.endsWith('-group')) ? (
              <div className="space-y-6">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-100 w-full max-w-[400px] mx-auto lg:mx-0">
                  <Image
                    src={selectedImage}
                    alt="Book preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-all duration-700"
                    priority
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap max-w-[400px] mx-auto lg:mx-0 justify-center lg:justify-start">
                  {bookImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-11 aspect-[3/4] rounded-md overflow-hidden flex-shrink-0 transition-all border-2 ${selectedImage === img ? 'border-primary ring-1 ring-primary/20' : 'border-transparent opacity-50 hover:opacity-100'
                        }`}
                    >
                      <Image src={img} alt={`Thumbnail ${idx}`} fill sizes="44px" className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ) : book ? (
              /* Premium program layout mockup container */
              <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-100 w-full max-w-[400px] mx-auto lg:mx-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-8 flex flex-col justify-between text-white animate-in fade-in duration-550">
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-[40px] pointer-events-none" />
                
                <div>
                  <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[9px] font-bold uppercase tracking-widest">
                    Infano Learning Program
                  </span>
                  <h2 className="text-4xl font-black font-heading mt-6 leading-tight tracking-tight">
                    {book.title.split(' ')[0]}
                  </h2>
                  <p className="text-xs text-white/80 font-medium leading-relaxed mt-2 pl-3 border-l-2 border-white/30 italic">
                    {book.title.includes('Private') ? '1:1 Private Mentoring Program' : 'Premium Group Cohort Program'}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Sessions & Duration Badge row */}
                  <div className="grid grid-cols-2 gap-3 border-t border-white/15 pt-4">
                    <div className="bg-white/10 border border-white/10 rounded-2xl p-2.5 text-center">
                      <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest block mb-0.5">Sessions</span>
                      <span className="text-xs font-black text-white">{programInfo.sessions} Lessons</span>
                    </div>
                    <div className="bg-white/10 border border-white/10 rounded-2xl p-2.5 text-center">
                      <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest block mb-0.5">Duration</span>
                      <span className="text-xs font-black text-white">{programInfo.duration}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-white/15 pt-4">
                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Included Topics & Benefits</p>
                    <ul className="text-[11px] space-y-1 font-bold text-white/90">
                      {programInfo.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-[9px]">✨</span> {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/15 pt-4">
                    <div>
                      <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Pricing format</p>
                      <p className="text-xs font-black text-white/95">Full program enrollment</p>
                    </div>
                    <span className="text-3xl font-black tracking-tight text-white">₹{book.price}</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl shadow-slate-200/30 space-y-6 max-w-[400px] w-full mx-auto lg:mx-0">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag size={16} className="text-primary" />
                Order summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm font-medium">Unit price</span>
                  <span className="font-bold text-slate-900 text-sm">₹{book?.price || 499}</span>
                </div>
                {!isProgram && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm font-medium">Quantity</span>
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-200 text-xs">
                      <button 
                        type="button" 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="text-slate-400 hover:text-slate-900 transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="text-slate-900 font-extrabold min-w-[12px] text-center">{quantity}</span>
                      <button 
                        type="button" 
                        onClick={() => setQuantity(Math.min(book?.stock || 10, quantity + 1))}
                        className="text-slate-400 hover:text-slate-900 transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
                
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-emerald-600 text-sm font-bold flex items-center gap-1.5">
                      <Tag size={14} /> Discount
                    </span>
                    <span className="font-bold text-emerald-600 text-sm">-₹{discountAmount}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end pt-5 border-t border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total amount</span>
                  <p className="text-[10px] text-slate-400 font-medium">Incl. of all taxes</p>
                </div>
                <span className="text-3xl font-black text-primary tracking-tighter">₹{total}</span>
              </div>
            </div>
          </div>

          {/* Right: Checkout Form */}
          <div className="lg:col-span-7 w-full max-w-full bg-white rounded-[2.5rem] border border-slate-200 p-6 sm:p-8 md:p-12 shadow-2xl shadow-slate-200/50">
            <form onSubmit={handleSubmit} className="space-y-10">

              {/* Step 1: Personal Details */}
              {isProgram ? (
                /* Step 1 for Program: Read-only summary card with edit button */
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/20">
                        01
                      </div>
                      <h2 className="text-base font-bold text-slate-800 tracking-tight">Enrollment summary</h2>
                    </div>
                    
                    <Link
                      href={`/programs/${book ? book.id.split('-')[0] : 'spark'}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-primary transition-all rounded-xl border border-slate-200 text-xs font-bold shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      Edit details
                    </Link>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6">
                    {/* Section 1: Contact Details */}
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3.5">1. Personal Info</h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Full name</span>
                          <span className="text-sm font-bold text-slate-800 block">
                            {formData.guestName || nameParam || 'Not provided'}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Phone number</span>
                          <span className="text-sm font-bold text-slate-800 block">
                            {formData.guestPhone || phoneParam || 'Not provided'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-0.5 mt-3.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Email address</span>
                        <span className="text-sm font-bold text-slate-800 block">
                          {formData.guestEmail || emailParam || 'Not provided'}
                        </span>
                      </div>
                    </div>

                    {/* Section 2: Program Settings */}
                    <div className="pt-5 border-t border-slate-200/60">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3.5">2. Program settings</h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Class / Grade</span>
                          <span className="text-sm font-bold text-slate-800 block">
                            {classParam || 'Not provided'}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Learning Format</span>
                          <span className="text-sm font-bold text-slate-800 block">
                            {formatParam || 'Not provided'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Consultation Slot */}
                    <div className="pt-5 border-t border-slate-200/60">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3.5">3. Consultation Slot</h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Preferred Date</span>
                          <span className="text-sm font-bold text-slate-800 block">
                            {dateParam || 'Not provided'}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Preferred Time</span>
                          <span className="text-sm font-bold text-slate-800 block">
                            {timeParam || 'Not provided'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 1 for Book Checkout: Input fields */
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/20">
                      01
                    </div>
                    <h2 className="text-base font-bold text-slate-800 tracking-tight">Personal details</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 ml-0.5">Full name</label>
                      <input
                        required
                        name="guestName"
                        value={formData.guestName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-primary/60 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm"
                        placeholder="e.g. Ananya Sharma"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 ml-0.5">Phone number</label>
                      <input
                        required
                        name="guestPhone"
                        value={formData.guestPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-primary/60 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-0.5">Email address (optional)</label>
                    <input
                      type="email"
                      name="guestEmail"
                      value={formData.guestEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-primary/60 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {!isProgram && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/20">
                      02
                    </div>
                    <h2 className="text-base font-bold text-slate-800 tracking-tight">Shipping address</h2>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-0.5">Street address</label>
                    <input
                      required={!isProgram}
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-primary/60 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm"
                      placeholder="Flat / House No / Street"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 ml-0.5">City</label>
                      <input
                        required={!isProgram}
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-primary/60 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm"
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 ml-0.5">State</label>
                      <input
                        required={!isProgram}
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-primary/60 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm"
                        placeholder="State"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 ml-0.5">Pincode</label>
                      <div className="relative">
                        <input
                          required={!isProgram}
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          maxLength={6}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-primary/60 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm"
                          placeholder="6-digit pincode"
                        />
                        {pincodeLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" size={16} />}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 ml-0.5">Country</label>
                      <input
                        readOnly
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-500 cursor-not-allowed text-sm"
                        value="India"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Promo Code Section */}
              <div className="space-y-3 pt-2">

                <label className="text-[11px] font-bold text-slate-600 ml-0.5">Promo code</label>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code e.g. PROMO15"
                    className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={!couponCode || validatingCoupon}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-colors disabled:opacity-50"
                  >
                    {validatingCoupon ? <Loader2 className="animate-spin" size={14} /> : 'Apply'}
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <Tag size={13} className="text-emerald-600" />
                    <p className="text-emerald-700 text-[11px] font-bold">
                      🎉 Code <span className="font-black">{appliedCoupon.code}</span> applied — you save ₹{discountAmount}!
                    </p>
                  </div>
                )}
              </div>

              {/* Step 3: Payment Selection */}
              {!isProgram && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/20">
                      03
                    </div>
                    <h2 className="text-base font-bold text-slate-800 tracking-tight">Payment method</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'ONLINE' }))}
                      className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2.5 ${formData.paymentMethod === 'ONLINE' ? 'border-primary bg-primary/[0.03]' : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                    >
                      <CreditCard size={20} className={formData.paymentMethod === 'ONLINE' ? 'text-primary' : 'text-slate-400'} />
                      <div className="space-y-0 text-center">
                        <div className={`text-sm font-bold ${formData.paymentMethod === 'ONLINE' ? 'text-primary' : 'text-slate-800'}`}>Pay online</div>
                        <div className="text-[10px] font-medium text-slate-500">Cards, UPI, NetBanking</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'COD' }))}
                      className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2.5 ${formData.paymentMethod === 'COD' ? 'border-primary bg-primary/[0.03]' : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                    >
                      <Truck size={20} className={formData.paymentMethod === 'COD' ? 'text-primary' : 'text-slate-400'} />
                      <div className="space-y-0 text-center">
                        <div className={`text-sm font-bold ${formData.paymentMethod === 'COD' ? 'text-primary' : 'text-slate-800'}`}>Cash on delivery</div>
                        <div className="text-[10px] font-medium text-slate-500">Pay when you receive</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-3">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={processing || pincodeLoading}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {processing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={20} />
                      {formData.paymentMethod === 'ONLINE' ? `Pay ₹${total} & place order` : 'Place order via COD'}
                    </>
                  )}
                </button>
                <p className="text-center text-slate-500 text-[10px] font-medium mt-6">
                  By placing order, you agree to our <Link href="/legal/terms" className="underline underline-offset-2 hover:text-primary transition-colors">Terms</Link> and <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-primary transition-colors">Privacy Policy</Link>.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    }>
      <CheckoutContent />
    </React.Suspense>
  );
}
