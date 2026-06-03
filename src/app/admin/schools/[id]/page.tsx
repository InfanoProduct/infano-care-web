'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Building, Calendar, Settings, Users, 
  Award, Shield, FileText, CheckCircle2, AlertCircle, 
  Loader2, Plus, Edit, Trash2, CalendarDays, Upload, 
  FileSpreadsheet, ClipboardList, Send 
} from 'lucide-react';
import { SchoolService, School, SchoolSession, SchoolProgramConfig } from '@/services/school.service';
import { toast } from 'react-hot-toast';

export default function AdminSchoolDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PROGRAM' | 'SESSIONS' | 'STUDENTS'>('OVERVIEW');

  // Load School details
  const fetchSchool = async () => {
    try {
      const data = await SchoolService.getSchoolById(id);
      setSchool(data);
    } catch (err: any) {
      toast.error('Failed to load school onboarding records.');
      router.push('/admin/schools');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchool();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <Loader2 className="animate-spin text-primary animate-duration-1000" size={36} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Partnership Dashboard...</p>
      </div>
    );
  }

  if (!school) return null;

  return (
    <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Back & Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/schools"
            className="p-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl transition-all shadow-sm active:scale-95 shrink-0"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                {school.schoolId}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                school.status === 'ACTIVE' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-sky-50 text-sky-700 border-sky-100'
              }`}>
                {school.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-2">{school.name}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl">
          <span>Assigned Ops Manager:</span>
          <span className="text-slate-800 font-black">{school.assignedOpsManager?.profile?.displayName || 'Unassigned'}</span>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 pb-px scrollbar-none">
        {(['OVERVIEW', 'PROGRAM', 'SESSIONS', 'STUDENTS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-xs font-black uppercase tracking-wider border-b-2 whitespace-nowrap transition-all duration-200 active:scale-95 ${
              activeTab === tab 
                ? 'border-primary text-primary font-black' 
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dynamic Tab Contents */}
      <div className="mt-4">
        {activeTab === 'OVERVIEW' && <OverviewTab school={school} onUpdate={fetchSchool} />}
        {activeTab === 'PROGRAM' && <ProgramTab school={school} onUpdate={fetchSchool} />}
        {activeTab === 'SESSIONS' && <SessionsTab school={school} onUpdate={fetchSchool} />}
        {activeTab === 'STUDENTS' && <StudentsTab school={school} onUpdate={fetchSchool} />}
      </div>
    </div>
  );
}

// ─── TAB 1: OVERVIEW TAB ──────────────────────────────────────────────────────
function OverviewTab({ school, onUpdate }: { school: School; onUpdate: () => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* School Registry Metadata */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 space-y-6 shadow-sm lg:col-span-2">
        <h3 className="text-md font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
          <Building className="text-primary" size={18} />
          School Profile Information
        </h3>
        
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm font-semibold">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Education Board</span>
            <p className="text-slate-800">{school.board}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City Location</span>
            <p className="text-slate-800">{school.city}</p>
          </div>
          <div className="space-y-0.5 col-span-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">School Address</span>
            <p className="text-slate-800 leading-relaxed">{school.address || 'No address registered'}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal Name</span>
            <p className="text-slate-800">{school.principalName || 'Not specified'}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal Designation</span>
            <p className="text-slate-800">{school.principalDesignation || 'Principal'}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal Email</span>
            <p className="text-slate-800 truncate select-all">{school.principalEmail || 'Not specified'}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal Phone</span>
            <p className="text-slate-800 select-all">{school.principalPhone || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* MOU Contract Summary */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 space-y-6 shadow-sm">
        <h3 className="text-md font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
          <Award className="text-primary" size={18} />
          MOU Contract Info
        </h3>
        
        <div className="space-y-5 text-sm font-semibold">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partnership Tier</span>
            <p className="text-primary font-black uppercase tracking-wider mt-0.5">{school.tier}</p>
          </div>
          
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MOU Validity Period</span>
            <p className="text-slate-800 mt-0.5">
              {new Date(school.mouValidityStart).toLocaleDateString()} - {new Date(school.mouValidityEnd).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contract Value (Internal)</span>
            <p className="text-slate-800 font-extrabold text-lg mt-0.5">₹{school.totalMouValue?.toLocaleString('en-IN') || '0'}</p>
          </div>

          <div className="space-y-0.5 pt-3 border-t border-slate-50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Coordinator</span>
            <p className="text-slate-800 font-bold mt-1">{school.coordinatorName}</p>
            <p className="text-slate-500 font-medium text-xs mt-0.5 select-all">{school.coordinatorEmail}</p>
            <p className="text-slate-500 font-medium text-xs select-all">{school.coordinatorPhone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 2: PROGRAM TAB (MOU CONFIG) ──────────────────────────────────────────
function ProgramTab({ school, onUpdate }: { school: School; onUpdate: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<Partial<SchoolProgramConfig>>(school.programConfig || {
    gradesEnrolled: [],
    sessionsPerGrade: 3,
    totalStudentsContracted: 0,
    teacherTrainingSessions: 1,
    teacherTrainingDuration: 'HALF_DAY',
    teacherTrainingModules: [],
    parentWelcomeKit: false,
    parentWelcomeKitQuantity: 0,
    reportingFrequency: 'QUARTERLY',
    certifiedSchoolBadge: true,
    mediaCoverageSupport: false,
    mediaCoverageTier: '',
    socialMediaContentPack: true,
    annualWellnessDay: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await SchoolService.configureProgram(school.id, form);
      toast.success('Program MOU deliverables configuration saved!');
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (name: string, value: string, isChecked: boolean) => {
    const list = (form[name as keyof SchoolProgramConfig] as string[]) || [];
    const newList = isChecked ? [...list, value] : list.filter(item => item !== value);
    setForm({ ...form, [name]: newList });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm space-y-10">
      
      {/* Grades & Enrolled details */}
      <div className="space-y-6">
        <h3 className="text-md font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
          <Users className="text-primary" size={18} />
          Student Deliverables Config
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Grades Enrolled</label>
            <div className="flex flex-wrap gap-3 mt-1.5">
              {['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'].map(grade => {
                const isChecked = form.gradesEnrolled?.includes(grade) ?? false;
                return (
                  <label 
                    key={grade}
                    className={`px-4 py-2 border-2 rounded-2xl text-xs font-bold cursor-pointer transition-all ${
                      isChecked 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      className="hidden"
                      onChange={(e) => handleCheckboxChange('gradesEnrolled', grade, e.target.checked)}
                    />
                    {grade}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Physical Sessions Per Grade *</label>
            <input 
              type="number" 
              value={form.sessionsPerGrade}
              onChange={(e) => setForm({ ...form, sessionsPerGrade: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
              min={1}
              max={10}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Contracted Students *</label>
            <input 
              type="number" 
              value={form.totalStudentsContracted}
              onChange={(e) => setForm({ ...form, totalStudentsContracted: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Teacher Training config */}
      <div className="space-y-6">
        <h3 className="text-md font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
          <Award className="text-primary" size={18} />
          Teacher Training Parameters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Training Sessions</label>
            <input 
              type="number" 
              value={form.teacherTrainingSessions}
              onChange={(e) => setForm({ ...form, teacherTrainingSessions: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
              min={0}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Session Duration</label>
            <select 
              value={form.teacherTrainingDuration}
              onChange={(e) => setForm({ ...form, teacherTrainingDuration: e.target.value as any })}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
            >
              <option value="HALF_DAY">Half-day training</option>
              <option value="FULL_DAY">Full-day training</option>
            </select>
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Modules Covered</label>
            <div className="flex flex-wrap gap-3 mt-1.5">
              {['Puberty Literacy', 'Mental Health', 'POCSO', 'LGBTQ+', 'Self-Harm', 'Digital Safety'].map(mod => {
                const isChecked = form.teacherTrainingModules?.includes(mod) ?? false;
                return (
                  <label 
                    key={mod}
                    className={`px-4 py-2 border-2 rounded-2xl text-xs font-bold cursor-pointer transition-all ${
                      isChecked 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      className="hidden"
                      onChange={(e) => handleCheckboxChange('teacherTrainingModules', mod, e.target.checked)}
                    />
                    {mod}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Parent layer welcome kits */}
      <div className="space-y-6">
        <h3 className="text-md font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
          <Shield className="text-primary" size={18} />
          Welcome Kits & Reporting
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
            <input 
              type="checkbox" 
              id="parentWelcomeKit"
              checked={form.parentWelcomeKit}
              onChange={(e) => setForm({ ...form, parentWelcomeKit: e.target.checked })}
              className="w-5 h-5 accent-primary"
            />
            <label htmlFor="parentWelcomeKit" className="text-xs font-black text-slate-700 uppercase tracking-wider select-none cursor-pointer">
              Parent Welcome Kits Contracted
            </label>
          </div>

          {form.parentWelcomeKit && (
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Kits Quantity *</label>
              <input 
                type="number" 
                value={form.parentWelcomeKitQuantity}
                onChange={(e) => setForm({ ...form, parentWelcomeKitQuantity: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                min={0}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Reporting Frequency</label>
            <select 
              value={form.reportingFrequency}
              onChange={(e) => setForm({ ...form, reportingFrequency: e.target.value })}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
            >
              <option value="QUARTERLY">Quarterly Reports</option>
              <option value="SEMI_ANNUAL">Semi-annual Reports</option>
              <option value="ANNUAL">Annual Report Only</option>
            </select>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
            <input 
              type="checkbox" 
              id="certifiedSchoolBadge"
              checked={form.certifiedSchoolBadge}
              onChange={(e) => setForm({ ...form, certifiedSchoolBadge: e.target.checked })}
              className="w-5 h-5 accent-primary"
            />
            <label htmlFor="certifiedSchoolBadge" className="text-xs font-black text-slate-700 uppercase tracking-wider select-none cursor-pointer">
              Certified School Badge Eligible
            </label>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
        <button 
          type="submit"
          disabled={isLoading}
          className="bg-primary hover:bg-primary-dark text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 duration-200 text-xs uppercase tracking-wider flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Saving Configuration...
            </>
          ) : (
            'Save Deliverables Configuration'
          )}
        </button>
      </div>
    </form>
  );
}

// ─── TAB 3: SESSIONS TAB (SCHEDULING) ──────────────────────────────────────────
function SessionsTab({ school, onUpdate }: { school: School; onUpdate: () => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [form, setForm] = useState({
    grade: '',
    curriculumModule: '',
    proposedDate: '',
    proposedTime: '',
    venue: '',
    facilitatorId: '',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-teal-50 text-teal-700 border-teal-100';
      case 'CONFIRMED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'SCHEDULED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'RESCHEDULED': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-rose-50 text-rose-600 border-rose-100';
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await SchoolService.scheduleSession(school.id, form);
      toast.success('Physical in-school session scheduled successfully!');
      setForm({ grade: '', curriculumModule: '', proposedDate: '', proposedTime: '', venue: '', facilitatorId: '' });
      setShowAddForm(false);
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Failed to schedule session.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-black text-slate-800 uppercase tracking-wider">Scheduled Physical Sessions</h3>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-5 py-3 rounded-2xl transition-all duration-300 active:scale-95 text-xs uppercase tracking-wider"
        >
          <Plus size={16} />
          {showAddForm ? 'Close Scheduler' : 'Schedule Session'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateSession} className="bg-slate-50 border border-slate-100 p-6 md:p-8 rounded-3xl space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Target Grade *</label>
              <select 
                required
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm font-semibold text-slate-700"
              >
                <option value="">Select Grade</option>
                {school.programConfig?.gradesEnrolled.map(g => (
                  <option key={g} value={g}>{g}</option>
                )) || (
                  ['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Curriculum Module *</label>
              <input 
                type="text" 
                required
                value={form.curriculumModule}
                onChange={(e) => setForm({ ...form, curriculumModule: e.target.value })}
                placeholder="e.g. My Body My Story"
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm font-semibold text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Proposed Date *</label>
              <input 
                type="date" 
                required
                value={form.proposedDate}
                onChange={(e) => setForm({ ...form, proposedDate: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm font-semibold text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Proposed Time</label>
              <input 
                type="text" 
                value={form.proposedTime}
                onChange={(e) => setForm({ ...form, proposedTime: e.target.value })}
                placeholder="e.g. 10:30 AM"
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm font-semibold text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Venue / Classroom</label>
              <input 
                type="text" 
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="e.g. Auditorium / Class 6A"
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm font-semibold text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Facilitator (Roster ID)</label>
              <input 
                type="text" 
                value={form.facilitatorId}
                onChange={(e) => setForm({ ...form, facilitatorId: e.target.value })}
                placeholder="User UUID (Optional)"
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm font-semibold text-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary-dark text-white font-extrabold px-6 py-3 rounded-2xl shadow-md transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={14} /> : 'Book Session slot'}
            </button>
          </div>
        </form>
      )}

      {/* Sessions list */}
      {!school.sessions || school.sessions.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <CalendarDays size={22} />
          </div>
          <h4 className="text-sm font-black text-slate-700">No scheduled sessions</h4>
          <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto">
            Book a physical in-school curriculum slot to populate this schedule calendar list.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">Curriculum Module</th>
                  <th className="px-6 py-4">Proposed Schedule</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                {school.sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-slate-800">{session.grade}</td>
                    <td className="px-6 py-4">{session.curriculumModule}</td>
                    <td className="px-6 py-4">
                      {new Date(session.proposedDate).toLocaleDateString()} at {session.proposedTime || 'TBD'}
                      {session.venue && <span className="block text-[10px] text-slate-400 font-bold mt-0.5">Venue: {session.venue}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 border text-[10px] font-black rounded-full uppercase tracking-wider ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {session.status === 'COMPLETED' ? (
                        <div className="space-y-0.5">
                          <p className="text-slate-800 font-black">{session.attendanceRate}% Rate</p>
                          <p className="text-[10px] font-bold text-slate-400">{session.studentHeadcount} Girls</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">TBD</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB 4: STUDENTS TAB (CSV IMPORT) ─────────────────────────────────────────
function StudentsTab({ school, onUpdate }: { school: School; onUpdate: () => void }) {
  const [csvText, setCsvText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewList, setPreviewList] = useState<{ grade: string; section?: string }[]>([]);

  const handleParseCsv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    const rows = csvText.split('\n');
    const list: typeof previewList = [];

    rows.forEach(row => {
      if (!row.trim()) return;
      const cols = row.split(',').map(c => c.trim());
      if (cols.length > 0) {
        const grade = cols[0];
        const section = cols[1] || undefined;
        
        // Basic validation checking
        if (grade && (grade.toLowerCase().startsWith('grade') || grade.toLowerCase().startsWith('class'))) {
          list.push({ grade, section });
        }
      }
    });

    setPreviewList(list);
    toast.success(`Successfully parsed ${list.length} rows! Please review the roster below before saving.`);
  };

  const handleSaveStudents = async () => {
    setIsLoading(true);
    try {
      await SchoolService.importStudents(school.id, previewList);
      toast.success(`Successfully imported ${previewList.length} student records! Anonymized IDs provisioned.`);
      setCsvText('');
      setPreviewList([]);
      onUpdate();
    } catch (err: any) {
      toast.error('Failed to import student roster.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-md font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
            <FileSpreadsheet className="text-primary" size={18} />
            Bulk Import Student Roster (CSV Ingestor)
          </h3>
          <p className="text-xs font-semibold text-slate-400 mt-2">
            Upload the school class roll list. For absolute DPDP Act 2023 compliance, the system auto-anonymizes names and generates sequential Student IDs.
          </p>
        </div>

        <form onSubmit={handleParseCsv} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">CSV Raw Content (Paste grade, section columns)</label>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] font-bold text-slate-400 leading-snug mb-3">
              💡 Format: Grade, Section (One per line). Example:<br />
              Grade 6, Section A<br />
              Grade 6, Section B<br />
              Grade 7, Section A
            </div>
            <textarea 
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Grade 6, A&#10;Grade 6, B&#10;Grade 7, A"
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700 font-mono"
            />
          </div>

          <div className="flex items-center justify-end">
            <button 
              type="submit"
              disabled={!csvText.trim()}
              className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-6 py-3 rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
            >
              Parse Data Rows
            </button>
          </div>
        </form>
      </div>

      {/* Review preview panel */}
      {previewList.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <ClipboardList className="text-primary" size={16} />
              Review Import Roster ({previewList.length} Students)
            </h4>

            <button 
              onClick={handleSaveStudents}
              disabled={isLoading}
              className="bg-primary hover:bg-primary-dark text-white font-extrabold px-6 py-3 rounded-2xl shadow-md transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
              Confirm Bulk Import
            </button>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0">
                <tr>
                  <th className="px-6 py-3">Import Index</th>
                  <th className="px-6 py-3">Roster Grade</th>
                  <th className="px-6 py-3">Section</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                {previewList.map((stud, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-3 font-extrabold text-slate-400">#{idx + 1}</td>
                    <td className="px-6 py-3 font-extrabold text-slate-800">{stud.grade}</td>
                    <td className="px-6 py-3">{stud.section || 'None'}</td>
                    <td className="px-6 py-3 text-emerald-600">Valid Entry</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
