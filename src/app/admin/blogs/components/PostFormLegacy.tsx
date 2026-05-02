'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Image as ImageIcon, Loader2, Globe, Lock, Clock, Tag, User } from 'lucide-react';
import { blogService } from '@/services/blog.service';

interface PostFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function PostForm({ initialData, isEditing }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authors, setAuthors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    thumbnailUrl: '',
    authorId: '',
    categoryIds: [] as string[],
    isPublished: false,
    readTime: 5,
    tags: [] as string[],
  });

  useEffect(() => {
    loadMetadata();
    if (initialData) {
      setFormData({
        ...initialData,
        authorId: initialData.authorId || '',
        categoryIds: initialData.categories?.map((c: any) => c.id) || [],
      });
    }
  }, [initialData]);

  const loadMetadata = async () => {
    try {
      const [authorsData, categoriesData] = await Promise.all([
        blogService.getAuthors(),
        blogService.getCategories(),
      ]) as [any, any];
      setAuthors(authorsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load metadata:', error);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData({ 
      ...formData, 
      title, 
      slug: isEditing ? formData.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const res = await blogService.uploadImage(file);
      setFormData({ ...formData, thumbnailUrl: res.url });
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await blogService.updatePost(initialData.id, formData);
      } else {
        await blogService.createPost(formData);
      }
      router.push('/admin/blogs');
      router.refresh();
    } catch (error) {
      alert('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          {isEditing ? 'Edit Article' : 'Compose New Article'}
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:bg-secondary/50 transition-all font-bold text-sm"
          >
            <X size={18} /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-8 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{isEditing ? 'Update Post' : 'Publish Article'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem] border-primary/5 space-y-6 shadow-xl">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Article Title</label>
              <input
                type="text"
                required
                className="w-full bg-secondary/30 border-none rounded-2xl py-4 px-6 text-xl font-extrabold focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/40"
                placeholder="Enter a catchy title..."
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">URL Slug</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  required
                  className="w-full bg-secondary/30 border-none rounded-2xl py-3 pl-12 pr-6 font-mono text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Summary</label>
              <textarea
                className="w-full bg-secondary/30 border-none rounded-2xl py-4 px-6 min-h-[100px] focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none font-medium"
                placeholder="Briefly describe what this article is about..."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Content</label>
              <textarea
                required
                className="w-full bg-secondary/30 border-none rounded-[2rem] py-6 px-8 min-h-[400px] focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y font-medium leading-relaxed"
                placeholder="Write your article content here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Status & Publication */}
          <div className="glass-card p-6 rounded-[2rem] border-primary/5 space-y-4 shadow-lg">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Lock size={16} /> Publication
            </h3>
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-transparent hover:border-primary/10 transition-all cursor-pointer" onClick={() => setFormData({...formData, isPublished: !formData.isPublished})}>
              <span className="font-bold">Publicly Published</span>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.isPublished ? 'bg-primary' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${formData.isPublished ? 'translate-x-6' : ''}`} />
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl">
              <Clock size={18} className="text-primary" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estimated Read Time</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    className="bg-transparent border-none p-0 w-10 font-black text-lg outline-none" 
                    value={formData.readTime}
                    onChange={(e) => setFormData({...formData, readTime: parseInt(e.target.value)})}
                  />
                  <span className="text-sm font-bold text-muted-foreground">minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="glass-card p-6 rounded-[2rem] border-primary/5 space-y-4 shadow-lg">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <ImageIcon size={16} /> Featured Image
            </h3>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-secondary/50 border-2 border-dashed border-border/50 group">
              {formData.thumbnailUrl ? (
                <>
                  <img src={formData.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-xl font-bold text-sm">Change Image</label>
                  </div>
                </>
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors">
                  <ImageIcon size={32} className="text-muted-foreground/40 mb-2" />
                  <span className="text-sm font-bold text-muted-foreground/60">Upload Thumbnail</span>
                </label>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
          </div>

          {/* Categorization */}
          <div className="glass-card p-6 rounded-[2rem] border-primary/5 space-y-4 shadow-lg">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Tag size={16} /> Categorization
            </h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Author</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <select
                    className="w-full bg-secondary/30 border-none rounded-2xl py-3 pl-12 pr-6 font-bold text-sm outline-none appearance-none focus:ring-2 focus:ring-primary/20"
                    value={formData.authorId}
                    onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                  >
                    <option value="">Select Author</option>
                    {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        const exists = formData.categoryIds.includes(cat.id);
                        setFormData({
                          ...formData,
                          categoryIds: exists 
                            ? formData.categoryIds.filter(id => id !== cat.id)
                            : [...formData.categoryIds, cat.id]
                        });
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        formData.categoryIds.includes(cat.id)
                          ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                          : 'bg-secondary/50 text-muted-foreground border-transparent hover:border-primary/20'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
