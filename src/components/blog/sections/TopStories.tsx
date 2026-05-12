import Image from 'next/image';
import Link from 'next/link';
import { User, Calendar, Eye, Share2 } from 'lucide-react';
import { getImageUrl, getCategoryColor } from '@/lib/utils';

interface TopStoriesProps {
  posts: any[];
}

export function TopStories({ posts }: TopStoriesProps) {
  if (posts.length === 0) return null;

  const mainStory = posts[0];
  const sideStories = posts.slice(1, 3);

  return (
    <section className="space-y-10">
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <h2 className="blog-section-title">Top Stories</h2>
        <Link href="/blog" className="blog-meta-text border-b-2 border-primary pb-1 hover:text-primary transition-colors">
          All Top Stories
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Large Featured Story */}
        <div className="lg:col-span-8">
          <Link href={`/blog/${mainStory.slug}`} className="group relative block aspect-[16/10] overflow-hidden rounded-xl shadow-2xl">
            <Image
              src={getImageUrl(mainStory.thumbnailUrl)}
              alt={mainStory.title}
              fill
              priority
              className="object-cover group-hover:scale-110 transition-transform duration-[2000ms] sharp-image"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-10 md:p-16 space-y-6 w-full">
              <span className={`blog-category-tag ${getCategoryColor(mainStory.categories?.[0]?.name)}`}>
                {mainStory.categories?.[0]?.name || 'Story'}
              </span>
              <h3 className="blog-heading blog-title-white blog-featured-title transition-all">
                {mainStory.title}
              </h3>
              <div className="blog-meta-text flex flex-wrap items-center gap-6 text-gray-200">
                <span className="flex items-center gap-2">By {mainStory.author?.name || 'Infano Staff'}</span>
                <span className="flex items-center gap-2">{new Date(mainStory.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-2"><Eye size={12} /> {mainStory.views || '5k'} Views</span>
                <span className="flex items-center gap-2"><Share2 size={12} /> 230 Shares</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Side Stories Stack */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {sideStories.map((story) => (
            <Link key={story.id} href={`/blog/${story.slug}`} className="group relative block aspect-[16/10] overflow-hidden rounded-xl shadow-xl">
              <Image
                src={getImageUrl(story.thumbnailUrl)}
                alt={story.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 sharp-image"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end space-y-4">
                <span className={`blog-category-tag w-fit ${getCategoryColor(story.categories?.[0]?.name)}`}>
                  {story.categories?.[0]?.name || 'Update'}
                </span>
                <h4 className="blog-post-title blog-title-white text-xl transition-all line-clamp-3">
                  {story.title}
                </h4>
                <p className="blog-meta-text text-white/60">
                  By {story.author?.name || 'Infano Staff'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
