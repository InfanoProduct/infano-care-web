import Link from 'next/link';
import { getImageUrl, getCategoryColor } from '@/lib/utils';

interface EditorsChoiceProps {
  posts: any[];
}

export function EditorsChoice({ posts }: EditorsChoiceProps) {
  if (posts.length === 0) return null;

  return (
    <section className="space-y-10">
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <h2 className="blog-section-title">Editor's Choice</h2>
        <Link href="/blog" className="blog-meta-text border-b-2 border-primary pb-1 hover:text-primary transition-colors capitalize text-xs font-black tracking-wide">
          All Editor's Choice
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group relative block aspect-square overflow-hidden rounded-none shadow-xl">
            {/* Background Image */}
            <img
              src={getImageUrl(post.thumbnailUrl)}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 sharp-image"
            />
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:via-black/60 transition-all duration-500" />
            
            {/* Content Overlay */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end space-y-3">
              <h3 className="text-white font-black text-xl leading-tight transition-all line-clamp-3 group-hover:text-primary">
                {post.title}
              </h3>
              <p className="text-white/70 text-xs font-bold flex items-center gap-2">
                By {post.author?.name || 'Infano Staff'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
