'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck, LogOut, LayoutDashboard, Calendar, Compass, User, Sparkles, CreditCard, BookOpen, Layers, GraduationCap, Menu, X } from 'lucide-react';
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
  const { isAuthenticated, clearAuth, user, refreshToken, accessToken, setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const refreshedRef = useRef(false);

  const isActive = (path: string) => pathname === path;
  const isActivePrefix = (path: string) => pathname === path || pathname.startsWith(path + '/');

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

  // Fetch full user profile (including name and email) on mount — once only
  const profileFetchedRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || !user || !accessToken || profileFetchedRef.current) return;
    // Skip if we already have profile data
    if (user.profile) {
      profileFetchedRef.current = true;
      return;
    }

    profileFetchedRef.current = true;
    const fetchUserProfile = async () => {
      try {
        const fullUser = await AuthService.getMe();
        if (fullUser) {
          setAuth(accessToken, refreshToken || '', {
            ...user,
            email: fullUser.email,
            profile: fullUser.profile,
          });
        }
      } catch (err) {
        console.warn('[Dashboard] Failed to fetch user profile:', err);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, accessToken]);

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
    <div className="min-h-screen bg-[#FFFBF9] flex flex-col customer-dashboard font-sans">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 md:px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 md:gap-6">
          {/* Mobile Hamburguer Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl md:hidden transition-all shrink-0 active:scale-95"
            title="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
              <ShieldCheck size={18} className="md:hidden" />
              <ShieldCheck size={22} className="hidden md:block" />
            </div>
            <span className="font-black text-sm md:text-lg tracking-tighter text-slate-800">
              Infano<span className="text-primary">Care</span>
            </span>
          </Link>

          <div className="h-6 w-px bg-slate-200 hidden md:block" />
          
          <div className={`items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider hidden md:flex ${
            isTeen ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-600'
          }`}>
            <Sparkles size={11} />
            {isTeen ? 'Teen Workspace' : 'Parent Portal'}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <NotificationBell />

          {/* User profile details - hidden on mobile header, shown inside sidebar drawer */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-100 py-1.5 pl-3 pr-4 rounded-2xl">
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
            className="hidden sm:block p-3 text-slate-400 hover:text-rose-500 bg-slate-50 border border-slate-100 hover:bg-rose-50 rounded-2xl transition-all shadow-sm active:scale-95"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Navigation Slide-out Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex animate-in fade-in duration-300">
          {/* Backdrop blur overlay */}
          <div 
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Sidebar Panel */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col p-6 shadow-2xl animate-in slide-in-from-left duration-300">
            
            {/* Header: User Profile details & Close */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm ${
                  isTeen ? 'bg-purple-500' : 'bg-rose-500'
                }`}>
                  {user.phone ? user.phone.slice(-4) : 'U'}
                </div>
                <div className="text-left leading-none">
                  <p className="text-xs font-black text-slate-800 truncate max-w-[130px]">{user.phone || 'User'}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{user.role}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
                title="Close Menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation links inside drawer */}
            <div className="flex-1 overflow-y-auto py-5 space-y-6">
              <nav className="space-y-1">
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-205 ${
                    isActive('/dashboard') 
                      ? 'bg-primary/10 text-primary shadow-sm font-black' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  Overview
                </Link>
                <Link 
                  href="/dashboard/enrolled-programs" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-205 ${
                    isActive('/dashboard/enrolled-programs') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Layers size={16} />
                  Enrolled Programs
                </Link>
                <Link 
                  href="/dashboard/learning-journeys" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-205 ${
                    isActivePrefix('/dashboard/learning-journeys') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <GraduationCap size={16} />
                  Learning Journeys
                </Link>
                <Link 
                  href="/dashboard/payments" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-205 ${
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
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-205 ${
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
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-205 ${
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
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-205 ${
                      isActive('/dashboard/expert-sessions') 
                        ? 'bg-primary/10 text-primary shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Calendar size={16} />
                    My Sessions
                  </Link>
                )}
                <Link 
                  href="/dashboard/parent" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-205 ${
                    isActive('/dashboard/parent') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <User size={16} />
                  {isTeen ? 'Link Parent' : 'Link Daughter'}
                </Link>
                <Link 
                  href="/dashboard/profile" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-205 ${
                    isActive('/dashboard/profile') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <User size={16} />
                  Profile
                </Link>
              </nav>

              {/* Support panel in drawer */}
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

            {/* Logout button inside drawer */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 font-black text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-95"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Responsive Workspace Grid with Left Sidebar */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Elegant Sidebar Panel - Hidden on Mobile/Tablet */}
        <aside className="hidden md:block w-full md:w-64 shrink-0">
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
                  href="/dashboard/enrolled-programs" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive('/dashboard/enrolled-programs') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Layers size={16} />
                  Enrolled Programs
                </Link>
                <Link 
                  href="/dashboard/learning-journeys" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isActivePrefix('/dashboard/learning-journeys') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <GraduationCap size={16} />
                  Learning Journeys
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-205 ${
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
                <Link 
                  href="/dashboard/profile" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive('/dashboard/profile') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <User size={16} />
                  Profile
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
