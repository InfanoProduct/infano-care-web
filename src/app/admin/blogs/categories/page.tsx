'use client';

import { useState, useEffect } from 'react';
import { Plus, Tag, Hash, Loader2, Edit, Trash2, Globe, X } from 'lucide-react';
import { blogService } from '@/services/blog.service';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await blogService.getCategories() as any;
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    setNewCategory({
      ...newCategory,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    });
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await blogService.updateCategory(editingId, newCategory);
      } else {
        await blogService.createCategory(newCategory);
      }
      setIsAdding(false);
      setEditingId(null);
      setNewCategory({ name: '', slug: '', description: '' });
      loadCategories();
    } catch (error) {
      alert(editingId ? 'Failed to update category' : 'Failed to create category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (cat: any) => {
    setNewCategory({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || ''
    });
    setEditingId(cat.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All posts in this category will be uncategorized.')) return;
    try {
      await blogService.deleteCategory(id);
      loadCategories();
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="admin-header flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Blog Categories</h1>
          <p className="text-muted-foreground mt-1">Organize your content into meaningful sections</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            if (isAdding) {
              setEditingId(null);
              setNewCategory({ name: '', slug: '', description: '' });
            }
          }}
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg transition-all"
        >
          {isAdding ? 'Close Form' : <><Plus size={20} /> New Category</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateOrUpdate} className="glass-card p-8 rounded-[2.5rem] border-primary/10 shadow-2xl space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">{editingId ? 'Edit Category' : 'New Category'}</h2>
            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-muted-foreground hover:text-primary transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Category Name</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  required
                  className="w-full bg-secondary/30 border-none rounded-2xl py-4 pl-12 pr-6 font-bold text-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="e.g. Health & Wellness"
                  value={newCategory.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">URL Slug</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  required
                  className="w-full bg-secondary/30 border-none rounded-2xl py-4 pl-12 pr-6 font-mono text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Description (Optional)</label>
            <textarea
              className="w-full bg-secondary/30 border-none rounded-2xl py-4 px-6 font-medium min-h-[80px] focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              value={newCategory.description}
              onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
            />
          </div>
          <button type="submit" disabled={isSaving} className="btn-primary w-full py-4 rounded-2xl font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
            {isSaving && <Loader2 className="animate-spin" size={20} />}
            {editingId ? 'Update Category' : 'Create Category'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-24 text-center flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="font-bold text-muted-foreground">Mapping categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="glass-card p-6 rounded-3xl border-primary/5 hover:border-primary/20 transition-all group shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Hash size={24} />
                </div>
                <h3 className="text-xl font-black tracking-tight">{cat.name}</h3>
                <p className="text-xs font-mono text-muted-foreground mt-1">/{cat.slug}</p>
                <p className="text-xs text-muted-foreground mt-3 font-medium line-clamp-2 leading-relaxed">
                  {cat.description || 'No description provided.'}
                </p>
              </div>
              
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/30">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                  {cat._count?.posts || 0} Articles
                </p>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEdit(cat)}
                    className="p-2 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="col-span-full py-24 glass-card rounded-[2.5rem] border-dashed border-2 border-border/50 flex flex-col items-center justify-center opacity-40">
              <Tag size={64} className="mb-4" />
              <p className="text-xl font-black">No categories found</p>
              <p className="font-bold">Group your posts by creating a category</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
