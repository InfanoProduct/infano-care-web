'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Package, Calendar, Loader2, ArrowLeft, MessageCircle, 
  MapPin, FileText, Download, CheckCircle2
} from 'lucide-react';
import { ShopService } from '@/services/shop.service';
import Link from 'next/link';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadOrderData = useCallback(async () => {
    try {
      setLoading(true);
      const ordersRes = await ShopService.getUserOrders().catch(() => []);
      const foundOrder = ordersRes.find((o: any) => o.id === orderId);
      setOrder(foundOrder || null);
    } catch (err) {
      console.error('Failed to load order data:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrderData();
  }, [loadOrderData]);

  const isProgramItem = (it: any) => {
    const book = it.book || {};
    const bookId = (it.bookId || '').toLowerCase();
    const bookTitle = (book.title || it.bookTitle || '').toLowerCase();
    if ((book as any).curriculum?.length || book.classRange || book.duration) return true;
    if (bookId.includes('program') || bookId.includes('private') || bookId.includes('group') || bookId.includes('cohort')) return true;
    if (bookTitle.includes('program') || bookTitle.includes('mentoring') || bookTitle.includes('cohort')) return true;
    return false;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-primary">
        <Loader2 className="animate-spin text-primary" size={44} />
        <span className="font-extrabold text-lg text-slate-600 tracking-wide">Loading Order Details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Package size={44} className="text-slate-300" />
        <span className="font-bold text-lg text-slate-600">Order not found</span>
        <button onClick={() => router.push('/dashboard/orders')} className="text-primary font-bold text-sm hover:underline">
          Go back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-[1000px] mx-auto pb-8 font-sans">
      
      {/* Back button & Header */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => router.push('/dashboard/orders')}
          className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button 
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-sm transition-all"
          onClick={() => alert("Invoice download will be available soon.")}
        >
          <Download size={14} /> Download Invoice
        </button>
      </div>

      <div className="sm:hidden mb-6">
        <button 
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          onClick={() => alert("Invoice download will be available soon.")}
        >
          <Download size={14} /> Download Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Combined Items & Status Card */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm">Order Summary</h3>
            </div>
            
            {/* 1. Items List */}
            <div className="divide-y divide-slate-100">
              {order.items?.filter((it: any) => !isProgramItem(it)).map((it: any, idx: number) => {
                const book = it.book || {};
                const title = book.title || it.bookTitle || it.name || 'Book Order';
                return (
                  <div key={idx} className="p-6 flex items-start gap-4">
                    <div className="w-20 h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      {book.imageUrl ? (
                        <img 
                          src={book.imageUrl} 
                          alt={title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-slate-800">{title}</h4>
                      {book.description && (
                        <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">
                          {book.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-bold text-slate-400">Qty: {it.quantity}</span>
                        <span className="font-bold text-slate-800">₹{it.price || (order.totalAmount / it.quantity)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. Horizontal Progress Tracker */}
            <div className="px-6 py-8 border-t border-slate-100 bg-slate-50/30">
              <h4 className="text-xs font-bold text-slate-800 mb-6">Delivery Status</h4>
              
              {(() => {
                const steps = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
                const status = (order.orderStatus || 'PLACED').toUpperCase();
                let currentIndex = steps.indexOf(status);
                if (currentIndex === -1) currentIndex = 0; // Default if unknown

                return (
                  <div className="relative flex items-center justify-between w-full max-w-lg mx-auto">
                    {/* Background Track */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
                    
                    {/* Active Track */}
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500"
                      style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {/* Step Nodes */}
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= currentIndex;
                      const isActive = idx === currentIndex;
                      
                      return (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200' 
                              : 'bg-white border-slate-200 text-slate-300'
                          }`}>
                            {isCompleted ? <CheckCircle2 size={12} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
                          </div>
                          <span className={`absolute top-8 text-[10px] font-bold tracking-wider whitespace-nowrap ${
                            isActive ? 'text-emerald-600' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              
              <div className="mt-12 text-center">
                <p className="text-xs font-semibold text-slate-500">
                  {order.orderStatus === 'PLACED' && "Your items are securely confirmed."}
                  {order.orderStatus === 'PROCESSING' && "We're packing your order carefully."}
                  {order.orderStatus === 'SHIPPED' && "Your package is on its way!"}
                  {order.orderStatus === 'DELIVERED' && "Enjoy your purchase!"}
                  {!['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.orderStatus) && "Your items are being processed securely."}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Right Col: Payment, Shipping, Support */}
        <div className="space-y-6">
          
          {/* Payment Summary */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <FileText size={16} className="text-slate-400" />
              <h3 className="font-bold text-slate-800 text-sm">Payment Summary</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2 text-xs font-medium text-slate-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-800 font-bold">₹{order.subtotal}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-bold">-₹{order.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxable Value</span>
                  <span className="text-slate-800 font-bold">₹{order.taxableAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="text-slate-800 font-bold">₹{order.gstAmount}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm">Total Paid</span>
                <span className="font-black text-primary text-xl">₹{order.totalAmount}</span>
              </div>
              <div className="pt-3 flex flex-col gap-1.5 text-[11px] font-medium text-slate-400">
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="text-slate-700 font-bold">{order.paymentMethod}</span>
                </div>
                {order.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span>Transaction ID</span>
                    <span className="text-slate-700 font-bold font-mono">{order.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <MapPin size={16} className="text-slate-400" />
              <h3 className="font-bold text-slate-800 text-sm">Shipping Details</h3>
            </div>
            <div className="p-5">
              <p className="text-sm font-bold text-slate-800">{order.guestName || 'Recipient'}</p>
              {order.guestPhone && <p className="text-xs font-semibold text-slate-500 mt-0.5">{order.guestPhone}</p>}
              <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">
                {order.shippingAddress}<br />
                {order.city}, {order.state} - {order.pincode}
              </p>
            </div>
          </div>

          {/* Support */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-center space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800">Need help with this order?</h4>
            <a 
              href={`https://wa.me/916362994347?text=Hi%2C%20I%20need%20help%20with%20my%20order%20%23${order.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-bold transition-all active:scale-[0.98]"
            >
              <MessageCircle size={14} /> Contact Support
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}
