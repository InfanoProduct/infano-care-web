'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen, Package, KeyRound, Plus, Search, Filter,
  DollarSign, Eye, Edit, Trash2, CheckCircle2, XCircle,
  Truck, Sparkles, RefreshCw, Loader2, ArrowUpRight,
  TrendingUp, AlertCircle, ShieldCheck, Mail, LayoutGrid,
  List, ExternalLink, Tag
} from 'lucide-react';
import { ShopService, Book } from '@/services/shop.service';
import { toast } from 'react-hot-toast';

export default function BookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'catalog' | 'etsy'>('catalog');
  const [formatFilter, setFormatFilter] = useState<'ALL' | 'DIGITAL_EBOOK' | 'PHYSICAL_BOOK'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

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

  const handleDeleteBook = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will not affect existing customer orders.`)) return;
    try {
      await ShopService.adminDeleteBook(id);
      toast.success('Book deleted successfully');
      loadBooks();
    } catch {
      toast.error('Failed to delete book');
    }
  };

  const toggleBookStatus = async (book: Book) => {
    try {
      await ShopService.adminUpdateBook(book.id, { isActive: !book.isActive });
      toast.success(`"${book.title}" is now ${!book.isActive ? 'Published' : 'set to Draft'}`);
      loadBooks();
    } catch {
      toast.error('Failed to update book status');
    }
  };

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const isDigital = book.format === 'DIGITAL_EBOOK' || (!book.format && (book.stock === undefined || book.stock >= 900000 || book.slug));
      const isPhysical = book.format === 'PHYSICAL_BOOK' || (!book.format && book.stock !== undefined && book.stock < 900000 && !book.slug);

      // Format filter
      if (formatFilter === 'DIGITAL_EBOOK' && !isDigital) return false;
      if (formatFilter === 'PHYSICAL_BOOK' && !isPhysical) return false;

      // Status filter
      if (statusFilter === 'ACTIVE' && !book.isActive) return false;
      if (statusFilter === 'DRAFT' && book.isActive) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = book.title?.toLowerCase().includes(q);
        const matchesAuthor = book.author?.toLowerCase().includes(q);
        const matchesSlug = book.slug?.toLowerCase().includes(q);
        const matchesDesc = book.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor && !matchesSlug && !matchesDesc) return false;
      }

      return true;
    });
  }, [books, formatFilter, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = books.length;
    const digitalCount = books.filter(b => b.format === 'DIGITAL_EBOOK' || (!b.format && (b.stock === undefined || b.stock >= 900000 || b.slug))).length;
    const physicalCount = books.filter(b => b.format === 'PHYSICAL_BOOK' || (!b.format && b.stock !== undefined && b.stock < 900000 && !b.slug)).length;
    const activeCount = books.filter(b => b.isActive).length;
    const totalPhysicalStock = books
      .filter(b => b.format === 'PHYSICAL_BOOK' || (!b.format && b.stock !== undefined && b.stock < 900000 && !b.slug))
      .reduce((sum, b) => sum + (b.stock || 0), 0);

    return { total, digitalCount, physicalCount, activeCount, totalPhysicalStock };
  }, [books]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            <span>Book Catalog & Inventory</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage physical book copies, interactive digital eBooks, and marketplace claim codes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { loadBooks(); loadEtsyOrders(); }}
            className="p-3 bg-secondary hover:bg-secondary/80 rounded-2xl transition text-foreground"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading || etsyLoading ? 'animate-spin' : ''} />
          </button>

          <Link
            href="/admin/books/new"
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg shadow-primary/25 font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={18} />
            <span>Add Book / Product</span>
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-border/40 shadow-sm flex items-center gap-4 group hover:border-primary/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Total Products</p>
            <p className="text-2xl sm:text-3xl font-black text-foreground mt-0.5">{stats.total}</p>
          </div>
        </div>

        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-border/40 shadow-sm flex items-center gap-4 group hover:border-purple-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Digital eBooks</p>
            <p className="text-2xl sm:text-3xl font-black text-foreground mt-0.5">{stats.digitalCount}</p>
          </div>
        </div>

        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-border/40 shadow-sm flex items-center gap-4 group hover:border-blue-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Physical Stock</p>
            <p className="text-2xl sm:text-3xl font-black text-foreground mt-0.5">
              {stats.totalPhysicalStock} <span className="text-xs text-muted-foreground font-semibold">units</span>
            </p>
          </div>
        </div>

        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-border/40 shadow-sm flex items-center gap-4 group hover:border-emerald-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Live / Published</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-0.5">{stats.activeCount}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border/40 gap-8">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'catalog'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen size={16} />
          <span>Product Catalog ({books.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('etsy'); loadEtsyOrders(); }}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'etsy'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <KeyRound size={16} />
          <span>Etsy Claims & Access Codes ({etsyOrders.length})</span>
        </button>
      </div>

      {/* CATALOG TAB */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Controls Bar (Search + Filter + View Toggle) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/30 p-4 rounded-2xl border border-border/40">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title, author, slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border/60 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Format Filter */}
              <div className="flex items-center rounded-xl bg-background border border-border/60 p-1 text-xs font-bold">
                <button
                  onClick={() => setFormatFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    formatFilter === 'ALL' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({books.length})
                </button>
                <button
                  onClick={() => setFormatFilter('DIGITAL_EBOOK')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    formatFilter === 'DIGITAL_EBOOK' ? 'bg-purple-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sparkles size={12} />
                  <span>eBooks ({stats.digitalCount})</span>
                </button>
                <button
                  onClick={() => setFormatFilter('PHYSICAL_BOOK')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    formatFilter === 'PHYSICAL_BOOK' ? 'bg-blue-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Package size={12} />
                  <span>Physical ({stats.physicalCount})</span>
                </button>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                aria-label="Filter products by publication status"
                className="px-3 py-2 bg-background border border-border/60 rounded-xl text-xs font-bold text-foreground focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Published Only</option>
                <option value="DRAFT">Draft Only</option>
              </select>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center rounded-xl bg-background border border-border/60 p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'table' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Table View"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Grid Card View"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Catalog Body */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader2 className="animate-spin text-primary" size={36} />
              <p className="font-bold text-sm">Loading book catalog...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="glass-card py-16 px-6 rounded-3xl border border-dashed border-border/60 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-secondary mx-auto flex items-center justify-center text-muted-foreground">
                <BookOpen size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">No books matching your criteria</h3>
                <p className="text-xs text-muted-foreground mt-1">Try resetting your search query or format filter</p>
              </div>
              <Link
                href="/admin/books/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md"
              >
                <Plus size={14} /> Add New Product
              </Link>
            </div>
          ) : viewMode === 'table' ? (
            /* TABLE VIEW */
            <div className="glass-card rounded-3xl border border-border/40 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/50 border-b border-border/40 font-bold uppercase text-muted-foreground">
                    <tr>
                      <th className="p-4 pl-6">Product Details</th>
                      <th className="p-4">Type / Format</th>
                      <th className="p-4">Pricing</th>
                      <th className="p-4">Inventory / Pages</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 font-medium">
                    {filteredBooks.map((book) => {
                      const isEbook = book.format === 'DIGITAL_EBOOK' || (!book.format && (book.stock === undefined || book.stock >= 900000 || book.slug));
                      return (
                        <tr key={book.id} className="hover:bg-primary/[0.02] transition group">
                          {/* Details Column */}
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-18 rounded-xl overflow-hidden bg-secondary border border-border/50 shrink-0 shadow-sm">
                                {book.imageUrl ? (
                                  <img src={book.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 bg-gradient-to-br from-secondary to-border">
                                    <BookOpen size={20} />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 max-w-sm">
                                <p className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                                  {book.title}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  By {book.author || 'Infano Care'}
                                </p>
                                {book.slug && (
                                  <span className="inline-block font-mono text-[10px] text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded mt-1">
                                    /{book.slug}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Format Column */}
                          <td className="p-4">
                            {isEbook ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[11px] font-bold border border-purple-500/20">
                                <Sparkles size={12} /> Digital eBook
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-500/20">
                                <Package size={12} /> Physical Book
                              </span>
                            )}
                          </td>

                          {/* Pricing Column */}
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <p className="font-extrabold text-sm text-foreground">₹{book.price}</p>
                              {(book.priceUS || book.priceUK) && (
                                <p className="text-[10px] text-muted-foreground">
                                  {book.priceUS ? `$${book.priceUS}` : ''} {book.priceUK ? `· £${book.priceUK}` : ''}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Inventory / Pages */}
                          <td className="p-4">
                            {isEbook ? (
                              <div className="space-y-1">
                                <span className="text-[11px] font-bold text-foreground block">
                                  {book.totalPages || 1} Pages
                                </span>
                                {book.slug && (
                                  <Link
                                    href={`/dashboard/library/${book.slug}/read`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:underline"
                                  >
                                    <Eye size={10} /> Test Reader
                                  </Link>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className={`text-[11px] font-bold block ${
                                  (book.stock || 0) < 15 ? 'text-rose-500' : 'text-foreground'
                                }`}>
                                  {book.stock || 0} in stock
                                </span>
                                <span className="text-[10px] text-muted-foreground block">
                                  Ship: ₹{book.shippingIN || 0}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Status Column */}
                          <td className="p-4">
                            <button
                              onClick={() => toggleBookStatus(book)}
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border transition ${
                                book.isActive
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${book.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {book.isActive ? 'Published' : 'Draft'}
                            </button>
                          </td>

                          {/* Actions Column */}
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/admin/books/${book.id}`}
                                className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-white transition shadow-sm"
                                title="Edit Book"
                              >
                                <Edit size={14} />
                              </Link>
                              <button
                                onClick={() => handleDeleteBook(book.id, book.title)}
                                className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition shadow-sm"
                                title="Delete Book"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* GRID CARD VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const isEbook = book.format === 'DIGITAL_EBOOK' || (!book.format && (book.stock === undefined || book.stock >= 900000 || book.slug));
                return (
                  <div
                    key={book.id}
                    className="glass-card rounded-3xl border border-border/40 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        {isEbook ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-500/20">
                            <Sparkles size={10} /> Digital eBook
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-500/20">
                            <Package size={10} /> Physical Book
                          </span>
                        )}

                        <button
                          onClick={() => toggleBookStatus(book)}
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border transition ${
                            book.isActive
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          }`}
                        >
                          {book.isActive ? 'Published' : 'Draft'}
                        </button>
                      </div>

                      {/* Cover & Main Info */}
                      <div className="flex gap-4 mb-4">
                        <div className="w-20 h-28 rounded-xl overflow-hidden bg-secondary border border-border/50 shrink-0 shadow-sm">
                          {book.imageUrl ? (
                            <img src={book.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                              <BookOpen size={24} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {book.title}
                          </h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5">By {book.author || 'Infano Care'}</p>
                          <p className="text-lg font-black text-foreground mt-2">₹{book.price}</p>
                          {isEbook ? (
                            <p className="text-[10px] text-muted-foreground font-semibold">{book.totalPages || 1} Pages (Reader)</p>
                          ) : (
                            <p className={`text-[10px] font-semibold ${(book.stock || 0) < 15 ? 'text-rose-500' : 'text-muted-foreground'}`}>
                              {book.stock || 0} Units in Stock
                            </p>
                          )}
                        </div>
                      </div>

                      {book.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 font-normal">
                          {book.description}
                        </p>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 border-t border-border/30 flex items-center justify-between gap-2">
                      {isEbook && book.slug ? (
                        <Link
                          href={`/dashboard/library/${book.slug}/read`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800 transition"
                        >
                          <Eye size={12} /> Preview Reader
                        </Link>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Ship: ₹{book.shippingIN || 0}</span>
                      )}

                      <div className="flex items-center gap-1.5 ml-auto">
                        <Link
                          href={`/admin/books/${book.id}`}
                          className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-white transition shadow-sm"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDeleteBook(book.id, book.title)}
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition shadow-sm"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ETSY CLAIMS TAB */}
      {activeTab === 'etsy' && (
        <div className="glass-card rounded-3xl border border-border/40 overflow-hidden shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <KeyRound className="text-primary" size={20} />
                <span>Etsy Marketplace Orders & Access Claims</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically captured Etsy orders synced via webhook/cron for eBook reader activation.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search receipt / email..."
                  value={etsySearch}
                  onChange={(e) => setEtsySearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadEtsyOrders()}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border/60 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <button
                onClick={loadEtsyOrders}
                className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
              >
                <RefreshCw size={13} className={etsyLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/50 border-b border-border/40 font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="p-4 pl-6">Receipt #</th>
                  <th className="p-4">Buyer Details</th>
                  <th className="p-4">Listing / Item</th>
                  <th className="p-4">Claim Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-medium">
                {etsyLoading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <Loader2 className="animate-spin text-primary mx-auto" size={24} />
                    </td>
                  </tr>
                ) : etsyOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                      No Etsy orders found matching your search.
                    </td>
                  </tr>
                ) : (
                  etsyOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-primary/[0.02] transition">
                      <td className="p-4 pl-6 font-mono font-bold text-purple-700 dark:text-purple-400">
                        #{order.receiptId}
                      </td>
                      <td className="p-4 space-y-0.5">
                        <p className="font-bold text-foreground">{order.buyerName || 'Valued Buyer'}</p>
                        <p className="text-muted-foreground text-[11px]">{order.buyerEmail || 'No email recorded'}</p>
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
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => handleResendEtsyEmail(order.receiptId)}
                          disabled={actionInProgress === order.receiptId || !order.buyerEmail}
                          className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-purple-50 hover:text-purple-700 font-bold text-[11px] transition inline-flex items-center gap-1.5 disabled:opacity-50"
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

