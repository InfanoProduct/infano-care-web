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
        setBook({ id: 'default', title: 'The Awkward Age', description: 'A story of Every Adolescent Girl', price: 499, stock: 100, isActive: true });
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
    if (!book) return { subtotal: 0, gst: 0, delivery: 0, total: 0 };
    const priceAfterDiscount = book.price - discountAmount;
    const delivery = priceAfterDiscount < 500 ? 50 : 0;
    const taxableValue = Math.round((priceAfterDiscount / 1.05) * 100) / 100;
    const gst = Math.round((priceAfterDiscount - taxableValue) * 100) / 100;
    const total = priceAfterDiscount + delivery;
    return { subtotal: book.price, gst, delivery, total };
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
    <div className="min-h-screen bg-white font-sans text-slate-900 pt-24 pb-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-7xl mx-auto px-6">
        <Link href="/the-book" className="inline-flex items-center text-slate-500 hover:text-primary mb-10 transition-colors font-semibold group">
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Product
        </Link>

        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
          {/* Left: Product Gallery */}
          <div className="lg:col-span-5 space-y-8 sticky top-32">
            <div className="px-8 lg:px-12">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl bg-slate-50 border border-slate-100">
                <Image 
                  src={selectedImage} 
                  alt="Book Page" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-all duration-700"
                  priority
                />
              </div>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-2">
              {bookImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 aspect-[3/4] rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                    selectedImage === img ? 'ring-2 ring-primary ring-offset-2' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black tracking-tight">{book?.title || 'The Awkward Age'}</h1>
              <p className="text-slate-500 font-bold italic">{book?.description || 'A story of Every Adolescent Girl'}</p>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-bold">Unit Price</span>
                <span className="font-bold text-slate-900">₹{book?.price || 499}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-bold">Quantity</span>
                <div className="flex items-center gap-4 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 font-bold">
                  <button type="button" className="text-slate-400 hover:text-slate-900 transition-colors">-</button>
                  <span className="text-slate-900">1</span>
                  <button type="button" className="text-slate-400 hover:text-slate-900 transition-colors">+</button>
                </div>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-600 font-bold">Discount ({appliedCoupon?.code})</span>
                  <span className="font-bold text-green-600">-₹{discountAmount}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-bold">Delivery Fee</span>
                <span className="font-bold text-slate-900">{delivery === 0 ? <span className="text-green-600">FREE</span> : `₹${delivery}`}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="font-black text-lg text-slate-900">Total Amount</span>
                <span className="text-2xl font-black text-[#9333EA]">₹{total}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center shadow-sm bg-white">
                  <ShieldCheck size={24} className="text-green-500" />
                  <span className="text-[11px] font-bold text-slate-600">Secure Payment</span>
                </div>
                <div className="border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center shadow-sm bg-white">
                  <Truck size={24} className="text-blue-500" />
                  <span className="text-[11px] font-bold text-slate-600">Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Checkout Form */}
          <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-12">
              
              {/* Step 1: Personal Details */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                    1
                  </div>
                  <h2 className="text-xl font-black">Personal Details</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-700 ml-1">Full Name</label>
                    <input 
                      required 
                      name="guestName" 
                      value={formData.guestName} 
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold placeholder:text-slate-300" 
                      placeholder="e.g. Ananya Sharma" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-700 ml-1">Phone Number</label>
                    <input 
                      required 
                      name="guestPhone" 
                      value={formData.guestPhone} 
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold placeholder:text-slate-300" 
                      placeholder="10-digit mobile number" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 ml-1">Email (optional)</label>
                  <input 
                    type="email" 
                    name="guestEmail" 
                    value={formData.guestEmail} 
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold placeholder:text-slate-300" 
                    placeholder="your@email.com" 
                  />
                </div>
              </div>

              {/* Step 2: Shipping Address */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                    2
                  </div>
                  <h2 className="text-xl font-black">Shipping Address</h2>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 ml-1">Street Address</label>
                  <input 
                    required 
                    name="shippingAddress" 
                    value={formData.shippingAddress} 
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold placeholder:text-slate-300" 
                    placeholder="Flat / House No / Street" 
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-700 ml-1">City</label>
                    <input 
                      required 
                      name="city" 
                      value={formData.city} 
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold placeholder:text-slate-300" 
                      placeholder="City" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-700 ml-1">State</label>
                    <input 
                      required 
                      name="state" 
                      value={formData.state} 
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold placeholder:text-slate-300" 
                      placeholder="State" 
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-700 ml-1">Pincode</label>
                    <div className="relative">
                      <input 
                        required 
                        name="pincode" 
                        value={formData.pincode} 
                        onChange={handleInputChange}
                        maxLength={6}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold placeholder:text-slate-300" 
                        placeholder="6-digit pincode" 
                      />
                      {pincodeLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" size={18} />}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-700 ml-1">Country</label>
                    <input 
                      readOnly
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent font-semibold text-slate-400 cursor-not-allowed" 
                      value="India" 
                    />
                  </div>
                </div>
              </div>

              {/* Coupon Code Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="text-sm font-black text-slate-700 ml-1">Have a coupon code?</label>
                <div className="flex gap-2">
                  <input 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold placeholder:text-slate-300"
                  />
                  <button 
                    type="button"
                    onClick={applyCoupon}
                    disabled={!couponCode || validatingCoupon}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-colors disabled:opacity-50"
                  >
                    {validatingCoupon ? <Loader2 className="animate-spin" size={20} /> : 'Apply'}
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-green-600 text-sm font-bold flex items-center gap-1 ml-1">
                    <Tag size={16} /> Coupon '{appliedCoupon.code}' applied!
                  </p>
                )}
              </div>

              {/* Payment Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                    3
                  </div>
                  <h2 className="text-xl font-black">Payment Method</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'ONLINE' }))}
                    className={`relative p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                      formData.paymentMethod === 'ONLINE' ? 'border-[#9333EA] bg-[#9333EA]/5' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    {formData.paymentMethod === 'ONLINE' && (
                       <div className="absolute top-4 right-4 text-[#9333EA]">
                         <CheckCircle2 size={20} />
                       </div>
                    )}
                    <CreditCard size={32} className={formData.paymentMethod === 'ONLINE' ? 'text-[#9333EA]' : 'text-slate-400'} />
                    <div className="space-y-1 text-center">
                      <div className={`font-black ${formData.paymentMethod === 'ONLINE' ? 'text-[#9333EA]' : 'text-slate-900'}`}>Pay Online</div>
                      <div className="text-[11px] font-bold text-slate-400">Cards, UPI, NetBanking</div>
                    </div>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'COD' }))}
                    className={`relative p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                      formData.paymentMethod === 'COD' ? 'border-[#9333EA] bg-[#9333EA]/5' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    {formData.paymentMethod === 'COD' && (
                       <div className="absolute top-4 right-4 text-[#9333EA]">
                         <CheckCircle2 size={20} />
                       </div>
                    )}
                    <Truck size={32} className={formData.paymentMethod === 'COD' ? 'text-[#9333EA]' : 'text-slate-400'} />
                    <div className="space-y-1 text-center">
                      <div className={`font-black ${formData.paymentMethod === 'COD' ? 'text-[#9333EA]' : 'text-slate-900'}`}>COD</div>
                      <div className="text-[11px] font-bold text-slate-400">Cash on Delivery</div>
                    </div>
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-3">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <div className="pt-8">
                <button 
                  type="submit"
                  disabled={processing || pincodeLoading}
                  className="w-full py-5 bg-[#9333EA] text-white rounded-[1.5rem] font-bold text-lg hover:bg-[#7e22ce] transition-all shadow-[0_8px_30px_rgb(147,51,234,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {processing ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={20} />
                      {formData.paymentMethod === 'ONLINE' ? `Pay ₹${total} & Place Order` : 'Place Order via COD'}
                    </>
                  )}
                </button>
                <p className="text-center text-slate-400 text-[11px] font-bold mt-6">
                  By placing order, you agree to our Terms and Privacy Policy.
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
