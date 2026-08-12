'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShieldCheck, LogOut, LayoutDashboard, Calendar, Compass, User,
  Sparkles, CreditCard, BookOpen, Layers, GraduationCap, Menu, X,
  ChevronLeft, ChevronRight, Package, MessageSquare, Video
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { AuthService } from '@/services/auth.service';
import { NotificationBell } from '@/features/parent/components/NotificationBell';
import { OnboardingModal } from '@/components/common/OnboardingModal';
import { apiClient } from '@/lib/api-client';
import { BecomePeerMentorModal } from '@/components/peerline/BecomePeerMentorModal';

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const refreshedRef = useRef(false);
  const [avatarPhoto, setAvatarPhoto] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [certificationStatus, setCertificationStatus] = useState<string>('loading');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const fetchPeerStatus = async () => {
      try {
        const res: any = await apiClient.get('/peerline/training/status');
        setCertificationStatus(res.certificationStatus || 'unregistered');
      } catch {
        setCertificationStatus('unregistered');
      }
    };
    fetchPeerStatus();
  }, [isAuthenticated, user]);

  // Sync profile photo in layout header
  useEffect(() => {
    if (user?.id) {
      if (user.profile?.avatarUrl) {
        setAvatarPhoto(user.profile.avatarUrl);
      } else {
        const storedPhoto = localStorage.getItem(`profileAvatar_${user.id}`);
        if (storedPhoto) {
          setAvatarPhoto(storedPhoto);
        } else {
          setAvatarPhoto(null);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
    // Sync collapse state from local storage
    const val = localStorage.getItem('sidebar-collapsed');
    if (val === 'true') {
      setIsCollapsed(true);
    }

    // Apply customer-dashboard class to body for portalled components
    document.body.classList.add('customer-dashboard');
    return () => {
      document.body.classList.remove('customer-dashboard');
    };
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

  // Fetch full user profile (and refresh on window focus)
  const profileFetchedRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || !user || !accessToken) return;

    const fetchUserProfile = async () => {
      try {
        const fullUser = await AuthService.getMe();
        if (fullUser) {
          setAuth(accessToken, refreshToken || '', {
            ...user,
            email: fullUser.email,
            profile: fullUser.profile,
            role: fullUser.role,
            peerApplication: fullUser.peerApplication,
            onboardingStep: fullUser.onboardingStep,
            onboardingCompletedAt: fullUser.onboardingCompletedAt,
            isOnboardingCompleted: fullUser.isOnboardingCompleted,
            ageAtSignup: fullUser.ageAtSignup,
            birthYear: fullUser.birthYear,
            birthMonth: fullUser.birthMonth,
            contentTier: fullUser.contentTier,
          });
          if (fullUser.profile?.avatarUrl && fullUser.id) {
            localStorage.setItem(`profileAvatar_${fullUser.id}`, fullUser.profile.avatarUrl);
          }
        }
      } catch (err) {
        console.warn('[Dashboard] Failed to fetch user profile:', err);
      }
    };

    if (!profileFetchedRef.current) {
      profileFetchedRef.current = true;
      fetchUserProfile();
    }

    // Instantly sync role/profile changes when switching back to this tab
    const handleFocus = () => fetchUserProfile();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated, accessToken]);

  // Auth Guard
  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
  }, [mounted, isAuthenticated, user, router]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    clearAuth();
    document.cookie = 'customer-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  if (!mounted) return null;

  const showOnboardingModal =
    !!(mounted &&
      isAuthenticated &&
      user &&
      user.role !== 'ADMIN' &&
      user.role !== 'EXPERT' &&
      user.role !== 'PEER' &&
      (user.onboardingStep === undefined || user.onboardingStep < 5) &&
      !user.isOnboardingCompleted);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFAF7] font-extrabold text-primary animate-pulse">
        Verifying Session...
      </div>
    );
  }

  // Episode & Course Player Isolation check: bypass dashboard shell for cleaner full-screen player experience
  if (pathname.includes('/episodes/') || (pathname.includes('/dashboard/courses/') && !pathname.endsWith('/courses') && !pathname.includes('/explore'))) {
    return <div className="min-h-screen bg-background overflow-hidden">{children}</div>;
  }

  const isTeen = user.role === 'TEEN' || (user.role === 'PEER' && user.contentTier && user.contentTier !== 'ADULT');

  // Navigation Items
  const menuItems = user.role === 'EXPERT' ? [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/program-sessions', label: 'Program Sessions', icon: Layers, matchPrefix: true },
    { href: '/dashboard/expert-consultations', label: 'My Consultations', icon: Calendar },
    { href: '/dashboard/calendar', label: 'My Calendar', icon: Calendar },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
  ] : [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/enrolled-programs', label: 'Enrolled Programs', icon: Layers },
    { href: '/dashboard/courses', label: 'Explore Courses', icon: Video, matchPrefix: true },
    { href: '/dashboard/my-courses', label: 'My Courses', icon: BookOpen, matchPrefix: true },
    { href: '/dashboard/orders', label: 'My Orders', icon: Package },
    ...(!isTeen ? [{ href: '/dashboard/expert-sessions', label: 'My Consultations', icon: Calendar }] : []),
    ...(!isTeen ? [{ href: '/dashboard/resources', label: 'Library', icon: BookOpen }] : []),
    ...(isTeen ? [{ href: '/dashboard/expert-sessions', label: 'My Consultations', icon: Calendar }] : []),
    { href: '/dashboard/parent', label: isTeen ? 'Link Parent' : 'Link Daughter', icon: User },
    ...(user.role === 'PEER' ? [{ href: '/dashboard/my-chats', label: 'My Chats', icon: MessageSquare }] : []),
    { href: '/dashboard/profile', label: 'Profile', icon: User },
  ];

  const isLinkActive = (item: { href: string; label: string; icon: any; matchPrefix?: boolean }) => {
    if (item.matchPrefix) {
      return pathname === item.href || pathname.startsWith(item.href + '/');
    }
    return pathname === item.href;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between py-6 px-3.5">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className={`flex items-center px-2.5 h-14 ${isCollapsed ? 'justify-center' : ''}`}>
          <Link href="/" className="flex items-center shrink-0 w-full h-full relative">
            {isCollapsed ? (
              <div className="w-10 h-10 relative flex items-center justify-center overflow-hidden">
                <img
                  src="/logo/infano-logo-for-light-bg.png"
                  alt="Infano Logo"
                  className="w-28 max-w-none h-11 object-contain object-left"
                />
              </div>
            ) : (
              <img
                src="/logo/infano-logo-for-light-bg.png"
                alt="Infano Logo"
                className="h-11 sm:h-12 object-contain object-left animate-in fade-in duration-300 scale-105 origin-left"
              />
            )}
          </Link>
        </div>

        {/* Workspace Mode Badge */}
        {!isCollapsed ? (
          <div className="px-2">
            {user.role === 'EXPERT' ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-2xs border bg-indigo-50/90 text-indigo-700 border-indigo-200/80">
                <Sparkles size={13} className="text-indigo-500" />
                Expert Portal
              </div>
            ) : (
              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-2xs border ${isTeen
                ? 'bg-purple-50/90 text-purple-700 border-purple-200/80'
                : 'bg-rose-50/90 text-rose-600 border-rose-200/80'
                }`}>
                <Sparkles size={13} className={isTeen ? 'text-purple-500' : 'text-rose-500'} />
                {isTeen ? 'Teen Workspace' : 'Parent Portal'}
              </div>
            )}
          </div>
        ) : null}

        {/* Navigation Links */}
        <div className="space-y-1.5 pt-1">
          {!isCollapsed && (
            <span className="text-[10px] font-extrabold text-slate-400 block px-3 uppercase tracking-widest mb-2">
              WORKSPACE MENU
            </span>
          )}
          <nav className="space-y-1">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const active = isLinkActive(item);

              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[14px] font-medium transition-all duration-300 ${active
                    ? 'bg-primary text-white shadow-none'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-primary'
                    } ${isCollapsed ? 'justify-center px-3.5 py-3.5 rounded-xl' : ''}`}
                >
                  <Icon size={20} className={`shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all duration-300'}`} />

                  {!isCollapsed ? (
                    <span className="animate-in fade-in duration-200 tracking-tight">{item.label}</span>
                  ) : (
                    /* Tooltip for collapsed mode */
                    <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-black tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Support & Collapse Slat */}
      <div className="space-y-4 pt-4 border-t border-slate-200/70">
        {/* Support Widget */}
        {!isCollapsed ? (
          <div className="bg-linear-to-br from-slate-50 to-slate-100/90 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 animate-in fade-in duration-300 shadow-2xs">
            <h5 className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Parent Support</h5>
            <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
              Need to reschedule sessions or have billing questions?
            </p>
            <a
              href="https://wa.me/916362994347"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-all rounded-xl text-[11px] font-extrabold shadow-xs active:scale-95"
            >
              Chat on WhatsApp
            </a>
          </div>
        ) : (
          /* Collapsed WhatsApp Button */
          <a
            href="https://wa.me/916362994347"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm mx-auto active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[10px] font-black tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
              WhatsApp Support
            </span>
          </a>
        )}

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleCollapse}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/70 transition-all text-xs font-bold ${isCollapsed ? 'justify-center' : ''
            }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span>Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#FAF9FC] customer-dashboard">

      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-full bg-white border-r border-slate-200/80 shrink-0 select-none transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Slide-out Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />
          {/* Drawer Body */}
          <aside className="relative flex flex-col w-64 h-full bg-white border-r border-slate-100 z-10 animate-in slide-in-from-left-4 duration-300">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-55 border border-slate-100 text-slate-500 hover:text-slate-800"
            >
              <X size={16} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Right Core Workspace Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Universal Top Header */}
        <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/70 px-6 flex items-center justify-between shadow-2xs shrink-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all md:hidden active:scale-95 shadow-xs"
            >
              <Menu size={18} />
            </button>

            {/* Mobile-only branding display */}
            <div className="md:hidden flex items-center h-10 w-32 relative">
              <Link href="/" className="w-full h-full relative flex items-center">
                <img
                  src="/logo/infano-logo-for-light-bg.png"
                  alt="Infano Logo"
                  className="h-9 object-contain object-left"
                />
              </Link>
            </div>

            {/* Desktop breadcrumb or workspace status */}
            <span className="hidden md:inline-block text-xs font-bold text-slate-400 capitalize">
              Dashboard / {pathname.split('/').filter(Boolean)[1] || 'Overview'}
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Peer Training / Become a Peer Top Bar Button */}
            {user.role !== 'EXPERT' && user.role !== 'PEER' && (
              certificationStatus === 'unregistered' ? (
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md bg-[#431872] hover:bg-[#3B1C71] text-white shadow-purple-900/10 active:scale-95 cursor-pointer"
                >
                  <Sparkles size={18} className="text-white shrink-0" />
                  <span>Become a Peer</span>
                </button>
              ) : (
                <Link
                  href="/dashboard/peer-training"
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md active:scale-95 ${
                    pathname.startsWith('/dashboard/peer-training')
                      ? 'bg-[#3B1C71] text-white ring-2 ring-purple-300 shadow-purple-200'
                      : 'bg-[#431872] hover:bg-[#3B1C71] text-white shadow-purple-900/10'
                  }`}
                >
                  <Sparkles size={18} className="text-white shrink-0" />
                  <span>Peer Training</span>
                </Link>
              )
            )}

            <NotificationBell />

            <div className="flex items-center gap-2.5 bg-slate-50/50 border border-slate-100/80 py-1 pl-2.5 pr-3.5 rounded-xl">
              <div className={`w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0 ${isTeen ? 'bg-purple-500' : 'bg-rose-500'
                }`}>
                {avatarPhoto ? (
                  <img src={avatarPhoto} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.profile?.displayName
                    ? user.profile.displayName.charAt(0).toUpperCase()
                    : user?.username
                      ? user.username.charAt(0).toUpperCase()
                      : 'U'
                )}
              </div>
              <div className="text-left leading-none">
                <p className="text-xs font-semibold text-slate-800 truncate max-w-30" title={user?.profile?.displayName || user?.username || 'User'}>
                  {user?.profile?.displayName || user?.username || 'User'}
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
                  {user.role === 'TEEN' ? 'Teen' : user.role === 'PARENT' ? 'Parent' : (user.role.charAt(0) + user.role.slice(1).toLowerCase())}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-rose-500 bg-slate-50/50 border border-slate-105 hover:bg-rose-50 rounded-xl transition-all shadow-xs active:scale-95 shrink-0"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8 bg-[#FAF9FC] custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <div
            onClick={() => setShowLogoutConfirm(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />
          {/* Modal content */}
          <div
            className="relative bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border border-slate-100/80 text-center space-y-5 z-10 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
              <LogOut size={22} />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-800 text-lg">Confirm Sign Out</h3>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                Are you sure you want to log out of your session?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-bold transition-all active:scale-98"
              >
                No, Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-3 px-4 rounded-2xl bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-black shadow-md shadow-rose-200/50 hover:shadow-rose-300/60 transition-all active:scale-98"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Onboarding Modal Overlay for incomplete profiles */}
      <OnboardingModal isOpen={showOnboardingModal} />

      {/* Become a Peer Mentor Modal */}
      <BecomePeerMentorModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => setCertificationStatus('pending_training')}
        user={user}
      />

    </div>
  );
}
