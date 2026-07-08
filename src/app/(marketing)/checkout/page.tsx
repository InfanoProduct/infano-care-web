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
  Loader2, CreditCard, Truck, AlertCircle,
  Plus, Minus
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
  const { user, isAuthenticated } = useAuthStore();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [cachedOrder, setCachedOrder] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(bookImages[0]);

  // Financials
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentFailedReason, setPaymentFailedReason] = useState('');
  const rzpRef = React.useRef<any>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const [quantity, setQuantity] = useState(1);
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
    if (nameParam || phoneParam || emailParam || user) {
      const fallbackName = user?.profile?.displayName || (user?.username?.includes('@') ? '' : user?.username) || '';
      setFormData(prev => ({
        ...prev,
        guestName: nameParam || prev.guestName || fallbackName,
        guestPhone: phoneParam || prev.guestPhone || user?.phone || '',
        guestEmail: emailParam || prev.guestEmail || user?.email || ''
      }));
    }
  }, [nameParam, phoneParam, emailParam, user]);



  useEffect(() => {
    setCachedOrder(null);
  }, [formData, quantity, appliedCoupon]);

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
    if (process.env.NODE_ENV === 'production' && book) {
      const windowObj = window as any;
      windowObj.dataLayer = windowObj.dataLayer || [];
      windowObj.dataLayer.push({ ecommerce: null });
      windowObj.dataLayer.push({
        event: 'begin_checkout',
        ecommerce: {
          currency: 'INR',
          value: book.price * quantity,
          items: [{
            item_id: book.id,
            item_name: book.title,
            price: book.price,
            quantity: quantity
          }]
        }
      });
    }
  }, [book]);

  useEffect(() => {
    if (formData.pincode.length === 6) {
      const fetchPincodeData = async () => {
        setPincodeLoading(true);
        try {
          const res = await fetch(`/api/pincode?code=${formData.pincode}`);
          if (!res.ok) {
            console.warn('Pincode auto-fill unavailable at the moment');
            return;
          }
          const data = await res.json();
          if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice[0]) {
            const postOffice = data[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              city: postOffice.District,
              state: postOffice.State
            }));
            // Clear errors for auto-filled fields
            setFormErrors(prev => ({ ...prev, pincode: '', city: '', state: '' }));
          }
        } catch (err) {
          console.warn('Pincode lookup failed (network issue or timeout)');
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
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
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
    const delivery = formData.paymentMethod === 'COD' ? 40 : 0;
    const taxableValue = Math.round((priceAfterDiscount / 1.05) * 100) / 100;
    const gst = Math.round((priceAfterDiscount - taxableValue) * 100) / 100;
    const total = priceAfterDiscount + delivery;
    return { subtotal: baseSubtotal, gst, delivery, total };
  };

  const { subtotal, gst, delivery, total } = calculateTotal();

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.guestName.trim()) errors.guestName = 'Full name is required';
    if (!formData.guestPhone.trim() || !/^\d{10}$/.test(formData.guestPhone)) errors.guestPhone = 'Valid 10-digit mobile number is required';
    if (!formData.pincode.trim() || formData.pincode.length !== 6) errors.pincode = 'Valid 6-digit pincode is required';
    if (!formData.shippingAddress.trim()) errors.shippingAddress = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    if (!validateForm()) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      let order = cachedOrder;

      if (!order) {
        const orderData = {
          ...formData,
          userId: user?.id,
          items: [{ bookId: book.id, quantity }],
          couponCode: appliedCoupon?.code,
        };
        order = await ShopService.createOrder(orderData);
        if (formData.paymentMethod === 'ONLINE') {
          setCachedOrder(order);
        }
      }

      if (formData.paymentMethod === 'ONLINE' && order.razorpayOrderId) {
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
              const successParams = new URLSearchParams({
                transaction_id: order.id,
                value: order.totalAmount.toString(),
                quantity: quantity.toString(),
                item_id: book.id,
                item_name: book.title,
                price: book.price.toString(),
                discount: discountAmount.toString(),
                delivery: delivery.toString(),
                subtotal: subtotal.toString(),
                payment_method: formData.paymentMethod,
                image_url: book.imageUrl || '/Page-1.png'
              });
              router.push(`/purchase-success?${successParams.toString()}`);
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
          modal: {
            ondismiss: () => {
              setPaymentFailedReason('Payment window was closed before completion.');
              setPaymentFailed(true);
              setProcessing(false);
            }
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setPaymentFailedReason(response.error.description || 'Payment failed due to a network or banking issue.');
          setPaymentFailed(true);
          setProcessing(false);
        });
        rzpRef.current = rzp;
        rzp.open();
      } else {
        const successParams = new URLSearchParams({
          transaction_id: order.id,
          value: order.totalAmount.toString(),
          quantity: quantity.toString(),
          item_id: book.id,
          item_name: book.title,
          price: book.price.toString(),
          discount: discountAmount.toString(),
          delivery: delivery.toString(),
          subtotal: subtotal.toString(),
          payment_method: formData.paymentMethod,
          image_url: book.imageUrl || '/Page-1.png'
        });
        router.push(`/purchase-success?${successParams.toString()}`);
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



  return (
    <div className="min-h-screen bg-[#FDFCFB] selection:bg-primary/20 pt-20 md:pt-28 pb-16 font-sans">

      {/* Payment Failed Modal Popup */}
      {paymentFailed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-rose-100 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-rose-100 shadow-sm">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Payment Failed</h3>
            <p className="text-sm font-medium text-slate-500 mb-6">{paymentFailedReason}</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setPaymentFailed(false);
                  if (rzpRef.current) rzpRef.current.open();
                }}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-sm shadow-md transition-all active:scale-[0.98]"
              >
                Retry Payment
              </button>
              <button
                onClick={() => setPaymentFailed(false)}
                className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg font-bold text-sm border border-slate-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <Link
          href="/gigi-the-awkward-age-book"
          className="inline-flex items-center text-slate-500 hover:text-primary mb-8 md:mb-12 transition-colors text-sm font-medium group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to product
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

            <div className="space-y-6">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl bg-white border border-slate-100 w-full max-w-[400px] mx-auto lg:mx-0">
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

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl shadow-slate-200/30 space-y-6 max-w-[400px] w-full mx-auto lg:mx-0">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag size={16} className="text-primary" />
                Order summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm font-medium">Unit price</span>
                  <span className="font-bold text-slate-900 text-sm"><span>₹</span><span>{book?.price || 499}</span></span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500 text-sm font-medium">Shipping charge</span>
                  <span className="font-bold text-emerald-600 text-sm">Free</span>
                </div>

                {formData.paymentMethod === 'COD' && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500 text-sm font-medium">Cash on Delivery</span>
                    <span className="font-bold text-slate-900 text-sm"><span>₹</span><span>40</span></span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm font-medium">Quantity</span>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200 text-xs">
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

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-emerald-600 text-sm font-bold flex items-center gap-1.5">
                      <Tag size={14} /> Discount
                    </span>
                    <span className="font-bold text-emerald-600 text-sm">-<span>₹</span><span>{discountAmount}</span></span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end pt-5 border-t border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total amount</span>
                  <p className="text-[10px] text-slate-400 font-medium">Incl. of all taxes</p>
                </div>
                <span className="text-3xl font-black text-primary tracking-tighter"><span>₹</span><span>{total}</span></span>
              </div>
            </div>
          </div>

          {/* Right: Checkout Form */}
          <div className="lg:col-span-7 w-full max-w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 md:p-12 shadow-2xl shadow-slate-200/50">
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>

              {/* Step 1: Personal Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/20">
                    01
                  </div>
                  <h2 className="text-base font-bold text-slate-800 tracking-tight">Personal details</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-0.5">Full name <span className="text-rose-500">*</span></label>
                    <input
                      name="guestName"
                      value={formData.guestName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-white border ${formErrors.guestName ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm`}
                      placeholder="e.g. Ananya Sharma"
                    />
                    {formErrors.guestName && <p className="text-[10px] text-rose-500 font-bold ml-0.5">{formErrors.guestName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-0.5">Phone number <span className="text-rose-500">*</span></label>
                    <input
                      name="guestPhone"
                      value={formData.guestPhone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-white border ${formErrors.guestPhone ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm`}
                      placeholder="10-digit mobile number"
                    />
                    {formErrors.guestPhone && <p className="text-[10px] text-rose-500 font-bold ml-0.5">{formErrors.guestPhone}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 ml-0.5">Email address (optional)</label>
                  <input
                    type="email"
                    name="guestEmail"
                    value={formData.guestEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary/60 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Step 2: Shipping Address */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/20">
                    02
                  </div>
                  <h2 className="text-base font-bold text-slate-800 tracking-tight">Shipping address</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-0.5">Pincode <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        maxLength={6}
                        className={`w-full px-4 py-3 rounded-lg bg-white border ${formErrors.pincode ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm`}
                        placeholder="6-digit pincode"
                      />
                      {pincodeLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" size={16} />}
                    </div>
                    {formErrors.pincode && <p className="text-[10px] text-rose-500 font-bold ml-0.5">{formErrors.pincode}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-0.5">Country</label>
                    <input
                      readOnly
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-500 cursor-not-allowed text-sm"
                      value="India"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 ml-0.5">Full Address <span className="text-rose-500">*</span></label>
                  <input
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-white border ${formErrors.shippingAddress ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm`}
                    placeholder="Flat / House No / Street"
                  />
                  {formErrors.shippingAddress && <p className="text-[10px] text-rose-500 font-bold ml-0.5">{formErrors.shippingAddress}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-0.5">City <span className="text-rose-500">*</span></label>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-white border ${formErrors.city ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm`}
                      placeholder="City"
                    />
                    {formErrors.city && <p className="text-[10px] text-rose-500 font-bold ml-0.5">{formErrors.city}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-0.5">State <span className="text-rose-500">*</span></label>
                    <input
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      onBlur={(e) => {
                        if (process.env.NODE_ENV === 'production' && e.target.value.trim() !== '') {
                          const windowObj = window as any;
                          windowObj.dataLayer = windowObj.dataLayer || [];
                          windowObj.dataLayer.push({ ecommerce: null });
                          windowObj.dataLayer.push({
                            event: 'add_shipping_info',
                            ecommerce: {
                              currency: 'INR',
                              value: 499,
                              shipping_tier: 'Standard',
                              items: [{
                                item_id: '5e569d64-9678-4689-a594-ec9c0020f07b',
                                item_name: 'Gigi - The Awkward Age',
                                price: 499,
                                quantity: 1
                              }]
                            }
                          });
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-lg bg-white border ${formErrors.state ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm`}
                      placeholder="State"
                    />
                    {formErrors.state && <p className="text-[10px] text-rose-500 font-bold ml-0.5">{formErrors.state}</p>}
                  </div>
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="space-y-3 pt-2">
                <label className="text-[11px] font-bold text-slate-600 ml-0.5">Promo code</label>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code e.g. PROMO15"
                    className="flex-1 min-w-0 px-4 py-2.5 rounded-lg bg-white border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={!couponCode || validatingCoupon}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-black transition-colors disabled:opacity-50"
                  >
                    {validatingCoupon ? <Loader2 className="animate-spin" size={14} /> : 'Apply'}
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <Tag size={13} className="text-emerald-600" />
                    <p className="text-emerald-700 text-[11px] font-bold">
                      🎉 Code <span className="font-black">{appliedCoupon.code}</span> applied — you save ₹{discountAmount}!
                    </p>
                  </div>
                )}
              </div>

              {/* Step 3: Payment Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/20">
                    03
                  </div>
                  <h2 className="text-base font-bold text-slate-800 tracking-tight">Payment method</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    id='payment-online'
                    onClick={() => {
                      setFormData(prev => ({ ...prev, paymentMethod: 'ONLINE' }));
                      if (process.env.NODE_ENV === 'production') {
                        const windowObj = window as any;
                        windowObj.dataLayer = windowObj.dataLayer || [];
                        windowObj.dataLayer.push({ ecommerce: null });
                        windowObj.dataLayer.push({
                          event: 'add_payment_info',
                          ecommerce: {
                            currency: 'INR',
                            value: 499,
                            payment_type: 'Online Payment',
                            items: [{
                              item_id: '5e569d64-9678-4689-a594-ec9c0020f07b',
                              item_name: 'Gigi - The Awkward Age',
                              price: 499,
                              quantity: 1
                            }]
                          }
                        });
                      }
                    }}
                    className={`relative p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2.5 ${formData.paymentMethod === 'ONLINE' ? 'border-primary bg-primary/[0.03]' : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                  >
                    <CreditCard size={20} className={formData.paymentMethod === 'ONLINE' ? 'text-primary' : 'text-slate-400'} />
                    <div className="space-y-1 text-center">
                      <div className={`text-base font-bold ${formData.paymentMethod === 'ONLINE' ? 'text-primary' : 'text-slate-800'}`}>Pay online</div>
                      <div className="text-xs font-medium text-slate-500">Cards, UPI, NetBanking</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    id='payment-cod'
                    onClick={() => {
                      setFormData(prev => ({ ...prev, paymentMethod: 'COD' }));
                      if (process.env.NODE_ENV === 'production') {
                        const windowObj = window as any;
                        windowObj.dataLayer = windowObj.dataLayer || [];
                        windowObj.dataLayer.push({ ecommerce: null });
                        windowObj.dataLayer.push({
                          event: 'add_payment_info',
                          ecommerce: {
                            currency: 'INR',
                            value: 499,
                            payment_type: 'Cash on Delivery',
                            items: [{
                              item_id: '5e569d64-9678-4689-a594-ec9c0020f07b',
                              item_name: 'Gigi - The Awkward Age',
                              price: 499,
                              quantity: 1
                            }]
                          }
                        });
                      }
                    }}
                    className={`relative p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2.5 ${formData.paymentMethod === 'COD' ? 'border-primary bg-primary/[0.03]' : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                  >
                    <Truck size={20} className={formData.paymentMethod === 'COD' ? 'text-primary' : 'text-slate-400'} />
                    <div className="space-y-1 text-center">
                      <div className={`text-base font-bold ${formData.paymentMethod === 'COD' ? 'text-primary' : 'text-slate-800'}`}>Cash on delivery</div>
                      <div className="text-xs font-medium text-slate-500">Pay at door, just a little more!</div>

                    </div>
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-3">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={processing || pincodeLoading}
                  className="w-full py-4 bg-primary text-white rounded-lg font-bold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
