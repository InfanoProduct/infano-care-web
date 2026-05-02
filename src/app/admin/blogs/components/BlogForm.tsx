'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, X, Layout, Globe, FileText, Settings, 
  ChevronRight, Clock, User, Tag, Image as ImageIcon, Loader2, CheckCircle2,
  Share2, MousePointerClick, Trash2
} from 'lucide-react';
import { blogService } from '@/services/blog.service';
import Editor from '@/components/editor/Editor';
import ImageUploader from '@/components/upload/ImageUploader';

interface BlogFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function BlogForm({ initialData, isEditing }: BlogFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [isSaving, setIsSaving] = useState(false);
  const [authors, setAuthors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [ctas, setCtas] = useState<any[]>([]);

  const [postData, setPostData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    thumbnailUrl: '',
    authorId: '',
    categoryIds: [] as string[],
    ctaIds: [] as string[],
    tags: [] as string[],
    isPublished: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    readTime: 5,
  });

  useEffect(() => {
    loadMetadata();
    if (initialData) {
      setPostData({
        title: initialData.title || '',
        slug: initialData.slug || '',
        summary: initialData.summary || '',
        content: initialData.content || '',
        thumbnailUrl: initialData.thumbnailUrl || '',
        authorId: initialData.authorId || '',
        categoryIds: initialData.categories?.map((c: any) => c.id) || [],
        ctaIds: initialData.ctas?.map((c: any) => c.id) || [],
        tags: initialData.tags || [],
        isPublished: initialData.isPublished || false,
        seoTitle: initialData.seo?.metaTitle || '',
        seoDescription: initialData.seo?.metaDescription || '',
        seoKeywords: initialData.seo?.metaKeywords || '',
        readTime: initialData.readTime || 5,
      });
    }
  }, [initialData]);

  const loadMetadata = async () => {
    try {
      const [authorsData, categoriesData, ctasData] = await Promise.all([
        blogService.getAuthors(),
        blogService.getCategories(),
        blogService.getCTAs(),
      ]) as [any, any, any];
      setAuthors(authorsData);
      setCategories(categoriesData);
      setCtas(ctasData);
    } catch (error) {
      console.error('Failed to load form metadata:', error);
    }
  };

  const handleSave = async (published: boolean = postData.isPublished) => {
    setIsSaving(true);
    try {
      const payload = { 
        ...postData, 
        isPublished: published,
        seo: {
          metaTitle: postData.seoTitle,
          metaDescription: postData.seoDescription,
          metaKeywords: postData.seoKeywords,
        }
      };
      
      if (isEditing) {
        await blogService.updatePost(initialData.id, payload);
      } else {
        await blogService.createPost(payload);
      }
      
      router.push('/admin/blogs');
      router.refresh();
    } catch (error: any) {
      console.error('Failed to save post:', error);
      alert(error.message || 'Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this article? This action cannot be undone.')) return;
    setIsSaving(true);
    try {
      await blogService.deletePost(initialData.id);
      router.push('/admin/blogs');
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to delete post');
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlug = () => {
    if (isEditing && postData.slug) return;
    const slug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setPostData(prev => ({ ...prev, slug }));
  };

  const tabs = [
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'seo', label: 'SEO Config', icon: Globe },
    { id: 'settings', label: 'Post Settings', icon: Settings },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-primary/5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Layout size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{isEditing ? 'Edit Article' : 'New Article'}</h1>
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold">
              <span>Admin</span>
              <ChevronRight size={14} />
              <span>Blog</span>
              <ChevronRight size={14} />
              <span className="text-primary">{isEditing ? 'Update' : 'Compose'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isEditing && (
            <button 
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
              className="p-3 rounded-2xl text-destructive hover:bg-destructive/10 transition-all border border-transparent hover:border-destructive/20"
              title="Delete Article"
            >
              <Trash2 size={24} />
            </button>
          )}
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-2xl font-bold hover:bg-secondary transition-all"
          >
            Discard
          </button>
          <button 
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl font-bold bg-secondary text-primary hover:bg-primary/10 transition-all flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isEditing ? 'Save Changes' : 'Save Draft'}
          </button>
          <button 
            type="button"
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="btn-primary px-8 py-3 rounded-2xl font-black shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
            {postData.isPublished ? 'Update Live' : 'Publish Now'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="xl:col-span-2 space-y-8">
          {/* Tabs Navigation */}
          <div className="flex gap-2 p-1.5 bg-secondary/30 rounded-[2.5rem] w-fit border border-primary/5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-10 py-4 rounded-[2rem] font-black transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-primary shadow-xl' 
                    : 'text-muted-foreground hover:text-primary hover:bg-white/50'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'content' && (
            <div className="glass-card p-10 rounded-[3rem] border-primary/10 shadow-2xl space-y-8 animate-in fade-in duration-500">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Article Title</label>
                <input
                  required
                  className="w-full bg-secondary/30 border-none rounded-3xl py-6 px-10 text-3xl font-black placeholder:text-muted-foreground/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner"
                  placeholder="The headline that hooks readers..."
                  value={postData.title}
                  onChange={(e) => setPostData(prev => ({...prev, title: e.target.value}))}
                  onBlur={generateSlug}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Article Content</label>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-4 py-1.5 rounded-full border border-primary/10">Interactive Editor</span>
                </div>
                <Editor 
                  content={postData.content} 
                  onChange={(content) => setPostData(prev => ({...prev, content}))} 
                  ctas={ctas}
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Brief Excerpt</label>
                <textarea
                  className="w-full bg-secondary/30 border-none rounded-3xl py-6 px-10 font-medium min-h-[140px] focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none shadow-inner"
                  placeholder="A short snippet for social sharing and search results..."
                  value={postData.summary}
                  onChange={(e) => setPostData(prev => ({...prev, summary: e.target.value}))}
                />
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="glass-card p-10 rounded-[3rem] border-primary/10 shadow-2xl space-y-10 animate-in fade-in duration-500">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Search Engine Title</label>
                <input
                  className="w-full bg-secondary/30 border-none rounded-2xl py-5 px-8 font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  value={postData.seoTitle}
                  onChange={(e) => setPostData(prev => ({...prev, seoTitle: e.target.value}))}
                  placeholder={postData.title || "Target SEO headline"}
                />
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${postData.seoTitle.length > 50 && postData.seoTitle.length < 65 ? 'bg-green-500' : 'bg-yellow-500'}`}
                    style={{ width: `${Math.min((postData.seoTitle.length / 70) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Search Engine Description</label>
                <textarea
                  className="w-full bg-secondary/30 border-none rounded-2xl py-5 px-8 font-medium min-h-[140px] focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                  value={postData.seoDescription}
                  onChange={(e) => setPostData(prev => ({...prev, seoDescription: e.target.value}))}
                  placeholder={postData.summary || "Summary for Google search results..."}
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Article URL (Slug)</label>
                <div className="flex gap-2">
                  <div className="bg-secondary/50 px-6 py-4 rounded-2xl text-muted-foreground font-black border border-primary/5 flex items-center">
                    /blog/
                  </div>
                  <input
                    className="flex-grow bg-secondary/30 border-none rounded-2xl py-4 px-8 font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all font-mono"
                    value={postData.slug}
                    onChange={(e) => setPostData(prev => ({...prev, slug: e.target.value}))}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="glass-card p-10 rounded-[3rem] border-primary/10 shadow-2xl space-y-10 animate-in fade-in duration-500">
              <div className="space-y-6">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Article Tags</label>
                <div className="relative">
                  <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    className="w-full bg-secondary/30 border-none rounded-3xl py-6 pl-16 pr-8 text-lg font-bold placeholder:text-muted-foreground/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner"
                    placeholder="Enter tags separated by commas..."
                    value={postData.tags.join(', ')}
                    onChange={(e) => setPostData(prev => ({...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)}))}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Embedded CTAs (Global)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ctas.map(cta => (
                    <button
                      key={cta.id}
                      type="button"
                      onClick={() => {
                        const ids = postData.ctaIds.includes(cta.id)
                          ? postData.ctaIds.filter(id => id !== cta.id)
                          : [...postData.ctaIds, cta.id];
                        setPostData(prev => ({...prev, ctaIds: ids}));
                      }}
                      className={`flex items-center gap-5 p-6 rounded-[2rem] text-left transition-all border-2 ${
                        postData.ctaIds.includes(cta.id)
                          ? 'bg-primary/5 border-primary shadow-xl scale-105'
                          : 'bg-secondary/30 border-transparent hover:border-primary/20'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${postData.ctaIds.includes(cta.id) ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                        <CheckCircle2 size={24} className={postData.ctaIds.includes(cta.id) ? 'opacity-100' : 'opacity-20'} />
                      </div>
                      <div>
                        <p className="font-black text-base">{cta.title}</p>
                        <p className="text-xs text-muted-foreground font-bold">{cta.buttonText}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Persistent Sidebar */}
        <div className="space-y-8">
          {/* Featured Image */}
          <div className="glass-card p-8 rounded-[3rem] border-primary/10 shadow-2xl space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <ImageIcon size={20} />
              </div>
              Cover Image
            </h3>
              <ImageUploader 
                label="Featured Image" 
                onUpload={(url) => setPostData(prev => ({ ...prev, thumbnailUrl: url }))}
                value={postData.thumbnailUrl}
              />
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Or Paste Image URL</label>
              <input
                type="text"
                className="w-full bg-secondary/30 border-none rounded-2xl py-3 px-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="https://images.unsplash.com/..."
                value={postData.thumbnailUrl}
                onChange={(e) => setPostData(prev => ({...prev, thumbnailUrl: e.target.value}))}
              />
            </div>
            <p className="text-xs text-muted-foreground font-bold text-center italic opacity-60">
              Optimal size: 1200 x 630px
            </p>
          </div>

          {/* Categorization */}
          <div className="glass-card p-8 rounded-[3rem] border-primary/10 shadow-2xl space-y-8">
            <h3 className="text-xl font-black flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Share2 size={20} />
              </div>
              Organization
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Primary Author</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <select 
                    className="w-full bg-secondary/30 border-none rounded-2xl py-4 pl-14 pr-10 font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none text-sm"
                    value={postData.authorId}
                    onChange={(e) => setPostData(prev => ({...prev, authorId: e.target.value}))}
                  >
                    <option value="">Select Author</option>
                    {authors.map(author => (
                      <option key={author.id} value={author.id}>{author.name}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground rotate-90" size={16} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Content Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        const ids = postData.categoryIds.includes(cat.id)
                          ? postData.categoryIds.filter(id => id !== cat.id)
                          : [...postData.categoryIds, cat.id];
                        setPostData(prev => ({...prev, categoryIds: ids}));
                      }}
                      className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all border-2 ${
                        postData.categoryIds.includes(cat.id)
                          ? 'bg-primary text-white border-primary shadow-lg'
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

          {/* Visibility & Stats */}
          <div className="glass-card p-8 rounded-[3rem] border-primary/10 shadow-2xl space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Globe size={20} />
              </div>
              Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-secondary/30 rounded-[1.5rem] border border-primary/5">
                <span className="font-black text-sm">Public Visibility</span>
                <button
                  type="button"
                  onClick={() => setPostData(prev => ({...prev, isPublished: !prev.isPublished}))}
                  className={`w-16 h-9 rounded-full transition-all relative p-1 ${postData.isPublished ? 'bg-primary' : 'bg-slate-300'}`}
                >
                  <div className={`w-7 h-7 rounded-full bg-white transition-all shadow-md ${postData.isPublished ? 'ml-7' : 'ml-0'}`} />
                </button>
              </div>

              <div className="flex items-center gap-4 p-5 bg-primary/5 rounded-[1.5rem] border border-primary/10">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Read Time</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      className="bg-transparent border-none p-0 w-12 font-black text-2xl outline-none text-primary" 
                      value={postData.readTime}
                      onChange={(e) => setPostData(prev => ({...prev, readTime: parseInt(e.target.value) || 0}))}
                    />
                    <span className="text-sm font-black text-muted-foreground">minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
