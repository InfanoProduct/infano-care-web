'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save, X, BookOpen, DollarSign, ArrowLeft,
  Type, AlignLeft, Loader2, CheckCircle2,
  Trash2, Percent, Hash, Plus, Globe,
  IndianRupee, PoundSterling, Sparkles, User,
  FileText, ExternalLink, Package, Truck, Box, Upload,
  AlertCircle, ShieldCheck, Eye, Layers
} from 'lucide-react';
import { ShopService, Book } from '@/services/shop.service';
import ImageUploader from '@/components/upload/ImageUploader';
import { toast } from 'react-hot-toast';

interface BookFormProps {
  bookId?: string;
  isWebinar?: boolean;
}

const safeNum = (v: number | null | undefined, fallback: number | '' = 0): number | string => {
  if (v === null || v === undefined || Number.isNaN(v)) return fallback;
  return v;
};

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
  const [format, setFormat] = useState<'DIGITAL_EBOOK' | 'PHYSICAL_BOOK'>('DIGITAL_EBOOK');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [activeSection, setActiveSection] = useState<'details' | 'pricing' | 'content'>('details');

  const [formData, setFormData] = useState<Partial<Book>>({
    slug: '',
    title: '',
    author: 'Infano Care',
    description: '',
    format: 'DIGITAL_EBOOK',
    price: 499,
    priceUS: 19.99,
    priceUK: 14.99,
    shippingIN: 0,
    shippingUS: 4,
    shippingUK: 4,
    codChargeIN: 40,
    stock: 100,
    totalPages: 1,
    imageUrl: '',
    pdfUrl: '',
    isActive: true,
  });

  useEffect(() => {
    if (bookId) {
      loadBook();
    }
  }, [bookId]);

  const loadBook = async () => {
    try {
      const book = await ShopService.getBook(bookId!);
      const { coupon, couponId, orderItems, ...safeBook } = book as any;
      const detectedFormat = safeBook.format || (safeBook.stock !== undefined && safeBook.stock < 900000 && !safeBook.slug ? 'PHYSICAL_BOOK' : 'DIGITAL_EBOOK');

      setFormat(detectedFormat);
      setFormData({
        ...safeBook,
        format: detectedFormat,
        slug: safeBook.slug || '',
        author: safeBook.author || 'Infano Care',
        totalPages: safeBook.totalPages || 1,
        pdfUrl: safeBook.pdfUrl || '',
      });
    } catch (error) {
      console.error('Failed to load book:', error);
      toast.error('Failed to load book details');
      router.push(isWebinar || bookId?.startsWith('webinar-') ? '/admin/webinar-products' : '/admin/books');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInlinePdfUpload = async () => {
    if (!pdfFile) {
      toast.error('Please select a .pdf file first');
      return;
    }
    setUploadingPdf(true);
    try {
      const res = await ShopService.adminUploadPdf(pdfFile);
      if (res?.url) {
        setFormData(prev => ({
          ...prev,
          pdfUrl: res.url,
        }));
        toast.success('PDF uploaded successfully! Click "Save Changes" to apply.');
        setPdfFile(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload PDF');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isPhysical = format === 'PHYSICAL_BOOK';
      const cleanSlug = formData.slug?.trim() 
        ? formData.slug.trim() 
        : (!isPhysical && !isWebinarMode && formData.title 
            ? formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') 
            : null);

      const payload: any = {
        format,
        slug: cleanSlug,
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
        pdfUrl: formData.pdfUrl || null,
        isActive: formData.isActive,
        chapters: formData.chapters,
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
    } catch (error: any) {
      console.error('Failed to save book:', error);
      toast.error(error?.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="font-bold text-sm">Loading product details...</p>
      </div>
    );
  }

  const isPhysical = format === 'PHYSICAL_BOOK';

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <Link
            href="/admin/books"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary mb-2 transition"
          >
            <ArrowLeft size={14} /> Back to Catalog
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {bookId ? (formData.title || 'Edit Book') : 'Create New Product'}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              formData.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            }`}>
              {formData.isActive ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isPhysical && formData.slug && (
            <Link
              href={`/dashboard/library/${formData.slug}/read`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition"
            >
              <Eye size={14} />
              <span>Preview Reader</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => router.push('/admin/books')}
            className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 font-bold text-xs transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg shadow-primary/25 font-bold text-xs hover:scale-105 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            <span>{bookId ? 'Save Changes' : 'Publish Product'}</span>
          </button>
        </div>
      </div>

      {/* Format Selection Cards (Only for creation or non-webinar) */}
      {!isWebinarMode && (
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Product Format & Delivery Model
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => { setFormat('DIGITAL_EBOOK'); setFormData(f => ({ ...f, format: 'DIGITAL_EBOOK' })); }}
              className={`p-5 rounded-3xl border-2 text-left transition-all flex items-start gap-4 ${
                format === 'DIGITAL_EBOOK'
                  ? 'border-purple-600 bg-purple-500/5 shadow-md shadow-purple-500/10 ring-2 ring-purple-500/20'
                  : 'border-border/60 bg-card hover:border-border'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                format === 'DIGITAL_EBOOK' ? 'bg-purple-600 text-white' : 'bg-secondary text-muted-foreground'
              }`}>
                <Sparkles size={22} />
              </div>
              <div>
                <p className="font-extrabold text-sm text-foreground">Digital eBook (PDF)</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Instant cloud reader access with PDF document viewing, page zoom, full reader mode, and zero shipping fee.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setFormat('PHYSICAL_BOOK'); setFormData(f => ({ ...f, format: 'PHYSICAL_BOOK' })); }}
              className={`p-5 rounded-3xl border-2 text-left transition-all flex items-start gap-4 ${
                format === 'PHYSICAL_BOOK'
                  ? 'border-blue-600 bg-blue-500/5 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                  : 'border-border/60 bg-card hover:border-border'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                format === 'PHYSICAL_BOOK' ? 'bg-blue-600 text-white' : 'bg-secondary text-muted-foreground'
              }`}>
                <Package size={22} />
              </div>
              <div>
                <p className="font-extrabold text-sm text-foreground">Physical Printed Book</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Physical inventory item requiring courier doorstep shipping, warehouse inventory tracking, and COD surcharge.
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Form Fields */}
        <div className="lg:col-span-8 space-y-8">
          {/* Card 1: Core Details */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border/40 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2 border-b border-border/30 pb-3">
              <FileText size={18} className="text-primary" />
              <span>General Information</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Gigi: The Awkward Age"
                  className="w-full px-4 py-3 bg-secondary/30 border border-border/60 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Author / Publisher
                  </label>
                  <input
                    type="text"
                    value={formData.author || ''}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Infano Care"
                    className="w-full px-4 py-2.5 bg-secondary/30 border border-border/60 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-1.5">
                    {isPhysical ? 'SKU / Product Code' : 'Reader Slug (URL ID)'}
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder={isPhysical ? 'e.g. gigi-physical-pb' : 'e.g. gigi-the-book'}
                    className="w-full px-4 py-2.5 bg-secondary/30 border border-border/60 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                  {!isPhysical && formData.slug && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      URL: <span className="font-mono text-purple-600">/dashboard/library/{formData.slug}/read</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Description & Synopsis
                </label>
                <textarea
                  rows={4}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of the book content, target audience, and key themes..."
                  className="w-full px-4 py-3 bg-secondary/30 border border-border/60 rounded-xl text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Pricing & Shipping Matrix */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border/40 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2 border-b border-border/30 pb-3">
              <Globe size={18} className="text-blue-600" />
              <span>Pricing & Regional Delivery Rates</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* India INR */}
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <span>🇮🇳</span> <span>India (INR ₹)</span>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={safeNum(formData.price, '')}
                    onChange={(e) => setFormData({ ...formData, price: parseNum(e.target.value, null) as number })}
                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg text-sm font-black"
                  />
                </div>
                {isPhysical && (
                  <>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Shipping Fee (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={safeNum(formData.shippingIN, '')}
                        onChange={(e) => setFormData({ ...formData, shippingIN: parseNum(e.target.value, 0) as number })}
                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">COD Charge (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={safeNum(formData.codChargeIN, '')}
                        onChange={(e) => setFormData({ ...formData, codChargeIN: parseNum(e.target.value, 0) as number })}
                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg text-xs font-bold"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* USA USD */}
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <span>🇺🇸</span> <span>USA (USD $)</span>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={safeNum(formData.priceUS, '')}
                    onChange={(e) => setFormData({ ...formData, priceUS: parseNum(e.target.value, null) })}
                    placeholder="Auto-convert"
                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg text-sm font-black"
                  />
                </div>
                {isPhysical && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Shipping Fee ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={safeNum(formData.shippingUS, '')}
                      onChange={(e) => setFormData({ ...formData, shippingUS: parseNum(e.target.value, 0) as number })}
                      className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg text-xs font-bold"
                    />
                  </div>
                )}
              </div>

              {/* UK GBP */}
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <span>🇬🇧</span> <span>UK (GBP £)</span>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Unit Price (£)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={safeNum(formData.priceUK, '')}
                    onChange={(e) => setFormData({ ...formData, priceUK: parseNum(e.target.value, null) })}
                    placeholder="Auto-convert"
                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg text-sm font-black"
                  />
                </div>
                {isPhysical && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Shipping Fee (£)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={safeNum(formData.shippingUK, '')}
                      onChange={(e) => setFormData({ ...formData, shippingUK: parseNum(e.target.value, 0) as number })}
                      className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg text-xs font-bold"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 3 (Physical): Warehouse Inventory */}
          {isPhysical && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border/40 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-foreground flex items-center gap-2 border-b border-border/30 pb-3">
                <Package size={18} className="text-blue-600" />
                <span>Warehouse Stock & Inventory</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Available Stock (Units) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={safeNum(formData.stock, '')}
                    onChange={(e) => setFormData({ ...formData, stock: parseNum(e.target.value, 0) as number })}
                    className="w-full px-4 py-3 bg-secondary/30 border border-border/60 rounded-xl text-lg font-black focus:outline-none"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Decrements automatically upon checkout order completion.</p>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  (formData.stock || 0) <= 0 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-700' 
                    : (formData.stock || 0) < 15 
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-700' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700'
                }`}>
                  <p className="text-xs font-extrabold">Inventory Status</p>
                  <p className="text-xs mt-1">
                    {(formData.stock || 0) <= 0 
                      ? 'Out of Stock — customers will see unavailable notice.'
                      : (formData.stock || 0) < 15 
                        ? `Low Stock Warning (${formData.stock} units remaining).`
                        : `Healthy Stock (${formData.stock} units ready for fulfillment).`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Card 3 (Digital eBook): PDF Document & Reader */}
          {!isPhysical && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-rose-500/20 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-foreground">
                      Digital eBook PDF Document & Reader
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      Upload the complete eBook PDF file for crisp, responsive web reader viewing.
                    </p>
                  </div>
                </div>

                {formData.slug && (
                  <Link
                    href={`/dashboard/library/${formData.slug}/read`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-sm hover:bg-rose-700 transition shrink-0"
                  >
                    <Eye size={13} />
                    <span>Open Reader ↗</span>
                  </Link>
                )}
              </div>

              {formData.pdfUrl ? (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                        PDF eBook Configured & Ready
                      </span>
                      <p className="text-xs font-mono font-bold text-foreground truncate max-w-md mt-0.5">
                        {formData.pdfUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={formData.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 hover:bg-rose-200 transition"
                    >
                      <ExternalLink size={13} />
                      <span>View PDF</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, pdfUrl: '' })}
                      className="px-3 py-2 rounded-xl bg-secondary hover:bg-rose-500/10 hover:text-rose-600 text-foreground font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Upload PDF File */}
              <div className="p-6 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border-2 border-dashed border-rose-300 dark:border-rose-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Upload size={15} className="text-rose-600" />
                      <span>Upload eBook PDF (.pdf)</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Supports PDF files up to 200MB. Cloud Reader will stream this PDF for users.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleInlinePdfUpload}
                    disabled={uploadingPdf || !pdfFile}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shrink-0 transition"
                  >
                    {uploadingPdf ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Uploading PDF...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Upload PDF</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-700 cursor-pointer"
                />

                <div className="pt-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                    Or Direct PDF URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://... or /uploads/books/file.pdf"
                    value={formData.pdfUrl || ''}
                    onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-xs font-mono font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Total Pages & Reader Route */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Estimated Total Pages
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={safeNum(formData.totalPages, 1)}
                    onChange={(e) => setFormData({ ...formData, totalPages: parseNum(e.target.value, 1) as number })}
                    className="w-full px-4 py-2.5 bg-secondary/30 border border-border/60 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-secondary/40 border border-border/40 flex flex-col justify-center">
                  <p className="text-xs font-bold text-foreground">Cloud Reader Route</p>
                  <p className="text-xs font-mono text-rose-600 mt-0.5 truncate">
                    /dashboard/library/{formData.slug || 'gigi-the-book'}/read
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Cover Artwork & Publishing */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          {/* Card: Cover Image */}
          <div className="glass-card p-6 rounded-3xl border border-border/40 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-foreground">Cover Artwork</h3>

            <ImageUploader
              label={isPhysical ? 'Physical Book Cover' : 'eBook Cover'}
              onUpload={(url) => setFormData({ ...formData, imageUrl: url })}
              value={formData.imageUrl}
              folder="shop"
            />

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Or Direct Image URL</label>
              <input
                type="url"
                value={formData.imageUrl || ''}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/cover.png"
                className="w-full px-3 py-2 bg-secondary/30 border border-border/60 rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Card: Publication Status & Quick Info */}
          <div className="glass-card p-6 rounded-3xl border border-border/40 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-foreground">Visibility & Store Status</h3>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border/40">
              <div>
                <p className="text-xs font-bold text-foreground">Published in Store</p>
                <p className="text-[10px] text-muted-foreground">Make product visible to customers</p>
              </div>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
                  formData.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'
                }`}
              >
                <span className={`block w-6 h-6 rounded-full bg-white shadow-sm transform transition ${
                  formData.isActive ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="pt-2 border-t border-border/30">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-2xl font-bold text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                <span>{bookId ? 'Save Changes' : 'Create Product'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
