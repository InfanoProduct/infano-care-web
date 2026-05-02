import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

interface RelatedPostsProps {
  relatedPosts: any[];
}

export function RelatedPosts({ relatedPosts }: RelatedPostsProps) {
  if (relatedPosts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto mt-40 px-4 md:px-10 pb-32">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-4xl font-black tracking-tight">Keep Reading</h2>
        <Link href="/blog" className="text-primary font-black hover:underline flex items-center gap-2">
          View All Insights <ArrowRight size={18} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {relatedPosts.map((rp: any) => (
          <Link key={rp.id} href={`/blog/${rp.slug}`} className="group">
            <div className="glass-card rounded-[3rem] overflow-hidden border-primary/5 shadow-xl hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={getImageUrl(rp.thumbnailUrl)}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
              </div>
              <div className="p-8 space-y-4 flex-1 flex flex-col">
                <h3 className="text-xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2 flex-1">
                  {rp.title}
                </h3>
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{rp.readTime || 5} min read</span>
                  <ArrowRight size={16} className="text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
