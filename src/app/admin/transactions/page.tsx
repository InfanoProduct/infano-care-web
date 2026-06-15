'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { CreditCard, Search, Filter, Eye, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Filtering
  const [activeTab, setActiveTab] = useState<'ALL' | 'CAPTURED' | 'FAILED' | 'AUTHORIZED'>('ALL');
  
  // Date range
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [fromDate, toDate]); // Removed currentPage from dependency

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setCurrentPage(1); // Reset to page 1 on new fetch
      
      const queryParams = new URLSearchParams();
      
      if (fromDate) {
        queryParams.append('from', (new Date(fromDate).getTime() / 1000).toString());
      }
      if (toDate) {
        const toTime = new Date(toDate).getTime() / 1000 + 86400;
        queryParams.append('to', toTime.toString());
      }

      const response = await apiClient.get<any>(`/shop/admin/transactions?${queryParams}`);
      if (response && response.items) {
        setTransactions(response.items);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to fetch transactions', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'captured': return 'bg-green-100 text-green-700 border border-green-200';
      case 'failed': return 'bg-rose-100 text-rose-700 border border-rose-200';
      case 'authorized': return 'bg-blue-100 text-blue-700 border border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'captured': return <CheckCircle size={14} className="mr-1.5" />;
      case 'failed': return <XCircle size={14} className="mr-1.5" />;
      case 'authorized': return <Clock size={14} className="mr-1.5" />;
      default: return <Clock size={14} className="mr-1.5" />;
    }
  };

  // Client-side filtering for Tabs and Search
  const filteredTransactions = transactions.filter(txn => {
    if (activeTab !== 'ALL' && txn.status !== activeTab.toLowerCase()) return false;
    if (searchInput) {
      const search = searchInput.toLowerCase();
      return (
        txn.id.toLowerCase().includes(search) || 
        (txn.order_id && txn.order_id.toLowerCase().includes(search)) ||
        (txn.email && txn.email.toLowerCase().includes(search)) ||
        (txn.contact && txn.contact.includes(search))
      );
    }
    return true;
  });

  // Client-side pagination
  const totalFiltered = filteredTransactions.length;
  const totalPages = Math.ceil(totalFiltered / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Transactions</h1>
        <button 
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all font-bold text-sm shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Sync
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <CreditCard size={18} />
            <span className="font-bold text-sm">Total Transactions</span>
          </div>
          <span className="text-3xl font-black text-slate-900">{filteredTransactions.length}</span>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-emerald-600 mb-4">
            <CheckCircle size={18} />
            <span className="font-bold text-sm">Successful (Captured)</span>
          </div>
          <span className="text-3xl font-black text-emerald-600">
            {filteredTransactions.filter(t => t.status === 'captured').length}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-rose-600 mb-4">
            <XCircle size={18} />
            <span className="font-bold text-sm">Failed Payments</span>
          </div>
          <span className="text-3xl font-black text-rose-600">
            {filteredTransactions.filter(t => t.status === 'failed').length}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-blue-600 mb-4">
            <CreditCard size={18} />
            <span className="font-bold text-sm">Captured Volume</span>
          </div>
          <span className="text-3xl font-black text-blue-600">
            ₹{(filteredTransactions.filter(t => t.status === 'captured').reduce((acc, t) => acc + t.amount, 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar & Filters */}
        <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center bg-slate-50/50">
          
          {/* Tabs */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl shadow-inner border border-slate-200/60 overflow-x-auto w-full xl:w-auto">
            {['ALL', 'CAPTURED', 'AUTHORIZED', 'FAILED'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab as any); setCurrentPage(1); }}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            {/* Date Filters */}
            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1.5 px-3 w-full sm:w-auto shadow-sm">
              <CalendarIcon size={16} className="text-slate-400" />
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                className="text-sm font-medium outline-none bg-transparent text-slate-700 cursor-pointer"
              />
              <span className="text-slate-300 font-bold">-</span>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                className="text-sm font-medium outline-none bg-transparent text-slate-700 cursor-pointer"
              />
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search ID, Email, Phone..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm shadow-sm"
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 text-[12px] font-extrabold uppercase tracking-widest text-slate-500 bg-white">
                <th className="px-6 py-5">Payment ID</th>
                <th className="px-6 py-5">Order ID</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Method</th>
                <th className="px-6 py-5">Contact Info</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-6"><div className="h-4 bg-slate-100 rounded-md w-full"></div></td>
                  </tr>
                ))
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((txn: any) => (
                  <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors cursor-pointer">{txn.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sm text-slate-600">{txn.order_id || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-sm text-slate-900">₹{(txn.amount / 100).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                        {txn.method}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sm text-slate-800">{txn.email || 'No email'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{txn.contact || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold shadow-sm ${getStatusColor(txn.status)}`}>
                        {getStatusIcon(txn.status)}
                        <span className="uppercase tracking-wider">{txn.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-semibold">
                      {new Date(txn.created_at * 1000).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <CreditCard size={48} className="mb-4 opacity-20" />
                      <p className="font-bold text-lg text-slate-500">No transactions found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or search criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white rounded-b-3xl">
          <span className="text-sm text-slate-500 font-semibold">
            Showing <span className="font-bold text-slate-900">{totalFiltered === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-bold text-slate-900">
              {Math.min(currentPage * itemsPerPage, totalFiltered)}
            </span> of <span className="font-bold text-slate-900">{totalFiltered}</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm shadow-sm"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="font-extrabold text-sm text-slate-800 bg-slate-100 px-4 py-2 rounded-xl shadow-inner border border-slate-200/60">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={loading || currentPage >= totalPages}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm shadow-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
