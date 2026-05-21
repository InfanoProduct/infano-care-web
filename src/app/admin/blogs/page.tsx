'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, Eye, Tag, Users, Plus, TrendingUp, Loader2, ArrowUpRight, 
  Clock, CheckCircle2, AlertCircle, Trash2 
} from 'lucide-react';
import { blogService } from '@/services/blog.service';

export default function BlogDashboard() {
  const [stats, setStats] = useState<any>({
    totalPosts: 0,
    totalViews: 0,
    totalCategories: 0,
    totalAuthors: 0
  });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState<any>({
    instagramFollowers: '',
    facebookFollowers: '',
    linkedInFollowers: '',
    youtubeSubscribers: ''
  });
  const [isUpdatingGlobal, setIsUpdatingGlobal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, postsData, globalData] = await Promise.all([
        blogService.getStats(),
        blogService.getAllPosts(1, 5),
        blogService.getGlobalStats()
      ]) as [any, any, any];
      setStats(statsData);
      setRecentPosts(postsData.items);
      setGlobalStats(globalData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGlobalStats = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingGlobal(true);
    try {
      await blogService.updateGlobalStats(globalStats);
      alert('Social metrics updated successfully!');
    } catch (error) {
      alert('Failed to update social metrics');
    } finally {
      setIsUpdatingGlobal(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await blogService.deletePost(id);
      loadDashboardData();
    } catch (error) {
      alert('Failed to delete post');
    }
  };

  const statCards = [
    { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Categories', value: stats.totalCategories, icon: Tag, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Authors', value: stats.totalAuthors, icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-bold text-muted-foreground">Synthesizing blog analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="admin-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Blog Insights</h1>
          <p className="text-muted-foreground mt-1">Real-time overview of your editorial performance</p>
        </div>
        <Link href="/admin/blogs/posts/new" className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
          <Plus size={20} />
          <span>Draft New Article</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass-card p-6 rounded-[2rem] border-primary/5 flex flex-col gap-4 group hover:scale-[1.02] transition-transform duration-300">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
              <p className="text-3xl font-black mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Posts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Clock className="text-primary" size={24} />
              Recent Publications
            </h2>
            <Link href="/admin/blogs/posts" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          
          <div className="glass-card rounded-[2.5rem] border-primary/5 overflow-hidden shadow-2xl">
            <div className="divide-y divide-border/30">
              {recentPosts.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground font-bold">No articles found. Start writing!</div>
              ) : (
                recentPosts.map((post) => (
                  <div key={post.id} className="p-6 flex items-center justify-between hover:bg-primary/[0.02] transition-all group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-secondary border border-border/50 flex-shrink-0">
                        {post.thumbnailUrl ? (
                          <img src={post.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                            <FileText size={24} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-lg line-clamp-1 group-hover:text-primary transition-colors">{post.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Users size={12} /> {post.author?.name || 'Editorial'}</span>
                          <span className="opacity-30">•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                      <div className="hidden sm:flex flex-col items-end">
                        <p className="text-sm font-black">{post.views || 0} <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Views</span></p>
                        <span className={`text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-1 mt-0.5 ${post.isPublished ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {post.isPublished ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                          {post.isPublished ? 'Live' : 'Draft'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/admin/blogs/posts/edit/${post.id}`} className="p-3 bg-secondary/50 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                          <ArrowUpRight size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="p-3 bg-secondary/50 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                        >
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

        {/* Quick Actions / Tips */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black tracking-tight px-2">Quick Commands</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link href="/admin/blogs/authors" className="glass-card p-6 rounded-[2rem] border-primary/5 hover:border-primary/20 transition-all group flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
                  <Users size={20} />
                </div>
                <span className="font-extrabold">Manage Authors</span>
              </div>
              <ArrowUpRight className="text-muted-foreground group-hover:text-primary transition-colors" size={18} />
            </Link>
            
            <Link href="/admin/blogs/categories" className="glass-card p-6 rounded-[2rem] border-primary/5 hover:border-primary/20 transition-all group flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                  <Tag size={20} />
                </div>
                <span className="font-extrabold">Categories</span>
              </div>
              <ArrowUpRight className="text-muted-foreground group-hover:text-primary transition-colors" size={18} />
            </Link>

            <div className="glass-card p-8 rounded-[2.5rem] border-primary/5 space-y-6 shadow-2xl">
              <h3 className="text-xl font-black flex items-center gap-2">
                <TrendingUp className="text-primary" size={20} />
                Social Metrics
              </h3>
              <form onSubmit={handleUpdateGlobalStats} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Instagram</label>
                    <input 
                      className="w-full bg-secondary/50 border-none rounded-xl py-2 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      value={globalStats.instagramFollowers}
                      onChange={(e) => setGlobalStats({...globalStats, instagramFollowers: e.target.value})}
                      placeholder="4.2k+"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Facebook</label>
                    <input 
                      className="w-full bg-secondary/50 border-none rounded-xl py-2 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      value={globalStats.facebookFollowers}
                      onChange={(e) => setGlobalStats({...globalStats, facebookFollowers: e.target.value})}
                      placeholder="2.1k+"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">LinkedIn</label>
                    <input 
                      className="w-full bg-secondary/50 border-none rounded-xl py-2 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      value={globalStats.linkedInFollowers}
                      onChange={(e) => setGlobalStats({...globalStats, linkedInFollowers: e.target.value})}
                      placeholder="1.5k+"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">YouTube</label>
                    <input 
                      className="w-full bg-secondary/50 border-none rounded-xl py-2 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      value={globalStats.youtubeSubscribers}
                      onChange={(e) => setGlobalStats({...globalStats, youtubeSubscribers: e.target.value})}
                      placeholder="1.2k+"
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isUpdatingGlobal}
                  className="w-full btn-primary py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {isUpdatingGlobal ? <Loader2 className="animate-spin" size={16} /> : 'Sync Metrics'}
                </button>
              </form>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] bg-primary text-white space-y-4 shadow-2xl shadow-primary/30 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-black">Editorial Tip</h3>
                <p className="text-primary-foreground/80 text-sm font-medium mt-2 leading-relaxed">
                  Articles with at least one CTA (Call-to-Action) have a 45% higher engagement rate. Try adding a CTA to your next draft!
                </p>
                <button className="mt-4 bg-white text-primary px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                  Learn More
                </button>
              </div>
              <TrendingUp size={120} className="absolute -bottom-10 -right-10 text-white/10 rotate-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
