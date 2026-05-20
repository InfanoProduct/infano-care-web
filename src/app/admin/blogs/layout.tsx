'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Tag, Users, MousePointer2 } from 'lucide-react';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin/blogs', icon: LayoutDashboard },
    { name: 'Posts', href: '/admin/blogs/posts', icon: FileText },
    { name: 'Categories', href: '/admin/blogs/categories', icon: Tag },
    { name: 'Authors', href: '/admin/blogs/authors', icon: Users },
    { name: 'CTAs', href: '/admin/blogs/ctas', icon: MousePointer2 },
  ];

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <div className="admin-subnav flex items-center gap-2 p-2 bg-secondary/20 backdrop-blur-md rounded-2xl border border-border/50 w-fit overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin/blogs' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <item.icon size={16} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        {children}
      </div>
    </div>
  );
}
