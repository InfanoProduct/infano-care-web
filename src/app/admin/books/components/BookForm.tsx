'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save, X, BookOpen, DollarSign,
  Type, AlignLeft, Loader2, CheckCircle2,
  Ticket, Calendar, ToggleLeft, ToggleRight,
  Trash2, Percent, Hash, Plus, Globe,
  IndianRupee, PoundSterling, Sparkles, User,
  FileText, ExternalLink, Package, Truck, Box, Upload
} from 'lucide-react';
import { ShopService, Book } from '@/services/shop.service';
import ImageUploader from '@/components/upload/ImageUploader';
import { toast } from 'react-hot-toast';

interface BookFormProps {
  bookId?: string;
  isWebinar?: boolean;
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

/** Returns fallback when value is null, undefined, or NaN */
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

export default function BookForm({ bookId, isWebinar = false }: BookFormProps) {
  const router = useRouter();
  const isWebinarMode = isWebinar || bookId?.startsWith('webinar-');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!bookId);
  const [pricingTab, setPricingTab] = useState<'IN' | 'US' | 'UK'>('IN');
  const [format, setFormat] = useState<'DIGITAL_EBOOK' | 'PHYSICAL_BOOK'>('DIGITAL_EBOOK');
  const [epubFile, setEpubFile] = useState<File | null>(null);
  const [uploadingEpub, setUploadingEpub] = useState(false);
  const [formData, setFormData] = useState<Partial<Book>>({
    slug: 'gigi-the-book',
    title: '',
    author: 'Infano Care',
    description: '',
    format: 'DIGITAL_EBOOK',
    price: 0,
    priceUS: undefined,
    priceUK: undefined,
    shippingIN: 40,
    shippingUS: 5.99,
    shippingUK: 4.99,
    codChargeIN: 40,
    stock: 100,
    totalPages: 1,
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

  const handleInlineEpubUpload = async () => {
    if (!epubFile) {
      toast.error('Please select an .epub file first');
      return;
    }
    const targetSlug = formData.slug?.trim() || 'gigi-the-book';
    setUploadingEpub(true);
    try {
      const res = await ShopService.adminUploadEpub(epubFile, targetSlug);
      toast.success('EPUB parsed & chapters loaded successfully! 🎉');
      if (res.book) {
        setFormData(prev => ({
          ...prev,
          title: prev.title || res.book.title,
          description: prev.description || res.book.description,
          totalPages: res.book.totalPages || prev.totalPages,
          chapters: res.book.chapters || prev.chapters,
        }));
      }
      setEpubFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload EPUB');
    } finally {
      setUploadingEpub(false);
    }
  };

  const loadBook = async () => {
    try {
      const book = await ShopService.getBook(bookId!);
      const { coupon, couponId, orderItems, ...safeBook } = book as any;
      const detectedFormat = safeBook.format || (safeBook.stock && safeBook.stock < 900000 ? 'PHYSICAL_BOOK' : 'DIGITAL_EBOOK');
      setFormat(detectedFormat);
      setFormData({
        ...safeBook,
        format: detectedFormat,
        slug: safeBook.slug || 'gigi-the-book',
        author: safeBook.author || 'Infano Care',
        totalPages: safeBook.totalPages || 1,
      });
    } catch (error) {
      console.error('Failed to load book:', error);
      toast.error('Failed to load book details');
      router.push(isWebinar || bookId?.startsWith('webinar-') ? '/admin/webinar-products' : '/admin/books');
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
      const isPhysical = format === 'PHYSICAL_BOOK';
      const payload: any = {
        format,
        slug: formData.slug?.trim() || 'gigi-the-book',
        title: formData.title,
        author: formData.author?.trim() || 'Infano Care',
        description: formData.description,
        price: Number(formData.price),
        priceUS: isWebinarMode ? null : (formData.priceUS !== undefined && formData.priceUS !== null && String(formData.priceUS) !== '' ? Number(formData.priceUS) : null),
        priceUK: isWebinarMode ? null : (formData.priceUK !== undefined && formData.priceUK !== null && String(formData.priceUK) !== '' ? Number(formData.priceUK) : null),
        shippingIN: isPhysical ? Number(formData.shippingIN ?? 0) : 0,
        shippingUS: isPhysical ? Number(formData.shippingUS ?? 0) : 0,
        shippingUK: isPhysical ? Number(formData.shippingUK ?? 0) : 0,
        codChargeIN: isPhysical ? Number(formData.codChargeIN ?? 40) : 0,
        stock: isPhysical ? Number(formData.stock ?? 50) : 999999,
        totalPages: Number(formData.totalPages || 1),
        imageUrl: formData.imageUrl,
        isActive: formData.isActive,
      };

      if (bookId) {
        await ShopService.adminUpdateBook(bookId, payload);
        toast.success(isWebinarMode ? 'Webinar updated' : `${isPhysical ? 'Physical Book' : 'Digital eBook'} updated successfully`);
      } else {
        if (isWebinarMode) {
          const cleanTitle = formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'temp';
          payload.id = `webinar-${cleanTitle}-${Math.random().toString(36).substring(2, 6)}`;
        }
        await ShopService.adminCreateBook(payload);
        toast.success(isWebinarMode ? 'Webinar created' : `${isPhysical ? 'Physical Book' : 'Digital eBook'} created successfully`);
      }
      router.push(isWebinarMode ? '/admin/webinar-products' : '/admin/books');
    } catch (error) {
      console.error('Failed to save book:', error);
      toast.error('Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-bold text-muted-foreground">Retrieving product data...</p>
      </div>
    );
  }

  const isPhysical = format === 'PHYSICAL_BOOK';

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      <div className="admin-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            {bookId ? 'Edit' : 'Add New'} <span className="text-primary">{isWebinarMode ? 'Webinar' : (isPhysical ? 'Physical Book' : 'Digital eBook')}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {isWebinarMode 
              ? 'Configure parent masterclass topic and pricing ticket pass details' 
              : `Configure ${isPhysical ? 'physical printed inventory, courier shipping matrix, and pricing' : 'digital eBook metadata, cloud reader slug, and instant access pricing'}`}
          </p>
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
            <span className="font-bold">{isWebinarMode ? 'Save Webinar' : (isPhysical ? 'Save Physical Book' : 'Save Digital eBook')}</span>
          </button>
        </div>
      </div>

      {/* Product Format Switcher (Non-Webinar only) */}
      {!isWebinarMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 via-primary/5 to-blue-500/10 rounded-3xl border border-border/50 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-primary flex items-center justify-center shadow-sm">
              {isPhysical ? <Package size={20} /> : <BookOpen size={20} />}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Select Product Format</p>
              <h3 className="text-sm font-extrabold text-foreground">
                {isPhysical ? 'Physical Printed Book (Shipped to Doorstep)' : 'Digital Interactive eBook (Instant Cloud Reader)'}
              </h3>
            </div>
          </div>

          <div className="flex rounded-2xl p-1 bg-white dark:bg-zinc-800 border border-border/50 shadow-sm">
            <button
              type="button"
              onClick={() => { setFormat('DIGITAL_EBOOK'); setFormData(f => ({ ...f, format: 'DIGITAL_EBOOK' })); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                format === 'DIGITAL_EBOOK' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen size={14} />
              <span>Digital eBook</span>
            </button>
            <button
              type="button"
              onClick={() => { setFormat('PHYSICAL_BOOK'); setFormData(f => ({ ...f, format: 'PHYSICAL_BOOK' })); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                format === 'PHYSICAL_BOOK' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Package size={14} />
              <span>Physical Book</span>
            </button>
          </div>
        </div>
      )}

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Info (8 cols) */}
        <div className="lg:col-span-8 space-y-8 min-w-0">
          {/* Basic details card */}
          <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] border-primary/5 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-border/20">
              <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-wider">
                {isPhysical ? <Package size={18} /> : <BookOpen size={18} />}
                <span>{isPhysical ? 'Physical Book Information' : 'Digital eBook Information'}</span>
              </div>
              {!isWebinarMode && !isPhysical && formData.slug && (
                <Link
                  href={`/dashboard/library/${formData.slug}/read`}
                  target="_blank"
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 transition"
                >
                  <ExternalLink size={13} />
                  <span>Preview Cloud Reader</span>
                </Link>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                {isWebinarMode ? 'Webinar Title' : (isPhysical ? 'Book Title (Paperback / Hardcover)' : 'eBook Title')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Type size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={isWebinarMode ? "e.g. Decoding Her Silence" : "e.g. Gigi The Book: A Journey of Growing Up"}
                  className="w-full pl-12 pr-6 py-3.5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                />
              </div>
            </div>

            {!isWebinarMode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!isPhysical ? (
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Reader Slug (URL identifier)
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Sparkles size={16} />
                      </div>
                      <input
                        type="text"
                        value={formData.slug || ''}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="e.g. gigi-the-book"
                        className="w-full pl-12 pr-6 py-3.5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-xs font-bold"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-1">Reader URL: /dashboard/library/{formData.slug || 'slug'}/read</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Product SKU / Code
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Box size={16} />
                      </div>
                      <input
                        type="text"
                        value={formData.slug || ''}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="e.g. gigi-physical-pb"
                        className="w-full pl-12 pr-6 py-3.5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-xs font-bold"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Author / Creator
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={formData.author || ''}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="e.g. Infano Care"
                      className="w-full pl-12 pr-6 py-3.5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Description & Synopsis</label>
              <div className="relative group">
                <div className="absolute top-3 left-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <AlignLeft size={18} />
                </div>
                <textarea
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={isWebinarMode ? "Tell parents what this webinar masterclass is about..." : "Tell the readers what this book explores..."}
                  className="w-full pl-12 pr-6 py-3.5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Physical Inventory Card (Only for PHYSICAL_BOOK) */}
          {isPhysical && !isWebinarMode && (
            <div className="glass-card p-8 rounded-[2.5rem] border-primary/5 shadow-2xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-wider pb-2 border-b border-border/20">
                <Package size={18} />
                <span>Warehouse Inventory Level</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Current Stock in Warehouse</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Package size={18} />
                    </div>
                    <input
                      type="number"
                      required
                      min="0"
                      value={safeNum(formData.stock, '')}
                      onChange={(e) => setFormData({ ...formData, stock: parseNum(e.target.value, 0) as number })}
                      placeholder="e.g. 50"
                      className="w-full pl-12 pr-6 py-3.5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-1">Automatically decrements whenever a physical book order is placed</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex flex-col justify-center">
                  <p className="text-xs font-black text-amber-800">Inventory Status Alert</p>
                  <p className="text-xs text-amber-700 mt-1 font-medium">
                    {(formData.stock || 0) <= 0 
                      ? '⚠️ Out of Stock — Customers will see backorder notice' 
                      : (formData.stock || 0) < 15 
                        ? `⚠️ Low Stock (${formData.stock} units remaining)` 
                        : `✅ Healthy inventory (${formData.stock} units available)`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Digital EPUB & Reader Asset Card (Only for DIGITAL_EBOOK) */}
          {!isPhysical && !isWebinarMode && (
            <div className="glass-card p-8 rounded-[2.5rem] border-purple-500/10 shadow-2xl space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-border/20">
                <div className="flex items-center gap-2 text-purple-700 font-black text-sm uppercase tracking-wider">
                  <Upload size={18} />
                  <span>EPUB eBook File & Cloud Reader Parser</span>
                </div>
                {formData.slug && (
                  <Link
                    href={`/dashboard/library/${formData.slug}/read`}
                    target="_blank"
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 transition"
                  >
                    <ExternalLink size={13} />
                    <span>Test Reader</span>
                  </Link>
                )}
              </div>

              {/* Upload area */}
              <div className="p-6 rounded-2xl bg-purple-50/50 border-2 border-dashed border-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 text-left w-full min-w-0">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <BookOpen size={16} className="text-purple-600" />
                    Upload .EPUB File
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Auto-extracts chapters, spine, page counts, and HTML content into the cloud reader database.
                  </p>
                  <input
                    type="file"
                    accept=".epub"
                    onChange={(e) => setEpubFile(e.target.files?.[0] || null)}
                    className="w-full max-w-full block text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleInlineEpubUpload}
                  disabled={uploadingEpub || !epubFile}
                  className="w-full md:w-auto shrink-0 px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 whitespace-nowrap transition active:scale-95"
                >
                  {uploadingEpub ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Parsing EPUB...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Parse & Load Chapters</span>
                    </>
                  )}
                </button>
              </div>

              {/* Reader status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Total Estimated Pages
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-purple-600 transition-colors">
                      <BookOpen size={16} />
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={safeNum(formData.totalPages, 1)}
                      onChange={(e) => setFormData({ ...formData, totalPages: parseNum(e.target.value, 1) as number })}
                      className="w-full pl-12 pr-6 py-3.5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition-all font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex flex-col justify-center">
                  <p className="text-xs font-black text-purple-900">Chapters Status</p>
                  <p className="text-xs text-purple-700 mt-1 font-medium">
                    {Array.isArray(formData.chapters) && formData.chapters.length > 0
                      ? `✅ ${formData.chapters.length} chapters loaded in cloud reader`
                      : 'ℹ️ Default chapters or waiting for EPUB upload'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Regional Pricing & Shipping */}
          <div className="glass-card rounded-[2.5rem] border-blue-500/10 shadow-2xl overflow-hidden">
            <div className="p-8 pb-6 border-b border-border/20 flex items-center justify-between bg-blue-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <Globe size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {isWebinarMode ? 'Webinar Ticket Pricing' : (isPhysical ? 'Regional Pricing & Shipping Charges' : 'eBook Regional Pricing')}
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                    {isWebinarMode 
                      ? 'Configure entry fee for the parent masterclass ticket pass' 
                      : (isPhysical ? 'Set unit price, regional courier delivery, and COD fees per destination' : 'Digital goods feature instant access with zero delivery fees')}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                isPhysical ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}>
                {isPhysical ? 'Physical Shipping' : 'Instant Cloud Delivery'}
              </span>
            </div>

            {/* Country Tabs */}
            {!isWebinarMode && (
              <div className="flex border-b border-border/20">
                {([['IN', '🇮🇳', 'India (₹)'], ['US', '🇺🇸', 'USA ($)'], ['UK', '🇬🇧', 'UK (£)']] as const).map(([code, flag, label]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setPricingTab(code)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                      pricingTab === code
                        ? 'bg-white border-b-2 border-blue-500 text-blue-600 shadow-sm'
                        : 'text-muted-foreground hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{flag}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* India Tab */}
            {(pricingTab === 'IN' || isWebinarMode) && (
              <div className="p-8 space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {isWebinarMode ? 'Webinar Ticket Price (₹)' : `Unit Price (₹) — India`}
                  </label>
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
                      className="w-full pl-12 pr-6 py-3.5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg"
                    />
                  </div>
                </div>

                {isPhysical && !isWebinarMode && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/20">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                        <Truck size={14} /> Shipping Charge (₹)
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                          <IndianRupee size={16} />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={safeNum(formData.shippingIN, '')}
                          onChange={(e) => setFormData({ ...formData, shippingIN: parseNum(e.target.value, 0) as number })}
                          className="w-full pl-12 pr-6 py-3.5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all font-bold"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground ml-1">Standard domestic courier charge</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                        <Truck size={14} /> COD Surcharge (₹)
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
                          onChange={(e) => setFormData({ ...formData, codChargeIN: parseNum(e.target.value, 0) as number })}
                          className="w-full pl-12 pr-6 py-3.5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all font-bold"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground ml-1">Added only when buyer selects Cash on Delivery</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* USA Tab */}
            {pricingTab === 'US' && !isWebinarMode && (
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
                      className="w-full pl-12 pr-6 py-3.5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg"
                    />
                  </div>
                </div>

                {isPhysical && (
                  <div className="space-y-2 pt-2 border-t border-border/20">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                      <Truck size={14} /> International Shipping ($) — USA
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <DollarSign size={16} />
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={safeNum(formData.shippingUS, '')}
                        onChange={(e) => setFormData({ ...formData, shippingUS: parseNum(e.target.value, 0) as number })}
                        className="w-full pl-12 pr-6 py-3.5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all font-bold"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-1">US international postal / courier rate</p>
                  </div>
                )}
              </div>
            )}

            {/* UK Tab */}
            {pricingTab === 'UK' && !isWebinarMode && (
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
                      className="w-full pl-12 pr-6 py-3.5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg"
                    />
                  </div>
                </div>

                {isPhysical && (
                  <div className="space-y-2 pt-2 border-t border-border/20">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                      <Truck size={14} /> International Shipping (£) — UK
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <PoundSterling size={16} />
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={safeNum(formData.shippingUK, '')}
                        onChange={(e) => setFormData({ ...formData, shippingUK: parseNum(e.target.value, 0) as number })}
                        className="w-full pl-12 pr-6 py-3.5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all font-bold"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-1">UK international postal / courier rate</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── Promo Code Management Section ─── */}
          <div className="glass-card rounded-[2.5rem] border-emerald-500/10 shadow-2xl overflow-hidden">
            <div className="p-8 pb-6 border-b border-border/20 flex items-center justify-between bg-emerald-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <Ticket size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Shop Promo Codes</h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                    Manage discount coupons active across the store
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none font-mono font-black text-slate-900 placeholder:font-normal placeholder:text-slate-400 text-sm transition-all bg-white"
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
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none font-bold text-slate-900 text-sm transition-all bg-white"
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

        {/* Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-8 min-w-0 lg:sticky lg:top-8">
          <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] border-primary/5 shadow-2xl space-y-6">
            <div className="space-y-4">
              <ImageUploader
                label={isPhysical ? 'Book Cover Photo' : 'eBook Cover Artwork'}
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
                  <span className="text-sm font-black">Publication Status</span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    {formData.isActive ? 'Published in Store' : 'Draft / Hidden'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-transparent border-primary/10 border space-y-4">
            <h4 className="text-sm font-black flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              {isPhysical ? 'Physical Book Checklist' : 'eBook Publishing Checklist'}
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'India unit price set', checked: (formData.price || 0) > 0 },
                { label: 'US price configured', checked: formData.priceUS != null && formData.priceUS! > 0 },
                { label: 'UK price configured', checked: formData.priceUK != null && formData.priceUK! > 0 },
                { label: 'Cover image linked', checked: !!formData.imageUrl },
                isPhysical 
                  ? { label: 'Stock inventory recorded', checked: (formData.stock || 0) > 0 }
                  : { label: 'Cloud reader slug ready', checked: !!formData.slug },
                { label: 'Detailed description', checked: (formData.description?.length || 0) > 20 },
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
