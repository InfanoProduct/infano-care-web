'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { blogService } from '@/services/blog.service';

// Import newly created sections
import { BlogHeader } from '@/components/blog/sections/BlogHeader';
import { BlogContent } from '@/components/blog/sections/BlogContent';
import { EditorsChoice } from '@/components/blog/sections/EditorsChoice';
import { PromoBanner, CategoryWidget, SocialStats, PostTabsWidget } from '@/components/blog/SidebarWidgets';
import '../blog.css';

interface BlogPostDetailClientProps {
  slug: string;
}

export function BlogPostDetailClient({ slug }: BlogPostDetailClientProps) {
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const [data, postsData, categoriesData, gStatsData] = await Promise.all([
        blogService.getPostBySlug(slug),
        blogService.getAllPosts(1, 50, ''),
        blogService.getCategories(),
        blogService.getGlobalStats().catch(() => null)
      ]) as [any, any, any, any];
      
      if (!data || !data.isPublished) {
        router.push('/blog');
        return;
      }
      setPost(data);
      setGlobalStats(gStatsData);
      
      // Increment view count
      blogService.incrementViews(data.id).catch(err => console.error('Failed to increment views:', err));

      const publishedPosts = postsData.items.filter((p: any) => p.isPublished);
      setAllPosts(publishedPosts);
      setCategories(categoriesData);

      // Load Editor's Choice posts (Prioritize tagged posts, fallback to available posts)
      const taggedPosts = publishedPosts.filter((p: any) => 
        p.id !== data.id &&
        p.tags?.some((t: string) => ['choice', 'editor', 'editors-choice'].includes(t.toLowerCase()))
      );
      
      let ecPosts = [];
      if (taggedPosts.length > 0) {
        ecPosts = taggedPosts.slice(0, 4);
      } else {
        ecPosts = publishedPosts
          .filter((p: any) => p.id !== data.id)
          .slice(0, 4);
      }
      setRelatedPosts(ecPosts);
    } catch (error: any) {
      console.error('Failed to load post:', error);
      router.push('/blog');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-xl font-black text-muted-foreground animate-pulse">Loading story...</p>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <BlogHeader post={post} />
      
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8">
            <BlogContent post={post} />
          </div>
          <aside className="lg:col-span-4 space-y-12 sticky top-24 self-start" style={{ fontFamily: 'var(--blog-font-main)' }}>
            <div className="space-y-6">
              <h3 className="blog-widget-title pl-1">Don't Miss</h3>
              <PromoBanner />
            </div>
            <div className="space-y-6">
              <h3 className="blog-widget-title pl-1">Hot Topics</h3>
              <CategoryWidget categories={categories} />
            </div>
            <div className="space-y-6">
              <h3 className="blog-widget-title pl-1">Join Our Community</h3>
              <SocialStats author={post.author} globalStats={globalStats} />
            </div>
            <PostTabsWidget posts={allPosts} />
          </aside>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 pb-24">
        <EditorsChoice posts={relatedPosts} />
      </div>
    </div>
  );
}
