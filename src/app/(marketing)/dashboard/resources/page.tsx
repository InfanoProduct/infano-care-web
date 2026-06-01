"use client";

import React, { useState, useEffect } from 'react';
import { ParentService } from '@/services/parent.service';
import { ResourceCard } from '@/features/parent/components/ResourceCard';
import { BookOpen, Bookmark, Library, Search, Loader2 } from 'lucide-react';

export default function ResourceLibraryPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'puberty' | 'parenting' | 'mental-health' | 'bookmarks'>('all');
  const [resources, setResources] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Resources are public — always loads
      const resData = await ParentService.getResources();
      setResources(resData);

      // Bookmarks require auth — fail silently if not logged in or token expired
      ParentService.getBookmarks()
        .then(bookmarkData => setBookmarks(bookmarkData))
        .catch(() => setBookmarks([]));
    } catch (error) {
      console.error("Failed to fetch library data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkChange = (postId: string, isBookmarked: boolean) => {
    if (isBookmarked) {
      const resource = resources.find(r => r.id === postId);
      if (resource && !bookmarks.find(b => b.id === postId)) {
        setBookmarks(prev => [resource, ...prev]);
      }
    } else {
      setBookmarks(prev => prev.filter(b => b.id !== postId));
    }
  };

  const filteredResources = () => {
    // Deduplicate posts by ID in case the database returns duplicates
    const uniqueMap = new Map();
    const sourceList = activeTab === 'bookmarks' ? bookmarks : resources;
    sourceList.forEach(item => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });
    let list = Array.from(uniqueMap.values());
    
    // Helper to check if a blog post matches our category keywords
    const matchesCategory = (r: any, keywords: string[]) => {
      const inTags = r.tags?.some((t: string) => keywords.some(k => t.toLowerCase().includes(k)));
      const inCategories = r.categories?.some((c: any) => keywords.some(k => c.name.toLowerCase().includes(k)));
      return inTags || inCategories;
    };

    // Filter by category tab
    if (activeTab === 'puberty') {
      list = list.filter(r => matchesCategory(r, ['puberty', 'body', 'physical']));
    } else if (activeTab === 'parenting') {
      list = list.filter(r => matchesCategory(r, ['parent', 'family', 'teen']));
    } else if (activeTab === 'mental-health') {
      list = list.filter(r => matchesCategory(r, ['mental', 'wellbeing', 'mind', 'emotion']));
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        r.title?.toLowerCase().includes(q) || 
        r.summary?.toLowerCase().includes(q) ||
        matchesCategory(r, [q])
      );
    }

    return list;
  };

  const displayList = filteredResources();

  return (
    <div className="space-y-8">
      <div className="admin-header flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
          <p className="text-muted-foreground mt-1">
            Expert articles and guides to help you support your daughter's journey.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search articles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Library size={16} />
          All Resources
        </button>
        <button
          onClick={() => setActiveTab('puberty')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'puberty' ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <BookOpen size={16} />
          Puberty Guide
        </button>
        <button
          onClick={() => setActiveTab('parenting')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'parenting' ? 'bg-purple-500 text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <BookOpen size={16} />
          Parenting Tips
        </button>
        <button
          onClick={() => setActiveTab('mental-health')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'mental-health' ? 'bg-teal-500 text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <BookOpen size={16} />
          Mental Health
        </button>
        <div className="w-px h-6 bg-slate-200 mx-2 hidden md:block" />
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'bookmarks' ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Bookmark size={16} className={activeTab === 'bookmarks' ? 'fill-white' : ''} />
          My Bookmarks ({bookmarks.length})
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm font-medium">Loading resources...</p>
        </div>
      ) : displayList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayList.map(post => (
            <ResourceCard 
              key={post.id} 
              post={post} 
              isBookmarkedInitial={bookmarks.some(b => b.id === post.id)}
              onBookmarkChange={handleBookmarkChange}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-sm">
            {activeTab === 'bookmarks' ? <Bookmark size={24} /> : <Library size={24} />}
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            {activeTab === 'bookmarks' ? 'No bookmarks yet' : 'No resources found'}
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto text-sm">
            {activeTab === 'bookmarks' 
              ? 'Articles you bookmark will appear here for easy access, and will be shared with your daughter.'
              : 'Try adjusting your search or selecting a different category to find what you are looking for.'}
          </p>
        </div>
      )}
    </div>
  );
}
