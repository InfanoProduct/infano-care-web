import Link from 'next/link';
import { User, Calendar, TrendingUp } from 'lucide-react';
import { getImageUrl, getCategoryColor } from '@/lib/utils';

interface FeaturedSectionProps {
  featuredPost: any;
  otherPosts: any[];
  search: string;
  selectedCategory: string | null;
}

export function FeaturedSection({ featuredPost, otherPosts, search, selectedCategory }: FeaturedSectionProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">

      {/* Main Featured */}
      <div className="lg:col-span-8">
        {!search && !selectedCategory && featuredPost && (
          <Link href={`/blog/${featuredPost.slug}`} className="group block space-y-8">

            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden sharp-image">
              <img
                src={getImageUrl(featuredPost.thumbnailUrl)}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Category */}
              <div className="absolute bottom-6 left-6">
                <span className={`blog-category-tag ${getCategoryColor(featuredPost.categories?.[0]?.name)}`}>
                  {featuredPost.categories?.[0]?.name || 'Featured'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-5">

              {/* ✅ Title */}
              <h3 className="blog-heading blog-featured-title">
                {featuredPost.title}
              </h3>

              {/* Meta */}
              <div className="blog-meta-text flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <User size={14} /> {featuredPost.author?.name || 'Infano Staff'}
                </span>

                <span>•</span>

                <span className="flex items-center gap-1">
                  <Calendar size={14} /> {new Date(featuredPost.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Summary */}
              <p className="blog-meta-text max-w-2xl line-clamp-3">
                {featuredPost.summary}
              </p>
            </div>
          </Link>
        )}
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="blog-section-title">Recent News</h2>
          <TrendingUp size={18} />
        </div>

        {/* List */}
        <div className="space-y-6">
          {otherPosts.slice(0, 4).map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex gap-4">

              {/* Image */}
              <div className="w-24 h-24 overflow-hidden sharp-image shrink-0">
                <img
                  src={getImageUrl(post.thumbnailUrl)}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">

                {/* ✅ Category (NO override sizes) */}
                <span className={`blog-category-tag ${getCategoryColor(post.categories?.[0]?.name)}`}>
                  {post.categories?.[0]?.name || 'Update'}
                </span>

                {/* Title */}
                <h3 className="blog-post-title blog-sidebar-title line-clamp-2">
                  {post.title}
                </h3>

                {/* Author instead of Date */}
                <p className="blog-meta-text">
                  By {post.author?.name || 'Staff'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}