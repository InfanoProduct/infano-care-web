'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Package, Calendar, Loader2, ArrowLeft, MessageCircle,
  MapPin, FileText, Download, CheckCircle2, BadgeCheck, Clock, Truck,
  GraduationCap, ArrowRight
} from 'lucide-react';
import { ShopService } from '@/services/shop.service';
import { ProgramsService } from '@/services/programs.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { InvoiceModal } from '@/components/common/InvoiceModal';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { user } = useAuthStore();

  const [order, setOrder] = useState<{
    type: 'PROGRAM' | 'BOOK';
    data: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeInvoice, setActiveInvoice] = useState<{
    type: 'PROGRAM' | 'BOOK';
    data: any;
  } | null>(null);

  const loadOrderData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersRes, enrollmentsRes] = await Promise.all([
        ShopService.getUserOrders().catch(() => []),
        ProgramsService.getUserEnrollments().catch(() => ({ success: true, data: [] }))
      ]);

      const foundOrder = ordersRes.find((o: any) => o.id === orderId);
      if (foundOrder) {
        setOrder({ type: 'BOOK', data: foundOrder });
      } else {
        const foundEnrollment = enrollmentsRes.data?.find((e: any) => e.id === orderId);
        if (foundEnrollment) {
          setOrder({ type: 'PROGRAM', data: foundEnrollment });
        } else {
          setOrder(null);
        }
      }
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
        <span className="font-extrabold text-lg text-slate-655 tracking-wide">Loading Details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 px-4">
        <Package size={44} className="text-slate-300" />
        <span className="font-bold text-lg text-slate-600">Order or enrollment not found</span>
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-full transition-all"
        >
          Go back to Orders
        </button>
      </div>
    );
  }

  const { type, data } = order;

  // For programs, calculate taxes (18% inclusive GST)
  const pricePaid = type === 'PROGRAM' ? data.pricePaid : 0;
  const programTaxableAmount = Math.round((pricePaid / 1.18) * 100) / 100;
  const programGstAmount = Math.round((pricePaid - programTaxableAmount) * 100) / 100;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-8 font-sans px-4 sm:px-6">
      <div className="no-print space-y-6">
        {/* Back button & Header */}
        <div className="flex items-center gap-4 mb-2 no-print">
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="w-10 h-10 bg-white border border-slate-205 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-350 transition-all shadow-3xs"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {type === 'PROGRAM' ? 'Program Enrollment' : 'Book Order'} #{data.id.slice(0, 8)}
            </h1>
            <p className="text-xs font-bold text-slate-505 flex items-center gap-1.5 mt-0.5">
              <Calendar size={12} className="text-slate-400" /> {new Date(data.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            className="hidden sm:flex items-center gap-1.5 px-4.5 py-2.5 bg-white border border-slate-205 hover:border-slate-350 hover:bg-slate-50 rounded-full text-xs font-extrabold text-slate-700 hover:text-slate-900 shadow-3xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            onClick={() => setActiveInvoice({ type, data })}
          >
            <Download size={13} /> Invoice
          </button>
        </div>

        <div className="sm:hidden mb-4 no-print">
          <button
            className="w-full flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-white border border-slate-205 rounded-full text-xs font-extrabold text-slate-700 hover:bg-slate-50 shadow-3xs transition-all"
            onClick={() => setActiveInvoice({ type, data })}
          >
            <Download size={13} /> Download Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">

          {/* Left Col: Summary & Tracker */}
          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white border border-slate-200/80 rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  {type === 'PROGRAM' ? (
                    <GraduationCap size={16} className="text-primary" />
                  ) : (
                    <Package size={16} className="text-primary" />
                  )}
                  {type === 'PROGRAM' ? 'Program Enrollment Summary' : 'Order Items Summary'}
                </h3>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 bg-white">
                {type === 'PROGRAM' ? (
                  <div className="p-6 flex items-start gap-4">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-200/85 shadow-3xs flex items-center justify-center">
                      {data.program?.thumbnailUrl ? (
                        <img
                          src={data.program.thumbnailUrl}
                          alt={data.program.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-655 bg-purple-50">
                          <GraduationCap size={32} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-purple-50 border border-purple-100 text-purple-755">
                          1:1 Private Mentoring
                        </span>
                      </div>
                      <h4 className="font-black text-slate-900 leading-snug text-base">{data.program?.title}</h4>
                      {data.program?.description && (
                        <p className="text-xs font-semibold text-slate-500 line-clamp-2 leading-relaxed">
                          {data.program.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-bold text-slate-400">
                          Class range: <span className="text-slate-700 font-extrabold">{data.program?.classRange}</span>
                          {data.program?.duration && (
                            <>
                              <span className="mx-2">•</span>
                              Duration: <span className="text-slate-700 font-extrabold">{data.program.duration}</span>
                            </>
                          )}
                        </span>
                        <span className="font-black text-slate-900">₹{data.pricePaid.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  data.items?.filter((it: any) => !isProgramItem(it)).map((it: any, idx: number) => {
                    const book = it.book || {};
                    const title = book.title || it.bookTitle || it.name || 'Book Order';
                    return (
                      <div key={idx} className="p-6 flex items-start gap-4">
                        <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-200/85 shadow-3xs">
                          {book.imageUrl ? (
                            <img
                              src={book.imageUrl}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-350 bg-slate-100">
                              <Package size={22} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-1.5 min-w-0">
                          <h4 className="font-black text-slate-900 leading-snug text-base">{title}</h4>
                          {book.description && (
                            <p className="text-xs font-semibold text-slate-500 line-clamp-2 leading-relaxed">
                              {book.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-bold text-slate-400">Quantity: <span className="text-slate-700 font-extrabold">{it.quantity}</span></span>
                            <span className="font-black text-slate-900">₹{(it.price || (data.totalAmount / it.quantity)).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {/* Horizontal Progress Tracker */}
              {type === 'BOOK' && (
                <div className="px-6 py-8 border-t border-slate-100 bg-linear-to-b from-slate-50/50 to-white">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-455 mb-8 flex items-center gap-1.5">
                    <Truck size={14} className="text-slate-400" /> Delivery Tracking
                  </h4>

                  {(() => {
                    const steps = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
                    const status = (data.orderStatus || 'PLACED').toUpperCase();
                    let currentIndex = steps.indexOf(status);
                    if (currentIndex === -1) currentIndex = 0;

                    return (
                      <div className="relative flex items-center justify-between w-full max-w-lg mx-auto px-2">
                        {/* Background Track */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0"></div>

                        {/* Active Track */}
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-linear-to-r from-emerald-400 to-teal-550 rounded-full z-0 transition-all duration-700 shadow-2xs"
                          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                        ></div>

                        {/* Step Nodes */}
                        {steps.map((step, idx) => {
                          const isCompleted = idx <= currentIndex;
                          const isActive = idx === currentIndex;

                          return (
                            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                              <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs shadow-emerald-200'
                                : 'bg-white border-slate-205 text-slate-300'
                                }`}>
                                {isCompleted ? <CheckCircle2 size={12} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
                              </div>
                              <span className={`absolute top-8.5 text-[9px] font-black tracking-widest whitespace-nowrap uppercase ${isActive ? 'text-emerald-700' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                                }`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  <div className="mt-12 text-center bg-slate-50 border border-slate-200/50 rounded-2xl p-3.5 max-w-md mx-auto">
                    <p className="text-xs font-bold text-slate-655 flex items-center justify-center gap-1.5 leading-none">
                      <Clock size={13} className="text-emerald-600 animate-pulse" />
                      {data.orderStatus === 'PLACED' && "Your items are securely confirmed."}
                      {data.orderStatus === 'PROCESSING' && "We're packing your order carefully."}
                      {data.orderStatus === 'SHIPPED' && "Your package has left the hub & is on its way!"}
                      {data.orderStatus === 'DELIVERED' && "Handovers completed. Enjoy your purchase!"}
                      {!['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(data.orderStatus) && "Your items are being processed securely."}
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons for Program */}
              {type === 'PROGRAM' && (
                <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/30 flex items-center justify-end gap-3">
                  <Link
                    href="/dashboard/enrolled-programs"
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-primary hover:bg-primary-dark text-white font-extrabold text-xs rounded-full shadow-md transition-all whitespace-nowrap active:scale-95"
                  >
                    Go to Enrolled Programs <ArrowRight size={13} />
                  </Link>
                </div>
              )}

            </div>

          </div>

          {/* Right Col: Payment, Shipping, Support */}
          <div className="space-y-6">

            {/* Payment Receipt */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                <h3 className="font-black text-slate-800 text-sm">Payment Receipt</h3>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-2 text-xs font-bold text-slate-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-850 font-bold">
                      ₹{type === 'PROGRAM' ? programTaxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : data.subtotal?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {type === 'BOOK' && data.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-650">
                      <span>Discount applied</span>
                      <span>-₹{data.discountAmount?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Taxable Value</span>
                    <span className="text-slate-850 font-bold">
                      ₹{type === 'PROGRAM' ? programTaxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : data.taxableAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({type === 'PROGRAM' ? '18%' : '5%'})</span>
                    <span className="text-slate-850 font-bold">
                      ₹{type === 'PROGRAM' ? programGstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : data.gstAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-extrabold text-slate-800 text-sm">Grand Total</span>
                  <span className="font-black text-primary text-xl">
                    ₹{type === 'PROGRAM' ? pricePaid.toLocaleString('en-IN') : data.totalAmount?.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-3.5 border-t border-dashed border-slate-200 flex flex-col gap-1.5 text-[11px] font-bold text-slate-400">
                  <div className="flex justify-between">
                    <span>Gateway Method</span>
                    <span className="text-slate-700 uppercase">
                      {type === 'PROGRAM' ? 'Razorpay (ONLINE)' : data.paymentMethod || 'RAZORPAY'}
                    </span>
                  </div>
                  {(type === 'PROGRAM' || data.razorpayPaymentId) && (
                    <div className="flex justify-between">
                      <span>Transaction ID</span>
                      <span className="text-slate-700 font-mono">
                        {type === 'PROGRAM' ? data.id : data.razorpayPaymentId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address or Enrollment Info */}
            {type === 'BOOK' ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  <h3 className="font-black text-slate-805 text-sm">Shipping Address</h3>
                </div>

                <div className="p-5 space-y-2">
                  <p className="text-sm font-black text-slate-905 flex items-center gap-1.5">
                    <BadgeCheck size={15} className="text-primary shrink-0" />
                    {data.guestName || 'Recipient Name'}
                  </p>
                  {data.guestPhone && (
                    <p className="text-xs font-extrabold text-slate-500">Contact: {data.guestPhone}</p>
                  )}
                  <p className="text-xs font-semibold text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-150/40">
                    {data.shippingAddress}<br />
                    {data.city}, {data.state} - {data.pincode}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <GraduationCap size={16} className="text-slate-400" />
                  <h3 className="font-black text-slate-800 text-sm">Enrollment Details</h3>
                </div>

                <div className="p-5 space-y-2">
                  <p className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <BadgeCheck size={15} className="text-primary shrink-0" />
                    {data.guestName || data.user?.profile?.displayName || data.user?.username || 'Recipient Name'}
                  </p>
                  <div className="text-xs font-semibold text-slate-655 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-150/40 space-y-1">
                    <div><span className="text-slate-400 font-bold">Contact Email:</span> <span className="text-slate-850 font-black">{data.guestEmail || data.user?.parentEmail || 'N/A'}</span></div>
                    <div><span className="text-slate-400 font-bold">Contact Phone:</span> <span className="text-slate-855 font-black">{data.user?.phone || 'N/A'}</span></div>
                    <div><span className="text-slate-400 font-bold">Role context:</span> <span className="text-slate-855 font-black">{data.user?.role === 'TEEN' ? 'Teen Workspace' : 'Parent Portal'}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Billing Support Card */}
            <div className="bg-linear-to-br from-[#FFF8F8] to-[#FFFBFB] border border-rose-200/60 rounded-2xl p-5 shadow-2xs space-y-4 text-center sm:text-left">
              <h4 className="text-xs font-black text-rose-750 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
                <MessageCircle size={16} className="text-rose-500 animate-pulse" />
                Assistance Required?
              </h4>
              <p className="text-xs font-bold text-slate-650 leading-relaxed">
                Have questions regarding mentoring session structures, payments, or coordinates? Reach out directly.
              </p>
              <a
                href={`https://wa.me/919243019243?text=Hi,%2520I%252520need%252520help%252520with%25252520my%252520${type === 'PROGRAM' ? 'mentoring%2520program' : 'book%2520order'}%2520%23${data.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20BA56] text-white font-extrabold py-2.5 px-4 rounded-full flex items-center justify-center gap-1.5 text-xs shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <MessageCircle size={14} className="fill-white" /> Contact Coordinator
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* Invoice Download Modal */}
      <InvoiceModal
        isOpen={activeInvoice !== null}
        onClose={() => setActiveInvoice(null)}
        type={activeInvoice?.type || 'BOOK'}
        data={activeInvoice?.data}
      />
    </div>
  );
}
