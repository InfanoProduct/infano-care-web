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
  const { user, isAuthenticated } = useAuthStore();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(bookImages[0]);

  // Financials
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
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
            setBook(books[0]);
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

    try {
      const orderData = {
        ...formData,
        userId: user?.id,
        items: [{ bookId: book.id, quantity }],
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

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
          <button onClick={() => router.push('/')} className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all active:scale-95">
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
        <Link href="/gigi-the-awkward-age-book" className="inline-flex items-center text-slate-500 hover:text-primary mb-8 md:mb-12 transition-colors text-sm font-medium group">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to product
        </Link>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Product Gallery & Summary */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32 w-full max-w-full">
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

            <div className="space-y-2 max-w-[400px] mx-auto lg:mx-0 text-center lg:text-left">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">{book?.title || 'The Awkward Age'}</h1>
              <p className="text-slate-500 font-medium text-sm italic">{book?.description || 'A story of every adolescent girl'}</p>
            </div>

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

              {/* Step 2: Shipping Address */}
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
                    required
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
                      required
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
                      required
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
                        required
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

              {/* Promo Code Section */}
              <div className="space-y-3 pt-2">
                <label className="text-[11px] font-bold text-slate-600 ml-0.5">Promo code</label>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-primary/60 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm"
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
                  <p className="text-emerald-600 text-[10px] font-bold flex items-center gap-1 ml-0.5">
                    <Tag size={12} /> Coupon '{appliedCoupon.code}' applied!
                  </p>
                )}
              </div>

              {/* Step 3: Payment Selection */}
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
