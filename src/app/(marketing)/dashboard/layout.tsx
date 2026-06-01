'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck, LogOut, LayoutDashboard, Calendar, Compass, User, Sparkles, CreditCard, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { AuthService } from '@/services/auth.service';
import { NotificationBell } from '@/features/parent/components/NotificationBell';

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, clearAuth, user, refreshToken, setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const refreshedRef = useRef(false);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync token refresh on mount
  useEffect(() => {
    if (!isAuthenticated || !refreshToken || refreshedRef.current) return;
    refreshedRef.current = true;

    const doRefresh = async () => {
      try {
        const data: any = await AuthService.refreshToken(refreshToken);
        setAuth(data.accessToken, data.refreshToken, user);
      } catch {
        console.warn('[Dashboard] Token refresh session notice.');
      }
    };

    const refreshTimeout = setTimeout(doRefresh, 14 * 60 * 1000);
    return () => clearTimeout(refreshTimeout);
  }, [isAuthenticated, refreshToken, user, setAuth]);

  // Auth Guard
  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    const isAuthorized = user.role === 'TEEN' || user.role === 'PARENT' || user.role === 'GUARDIAN';
    
    // If they are admin or expert, let them in but notify (or redirect if appropriate)
    // To make development smooth, we allow them to access but focus on customer layouts
  }, [mounted, isAuthenticated, user, router]);

  const handleLogout = () => {
    clearAuth();
    document.cookie = 'customer-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  if (!mounted) return null;

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFAF7] font-extrabold text-primary animate-pulse">
        Verifying Session...
      </div>
    );
  }

  const isTeen = user.role === 'TEEN';

  return (
    <div className="min-h-screen bg-[#FFFBF9] flex flex-col font-sans">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <ShieldCheck size={22} />
            </div>
            <span className="font-black text-lg tracking-tighter text-slate-800">
              Infano<span className="text-primary">Care</span>
            </span>
          </Link>

          <div className="h-6 w-px bg-slate-200" />
          
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            isTeen ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-600'
          }`}>
            <Sparkles size={11} />
            {isTeen ? 'Teen Workspace' : 'Parent Portal'}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 py-1.5 pl-3 pr-4 rounded-2xl">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm ${
              isTeen ? 'bg-purple-500' : 'bg-rose-500'
            }`}>
              {user.phone ? user.phone.slice(-4) : 'U'}
            </div>
            <div className="text-left leading-none">
              <p className="text-xs font-black text-slate-800 truncate max-w-[100px]">{user.phone || 'User'}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{user.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-3 text-slate-400 hover:text-rose-500 bg-slate-50 border border-slate-100 hover:bg-rose-50 rounded-2xl transition-all shadow-sm active:scale-95"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Responsive Workspace Grid with Left Sidebar */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Elegant Sidebar Panel */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 bg-white border border-slate-100/80 rounded-2xl p-6 shadow-xl shadow-slate-200/20 space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-3">
                Workspace Menu
              </span>
              <nav className="space-y-1">
                <Link 
                  href="/dashboard" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive('/dashboard') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  Overview
                </Link>
                <Link 
                  href="/dashboard/payments" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive('/dashboard/payments') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <CreditCard size={16} />
                  Payment Details
                </Link>
                {!isTeen && (
                  <Link 
                    href="/dashboard/expert-sessions" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                      isActive('/dashboard/expert-sessions') 
                        ? 'bg-primary/10 text-primary shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Calendar size={16} />
                    Expert Sessions
                  </Link>
                )}
                {!isTeen && (
                  <Link 
                    href="/dashboard/resources" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                      isActive('/dashboard/resources') 
                        ? 'bg-primary/10 text-primary shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <BookOpen size={16} />
                    Library
                  </Link>
                )}
                {isTeen && (
                  <Link 
                    href="/dashboard/expert-sessions" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                      isActive('/dashboard/expert-sessions') 
                        ? 'bg-primary/10 text-primary shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Calendar size={16} />
                    My Sessions
                  </Link>
                ) }
                <Link 
                  href="/dashboard/parent" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive('/dashboard/parent') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <User size={16} />
                  {isTeen ? 'Link Parent' : 'Link Daughter'}
                </Link>
              </nav>
            </div>
            
            {/* Quick help widget card */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
              <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Parent Support</h5>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Need to reschedule sessions or have billing questions?
              </p>
              <a 
                href="https://wa.me/916362994347" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block text-center py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-primary transition-all rounded-xl text-[10px] font-bold shadow-sm"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 min-w-0">
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
