'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { useAuthStore } from '@/store/auth-store';
import { ShopService, Book } from '@/services/shop.service';
import { 
  ArrowLeft, CreditCard, Truck, CheckCircle2, ShieldCheck, 
  ShoppingBag, Tag, Info, AlertCircle, Loader2 
} from 'lucide-react';
import Link from 'next/link';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');
  const { user, isAuthenticated } = useAuthStore();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Financials
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

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
    async function loadBook() {
      try {
        if (bookId) {
          const data = await ShopService.getBook(bookId);
          setBook(data);
        } else {
          const books = await ShopService.getBooks();
          if (books.length > 0) setBook(books[0]);
        }
      } catch (err) {
        setBook({ id: 'default', title: 'Growing Up Honest', description: '...', price: 499, stock: 100, isActive: true });
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [bookId]);

  // Pincode Lookup
  useEffect(() => {
    if (formData.pincode.length === 6) {
      const fetchPincodeData = async () => {
        setPincodeLoading(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
          const data = await res.json();
          if (data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              city: postOffice.District,
              state: postOffice.State
            }));
          }
        } catch (err) {
          console.error('Pincode lookup failed');
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
      const result = await ShopService.validateCoupon(couponCode, book.price);
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
    if (!book) return { subtotal: 0, gst: 0, total: 0 };
    const subtotal = book.price;
    const gst = Math.round((subtotal - discountAmount) * 0.05);
    const total = subtotal - discountAmount + gst;
    return { subtotal, gst, total };
  };

  const { subtotal, gst, total } = calculateTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    setProcessing(true);
    setError(null);

    try {
      const orderData = {
        ...formData,
        userId: user?.id,
        items: [{ bookId: book.id, quantity: 1 }],
        couponCode: appliedCoupon?.code,
      };

      const order = await ShopService.createOrder(orderData);

      if (formData.paymentMethod === 'ONLINE' && order.razorpayOrderId) {
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

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-extrabold mb-4">Order Placed!</h1>
          <p className="text-slate-600 mb-10 leading-relaxed">
            Your journey with Infano has begun. We've sent a confirmation email with all the details.
          </p>
          <button onClick={() => router.push('/')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Link href="/the-book" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-10 transition-colors font-semibold group">
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Product
        </Link>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Left: Product Info & Price Summary */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                <ShoppingBag className="text-indigo-600" size={24} />
                Order Summary
              </h2>
              
              {book && (
                <div className="flex gap-6 mb-10">
                  <div className="w-28 h-36 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-3 flex flex-col justify-between text-white text-[9px] font-bold">
                    <span>Infano</span>
                    <span className="text-xs leading-tight">{book.title}</span>
                    <div className="h-1 w-6 bg-white/40 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{book.title}</h3>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed line-clamp-2">{book.description}</p>
                    <div className="mt-4 font-extrabold text-xl">₹{book.price}</div>
                  </div>
                </div>
              )}

              {/* Coupon Section */}
              <div className="space-y-4 pt-8 border-t border-slate-100">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Coupon Code"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-bold text-sm tracking-widest"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={applyCoupon}
                    disabled={validatingCoupon || !couponCode}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 disabled:bg-slate-200 transition-all active:scale-95 flex items-center gap-2"
                  >
                    {validatingCoupon && <Loader2 className="animate-spin" size={16} />}
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl">
                    <div className="flex items-center gap-2 text-green-700 text-sm font-bold">
                      <CheckCircle2 size={16} /> {appliedCoupon.code} Applied
                    </div>
                    <button onClick={() => { setAppliedCoupon(null); setDiscountAmount(0); }} className="text-[10px] uppercase font-bold text-green-700 underline">Remove</button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="mt-10 space-y-4 pt-8 border-t border-slate-100">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 font-medium items-center gap-2">
                  <span className="flex items-center gap-1.5">GST (5%) <Info size={14} className="text-slate-400" /></span>
                  <span>₹{gst}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="text-xl font-bold text-slate-900">Total Amount</span>
                  <span className="text-3xl font-black text-indigo-600">₹{total}</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100">
               <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Infano Guarantee</h4>
                    <p className="text-indigo-100 text-sm mt-1 leading-relaxed">
                      Your payment is 100% secure. We use Razorpay for end-to-end encryption. Delivery takes 3-5 business days.
                    </p>
                  </div>
               </div>
            </div>
          </div>

          {/* Right: Shipping Form */}
          <div className="lg:col-span-7 bg-white rounded-[2rem] shadow-xl border border-slate-200 p-8 sm:p-12">
            <h2 className="text-2xl font-extrabold mb-10">Shipping Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                  <AlertCircle size={20} /> {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                  <input required name="guestName" value={formData.guestName} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email</label>
                  <input required type="email" name="guestEmail" value={formData.guestEmail} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold" placeholder="john@example.com" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Phone</label>
                  <input required name="guestPhone" value={formData.guestPhone} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold" placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">GST Number (Optional)</label>
                  <input name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold" placeholder="22AAAAA0000A1Z5" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Address</label>
                <textarea required name="shippingAddress" value={formData.shippingAddress} onChange={handleInputChange} rows={3} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold resize-none" placeholder="Flat No, Street, Area..." />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Pincode</label>
                  <div className="relative">
                    <input required maxLength={6} name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold tracking-widest" placeholder="400001" />
                    {pincodeLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-indigo-500" size={18} />}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">City</label>
                  <input required name="city" value={formData.city} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 font-bold" readOnly placeholder="Autofilled" />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">State</label>
                  <input required name="state" value={formData.state} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 font-bold" readOnly placeholder="Autofilled" />
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-6">
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'ONLINE' }))} className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-3 transition-all ${formData.paymentMethod === 'ONLINE' ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100' : 'border-slate-100 hover:border-slate-200'}`}>
                    <CreditCard size={28} />
                    <span className="font-extrabold text-sm">Online Payment</span>
                  </button>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'COD' }))} className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-3 transition-all ${formData.paymentMethod === 'COD' ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100' : 'border-slate-100 hover:border-slate-200'}`}>
                    <Truck size={28} />
                    <span className="font-extrabold text-sm">Cash on Delivery</span>
                  </button>
                </div>
              </div>

              <button disabled={processing || !book || pincodeLoading} className={`w-full py-6 rounded-[2rem] font-black text-xl shadow-2xl transform active:scale-[0.98] transition-all mt-10 ${processing ? 'bg-slate-300' : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'}`}>
                {processing ? <span className="flex items-center justify-center gap-3"><Loader2 className="animate-spin" /> Finalizing...</span> : (formData.paymentMethod === 'ONLINE' ? `Complete Payment` : 'Place Order Now')}
              </button>
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    }>
      <CheckoutContent />
    </React.Suspense>
  );
}
