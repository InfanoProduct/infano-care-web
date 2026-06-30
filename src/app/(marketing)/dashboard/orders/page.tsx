'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingBag, Calendar, Loader2, ShieldCheck, ArrowRight, MessageCircle, 
  DollarSign, FileText, MapPin, Package, Truck, CheckCircle2
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
        <span className="font-extrabold text-lg text-slate-655 tracking-wide">Loading Orders...</span>
      </div>
    );
  }

  // Calculate order stats
  const totalOrders = productOrders.length;
  const inTransit = productOrders.filter(o => ['PROCESSING', 'SHIPPED'].includes((o.orderStatus || '').toUpperCase())).length;
  const delivered = productOrders.filter(o => (o.orderStatus || '').toUpperCase() === 'DELIVERED').length;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-8 font-sans px-4 sm:px-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        {/* Decorative fading grid mesh background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-size-[2.5rem_2.5rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] opacity-50 pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-linear-to-br from-slate-200/20 to-slate-100/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-primary/20 rounded-full text-[10px] font-black text-primary shadow-3xs uppercase tracking-widest">
            <Package size={11} /> Physical Deliveries
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-xs font-bold text-slate-500 max-w-xl leading-relaxed">
            Track your physical product orders, review invoices, and check delivery status.
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
            <span className="text-[10px] font-black text-slate-455 uppercase tracking-widest block font-sans">In Transit</span>
            <h3 className="text-2xl font-black text-slate-900">{inTransit}</h3>
            <p className="text-[10px] text-slate-500 font-bold">Packing & Shipping</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100 shadow-3xs shrink-0">
            <Truck size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between overflow-hidden relative group hover:border-slate-300 transition-all duration-300">
          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-sans">Delivered</span>
            <h3 className="text-2xl font-black text-slate-900">{delivered}</h3>
            <p className="text-[10px] text-slate-500 font-bold">Completed handovers</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-3xs shrink-0">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {productOrders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-350">
              <ShoppingBag size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm">No Product Orders Found</h4>
              <p className="text-xs text-slate-500 font-semibold mt-1 max-w-xs mx-auto">
                You haven't ordered any books or products yet. Check out the Gigi Survival Guide!
              </p>
            </div>
            <Link 
              href="/gigi-the-awkward-age-book" 
              className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-slate-900 hover:bg-slate-805 text-white font-extrabold text-xs rounded-full shadow-sm hover:scale-102 active:scale-98 transition-all"
            >
              View Book Details <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          productOrders.map((order) => (
            <div 
              key={order.id}
              className="group bg-white border border-slate-205 rounded-2xl p-5.5 shadow-2xs hover:shadow-sm hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
            >
              {/* Decorative watermark icon */}
              <div className="absolute -right-3 -bottom-3 text-slate-400/5 pointer-events-none transform rotate-12 scale-150 group-hover:scale-155 group-hover:rotate-6 transition-all duration-500">
                <ShoppingBag size={80} />
              </div>
              
              <div className="flex gap-4.5 items-start flex-1 min-w-0 z-10">
                {/* Product Image */}
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-200/80 shadow-3xs group-hover:scale-102 transition-transform duration-300">
                  {order.items?.filter((it: any) => !isProgramItem(it))[0]?.book?.imageUrl ? (
                    <img 
                      src={order.items?.filter((it: any) => !isProgramItem(it))[0]?.book?.imageUrl} 
                      alt="Product Cover" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                      <Package size={22} />
                    </div>
                  )}
                </div>
                
                {/* Order Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-slate-100 border border-slate-250 text-slate-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {order.city && (
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <MapPin size={11} className="text-slate-450" />
                        {order.city}
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-base font-black text-slate-900 leading-snug group-hover:text-primary transition-colors truncate">
                    {order.items?.filter((it: any) => !isProgramItem(it)).map((it: any) => {
                      const book = it.book || {};
                      const title = book.title || it.bookTitle || it.name || 'Book Order';
                      return `${title} (x${it.quantity})`;
                    }).join(', ') || 'Book Order'}
                  </h4>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex flex-row md:flex-col md:items-end justify-between items-center gap-3.5 shrink-0 pt-3.5 md:pt-0 border-t md:border-t-0 border-slate-100 z-10">
                <div className="text-left md:text-right">
                  <span className="text-lg md:text-xl font-black text-slate-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  <div className="flex items-center md:justify-end gap-1.5 mt-1">
                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                      order.paymentStatus === 'COMPLETED' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                        : order.paymentStatus === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                        : 'bg-rose-50 text-rose-700 border-rose-200/60'
                    }`}>
                      {order.paymentStatus === 'COMPLETED' ? 'PAID' : order.paymentStatus}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <Link 
                  href={`/dashboard/orders/${order.id}`}
                  className="inline-flex items-center gap-0.5 text-primary hover:text-primary-dark font-extrabold text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-150 px-4 py-2 rounded-full shadow-3xs transition-all whitespace-nowrap group-hover:border-slate-350 group"
                >
                  Track Order <ArrowRight className="group-hover:translate-x-0.5 transition-transform" size={11} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
