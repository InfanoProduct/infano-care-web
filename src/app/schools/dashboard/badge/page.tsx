'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, Award, CheckCircle2, Download, Calendar, 
  ArrowRight, ShieldCheck, HelpCircle, Star, PhoneCall 
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { SchoolService, School } from '@/services/school.service';
import { toast } from 'react-hot-toast';

export default function SchoolBadgePage() {
  const { user } = useAuthStore();
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.schoolId) return;

    const loadSchool = async () => {
      try {
        const data = await SchoolService.getSchoolById(user.schoolId!);
        setSchool(data);
      } catch (err: any) {
        toast.error('Failed to load certification details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSchool();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading certification data...</p>
        </div>
      </div>
    );
  }

  // Calculate days remaining until renewal
  const getDaysRemaining = (renewDateStr?: string) => {
    if (!renewDateStr) return 365;
    const renewDate = new Date(renewDateStr);
    const today = new Date();
    const diffTime = renewDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = getDaysRemaining(school?.badge?.renewsAt);
  const badgePercent = school?.badge?.criteriaCompletion ?? 75; // Default demo progress if none exists

  // Standard B2B Certification Checklist
  const certificationCriteria = [
    {
      id: 1,
      title: 'MOU & Data Protection Agreement Signed',
      description: 'Signed B2B program agreement & DPDP Act compliance forms.',
      status: true,
    },
    {
      id: 2,
      title: 'In-School Sessions Completed (Attendance ≥ 85%)',
      description: 'Physical core curriculum workshops facilitated with positive attendance logs.',
      status: (school?.sessions && school.sessions.filter(s => s.status === 'COMPLETED').length >= 2) || false,
    },
    {
      id: 3,
      title: 'Teacher Training Literacy Completion',
      description: 'At least 1 core teacher has finalized all puberty, mental health & POCSO modules.',
      status: (school?.teachers && school.teachers.some(t => t.completedModules.length > 0)) || false,
    },
    {
      id: 4,
      title: 'App Activation Milestones (Onboarding ≥ 80%)',
      description: 'Active teen registration counts matching B2B contracted licenses.',
      status: badgePercent >= 100,
    }
  ];

  const certified = badgePercent >= 100;

  const handleDownloadPack = () => {
    toast.success('Initiating media assets package download...');
    // In a real app, this downloads co-branded PNG banners for the website and notices
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 text-white rounded-3xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="bg-white/10 text-white border border-white/20 px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 backdrop-blur-md">
            <Award size={10} className="text-amber-400" />
            Infano Wellness Certified Institution
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none">
            Adolescent Wellness Certification
          </h1>
          <p className="text-white/80 text-xs md:text-sm font-medium leading-relaxed">
            Validate and showcase your commitment to female adolescent health, mental resilience, and holistic age-progressive growth.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Col 1 & 2: Interactive Badge View & Checklist */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Interactive Golden Badge Display */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/20 text-center relative overflow-hidden space-y-6">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-6">
              
              {/* The Certified Badge Logo */}
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                
                {/* Glow ring */}
                <div className={`absolute inset-0 rounded-full animate-pulse blur-md ${
                  certified 
                    ? 'bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-500 opacity-30'
                    : 'bg-slate-200 opacity-20'
                }`} />

                {/* Outer ring */}
                <div className={`w-44 h-44 rounded-full border-4 flex items-center justify-center shadow-lg p-2 ${
                  certified 
                    ? 'border-amber-400 bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600'
                    : 'border-slate-300 bg-slate-100'
                }`}>
                  <div className="w-full h-full rounded-full bg-slate-900 border-2 border-slate-800 flex flex-col items-center justify-center p-3 text-center text-white relative">
                    <Award size={36} className={certified ? 'text-amber-400' : 'text-slate-400'} />
                    <span className="text-[10px] font-black tracking-widest uppercase mt-1 block">INFANO</span>
                    <span className="text-[7px] font-bold text-slate-400 tracking-widest uppercase block">WELLNESS</span>
                    
                    <div className="w-full h-px bg-slate-800 my-1.5" />
                    
                    <span className="text-[8px] font-black uppercase text-amber-300 tracking-wider">
                      {certified ? 'CERTIFIED' : 'PARTNER'}
                    </span>
                    <span className="text-[6px] font-bold text-slate-500 tracking-widest block uppercase mt-0.5">
                      {school?.board || 'BOARD'}
                    </span>

                    {school?.badge?.isFoundingSchool && (
                      <div className="absolute -bottom-2 bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black text-[7px] border border-slate-900 uppercase tracking-widest">
                        FOUNDING PARTNER
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Header */}
              <div className="space-y-2">
                <div className="inline-flex gap-2 justify-center">
                  {school?.badge?.isFoundingSchool && (
                    <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-[8px] font-black rounded-full uppercase tracking-widest flex items-center gap-1">
                      <Star size={8} fill="currentColor" /> Founding Partner
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 text-[8px] font-black rounded-full border uppercase tracking-widest ${
                    certified 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    {certified ? 'Active Certified' : 'Certification In Progress'}
                  </span>
                </div>

                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  {school?.name || 'Your School'}
                </h2>
                
                <p className="text-slate-400 text-xs font-semibold leading-relaxed max-w-sm mx-auto">
                  {certified 
                    ? `Officially certified wellness partner under year ${school?.badge?.yearOfCertification}. Certified school logo is valid for offline boards, social handles, and press coverage.`
                    : `Complete the remaining implementation checklist below to unlock your school certification badge and media package.`
                  }
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  disabled={!certified}
                  onClick={handleDownloadPack}
                  className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 shadow-sm border ${
                    certified
                      ? 'bg-primary hover:bg-primary-dark border-primary-dark text-white hover:shadow-md'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Download size={14} />
                  Download Media Pack
                </button>
                
                <a
                  href="/schools/dashboard/programme"
                  className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100 hover:text-slate-800 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 text-center flex items-center justify-center gap-1"
                >
                  Check MOU Config
                  <ArrowRight size={14} />
                </a>
              </div>

            </div>
          </div>

          {/* Eligibility Requirements Checklist */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/20 space-y-5">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary" />
                Certification Criteria Checklist
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                Your school program audit updates dynamically as session checkins, onboarding, and training completions log in the system.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {certificationCriteria.map((crit) => (
                <div key={crit.id} className="py-4 flex items-start gap-4 justify-between">
                  <div className="space-y-1">
                    <h5 className={`text-xs font-extrabold leading-none ${crit.status ? 'text-slate-800' : 'text-slate-600'}`}>
                      {crit.title}
                    </h5>
                    <p className="text-[10px] text-slate-400 leading-normal font-medium max-w-md">
                      {crit.description}
                    </p>
                  </div>
                  
                  {crit.status ? (
                    <span className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                    </span>
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0" title="Incomplete">
                      <HelpCircle size={16} />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Col 3: Certification Details, Countdown, Renewal Forms */}
        <div className="space-y-8">
          
          {/* Audit Metrics Circular Progress */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/20 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
              Criteria Completion
            </h3>

            <div className="flex items-center gap-5 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#E66A90" strokeWidth="3"
                    strokeDasharray={`${badgePercent} 100`}
                    strokeDashoffset="0"
                  />
                </svg>
                <span className="absolute text-[10px] font-black text-slate-800">{badgePercent}%</span>
              </div>
              <div className="space-y-0.5 leading-tight">
                <span className="text-[9px] font-black uppercase text-primary tracking-widest block">Audit Index</span>
                <p className="text-xs font-black text-slate-800">
                  {badgePercent >= 100 ? 'Audit Requirement Fulfilled' : 'Final audit parameters pending'}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Currently checking all 4 school performance standards.
                </p>
              </div>
            </div>
          </div>

          {/* Renewal & Countdown Card */}
          <div className="bg-[#FFFDF6] border border-[#FBEFCD] rounded-3xl p-6 shadow-xl shadow-amber-200/5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FAF1D6] text-amber-700 rounded-2xl flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <div className="leading-tight">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Certification validity</h4>
                <p className="text-[10px] text-slate-400 font-medium">Valid through next audit cycle</p>
              </div>
            </div>

            <div className="border-t border-amber-200/50 pt-4 grid grid-cols-2 gap-4">
              <div className="space-y-0.5 leading-none">
                <span className="text-[8px] font-black uppercase text-amber-600 tracking-wider">Audits Countdown</span>
                <p className="text-2xl font-black text-slate-800 mt-1">{daysLeft} Days</p>
              </div>
              <div className="space-y-0.5 leading-none">
                <span className="text-[8px] font-black uppercase text-amber-600 tracking-wider">Renewal Date</span>
                <p className="text-xs font-extrabold text-slate-800 mt-1.5">
                  {school?.badge?.renewsAt ? new Date(school.badge.renewsAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : 'June 2027'}
                </p>
              </div>
            </div>

            <p className="text-[10px] text-amber-700 leading-normal font-semibold">
              Certification auto-renews at the beginning of each academic school year audit provided all physical sessions and license agreements are correctly logged.
            </p>
          </div>

          {/* Call Representative for Support / Renewals */}
          {school?.assignedOpsManager && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/20 space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <PhoneCall size={12} className="text-primary" />
                  Renewal Consultation
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Want to extend your curriculum scope, sign next year's MOU, or arrange co-branded wellness newsletters? Contact your program lead.
                </p>
              </div>

              <div className="flex gap-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl items-center">
                <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs">
                  {school.assignedOpsManager.profile?.displayName ? school.assignedOpsManager.profile.displayName[0] : 'M'}
                </div>
                <div className="leading-none text-left flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-800 truncate">{school.assignedOpsManager.profile?.displayName || 'Program Manager'}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Infano B2B Lead</p>
                </div>
              </div>

              <a 
                href={`https://wa.me/${school.assignedOpsManager.phone?.replace('+', '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-center py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm"
              >
                Schedule consultation
              </a>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
