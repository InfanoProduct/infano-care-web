'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save, X, Package, DollarSign,
  Type, AlignLeft, Loader2, CheckCircle2,
  Ticket, Calendar, ToggleLeft, ToggleRight,
  Trash2, Percent, Hash, Plus, Tag, Truck, Globe,
  IndianRupee, PoundSterling,
} from 'lucide-react';
import { ShopService, Book } from '@/services/shop.service';
import ImageUploader from '@/components/upload/ImageUploader';
import { toast } from 'react-hot-toast';

interface BookFormProps {
  bookId?: string;
}

const emptyPromo = {
  code: '',
  type: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT',
  value: 15,
  minOrderAmount: 0,
  maxDiscount: '',
  expiryDate: '',
  usageLimit: 100,
  isActive: true,
};

/** Returns fallback when value is null, undefined, or NaN (NaN !== null so ?? doesn't catch it) */
const safeNum = (v: number | null | undefined, fallback: number | '' = 0): number | string => {
  if (v === null || v === undefined || Number.isNaN(v)) return fallback;
  return v;
};

/** Parse float input, returning fallback on empty/NaN */
const parseNum = (raw: string, fallback: number | null = 0): number | null => {
  if (raw === '' || raw === undefined) return fallback;
  const n = parseFloat(raw);
  return Number.isNaN(n) ? fallback : n;
};

export default function BookForm({ bookId }: BookFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!bookId);
  const [pricingTab, setPricingTab] = useState<'IN' | 'US' | 'UK'>('IN');
  const [formData, setFormData] = useState<Partial<Book>>({
    title: '',
    description: '',
    price: 0,
    priceUS: undefined,
    priceUK: undefined,
    shippingIN: 0,
    shippingUS: 0,
    shippingUK: 0,
    codChargeIN: 40,
    stock: 0,
    imageUrl: '',
    isActive: true,
  });

  // Promo codes list state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promoForm, setPromoForm] = useState(emptyPromo);
  const [savingPromo, setSavingPromo] = useState(false);

  useEffect(() => {
    if (bookId) {
      loadBook();
      loadCoupons();
    }
  }, [bookId]);

  const loadBook = async () => {
    try {
      const book = await ShopService.getBook(bookId!);
      // Safe destructuring of book data to exclude circular/metadata fields
      const { coupon, couponId, orderItems, ...safeBook } = book as any;
      setFormData(safeBook);
    } catch (error) {
      console.error('Failed to load book:', error);
      toast.error('Failed to load book details');
      router.push('/admin/books');
    } finally {
      setInitialLoading(false);
    }
  };

  const loadCoupons = async () => {
    setCouponsLoading(true);
    try {
      const list = await ShopService.adminListCoupons();
      setCoupons(list);
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleTogglePromoStatus = async (coupon: any) => {
    try {
      await ShopService.adminUpdateCoupon(coupon.id, { isActive: !coupon.isActive });
      toast.success(`Promo code ${coupon.code} ${!coupon.isActive ? 'activated' : 'deactivated'}`);
      loadCoupons();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update promo status');
    }
  };

  const handleDeletePromo = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    try {
      await ShopService.adminDeleteCoupon(couponId);
      toast.success('Promo code deleted');
      loadCoupons();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete promo code');
    }
  };

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.code.trim()) {
      toast.error('Promo code is required');
      return;
    }
    if (!promoForm.value || Number(promoForm.value) <= 0) {
      toast.error('Promo discount value must be greater than 0');
      return;
    }
    setSavingPromo(true);
    try {
      await ShopService.adminCreateCoupon({
        code: promoForm.code.toUpperCase().trim(),
        type: promoForm.type,
        value: Number(promoForm.value),
        minOrderAmount: Number(promoForm.minOrderAmount),
        maxDiscount: promoForm.maxDiscount ? Number(promoForm.maxDiscount) : null,
        expiryDate: promoForm.expiryDate || null,
        usageLimit: Number(promoForm.usageLimit),
        isActive: promoForm.isActive,
      });
      toast.success('Promo code added successfully');
      setPromoForm(emptyPromo);
      setShowAddPromo(false);
      loadCoupons();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add promo code');
    } finally {
      setSavingPromo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        priceUS: formData.priceUS !== undefined && formData.priceUS !== null && String(formData.priceUS) !== '' ? Number(formData.priceUS) : null,
        priceUK: formData.priceUK !== undefined && formData.priceUK !== null && String(formData.priceUK) !== '' ? Number(formData.priceUK) : null,
        shippingIN: Number(formData.shippingIN ?? 0),
        shippingUS: Number(formData.shippingUS ?? 0),
        shippingUK: Number(formData.shippingUK ?? 0),
        codChargeIN: Number(formData.codChargeIN ?? 40),
        stock: Number(formData.stock),
        imageUrl: formData.imageUrl,
        isActive: formData.isActive,
      };

      if (bookId) {
        await ShopService.adminUpdateBook(bookId, payload);
        toast.success('Book updated successfully');
      } else {
        await ShopService.adminCreateBook(payload);
        toast.success('Book created successfully');
      }
      router.push('/admin/books');
    } catch (error) {
      console.error('Failed to save book:', error);
      toast.error('Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  const isExpired = promoForm.expiryDate ? new Date(promoForm.expiryDate) < new Date() : false;

  if (initialLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-bold text-muted-foreground">Retrieving product data...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      <div className="admin-header flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            {bookId ? 'Edit' : 'Add New'} <span className="text-primary">Product</span>
          </h1>
          <p className="text-muted-foreground mt-1">Configure your book details, inventory, and promo code</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-4 bg-secondary/50 rounded-2xl hover:bg-secondary transition-all text-muted-foreground"
          >
            <X size={24} />
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span className="font-bold">Save Product</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic details card */}
          <div className="glass-card p-8 rounded-[2.5rem] border-primary/5 shadow-2xl space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Product Title</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Type size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Growing Up Honest"
                  className="w-full pr-6 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Description</label>
              <div className="relative group">
                <div className="absolute top-3 left-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <AlignLeft size={18} />
                </div>
                <textarea
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell the readers what this book is about..."
                  className="w-full pr-6 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Regional Pricing & Shipping */}
          <div className="glass-card rounded-[2.5rem] border-blue-500/10 shadow-2xl overflow-hidden">
            {/* Card Header */}
            <div className="p-8 pb-6 border-b border-border/20 flex items-center justify-between bg-blue-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <Globe size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Regional Pricing &amp; Shipping</h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                    Set unit price and shipping charges per country
                  </p>
                </div>
              </div>
            </div>

            {/* Country Tabs */}
            <div className="flex border-b border-border/20">
              {([['IN', '🇮🇳', 'India (₹)'], ['US', '🇺🇸', 'USA ($)'], ['UK', '🇬🇧', 'UK (£)']] as const).map(([code, flag, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setPricingTab(code)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                    pricingTab === code
                      ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                      : 'text-muted-foreground hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">{flag}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* India Tab */}
            {pricingTab === 'IN' && (
              <div className="p-8 space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Unit Price (₹) — India</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                      <IndianRupee size={18} />
                    </div>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={safeNum(formData.price, '')}
                      onChange={(e) => setFormData({ ...formData, price: parseNum(e.target.value, null) as number })}
                      placeholder="e.g. 499"
                      className="w-full pr-6 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                    <Truck size={12} /> Shipping Charge (₹)
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Truck size={16} />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={safeNum(formData.shippingIN, '')}
                      onChange={(e) => setFormData({ ...formData, shippingIN: parseNum(e.target.value, null) as number })}
                      className="w-full pr-6 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-1">Configured shipping charge for both Online and COD payments in India</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                    <Truck size={12} /> COD Surcharge (₹)
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                      <IndianRupee size={16} />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={safeNum(formData.codChargeIN, '')}
                      onChange={(e) => setFormData({ ...formData, codChargeIN: parseNum(e.target.value, null) as number })}
                      className="w-full pr-6 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-1">Configured Cash on Delivery (COD) charge for orders in India (defaults to 40)</p>
                </div>
              </div>
            )}

            {/* USA Tab */}
            {pricingTab === 'US' && (
              <div className="p-8 space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Unit Price ($) — USA</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                      <DollarSign size={18} />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={safeNum(formData.priceUS, '')}
                      onChange={(e) => setFormData({ ...formData, priceUS: parseNum(e.target.value, null) })}
                      placeholder="e.g. 19.99 (leave blank to auto-convert from ₹)"
                      className="w-full pr-6 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-1">Leave blank to auto-calculate from India price using exchange rate</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                    <Truck size={12} /> Shipping ($) — Online only
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Truck size={16} />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={safeNum(formData.shippingUS, '')}
                      onChange={(e) => setFormData({ ...formData, shippingUS: parseNum(e.target.value, null) as number })}
                      className="w-full pr-6 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-1">Only online payment is available for US customers</p>
                </div>
              </div>
            )}

            {/* UK Tab */}
            {pricingTab === 'UK' && (
              <div className="p-8 space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Unit Price (£) — UK</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                      <PoundSterling size={18} />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={safeNum(formData.priceUK, '')}
                      onChange={(e) => setFormData({ ...formData, priceUK: parseNum(e.target.value, null) })}
                      placeholder="e.g. 14.99 (leave blank to auto-convert from ₹)"
                      className="w-full pr-6 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-1">Leave blank to auto-calculate from India price using exchange rate</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                    <Truck size={12} /> Shipping (£) — Online only
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Truck size={16} />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={safeNum(formData.shippingUK, '')}
                      onChange={(e) => setFormData({ ...formData, shippingUK: parseNum(e.target.value, null) as number })}
                      className="w-full pr-6 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-1">Only online payment is available for UK customers</p>
                </div>
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="glass-card p-8 rounded-[2.5rem] border-primary/5 shadow-2xl">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Inventory Level</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Package size={18} />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  value={safeNum(formData.stock, '')}
                  onChange={(e) => setFormData({ ...formData, stock: parseNum(e.target.value, null) as number })}
                  className="w-full pr-6 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* ─── Promo Code Management Section ─── */}
          <div className="glass-card rounded-[2.5rem] border-emerald-500/10 shadow-2xl overflow-hidden">
            {/* Section Header */}
            <div className="p-8 pb-6 border-b border-border/20 flex items-center justify-between bg-emerald-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <Ticket size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Shop Promo Codes</h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                    Manage multiple discount coupons active in the store
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddPromo(!showAddPromo);
                  setPromoForm(emptyPromo);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 cursor-pointer"
              >
                {showAddPromo ? <X size={14} /> : <Plus size={14} />}
                {showAddPromo ? 'Cancel' : 'Add Promo'}
              </button>
            </div>

            {/* Add Promo Code Form */}
            {showAddPromo && (
              <div className="p-8 border-b border-border/10 bg-slate-50/50 space-y-5 animate-in slide-in-from-top-4 duration-300">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <Plus size={16} className="text-emerald-600" /> Create a New Coupon
                </h4>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Ticket size={12} /> Promo Code *
                  </label>
                  <input
                    value={promoForm.code}
                    onChange={e => setPromoForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. GIGI25"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none font-mono font-black text-slate-900 placeholder:font-normal placeholder:text-slate-400 text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Discount Type *</label>
                    <select
                      value={promoForm.type}
                      onChange={e => setPromoForm(p => ({ ...p, type: e.target.value as 'PERCENTAGE' | 'FLAT' }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none font-bold text-slate-900 text-sm bg-white transition-all"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FLAT">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      {promoForm.type === 'PERCENTAGE' ? <Percent size={11} /> : <Hash size={11} />}
                      Value * {promoForm.type === 'PERCENTAGE' ? '(%)' : '(₹)'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={promoForm.type === 'PERCENTAGE' ? 100 : undefined}
                      value={promoForm.value}
                      onChange={e => setPromoForm(p => ({ ...p, value: Number(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none font-bold text-slate-900 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={12} /> Expiry Date
                    <span className="text-slate-400 normal-case font-normal">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={promoForm.expiryDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={e => setPromoForm(p => ({ ...p, expiryDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none font-bold text-slate-900 text-sm transition-all bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Min Order (₹)</label>
                    <input
                      type="number" min={0}
                      value={promoForm.minOrderAmount}
                      onChange={e => setPromoForm(p => ({ ...p, minOrderAmount: Number(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none font-bold text-slate-900 text-sm transition-all bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Max Discount (₹)</label>
                    <input
                      type="number" min={0}
                      value={promoForm.maxDiscount}
                      placeholder="No cap"
                      onChange={e => setPromoForm(p => ({ ...p, maxDiscount: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 text-sm transition-all bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Usage Limit</label>
                    <input
                      type="number" min={1}
                      value={promoForm.usageLimit}
                      onChange={e => setPromoForm(p => ({ ...p, usageLimit: Number(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none font-bold text-slate-900 text-sm transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddPromo(false); setPromoForm(emptyPromo); }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-xs transition-all cursor-pointer text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPromo}
                    disabled={savingPromo}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {savingPromo ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                    Save Coupon
                  </button>
                </div>
              </div>
            )}

            {/* Coupons List */}
            <div className="p-8 space-y-4">
              {couponsLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Loader2 className="animate-spin text-emerald-600" size={28} />
                  <p className="text-xs text-muted-foreground font-semibold">Updating promo codes list...</p>
                </div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm font-medium italic">
                  No promo codes active in store. Create one above to attract buyers!
                </div>
              ) : (
                <div className="space-y-4">
                  {coupons.map((coupon) => {
                    const isCouponExpired = coupon.expiryDate ? new Date(coupon.expiryDate) < new Date() : false;
                    return (
                      <div
                        key={coupon.id}
                        className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border transition-all ${
                          isCouponExpired
                            ? 'bg-rose-50/40 border-rose-100'
                            : coupon.isActive
                              ? 'bg-emerald-50/20 border-emerald-100'
                              : 'bg-slate-50/40 border-slate-100'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-black tracking-wider px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-900 shadow-sm text-sm">
                              {coupon.code}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isCouponExpired
                                ? 'bg-rose-100 text-rose-700'
                                : coupon.isActive
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-500'
                            }`}>
                              {isCouponExpired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 font-bold space-y-1">
                            <p className="text-slate-800 text-sm font-black">
                              Discount: {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `₹${coupon.value}`} off
                            </p>
                            <p className="font-semibold">
                              Min Order: ₹{coupon.minOrderAmount} 
                              {coupon.maxDiscount ? ` · Cap: ₹${coupon.maxDiscount}` : ''} 
                              {coupon.expiryDate ? ` · Expires: ${new Date(coupon.expiryDate).toLocaleDateString()}` : ' · No Expiry'}
                            </p>
                            <p className="font-semibold text-slate-400">
                              Usage: {coupon.usedCount} used / {coupon.usageLimit} limit
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 md:mt-0 justify-end">
                          <button
                            type="button"
                            onClick={() => handleTogglePromoStatus(coupon)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border ${
                              coupon.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {coupon.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            {coupon.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDeletePromo(coupon.id)}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                            title="Delete promo code"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem] border-primary/5 shadow-2xl space-y-6">
            <div className="space-y-4">
              <ImageUploader
                label="Cover Image"
                onUpload={(url) => setFormData({ ...formData, imageUrl: url })}
                value={formData.imageUrl}
                folder="shop"
              />
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Or Paste Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full px-5 py-4 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border/30">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`w-14 h-8 rounded-full transition-all relative ${formData.isActive ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-muted'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${formData.isActive ? 'left-7' : 'left-1'}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black">Active Status</span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    {formData.isActive ? 'Visible in store' : 'Hidden from store'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-transparent border-primary/10 border space-y-4">
            <h4 className="text-sm font-black flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              Publishing Checklist
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'India price set', checked: formData.price! > 0 },
                { label: 'US price configured', checked: formData.priceUS != null && formData.priceUS! > 0 },
                { label: 'UK price configured', checked: formData.priceUK != null && formData.priceUK! > 0 },
                { label: 'Cover image linked', checked: !!formData.imageUrl },
                { label: 'Stock level updated', checked: formData.stock! >= 0 },
                { label: 'Catchy description', checked: formData.description!.length > 20 },
                { label: 'Shop promo codes ready', checked: coupons.length > 0 },
              ].map(item => (
                <li key={item.label} className="flex items-center gap-3 text-xs font-bold transition-all">
                  <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border bg-white'}`}>
                    {item.checked && <CheckCircle2 size={10} />}
                  </div>
                  <span className={item.checked ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
