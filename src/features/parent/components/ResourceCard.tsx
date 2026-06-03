import React, { useState } from 'react';
import { Bookmark, Clock } from 'lucide-react';
import { ParentService } from '@/services/parent.service';
import Link from 'next/link';

interface ResourceCardProps {
  post: any;
  isBookmarkedInitial: boolean;
  onBookmarkChange?: (postId: string, isBookmarked: boolean) => void;
  hideBookmark?: boolean;
  compact?: boolean;
}

export function ResourceCard({ post, isBookmarkedInitial, onBookmarkChange, hideBookmark = false, compact = false }: ResourceCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(isBookmarkedInitial);
  const [loading, setLoading] = useState(false);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);
      if (isBookmarked) {
        await ParentService.unbookmarkResource(post.id);
        setIsBookmarked(false);
        if (onBookmarkChange) onBookmarkChange(post.id, false);
      } else {
        await ParentService.bookmarkResource(post.id);
        setIsBookmarked(true);
        if (onBookmarkChange) onBookmarkChange(post.id, true);
      }
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link 
      href={`/blog/${post.slug || post.id}`} 
      target="_blank"
      rel="noopener noreferrer"
      className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col h-full block ${compact ? 'text-sm' : ''}`}
    >
      <div className={`relative w-full shrink-0 overflow-hidden bg-slate-100 ${compact ? 'h-28' : 'h-48'}`}>
        {post.thumbnailUrl ? (
          <img 
            src={post.thumbnailUrl} 
            alt={post.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-gradient-to-br from-indigo-50 to-purple-50">
            <span className="font-medium text-xs uppercase tracking-wider text-indigo-300/80">Infano Article</span>
          </div>
        )}
        {!hideBookmark && (
          <button 
            onClick={toggleBookmark}
            disabled={loading}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all hover:scale-110 active:scale-95"
            title={isBookmarked ? "Remove bookmark" : "Bookmark this article"}
          >
            <Bookmark 
              size={18} 
              className={`transition-colors ${isBookmarked ? "fill-indigo-500 text-indigo-500" : "text-slate-400"}`} 
            />
          </button>
        )}
      </div>
      <div className={`${compact ? 'p-3' : 'p-5'} flex flex-col flex-1`}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {post.tags?.slice(0, 2).map((tag: string) => (
            <span key={tag} className={`px-2 ${compact ? 'py-0.5 text-[9px]' : 'py-1 text-[10px]'} bg-indigo-50 text-indigo-600 font-bold uppercase tracking-wider rounded-md border border-indigo-100/50`}>
              {tag}
            </span>
          ))}
          {!post.tags?.length && post.categories?.slice(0, 1).map((cat: any) => (
            <span key={cat.id} className="px-2 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-purple-100/50">
              {cat.name}
            </span>
          ))}
        </div>
        
        <h3 className={`${compact ? 'text-sm' : 'text-base'} font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors`}>
          {post.title}
        </h3>
        
        <p className={`${compact ? 'text-xs mb-2' : 'text-sm mb-4'} text-slate-500 line-clamp-2 flex-1`}>
          {post.summary || "Read this article to learn more about the topic and support your daughter's journey."}
        </p>
        
        <div className={`flex items-center justify-between text-[11px] font-bold tracking-wide text-slate-400 border-t border-slate-50 ${compact ? 'pt-2' : 'pt-4'} mt-auto`}>
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
            <Clock size={12} className="text-slate-500" />
            {post.readTime || 5} MIN READ
          </div>
          {post.author ? (
            <div className="truncate max-w-[120px] text-slate-500">
              BY {post.author.name.toUpperCase()}
            </div>
          ) : (
            <div className="truncate max-w-[120px] text-slate-500">
              BY INFANO
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
