'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Bell, User, Settings, LogOut } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { usePathname } from 'next/navigation';
import { blogService } from '@/services/blog.service';

export function Navbar() {
  const pathname = usePathname();
  const { toggleTheme, theme } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const isBlogPage = pathname?.startsWith('/blog');

  useEffect(() => {
    setMounted(true);
    if (isBlogPage) {
      loadCategories();
    }
  }, [isBlogPage]);

  const loadCategories = async () => {
    try {
      const cats = await blogService.getCategories() as any;
      setCategories(cats.slice(0, 5)); // Show top 5 categories
    } catch (error) {
      console.error('Failed to load nav categories:', error);
    }
  };

  // Sync theme with document class
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, mounted]);

  return (
    <nav className="sticky top-0 z-50 glass-card mx-4 mt-4 mb-2 rounded-2xl px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-all">
            <div className="w-6 h-6 bg-primary rounded-lg shadow-glow" />
          </div>
          <span className="font-black text-xl tracking-tighter text-foreground">
            Infano<span className="text-primary">Care</span>
          </span>
        </Link>

        {isBlogPage && categories.length > 0 && (
          <div className="hidden lg:flex items-center gap-1 pl-6 border-l border-primary/10">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/blog?category=${cat.id}`}
                className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <Link href="/about" className="hover:text-primary transition-colors">About</Link>
        <Link href="/blog" className={`hover:text-primary transition-colors ${isBlogPage ? 'text-primary' : ''}`}>Blog</Link>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 hover:bg-secondary rounded-xl transition-colors"
        >
          {!mounted ? '🌙' : theme === 'light' ? '🌙' : '☀️'}
        </button>
        <div className="h-8 w-px bg-border mx-2 hidden sm:block" />
        <Link href="/admin/login" className="hidden sm:block text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">
          Admin
        </Link>
        <Link href="/get-started" className="btn-primary text-xs px-6 py-3 rounded-xl uppercase tracking-widest font-black">
          Join Us
        </Link>
      </div>
    </nav>
  );
}
