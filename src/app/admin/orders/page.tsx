'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { ShoppingBag, Search, Filter, Eye, Clock, CheckCircle, Truck, XCircle, Package, CreditCard, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatIndianDate, formatOrderId, getOrderCountry, getCurrencySymbol } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [isActiveFilter, setIsActiveFilter] = useState(true);
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);

  const filterContainerRef = useRef<HTMLDivElement>(null);
  const recordsPerPage = 15;
  const [stats, setStats] = useState({
    totalOrders: 0, totalRevenue: 0, onlineRevenue: 0, codRevenue: 0,
    onlineCount: 0, codCount: 0, placedCount: 0, processingCount: 0,
    onHoldCount: 0,
    shippedCount: 0, deliveredCount: 0, failedCount: 0, cancelledCount: 0
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Load initial filters and page from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSearchTerm = localStorage.getItem('orders_searchTerm') || '';
      const savedDateFrom = localStorage.getItem('orders_dateFrom') || '';
      const savedDateTo = localStorage.getItem('orders_dateTo') || '';
      const savedStatusFilter = localStorage.getItem('orders_statusFilter') || 'ALL';
      const savedPaymentMethodFilter = localStorage.getItem('orders_paymentMethodFilter') || 'ALL';
      const savedPaymentStatusFilter = localStorage.getItem('orders_paymentStatusFilter') || 'ALL';
      const savedIsActiveFilter = localStorage.getItem('orders_isActiveFilter') !== 'false';
      const savedCountryFilter = localStorage.getItem('orders_countryFilter') || 'ALL';
      const savedCurrentPage = localStorage.getItem('orders_currentPage')
        ? parseInt(localStorage.getItem('orders_currentPage')!, 10)
        : 1;

      setSearchTerm(savedSearchTerm);
      setDateFrom(savedDateFrom);
      setDateTo(savedDateTo);
      setStatusFilter(savedStatusFilter);
      setPaymentMethodFilter(savedPaymentMethodFilter);
      setPaymentStatusFilter(savedPaymentStatusFilter);
      setIsActiveFilter(savedIsActiveFilter);
      setCountryFilter(savedCountryFilter);
      setCurrentPage(savedCurrentPage);
      setIsInitialized(true);
    }
  }, []);

  // Save filters and page to localStorage when they change
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('orders_searchTerm', searchTerm);
    localStorage.setItem('orders_dateFrom', dateFrom);
    localStorage.setItem('orders_dateTo', dateTo);
    localStorage.setItem('orders_statusFilter', statusFilter);
    localStorage.setItem('orders_paymentMethodFilter', paymentMethodFilter);
    localStorage.setItem('orders_paymentStatusFilter', paymentStatusFilter);
    localStorage.setItem('orders_isActiveFilter', isActiveFilter.toString());
    localStorage.setItem('orders_countryFilter', countryFilter);
    localStorage.setItem('orders_currentPage', currentPage.toString());
  }, [isInitialized, searchTerm, dateFrom, dateTo, statusFilter, paymentMethodFilter, paymentStatusFilter, isActiveFilter, countryFilter, currentPage]);

  // Click outside to close filters
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [isInitialized, currentPage, searchTerm, dateFrom, dateTo, statusFilter, paymentMethodFilter, paymentStatusFilter, isActiveFilter, countryFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', recordsPerPage.toString());
      queryParams.append('isActive', isActiveFilter.toString());
      if (searchTerm) queryParams.append('search', searchTerm);
      if (dateFrom) queryParams.append('dateFrom', dateFrom);
      if (dateTo) queryParams.append('dateTo', dateTo);
      if (statusFilter !== 'ALL') queryParams.append('status', statusFilter);
      if (paymentMethodFilter !== 'ALL') queryParams.append('paymentMethod', paymentMethodFilter);
      if (paymentStatusFilter !== 'ALL') queryParams.append('paymentStatus', paymentStatusFilter);
      if (countryFilter !== 'ALL') queryParams.append('country', countryFilter);

      const response = await apiClient.get<any>(`/admin/orders?${queryParams.toString()}`);

      if (response && response.orders) {
        setOrders(response.orders);
      } else {
        setOrders([]);
      }

      if (response && response.stats) {
        setStats(response.stats);
      }

      if (response && response.pagination) {
        setTotalPages(response.pagination.pages);
        setTotalRecords(response.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED': return 'bg-blue-100 text-blue-600';
      case 'PROCESSING': return 'bg-amber-100 text-amber-600';
      case 'ON_HOLD': return 'bg-orange-100 text-orange-655 border border-orange-200/50';
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
      case 'ON_HOLD': return <AlertCircle size={14} />;
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
      case 'ON_HOLD': return 'On Hold';
      case 'SHIPPED': return 'Shipped';
      case 'DELIVERED': return 'Delivered';
      case 'CANCELLED': return 'Cancelled';
      case 'FAILED': return 'Failed';
      default: return status;
    }
  };



  const getPeriodLabel = () => {
    if (!dateFrom && !dateTo) return 'All time';

    const formatDate = (dateString: string) => {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
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
              onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
              className="text-sm font-medium border-none focus:ring-0 cursor-pointer outline-none px-2 py-1 bg-transparent"
            />
          </div>
          <div className="h-8 w-px bg-border"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase px-2">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
              className="text-sm font-medium border-none focus:ring-0 cursor-pointer outline-none px-2 py-1 bg-transparent"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); setCurrentPage(1); }}
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
              <span className="text-5xl font-black text-slate-900">{stats.totalOrders}</span>
              <span className="text-sm font-medium text-muted-foreground">
                {getPeriodLabel()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => { setPaymentMethodFilter(prev => prev === 'ONLINE' ? 'ALL' : 'ONLINE'); setCurrentPage(1); }}
              className={`text-left px-6 py-4 rounded-2xl border flex items-center gap-5 transition-all hover:scale-[1.02] active:scale-95 ${paymentMethodFilter === 'ONLINE'
                  ? 'bg-blue-100 border-blue-400 shadow-sm ring-1 ring-blue-400'
                  : 'bg-blue-50/50 border-blue-100 hover:border-blue-300'
                }`}
            >
              <div className="p-3 bg-blue-100/50 rounded-xl">
                <CreditCard className="text-blue-600" size={28} />
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Online Paid</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 leading-none">{stats.onlineCount}</span>
                  <span className="text-xs font-semibold text-slate-500">Orders</span>
                </div>
                <div className="text-sm font-bold text-blue-700 mt-0.5">
                  ₹{stats.onlineRevenue.toLocaleString('en-IN')}
                </div>
              </div>
            </button>
            <button
              onClick={() => { setPaymentMethodFilter(prev => prev === 'COD' ? 'ALL' : 'COD'); setCurrentPage(1); }}
              className={`text-left px-6 py-4 rounded-2xl border flex items-center gap-5 transition-all hover:scale-[1.02] active:scale-95 ${paymentMethodFilter === 'COD'
                  ? 'bg-amber-100 border-amber-400 shadow-sm ring-1 ring-amber-400'
                  : 'bg-amber-50/50 border-amber-100 hover:border-amber-300'
                }`}
            >
              <div className="p-3 bg-amber-100/50 rounded-xl">
                <Truck className="text-amber-600" size={28} />
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">COD Orders</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 leading-none">{stats.codCount}</span>
                  <span className="text-xs font-semibold text-slate-500">Orders</span>
                </div>
                <div className="text-sm font-bold text-amber-700 mt-0.5">
                  ₹{stats.codRevenue.toLocaleString('en-IN')}
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 pt-6 border-t border-slate-100">
          <button
            onClick={() => { setStatusFilter(prev => prev === 'PLACED' ? 'ALL' : 'PLACED'); setCurrentPage(1); }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${statusFilter === 'PLACED'
                ? 'bg-slate-200 border-slate-400 shadow-sm ring-1 ring-slate-400'
                : 'bg-slate-50 border-slate-100 hover:border-slate-300'
              }`}
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Order Placed</span>
            <span className="text-2xl font-bold text-slate-700">{stats.placedCount}</span>
          </button>
          <button
            onClick={() => { setStatusFilter(prev => prev === 'PROCESSING' ? 'ALL' : 'PROCESSING'); setCurrentPage(1); }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${statusFilter === 'PROCESSING'
                ? 'bg-amber-100 border-amber-400 shadow-sm ring-1 ring-amber-400'
                : 'bg-amber-50/30 border-amber-100 hover:border-amber-300'
              }`}
          >
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Processing</span>
            <span className="text-2xl font-bold text-amber-700">{stats.processingCount}</span>
          </button>
          <button
            onClick={() => { setStatusFilter(prev => prev === 'ON_HOLD' ? 'ALL' : 'ON_HOLD'); setCurrentPage(1); }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${statusFilter === 'ON_HOLD'
                ? 'bg-orange-100 border-orange-400 shadow-sm ring-1 ring-orange-400'
                : 'bg-orange-50/30 border-orange-100 hover:border-orange-300'
              }`}
          >
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">On Hold</span>
            <span className="text-2xl font-bold text-orange-700">{stats.onHoldCount}</span>
          </button>
          <button
            onClick={() => { setStatusFilter(prev => prev === 'SHIPPED' ? 'ALL' : 'SHIPPED'); setCurrentPage(1); }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${statusFilter === 'SHIPPED'
                ? 'bg-indigo-100 border-indigo-400 shadow-sm ring-1 ring-indigo-400'
                : 'bg-indigo-50/30 border-indigo-100 hover:border-indigo-300'
              }`}
          >
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Shipped</span>
            <span className="text-2xl font-bold text-indigo-700">{stats.shippedCount}</span>
          </button>
          <button
            onClick={() => { setStatusFilter(prev => prev === 'DELIVERED' ? 'ALL' : 'DELIVERED'); setCurrentPage(1); }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${statusFilter === 'DELIVERED'
                ? 'bg-green-100 border-green-400 shadow-sm ring-1 ring-green-400'
                : 'bg-green-50/30 border-green-100 hover:border-green-300'
              }`}
          >
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Delivered</span>
            <span className="text-2xl font-bold text-green-700">{stats.deliveredCount}</span>
          </button>
          <button
            onClick={() => { setStatusFilter(prev => prev === 'FAILED' ? 'ALL' : 'FAILED'); setCurrentPage(1); }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${statusFilter === 'FAILED'
                ? 'bg-red-100 border-red-400 shadow-sm ring-1 ring-red-400'
                : 'bg-red-50/30 border-red-100 hover:border-red-300'
              }`}
          >
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Failed</span>
            <span className="text-2xl font-bold text-red-700">{stats.failedCount}</span>
          </button>
          <button
            onClick={() => { setStatusFilter(prev => prev === 'CANCELLED' ? 'ALL' : 'CANCELLED'); setCurrentPage(1); }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${statusFilter === 'CANCELLED'
                ? 'bg-rose-100 border-rose-400 shadow-sm ring-1 ring-rose-400'
                : 'bg-rose-50/30 border-rose-100 hover:border-rose-300'
              }`}
          >
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Cancelled</span>
            <span className="text-2xl font-bold text-rose-700">{stats.cancelledCount}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search by Order ID, Name, Email or Phone..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="relative" ref={filterContainerRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-colors font-bold text-sm ${showFilters ? 'bg-primary text-white border-primary' : 'border-border bg-white hover:bg-slate-50'}`}
            >
              <Filter size={18} />
              Filter
            </button>

            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-border shadow-xl z-10 p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm">Filter Orders</h3>
                  <button
                    onClick={() => { setStatusFilter('ALL'); setPaymentMethodFilter('ALL'); setPaymentStatusFilter('ALL'); setIsActiveFilter(true); setCountryFilter('ALL'); setCurrentPage(1); }}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Country</label>
                  <select
                    value={countryFilter}
                    onChange={(e) => { setCountryFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary bg-white"
                  >
                    <option value="ALL">All Countries</option>
                    <option value="IN">India (IND)</option>
                    <option value="US">United States (US)</option>
                    <option value="UK">United Kingdom (UK)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Order Visibility</label>
                  <select
                    value={isActiveFilter ? 'ACTIVE' : 'INACTIVE'}
                    onChange={(e) => { setIsActiveFilter(e.target.value === 'ACTIVE'); setCurrentPage(1); }}
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary bg-white"
                  >
                    <option value="ACTIVE">Active Orders</option>
                    <option value="INACTIVE">Inactive Orders</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Order Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary bg-white"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PLACED">Placed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Payment Method</label>
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => { setPaymentMethodFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary bg-white"
                  >
                    <option value="ALL">All Methods</option>
                    <option value="ONLINE">Online</option>
                    <option value="COD">Cash on Delivery</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Payment Status</label>
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => { setPaymentStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary bg-white"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>
            )}
          </div>
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
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-sm text-foreground">{formatOrderId(order.id)}</div>
                        {order.isActive === false && (
                          <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">{order.items?.length || 0} Item(s)</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-sm text-foreground">{order.guestName || order.user?.username || 'Guest'}</div>
                      <div className="text-xs text-muted-foreground">{order.guestEmail || 'No Email'}</div>
                      <div className="text-xs text-muted-foreground">{order.guestPhone || order.user?.phone || 'No Phone'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-sm text-foreground">{getCurrencySymbol(getOrderCountry(order))}{order.totalAmount}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold">{order.paymentMethod}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${order.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
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

        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
            <span className="text-sm text-muted-foreground font-medium">
              Showing <span className="font-bold text-foreground">{(currentPage - 1) * recordsPerPage + 1}</span> to <span className="font-bold text-foreground">{Math.min(currentPage * recordsPerPage, totalRecords)}</span> of <span className="font-bold text-foreground">{totalRecords}</span> orders
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 border border-border rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-1 hidden sm:flex">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(currentPage - p) <= 1)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-slate-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-xl text-sm font-bold flex items-center justify-center transition-colors ${currentPage === p ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-4 py-2 border border-border rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
