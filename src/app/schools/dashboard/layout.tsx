'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, LogOut, LayoutDashboard, Calendar, Users, 
  Award, Heart, Sparkles, BookOpen, ChevronDown, MessageSquare 
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { SchoolService, School } from '@/services/school.service';
import { toast } from 'react-hot-toast';

export default function SchoolCoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, clearAuth, user } = useAuthStore();
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth & Role Guard
  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || !user) {
      router.push('/schools/login');
      return;
    }
    if (user.role !== 'SCHOOL_COORDINATOR' && user.role !== 'ADMIN' && user.role !== 'OPS_MANAGER') {
      router.push('/dashboard');
    }
  }, [mounted, isAuthenticated, user, router]);

  // Load School Metadata
  useEffect(() => {
    if (!mounted || !user) return;
    
    // We get the schoolId associated with the coordinator User profile session
    const schoolId = user.schoolId;
    if (!schoolId) {
      setIsLoading(false);
      return;
    }

    const loadSchool = async () => {
      try {
        const data = await SchoolService.getSchoolById(schoolId);
        setSchool(data);
      } catch (err: any) {
        console.warn('Failed to load coordinator school layout details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSchool();
  }, [mounted, user]);

  const handleLogout = () => {
    clearAuth();
    document.cookie = 'customer-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/schools/login');
  };

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFAF7] font-extrabold text-primary animate-pulse">
        Initializing School Workspace...
      </div>
    );
  }

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'SEEDING': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'GROW': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'THRIVE': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF9] flex flex-col font-sans">
      
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <ShieldCheck size={22} />
            </div>
            <span className="font-black text-lg tracking-tighter text-slate-800">
              Infano<span className="text-primary">Care</span>
            </span>
          </Link>

          {school && (
            <>
              <div className="h-6 w-px bg-slate-200" />
              <div className="text-left leading-none hidden md:block">
                <span className="text-xs font-black text-slate-800 line-clamp-1">{school.name}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                  {school.city} ({school.board})
                </span>
              </div>
              <span className={`px-2.5 py-0.5 border text-[9px] font-black rounded-full uppercase tracking-wider ${getTierColor(school.tier)}`}>
                {school.tier} Partner
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* User Profile Summary */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 py-1.5 pl-3 pr-4 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs shadow-sm">
              {school?.coordinatorName ? school.coordinatorName[0].toUpperCase() : 'C'}
            </div>
            <div className="text-left leading-none">
              <p className="text-xs font-black text-slate-800 truncate max-w-[120px]">{school?.coordinatorName || 'Coordinator'}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">School representative</p>
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

      {/* Main Grid with Left Sidebar */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 bg-white border border-slate-100 rounded-2xl p-6 shadow-xl shadow-slate-200/20 space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-3">
                Partner Menu
              </span>
              <nav className="space-y-1">
                <Link 
                  href="/schools/dashboard" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive('/schools/dashboard') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  Overview
                </Link>
                
                <Link 
                  href="/schools/dashboard/programme" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive('/schools/dashboard/programme') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <BookOpen size={16} />
                  MOU Programme
                </Link>

                <Link 
                  href="/schools/dashboard/sessions" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive('/schools/dashboard/sessions') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Calendar size={16} />
                  Sessions Schedule
                </Link>

                <Link 
                  href="/schools/dashboard/students" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive('/schools/dashboard/students') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Users size={16} />
                  Student Funnel
                </Link>

                <Link 
                  href="/schools/dashboard/teachers" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive('/schools/dashboard/teachers') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Award size={16} />
                  Teacher Training
                </Link>

                <Link 
                  href="/schools/dashboard/wellness" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive('/schools/dashboard/wellness') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Heart size={16} />
                  Wellness Trends
                </Link>

                <Link 
                  href="/schools/dashboard/badge" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive('/schools/dashboard/badge') 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Sparkles size={16} />
                  School Badge
                </Link>
              </nav>
            </div>

            {/* POC Card Contact Details */}
            {school?.assignedOpsManager && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <MessageSquare size={10} className="text-slate-400" />
                  Your Program Lead
                </h5>
                <p className="text-xs font-black text-slate-800 leading-none">
                  {school.assignedOpsManager.profile?.displayName || 'Infano Representative'}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-0.5">
                  Have scheduling requests or need manual support?
                </p>
                <a 
                  href={`https://wa.me/${school.assignedOpsManager.phone?.replace('+', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block text-center py-2 bg-primary hover:bg-primary-dark text-white hover:shadow-md transition-all rounded-xl text-[10px] font-extrabold shadow-sm uppercase tracking-wider"
                >
                  Contact Manager
                </a>
              </div>
            )}
          </div>
        </aside>

        {/* Dynamic Inner Workspace Child Content */}
        <main className="flex-1 min-w-0">
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
