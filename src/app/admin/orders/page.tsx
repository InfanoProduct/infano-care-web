'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { ShoppingBag, Search, Filter, Eye, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLACED': return <Clock size={14} />;
      case 'PROCESSING': return <Clock size={14} />;
      case 'SHIPPED': return <Truck size={14} />;
      case 'DELIVERED': return <CheckCircle size={14} />;
      case 'CANCELLED': return <XCircle size={14} />;
      default: return null;
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.guestName || order.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.guestEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                      <div className="font-bold text-sm text-foreground">#{order.id.slice(0, 8)}</div>
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
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        {order.orderStatus}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
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
