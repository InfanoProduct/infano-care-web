import Link from 'next/link';
import { ChevronLeft, Calendar, Clock, TwitterIcon, LinkedinIcon, FacebookIcon, Share2 } from 'lucide-react';
import { getImageUrl, getCategoryColor } from '@/lib/utils';

interface BlogHeaderProps {
  post: any;
}

// Custom icons since they were imported from @/components/icons
const Twitter = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Linkedin = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const Facebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export function BlogHeader({ post }: BlogHeaderProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Journal
          </Link>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              {post.categories?.map((cat: any) => (
                <span key={cat.id} className={`blog-category-tag !px-4 !py-1.5 !text-[10px] ${getCategoryColor(cat.name)}`}>
                  {cat.name}
                </span>
              ))}
            </div>

            <h1 className="blog-heading text-3xl lg:text-4xl font-black tracking-tight leading-[1.2]">
              {post.title}
            </h1>

            {post.summary && (
              <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed italic border-l-4 border-primary/20 pl-6">
                {post.summary}
              </p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-6 border-t border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden border-2 border-white shadow-md shrink-0">
                  {post.author?.avatarUrl ? (
                    <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-black text-lg">
                      {post.author?.name?.charAt(0) || 'I'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">{post.author?.name || 'Infano Editorial'}</p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="opacity-30">•</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime || 5} Min Read</span>
                  </div>
                </div>
              </div>

              <div className="sm:ml-auto flex items-center gap-2">
                <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm">
                  <Twitter />
                </button>
                <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-[#0077b5] hover:text-white transition-all shadow-sm">
                  <Linkedin />
                </button>
                <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-[#1877f2] hover:text-white transition-all shadow-sm">
                  <Facebook />
                </button>
                <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-slate-900 hover:text-white transition-all shadow-sm ml-2">
                  <Share2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative aspect-[4/5] lg:aspect-square w-full rounded-none overflow-hidden shadow-2xl">
          <img 
            src={getImageUrl(post.thumbnailUrl)} 
            alt={post.title} 
            className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
          />
        </div>
      </div>
    </div>
  );
}
