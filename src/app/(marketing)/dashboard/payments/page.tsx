'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CreditCard, Award, ShoppingBag, Calendar, CheckCircle2, 
  Loader2, ShieldCheck, ArrowRight, MessageCircle, ExternalLink,
  DollarSign, FileText, AlertCircle, HelpCircle, BadgeCheck, MapPin
} from 'lucide-react';
import { ProgramsService, ProgramEnrollment } from '@/services/programs.service';
import { ShopService } from '@/services/shop.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function CustomerPaymentsOverview() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<ProgramEnrollment[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'programs' | 'books'>('programs');

  const loadPaymentData = useCallback(async () => {
    try {
      setLoading(true);
      const [enrollRes, ordersRes] = await Promise.all([
        ProgramsService.getUserEnrollments().catch(() => ({ success: true, data: [] })),
        ShopService.getUserOrders().catch(() => [])
      ]);

      setEnrollments(enrollRes.data || []);
      setOrders(ordersRes || []);
    } catch (err) {
      console.error('Failed to load payment & invoice data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaymentData();
  }, [loadPaymentData]);

  // Helper to detect program-like items vs book items
  const isProgramItem = (it: any) => {
    const book = it.book || {};
    const bookId = (it.bookId || '').toLowerCase();
    const bookTitle = (book.title || it.bookTitle || '').toLowerCase();
    
    // Check if it's a program by fields
    if (book.sessions || book.classRange || book.duration) return true;
    
    // Check by title or id
    if (bookId.includes('program') || bookId.includes('private') || bookId.includes('group') || bookId.includes('cohort')) return true;
    if (bookTitle.includes('program') || bookTitle.includes('mentoring') || bookTitle.includes('cohort')) return true;
    
    return false;
  };

  const productOrders = orders.filter((o: any) => (o.items || []).some((it: any) => !isProgramItem(it)));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-primary">
        <Loader2 className="animate-spin text-primary" size={44} />
        <span className="font-extrabold text-lg text-slate-600 tracking-wide">Compiling Financial Ledger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-[1280px] mx-auto pb-8 font-sans">
      
      {/* Header Banner */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-sm">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-primary/20 rounded-md text-[10px] font-bold text-primary shadow-sm">
            <CreditCard size={11} /> Secure Transactions
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Payments & Invoices
          </h1>
          <p className="text-xs font-semibold text-slate-500 max-w-lg leading-relaxed">
            Review detailed invoice summaries, track physical product delivery coordinates, and audit digital program enrollments.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Column for Payments lists, Right for FAQs/Support info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Tab Switcher & Data Lists (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Tab buttons */}
          <div className="flex bg-slate-100 p-1.5 rounded-lg border border-slate-200 text-xs font-bold select-none w-fit">
            <button
              onClick={() => setActiveTab('programs')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 ${
                activeTab === 'programs'
                  ? 'bg-white text-primary shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Award size={14} />
              Program Enrollments ({enrollments.length})
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 ${
                activeTab === 'books'
                  ? 'bg-white text-primary shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShoppingBag size={14} />
              Product Orders ({productOrders.length})
            </button>
          </div>

          {/* Tab 1: Program Enrollments list */}
          {activeTab === 'programs' && (
            <div className="space-y-4">
              {enrollments.length === 0 ? (
                <div className="text-center py-12 bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-3.5">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center mx-auto text-slate-300">
                    <Award size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-850">No Program Enrollments Found</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1 max-w-sm mx-auto">
                      You haven't enrolled in any developmental programs yet. Explore classes to get started!
                    </p>
                  </div>
                  <Link 
                    href="/#programs" 
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    View Curriculums <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                enrollments.map((enr) => (
                  <div 
                    key={enr.id}
                    className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm relative overflow-hidden border-t-4 border-t-primary"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            {enr.type === 'PRIVATE' ? '1:1 Private Mentoring' : 'Group Cohort (4 Girls)'}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(enr.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mt-1">
                          {enr.program.title} Program
                          {enr.user?.id && user?.id && enr.user.id !== user.id && (
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${enr.user?.role === 'TEEN' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                              By {enr.user?.role === 'TEEN' ? 'Daughter' : 'Parent'}
                            </span>
                          )}
                        </h3>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-lg font-bold text-slate-850">₹{enr.pricePaid.toLocaleString()}</span>
                        <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Paid successfully</p>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-slate-500">
                      <div className="flex flex-wrap gap-4">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block">Registration ID</span>
                          <span className="text-slate-700 font-bold font-mono text-[11px] block mt-0.5">{enr.id}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block">Enrollment Status</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1 mt-0.5 text-[11px]">
                            <BadgeCheck size={13} /> {enr.status}
                          </span>
                        </div>
                      </div>

                      <Link 
                        href="/dashboard"
                        className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-bold text-[11px] group"
                      >
                        Go to Workspace <ArrowRight className="group-hover:translate-x-0.5 transition-transform" size={12} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Book Orders list */}
          {activeTab === 'books' && (
            <div className="space-y-4">
              {productOrders.length === 0 ? (
                <div className="text-center py-12 bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-3.5">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center mx-auto text-slate-300">
                    <ShoppingBag size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-850">No Product Orders Found</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1 max-w-sm mx-auto">
                      You haven't ordered any books or products yet. Check out the Gigi Survival Guide!
                    </p>
                  </div>
                  <Link 
                    href="/gigi-the-awkward-age-book" 
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    View Book Details <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                productOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm relative overflow-hidden"
                  >
                    {/* Top Order Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-655 px-2 py-0.5 rounded-md border border-slate-200/60">
                            Order ID: #{order.id.slice(0, 8)}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                            order.paymentStatus === 'COMPLETED' 
                              ? 'bg-emerald-50 text-emerald-650 border border-emerald-100' 
                              : order.paymentStatus === 'PENDING'
                              ? 'bg-amber-50 text-amber-650 border border-amber-100'
                              : 'bg-rose-50 text-rose-650 border border-rose-100'
                          }`}>
                            Payment {order.paymentStatus}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 mt-1">
                          {order.items?.filter((it: any) => !isProgramItem(it)).map((it: any) => {
                            const book = it.book || {};
                            const title = book.title || it.bookTitle || it.name || 'Book Order';
                            return `${title} (x${it.quantity})`;
                          }).join(', ') || 'Book Order'}
                        </h4>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-lg font-bold text-slate-850">₹{order.totalAmount.toLocaleString()}</span>
                        <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Method: {order.paymentMethod}</p>
                      </div>
                    </div>

                    {/* Middle Detail Row: Shipping and Breakdown */}
                    <div className="py-4 border-b border-slate-100 grid md:grid-cols-2 gap-4 text-xs text-slate-500 font-semibold">
                      <div className="space-y-2">
                        <h5 className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                          <MapPin size={11} /> Shipping Address
                        </h5>
                        <p className="text-slate-700 leading-normal text-[11px] font-medium pl-4">
                          {order.guestName || 'Recipient'}<br />
                          {order.shippingAddress}, {order.city}, {order.state} - {order.pincode}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <h5 className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                          <FileText size={11} /> Tax Invoice Breakdown
                        </h5>
                        <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Subtotal:</span>
                            <span className="text-slate-600">₹{order.subtotal}</span>
                          </div>
                          {order.discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-600">
                              <span>Coupon Discount:</span>
                              <span>-₹{order.discountAmount}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-slate-400">Taxable Value:</span>
                            <span className="text-slate-600">₹{order.taxableAmount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">GST (5%):</span>
                            <span className="text-slate-650">₹{order.gstAmount} (CGST ₹{order.cgstAmount} + SGST ₹{order.sgstAmount})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Order Row */}
                    <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-slate-500">
                      <div className="flex flex-wrap gap-4">
                        {order.razorpayPaymentId && (
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block">Razorpay Payment ID</span>
                            <span className="text-slate-700 font-medium font-mono text-[10px] block mt-0.5">{order.razorpayPaymentId}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block">Delivery Status</span>
                          <span className="text-slate-800 font-bold block mt-0.5 text-[11px]">
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>

                      <a 
                        href={`https://wa.me/916362994347?text=Hi%2C%20I%27d%20like%20to%20track%20my%20order%20%23${order.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-bold text-[11px] group"
                      >
                        <MessageCircle size={12} /> Support Chat
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Support, Security, FAQs (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Safety Verification Badge */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-3.5">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="text-green-500" size={16} />
              Billing Security
            </h4>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Every checkout is processed securely using modern 256-bit encryption through Razorpay, India's leading payment infrastructure. 
            </p>
            <div className="border-t border-slate-100 pt-2.5 flex items-center gap-2.5 text-[9px] font-bold text-slate-400">
              <span>🔒 PCI-DSS Compliant</span>
              <span>•</span>
              <span>💳 UPI & Card Safe</span>
            </div>
          </div>

          {/* Billing FAQs */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="text-primary" size={16} />
              Billing FAQs
            </h4>

            <div className="space-y-3 text-xs">
              <div className="space-y-0.5">
                <h5 className="font-bold text-slate-700">How do I access sessions after enrolling?</h5>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Log in with the registered phone number. Your dashboard immediately hosts live Google Meet links for active program cohorts.
                </p>
              </div>

              <div className="space-y-0.5">
                <h5 className="font-bold text-slate-700">Can I request a payment refund?</h5>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Refunds are subject to terms based on book shipping and program session completions. Reach out directly to support at WhatsApp or email.
                </p>
              </div>

              <div className="space-y-0.5">
                <h5 className="font-bold text-slate-700">How do I get my Tax Invoice?</h5>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Tax invoice structures are dynamically printed above. If you need a formal PDF for corporate reimbursement, chat with our coordinator on WhatsApp.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
