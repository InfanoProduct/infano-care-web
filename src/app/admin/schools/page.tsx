'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Shield, MapPin, Calendar, Award, 
  Users, CheckCircle2, ChevronRight, Loader2, RefreshCw 
} from 'lucide-react';
import { SchoolService, School } from '@/services/school.service';
import { toast } from 'react-hot-toast';

export default function AdminSchoolsListPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  const fetchSchools = async () => {
    setIsLoading(true);
    try {
      const data = await SchoolService.getSchools({
        search: search || undefined,
        status: statusFilter || undefined,
        tier: tierFilter || undefined,
      });
      setSchools(data);
    } catch (err: any) {
      toast.error('Failed to load registered schools.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [statusFilter, tierFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchools();
  };

  // Metrics calculators
  const activeSchools = schools.filter(s => s.status === 'ACTIVE').length;
  const seedingCount = schools.filter(s => s.tier === 'SEEDING').length;
  const growCount = schools.filter(s => s.tier === 'GROW').length;
  const thriveCount = schools.filter(s => s.tier === 'THRIVE').length;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'SEEDING': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'GROW': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'THRIVE': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'PENDING_ONBOARDING': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'INACTIVE': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-10 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">B2B Operations</span>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-3">School Partnerships</h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">Configure, monitor, and deploy Infano Care programmes for partner schools.</p>
        </div>
        
        <Link 
          href="/admin/schools/new"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-extrabold px-6 py-4 rounded-2xl hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 active:scale-95 text-sm"
        >
          <Plus size={18} />
          Register New School
        </Link>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xl shadow-slate-200/30 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Partners</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{schools.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xl shadow-slate-200/30 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Schools</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{activeSchools}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xl shadow-slate-200/30 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
            <Award size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Thrive Tiers</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{thriveCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xl shadow-slate-200/30 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Seeding & Grow</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{seedingCount + growCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-3xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by school name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-primary/10"
            >
              <option value="">All Statuses</option>
              <option value="PENDING_ONBOARDING">Pending Onboarding</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <select 
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-primary/10"
            >
              <option value="">All Tiers</option>
              <option value="SEEDING">Seeding</option>
              <option value="GROW">Grow</option>
              <option value="THRIVE">Thrive</option>
              <option value="CUSTOM">Custom</option>
            </select>

            <button 
              type="submit"
              className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-6 py-3 rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-wider"
            >
              Search
            </button>
            
            <button 
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setTierFilter('');
                fetchSchools();
              }}
              className="p-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-2xl transition-all"
              title="Reset Filters"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Schools List Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading School Partnerships...</p>
        </div>
      ) : schools.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Shield size={28} />
          </div>
          <h3 className="text-lg font-black text-slate-700">No schools found</h3>
          <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, status filters, or register a new B2B partner to begin onboarding.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schools.map((school) => (
            <div 
              key={school.id}
              className="bg-white border border-slate-100 hover:border-primary/20 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 tracking-wider block uppercase">{school.schoolId}</span>
                    <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-primary transition-colors line-clamp-1 mt-1">{school.name}</h3>
                  </div>
                  
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(school.status)}`}>
                    {school.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 pt-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{school.city} ({school.board})</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-slate-400" />
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wide ${getTierColor(school.tier)}`}>
                      {school.tier}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 col-span-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span>Validity: {new Date(school.mouValidityStart).toLocaleDateString()} - {new Date(school.mouValidityEnd).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Sub-counts overview */}
                <div className="flex gap-4 pt-4 border-t border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div>
                    Sessions: <span className="text-slate-700 font-extrabold">{school._count?.sessions ?? 0}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-200" />
                  <div>
                    Enrolled Girls: <span className="text-slate-700 font-extrabold">{school._count?.students ?? 0}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-200" />
                  <div>
                    Teachers: <span className="text-slate-700 font-extrabold">{school._count?.teachers ?? 0}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 flex items-center justify-between border-t border-slate-50">
                <div className="text-xs font-semibold text-slate-400">
                  Manager: <span className="text-slate-700 font-black">{school.assignedOpsManager?.profile?.displayName || 'Unassigned'}</span>
                </div>

                <Link 
                  href={`/admin/schools/${school.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-primary group-hover:translate-x-1 transition-transform uppercase tracking-wider hover:underline"
                >
                  Manage Onboarding
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
