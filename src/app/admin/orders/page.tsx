'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { ShoppingBag, Search, Filter, Eye, Clock, CheckCircle, Truck, XCircle, Package, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { formatIndianDate, formatOrderId } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>('/admin/orders');
      setOrders(response.orders);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED': return 'bg-blue-100 text-blue-600';
      case 'PROCESSING': return 'bg-amber-100 text-amber-600';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-600';
      case 'DELIVERED': return 'bg-green-100 text-green-600';
      case 'CANCELLED': return 'bg-rose-100 text-rose-600';
      case 'FAILED': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLACED': return <Clock size={14} />;
      case 'PROCESSING': return <Package size={14} />;
      case 'SHIPPED': return <Truck size={14} />;
      case 'DELIVERED': return <CheckCircle size={14} />;
      case 'CANCELLED': return <XCircle size={14} />;
      case 'FAILED': return <XCircle size={14} />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PLACED': return 'Order Placed';
      case 'PROCESSING': return 'Processing';
      case 'SHIPPED': return 'Shipped';
      case 'DELIVERED': return 'Delivered';
      case 'CANCELLED': return 'Cancelled';
      case 'FAILED': return 'Failed';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.guestName || order.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.guestEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInsightOrders = orders.filter(o => {
    if (!dateFrom && !dateTo) return true;
    const orderDate = new Date(o.createdAt);
    if (dateFrom && new Date(dateFrom) > orderDate) return false;
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (toDate < orderDate) return false;
    }
    return true;
  });

  const onlineOrders = filteredInsightOrders.filter(o => o.paymentMethod === 'ONLINE' && !!o.razorpayPaymentId);
  const codOrders = filteredInsightOrders.filter(o => o.paymentMethod === 'COD');
  
  const placedOrders = filteredInsightOrders.filter(o => 
    o.orderStatus === 'PLACED' && !(o.paymentMethod === 'ONLINE' && !o.razorpayPaymentId)
  ).length;
  const processingOrders = filteredInsightOrders.filter(o => o.orderStatus === 'PROCESSING').length;
  const shippedOrders = filteredInsightOrders.filter(o => o.orderStatus === 'SHIPPED').length;
  const deliveredOrders = filteredInsightOrders.filter(o => o.orderStatus === 'DELIVERED').length;
  const failedOrdersCount = filteredInsightOrders.filter(o => (o.paymentMethod === 'ONLINE' && !o.razorpayPaymentId && o.orderStatus !== 'CANCELLED') || o.orderStatus === 'FAILED').length;
  const cancelledOrders = filteredInsightOrders.filter(o => o.orderStatus === 'CANCELLED').length;

  const calculateTotal = (orderList: any[]) => orderList.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const getPeriodLabel = () => {
    if (!dateFrom && !dateTo) return 'All time';
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (dateFrom && dateTo) return `${formatDate(dateFrom)} - ${formatDate(dateTo)}`;
    if (dateFrom) return `From ${formatDate(dateFrom)}`;
    if (dateTo) return `Up to ${formatDate(dateTo)}`;
    return 'All time';
  };

  return (
    <div className="space-y-10">
      <div className="admin-header flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <ShoppingBag className="text-primary" size={36} />
            Book Orders
          </h1>
          <p className="text-muted-foreground font-medium mt-2">Manage customer orders and shipping status.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-border shadow-sm w-fit">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase px-2">From</span>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-sm font-medium border-none focus:ring-0 cursor-pointer outline-none px-2 py-1 bg-transparent"
            />
          </div>
          <div className="h-8 w-px bg-border"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase px-2">To</span>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-sm font-medium border-none focus:ring-0 cursor-pointer outline-none px-2 py-1 bg-transparent"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button 
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors ml-1"
              title="Clear Filter"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-1">
              <ShoppingBag size={16} className="text-primary" /> Total Orders
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black text-slate-900">{filteredInsightOrders.length}</span>
              <span className="text-sm font-medium text-muted-foreground">
                {getPeriodLabel()}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-blue-50/50 px-6 py-4 rounded-2xl border border-blue-100 flex items-center gap-5">
              <div className="p-3 bg-blue-100/50 rounded-xl">
                <CreditCard className="text-blue-600" size={28} />
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Online Paid</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 leading-none">{onlineOrders.length}</span>
                  <span className="text-xs font-semibold text-slate-500">Orders</span>
                </div>
                <div className="text-sm font-bold text-blue-700 mt-0.5">
                  ₹{calculateTotal(onlineOrders).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            <div className="bg-amber-50/50 px-6 py-4 rounded-2xl border border-amber-100 flex items-center gap-5">
              <div className="p-3 bg-amber-100/50 rounded-xl">
                <Truck className="text-amber-600" size={28} />
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">COD Orders</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 leading-none">{codOrders.length}</span>
                  <span className="text-xs font-semibold text-slate-500">Orders</span>
                </div>
                <div className="text-sm font-bold text-amber-700 mt-0.5">
                  ₹{calculateTotal(codOrders).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-1 hover:border-slate-300 transition-colors">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Order Placed</span>
            <span className="text-2xl font-bold text-slate-700">{placedOrders}</span>
          </div>
          <div className="bg-amber-50/30 rounded-2xl p-4 border border-amber-100 flex flex-col gap-1 hover:border-amber-300 transition-colors">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Processing</span>
            <span className="text-2xl font-bold text-amber-700">{processingOrders}</span>
          </div>
          <div className="bg-indigo-50/30 rounded-2xl p-4 border border-indigo-100 flex flex-col gap-1 hover:border-indigo-300 transition-colors">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Shipped</span>
            <span className="text-2xl font-bold text-indigo-700">{shippedOrders}</span>
          </div>
          <div className="bg-green-50/30 rounded-2xl p-4 border border-green-100 flex flex-col gap-1 hover:border-green-300 transition-colors">
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Delivered</span>
            <span className="text-2xl font-bold text-green-700">{deliveredOrders}</span>
          </div>
          <div className="bg-red-50/30 rounded-2xl p-4 border border-red-100 flex flex-col gap-1 hover:border-red-300 transition-colors">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Failed</span>
            <span className="text-2xl font-bold text-red-700">{failedOrdersCount}</span>
          </div>
          <div className="bg-rose-50/30 rounded-2xl p-4 border border-rose-100 flex flex-col gap-1 hover:border-rose-300 transition-colors">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Cancelled</span>
            <span className="text-2xl font-bold text-rose-700">{cancelledOrders}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID, Name or Email..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-white hover:bg-slate-50 transition-colors font-bold text-sm">
            <Filter size={18} />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-[13px] font-bold uppercase tracking-wider text-muted-foreground bg-slate-50/30">
                <th className="px-6 py-5">Order Info</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Payment</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-sm text-foreground">{formatOrderId(order.id)}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">{order.items.length} Item(s)</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-sm text-foreground">{order.guestName || order.user?.username || 'Guest'}</div>
                      <div className="text-xs text-muted-foreground">{order.guestEmail || 'No Email'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-sm text-foreground">₹{order.totalAmount}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold">{order.paymentMethod}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                          order.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {(() => {
                        const displayStatus = (order.paymentMethod === 'ONLINE' && !order.razorpayPaymentId && order.orderStatus !== 'CANCELLED') ? 'FAILED' : order.orderStatus;
                        return (
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${getStatusColor(displayStatus)} uppercase tracking-wider`}>
                            {getStatusIcon(displayStatus)}
                            {getStatusLabel(displayStatus)}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground font-medium">
                      {formatIndianDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-all inline-flex"
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-muted-foreground">
                    No orders found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
