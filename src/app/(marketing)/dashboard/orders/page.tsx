'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingBag, Calendar, Loader2, ArrowRight, 
  FileText, MapPin, Package, CheckCircle2, GraduationCap, BookOpen
} from 'lucide-react';
import { ShopService } from '@/services/shop.service';
import { ProgramsService } from '@/services/programs.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { InvoiceModal } from '@/components/common/InvoiceModal';

export default function CustomerOrdersOverview() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'programs' | 'books'>('all');
  const [activeInvoice, setActiveInvoice] = useState<{
    type: 'PROGRAM' | 'BOOK';
    data: any;
  } | null>(null);

  const loadOrdersData = useCallback(async () => {
    try {
      setLoading(true);
      const [enrollRes, ordersRes] = await Promise.all([
        ProgramsService.getUserEnrollments().catch(() => ({ success: true, data: [] })),
        ShopService.getUserOrders().catch(() => [])
      ]);
      setEnrollments(enrollRes.data || []);
      setOrders(ordersRes || []);
    } catch (err) {
      console.error('Failed to load orders data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrdersData();
  }, [loadOrdersData]);

  // Helper to detect program-like items vs book items
  const isProgramItem = (it: any) => {
    const book = it.book || {};
    const bookId = (it.bookId || '').toLowerCase();
    const bookTitle = (book.title || it.bookTitle || '').toLowerCase();
    
    // Check if it's a program by fields
    if ((book as any).curriculum?.length || book.classRange || book.duration) return true;
    
    // Check by title or id
    if (bookId.includes('program') || bookId.includes('private') || bookId.includes('group') || bookId.includes('cohort')) return true;
    if (bookTitle.includes('program') || bookTitle.includes('mentoring') || bookTitle.includes('cohort')) return true;
    
    return false;
  };

  const productOrders = orders.filter((o: any) => (o.items || []).some((it: any) => !isProgramItem(it)));

  // Combine and sort program enrollments and book orders chronologically
  const allTransactions = [
    ...enrollments.map(e => ({
      id: e.id,
      type: 'PROGRAM' as const,
      title: `${e.program?.title || 'Mentoring'} Program`,
      date: new Date(e.createdAt),
      amount: e.pricePaid,
      status: e.status,
      badgeText: '1:1 Private Mentoring',
      invoiceData: e,
      original: e,
    })),
    ...productOrders.map(o => ({
      id: o.id,
      type: 'BOOK' as const,
      title: o.items?.map((it: any) => `${it.book?.title || 'Gigi Book'} (x${it.quantity})`).join(', ') || 'Gigi Book',
      date: new Date(o.createdAt),
      amount: o.totalAmount,
      status: o.paymentStatus === 'COMPLETED' ? 'PAID' : o.paymentStatus || 'PLACED',
      orderStatus: o.orderStatus,
      badgeText: 'Book Purchase',
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-primary">
        <Loader2 className="animate-spin text-primary" size={44} />
        <span className="font-extrabold text-lg text-slate-650 tracking-wide">Loading Orders...</span>
      </div>
    );
  }

  // Calculate order stats
  const totalOrders = enrollments.length + productOrders.length;
  const totalPrograms = enrollments.length;
  const totalBooks = productOrders.length;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-8 font-sans px-4 sm:px-6">
      <div className="no-print space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        {/* Decorative fading grid mesh background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-size-[2.5rem_2.5rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] opacity-50 pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-linear-to-br from-slate-200/20 to-slate-100/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-primary/20 rounded-full text-[10px] font-black text-primary shadow-3xs uppercase tracking-widest">
            <Package size={11} /> Orders & Enrollments
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-xs font-bold text-slate-500 max-w-xl leading-relaxed">
            Track your physical product orders, review mentoring program enrollments, and download invoice details.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between overflow-hidden relative group hover:border-slate-300 transition-all duration-300">
          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-sans">Total Orders</span>
            <h3 className="text-2xl font-black text-slate-900">{totalOrders}</h3>
            <p className="text-[10px] text-slate-500 font-bold">Placed successfully</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-650 rounded-2xl flex items-center justify-center border border-purple-100 shadow-3xs shrink-0">
            <ShoppingBag size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between overflow-hidden relative group hover:border-slate-300 transition-all duration-300">
          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-sans">Program Enrollments</span>
            <h3 className="text-2xl font-black text-slate-900">{totalPrograms}</h3>
            <p className="text-[10px] text-slate-500 font-bold">Active mentoring cohorts</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-3xs shrink-0">
            <GraduationCap size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between overflow-hidden relative group hover:border-slate-300 transition-all duration-300">
          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-sans">Book Purchases</span>
            <h3 className="text-2xl font-black text-slate-900">{totalBooks}</h3>
            <p className="text-[10px] text-slate-500 font-bold">Book orders placed</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100 shadow-3xs shrink-0">
            <BookOpen size={20} />
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-100 pb-1 gap-2">
        {[
          { id: 'all', label: 'All Orders', count: allTransactions.length },
          { id: 'programs', label: 'Programs', count: enrollments.length },
          { id: 'books', label: 'Books', count: productOrders.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all relative ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-550 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              <span className={`px-1.5 py-px text-[9px] rounded-full font-black ${
                activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-650'
              }`}>
                {tab.count}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-350">
              <ShoppingBag size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm">No Orders Found</h4>
              <p className="text-xs text-slate-500 font-semibold mt-1 max-w-xs mx-auto">
                {activeTab === 'all' && "You haven't ordered any books or enrolled in mentoring programs yet."}
                {activeTab === 'programs' && "You are not enrolled in any mentoring programs yet."}
                {activeTab === 'books' && "You haven't purchased any books or guides yet."}
              </p>
            </div>
            {activeTab !== 'programs' && (
              <Link 
                href="/gigi-the-awkward-age-book" 
                className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-full shadow-sm hover:scale-102 active:scale-98 transition-all"
              >
                View Book Details <ArrowRight size={13} />
              </Link>
            )}
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div 
              key={tx.id}
              className="group bg-white border border-slate-205 rounded-2xl p-5.5 shadow-2xs hover:shadow-sm hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
            >
              {/* Left branding colored accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b ${
                tx.type === 'PROGRAM' ? 'from-purple-500 to-indigo-600' : 'from-rose-500 to-pink-600'
              }`} />
              
              <div className="flex gap-4.5 items-start flex-1 min-w-0 z-10">
                {/* Image or Icon */}
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-200/80 shadow-3xs group-hover:scale-102 transition-transform duration-300 flex items-center justify-center">
                  {tx.type === 'PROGRAM' ? (
                    tx.original.program?.thumbnailUrl ? (
                      <img 
                        src={tx.original.program.thumbnailUrl} 
                        alt={tx.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-purple-650 bg-purple-50">
                        <GraduationCap size={24} />
                      </div>
                    )
                  ) : (
                    tx.original.items?.filter((it: any) => !isProgramItem(it))[0]?.book?.imageUrl ? (
                      <img 
                        src={tx.original.items?.filter((it: any) => !isProgramItem(it))[0]?.book?.imageUrl} 
                        alt={tx.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-rose-650 bg-rose-50">
                        <BookOpen size={24} />
                      </div>
                    )
                  )}
                </div>
                
                {/* Transaction Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      tx.type === 'PROGRAM' 
                        ? 'bg-purple-50 border border-purple-100 text-purple-755' 
                        : 'bg-rose-50 border border-rose-100 text-rose-755'
                    }`}>
                      {tx.badgeText}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <Calendar size={11} />
                      {tx.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {tx.type === 'BOOK' && tx.city && (
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <MapPin size={11} className="text-slate-450" />
                        {tx.city}
                      </span>
                    )}
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
                  
                  <h4 className="text-base font-black text-slate-900 leading-snug group-hover:text-primary transition-colors truncate">
                    {tx.title}
                  </h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-slate-450 pt-0.5">
                    <span>ID: <span className="font-mono text-slate-700">{tx.id.slice(0, 8)}...</span></span>
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex flex-row md:flex-col md:items-end justify-between items-center gap-3.5 shrink-0 pt-3.5 md:pt-0 border-t md:border-t-0 border-slate-100 z-10 w-full md:w-auto">
                <div className="text-left md:text-right">
                  <span className="text-lg md:text-xl font-black text-slate-900">₹{tx.amount.toLocaleString('en-IN')}</span>
                  <div className="flex items-center md:justify-end gap-1.5 mt-1">
                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                      tx.type === 'PROGRAM'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                        : tx.status === 'PAID' || tx.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                        : tx.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                        : 'bg-rose-50 text-rose-700 border-rose-200/60'
                    }`}>
                      {tx.type === 'PROGRAM' ? 'PAID' : (tx.status === 'COMPLETED' ? 'PAID' : tx.status)}
                    </span>
                    {tx.type === 'BOOK' && tx.orderStatus && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {tx.orderStatus}
                      </span>
                    )}
                    {tx.type === 'PROGRAM' && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-purple-50 border border-purple-200 text-purple-650 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {tx.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveInvoice({ type: tx.type, data: tx.original })}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 border border-slate-205 hover:border-slate-350 hover:bg-slate-50 text-slate-655 hover:text-slate-800 rounded-full text-[10px] font-extrabold shadow-3xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    <FileText size={11} /> Invoice
                  </button>

                  <Link 
                    href={`/dashboard/orders/${tx.id}`}
                    className="inline-flex items-center gap-0.5 text-primary hover:text-primary-dark font-extrabold text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-150 px-4 py-2 rounded-full shadow-3xs transition-all whitespace-nowrap group-hover:border-slate-350 group"
                  >
                    View Details <ArrowRight className="group-hover:translate-x-0.5 transition-transform" size={11} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
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
