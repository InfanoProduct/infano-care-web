'use client';

import { Search, X } from 'lucide-react';
import { getCategoryColor } from '@/lib/utils';

interface BlogListingHeaderProps {
  categories: any[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function BlogListingHeader({
  categories,
  selectedCategory,
  onCategorySelect,
  search,
  onSearchChange,
}: BlogListingHeaderProps) {
  return (
    <div className="space-y-10 mb-16">
      {/* Date and Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <h1 className="blog-heading text-5xl lg:text-7xl">The Journal</h1>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search stories..."
            className="w-full bg-muted/50 border border-transparent focus:border-primary/20 rounded-none py-4 pl-12 pr-10 text-sm font-medium outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-4 flex items-center text-muted-foreground hover:text-black transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Categories Menu */}
      <div className="border-y border-gray-100 py-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => onCategorySelect(null)}
            className={`px-6 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-none ${
              selectedCategory === null
                ? 'bg-black text-white'
                : 'hover:bg-gray-100 text-muted-foreground'
            }`}
          >
            All Stories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className={`px-6 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-none ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 text-muted-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
