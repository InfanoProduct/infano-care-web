'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, Eye, Plus, TrendingUp, Loader2, ArrowUpRight,
  CheckCircle2, Trash2, Edit, Package, DollarSign
} from 'lucide-react';
import { ShopService, Book } from '@/services/shop.service';
import { toast } from 'react-hot-toast';

export default function BookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBooks(); }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await ShopService.adminGetBooks();
      setBooks(data);
    } catch { toast.error('Failed to load books'); }
    finally { setLoading(false); }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Delete this book? This will not affect existing orders.')) return;
    try {
      await ShopService.adminDeleteBook(id);
      toast.success('Book deleted');
      loadBooks();
    } catch { toast.error('Failed to delete book'); }
  };

  const toggleBookStatus = async (book: Book) => {
    try {
      await ShopService.adminUpdateBook(book.id, { isActive: !book.isActive });
      toast.success(`Book ${!book.isActive ? 'activated' : 'deactivated'}`);
      loadBooks();
    } catch { toast.error('Failed to update book status'); }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-bold text-muted-foreground">Loading catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="admin-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Book <span className="text-primary">Catalog</span></h1>
          <p className="text-muted-foreground mt-1">Manage your physical products and inventory</p>
        </div>
        <Link href="/admin/books/new" className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
          <Plus size={20} />
          <span>Add New Product</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Books list */}
        <div className="lg:col-span-3 space-y-8">
          {/* Books */}
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
              {books.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground font-bold">
                  Your catalog is empty. Time to publish your first book!
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
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border ${book.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${book.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        {book.isActive ? 'Active' : 'Draft'}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => toggleBookStatus(book)} title={book.isActive ? 'Deactivate' : 'Activate'}
                          className={`p-3 rounded-xl transition-all border shadow-sm ${book.isActive ? 'bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 border-amber-500/10' : 'bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 border-emerald-500/10'}`}>
                          {book.isActive ? <Eye size={18} /> : <CheckCircle2 size={18} />}
                        </button>
                        <Link href={`/admin/books/${book.id}/edit`} className="p-3 bg-secondary/50 rounded-xl hover:bg-primary/10 hover:text-primary transition-all border border-border/50 shadow-sm">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => handleDeleteBook(book.id)} className="p-3 bg-secondary/50 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all border border-border/50 shadow-sm">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Snapshot */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black tracking-tight px-2">Snapshot</h2>
          <div className="glass-card p-8 rounded-[2.5rem] border-primary/5 space-y-8 shadow-2xl relative overflow-hidden">
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Total Inventory</p>
                  <p className="text-4xl font-black">{books.reduce((acc, b) => acc + b.stock, 0)}</p>
                </div>
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30">
                  <Package size={28} />
                </div>
              </div>

              <div className="pt-6 border-t border-border/30">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4">Stock Distribution</p>
                <div className="space-y-4">
                  {books.length > 0 ? books.slice(0, 3).map(book => (
                    <div key={book.id} className="space-y-2">
                      <div className="flex justify-between text-xs font-black">
                        <span className="truncate pr-4">{book.title}</span>
                        <span>{book.stock}</span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.min(100, (book.stock / 200) * 100)}%` }} />
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs font-bold text-muted-foreground">No products yet</p>
                  )}
                </div>
              </div>

              <div className="bg-secondary/50 p-6 rounded-3xl border border-border/50">
                <h4 className="text-sm font-black mb-2 flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" />
                  Quick Tip
                </h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Promo codes can now be managed directly from the product creation page! Go ahead and add one!
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <Package size={200} />
            </div>
          </div>

          <Link href="/admin/orders" className="glass-card p-6 rounded-[2rem] border-primary/5 hover:border-primary/20 transition-all group flex items-center justify-between shadow-lg bg-gradient-to-br from-white to-secondary/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <ShoppingBag size={20} />
              </div>
              <span className="font-extrabold">Recent Orders</span>
            </div>
            <ArrowUpRight className="text-muted-foreground group-hover:text-primary transition-colors" size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
