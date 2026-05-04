'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, Calendar, Settings, ShieldCheck, LogOut, 
  BookOpen, FileText, ShoppingBag, ChevronDown, Zap, Globe, 
  UserCheck, Ticket, MapPin 
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const isLoginPage = pathname === '/admin/login';

  const handleLogout = () => {
    clearAuth();
    document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin/login');
  };

  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { name: 'User Management', icon: Users, href: '/admin/users' },
    { name: 'Learning Journeys', icon: BookOpen, href: '/admin/learning' },
    { name: 'Blogs', icon: FileText, href: '/admin/blogs' },
    { 
      name: 'Connect', 
      icon: Zap, 
      subItems: [
        { name: 'Circles', icon: Globe, href: '/admin/connect/circles' },
        { name: 'Peers', icon: UserCheck, href: '/admin/connect/peers' },
        { name: 'Events', icon: Ticket, href: '/admin/connect/events' },
        { name: 'Friends', icon: MapPin, href: '/admin/connect/friends' },
      ]
    },
    { 
      name: 'Book', 
      icon: ShoppingBag, 
      subItems: [
        { name: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
        { name: 'Manage Books', icon: BookOpen, href: '/admin/books' },
      ]
    },
    { name: 'System Settings', icon: Settings, href: '/admin/settings' },
  ];

  useEffect(() => {
    // Auto-expand items that have active children on mount
    const activeItems = menuItems
      .filter(item => item.subItems?.some(sub => pathname.startsWith(sub.href)))
      .map(item => item.name);
    
    setExpandedItems(prev => Array.from(new Set([...prev, ...activeItems])));
  }, [pathname]);

  if (isLoginPage) return <>{children}</>;

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className="w-80 border-r border-border p-8 flex flex-col gap-10 hidden lg:flex bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <ShieldCheck size={28} />
          </div>
          <div>
            <p className="font-extrabold text-xl leading-tight tracking-tight">Admin<span className="text-primary">Panel</span></p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1 opacity-70">Infano Care v2.0</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            if (item.subItems) {
              const isSubActive = item.subItems.some(sub => pathname.startsWith(sub.href));
              const isExpanded = expandedItems.includes(item.name);
              
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`flex items-center justify-between w-full px-5 py-4 rounded-2xl transition-all duration-300 group ${
                      isSubActive 
                        ? 'bg-primary/5 text-primary' 
                        : 'hover:bg-primary/5 text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={22} className={isSubActive ? 'text-primary' : 'group-hover:scale-110 transition-transform'} />
                      <span className="font-bold text-[15px]">{item.name}</span>
                    </div>
                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      <ChevronDown size={18} />
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="pl-6 space-y-1 animate-in slide-in-from-top-2 duration-300">
                      {item.subItems.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 group ${
                              isSubActive 
                                ? 'text-primary bg-primary/10' 
                                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                            }`}
                          >
                            <sub.icon size={18} className={isSubActive ? 'text-primary' : ''} />
                            <span className="font-bold text-[14px]">{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'nav-item-active' 
                    : 'hover:bg-primary/5 text-muted-foreground hover:text-primary'
                }`}
              >
                <item.icon size={22} className={isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                <span className="font-bold text-[15px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-8 border-t border-border">
          <div className="bg-secondary/50 rounded-2xl p-4 mb-6 flex items-center gap-3 border border-primary/5">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              JD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-foreground">John Doe</p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Super Admin</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            suppressHydrationWarning
            className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all font-bold group"
          >
            <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
