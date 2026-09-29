'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, Eye, Plus, TrendingUp, Loader2, ArrowUpRight,
  CheckCircle2, Trash2, Edit, Package, DollarSign, Upload,
  BookOpen, KeyRound, Mail, RefreshCw, AlertCircle, ShieldCheck
} from 'lucide-react';
import { ShopService, Book } from '@/services/shop.service';
import { toast } from 'react-hot-toast';

export default function BookManagement() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'etsy'>('catalog');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // EPUB Upload Modal
  const [showEpubModal, setShowEpubModal] = useState(false);
  const [epubFile, setEpubFile] = useState<File | null>(null);
  const [epubSlug, setEpubSlug] = useState('gigi-the-book');
  const [uploadingEpub, setUploadingEpub] = useState(false);

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

  const handleEpubUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epubFile) {
      toast.error('Please select an .epub file');
      return;
    }

    setUploadingEpub(true);
    try {
      await ShopService.adminUploadEpub(epubFile, epubSlug);
      toast.success('EPUB parsed & eBook chapters updated successfully! 🎉');
      setShowEpubModal(false);
      setEpubFile(null);
      loadBooks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload EPUB');
    } finally {
      setUploadingEpub(false);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Admin Header */}
      <div className="admin-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Book <span className="text-primary">Management & Orders</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage physical inventory, EPUB digital chapters, and Etsy marketplace claims
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEpubModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-50 text-purple-700 font-bold border border-purple-200 hover:bg-purple-100 transition shadow-sm"
          >
            <Upload size={18} />
            <span>Upload EPUB</span>
          </button>
          <Link
            href="/admin/books/new"
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl p-1.5 bg-slate-100 dark:bg-zinc-800 w-fit gap-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'catalog' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          <Package size={16} />
          <span>Product Catalog ({books.length})</span>
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

      {/* Tab 1: Product Catalog */}
      {activeTab === 'catalog' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="glass-card rounded-[2.5rem] border-primary/5 overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-border/30 flex items-center justify-between bg-primary/5">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Package className="text-primary" size={24} />
                  Product List
                </h2>
                <span className="text-xs font-black bg-white/50 px-3 py-1 rounded-full border border-border shadow-sm uppercase tracking-widest text-muted-foreground">
                  {books.length} Items
                </span>
              </div>
              <div className="divide-y divide-border/30">
                {loading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto" size={32} />
                  </div>
                ) : books.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground font-bold">
                    Your catalog is empty. Add a product or upload an EPUB.
                  </div>
                ) : (
                  books.map((book) => (
                    <div key={book.id} className="p-6 flex items-center justify-between hover:bg-primary/[0.02] transition-all group">
                      <div className="flex items-center gap-6 min-w-0">
                        <div className="w-24 h-32 rounded-2xl overflow-hidden bg-secondary border border-border/50 flex-shrink-0 shadow-lg group-hover:rotate-2 transition-transform duration-500">
                          {book.imageUrl ? (
                            <img src={book.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 bg-gradient-to-br from-secondary to-border">
                              <ShoppingBag size={32} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-2xl line-clamp-1 group-hover:text-primary transition-colors tracking-tight">{book.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 font-medium leading-relaxed max-w-xl">
                            {book.description}
                          </p>
                          <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center gap-2 text-foreground font-black">
                              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <DollarSign size={14} />
                              </div>
                              <span>₹{book.price}</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground font-black">
                              <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <Package size={14} />
                              </div>
                              <span className={book.stock < 10 ? 'text-rose-500' : ''}>{book.stock} in Stock</span>
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
              <h3 className="text-xl font-black">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowEpubModal(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition"
                >
                  <Upload size={16} /> Upload EPUB File
                </button>
                <Link
                  href="/dashboard/library/gigi-the-book/read"
                  target="_blank"
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-black transition"
                >
                  <Eye size={16} /> Preview Cloud Reader &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Etsy Marketplace Claims */
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

      {/* EPUB Upload Modal */}
      {showEpubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white text-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Upload EPUB eBook</h3>
                  <p className="text-xs text-slate-500">Auto-parse chapters & HTML content</p>
                </div>
              </div>
              <button onClick={() => setShowEpubModal(false)} className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleEpubUpload} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Target Book Slug</label>
                <input
                  type="text"
                  value={epubSlug}
                  onChange={(e) => setEpubSlug(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Select .EPUB File</label>
                <input
                  type="file"
                  accept=".epub"
                  onChange={(e) => setEpubFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700"
                  required
                />
                <p className="text-[11px] text-slate-400">
                  The parser will unpack the EPUB, extract TOC, spine, and all chapters into the database.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEpubModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingEpub || !epubFile}
                  className="w-1/2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploadingEpub ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Parsing EPUB...
                    </>
                  ) : (
                    'Upload & Parse'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
