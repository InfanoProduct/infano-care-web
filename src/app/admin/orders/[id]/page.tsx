'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import {
  ArrowLeft, ShoppingBag, User, MapPin, CreditCard,
  Clock, Truck, CheckCircle, XCircle, Package, Phone, Mail,
  AlertCircle, ChevronRight, Receipt, Tag, Info, ShieldCheck, MessageSquare
} from 'lucide-react';
import { formatIndianDate, formatOrderId, getOrderCountry, getCurrencySymbol } from '@/lib/utils';

const ALL_STATUS_OPTIONS = [
  { id: 'PLACED', label: 'Order Placed' },
  { id: 'PROCESSING', label: 'Processing' },
  { id: 'ON_HOLD', label: 'On Hold' },
  { id: 'SHIPPED', label: 'Shipped' },
  { id: 'DELIVERED', label: 'Delivered' },
];

const getStatusSteps = (currentStatus: string) => [
  { id: 'PLACED', label: 'Order Placed', icon: Clock },
  currentStatus === 'ON_HOLD'
    ? { id: 'ON_HOLD', label: 'On Hold', icon: AlertCircle }
    : { id: 'PROCESSING', label: 'Processing', icon: Package },
  { id: 'SHIPPED', label: 'Shipped', icon: Truck },
  { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PLACED: ['PROCESSING', 'ON_HOLD', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'ON_HOLD', 'CANCELLED'],
  ON_HOLD: ['PROCESSING', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
  FAILED: [],
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualTxnId, setManualTxnId] = useState('');
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [convertingToCod, setConvertingToCod] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [awbInput, setAwbInput] = useState('');
  const [awbError, setAwbError] = useState<string | null>(null);
  const [savingAwb, setSavingAwb] = useState(false);
  const [showMissingAwbWarning, setShowMissingAwbWarning] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(`/admin/orders/${id}`);
      setOrder(response);
      if (response.comments) {
        setComments(response.comments);
      }
    } catch (error) {
      console.error('Failed to fetch order', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!STATUS_TRANSITIONS[order.orderStatus].includes(newStatus)) return;

    if (newStatus === 'SHIPPED' && !order.awbNumber?.trim()) {
      setShowMissingAwbWarning(true);
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      await apiClient.patch(`/admin/orders/${id}/status`, { status: newStatus });
      await fetchOrder();
    } catch (error: any) {
      setError(error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const confirmShipWithoutAwb = async () => {
    setShowMissingAwbWarning(false);
    try {
      setUpdating(true);
      setError(null);
      await apiClient.patch(`/admin/orders/${id}/status`, { status: 'SHIPPED' });
      await fetchOrder();
    } catch (error: any) {
      setError(error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const saveAwbNumber = async () => {
    const trimmed = awbInput.trim();
    if (!trimmed) {
      setAwbError('Please enter a valid AWB number.');
      return;
    }
    try {
      setSavingAwb(true);
      setAwbError(null);
      await apiClient.patch(`/admin/orders/${id}/awb`, { awbNumber: trimmed });
      setAwbInput('');
      await fetchOrder();
    } catch (err: any) {
      setAwbError(err.message || 'Failed to save AWB number');
    } finally {
      setSavingAwb(false);
    }
  };

  const verifyManualPayment = async () => {
    if (!manualTxnId.trim()) return;
    try {
      setVerifyingPayment(true);
      setPaymentError(null);
      await apiClient.post(`/admin/orders/${id}/manual-payment`, { transactionId: manualTxnId.trim() });
      await fetchOrder();
      setManualTxnId('');
    } catch (err: any) {
      setPaymentError(err.message || 'Verification failed');
    } finally {
      setVerifyingPayment(false);
    }
  };

  const convertToCod = async () => {
    if (!window.confirm('Are you sure you want to convert this failed order to Cash on Delivery?')) return;
    try {
      setConvertingToCod(true);
      setError(null);
      await apiClient.post(`/admin/orders/${id}/convert-to-cod`);
      await fetchOrder();
    } catch (err: any) {
      setError(err.message || 'Failed to convert to COD');
    } finally {
      setConvertingToCod(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const commentText = newComment.trim();
      setNewComment('');
      // Optimistic update
      setComments([...comments, { text: commentText, createdAt: new Date().toISOString() }]);
      const response = await apiClient.post<any>(`/admin/orders/${id}/comments`, { text: commentText });
      if (response && response.comments) {
        setComments(response.comments);
      }
    } catch (err: any) {
      console.error('Failed to add comment', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  if (!order) return (
    <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
      <XCircle size={32} className="mx-auto text-red-500 mb-4" />
      <h2 className="text-xl font-semibold">Order not found</h2>
      <button onClick={() => router.back()} className="mt-4 text-primary font-medium hover:underline">Go Back</button>
    </div>
  );

  const isFailed = order ? (order.paymentMethod === 'ONLINE' && !order.razorpayPaymentId && order.orderStatus !== 'CANCELLED') : false;
  const displayOrderStatus = order ? (isFailed ? 'FAILED' : order.orderStatus) : '';
  const statusSteps = getStatusSteps(displayOrderStatus);
  const currentStepIndex = statusSteps.findIndex(s => s.id === displayOrderStatus);
  const isCancelled = displayOrderStatus === 'CANCELLED';
  const isPendingCod = order ? (order.paymentMethod === 'COD' && order.paymentStatus === 'PENDING' && !isCancelled && displayOrderStatus !== 'DELIVERED') : false;
  const showManualPaymentInput = isFailed || isPendingCod;

  const country = order ? getOrderCountry(order) : 'IN';
  const currencySymbol = getCurrencySymbol(country);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">

      {/* Missing AWB Warning Modal */}
      {showMissingAwbWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Missing AWB Number</h2>
                <p className="text-xs text-red-600 font-medium">Proceed with caution</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to mark this order as <strong>Shipped</strong> without adding a Tracking Number?
              The customer will not be able to track their package directly via Delhivery.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMissingAwbWarning(false)}
                disabled={updating}
                className="flex-1 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmShipWithoutAwb}
                disabled={updating}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {updating ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Updating...</>
                ) : (
                  'Yes, Mark as Shipped'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-655 transition-colors mt-1"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">Order {formatOrderId(order.id)}</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">Placed on {formatIndianDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0 ml-10 md:ml-0">
          <button className="px-4 py-2 rounded-md bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors text-sm flex items-center gap-2">
            <Receipt size={16} /> Download Invoice
          </button>
        </div>
      </div>

      {/* Progress Tracker (Top Bar) */}
      {!isCancelled && !isFailed && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="relative flex justify-between items-center max-w-4xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
            ></div>

            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border-2 ${isCompleted
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-slate-300 border-slate-200'
                    }`}>
                    <step.icon size={14} />
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-semibold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-center gap-4 text-red-700">
          <XCircle size={24} className="shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Order Cancelled</h3>
            <p className="text-sm">This order was cancelled and items have been returned to stock.</p>
          </div>
        </div>
      )}

      {showManualPaymentInput && (
        <div className={`${isFailed ? 'bg-red-50 border-red-200 text-red-700' : 'bg-indigo-50 border-indigo-200 text-indigo-700'} border rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
          <div className="flex items-center gap-4">
            {isFailed ? <AlertCircle size={32} className="shrink-0" /> : <CreditCard size={32} className="shrink-0" />}
            <div>
              <h3 className={`font-semibold ${isFailed ? 'text-red-900' : 'text-indigo-900'}`}>
                {isFailed ? 'Order Failed' : 'Convert to Online Payment'}
              </h3>
              <p className="text-sm">
                {isFailed
                  ? 'The payment for this order was not completed successfully.'
                  : 'Enter a valid Razorpay transaction ID to securely convert this COD order to an Online paid order.'}
              </p>
              {isFailed && (
                <button
                  onClick={convertToCod}
                  disabled={convertingToCod}
                  className="mt-3 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {convertingToCod ? 'Converting...' : 'Change to COD & Place Order'}
                </button>
              )}
            </div>
          </div>

          <div className={`w-full md:w-auto bg-white p-4 rounded-lg border ${isFailed ? 'border-red-100' : 'border-indigo-100'} shadow-sm flex flex-col gap-3 min-w-[320px]`}>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              {isFailed ? 'Manual Payment Recovery' : 'Manual Payment Entry'}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Razorpay Txn ID (pay_...)"
                value={manualTxnId}
                onChange={(e) => setManualTxnId(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={verifyingPayment}
              />
              <button
                onClick={verifyManualPayment}
                disabled={verifyingPayment || !manualTxnId.trim()}
                className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap transition-colors"
              >
                {verifyingPayment ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            {paymentError && <p className={`text-xs font-medium p-2 rounded ${isFailed ? 'text-red-600 bg-red-50' : 'text-indigo-600 bg-indigo-50'}`}>{paymentError}</p>}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Order details & Shipping */}
        <div className="lg:col-span-2 space-y-6">

          {/* Order Items */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Package className="text-slate-500" size={18} />
              <h2 className="font-semibold text-slate-900">Order Items</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item: any) => {
                const book = item.book || {};
                const title = book.title || item.bookTitle || item.name || item.bookId || 'Product Item';
                const isProgram = !!((book as any).curriculum?.length || book.classRange || book.duration || (book.title && book.title.toLowerCase().includes('program')));
                const isbnId = (book.id || item.bookId || 'unknown').toString().slice(0, 6).toUpperCase();
                const unitPrice = item.price || book.price || 0;

                return (
                  <div key={item.id} className="p-5 flex gap-4 items-start">
                    <div className="w-16 h-20 bg-slate-100 rounded flex items-center justify-center text-slate-500 text-xs font-medium border border-slate-200 shrink-0">
                      {isProgram ? 'Prgrm' : 'Book'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-sm md:text-base">{isProgram ? `Program: ${title}` : title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>Qty: {item.quantity}</span>
                        <span>•</span>
                        {!isProgram ? (
                          <span className="font-mono">{book.isbn ? `ISBN: ${book.isbn}` : `Product ID: INF-${isbnId}`}</span>
                        ) : (
                          <span>Enrollment Item</span>
                        )}
                        <span>•</span>
                        <span>{currencySymbol}{unitPrice} each</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{currencySymbol}{unitPrice * item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financials Breakdown */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{currencySymbol}{order.subtotal}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1"><Tag size={14} /> Discount ({order.coupon?.code})</span>
                  <span>-{currencySymbol}{order.discountAmount}</span>
                </div>
              )}
              {country === 'IN' && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Amount</span>
                    <span>{currencySymbol}{order.taxableAmount || (order.subtotal - order.discountAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-xs pl-4">
                    <span>CGST (2.5%)</span>
                    <span>{currencySymbol}{order.cgstAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-xs pl-4 pb-2 border-b border-slate-200 border-dashed">
                    <span>SGST (2.5%)</span>
                    <span>{currencySymbol}{order.sgstAmount}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-slate-600 pt-2">
                <span>Delivery Charge</span>
                <span>{order.deliveryCharge > 0 ? `${currencySymbol}${order.deliveryCharge}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-200">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-bold text-lg text-slate-900">{currencySymbol}{order.totalAmount}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-5 border-t border-slate-200 bg-white">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard size={14} /> Payment Information
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-slate-500 text-xs mb-2">Payment Status</p>
                  <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide ${order.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {order.paymentStatus}
                  </span>
                </div>
                {order.paymentMethod && (
                  <div>
                    <p className="text-slate-500 text-xs mb-2">Payment Method</p>
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide bg-slate-100 text-slate-700">
                      {order.paymentMethod}
                    </span>
                  </div>
                )}
              </div>

              {order.razorpayOrderId && (
                <div className="grid md:grid-cols-2 gap-4 text-sm pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Razorpay Order ID</p>
                    <p className="font-mono text-slate-900">{order.razorpayOrderId}</p>
                  </div>
                  {order.razorpayPaymentId && (
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Payment ID</p>
                      <p className="font-mono text-slate-900">{order.razorpayPaymentId}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <MessageSquare className="text-slate-500" size={18} />
              <h2 className="font-semibold text-slate-900">Admin Comments</h2>
            </div>
            <div className="p-5 space-y-4">
              {comments.length > 0 ? (
                <div className="space-y-4 mb-4">
                  {comments.map((comment, index) => (
                    <div key={index} className="bg-slate-50 p-3 rounded-md border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1 font-medium">{formatIndianDate(comment.createdAt)}</p>
                      <p className="text-sm text-slate-800">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic mb-4">No comments yet. Add one below.</p>
              )}

              <div className="flex flex-col gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment or note about this order..."
                  className="w-full p-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 resize-none"
                  rows={3}
                />
                <button
                  onClick={addComment}
                  disabled={!newComment.trim()}
                  className="self-end px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Sidebar Actions */}
        <div className="space-y-6">

          {/* Active / Inactive Visibility Control */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Order Status (Admin)</h2>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${order.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {order.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Toggle the active state of this order. Inactive orders will be hidden from the default active orders dashboard view.
              </p>
              <button
                onClick={async () => {
                  if (!window.confirm(`Are you sure you want to mark this order as ${order.isActive ? 'Inactive' : 'Active'}?`)) return;
                  try {
                    setUpdating(true);
                    await apiClient.patch(`/admin/orders/${order.id}/active`, { isActive: !order.isActive });
                    await fetchOrder();
                  } catch (err: any) {
                    setError(err.message || 'Failed to update visibility status');
                  } finally {
                    setUpdating(false);
                  }
                }}
                disabled={updating}
                className={`w-full py-2.5 px-4 rounded-md font-bold text-xs uppercase tracking-wide transition-all border flex items-center justify-center gap-2 ${
                  order.isActive
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                }`}
              >
                {order.isActive ? 'Mark as Inactive' : 'Mark as Active'}
              </button>
            </div>
          </div>

          {/* Status Controls */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-slate-900">Update Order Status</h2>
            </div>
            <div className="p-5">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="flex items-center gap-3">
                <select
                  className="flex-1 w-full p-2.5 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                  value={displayOrderStatus}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={updating || isCancelled}
                >
                  {ALL_STATUS_OPTIONS.map((step) => {
                    const isCurrent = displayOrderStatus === step.id;
                    const canTransition = STATUS_TRANSITIONS[order.orderStatus]?.includes(step.id);
                    const isDisabled = isFailed || (!isCurrent && !canTransition);

                    return (
                      <option key={step.id} value={step.id} disabled={isDisabled}>
                        {step.label} {isCurrent ? '(Current)' : ''}
                      </option>
                    );
                  })}
                  {(STATUS_TRANSITIONS[order.orderStatus]?.includes('CANCELLED') || displayOrderStatus === 'CANCELLED' || isFailed) && (
                    <option value="CANCELLED" disabled={displayOrderStatus === 'CANCELLED'}>
                      Cancel Order {displayOrderStatus === 'CANCELLED' ? '(Current)' : ''}
                    </option>
                  )}
                  {isFailed && (
                    <option value="FAILED" disabled hidden>
                      Order Failed (Current)
                    </option>
                  )}
                </select>
                {updating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary shrink-0"></div>
                )}
              </div>
              <p className="text-xs text-slate-500 text-center mt-4">
                Status changes must follow sequential progression
              </p>
            </div>
          </div>

          {/* Inline AWB Input for PROCESSING status */}
          {order.orderStatus === 'PROCESSING' && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 bg-orange-50 flex items-center gap-2">
                <Truck className="text-orange-600" size={18} />
                <h2 className="font-semibold text-slate-900">Add Tracking Number</h2>
              </div>
              <div className="p-5">
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Enter the <strong>Delhivery AWB</strong> number before shipping. This is required and will be emailed to the customer.
                </p>
                
                {order.awbNumber ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-xs text-green-800 mb-1 font-semibold">AWB Saved Successfully</p>
                    <p className="text-sm font-mono text-green-900">{order.awbNumber}</p>
                    <button 
                      onClick={() => setAwbInput(order.awbNumber)}
                      className="text-xs text-green-700 underline mt-2 hover:text-green-800"
                    >
                      Edit AWB
                    </button>
                  </div>
                ) : null}

                {(!order.awbNumber || awbInput) && (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 44757310001551"
                      value={awbInput}
                      onChange={(e) => { setAwbInput(e.target.value); setAwbError(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && saveAwbNumber()}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400"
                      disabled={savingAwb}
                    />
                    {awbError && <p className="text-xs text-red-600 font-medium">{awbError}</p>}
                    <button
                      onClick={saveAwbNumber}
                      disabled={savingAwb || !awbInput.trim()}
                      className="w-full py-2.5 rounded-md bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-1"
                    >
                      {savingAwb ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Saving...</>
                      ) : (
                        'Save AWB Number'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Card */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <User className="text-slate-500" size={18} />
              <h2 className="font-semibold text-slate-900">Customer</h2>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-semibold text-lg shrink-0">
                  {(order.guestName || order.user?.username || 'G')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{order.guestName || order.user?.username || 'Guest'}</p>
                  <p className="text-xs text-slate-500">{order.userId ? 'Registered User' : 'Guest Customer'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-slate-400 mt-0.5" />
                  <div className="overflow-hidden">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{order.guestEmail || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-900">{order.guestPhone || 'N/A'}</p>
                  </div>
                </div>
                {order.gstNumber && (
                  <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                    <ShieldCheck size={16} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">GSTIN</p>
                      <p className="text-sm font-medium text-slate-900">{order.gstNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Info (Moved to Sidebar) */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <MapPin className="text-slate-500" size={18} />
              <h2 className="font-semibold text-slate-900">Shipping Details</h2>
            </div>
            <div className="p-5 space-y-6">
              <div className="space-y-4">
                {(() => {
                  let streetAddressLabel = "Full Address";
                  let cityLabel = "City";
                  let stateLabel = "State / Region";
                  let pincodeLabel = "Pincode";
                  let countryName = "India";

                  if (country === 'US') {
                    streetAddressLabel = "Street Address";
                    cityLabel = "City";
                    stateLabel = "State";
                    pincodeLabel = "ZIP Code";
                    countryName = "United States";
                  } else if (country === 'UK') {
                    streetAddressLabel = "Address Line 1";
                    cityLabel = "Town / City";
                    stateLabel = "County";
                    pincodeLabel = "Postal Code";
                    countryName = "United Kingdom";
                  }

                  return (
                    <>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Country</p>
                        <p className="font-medium text-slate-900 text-sm">{countryName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">{streetAddressLabel}</p>
                        <p className="font-medium text-slate-900 text-sm">{order.shippingAddress}</p>
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">{cityLabel}</p>
                          <p className="font-medium text-slate-900 text-sm">{order.city}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">{stateLabel}</p>
                          <p className="font-medium text-slate-900 text-sm">{order.state}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">{pincodeLabel}</p>
                        <p className="font-medium text-slate-900 text-sm">{order.pincode}</p>
                      </div>
                    </>
                  );
                })()}

                {/* AWB Number display */}
                {order.awbNumber && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Truck size={12} /> AWB / Tracking Number</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-semibold text-slate-900 text-sm">{order.awbNumber}</p>
                      <a
                        href={`https://www.delhivery.com/track-v2/package/${order.awbNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Track →
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 rounded-md p-4 border border-slate-100">
                <div className="font-medium text-sm flex items-center gap-2 mb-2 text-slate-700">
                  <Info size={16} /> Delivery Instructions
                </div>
                <p className="text-sm text-slate-600">
                  Standard delivery. Please ensure the package is handled with care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
