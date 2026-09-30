'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, Eye, Plus, TrendingUp, Loader2, ArrowUpRight,
  CheckCircle2, Trash2, Edit, Package, DollarSign, Upload,
  BookOpen, KeyRound, Mail, RefreshCw, AlertCircle, ShieldCheck,
  Truck, Sparkles, Box, ExternalLink
} from 'lucide-react';
import { ShopService, Book } from '@/services/shop.service';
import { toast } from 'react-hot-toast';

export default function BookManagement() {
  const [activeTab, setActiveTab] = useState<'ebooks' | 'physical' | 'etsy'>('ebooks');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Etsy Orders Management
  const [etsyOrders, setEtsyOrders] = useState<any[]>([]);
  const [etsyLoading, setEtsyLoading] = useState(false);
  const [etsySearch, setEtsySearch] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
    loadEtsyOrders();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await ShopService.adminGetBooks();
      setBooks(data);
    } catch {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const loadEtsyOrders = async () => {
    setEtsyLoading(true);
    try {
      const res = await ShopService.adminGetEtsyOrders({ search: etsySearch });
      setEtsyOrders(res.data || []);
    } catch {
      toast.error('Failed to load Etsy orders');
    } finally {
      setEtsyLoading(false);
    }
  };

  const handleResendEtsyEmail = async (receiptId: string) => {
    setActionInProgress(receiptId);
    try {
      await ShopService.adminResendEtsyEmail(receiptId);
      toast.success(`Access code email resent for order #${receiptId}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend email');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Delete this book? This will not affect existing orders.')) return;
    try {
      await ShopService.adminDeleteBook(id);
      toast.success('Book deleted');
      loadBooks();
    } catch {
      toast.error('Failed to delete book');
    }
  };

  const toggleBookStatus = async (book: Book) => {
    try {
      await ShopService.adminUpdateBook(book.id, { isActive: !book.isActive });
      toast.success(`Book ${!book.isActive ? 'activated' : 'deactivated'}`);
      loadBooks();
    } catch {
      toast.error('Failed to update book status');
    }
  };

  const ebooksList = books.filter(b => b.format === 'DIGITAL_EBOOK' || (!b.format && (b.stock === undefined || b.stock >= 900000 || b.slug)));
  const physicalBooksList = books.filter(b => b.format === 'PHYSICAL_BOOK' || (!b.format && b.stock !== undefined && b.stock < 900000 && !b.slug));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Admin Header */}
      <div className="admin-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Book <span className="text-primary">Management & Orders</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage physical inventory, digital EPUB reader content, and Etsy marketplace claims
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/books/new"
            className="btn-primary flex items-center gap-2 px-6 py-3.5 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 text-sm font-bold"
          >
            <Plus size={20} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap rounded-2xl p-1.5 bg-slate-100 dark:bg-zinc-800 w-fit gap-2">
        <button
          onClick={() => setActiveTab('ebooks')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'ebooks' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          <BookOpen size={16} />
          <span>Digital eBooks ({ebooksList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('physical')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'physical' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          <Package size={16} />
          <span>Physical Books ({physicalBooksList.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('etsy'); loadEtsyOrders(); }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'etsy' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          <KeyRound size={16} />
          <span>Etsy Marketplace Claims ({etsyOrders.length})</span>
        </button>
      </div>

      {/* Tab 1: Digital eBooks */}
      {activeTab === 'ebooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="glass-card rounded-[2.5rem] border-primary/5 overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-border/30 flex items-center justify-between bg-primary/5">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <BookOpen className="text-primary" size={24} />
                  Digital Interactive eBooks
                </h2>
                <span className="text-xs font-black bg-white/50 px-3 py-1 rounded-full border border-border shadow-sm uppercase tracking-widest text-muted-foreground">
                  {ebooksList.length} eBooks
                </span>
              </div>
              <div className="divide-y divide-border/30">
                {loading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto" size={32} />
                  </div>
                ) : ebooksList.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground font-bold">
                    No digital eBooks found. Upload an EPUB or add an eBook.
                  </div>
                ) : (
                  ebooksList.map((book) => (
                    <div key={book.id} className="p-6 flex items-center justify-between hover:bg-primary/[0.02] transition-all group">
                      <div className="flex items-center gap-6 min-w-0">
                        <div className="w-24 h-32 rounded-2xl overflow-hidden bg-secondary border border-border/50 flex-shrink-0 shadow-lg group-hover:rotate-2 transition-transform duration-500">
                          {book.imageUrl ? (
                            <img src={book.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 bg-gradient-to-br from-secondary to-border">
                              <BookOpen size={32} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-2xl line-clamp-1 group-hover:text-primary transition-colors tracking-tight">{book.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 font-medium leading-relaxed max-w-xl">
                            {book.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 mt-4">
                            <div className="flex items-center gap-1.5 text-foreground font-black text-sm">
                              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <DollarSign size={14} />
                              </div>
                              <span>₹{book.price}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
                              <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                                <BookOpen size={14} />
                              </div>
                              <span>{book.totalPages || 1} Pages (Cloud EPUB)</span>
                            </div>
                            {book.slug && (
                              <Link
                                href={`/dashboard/library/${book.slug}/read`}
                                target="_blank"
                                className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 transition"
                              >
                                <Eye size={12} />
                                <span>Preview Cloud Reader</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-4 ml-6">
                        <button
                          onClick={() => toggleBookStatus(book)}
                          className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border ${
                            book.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          }`}
                        >
                          <CheckCircle2 size={12} />
                          {book.isActive ? 'Published' : 'Draft'}
                        </button>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/books/${book.id}`} className="p-3 bg-secondary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm">
                            <Edit size={16} />
                          </Link>
                          <button onClick={() => handleDeleteBook(book.id)} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass-card rounded-[2.5rem] p-8 border-primary/5 space-y-6 shadow-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent">
              <h3 className="text-xl font-black">Digital Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/admin/books/new"
                  className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition"
                >
                  <Plus size={16} /> Add Digital eBook Product
                </Link>
                <Link
                  href="/dashboard/library/gigi-the-book/read"
                  target="_blank"
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-black transition"
                >
                  <Eye size={16} /> Open Cloud Reader &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Physical Books */}
      {activeTab === 'physical' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="glass-card rounded-[2.5rem] border-primary/5 overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-border/30 flex items-center justify-between bg-primary/5">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Package className="text-primary" size={24} />
                  Physical Books & Inventory
                </h2>
                <span className="text-xs font-black bg-white/50 px-3 py-1 rounded-full border border-border shadow-sm uppercase tracking-widest text-muted-foreground">
                  {physicalBooksList.length} Items
                </span>
              </div>
              <div className="divide-y divide-border/30">
                {loading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto" size={32} />
                  </div>
                ) : physicalBooksList.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground font-bold">
                    No physical book catalog items found. Click &ldquo;Add New Book&rdquo; and choose Physical Book.
                  </div>
                ) : (
                  physicalBooksList.map((book) => (
                    <div key={book.id} className="p-6 flex items-center justify-between hover:bg-primary/[0.02] transition-all group">
                      <div className="flex items-center gap-6 min-w-0">
                        <div className="w-24 h-32 rounded-2xl overflow-hidden bg-secondary border border-border/50 flex-shrink-0 shadow-lg group-hover:rotate-2 transition-transform duration-500">
                          {book.imageUrl ? (
                            <img src={book.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 bg-gradient-to-br from-secondary to-border">
                              <Package size={32} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-2xl line-clamp-1 group-hover:text-primary transition-colors tracking-tight">{book.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 font-medium leading-relaxed max-w-xl">
                            {book.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 mt-4">
                            <div className="flex items-center gap-1.5 text-foreground font-black text-sm">
                              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <DollarSign size={14} />
                              </div>
                              <span>₹{book.price}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
                              <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <Package size={14} />
                              </div>
                              <span className={book.stock < 15 ? 'text-rose-500 font-extrabold' : ''}>
                                {book.stock} in Stock
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground font-medium text-xs">
                              <Truck size={14} className="text-primary" />
                              <span>Ship: ₹{book.shippingIN || 0} (IN) / ${book.shippingUS || 0} (US)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-4 ml-6">
                        <button
                          onClick={() => toggleBookStatus(book)}
                          className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border ${
                            book.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          }`}
                        >
                          <CheckCircle2 size={12} />
                          {book.isActive ? 'Active' : 'Draft'}
                        </button>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/books/${book.id}`} className="p-3 bg-secondary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm">
                            <Edit size={16} />
                          </Link>
                          <button onClick={() => handleDeleteBook(book.id)} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass-card rounded-[2.5rem] p-8 border-primary/5 space-y-6 shadow-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent">
              <h3 className="text-xl font-black">Fulfillment Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/admin/orders"
                  className="w-full py-3.5 px-4 rounded-2xl bg-primary text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition"
                >
                  <Truck size={16} /> View Order Dispatches &rarr;
                </Link>
                <Link
                  href="/admin/books/new"
                  className="w-full py-3.5 px-4 rounded-2xl bg-secondary text-foreground font-bold text-xs flex items-center justify-center gap-2 hover:bg-secondary/80 transition"
                >
                  <Plus size={16} /> Add Physical Stock Item
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Etsy Marketplace Claims */}
      {activeTab === 'etsy' && (
        <div className="glass-card rounded-[2.5rem] border-primary/5 overflow-hidden shadow-2xl space-y-6 p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <KeyRound size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Etsy Orders & User Claims</h2>
                <p className="text-xs text-muted-foreground">Monitor purchases, buyer emails, and digital eBook claims</p>
              </div>
            </div>
            <button
              onClick={loadEtsyOrders}
              className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 font-bold text-xs flex items-center gap-2 transition"
            >
              <RefreshCw size={14} className={etsyLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-primary/5 border-b border-border/40 font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">Receipt ID</th>
                  <th className="p-4">Buyer Details</th>
                  <th className="p-4">Listing / Item</th>
                  <th className="p-4">Claim Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-medium">
                {etsyLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <Loader2 className="animate-spin text-primary mx-auto" size={24} />
                    </td>
                  </tr>
                ) : etsyOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No Etsy orders found yet.
                    </td>
                  </tr>
                ) : (
                  etsyOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-primary/[0.02] transition">
                      <td className="p-4 font-mono font-bold text-purple-700">
                        #{order.receiptId}
                      </td>
                      <td className="p-4 space-y-0.5">
                        <p className="font-bold text-foreground">{order.buyerName || 'Valued Buyer'}</p>
                        <p className="text-muted-foreground text-[11px]">{order.buyerEmail || 'No email captured'}</p>
                      </td>
                      <td className="p-4 font-medium">
                        {order.bookSlug || 'gigi-the-book'}
                      </td>
                      <td className="p-4">
                        {order.isClaimed ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px] inline-flex items-center gap-1 border border-emerald-500/20">
                            <ShieldCheck size={12} /> Claimed ({order.claimedUser?.phone || 'User'})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 font-bold text-[10px] inline-flex items-center gap-1 border border-amber-500/20">
                            Unclaimed
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleResendEtsyEmail(order.receiptId)}
                          disabled={actionInProgress === order.receiptId || !order.buyerEmail}
                          className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-purple-50 hover:text-purple-700 font-bold text-[11px] transition inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          <Mail size={12} />
                          <span>Resend Email</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
