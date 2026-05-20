"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Activity, BookOpen, Shield, Users, Zap, ChevronDown, LogOut 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { AuthService } from '@/services/auth.service';
import { apiClient } from '@/lib/api-client';

export default function MentorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, clearAuth, user, token, refreshToken, setAuth } = useAuthStore();
  const [status, setStatus] = useState('Active');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const refreshedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Token refresh: run once on mount if authenticated
  useEffect(() => {
    if (!isAuthenticated || !refreshToken || refreshedRef.current) return;
    refreshedRef.current = true;

    const doRefresh = async () => {
      try {
        const data: any = await AuthService.refreshToken(refreshToken);
        // Re-use same user but update tokens
        setAuth(data.accessToken, data.refreshToken, user);
      } catch {
        // Refresh failed - but don't force logout, let the access token expire naturally
        console.warn('[PeerLine] Token refresh failed. Continuing with existing token.');
      }
    };

    // Refresh after 14 minutes (token TTL is 15 min)
    const refreshTimeout = setTimeout(doRefresh, 14 * 60 * 1000);
    return () => clearTimeout(refreshTimeout);
  }, [isAuthenticated, refreshToken]);

  // Auth & certification gate
  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated || !user) {
      router.push('/peerline/login');
      return;
    }

    const isAuthorized =
      user.role === 'PEER' ||
      (user.role === 'TEEN' && user.peerApplicationStatus === 'approved');

    if (!isAuthorized) {
      router.push('/peerline/login');
      return;
    }

    // If user is a TEEN with approved application (not yet certified),
    // force them to the training page unless they're already there
    if (user.role === 'TEEN' && user.peerApplicationStatus === 'approved') {
      const isOnTrainingOrAssessment =
        pathname.startsWith('/peerline/dashboard/training') ||
        pathname.startsWith('/peerline/dashboard/assessment');
      
      if (!isOnTrainingOrAssessment) {
        // Check certification status from backend
        apiClient.get('/peerline/training/status').then((res: any) => {
          if (res.certificationStatus !== 'certified') {
            router.push('/peerline/dashboard/training');
          }
        }).catch(() => {
          router.push('/peerline/dashboard/training');
        });
      }
    }
  }, [mounted, isAuthenticated, user, pathname, router]);

  const NAVIGATION = [
    { id: 'dashboard', name: 'Dashboard', icon: Activity, href: '/peerline/dashboard' },
    { id: 'training', name: 'Training', icon: BookOpen, href: '/peerline/dashboard/training' },
    { id: 'community', name: 'The Circle', icon: Users, href: '/the-support-circle' },
  ];

  const STATUS_OPTIONS = [
    { name: 'Active', desc: 'Receiving matches', color: 'bg-green-500' },
    { name: 'At Capacity', desc: 'Existing only', color: 'bg-amber-500' },
    { name: 'Paused', desc: 'Break', color: 'bg-slate-400' }
  ];

  const currentStatusObj = STATUS_OPTIONS.find(s => s.name === status);
  const currentPathName = pathname.split('/').pop() || 'Overview';

  const handleLogout = () => {
    clearAuth();
    router.push('/peerline/login');
  };

  if (!mounted) return null;

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-400 animate-pulse">Verifying session...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/40">
              <Shield size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">PeerLine</span>
          </div>

          <nav className="space-y-2 flex-1">
            {NAVIGATION.map((item) => {
              const isActive = pathname === item.href || (item.id === 'dashboard' && pathname === '/peerline/dashboard');
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                    isActive 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="bg-white/5 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-black text-xs">
                  {user?.phone?.[3]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'P'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{user?.phone || user?.username || 'Peer Mentor'}</div>
                  <div className="text-[10px] text-purple-400 font-bold tracking-widest uppercase">
                    {user?.peerApplicationStatus === 'approved' ? 'Trainee' : 'Verified Mentor'}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 ml-72">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4 text-slate-400 font-bold text-sm">
            <span>Portal</span>
            <span>/</span>
            <span className="text-slate-900 capitalize">{currentPathName === 'dashboard' ? 'Overview' : currentPathName}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-100">
              <Zap size={16} className="text-purple-600" />
              <span className="text-sm font-black text-purple-700">PeerLine Portal</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all"
              >
                <div className={`w-2.5 h-2.5 rounded-full ${currentStatusObj?.color}`} />
                <span className="text-sm font-bold text-slate-900">{status}</span>
                <ChevronDown size={16} className="text-slate-400" />
              </button>

              {isStatusMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.name}
                      onClick={() => { setStatus(opt.name); setIsStatusMenuOpen(false); }}
                      className="w-full text-left p-4 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{opt.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{opt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
