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
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/10">
              <ShieldCheck size={20} />
            </div>
            <span className="font-bold text-lg tracking-tighter text-slate-800">
              Infano<span className="text-primary">Care</span>
            </span>
          </Link>

          <div className="h-6 w-px bg-slate-200 hidden md:block" />

          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isTeen ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-600'
            }`}>
            <Sparkles size={11} />
            {isTeen ? 'Teen Workspace' : 'Parent Portal'}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <NotificationBell />

          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 py-1 pl-2.5 pr-3.5 rounded-xl">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm ${isTeen ? 'bg-purple-500' : 'bg-rose-500'
              }`}>
              {user.phone ? user.phone.slice(-4) : 'U'}
            </div>
            <div className="text-left leading-none">
              <p className="text-xs font-semibold text-slate-800 truncate max-w-[100px]">{user.phone || 'User'}</p>
              <p className="text-[9px] font-medium text-slate-400 mt-0.5">{user.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2.5 text-slate-400 hover:text-rose-500 bg-slate-50 border border-slate-100 hover:bg-rose-50 rounded-xl transition-all shadow-sm active:scale-95"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Responsive Workspace Grid with Left Sidebar */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row gap-6">

        {/* Elegant Sidebar Panel */}
        <aside className="w-full md:w-60 shrink-0">
          <div className="sticky top-20 bg-white border border-slate-100/80 rounded-xl p-5 shadow-md shadow-slate-200/10 space-y-5">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 block px-2.5">
                Workspace Menu
              </span>
              <nav className="space-y-0.5">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${isActive('/dashboard')
                      ? 'bg-primary/10 text-primary shadow-sm font-black'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  <LayoutDashboard size={14} />
                  Overview
                </Link>
                <Link
                  href="/dashboard/enrolled-programs"
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${isActive('/dashboard/enrolled-programs')
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  <Layers size={14} />
                  Enrolled Programs
                </Link>
                <Link
                  href="/dashboard/learning-journeys"
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${isActivePrefix('/dashboard/learning-journeys')
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  <GraduationCap size={14} />
                  Learning Journeys
                </Link>
                <Link
                  href="/dashboard/payments"
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${isActive('/dashboard/payments')
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  <CreditCard size={14} />
                  Payment Details
                </Link>
                {!isTeen && (
                  <Link
                    href="/dashboard/expert-sessions"
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${isActive('/dashboard/expert-sessions')
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                  >
                    <Calendar size={14} />
                    Expert Sessions
                  </Link>
                )}
                {!isTeen && (
                  <Link
                    href="/dashboard/resources"
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${isActive('/dashboard/resources')
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                  >
                    <BookOpen size={14} />
                    Library
                  </Link>
                )}
                {isTeen && (
                  <Link
                    href="/dashboard/expert-sessions"
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${isActive('/dashboard/expert-sessions')
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                  >
                    <Calendar size={14} />
                    My Sessions
                  </Link>
                )}
                <Link
                  href="/dashboard/parent"
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${isActive('/dashboard/parent')
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  <User size={14} />
                  {isTeen ? 'Link Parent' : 'Link Daughter'}
                </Link>
                <Link
                  href="/dashboard/profile"
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${isActive('/dashboard/profile')
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  <User size={14} />
                  Profile
                </Link>
              </nav>
            </div>

            {/* Quick help widget card */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 space-y-2">
              <h5 className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Parent Support</h5>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Need to reschedule sessions or have billing questions?
              </p>
              <a
                href="https://wa.me/916362994347"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-primary transition-all rounded-lg text-[10px] font-bold shadow-sm"
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
