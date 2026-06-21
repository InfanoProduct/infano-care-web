'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingBag, Calendar, Loader2, ShieldCheck, ArrowRight, MessageCircle, 
  DollarSign, FileText, MapPin, Package
} from 'lucide-react';
import { ShopService } from '@/services/shop.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function CustomerOrdersOverview() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrdersData = useCallback(async () => {
    try {
      setLoading(true);
      const ordersRes = await ShopService.getUserOrders().catch(() => []);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-primary">
        <Loader2 className="animate-spin text-primary" size={44} />
        <span className="font-extrabold text-lg text-slate-600 tracking-wide">Loading Orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-[1280px] mx-auto pb-8 font-sans">
      
      {/* Header Banner */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-sm">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-primary/20 rounded-md text-[10px] font-bold text-primary shadow-sm">
            <Package size={11} /> Physical Deliveries
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            My Orders
          </h1>
          <p className="text-xs font-semibold text-slate-500 max-w-lg leading-relaxed">
            Track your physical product orders, review invoices, and check delivery status.
          </p>
        </div>
      </div>

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
              {/* Top Order Row - Simplified */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex gap-4 items-center">
                  {/* Product Image */}
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    {order.items?.filter((it: any) => !isProgramItem(it))[0]?.book?.imageUrl ? (
                      <img 
                        src={order.items?.filter((it: any) => !isProgramItem(it))[0]?.book?.imageUrl} 
                        alt="Product Cover" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Package size={24} />
                      </div>
                    )}
                  </div>
                  
                  {/* Basic Order Info */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-bold bg-slate-100 text-slate-655 px-2 py-0.5 rounded-md border border-slate-200/60">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {order.items?.filter((it: any) => !isProgramItem(it)).map((it: any) => {
                        const book = it.book || {};
                        const title = book.title || it.bookTitle || it.name || 'Book Order';
                        return `${title} (x${it.quantity})`;
                      }).join(', ') || 'Book Order'}
                    </h4>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-lg font-bold text-slate-850">₹{order.totalAmount.toLocaleString()}</span>
                  <div className="flex items-center sm:justify-end gap-2 mt-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      order.paymentStatus === 'COMPLETED' 
                        ? 'bg-emerald-50 text-emerald-650' 
                        : order.paymentStatus === 'PENDING'
                        ? 'bg-amber-50 text-amber-650'
                        : 'bg-rose-50 text-rose-650'
                    }`}>
                      {order.paymentStatus}
                    </span>
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Row */}
              <div className="pt-4 flex items-center justify-end">
                <Link 
                  href={`/dashboard/orders/${order.id}`}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg font-bold text-[11px] group transition-all"
                >
                  View Details <ArrowRight className="group-hover:translate-x-0.5 transition-transform" size={12} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
