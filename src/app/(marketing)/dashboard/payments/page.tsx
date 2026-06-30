'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CreditCard, Award, ShoppingBag, Calendar, CheckCircle2, 
  Loader2, ShieldCheck, ArrowRight, MessageCircle, ExternalLink,
  DollarSign, FileText, AlertCircle, HelpCircle, BadgeCheck, MapPin,
  GraduationCap, BookOpen
} from 'lucide-react';
import { ProgramsService, ProgramEnrollment } from '@/services/programs.service';
import { ShopService } from '@/services/shop.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { InvoiceModal } from '@/components/common/InvoiceModal';

export default function CustomerPaymentsOverview() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<ProgramEnrollment[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'programs' | 'books'>('all');
  const [activeInvoice, setActiveInvoice] = useState<{
    type: 'PROGRAM' | 'BOOK';
    data: any;
  } | null>(null);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-primary">
        <Loader2 className="animate-spin text-primary" size={44} />
        <span className="font-extrabold text-lg text-slate-650 tracking-wide">Compiling Financial Ledger...</span>
      </div>
    );
  }

  // Calculate totals and statistics
  const totalProgramsCost = enrollments.reduce((sum, e) => sum + e.pricePaid, 0);
  const totalBooksCost = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalInvested = totalProgramsCost + totalBooksCost;

  // Unify and format transactions chronologically
  const allTransactions = [
    ...enrollments.map(e => ({
      id: e.id,
      type: 'PROGRAM' as const,
      title: `${e.program.title} Program`,
      date: new Date(e.createdAt),
      amount: e.pricePaid,
      status: e.status,
      badgeText: '1:1 Private Mentoring',
      invoiceData: e,
      original: e,
    })),
    ...orders.map(o => ({
      id: o.id,
      type: 'BOOK' as const,
      title: o.items?.map((it: any) => `${it.book?.title || 'Gigi Book'} (x${it.quantity})`).join(', ') || 'Gigi Book',
      date: new Date(o.createdAt),
      amount: o.totalAmount,
      status: o.paymentStatus === 'COMPLETED' ? 'PAID' : o.paymentStatus || 'PLACED',
      orderStatus: o.orderStatus,
      badgeText: 'Gigi Book Order',
      invoiceData: o,
      city: o.city,
      original: o,
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Filtered transactions based on active tab
  const filteredTransactions = allTransactions.filter(tx => {
    if (activeTab === 'programs') return tx.type === 'PROGRAM';
    if (activeTab === 'books') return tx.type === 'BOOK';
    return true;
  });

  return (
    <div className="space-y-6 w-full max-w-[1280px] mx-auto pb-8 font-sans px-4 sm:px-6">
      
      {/* Header Banner - hidden on print */}
      <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.015)] no-print">
        {/* Decorative fading grid mesh background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] opacity-50 pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-slate-200/20 to-slate-100/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-primary/20 rounded-full text-[10px] font-black text-primary shadow-3xs uppercase tracking-widest">
            <CreditCard size={11} /> Secure Transactions
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Payments & Invoices
          </h1>
          <p className="text-xs font-bold text-slate-500 max-w-xl leading-relaxed">
            Review detailed invoice summaries, track physical product delivery coordinates, and audit digital program enrollments.
          </p>
        </div>
      </div>

      {/* Financial Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 no-print">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between overflow-hidden relative group hover:border-slate-300 transition-all duration-300">
          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Total Invested</span>
            <h3 className="text-2xl font-black text-slate-900">₹{totalInvested.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-slate-500 font-bold">Across all services</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100 shadow-3xs shrink-0">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between overflow-hidden relative group hover:border-slate-300 transition-all duration-300">
          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Learning Programs</span>
            <h3 className="text-2xl font-black text-slate-900">{enrollments.length}</h3>
            <p className="text-[10px] text-slate-500 font-bold">Active enrollments</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-3xs shrink-0">
            <GraduationCap size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between overflow-hidden relative group hover:border-slate-300 transition-all duration-300">
          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Book Purchases</span>
            <h3 className="text-2xl font-black text-slate-900">{orders.length}</h3>
            <p className="text-[10px] text-slate-500 font-bold">Orders placed</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100 shadow-3xs shrink-0">
            <ShoppingBag size={20} />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column for Payments lists, Right for FAQs/Support info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start no-print">
        
        {/* LEFT COLUMN: Tab Switcher & Data Lists (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-100 no-print pb-1 gap-2">
            {[
              { id: 'all', label: 'All Transactions', count: allTransactions.length },
              { id: 'programs', label: 'Program Enrollments', count: enrollments.length },
              { id: 'books', label: 'Book Purchases', count: orders.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all relative ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {tab.label}
                  <span className={`px-1.5 py-0.25 text-[9px] rounded-full font-black ${
                    activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-650'
                  }`}>
                    {tab.count}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-350">
                  <FileText size={22} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">No transaction records found</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1 max-w-xs mx-auto">
                    There are no invoices matching the selected tab. Explore programs to get started!
                  </p>
                </div>
                <Link 
                  href="/#programs" 
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-full shadow-sm hover:scale-102 active:scale-98 transition-all"
                >
                  Browse Catalog <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
                >
                  {/* Left branding colored accent bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${
                    tx.type === 'PROGRAM' ? 'from-purple-500 to-indigo-600' : 'from-rose-500 to-pink-600'
                  }`} />
                  
                  <div className="flex items-start gap-4">
                    {/* Styled Icon */}
                    {tx.type === 'PROGRAM' ? (
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-650 flex items-center justify-center border border-purple-100/60 shadow-3xs shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <GraduationCap size={20} />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-650 flex items-center justify-center border border-rose-100/60 shadow-3xs shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <BookOpen size={20} />
                      </div>
                    )}
                    
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          tx.type === 'PROGRAM' 
                            ? 'bg-purple-50 border border-purple-100 text-purple-750' 
                            : 'bg-rose-50 border border-rose-100 text-rose-750'
                        }`}>
                          {tx.badgeText}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          <Calendar size={11} />
                          {tx.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        
                        {/* Role tag if program and child-linked */}
                        {tx.type === 'PROGRAM' && tx.original.user?.id && user?.id && tx.original.user.id !== user.id && (
                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                            tx.original.user?.role === 'TEEN' 
                              ? 'bg-purple-50 text-purple-650 border-purple-200/60' 
                              : 'bg-blue-50 text-blue-600 border-blue-200/60'
                          }`}>
                            By {tx.original.user?.role === 'TEEN' ? 'Daughter' : 'Parent'}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm md:text-base font-black text-slate-800 leading-snug group-hover:text-primary transition-colors">
                        {tx.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-slate-500 pt-0.5">
                        <span>ID: <span className="font-mono text-slate-700">{tx.id.slice(0, 8)}...</span></span>
                        {tx.type === 'BOOK' && tx.city && (
                          <span className="flex items-center gap-0.5">
                            <MapPin size={11} className="text-slate-450" /> City: <span className="text-slate-700">{tx.city}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col md:items-end justify-between items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className="text-lg md:text-xl font-black text-slate-900">₹{tx.amount.toLocaleString('en-IN')}</span>
                      <div className="flex items-center md:justify-end gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest">
                          {tx.type === 'BOOK' && tx.orderStatus ? tx.orderStatus : 'Successful'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setActiveInvoice({ type: tx.type, data: tx.original })}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 border border-slate-205 hover:border-slate-350 hover:bg-slate-50 text-slate-650 hover:text-slate-800 rounded-full text-[10px] font-extrabold shadow-3xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        <FileText size={11} /> Invoice
                      </button>
                      
                      {tx.type === 'PROGRAM' ? (
                        <Link 
                          href="/dashboard"
                          className="inline-flex items-center gap-0.5 text-primary hover:text-primary-dark font-extrabold text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-150 px-3.5 py-1.5 rounded-full shadow-3xs transition-all whitespace-nowrap group-hover:border-slate-300"
                        >
                          Workspace <ArrowRight className="group-hover:translate-x-0.5 transition-transform" size={11} />
                        </Link>
                      ) : (
                        <Link 
                          href={`/dashboard/orders/${tx.id}`}
                          className="inline-flex items-center gap-0.5 text-primary hover:text-primary-dark font-extrabold text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-150 px-3.5 py-1.5 rounded-full shadow-3xs transition-all whitespace-nowrap group-hover:border-slate-300"
                        >
                          Track <ArrowRight className="group-hover:translate-x-0.5 transition-transform" size={11} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Support, Security, FAQs (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Billing Support Card */}
          <div className="bg-gradient-to-br from-[#FFF8F8] to-[#FFFBFB] border border-rose-200/60 rounded-2xl p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-black text-rose-750 uppercase tracking-widest flex items-center gap-2">
              <MessageCircle size={16} className="text-rose-500 animate-pulse" />
              Billing Assistance
            </h4>
            <p className="text-xs font-bold text-slate-650 leading-relaxed">
              Have questions about your invoice, tax structure, or need corporate reimbursement details? Chat directly with our finance coordinator.
            </p>
            <button
              onClick={() => window.open('https://wa.me/919380724606?text=Hi,%20I%2520have%2520a%2520billing%2520inquiry%2520from%2520my%2520dashboard', '_blank')}
              className="w-full bg-[#25D366] hover:bg-[#20BA56] text-white font-extrabold py-2.5 px-4 rounded-full flex items-center justify-center gap-1.5 text-xs shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <MessageCircle size={14} className="fill-white" /> Chat on WhatsApp
            </button>
          </div>

          {/* Safety Verification Badge */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3.5">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="text-emerald-500 shrink-0" size={16} />
              Billing Security
            </h4>
            <p className="text-xs font-bold text-slate-600 leading-relaxed">
              Every checkout is processed securely using modern 256-bit encryption through Razorpay, India's leading payment infrastructure. 
            </p>
            <div className="border-t border-slate-100 pt-3.5 flex items-center gap-2.5 text-[9px] font-black text-slate-400">
              <span className="flex items-center gap-0.5">🔒 PCI-DSS Compliant</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">💳 UPI & Card Safe</span>
            </div>
          </div>

          {/* Billing FAQs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="text-primary shrink-0" size={16} />
              Billing FAQs
            </h4>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <h5 className="font-bold text-slate-800">How do I access sessions after enrolling?</h5>
                <p className="text-slate-550 font-medium leading-relaxed">
                  Log in with the registered phone number. Your dashboard immediately hosts live Google Meet links for active program cohorts.
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-slate-800">Can I request a payment refund?</h5>
                <p className="text-slate-550 font-medium leading-relaxed">
                  Refunds are subject to terms based on book shipping and program session completions. Reach out directly to support at WhatsApp or email.
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-slate-800">How do I get my Tax Invoice?</h5>
                <p className="text-slate-550 font-medium leading-relaxed">
                  Tax invoice structures are dynamically printed above. If you need a formal PDF for corporate reimbursement, chat with our coordinator on WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Download Modal */}
      <InvoiceModal 
        isOpen={activeInvoice !== null}
        onClose={() => setActiveInvoice(null)}
        type={activeInvoice?.type || 'PROGRAM'}
        data={activeInvoice?.data}
      />
    </div>
  );
}
