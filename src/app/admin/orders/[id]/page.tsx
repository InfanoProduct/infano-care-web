'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { 
  ArrowLeft, ShoppingBag, User, MapPin, CreditCard, 
  Clock, Truck, CheckCircle, XCircle, Package, Phone, Mail 
} from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(`/admin/orders/${id}`);
      setOrder(response);
    } catch (error) {
      console.error('Failed to fetch order', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      await apiClient.patch(`/admin/orders/${id}/status`, { status: newStatus });
      await fetchOrder();
    } catch (error) {
      console.error('Failed to update status', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!order) return <div className="p-8 text-center text-rose-500">Order not found.</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-3 rounded-2xl bg-white border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground font-medium">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <Package className="text-primary" size={24} />
                Order Items
              </h2>
              <span className="text-sm font-bold px-3 py-1 bg-slate-100 rounded-full">{order.items.length} Items</span>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item: any) => (
                <div key={item.id} className="p-6 flex gap-6 items-center">
                  <div className="w-20 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-[10px] font-bold shadow-sm p-2 text-center">
                    {item.book.title}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.book.title}</h3>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{item.price * item.quantity}</p>
                    <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total Amount</span>
                <span className="text-3xl font-extrabold text-primary">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-3xl shadow-sm border border-border p-8">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
              <MapPin className="text-primary" size={24} />
              Shipping Details
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address</label>
                  <p className="font-bold text-lg leading-relaxed mt-1">{order.shippingAddress}</p>
                </div>
                <div className="flex gap-10">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">City</label>
                    <p className="font-bold text-lg mt-1">{order.city}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">State</label>
                    <p className="font-bold text-lg mt-1">{order.state}</p>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pincode</label>
                  <p className="font-bold text-lg mt-1">{order.pincode}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-border/50">
                 <div className="flex items-center gap-3 mb-4">
                    <Truck className="text-indigo-500" size={20} />
                    <span className="font-bold">Shipping Status</span>
                 </div>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                    Once marked as SHIPPED, the customer will receive a tracking notification. Ensure address is verified before shipping.
                 </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Order Status Management */}
          <div className="bg-white rounded-3xl shadow-xl border border-border p-8">
            <h2 className="text-xl font-bold mb-6">Update Status</h2>
            <div className="space-y-3">
              {[
                { id: 'PLACED', label: 'Placed', icon: Clock, color: 'text-blue-500' },
                { id: 'PROCESSING', label: 'Processing', icon: Clock, color: 'text-amber-500' },
                { id: 'SHIPPED', label: 'Shipped', icon: Truck, color: 'text-indigo-500' },
                { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle, color: 'text-green-500' },
                { id: 'CANCELLED', label: 'Cancelled', icon: XCircle, color: 'text-rose-500' },
              ].map((status) => (
                <button
                  key={status.id}
                  disabled={updating}
                  onClick={() => updateStatus(status.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all font-bold ${
                    order.orderStatus === status.id 
                      ? `border-primary bg-primary/5 ${status.color}` 
                      : 'border-slate-50 hover:border-slate-100 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <status.icon size={20} />
                    {status.label}
                  </div>
                  {order.orderStatus === status.id && <CheckCircle size={16} />}
                </button>
              ))}
            </div>
          </div>

          {/* Customer & Payment */}
          <div className="bg-white rounded-3xl shadow-sm border border-border p-8 space-y-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Customer</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                  {(order.guestName || order.user?.username || 'G')[0]}
                </div>
                <div>
                  <p className="font-bold text-lg">{order.guestName || order.user?.username || 'Guest User'}</p>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail size={12} /> {order.guestEmail || 'No email provided'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone size={12} /> {order.guestPhone || 'No phone provided'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Payment Info</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Method</span>
                  <span className="font-bold">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Status</span>
                  <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                    order.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
                {order.razorpayPaymentId && (
                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Payment ID</label>
                    <p className="text-xs font-mono break-all mt-1">{order.razorpayPaymentId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
