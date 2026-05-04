'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, X, Image as ImageIcon, Package, DollarSign, 
  Type, AlignLeft, Loader2, CheckCircle2 
} from 'lucide-react';
import { ShopService, Book } from '@/services/shop.service';
import ImageUploader from '@/components/upload/ImageUploader';
import { toast } from 'react-hot-toast';

interface BookFormProps {
  bookId?: string;
}

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

  useEffect(() => {
    if (bookId) {
      loadBook();
    }
  }, [bookId]);

  const loadBook = async () => {
    try {
      const book = await ShopService.getBook(bookId!);
      setFormData(book);
    } catch (error) {
      console.error('Failed to load book:', error);
      toast.error('Failed to load book details');
      router.push('/admin/books');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (bookId) {
        await ShopService.adminUpdateBook(bookId, formData);
        toast.success('Book updated successfully');
      } else {
        await ShopService.adminCreateBook(formData);
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

  if (initialLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-bold text-muted-foreground">Retrieving product data...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight italic">
            {bookId ? 'Edit' : 'Add New'} <span className="text-primary">Product</span>
          </h1>
          <p className="text-muted-foreground mt-1">Configure your book details and inventory levels</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem] border-primary/5 shadow-2xl space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Product Title</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Type size={20} />
                </div>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Growing Up Honest"
                  className="w-full pl-14 pr-6 py-5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-lg italic"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Description</label>
              <div className="relative group">
                <div className="absolute top-5 left-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <AlignLeft size={20} />
                </div>
                <textarea
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell the readers what this book is about..."
                  className="w-full pl-14 pr-6 py-5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-base leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] border-primary/5 shadow-2xl grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Unit Price (₹)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <DollarSign size={20} />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full pl-14 pr-6 py-5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-black text-xl italic"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Inventory Level</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Package size={20} />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className="w-full pl-14 pr-6 py-5 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-black text-xl italic"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
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
                  <span className="text-sm font-black italic">Active Status</span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    {formData.isActive ? 'Visible in store' : 'Hidden from store'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-transparent border-primary/10 border space-y-4">
            <h4 className="text-sm font-black flex items-center gap-2 italic">
              <CheckCircle2 size={16} className="text-primary" />
              Publishing Checklist
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Accurate pricing', checked: formData.price! > 0 },
                { label: 'Cover image linked', checked: !!formData.imageUrl },
                { label: 'Stock level updated', checked: formData.stock! >= 0 },
                { label: 'Catchy description', checked: formData.description!.length > 20 },
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
