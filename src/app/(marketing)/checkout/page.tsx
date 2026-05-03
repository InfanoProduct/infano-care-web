'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { useAuthStore } from '@/store/auth-store';
import { ShopService, Book } from '@/services/shop.service';
import { ArrowLeft, CreditCard, Truck, CheckCircle2, ShieldCheck, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');
  const { user, isAuthenticated } = useAuthStore();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    shippingAddress: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'ONLINE' as 'ONLINE' | 'COD',
  });

  useEffect(() => {
    async function loadBook() {
      try {
        if (bookId) {
          const data = await ShopService.getBook(bookId);
          setBook(data);
        } else {
          // Default book fallback or fetch first available
          const books = await ShopService.getBooks();
          if (books.length > 0) setBook(books[0]);
        }
      } catch (err) {
        console.error('Failed to load book', err);
        // Fallback static data for demonstration if API fails
        setBook({
          id: 'default',
          title: 'Growing Up Honest',
          description: 'The companion guide every adolescent girl needs. Written with warmth, honesty, and deep respect.',
          price: 499,
          stock: 100
        });
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [bookId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (method: 'ONLINE' | 'COD') => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
  };

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
      };

      const order = await ShopService.createOrder(orderData);

      if (formData.paymentMethod === 'ONLINE' && order.razorpayOrderId) {
        // Razorpay integration
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
              setError('Payment verification failed. Please contact support.');
            } finally {
              setProcessing(false);
            }
          },
          prefill: {
            name: isAuthenticated ? user?.username : formData.guestName,
            email: formData.guestEmail,
            contact: formData.guestPhone,
          },
          theme: {
            color: '#6366f1',
          },
          modal: {
            ondismiss: function() {
                setProcessing(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // COD path
        setOrderSuccess(true);
        setProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Order Placed!</h1>
          <p className="text-slate-600 mb-8">
            Thank you for your purchase. We've sent a confirmation email with your order details.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/the-book" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Back to Product
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Book Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <ShoppingBag className="mr-3 text-indigo-600" /> Order Summary
              </h2>
              
              {loading ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-lg bg-slate-200 h-40 w-32"></div>
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded"></div>
                      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ) : book ? (
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-40 aspect-[3/4] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-4 flex flex-col justify-between text-white transform rotate-1">
                     <p className="text-[10px] font-bold opacity-80">Infano.care</p>
                     <h3 className="text-xl font-bold leading-tight">{book.title}</h3>
                     <div className="h-1 w-8 bg-white/30 rounded"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{book.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                      {book.description}
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-slate-500">Price</span>
                      <span className="text-2xl font-bold text-indigo-600">₹{book.price}</span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-8 space-y-4 border-t border-slate-100 pt-8">
                <div className="flex items-center text-slate-600 text-sm">
                  <Truck size={18} className="mr-3 text-indigo-500" />
                  <span>Free Express Shipping across India</span>
                </div>
                <div className="flex items-center text-slate-600 text-sm">
                  <ShieldCheck size={18} className="mr-3 text-indigo-500" />
                  <span>Secure & Encrypted Transactions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Checkout Form */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 lg:p-10">
            <h2 className="text-2xl font-bold mb-8">Shipping & Payment</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    required
                    type="text"
                    name="guestName"
                    value={formData.guestName}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <input
                    required
                    type="email"
                    name="guestEmail"
                    value={formData.guestEmail}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                <input
                  required
                  type="tel"
                  name="guestPhone"
                  value={formData.guestPhone}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Shipping Address</label>
                <textarea
                  required
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  placeholder="Street address, Apartment, etc."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">City</label>
                  <input
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">State</label>
                  <input
                    required
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-sm font-semibold text-slate-700">Pincode</label>
                  <input
                    required
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <label className="text-sm font-semibold text-slate-700">Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange('ONLINE')}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      formData.paymentMethod === 'ONLINE'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <CreditCard size={24} />
                    <span className="font-bold text-sm">Online Payment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange('COD')}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      formData.paymentMethod === 'COD'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <Truck size={24} />
                    <span className="font-bold text-sm">Cash on Delivery</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing || !book}
                className={`w-full py-5 rounded-2xl font-bold text-lg shadow-lg transform active:scale-95 transition-all mt-6 ${
                  processing 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  formData.paymentMethod === 'ONLINE' ? `Pay ₹${book?.price}` : 'Place Order'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
