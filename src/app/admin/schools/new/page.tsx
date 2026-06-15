'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, ShieldAlert, CheckCircle2, Copy, 
  Loader2, Sparkles, Building, User, Mail, Phone, Calendar 
} from 'lucide-react';
import { SchoolService } from '@/services/school.service';
import { toast } from 'react-hot-toast';
import { copyToClipboard } from '@/lib/utils';

export default function AdminNewSchoolPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<any | null>(null);

  // Form Fields
  const [form, setForm] = useState({
    name: '',
    board: 'CBSE',
    city: '',
    address: '',
    principalName: '',
    principalDesignation: 'Principal',
    principalEmail: '',
    principalPhone: '',
    coordinatorName: '',
    coordinatorEmail: '',
    coordinatorPhone: '',
    mouSignedDate: '',
    mouValidityStart: '',
    mouValidityEnd: '',
    tier: 'SEEDING',
    totalMouValue: '',
    // Custom config fields
    paymentMode: 'CASH',
    gradesEnrolled: [] as string[],
    sessionsPerGrade: 3,
    totalStudentsContracted: 100,
    teacherTrainingSessions: 1,
    teacherTrainingDuration: 'HALF_DAY',
    parentWelcomeKit: true,
    parentWelcomeKitQuantity: 100,
    reportingFrequency: 'QUARTERLY',
    certifiedSchoolBadge: true,
    mediaCoverageSupport: false,
    socialMediaContentPack: true,
    annualWellnessDay: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggleChange = (name: string) => {
    setForm(prev => ({ ...prev, [name]: !prev[name as keyof typeof prev] }));
  };

  const handleGradeToggle = (grade: string) => {
    setForm(prev => {
      const grades = prev.gradesEnrolled.includes(grade)
        ? prev.gradesEnrolled.filter((g: string) => g !== grade)
        : [...prev.gradesEnrolled, grade];
      return { ...prev, gradesEnrolled: grades };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await SchoolService.registerSchool(form);
      setCredentials(response);
      toast.success('School and coordinator account registered successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to register school.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCredentials = async () => {
    if (!credentials) return;
    const text = `Infano.Care School Login Details:
School ID: ${credentials.school.schoolId}
Temp Password: ${credentials.tempPassword}
Coordinator Username/Email: ${credentials.coordinatorUser.username}
Phone: ${credentials.coordinatorUser.phone}
Login URL: ${window.location.origin}/schools/login`;

    const success = await copyToClipboard(text);
    if (success) {
      toast.success('Credentials copied to clipboard!');
    } else {
      toast.error('Failed to copy credentials');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/schools"
          className="p-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl transition-all shadow-sm active:scale-95 shrink-0"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Register</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1.5">New Partnership Onboarding</h1>
        </div>
      </div>

      {!credentials ? (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/20 space-y-10">
          
          {/* Section 1: School Registry */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building className="text-primary" size={20} />
              School Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">School Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full school name (e.g. Greenwood High School)"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Education Board *</label>
                <select 
                  name="board" 
                  value={form.board}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                >
                  <option value="CBSE">CBSE (Central Board)</option>
                  <option value="ICSE">ICSE / ISC</option>
                  <option value="State Board">State Board</option>
                  <option value="IB">IB / IGCSE</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">City *</label>
                <input 
                  type="text" 
                  name="city" 
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Bangalore"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">School Address</label>
                <textarea 
                  name="address" 
                  rows={2}
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter complete physical address..."
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Principal Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="text-primary" size={20} />
              School Leadership
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Principal Name</label>
                <input 
                  type="text" 
                  name="principalName" 
                  value={form.principalName}
                  onChange={handleChange}
                  placeholder="Principal Name"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Designation</label>
                <input 
                  type="text" 
                  name="principalDesignation" 
                  value={form.principalDesignation}
                  onChange={handleChange}
                  placeholder="Principal / Dean / VP"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="email" 
                    name="principalEmail" 
                    value={form.principalEmail}
                    onChange={handleChange}
                    placeholder="principal@school.com"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="tel" 
                    name="principalPhone" 
                    value={form.principalPhone}
                    onChange={handleChange}
                    placeholder="10-digit mobile"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Coordinator Details (SCHOOL_COORDINATOR User login) */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="text-primary" size={20} />
              Primary Coordinator Details
            </h3>
            
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-xs font-semibold text-primary leading-relaxed mb-4">
              👉 These contact details will be used to auto-generate the login account credentials for the school coordinator portal.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Coordinator Name *</label>
                <input 
                  type="text" 
                  name="coordinatorName" 
                  required
                  value={form.coordinatorName}
                  onChange={handleChange}
                  placeholder="Coordinator Name (e.g. Mrs. Priya Sharma)"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Username / Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="email" 
                    name="coordinatorEmail" 
                    required
                    value={form.coordinatorEmail}
                    onChange={handleChange}
                    placeholder="coordinator@school.com"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Mobile Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="tel" 
                    name="coordinatorPhone" 
                    required
                    value={form.coordinatorPhone}
                    onChange={handleChange}
                    placeholder="10-digit mobile (+91...)"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: MOU configuration details */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calendar className="text-primary" size={20} />
              MOU & Partnership Parameters
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">MOU Signed Date *</label>
                <input 
                  type="date" 
                  name="mouSignedDate" 
                  required
                  value={form.mouSignedDate}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Partnership Tier *</label>
                <select 
                  name="tier" 
                  value={form.tier}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                >
                  <option value="SEEDING">Seeding Tier</option>
                  <option value="GROW">Grow Tier</option>
                  <option value="THRIVE">Thrive Tier</option>
                  <option value="CUSTOM">Custom Tier</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">MOU Start Date *</label>
                <input 
                  type="date" 
                  name="mouValidityStart" 
                  required
                  value={form.mouValidityStart}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">MOU Expiry Date *</label>
                <input 
                  type="date" 
                  name="mouValidityEnd" 
                  required
                  value={form.mouValidityEnd}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Total MOU Contract Value (₹) *</label>
                <input 
                  type="number" 
                  name="totalMouValue" 
                  required
                  value={form.totalMouValue}
                  onChange={handleChange}
                  placeholder="MOU monetary contract value (e.g. 150000)"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Custom Tier Deliverables & Payment Configuration */}
          {form.tier === 'CUSTOM' && (
            <div className="space-y-6 bg-primary/5 border border-primary/10 rounded-3xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300">
              <h3 className="text-md font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-primary/10">
                <Sparkles className="text-primary" size={18} />
                Custom Deliverables & Payment Parameters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Payment Mode *</label>
                  <select
                    name="paymentMode"
                    value={form.paymentMode}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                  >
                    <option value="CASH">Cash Payment</option>
                    <option value="ONLINE">Online Transaction</option>
                  </select>
                </div>

                {/* Contracted Student Count */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Total Students Contracted *</label>
                  <input
                    type="number"
                    name="totalStudentsContracted"
                    value={form.totalStudentsContracted}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 150"
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                  />
                </div>

                {/* Grades Enrolled */}
                <div className="col-span-1 md:col-span-2 space-y-3">
                  <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest block">Grades Enrolled *</label>
                  <div className="flex flex-wrap gap-3">
                    {['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'].map((grade) => {
                      const isSelected = form.gradesEnrolled.includes(grade);
                      return (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => handleGradeToggle(grade)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                            isSelected 
                              ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {grade}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sessions Per Grade */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Sessions Per Grade *</label>
                  <input
                    type="number"
                    name="sessionsPerGrade"
                    value={form.sessionsPerGrade}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    required
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                  />
                </div>

                {/* Reporting Frequency */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Reporting Frequency *</label>
                  <select
                    name="reportingFrequency"
                    value={form.reportingFrequency}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                  >
                    <option value="QUARTERLY">Quarterly Reports</option>
                    <option value="SEMI_ANNUAL">Semi-Annual Reports</option>
                    <option value="ANNUAL">Annual Reports</option>
                  </select>
                </div>

                {/* Teacher Training Sessions */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Teacher Training Sessions *</label>
                  <input
                    type="number"
                    name="teacherTrainingSessions"
                    value={form.teacherTrainingSessions}
                    onChange={handleChange}
                    min={0}
                    required
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                  />
                </div>

                {/* Teacher Training Duration */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 pl-1 uppercase tracking-widest">Training Duration *</label>
                  <select
                    name="teacherTrainingDuration"
                    value={form.teacherTrainingDuration}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
                  >
                    <option value="HALF_DAY">Half-Day Session</option>
                    <option value="FULL_DAY">Full-Day Session</option>
                  </select>
                </div>

                {/* Parent Welcome Kits Checkbox */}
                <div className="col-span-1 md:col-span-2 space-y-4 bg-white border border-slate-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Parent Welcome Kits</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">Provision welcome booklets for parents</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.parentWelcomeKit}
                        onChange={() => handleToggleChange('parentWelcomeKit')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {form.parentWelcomeKit && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kits Quantity *</label>
                      <input
                        type="number"
                        name="parentWelcomeKitQuantity"
                        value={form.parentWelcomeKitQuantity}
                        onChange={handleChange}
                        min={1}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:border-primary/50 text-slate-700"
                      />
                    </div>
                  )}
                </div>

                {/* Boolean Deliverable Switches */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Certified School Badge */}
                  <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                    <div>
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Certified Badge</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">Provide badge to school website</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.certifiedSchoolBadge}
                        onChange={() => handleToggleChange('certifiedSchoolBadge')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Social Media Content Pack */}
                  <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                    <div>
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Social Media Pack</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">PR templates & ready designs</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.socialMediaContentPack}
                        onChange={() => handleToggleChange('socialMediaContentPack')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Media Coverage Support */}
                  <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                    <div>
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Media Coverage</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">Press releases & media partner slots</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.mediaCoverageSupport}
                        onChange={() => handleToggleChange('mediaCoverageSupport')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Annual Wellness Day */}
                  <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                    <div>
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Wellness Day Event</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">Dedicated physical wellness event</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.annualWellnessDay}
                        onChange={() => handleToggleChange('annualWellnessDay')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
            <Link 
              href="/admin/schools"
              className="px-6 py-3.5 border border-slate-200 hover:bg-slate-50 font-extrabold text-slate-500 rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-95"
            >
              Cancel
            </Link>

            <button 
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary-dark text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 duration-200 text-xs uppercase tracking-wider flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Registering...
                </>
              ) : (
                'Onboard Partnership'
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Credentials Display Modal Receipt */
        <div className="bg-white border border-emerald-100 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-emerald-100/50 space-y-8 animate-in zoom-in-95 duration-400 max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Onboarding Registered!</h2>
            <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto">
              The B2B school record and coordinator login account have been successfully provisioned.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">School ID (Username)</span>
              <p className="text-sm font-black text-slate-800">{credentials.school.schoolId}</p>
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Coordinator Login Username/Email</span>
              <p className="text-sm font-black text-slate-800">{credentials.coordinatorUser.username}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Temporary Password</span>
              <div className="flex items-center gap-3">
                <code className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm font-black text-primary select-all tracking-wider">
                  {credentials.tempPassword}
                </code>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Coordinator Access URL</span>
              <p className="text-xs font-bold text-slate-500 select-all truncate">{window.location.origin}/schools/login</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleCopyCredentials}
              className="flex-1 py-4 border-2 border-slate-200 hover:border-slate-800 bg-white text-slate-700 hover:text-slate-800 hover:shadow-sm font-extrabold rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Copy size={16} />
              Copy Credentials
            </button>

            <button 
              onClick={() => router.push(`/admin/schools/${credentials.school.id}`)}
              className="flex-1 py-4 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-2xl shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              Configure Program & Deliverables
            </button>
          </div>

          <div className="flex items-center gap-2.5 justify-center text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 rounded-xl p-3 leading-snug">
            <ShieldAlert size={16} className="shrink-0" />
            <span>Ensure you copy these credential coordinates now. The temporary password will not be shown again!</span>
          </div>
        </div>
      )}
    </div>
  );
}
