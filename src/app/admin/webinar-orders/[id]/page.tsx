'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import {
  ArrowLeft, Ticket, User, CreditCard, Clock, CheckCircle, 
  XCircle, Phone, Mail, AlertCircle, Receipt, ExternalLink, Send,
  Loader2
} from 'lucide-react';
import { formatIndianDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function WebinarRegistrationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(`/admin/orders/${id}`);
      setOrder(response);
    } catch (error) {
      console.error('Failed to fetch webinar registration details', error);
      toast.error('Failed to load registration details');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCredentials = async () => {
    if (!order) return;
    try {
      toast.loading(`Resending ticket credentials to ${order.guestEmail}...`);
      await apiClient.post(`/admin/orders/${order.id}/resend-email`, {});
      toast.dismiss();
      toast.success(`Success! Webinar confirmation email sent to ${order.guestEmail}`);
    } catch (e) {
      toast.dismiss();
      toast.error('Failed to resend confirmation email');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-bold text-slate-400">Loading attendee records...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <AlertCircle className="text-red-500" size={48} />
        <p className="font-bold text-slate-700">Webinar Registration not found</p>
        <button onClick={() => router.back()} className="text-primary hover:underline flex items-center gap-1 font-bold">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const isPaid = order.paymentStatus === 'COMPLETED';
  const item = order.items?.[0];
  const webinarName = item?.book?.title || 'Decoding Her Silence Webinar';

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* Back navigation */}
      <div>
        <button
          onClick={() => router.push('/admin/webinar-orders')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-650 transition-all active:scale-95"
        >
          <ArrowLeft size={14} />
          <span>Back to Webinar Registrations</span>
        </button>
      </div>

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-150 pb-6">
        <div>
          <span className="text-[10px] font-black bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">
            Webinar Entry Pass Details
          </span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-3 flex items-center gap-3">
            <Ticket className="text-primary" size={32} />
            <span>Pass #{(order.id || '').slice(-8).toUpperCase()}</span>
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Registered on {formatIndianDate(order.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResendCredentials}
            disabled={!isPaid}
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
          >
            <Send size={14} />
            <span>Resend Confirmation Email</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Attendee & Ticket Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Webinar Pass Status Alert */}
          <div className={`p-6 rounded-[1.8rem] border flex items-start gap-4 ${
            isPaid ? 'bg-emerald-50/50 border-emerald-100/80 text-emerald-805' : 'bg-amber-50/50 border-amber-100/80 text-amber-805'
          }`}>
            {isPaid ? (
              <CheckCircle className="text-emerald-500 mt-0.5 shrink-0" size={20} />
            ) : (
              <XCircle className="text-amber-500 mt-0.5 shrink-0" size={20} />
            )}
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">
                {isPaid ? 'Webinar Entry Pass is Active' : 'Payment is Pending Verification'}
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                {isPaid 
                  ? `This parent has successfully completed their payment. A PARENT account has been auto-provisioned inside the system, and confirmation Zoom/PDF documents were sent to ${order.guestEmail}.`
                  : 'We have not yet received payment confirmation from Razorpay for this checkout session. Reminders cannot be sent until transaction is verified.'
                }
              </p>
            </div>
          </div>

          {/* Attendee Details Card */}
          <div className="glass-card p-8 rounded-[2rem] border-primary/5 shadow-md space-y-6 bg-white">
            <h2 className="text-base font-black flex items-center gap-2 border-b border-slate-100 pb-4 text-slate-850">
              <User size={18} className="text-primary" />
              <span>Attendee (Parent Info)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Parent Name</span>
                <p className="font-extrabold text-sm text-slate-850">{order.guestName || 'Parent'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Provisioned User Role</span>
                <p className="font-extrabold text-sm text-slate-850 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>PARENT (Guest Access)</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Email Address</span>
                <p className="font-extrabold text-sm text-slate-850 flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <span>{order.guestEmail}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Phone Number</span>
                <p className="font-extrabold text-sm text-slate-850 flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span>{order.guestPhone}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Webinar Details Card */}
          <div className="glass-card p-8 rounded-[2rem] border-primary/5 shadow-md space-y-6 bg-white">
            <h2 className="text-base font-black flex items-center gap-2 border-b border-slate-100 pb-4 text-slate-850">
              <Ticket size={18} className="text-primary" />
              <span>Webinar Masterclass Product</span>
            </h2>

            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                <Ticket size={24} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-base text-slate-850 leading-snug">{webinarName}</h3>
                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                  <span>Product Code: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-primary font-mono text-[9px]">{item?.book?.id || 'webinar-decoding-silence'}</code></span>
                  <span>Qty: 1 Ticket Pass</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right column: Billing & Transaction Details */}
        <div className="space-y-8">
          
          {/* Payment Summary */}
          <div className="glass-card p-8 rounded-[2rem] border-primary/5 shadow-md space-y-6 bg-white">
            <h2 className="text-base font-black flex items-center gap-2 border-b border-slate-100 pb-4 text-slate-850">
              <CreditCard size={18} className="text-primary" />
              <span>Billing & Payments</span>
            </h2>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Webinar Ticket Price</span>
                <span className="text-slate-800">₹{order.totalAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Taxes & Fees</span>
                <span className="text-slate-800">₹0</span>
              </div>
              <div className="border-t border-slate-100 pt-4 flex justify-between items-center font-bold">
                <span className="text-slate-900 font-black">Total Paid Amount</span>
                <span className="text-primary text-sm font-black">₹{order.totalAmount}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Payment Gateway</span>
                <p className="font-extrabold text-slate-850">Razorpay Inline Checkout</p>
              </div>

              {order.razorpayPaymentId && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Razorpay Payment ID</span>
                  <p className="font-mono text-primary font-bold bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 break-all select-all">
                    {order.razorpayPaymentId}
                  </p>
                </div>
              )}

              {order.razorpayOrderId && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Razorpay Order ID</span>
                  <p className="font-mono text-slate-600 font-bold bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 break-all select-all">
                    {order.razorpayOrderId}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
