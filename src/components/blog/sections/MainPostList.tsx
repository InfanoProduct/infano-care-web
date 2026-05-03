import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, getCategoryColor } from '@/lib/utils';
import { User, Calendar, Clock } from 'lucide-react';

interface MainPostListProps {
  posts: any[];
}

export function MainPostList({ posts }: MainPostListProps) {
  if (posts.length === 0) return null;

  return (
    <div className="space-y-12">
      {posts.map((post) => (
        <article key={post.id} className="group grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-gray-100 pb-12 last:border-0">
          <div className="md:col-span-5">
            <Link href={`/blog/${post.slug}`} className="block relative aspect-[4/3] rounded-none overflow-hidden shadow-2xl">
              <Image
                src={getImageUrl(post.thumbnailUrl)}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 sharp-image"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </Link>
          </div>
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <span className={`blog-category-tag ${getCategoryColor(post.categories?.[0]?.name)}`}>
                {post.categories?.[0]?.name || 'Story'}
              </span>
            </div>
            <Link href={`/blog/${post.slug}`}>
              <h3 className="blog-post-title blog-list-title transition-all line-clamp-2">
                {post.title}
              </h3>
            </Link>
            <p className="text-[#777777] text-sm leading-relaxed line-clamp-3">
              {post.summary}
            </p>
            <div className="blog-meta-text flex items-center gap-6 pt-2">
              <span>By {post.author?.name || 'Staff'}</span>
              <span className="flex items-center gap-2">
                <Calendar size={14} />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
