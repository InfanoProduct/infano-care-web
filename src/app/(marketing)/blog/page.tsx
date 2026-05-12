'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, Loader2 } from 'lucide-react';
import { blogService } from '@/services/blog.service';
import './blog.css';

// Import newly created sections
import { FeaturedSection } from '@/components/blog/sections/FeaturedSection';
import { TopStories } from '@/components/blog/sections/TopStories';
import { TrendingStories } from '@/components/blog/sections/TrendingStories';
import { MainPostList } from '@/components/blog/sections/MainPostList';
import { EditorsChoice } from '@/components/blog/sections/EditorsChoice';
import { Newsletter } from '@/components/blog/sections/Newsletter';
import { PromoBanner, CategoryWidget, SocialStats, PostTabsWidget } from '@/components/blog/SidebarWidgets';
import { BlogListingHeader } from '@/components/blog/sections/BlogListingHeader';

function BlogPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
        const [postsData, categoriesData] = await Promise.all([
          blogService.getAllPosts(1, 50, ''),
          blogService.getCategories()
        ]) as [any, any];
      // Only show published posts for public view
      setPosts(postsData.items.filter((p: any) => p.isPublished));
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sections = useMemo(() => {
    const filteredPosts = posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.summary?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory
        ? post.categories?.some((c: any) => c.id === selectedCategory)
        : true;
      return matchesSearch && matchesCategory;
    });

    const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
    
    // Logical Filtration for Sections
    // 1. Recent News (Top 4 latest posts after featured)
    const recentNews = filteredPosts.slice(1, 5);
    
    // 2. Top Stories (Highest views, excluding featured and recent)
    const topStories = [...filteredPosts]
      .filter(p => p.id !== featuredPost?.id && !recentNews.find(rn => rn.id === p.id))
      .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
      .slice(0, 3);
      
    // 3. Trending Stories (Remaining posts with highest views or 'trending' tag)
    const trendingStories = [...filteredPosts]
      .filter(p => 
        p.id !== featuredPost?.id && 
        !recentNews.find(rn => rn.id === p.id) &&
        !topStories.find(ts => ts.id === p.id)
      )
      .sort((a: any, b: any) => {
        // Prioritize 'trending' tag if it exists
        const aTrending = a.tags?.some((t: string) => t.toLowerCase() === 'trending');
        const bTrending = b.tags?.some((t: string) => t.toLowerCase() === 'trending');
        if (aTrending && !bTrending) return -1;
        if (!aTrending && bTrending) return 1;
        return (b.views || 0) - (a.views || 0);
      })
      .slice(0, 6);

    // 4. Latest Updates (Remaining posts sorted by date)
    let latestUpdates = filteredPosts.filter(p => 
      p.id !== featuredPost?.id && 
      !recentNews.find(rn => rn.id === p.id) &&
      !topStories.find(ts => ts.id === p.id) &&
      !trendingStories.find(tr => tr.id === p.id)
    );

    // Fallback: If Top Stories or Trending Stories are too short, fill them from latest updates
    if (topStories.length < 3 && latestUpdates.length > 0) {
      const fillCount = 3 - topStories.length;
      topStories.push(...latestUpdates.slice(0, fillCount));
      latestUpdates = latestUpdates.slice(fillCount);
    }
    
    if (trendingStories.length < 6 && latestUpdates.length > 0) {
      const fillCount = 6 - trendingStories.length;
      trendingStories.push(...latestUpdates.slice(0, fillCount));
      latestUpdates = latestUpdates.slice(fillCount);
    }

    // 5. Editor's Choice (Posts with 'choice' or 'editor' tag, or next in line)
    const editorsChoice = [...latestUpdates]
      .sort((a: any, b: any) => {
        const aChoice = a.tags?.some((t: string) => ['choice', 'editor'].includes(t.toLowerCase()));
        const bChoice = b.tags?.some((t: string) => ['choice', 'editor'].includes(t.toLowerCase()));
        if (aChoice && !bChoice) return -1;
        if (!aChoice && bChoice) return 1;
        return 0;
      })
      .slice(0, 4);

    // Allow duplicates in the list view to ensure it looks full as requested
    const finalLatestUpdates = filteredPosts.slice(1);

    return {
      filteredPosts,
      featuredPost,
      recentNews,
      topStories,
      trendingStories,
      editorsChoice,
      finalLatestUpdates
    };
  }, [posts, search, selectedCategory]);

  const { 
    filteredPosts, 
    featuredPost, 
    recentNews, 
    topStories, 
    trendingStories, 
    editorsChoice, 
    finalLatestUpdates 
  } = sections;

  return (
    <div className="bg-white min-h-screen">
      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-6">
          <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Loading latest news...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-40 text-center opacity-50">
          <FileText size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-black">No articles found</h2>
        </div>
      ) : (
        <div className="max-w-[1440px] mx-auto px-6 py-12">
          <BlogListingHeader
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            search={search}
            onSearchChange={setSearch}
          />

          <div className="space-y-24 mt-16">
            {!selectedCategory ? (
              <>
                {/* Section 1: Top Featured & Recent */}
                <FeaturedSection
                  featuredPost={featuredPost}
                  otherPosts={recentNews}
                  search={search}
                  selectedCategory={selectedCategory}
                />
                
                {/* Section 2: Top Stories */}
                <TopStories posts={topStories} />

                {/* Section 3: Trending Stories */}
                <TrendingStories posts={trendingStories} />

                {/* Section 4: Split Content Section (List + Sidebar) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-12 border-t border-gray-50">
                  {/* Left Side: Main Post List */}
                  <div className="lg:col-span-8">
                    <div className="mb-12">
                      <h2 className="blog-section-title flex items-center gap-4">
                        Latest Updates
                        <div className="h-px bg-gray-100 flex-1" />
                      </h2>
                    </div>
                    <MainPostList posts={finalLatestUpdates.slice(0, 6)} />
                  </div>

                  {/* Right Side: Sidebar Widgets */}
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

                    <PostTabsWidget posts={posts} />
                  </aside>
                </div>

                {/* Section 5: Editor's Choice */}
                <EditorsChoice posts={editorsChoice} />
              </>
            ) : (
              <>
                {/* Category Filtered View */}
                <div className="mb-8 border-b border-gray-100 pb-8">
                  <h1 className="blog-heading text-4xl lg:text-5xl capitalize">
                    {categories.find(c => c.id === selectedCategory)?.name || 'Category'} Articles
                  </h1>
                  <p className="blog-meta-text mt-4 text-lg">
                    Explore all our stories and guides about {categories.find(c => c.id === selectedCategory)?.name || 'this topic'}.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  {/* Left Side: Main Post List */}
                  <div className="lg:col-span-8">
                    <MainPostList posts={filteredPosts} />
                  </div>

                  {/* Right Side: Sidebar Widgets */}
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

                    <PostTabsWidget posts={posts} />
                  </aside>
                </div>

                {/* Section 5: Editor's Choice */}
                <EditorsChoice posts={filteredPosts.slice(0, 4)} />
              </>
            )}


            {/* Section 5: Newsletter */}
            <Newsletter />
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlogListingPage() {
  return (
    <Suspense fallback={
      <div className="bg-white min-h-screen py-40 flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Loading...</p>
      </div>
    }>
      <BlogPageContent />
    </Suspense>
  );
}
