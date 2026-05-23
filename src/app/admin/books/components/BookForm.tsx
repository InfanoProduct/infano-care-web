'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save, X, Package, DollarSign,
  Type, AlignLeft, Loader2, CheckCircle2,
  Ticket, Calendar, ToggleLeft, ToggleRight,
  Trash2, Percent, Hash, Plus, Tag,
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

export default function BookForm({ bookId }: BookFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!bookId);
  const [formData, setFormData] = useState<Partial<Book>>({
    title: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    isActive: true,
  });

  // Promo code state
  const [hasPromo, setHasPromo] = useState(false);
  const [promoForm, setPromoForm] = useState(emptyPromo);
  const [removingPromo, setRemovingPromo] = useState(false);

  useEffect(() => {
    if (bookId) {
      loadBook();
    }
  }, [bookId]);

  const loadBook = async () => {
    try {
      const book = await ShopService.getBook(bookId!);
      setFormData(book);
      if (book.coupon) {
        setHasPromo(true);
        setPromoForm({
          code: book.coupon.code,
          type: book.coupon.type,
          value: book.coupon.value,
          minOrderAmount: book.coupon.minOrderAmount,
          maxDiscount: book.coupon.maxDiscount ? String(book.coupon.maxDiscount) : '',
          expiryDate: book.coupon.expiryDate ? book.coupon.expiryDate.slice(0, 10) : '',
          usageLimit: book.coupon.usageLimit,
          isActive: book.coupon.isActive,
        });
      }
    } catch (error) {
      console.error('Failed to load book:', error);
      toast.error('Failed to load book details');
      router.push('/admin/books');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleRemovePromo = async () => {
    if (!bookId) {
      // Just clear the state for a new book
      setHasPromo(false);
      setPromoForm(emptyPromo);
      return;
    }
    if (!confirm('Delete this promo code from the product?')) return;
    setRemovingPromo(true);
    try {
      await ShopService.adminUpdateBook(bookId, { promo: null } as any);
      toast.success('Promo code removed');
      setHasPromo(false);
      setPromoForm(emptyPromo);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to remove promo code');
    } finally {
      setRemovingPromo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = { ...formData };

      if (hasPromo) {
        if (!promoForm.code.trim()) {
          toast.error('Promo code is required');
          setLoading(false);
          return;
        }
        if (!promoForm.value || promoForm.value <= 0) {
          toast.error('Promo discount value must be greater than 0');
          setLoading(false);
          return;
        }
        payload.promo = {
          ...promoForm,
          value: Number(promoForm.value),
          minOrderAmount: Number(promoForm.minOrderAmount),
          maxDiscount: promoForm.maxDiscount ? Number(promoForm.maxDiscount) : null,
          expiryDate: promoForm.expiryDate || null,
        };
      } else {
        // If promo was removed, signal deletion to the API
        if (bookId) {
          payload.promo = null;
        }
      }

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

          {/* Price and stock */}
          <div className="glass-card p-8 rounded-[2.5rem] border-primary/5 shadow-2xl grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Unit Price (₹)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <DollarSign size={18} />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full pr-6 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all"
                />
              </div>
            </div>

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
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className="w-full pr-6 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* ─── Promo Code Section ─── */}
          <div className="glass-card rounded-[2.5rem] border-emerald-500/10 shadow-2xl overflow-hidden">
            {/* Promo header */}
            <div className="p-8 pb-6 border-b border-border/20 flex items-center justify-between bg-emerald-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <Ticket size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">Promo Code</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    Attach a discount code directly to this product
                  </p>
                </div>
              </div>

              {/* Three action buttons */}
              <div className="flex items-center gap-2">
                {/* Status toggle button */}
                {hasPromo && (
                  <button
                    type="button"
                    onClick={() => setPromoForm(p => ({ ...p, isActive: !p.isActive }))}
                    title={promoForm.isActive ? 'Deactivate promo' : 'Activate promo'}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all border ${promoForm.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    {promoForm.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    {promoForm.isActive ? 'Active' : 'Inactive'}
                  </button>
                )}

                {/* Delete promo button */}
                {hasPromo && (
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    disabled={removingPromo}
                    title="Remove promo code"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-all disabled:opacity-50"
                  >
                    {removingPromo ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Delete
                  </button>
                )}

                {/* Add / collapse promo button */}
                {!hasPromo ? (
                  <button
                    type="button"
                    onClick={() => setHasPromo(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95"
                  >
                    <Plus size={14} />
                    Add Promo
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setHasPromo(false); setPromoForm(emptyPromo); }}
                    className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400"
                    title="Collapse"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Promo form body */}
            {hasPromo && (
              <div className="p-8 space-y-5">
                {/* Promo code preview badge */}
                {promoForm.code && (
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-bold w-fit transition-all ${isExpired
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : promoForm.isActive
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                    <Tag size={14} />
                    <span className="font-mono font-black tracking-wider">{promoForm.code}</span>
                    <span className="font-normal text-xs opacity-70">
                      {promoForm.type === 'PERCENTAGE' ? `${promoForm.value}% off` : `₹${promoForm.value} off`}
                      {isExpired ? ' · Expired' : promoForm.isActive ? ' · Active' : ' · Inactive'}
                    </span>
                  </div>
                )}

                {/* Code */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Ticket size={12} /> Promo Code *
                  </label>
                  <input
                    value={promoForm.code}
                    onChange={e => setPromoForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. BOOK20"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none font-mono font-black text-slate-900 placeholder:font-normal placeholder:text-slate-400 text-sm transition-all"
                  />
                </div>

                {/* Type + Value */}
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

                {/* Expiry Date */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={12} /> Expiry Date
                    <span className="text-slate-400 normal-case font-normal">(leave blank for no expiry)</span>
                  </label>
                  <input
                    type="date"
                    value={promoForm.expiryDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={e => setPromoForm(p => ({ ...p, expiryDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none font-bold text-slate-900 text-sm transition-all"
                  />
                  {isExpired && (
                    <p className="text-xs text-rose-500 font-semibold">⚠ This expiry date is in the past — the code will be rejected at checkout.</p>
                  )}
                </div>

                {/* Min Order + Max Discount + Usage Limit */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Min Order (₹)</label>
                    <input
                      type="number" min={0}
                      value={promoForm.minOrderAmount}
                      onChange={e => setPromoForm(p => ({ ...p, minOrderAmount: Number(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none font-bold text-slate-900 text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Max Discount (₹)</label>
                    <input
                      type="number" min={0}
                      value={promoForm.maxDiscount}
                      placeholder="No cap"
                      onChange={e => setPromoForm(p => ({ ...p, maxDiscount: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Usage Limit</label>
                    <input
                      type="number" min={1}
                      value={promoForm.usageLimit}
                      onChange={e => setPromoForm(p => ({ ...p, usageLimit: Number(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none font-bold text-slate-900 text-sm transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!hasPromo && (
              <div className="px-8 py-6 text-center text-muted-foreground text-sm font-medium italic">
                No promo code attached to this product.{' '}
                <button type="button" onClick={() => setHasPromo(true)} className="text-emerald-600 font-bold not-italic hover:underline">
                  Add one →
                </button>
              </div>
            )}
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
                { label: 'Accurate pricing', checked: formData.price! > 0 },
                { label: 'Cover image linked', checked: !!formData.imageUrl },
                { label: 'Stock level updated', checked: formData.stock! >= 0 },
                { label: 'Catchy description', checked: formData.description!.length > 20 },
                { label: 'Promo code valid', checked: !hasPromo || (!!promoForm.code && promoForm.value > 0 && !isExpired) },
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
