'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { 
  ArrowLeft, ShoppingBag, User, MapPin, CreditCard, 
  Clock, Truck, CheckCircle, XCircle, Package, Phone, Mail,
  AlertCircle, ChevronRight, Receipt, Tag, Info, ShieldCheck
} from 'lucide-react';

const STATUS_STEPS = [
  { id: 'PLACED', label: 'Order Placed', icon: Clock },
  { id: 'PROCESSING', label: 'Processing', icon: Package },
  { id: 'SHIPPED', label: 'Shipped', icon: Truck },
  { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PLACED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(`/admin/orders/${id}`);
      setOrder(response);
    } catch (error) {
      console.error('Failed to fetch order', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!STATUS_TRANSITIONS[order.orderStatus].includes(newStatus)) return;
    
    try {
      setUpdating(true);
      setError(null);
      await apiClient.patch(`/admin/orders/${id}/status`, { status: newStatus });
      await fetchOrder();
    } catch (error: any) {
      setError(error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
  
  if (!order) return (
    <div className="p-12 text-center bg-white rounded-3xl border border-border">
      <XCircle size={48} className="mx-auto text-rose-500 mb-4" />
      <h2 className="text-2xl font-bold">Order not found</h2>
      <button onClick={() => router.back()} className="mt-4 text-primary font-bold">Go Back</button>
    </div>
  );

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === order.orderStatus);
  const isCancelled = order.orderStatus === 'CANCELLED';

  return (
    <div className="space-y-8 pb-20">
      <div className="admin-header flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 rounded-2xl bg-white border border-border text-muted-foreground hover:text-primary transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-3xl font-black tracking-tight">Order #{order.id.slice(0, 8)}</h1>
               <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                 order.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
               }`}>
                 {order.paymentStatus}
               </span>
            </div>
            <p className="text-muted-foreground font-medium mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-3">
           {!isCancelled && order.orderStatus !== 'DELIVERED' && (
             <button 
               disabled={updating}
               onClick={() => updateStatus('CANCELLED')}
               className="px-6 py-3 rounded-2xl border-2 border-rose-100 text-rose-600 font-bold hover:bg-rose-50 transition-all flex items-center gap-2"
             >
               <XCircle size={18} /> Cancel Order
             </button>
           )}
           <button className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
             <Receipt size={18} /> Print Invoice
           </button>
        </div>
      </div>

      {/* Status Stepper */}
      {!isCancelled && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-border p-8 sm:p-12">
          <div className="relative flex justify-between">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-1000"
              style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
            ></div>

            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-4 bg-white px-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 ${
                    isCompleted 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                      : 'bg-white text-slate-300 border-slate-100'
                  } ${isCurrent ? 'scale-125' : ''}`}>
                    <step.icon size={24} />
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-black uppercase tracking-widest ${isCompleted ? 'text-foreground' : 'text-slate-300'}`}>
                      {step.label}
                    </p>
                    {isCurrent && <p className="text-[10px] text-primary font-bold mt-1">Current Status</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-8 flex items-center gap-6 text-rose-600">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
             <XCircle size={32} />
           </div>
           <div>
             <h3 className="text-xl font-black">Order Cancelled</h3>
             <p className="font-medium opacity-80">This order was cancelled and items have been returned to stock.</p>
           </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Order Content */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-border overflow-hidden">
            <div className="p-8 border-b border-border bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-xl font-black flex items-center gap-3">
                <Package className="text-primary" size={24} />
                Order Items
              </h2>
            </div>
              <div className="divide-y divide-border">
              {order.items.map((item: any) => {
                const book = item.book || {};
                const title = book.title || item.bookTitle || item.name || item.bookId || 'Product Item';
                const isProgram = !!(book.sessions || book.classRange || book.duration || (book.title && book.title.toLowerCase().includes('program')));
                const isbnId = (book.id || item.bookId || 'unknown').toString().slice(0, 6).toUpperCase();
                const unitPrice = item.price || book.price || 0;
                return (
                <div key={item.id} className="p-8 flex gap-8 items-center group">
                  <div className="w-24 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-[10px] font-bold shadow-lg p-3 text-center transition-transform group-hover:scale-105">
                    {isProgram ? 'Program' : 'Book'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-xl text-foreground">{isProgram ? `Program Enrollment: ${title}` : title}</h3>
                    <p className="text-muted-foreground font-bold mt-1">Quantity: {item.quantity}</p>
                    <div className="mt-4 flex items-center gap-2">
                      {!isProgram && (
                       <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500">ISBN: INF-{isbnId}</span>
                      )}
                      {isProgram && (
                       <span className="px-3 py-1 bg-purple-50 rounded-lg text-[10px] font-bold text-purple-600">Enrollment Item</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-2xl">₹{unitPrice * item.quantity}</p>
                    <p className="text-sm font-bold text-muted-foreground">₹{unitPrice} per copy</p>
                  </div>
                </div>
              )})}
            </div>
            
            {/* Financials Breakdown */}
            <div className="p-8 bg-slate-50/50 border-t border-border space-y-4">
              <div className="flex justify-between font-bold text-muted-foreground">
                <span>Gross Amount</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between font-bold text-green-600">
                  <span className="flex items-center gap-2"><Tag size={16} /> Discount Applied ({order.coupon?.code})</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-muted-foreground">
                <span>Taxable Amount</span>
                <span>₹{order.taxableAmount || (order.subtotal - order.discountAmount)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-dashed border-border/50">
                 <div className="flex justify-between text-xs font-bold text-muted-foreground">
                   <span>CGST (2.5%)</span>
                   <span>₹{order.cgstAmount}</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold text-muted-foreground">
                   <span>SGST (2.5%)</span>
                   <span>₹{order.sgstAmount}</span>
                 </div>
              </div>
              <div className="flex justify-between font-bold text-muted-foreground">
                <span>Delivery Charge</span>
                <span>{order.deliveryCharge > 0 ? `₹${order.deliveryCharge}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-border">
                <span className="text-xl font-black">Total Paid</span>
                <span className="text-4xl font-black text-primary">₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Payment Details */}
            {order.razorpayOrderId && (
              <div className="p-8 border-t border-border bg-indigo-50/30">
                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-900 mb-4 flex items-center gap-2">
                  <CreditCard size={16} /> Payment Reference
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase">Razorpay Order ID</p>
                    <p className="text-sm font-mono font-bold text-indigo-900">{order.razorpayOrderId}</p>
                  </div>
                  {order.razorpayPaymentId && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase">Payment ID</p>
                      <p className="text-sm font-mono font-bold text-indigo-900">{order.razorpayPaymentId}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Shipping Info */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-border p-8 sm:p-10">
            <h2 className="text-xl font-black flex items-center gap-3 mb-8">
              <MapPin className="text-primary" size={24} />
              Shipping Destination
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Street Address</label>
                    <p className="font-bold text-xl mt-2 leading-relaxed">{order.shippingAddress}</p>
                  </div>
                  <div className="flex gap-12">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">City</label>
                      <p className="font-bold text-xl mt-2">{order.city}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">State</label>
                      <p className="font-bold text-xl mt-2">{order.state}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pincode</label>
                    <p className="font-black text-2xl mt-2 tracking-widest">{order.pincode}</p>
                  </div>
               </div>
               <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
                  <h4 className="font-bold flex items-center gap-2 mb-4">
                    <Info size={18} className="text-primary" /> Delivery Instructions
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    Standard delivery. Please ensure the package is handled with care. The customer has requested notifications upon delivery.
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-8">
          {/* Status Controls */}
          <div className="bg-white rounded-[2rem] shadow-xl border border-border p-8">
            <h2 className="text-xl font-black mb-8">Actions</h2>
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold">
                {error}
              </div>
            )}
            <div className="space-y-4">
              {STATUS_STEPS.map((step, idx) => {
                const canTransition = STATUS_TRANSITIONS[order.orderStatus]?.includes(step.id);
                const isCurrent = order.orderStatus === step.id;
                
                return (
                  <button
                    key={step.id}
                    disabled={updating || !canTransition}
                    onClick={() => updateStatus(step.id)}
                    className={`w-full group relative flex items-center justify-between px-6 py-5 rounded-[1.5rem] border-2 transition-all font-black ${
                      isCurrent 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : canTransition 
                          ? 'border-slate-50 hover:border-primary/30 hover:bg-slate-50 text-slate-600' 
                          : 'border-transparent opacity-40 cursor-not-allowed bg-slate-50/50 grayscale'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <step.icon size={20} className={isCurrent ? 'text-primary' : ''} />
                      {step.label}
                    </div>
                    {isCurrent ? (
                      <CheckCircle size={18} />
                    ) : canTransition ? (
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    ) : null}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-8 pt-8 border-t border-border">
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">
                 Strict state machine validation enabled
               </p>
            </div>
          </div>

          {/* Customer Card */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-border p-8">
             <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Customer Profile</h3>
             <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light text-white rounded-[1.2rem] flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/20">
                  {(order.guestName || order.user?.username || 'G')[0]}
                </div>
                <div>
                  <p className="font-black text-xl">{order.guestName || order.user?.username || 'Guest'}</p>
                  <p className="text-xs font-bold text-primary mt-1">{order.userId ? 'Registered Member' : 'Guest Customer'}</p>
                </div>
             </div>
             
             <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                   <Mail size={18} className="text-slate-400" />
                   <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-muted-foreground uppercase">Email</p>
                      <p className="font-bold text-sm truncate">{order.guestEmail || 'N/A'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                   <Phone size={18} className="text-slate-400" />
                   <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase">Phone</p>
                      <p className="font-bold text-sm">{order.guestPhone || 'N/A'}</p>
                   </div>
                </div>
                {order.gstNumber && (
                  <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <ShieldCheck size={18} className="text-indigo-400" />
                    <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase">GSTIN</p>
                        <p className="font-bold text-sm text-indigo-700">{order.gstNumber}</p>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
