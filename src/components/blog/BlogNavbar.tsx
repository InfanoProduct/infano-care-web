'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { blogService } from '@/services/blog.service';

export function BlogNavbar() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await blogService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load blog categories:', error);
    }
  };

  return (
    <div className="w-full bg-white border-b border-gray-100">

      {/* Top Bar */}
      <div className="hidden lg:block border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-between text-[11px] blog-meta-text">
          <div className="flex items-center gap-6">
            <span>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/advertise" className="hover:underline">Advertise</Link>
          </div>

        </div>
      </div>

      {/* Main Header */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="blog-heading text-xl">
          Infano<span className="text-primary">Care</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          <Link href="/" className="blog-post-title text-base">
            Home
          </Link>

          {/* Categories Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 blog-post-title text-base">
              Categories <ChevronDown size={14} />
            </button>

            <div className="absolute top-full left-0 mt-3 w-64 bg-white border border-gray-100 shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.id}`}
                  className="block px-3 py-2 text-base blog-meta-text hover:text-black transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/blog" className="blog-post-title text-base">
            Journal
          </Link>

          <Link href="/podcasts" className="blog-post-title text-base">
            Podcasts
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">

          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 hover:bg-gray-100 transition"
          >
            <Search size={18} />
          </button>

          <button className="hidden sm:block blog-category-tag bg-black">
            Subscribe
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Search */}
      {isSearchOpen && (
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-3xl mx-auto px-6 py-6">
            <input
              autoFocus
              type="text"
              placeholder="Search articles..."
              className="w-full border-b border-gray-200 py-3 text-lg blog-heading outline-none"
            />
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white p-6 space-y-6">
          <Link href="/" className="blog-heading text-lg">Home</Link>
          <Link href="/blog" className="blog-heading text-lg">Journal</Link>

          <div>
            <p className="blog-section-title text-xs mb-3">Categories</p>
            <div className="space-y-2">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.id}`}
                  className="block blog-meta-text"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}