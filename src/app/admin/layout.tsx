'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, Calendar, Settings, ShieldCheck, LogOut, 
  BookOpen, FileText, ShoppingBag, ChevronDown, Zap, Globe, 
  UserCheck, Ticket, MapPin, FileQuestion, Image, Award, CreditCard
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, clearAuth, user } = useAuthStore();
  const isLoginPage = pathname === '/admin/login';
  
  const [mounted, setMounted] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { 
      name: 'School Partnerships', 
      icon: ShieldCheck, 
      subItems: [
        { name: 'Partners List', icon: ShieldCheck, href: '/admin/schools' },
        { name: 'Sessions Calendar', icon: Calendar, href: '/admin/schools/sessions-calendar' },
      ]
    },
    { name: 'User Management', icon: Users, href: '/admin/users' },
    { name: 'Learning Journeys', icon: BookOpen, href: '/admin/learning' },
    { name: 'Learning Programs', icon: Award, href: '/admin/programs' },
    { name: 'Blogs', icon: FileText, href: '/admin/blogs' },
    { name: 'Assets', icon: Image, href: '/admin/assets' },
    { name: 'Transactions', icon: CreditCard, href: '/admin/transactions' },
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
    { name: user?.role === 'EXPERT' ? 'Consultations' : 'Experts & Consultations', icon: Calendar, href: '/admin/expert-consultations' },
    { name: 'Enquiries', icon: FileQuestion, href: '/admin/enquiries' },
    { name: 'System Settings', icon: Settings, href: '/admin/settings' },
  ];

  const filteredMenuItems = user?.role === 'EXPERT'
    ? menuItems.filter(item => ['Learning Programs', 'Connect', 'Consultations', 'Experts & Consultations'].includes(item.name))
    : menuItems;

  useEffect(() => {
    setMounted(true);
    document.body.classList.add('admin-panel');
    return () => {
      document.body.classList.remove('admin-panel');
    };
  }, []);

  useEffect(() => {
    if (!mounted || !user) return;
    
    // Redirect experts away from dashboard or root to Learning Programs
    if (user.role === 'EXPERT' && (pathname === '/admin' || pathname === '/admin/dashboard')) {
      router.push('/admin/programs');
    }
  }, [mounted, user, pathname, router]);

  useEffect(() => {
    if (!mounted) return;
    
    // Auto-expand items that have active children on mount
    const activeItems = filteredMenuItems
      .filter(item => item.subItems?.some(sub => pathname.startsWith(sub.href)))
      .map(item => item.name);
    
    setExpandedItems(prev => Array.from(new Set([...prev, ...activeItems])));
  }, [mounted, pathname, filteredMenuItems]);

  if (!mounted) return null;
  if (isLoginPage) return <>{children}</>;

  const handleLogout = () => {
    clearAuth();
    document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin/login');
  };

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  return (
    <div className="flex min-h-screen bg-background admin-panel">
      {/* Admin Sidebar */}
      <aside className="w-[350px] border-r border-border p-8 flex flex-col gap-10 hidden lg:flex bg-white/50 backdrop-blur-md">
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
          {filteredMenuItems.map((item) => {
            if (item.subItems) {
              const isSubActive = item.subItems.some(sub => pathname.startsWith(sub.href));
              const isExpanded = expandedItems.includes(item.name);
              
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`flex items-center gap-3 w-full px-5 py-4 rounded-2xl transition-all duration-300 group ${
                      isSubActive 
                        ? 'bg-primary/5 text-primary' 
                        : 'hover:bg-primary/5 text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <item.icon size={20} className={`shrink-0 ${isSubActive ? 'text-primary' : 'group-hover:scale-110 transition-transform'}`} />
                    <span className="font-medium text-[14px] flex-1 text-left truncate">{item.name}</span>
                    <ChevronDown size={16} className={`shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isExpanded && (
                    <div className="pl-6 space-y-1 animate-in slide-in-from-top-2 duration-300">
                      {item.subItems.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 group ${
                              isSubActive 
                                ? 'text-primary bg-primary/10' 
                                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                            }`}
                          >
                            <sub.icon size={16} className={isSubActive ? 'text-primary' : ''} />
                            <span className="font-medium text-[13px]">{sub.name}</span>
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
                className={`flex items-center gap-3 w-full px-5 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'nav-item-active' 
                    : 'hover:bg-primary/5 text-muted-foreground hover:text-primary'
                }`}
              >
                <item.icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                <span className="font-medium text-[14px] flex-1 text-left truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-8 border-t border-border">
          <div className="bg-secondary/50 rounded-2xl p-4 mb-6 flex items-center gap-3 border border-primary/5">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-foreground">{user?.username || 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{user?.role === 'ADMIN' ? 'Super Admin' : 'Staff'}</p>
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
