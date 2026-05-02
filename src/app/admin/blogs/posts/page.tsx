'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Loader2, FileText, Calendar, User as UserIcon } from 'lucide-react';
import { blogService } from '@/services/blog.service';

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadBlogs();
  }, [search]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await blogService.getAllPosts(1, 50, search) as any;
      setBlogs(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await blogService.deletePost(id);
      loadBlogs();
    } catch (error) {
      alert('Failed to delete post');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Blog Management</h1>
          <p className="text-muted-foreground mt-2">Create, edit and manage your blog articles</p>
        </div>
        <Link href="/admin/blogs/posts/new" className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
          <Plus size={20} />
          <span>New Article</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border-primary/5 flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <FileText size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Posts</p>
            <p className="text-3xl font-black">{total}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 backdrop-blur-md p-4 rounded-[2rem] border border-border/50 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search articles..."
            suppressHydrationWarning
            className="w-full bg-secondary/30 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button 
            suppressHydrationWarning
            className="p-3 bg-secondary/50 rounded-2xl text-muted-foreground hover:text-primary transition-colors border border-transparent hover:border-primary/10"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden border-primary/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/20">
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/70">Article</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/70 hidden lg:table-cell">Author</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/70 hidden md:table-cell">Stats</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/70">Status</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/70 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-primary" size={40} />
                      <p className="font-bold text-muted-foreground">Fetching articles...</p>
                    </div>
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <FileText size={60} />
                      <p className="text-xl font-bold">No articles found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                blogs.map((post) => (
                  <tr key={post.id} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-secondary flex-shrink-0 border border-border/50">
                          {post.thumbnailUrl ? (
                            <img src={post.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <FileText size={24} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-lg line-clamp-1 group-hover:text-primary transition-colors">{post.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground font-medium">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <UserIcon size={16} />
                        </div>
                        <span className="font-bold">{post.author?.name || 'Anonymous'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-foreground">{post.views || 0} <span className="text-muted-foreground font-medium">Views</span></p>
                        <p className="text-xs text-muted-foreground font-medium">{post.readTime || 5} min read</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        post.isPublished 
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${post.isPublished ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                        {post.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/blog/${post.slug}`} target="_blank" className="p-2.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                          <Eye size={18} />
                        </Link>
                        <Link href={`/admin/blogs/posts/edit/${post.id}`} className="p-2.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
