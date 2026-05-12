import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, getCategoryColor } from '@/lib/utils';

interface TrendingStoriesProps {
  posts: any[];
}

export function TrendingStories({ posts }: TrendingStoriesProps) {
  if (posts.length === 0) return null;

  return (
    <section className="space-y-12">
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <h2 className="blog-section-title">Trending Stories</h2>
        <Link href="/blog" className="blog-meta-text border-b-2 border-primary pb-1 hover:text-primary transition-colors">
          All Trending Stories
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group flex gap-8 items-center">
            <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-xl overflow-hidden shadow-xl shrink-0">
              <Image
                src={getImageUrl(post.thumbnailUrl)}
                alt=""
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 sharp-image"
                sizes="(max-width: 768px) 128px, 192px"
              />
            </div>
            <div className="space-y-3">
              <span className={`blog-category-tag ${getCategoryColor(post.categories?.[0]?.name)}`}>
                {post.categories?.[0]?.name || 'Trending'}
              </span>
              <h3 className="blog-post-title blog-list-title transition-all line-clamp-2">
                {post.title}
              </h3>
              <p className="blog-meta-text">
                By {post.author?.name || 'Infano Staff'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
