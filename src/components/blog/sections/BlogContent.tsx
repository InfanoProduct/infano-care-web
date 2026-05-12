import { getImageUrl } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface BlogContentProps {
  post: any;
}

export function BlogContent({ post }: BlogContentProps) {
  return (
    <>
      {/* Article Content */}
      <div className="mx-auto px-4 md:px-0" style={{ fontFamily: 'var(--blog-font-main)' }}>
        <div
          className="blog-content-rich-text prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:font-medium prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-xl prose-blockquote:before:content-none prose-blockquote:after:content-none"
          style={{ color: 'var(--blog-text-main)' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-20 pt-10 border-t border-border/50">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">Article Keywords</p>
            <div className="flex flex-wrap gap-3">
              {post.tags.map((tag: string) => (
                <span key={tag} className="px-5 py-2.5 rounded-2xl bg-muted text-slate-700 text-sm font-black border border-border/50 hover:bg-gray-100 transition-colors cursor-default">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio Section */}
        <div className="mt-20 p-8 md:p-12 rounded-xl bg-muted border border-border flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-white overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
            {post.author?.avatarUrl ? (
              <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary font-black text-3xl">
                {post.author?.name?.charAt(0) || 'I'}
              </div>
            )}
          </div>
          <div className="space-y-3 text-center md:text-left">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">About the author</p>
              <h3 className="blog-heading text-2xl font-black tracking-tight">{post.author?.name || 'Infano Staff'}</h3>
            </div>
            <p className="blog-meta-text text-base">
              {post.author?.bio || 'Passionate about delivering accurate and compassionate health information to the Infano community.'}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 pt-2">
              {post.author?.instagramUrl && (
                <a 
                  href={post.author.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-black text-primary hover:underline flex items-center gap-1"
                >
                  Instagram <ArrowRight size={14} />
                </a>
              )}
              {post.author?.facebookUrl && (
                <a 
                  href={post.author.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-black text-primary hover:underline flex items-center gap-1"
                >
                  Facebook <ArrowRight size={14} />
                </a>
              )}
              {post.author?.linkedInUrl && (
                <a 
                  href={post.author.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-black text-primary hover:underline flex items-center gap-1"
                >
                  LinkedIn <ArrowRight size={14} />
                </a>
              )}
              {!post.author?.instagramUrl && !post.author?.facebookUrl && !post.author?.linkedInUrl && (
                <span className="text-sm font-bold text-muted-foreground">Follow on social media</span>
              )}
            </div>
          </div>
        </div>

        {/* Leave a Reply Section */}
        <div className="mt-20 pt-16 border-t border-border/50">
          <h3 className="blog-heading text-3xl mb-2">Leave A Reply</h3>
          <p className="blog-meta-text text-sm mb-8">Your email address will not be published.<span className="text-[#dc3545]">*</span></p>
          
          <form className="space-y-6 max-w-full">
            <div>
              <textarea 
                rows={6} 
                className="w-full border border-gray-200 p-4 rounded-lg focus:outline-none focus:border-primary transition-colors text-sm font-medium resize-y" 
                placeholder="Comment"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input 
                type="text" 
                className="w-full border border-gray-200 p-4 rounded-lg focus:outline-none focus:border-primary transition-colors text-sm font-medium" 
                placeholder="Name"
              />
              <input 
                type="email" 
                className="w-full border border-gray-200 p-4 rounded-lg focus:outline-none focus:border-primary transition-colors text-sm font-medium" 
                placeholder="Email"
              />
              <input 
                type="text" 
                className="w-full border border-gray-200 p-4 rounded-lg focus:outline-none focus:border-primary transition-colors text-sm font-medium" 
                placeholder="Website"
              />
            </div>
            <button 
              type="button"
              className="bg-primary text-white px-8 py-4 text-[12px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-900 transition-colors mt-4"
            >
              Post Comment
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
