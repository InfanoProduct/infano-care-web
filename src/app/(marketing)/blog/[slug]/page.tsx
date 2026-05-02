'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { blogService } from '@/services/blog.service';

// Import newly created sections
import { BlogHeader } from '@/components/blog/sections/BlogHeader';
import { BlogContent } from '@/components/blog/sections/BlogContent';
import { EditorsChoice } from '@/components/blog/sections/EditorsChoice';
import { PromoBanner, CategoryWidget, SocialStats, PostTabsWidget } from '@/components/blog/SidebarWidgets';
import '../blog.css';

export default function BlogPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    setLoading(true);
    try {
        const [data, postsData, categoriesData] = await Promise.all([
          blogService.getPostBySlug(slug),
          blogService.getAllPosts(1, 50, ''),
          blogService.getCategories()
        ]) as [any, any, any];
        
        if (!data || !data.isPublished) {
          router.push('/blog');
          return;
        }
      setPost(data);

      const publishedPosts = postsData.items.filter((p: any) => p.isPublished);
      setAllPosts(publishedPosts);
      setCategories(categoriesData);

      // Load Editor's Choice posts (Posts with 'choice' or 'editor' tag, or latest)
      const ecPosts = publishedPosts
        .filter((p: any) => p.id !== data.id)
        .sort((a: any, b: any) => {
          const aChoice = a.tags?.some((t: string) => ['choice', 'editor'].includes(t.toLowerCase()));
          const bChoice = b.tags?.some((t: string) => ['choice', 'editor'].includes(t.toLowerCase()));
          if (aChoice && !bChoice) return -1;
          if (!aChoice && bChoice) return 1;
          return 0;
        })
        .slice(0, 4);
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
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8">
            <BlogContent post={post} />
          </div>
          <aside className="lg:col-span-4 space-y-12" style={{ fontFamily: 'var(--blog-font-main)' }}>
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
              <SocialStats />
            </div>
            <PostTabsWidget posts={allPosts} />
          </aside>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <EditorsChoice posts={relatedPosts} />
      </div>
    </div>
  );
}
