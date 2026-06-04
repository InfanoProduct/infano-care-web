'use client';

import { useState, useEffect } from 'react';
import { 
  Award, Plus, Loader2, Calendar, Clock, BookOpen, Users, DollarSign,
  Edit, Trash2, CheckCircle2, XCircle, RefreshCw, Layers, ShieldCheck,
  Search, Filter, Check, X, CreditCard, Mail, Phone, Sliders, Sparkles, Eye,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProgramsService, Program, ProgramEnrollment, DemoSession, ProgramSession } from '@/services/programs.service';
import { toast } from 'react-hot-toast';

// Helper functions for human-friendly questionnaire labels
const getConfidenceLabel = (val: string) => {
  if (!val) return '';
  const map: Record<string, string> = {
    shy: 'Quiet & Observant',
    selective: 'Thoughtful & Selective',
    balanced: 'Balanced & Easygoing',
    outgoing: 'Vibrant & Expressive'
  };
  return val.split(',').map(v => map[v.trim()] || v.trim()).join(', ');
};

const getInterestsLabel = (val: string) => {
  const map: Record<string, string> = {
    puberty: 'Puberty & Body Changes',
    emotional: 'Emotional Balance',
    relationships: 'Social & Friendships',
    identity: 'Self-Esteem & Expression',
    digital: 'Digital Safety'
  };
  return map[val] || val;
};

const getHasMentorLabel = (val: string) => {
  const map: Record<string, string> = {
    yes: 'Yes, she has a wonderful mentor',
    no_but_wanted: 'Not yet, but she would highly benefit from one',
    family_focused: 'She primarily relies on close family support'
  };
  return map[val] || val;
};

const getChallengesLabel = (val: string) => {
  const map: Record<string, string> = {
    peer_pressure: 'Peer pressure or feeling left out',
    body_image: 'Body image concerns or self-doubt',
    studies: 'Academic stress or exam anxiety',
    friendships: 'Friendship drama or navigating social groups',
    career_confusion: 'Career confusion or future worries',
    other: 'Other personal growth challenges'
  };
  return map[val] || val;
};

const getLearningPrefLabel = (val: string) => {
  const map: Record<string, string> = {
    talking: 'Empathetic Discussion',
    doing: 'Hands-on Activities',
    reading: 'Self-paced Reading/Watching',
    group: 'Collaborative Groups'
  };
  return map[val] || val;
};

const getParentInvolvementLabel = (val: string) => {
  const map: Record<string, string> = {
    weekly: 'Weekly Summary & Insights',
    monthly: 'Monthly Milestones Check-in',
    minimal: 'Supportive & Hands-off'
  };
  return map[val] || val;
};

export default function ProgramsManagement() {
  const router = useRouter();
  // Tabs
  const [activeTab, setActiveTab] = useState<'programs' | 'enrollments' | 'demos'>('programs');

  // Data States
  const [programs, setPrograms] = useState<Program[]>([]);
  const [enrollments, setEnrollments] = useState<ProgramEnrollment[]>([]);
  const [demos, setDemos] = useState<DemoSession[]>([]);
  
  // UI Loading States
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [loadingDemos, setLoadingDemos] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter
  const [programSearch, setProgramSearch] = useState('');
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [demoSearch, setDemoSearch] = useState('');
  const [demoStatusFilter, setDemoStatusFilter] = useState('ALL');

  // Selected Demo Modal State
  const [selectedDemo, setSelectedDemo] = useState<DemoSession | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formClassRange, setFormClassRange] = useState('');
  const [formMinClass, setFormMinClass] = useState(5);
  const [formMaxClass, setFormMaxClass] = useState(6);
  const [formSessions, setFormSessions] = useState(8);
  const [formDuration, setFormDuration] = useState('');
  const [formPricePrivate, setFormPricePrivate] = useState(0);
  const [formPriceGroup, setFormPriceGroup] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formTopics, setFormTopics] = useState<string[]>([]);
  const [newTopicInput, setNewTopicInput] = useState('');
  const [formCurriculum, setFormCurriculum] = useState<ProgramSession[]>([]);

  useEffect(() => {
    loadPrograms();
    loadEnrollments();
    loadDemos();
  }, []);

  useEffect(() => {
    if (activeTab === 'programs') loadPrograms();
    if (activeTab === 'enrollments') loadEnrollments();
    if (activeTab === 'demos') loadDemos();
  }, [activeTab]);

  const loadPrograms = async () => {
    setLoadingPrograms(true);
    try {
      const data = await ProgramsService.getAdminPrograms();
      setPrograms(data);
      if (data.length > 0) {
        setActiveProgram(prev => {
          if (prev) {
            const found = data.find(p => p.id === prev.id);
            return found || data[0];
          }
          return data[0];
        });
      } else {
        setActiveProgram(null);
      }
    } catch (error) {
      console.error('Failed to load programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoadingPrograms(false);
    }
  };

  const loadEnrollments = async () => {
    setLoadingEnrollments(true);
    try {
      const data = await ProgramsService.getAdminEnrollments();
      setEnrollments(data);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
      toast.error('Failed to load enrollments');
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const loadDemos = async () => {
    setLoadingDemos(true);
    try {
      const data = await ProgramsService.getAdminDemos();
      setDemos(data);
    } catch (error) {
      console.error('Failed to load demo sessions:', error);
      toast.error('Failed to load demo sessions');
    } finally {
      setLoadingDemos(false);
    }
  };

  const handleUpdateDemoStatus = async (id: string, status: string) => {
    try {
      await ProgramsService.updateDemoStatus(id, status);
      toast.success(`Demo booking status updated to ${status}`);
      loadDemos();
      setSelectedDemo(prev => prev && prev.id === id ? { ...prev, status } : prev);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedProgram(null);
    
    // Reset Form
    setFormTitle('');
    setFormTagline('');
    setFormDescription('');
    setFormClassRange('');
    setFormMinClass(5);
    setFormMaxClass(6);
    setFormSessions(8);
    setFormDuration('');
    setFormPricePrivate(0);
    setFormPriceGroup(0);
    setFormIsActive(true);
    setFormTopics([]);
    setNewTopicInput('');
    setFormCurriculum([]);
    
    setShowModal(true);
  };

  const handleOpenEditModal = (program: Program) => {
    setModalMode('edit');
    setSelectedProgram(program);
    
    // Load Form
    setFormTitle(program.title);
    setFormTagline(program.tagline);
    setFormDescription(program.description || '');
    setFormClassRange(program.classRange);
    setFormMinClass(program.minClass);
    setFormMaxClass(program.maxClass);
    setFormSessions(program.sessions);
    setFormDuration(program.duration);
    setFormPricePrivate(program.pricePrivate);
    setFormPriceGroup(program.priceGroup);
    setFormIsActive(program.isActive);
    setFormTopics(program.topics || []);
    setNewTopicInput('');
    setFormCurriculum(
      program.curriculum && program.curriculum.length > 0
        ? program.curriculum
        : (program.sessionsList || [])
    );
    
    setShowModal(true);
  };

  const handleAddTopic = () => {
    const trimmed = newTopicInput.trim();
    if (!trimmed) return;
    if (formTopics.includes(trimmed)) {
      toast.error('Topic already exists in list');
      return;
    }
    setFormTopics([...formTopics, trimmed]);
    setNewTopicInput('');
  };

  const handleRemoveTopic = (indexToRemove: number) => {
    setFormTopics(formTopics.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMoveSession = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formCurriculum.length - 1) return;
    const updated = [...formCurriculum];
    const temp = updated[index];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFormCurriculum(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formClassRange || !formDuration) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    const payload = {
      title: formTitle,
      tagline: formTagline,
      description: formDescription,
      classRange: formClassRange,
      minClass: Number(formMinClass),
      maxClass: Number(formMaxClass),
      sessions: Number(formSessions),
      duration: formDuration,
      pricePrivate: Number(formPricePrivate),
      priceGroup: Number(formPriceGroup),
      isActive: formIsActive,
      topics: formTopics,
      curriculum: formCurriculum
    };

    try {
      if (modalMode === 'create') {
        await ProgramsService.createProgram(payload);
        toast.success('Learning program created successfully!');
      } else {
        if (!selectedProgram) return;
        await ProgramsService.updateProgram(selectedProgram.id, payload);
        toast.success('Learning program updated successfully!');
      }
      setShowModal(false);
      loadPrograms();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to save program');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program? All related user enrollments will also be removed.')) return;
    try {
      await ProgramsService.deleteProgram(id);
      toast.success('Program deleted successfully');
      loadPrograms();
    } catch (error) {
      toast.error('Failed to delete program');
    }
  };

  const toggleProgramStatus = async (program: Program) => {
    try {
      await ProgramsService.updateProgram(program.id, { isActive: !program.isActive });
      toast.success(`Program ${!program.isActive ? 'activated' : 'deactivated'} successfully`);
      loadPrograms();
    } catch (error) {
      toast.error('Failed to update program status');
    }
  };

  const handleUpdateEnrollmentStatus = async (id: string, status: string) => {
    try {
      await ProgramsService.updateEnrollmentStatus(id, status);
      toast.success(`Enrollment status updated to ${status}`);
      loadEnrollments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Filter & Search Logic
  const filteredPrograms = programs.filter(p => 
    p.title.toLowerCase().includes(programSearch.toLowerCase()) ||
    p.tagline.toLowerCase().includes(programSearch.toLowerCase()) ||
    p.classRange.toLowerCase().includes(programSearch.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(e => {
    const searchString = enrollmentSearch.toLowerCase();
    const matchesSearch = 
      (e.user.profile?.displayName || '').toLowerCase().includes(searchString) ||
      (e.user.username || '').toLowerCase().includes(searchString) ||
      (e.user.phone || '').toLowerCase().includes(searchString) ||
      (e.user.parentEmail || '').toLowerCase().includes(searchString) ||
      e.program.title.toLowerCase().includes(searchString);

    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredDemos = demos.filter(d => {
    const searchString = demoSearch.toLowerCase();
    const matchesSearch = 
      d.parentName.toLowerCase().includes(searchString) ||
      d.phone.toLowerCase().includes(searchString) ||
      (d.email || '').toLowerCase().includes(searchString) ||
      d.classRange.toLowerCase().includes(searchString) ||
      (d.suggestedPrograms && d.suggestedPrograms.some(p => p.toLowerCase().includes(searchString)));

    const matchesStatus = demoStatusFilter === 'ALL' || d.status === demoStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get custom gradient based on program title
  const getGradientClass = (title: string) => {
    const key = title.toUpperCase();
    if (key.includes('SPARK')) return 'from-orange-500 to-rose-500 shadow-orange-500/20';
    if (key.includes('RISE')) return 'from-purple-500 to-indigo-500 shadow-purple-500/20';
    if (key.includes('BLOOM')) return 'from-emerald-500 to-teal-500 shadow-emerald-500/20';
    if (key.includes('IGNITE')) return 'from-violet-600 to-fuchsia-600 shadow-violet-600/20';
    if (key.includes('UNSTOPPABLE')) return 'from-amber-500 to-yellow-600 shadow-amber-500/20';
    return 'from-primary to-primary-light shadow-primary/20';
  };

  if (showModal) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Full screen edit form header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/10 pb-6">
          <div>
            <button 
              type="button"
              onClick={() => setShowModal(false)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest mb-2"
            >
              <ChevronLeft size={14} /> Back to Programs
            </button>
            <h2 className="text-4xl font-black tracking-tight text-foreground">
              {modalMode === 'create' ? 'Add New' : 'Edit'} <span className="text-primary">Program</span>
            </h2>
            <p className="text-muted-foreground mt-1 font-medium">Configure cohort packages, prices, age targets, and roadmap sessions.</p>
          </div>
        </div>

        {/* Form container */}
        <div className="bg-white rounded-[2.5rem] border border-border/30 shadow-xl p-8">
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: General Info (5 cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 border-b border-border/30 pb-2">Program Details & Settings</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Program Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SPARK, RISE"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 py-3.5 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-all font-semibold"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Tagline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. She wakes up to herself."
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 py-3.5 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Long Description (Optional)</label>
                <textarea
                  placeholder="Explain what the learning program is about, who it is for, and the impact it will have on the student..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 py-3.5 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-all font-semibold leading-relaxed"
                />
              </div>

              {/* Class Target Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Class Start (Min) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={12}
                    value={formMinClass}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormMinClass(val);
                      if (formMaxClass < val) setFormMaxClass(val);
                    }}
                    className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 py-3.5 text-foreground outline-none focus:border-primary/50 transition-all font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Class End (Max) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={12}
                    value={formMaxClass}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormMaxClass(val);
                      if (formMinClass > val) setFormMinClass(val);
                    }}
                    className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 py-3.5 text-foreground outline-none focus:border-primary/50 transition-all font-semibold"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Class Range Label *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 8 and 9"
                    value={formClassRange}
                    onChange={(e) => setFormClassRange(e.target.value)}
                    className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 py-3.5 text-foreground outline-none focus:border-primary/50 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Sessions, Duration, Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Total Sessions *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formSessions}
                    onChange={(e) => setFormSessions(Number(e.target.value))}
                    className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 py-3.5 text-foreground outline-none focus:border-primary/50 transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Duration Label *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2 Months"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 py-3.5 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Pricing Tiers */}
              <div className="bg-secondary/15 border border-border/40 rounded-2xl p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">1:1 Private Price (₹ / mo) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black">₹</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formPricePrivate}
                      onChange={(e) => setFormPricePrivate(Number(e.target.value))}
                      className="w-full bg-white border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-foreground outline-none focus:border-primary/50 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Group Price (₹ / mo) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black">₹</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formPriceGroup}
                      onChange={(e) => setFormPriceGroup(Number(e.target.value))}
                      className="w-full bg-white border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-foreground outline-none focus:border-primary/50 transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-1">
                <input
                  type="checkbox"
                  id="formIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
                <label htmlFor="formIsActive" className="text-xs font-black uppercase tracking-wider text-foreground cursor-pointer select-none">
                  Active / Published
                </label>
              </div>
            </div>

            {/* Right Column: Curriculum Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 border-b border-border/30 pb-2">Curriculum Content</h3>
              
              {/* Curriculum Topics Tags Manager */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Topics Focus Tags ({formTopics.length})</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter a new topic tag (e.g. Body Unfiltered)"
                    value={newTopicInput}
                    onChange={(e) => setNewTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTopic();
                      }
                    }}
                    className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="px-5 py-3 bg-secondary hover:bg-primary/10 hover:text-primary border border-border/50 text-muted-foreground text-sm font-black rounded-2xl transition-all whitespace-nowrap shadow-sm"
                  >
                    Add Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 border border-border/30 rounded-2xl p-4 bg-secondary/10 min-h-16">
                  {formTopics.length === 0 ? (
                    <span className="text-xs text-muted-foreground/60 font-semibold italic">No topics defined yet.</span>
                  ) : (
                    formTopics.map((topic, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-primary/10 text-primary px-3 py-1.5 border border-primary/20 rounded-xl"
                      >
                        {topic}
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(idx)}
                          className="hover:bg-primary/25 rounded-full p-0.5 transition-all text-primary"
                        >
                          <X size={12} className="stroke-[2.5px]" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Curriculum Roadmap Builder */}
              <div className="space-y-4 pt-4 border-t border-border/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Roadmap Session Builder ({formCurriculum.length})</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-1">Configure each learning session sequence in the timeline.</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setFormCurriculum([
                        ...formCurriculum, 
                        { title: `Session ${formCurriculum.length + 1}: `, description: '' }
                      ]);
                    }}
                    className="btn-secondary py-2 px-3 rounded-xl border border-border/50 text-muted-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm bg-white hover:bg-slate-50 transition-all"
                  >
                    <Plus size={14} />
                    <span>Add Session</span>
                  </button>
                </div>

                {/* Session list timeline */}
                <div className="relative pl-6 border-l border-slate-200/80 space-y-4 mt-4">
                  {formCurriculum.map((session, idx) => (
                    <div 
                      key={idx}
                      className="p-5 bg-secondary/15 border border-border/40 rounded-2xl relative flex flex-col gap-3 group animate-in fade-in duration-300"
                    >
                      {/* Timeline bullet */}
                      <span className="absolute -left-[35px] top-5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white text-white bg-primary shadow-sm">
                        {idx + 1}
                      </span>

                      <div className="flex justify-between items-start gap-4">
                        <input
                          type="text"
                          required
                          placeholder={`Session ${idx + 1} Title`}
                          value={session.title}
                          onChange={(e) => {
                            const updated = [...formCurriculum];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setFormCurriculum(updated);
                          }}
                          className="flex-1 bg-white border border-border/50 rounded-xl px-4 py-2 text-sm text-foreground outline-none focus:border-primary/50 transition-all font-bold"
                        />
                        
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Reordering Chevrons */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSession(idx, 'up')}
                            className="p-2 bg-white hover:bg-slate-50 disabled:opacity-30 rounded-xl border border-border/50 text-muted-foreground shadow-sm transition-all"
                            title="Move Up"
                          >
                            <ChevronLeft className="rotate-90" size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === formCurriculum.length - 1}
                            onClick={() => handleMoveSession(idx, 'down')}
                            className="p-2 bg-white hover:bg-slate-50 disabled:opacity-30 rounded-xl border border-border/50 text-muted-foreground shadow-sm transition-all"
                            title="Move Down"
                          >
                            <ChevronRight className="rotate-90" size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormCurriculum(formCurriculum.filter((_, i) => i !== idx));
                            }}
                            className="p-2 bg-white hover:bg-rose-500/10 hover:text-rose-500 rounded-xl border border-border/50 text-muted-foreground shadow-sm transition-all"
                            title="Remove Session"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <textarea
                        required
                        placeholder={`Session ${idx + 1} Description`}
                        value={session.description}
                        onChange={(e) => {
                          const updated = [...formCurriculum];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          setFormCurriculum(updated);
                        }}
                        rows={2}
                        className="w-full bg-white border border-border/50 rounded-xl px-4 py-2 text-xs text-foreground outline-none focus:border-primary/50 transition-all font-semibold leading-relaxed"
                      />
                    </div>
                  ))}

                  {formCurriculum.length === 0 && (
                    <div className="p-8 text-center bg-secondary/10 border border-dashed border-border/40 rounded-2xl">
                      <p className="text-muted-foreground font-semibold text-xs italic">No sessions defined yet. Click "Add Session" to build the roadmap.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="border-t border-border/30 pt-6 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-6 py-3.5 bg-secondary text-muted-foreground font-black rounded-2xl transition-all border border-border/50 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3.5 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={18} />}
                  <span>{submitting ? 'Saving...' : 'Save Curriculum'}</span>
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Admin Header */}
      <div className="admin-header flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/10 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Award className="text-primary w-10 h-10" />
            Learning <span className="text-primary">Programs</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Configure cohort packages, prices, age targets, and track user enrollments.</p>
        </div>
        
        {activeTab === 'programs' && (
          <button 
            onClick={handleOpenCreateModal}
            className="btn-primary flex items-center gap-2 px-6 py-3.5 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 text-white bg-primary font-bold self-start md:self-auto"
          >
            <Plus size={20} />
            <span>Add New Program</span>
          </button>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border/30 gap-6">
        <button
          onClick={() => setActiveTab('programs')}
          className={`pb-4 text-lg font-black tracking-tight relative transition-all ${
            activeTab === 'programs' 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {activeTab === 'programs' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
          )}
          Learning Packages ({programs.length})
        </button>
        
        <button
          onClick={() => setActiveTab('enrollments')}
          className={`pb-4 text-lg font-black tracking-tight relative transition-all ${
            activeTab === 'enrollments' 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {activeTab === 'enrollments' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
          )}
          Student Enrollments ({enrollments.length})
        </button>

        <button
          onClick={() => setActiveTab('demos')}
          className={`pb-4 text-lg font-black tracking-tight relative transition-all ${
            activeTab === 'demos' 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {activeTab === 'demos' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
          )}
          Demo Sessions ({demos.length})
        </button>
      </div>

      {/* Tab 1: Learning Packages */}
      {activeTab === 'programs' && (
        <div className="space-y-6">
          {/* Search & Actions bar */}
          <div className="flex items-center justify-between gap-4 bg-white/50 backdrop-blur-md border border-border/50 rounded-2xl p-3 shadow-sm">
            <div className="flex items-center gap-4 bg-secondary/35 rounded-xl px-4 py-2 border border-border/50 w-full max-w-md">
              <Search className="text-muted-foreground shrink-0" size={18} />
              <input 
                type="text" 
                placeholder="Search programs..." 
                value={programSearch}
                onChange={(e) => setProgramSearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm font-semibold placeholder:text-muted-foreground/60 text-slate-800"
              />
            </div>
            
            <button 
              onClick={handleOpenCreateModal}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-md text-white bg-primary text-xs font-bold transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} />
              <span>Add New Program</span>
            </button>
          </div>

          {loadingPrograms ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="font-bold text-muted-foreground">Loading curriculum packages...</p>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="glass-card rounded-[2rem] p-12 text-center text-muted-foreground font-bold border border-border/30">
              No programs found matching your search. Try adding one!
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Left Column: Selector List (42%) */}
              <div className="w-full lg:w-[42%] space-y-4 max-h-[75vh] overflow-y-auto pr-2 animate-in slide-in-from-left duration-300">
                {filteredPrograms.map((program) => {
                  const isSelected = activeProgram?.id === program.id;
                  return (
                    <div 
                      key={program.id}
                      onClick={() => setActiveProgram(program)}
                      className={`cursor-pointer p-5 rounded-3xl border transition-all duration-300 flex flex-col gap-3 relative overflow-hidden bg-white hover:shadow-lg ${
                        isSelected 
                          ? 'border-primary ring-2 ring-primary/20 shadow-md shadow-primary/5 bg-primary/[0.005]' 
                          : 'border-border/40 hover:border-border'
                      }`}
                    >
                      {/* Left vertical theme accent border */}
                      <div className={`absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b ${getGradientClass(program.title)}`} />
                      
                      <div className="flex justify-between items-start pl-2">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md border border-slate-200">
                            {program.classRange}
                          </span>
                          <h3 className="text-xl font-black text-slate-800 tracking-tight mt-1.5 transition-colors">
                            {program.title}
                          </h3>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            program.isActive 
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10' 
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/10'
                          }`}>
                            {program.isActive ? 'Active' : 'Draft'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {program.sessions} Sessions • {program.duration}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-1 italic pl-2">
                        "{program.tagline}"
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Preview Pane (58%) */}
              <div className="w-full lg:w-[58%] lg:sticky lg:top-6 bg-white border border-border/30 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col max-h-[75vh] animate-in slide-in-from-right duration-300">
                {activeProgram ? (
                  <div className="flex flex-col h-full overflow-y-auto">
                    {/* Header banner matching program color theme */}
                    <div className={`bg-gradient-to-r p-6 text-white flex flex-col gap-2 relative shadow-md shrink-0 ${getGradientClass(activeProgram.title)}`}>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black uppercase tracking-widest bg-white/25 backdrop-blur-sm px-3.5 py-1 rounded-full border border-white/10 shadow-sm">
                          {activeProgram.classRange}
                        </span>
                        
                        <div className="flex items-center gap-1.5 bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-wider">
                          <div className={`w-1.5 h-1.5 rounded-full ${activeProgram.isActive ? 'bg-emerald-300 animate-pulse' : 'bg-amber-300'}`} />
                          {activeProgram.isActive ? 'Active' : 'Draft'}
                        </div>
                      </div>
                      
                      <h2 className="text-3.5xl font-black tracking-tight mt-2 leading-none">{activeProgram.title}</h2>
                      <p className="text-white/95 text-base font-semibold italic mt-1 leading-snug">"{activeProgram.tagline}"</p>
                    </div>

                    {/* Detailed info panel */}
                    <div className="p-6 space-y-6 flex-1">
                      {/* Overview */}
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Program Overview</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                          {activeProgram.description || 'A structured cohort curriculum designed to guide and uplift young girls during critical development years.'}
                        </p>
                      </div>

                      {/* Pricing Tiers & Config stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-50 border border-border/40 p-3 rounded-2xl text-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Duration</span>
                          <span className="text-sm font-black text-slate-800 block mt-1">{activeProgram.duration}</span>
                        </div>
                        <div className="bg-slate-50 border border-border/40 p-3 rounded-2xl text-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Total Sessions</span>
                          <span className="text-sm font-black text-slate-800 block mt-1">{activeProgram.sessions} Sessions</span>
                        </div>
                        <div className="bg-slate-50 border border-border/40 p-3 rounded-2xl text-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">1:1 Private Price</span>
                          <span className="text-sm font-black text-slate-800 block mt-1">₹{activeProgram.pricePrivate.toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">/mo</span></span>
                        </div>
                        <div className="bg-slate-50 border border-border/40 p-3 rounded-2xl text-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Group Price</span>
                          <span className="text-sm font-black text-slate-800 block mt-1">₹{activeProgram.priceGroup.toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">/mo</span></span>
                        </div>
                      </div>

                      {/* Curriculum Topics */}
                      {activeProgram.topics && activeProgram.topics.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Curriculum Focus Topics</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {activeProgram.topics.map((topic, i) => (
                              <span key={i} className="text-[10px] font-extrabold bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-lg">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Visual Timeline Curriculum Roadmap */}
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Curriculum Sessions Roadmap</h4>
                        {activeProgram.sessionsList && activeProgram.sessionsList.length > 0 ? (
                          <div className="relative pl-6 border-l border-slate-200 space-y-4">
                            {activeProgram.sessionsList.map((session, idx) => (
                              <div key={idx} className="bg-slate-50/50 border border-border/30 p-4 rounded-2xl relative group hover:bg-slate-50 transition-colors">
                                <span className={`absolute -left-[33px] top-4 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white text-white bg-primary shadow-sm`}>
                                  {idx + 1}
                                </span>
                                <h5 className="text-xs font-black text-slate-800 leading-tight">{session.title}</h5>
                                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">{session.description}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-450 italic font-semibold pl-2">No sessions defined in curriculum. Add them by editing the program.</p>
                        )}
                      </div>
                    </div>

                    {/* Preview Actions Footer */}
                    <div className="p-5 bg-secondary/10 border-t border-border/30 flex justify-between items-center gap-3 shrink-0">
                      <button
                        onClick={() => toggleProgramStatus(activeProgram)}
                        className={`px-4 py-2 rounded-xl text-xs font-black shadow-sm border transition-all ${
                          activeProgram.isActive 
                            ? 'bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 border-amber-500/10' 
                            : 'bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 border-emerald-500/10'
                        }`}
                      >
                        {activeProgram.isActive ? 'Set Draft' : 'Publish'}
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEditModal(activeProgram)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-secondary hover:bg-primary/10 hover:text-primary transition-all rounded-xl border border-border/50 text-xs font-black text-muted-foreground shadow-sm"
                        >
                          <Edit size={14} />
                          <span>Edit Program</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteProgram(activeProgram.id);
                            setActiveProgram(null);
                          }}
                          className="p-2 bg-secondary hover:bg-rose-500/10 hover:text-rose-500 transition-all rounded-xl border border-border/50 text-muted-foreground shadow-sm"
                          title="Delete Program"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 gap-3">
                    <Layers className="text-muted-foreground/30" size={48} />
                    <p className="font-extrabold text-muted-foreground text-sm">No learning package selected</p>
                    <p className="text-xs text-muted-foreground/60 max-w-xs font-semibold">Select any program package on the left to inspect and audit its curriculum roadmap.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Enrollments */}
      {activeTab === 'enrollments' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-4 bg-secondary/50 rounded-xl px-4 py-2 border border-border/50 w-full md:max-w-md">
              <Search className="text-muted-foreground shrink-0" size={18} />
              <input 
                type="text" 
                placeholder="Search by student, username, phone, or parent email..." 
                value={enrollmentSearch}
                onChange={(e) => setEnrollmentSearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm font-semibold placeholder:text-muted-foreground/60 text-foreground"
              />
            </div>
            
            <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
              <Filter className="text-muted-foreground" size={16} />
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Status:</span>
              <div className="flex bg-secondary/50 rounded-xl p-1 border border-border/50 font-bold text-xs">
                {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                      statusFilter === status 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {status.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loadingEnrollments ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="font-bold text-muted-foreground">Loading enrollment database...</p>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="glass-card rounded-[2rem] p-12 text-center text-muted-foreground font-bold border border-border/30">
              No enrollment records match your active search filters.
            </div>
          ) : (
            <div className="glass-card rounded-[2.5rem] border border-border/30 overflow-hidden shadow-2xl bg-white/80">
              {/* Table wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-primary/5 border-b border-border/30 text-xs font-black uppercase tracking-widest text-muted-foreground/80">
                      <th className="p-6">Student Information</th>
                      <th className="p-6">Enrolled Package</th>
                      <th className="p-6">Tier & Fee Paid</th>
                      <th className="p-6">Date Enrolled</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-border/30">
                    {filteredEnrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-primary/[0.01] transition-all group">
                        {/* Student Info */}
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-primary/10 text-primary rounded-full font-black text-lg flex items-center justify-center">
                              {(enrollment.user.profile?.displayName?.[0] || enrollment.user.username?.[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-extrabold text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
                                {enrollment.user.profile?.displayName || enrollment.user.username || 'Anonymous User'}
                              </p>
                              <div className="flex flex-col gap-1 mt-1 text-xs text-muted-foreground font-semibold">
                                <span className="flex items-center gap-1.5">
                                  <Phone size={12} className="text-muted-foreground/60" />
                                  {enrollment.user.phone}
                                </span>
                                {enrollment.user.parentEmail && (
                                  <span className="flex items-center gap-1.5">
                                    <Mail size={12} className="text-muted-foreground/60" />
                                    {enrollment.user.parentEmail}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Package Info */}
                        <td className="p-6">
                          <div>
                            <span className="font-extrabold text-foreground bg-secondary px-3 py-1 rounded-xl border border-border/60 text-sm">
                              {enrollment.program.title}
                            </span>
                            <p className="text-xs text-muted-foreground font-bold mt-2">
                              Target: {enrollment.program.classRange}
                            </p>
                          </div>
                        </td>

                        {/* Tier & Price */}
                        <td className="p-6">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                              enrollment.type === 'PRIVATE' 
                                ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' 
                                : 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                            }`}>
                              <CreditCard size={10} />
                              {enrollment.type === 'PRIVATE' ? '1:1 Private' : 'Group Cohort'}
                            </span>
                            
                            <p className="font-black text-sm text-foreground flex items-center">
                              ₹{enrollment.pricePaid.toLocaleString()}
                            </p>
                          </div>
                        </td>

                        {/* Date Enrolled */}
                        <td className="p-6">
                          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                            <Calendar size={14} className="text-muted-foreground/70" />
                            {new Date(enrollment.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-6">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 border shadow-sm ${
                            enrollment.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : enrollment.status === 'COMPLETED'
                              ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                              : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              enrollment.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' :
                              enrollment.status === 'COMPLETED' ? 'bg-indigo-500' : 'bg-rose-500'
                            }`} />
                            {enrollment.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => router.push(`/admin/expert/enrollments/${enrollment.id}`)}
                              title="View Schedule Details"
                              className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-500/15 rounded-xl transition-all shadow-sm"
                            >
                              <Eye size={14} className="stroke-[3px]" />
                            </button>
                            {enrollment.status === 'ACTIVE' && (
                              <>
                                <button
                                  onClick={() => handleUpdateEnrollmentStatus(enrollment.id, 'COMPLETED')}
                                  title="Mark as Completed"
                                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-500/15 rounded-xl transition-all shadow-sm"
                                >
                                  <Check size={14} className="stroke-[3px]" />
                                </button>
                                <button
                                  onClick={() => handleUpdateEnrollmentStatus(enrollment.id, 'CANCELLED')}
                                  title="Cancel Enrollment"
                                  className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-500/15 rounded-xl transition-all shadow-sm"
                                >
                                  <X size={14} className="stroke-[3px]" />
                                </button>
                              </>
                            )}
                            
                            {(enrollment.status === 'COMPLETED' || enrollment.status === 'CANCELLED') && (
                              <button
                                onClick={() => handleUpdateEnrollmentStatus(enrollment.id, 'ACTIVE')}
                                title="Re-activate Enrollment"
                                className="p-2.5 bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border/50 rounded-xl transition-all shadow-sm"
                              >
                                <RefreshCw size={14} className="stroke-[2.5px]" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Demo Sessions */}
      {activeTab === 'demos' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-4 bg-secondary/50 rounded-xl px-4 py-2 border border-border/50 w-full md:max-w-md">
              <Search className="text-muted-foreground shrink-0" size={18} />
              <input 
                type="text" 
                placeholder="Search by parent, phone, email, or program..." 
                value={demoSearch}
                onChange={(e) => setDemoSearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm font-semibold placeholder:text-muted-foreground/60 text-foreground"
              />
            </div>
            
            <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
              <Filter className="text-muted-foreground" size={16} />
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Status:</span>
              <div className="flex bg-secondary/50 rounded-xl p-1 border border-border/50 font-bold text-xs">
                {['ALL', 'PENDING', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setDemoStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                      demoStatusFilter === status 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {status.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loadingDemos ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="font-bold text-muted-foreground">Loading demo session database...</p>
            </div>
          ) : filteredDemos.length === 0 ? (
            <div className="glass-card rounded-[2rem] p-12 text-center text-muted-foreground font-bold border border-border/30">
              No demo bookings found matching your search.
            </div>
          ) : (
            <div className="glass-card rounded-[2.5rem] border border-border/30 overflow-hidden shadow-2xl bg-white/80">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-primary/5 border-b border-border/30 text-xs font-black uppercase tracking-widest text-muted-foreground/80">
                      <th className="p-6">Parent Information</th>
                      <th className="p-6">Cohort Range</th>
                      <th className="p-6">Curriculum Suggested</th>
                      <th className="p-6">Scheduled Slot</th>
                      <th className="p-6">Date Requested</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-border/30">
                    {filteredDemos.map((demo: DemoSession) => (
                      <tr key={demo.id} className="hover:bg-primary/[0.01] transition-all group">
                        {/* Parent Info */}
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-primary/10 text-primary rounded-full font-black text-lg flex items-center justify-center">
                              {demo.parentName[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-extrabold text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
                                {demo.parentName}
                              </p>
                              <div className="flex flex-col gap-1 mt-1 text-xs text-muted-foreground font-semibold">
                                <span className="flex items-center gap-1.5">
                                  <Phone size={12} className="text-muted-foreground/60" />
                                  {demo.phone}
                                </span>
                                {demo.email && (
                                  <span className="flex items-center gap-1.5">
                                    <Mail size={12} className="text-muted-foreground/60" />
                                    {demo.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Class range */}
                        <td className="p-6">
                          <div>
                            <span className="font-extrabold text-foreground bg-secondary px-3 py-1 rounded-xl border border-border/60 text-sm">
                              {demo.classRange}
                            </span>
                          </div>
                        </td>

                        {/* Suggested Program */}
                        <td className="p-6">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {demo.suggestedPrograms && demo.suggestedPrograms.map((prog: string, i: number) => (
                              <span key={i} className="text-[10px] font-black bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-md">
                                {prog}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Scheduled Slot */}
                        <td className="p-6">
                          {demo.slotDate && demo.slotTime ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                <Calendar size={12} className="text-primary shrink-0" />
                                {new Date(demo.slotDate).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock size={12} className="text-primary shrink-0" />
                                {demo.slotTime}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/60 italic font-semibold">No slot selected</span>
                          )}
                        </td>

                        {/* Date Requested */}
                        <td className="p-6">
                          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                            <Calendar size={14} className="text-muted-foreground/70" />
                            {new Date(demo.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="p-6">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 border shadow-sm ${
                            demo.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                            demo.status === 'CONTACTED' ? 'bg-teal-500/10 text-teal-600 border-teal-500/20' :
                            demo.status === 'SCHEDULED' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                            demo.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                            'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              demo.status === 'PENDING' ? 'bg-amber-500 animate-pulse' :
                              demo.status === 'CONTACTED' ? 'bg-teal-500' :
                              demo.status === 'SCHEDULED' ? 'bg-purple-500' :
                              demo.status === 'COMPLETED' ? 'bg-emerald-500' :
                              'bg-rose-500'
                            }`} />
                            {demo.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedDemo(demo);
                                setShowDemoModal(true);
                              }}
                              className="px-4 py-2 bg-secondary hover:bg-primary/10 hover:text-primary border border-border/50 text-xs font-black rounded-xl transition-all shadow-sm"
                            >
                              View Profile Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- DEMO DETAILS MODAL --- */}
      {showDemoModal && selectedDemo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] border border-border/30 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col p-8 gap-6 animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-border/30 pb-5">
              <div>
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-2">
                  <Award size={12} />
                  Demo Session Request
                </span>
                <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                  {selectedDemo.parentName}
                </h2>
                <p className="text-sm font-semibold text-muted-foreground mt-1">
                  Requested on {new Date(selectedDemo.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowDemoModal(false);
                  setSelectedDemo(null);
                }}
                className="p-2 hover:bg-secondary rounded-full transition-all border border-border/50 shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Quick Contact & Status Update */}
              <div className="md:col-span-1 space-y-6 border-b md:border-b-0 md:border-r border-border/30 pb-6 md:pb-0 md:pr-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Parent Contact</h3>
                  <div className="space-y-3 font-semibold text-sm">
                    <a 
                      href={`tel:${selectedDemo.phone}`}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 hover:text-primary transition-all text-foreground"
                    >
                      <Phone size={16} className="text-primary shrink-0" />
                      <span className="break-all">{selectedDemo.phone}</span>
                    </a>
                    
                    {selectedDemo.email ? (
                      <a 
                        href={`mailto:${selectedDemo.email}`}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 hover:text-primary transition-all text-foreground animate-in fade-in"
                      >
                        <Mail size={16} className="text-primary shrink-0" />
                        <span className="break-all text-xs">{selectedDemo.email}</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/30 border border-border/30 text-muted-foreground italic text-xs">
                        <Mail size={16} className="shrink-0 text-muted-foreground/60" />
                        <span>No Email Provided</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Class Cohort</h3>
                  <div className="px-4 py-3 bg-primary/5 text-primary border border-primary/10 rounded-2xl text-center">
                    <span className="text-lg font-black">{selectedDemo.classRange}</span>
                  </div>
                </div>

                {/* Requested Slot details card */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Clock size={12} className="text-primary shrink-0" /> Requested Slot
                  </h3>
                  {selectedDemo.slotDate && selectedDemo.slotTime ? (
                    <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl flex flex-col gap-2 shadow-sm text-left">
                      <div className="flex items-center gap-2 text-primary">
                        <Calendar size={14} className="shrink-0" />
                        <span className="text-xs font-black">
                          {new Date(selectedDemo.slotDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-primary">
                        <Clock size={14} className="shrink-0" />
                        <span className="text-xs font-black uppercase tracking-wider">{selectedDemo.slotTime}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl text-center italic text-xs font-semibold">
                      No slot requested
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Booking Status</h3>
                  
                  {/* Status Picker Selector */}
                  <div className="space-y-2">
                    {(['PENDING', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const).map((status) => {
                      const isCurrent = selectedDemo.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => handleUpdateDemoStatus(selectedDemo.id, status)}
                          className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-black transition-all flex items-center justify-between ${
                            status === 'PENDING' ? 'hover:bg-amber-50 border-amber-500/20 ' + (isCurrent ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 font-black ring-1 ring-amber-500/20' : 'text-slate-600') :
                            status === 'CONTACTED' ? 'hover:bg-teal-50 border-teal-500/20 ' + (isCurrent ? 'bg-teal-500/10 text-teal-600 border-teal-500/30 font-black ring-1 ring-teal-500/20' : 'text-slate-600') :
                            status === 'SCHEDULED' ? 'hover:bg-purple-50 border-purple-500/20 ' + (isCurrent ? 'bg-purple-500/10 text-purple-600 border-purple-500/30 font-black ring-1 ring-purple-500/20' : 'text-slate-600') :
                            status === 'COMPLETED' ? 'hover:bg-emerald-50 border-emerald-500/20 ' + (isCurrent ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-black ring-1 ring-emerald-500/20' : 'text-slate-600') :
                            'hover:bg-rose-50 border-rose-500/20 ' + (isCurrent ? 'bg-rose-500/10 text-rose-600 border-rose-500/30 font-black ring-1 ring-rose-500/20' : 'text-slate-600')
                          }`}
                        >
                          <span>{status}</span>
                          {isCurrent && <Check size={14} className="stroke-[3px]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Empathetic Assessment Profile */}
              <div className="md:col-span-2 space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Sliders size={14} />
                  Empathetic Child Assessment Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Social Confidence */}
                  <div className="bg-secondary/40 border border-border/40 rounded-2xl p-4 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Social Confidence</p>
                    <p className="text-sm font-extrabold text-slate-800">{getConfidenceLabel(selectedDemo.confidence)}</p>
                  </div>

                  {/* Primary Interests */}
                  <div className="bg-secondary/40 border border-border/40 rounded-2xl p-4 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Primary Development Focus</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedDemo.interests.map((interest, i) => (
                        <span key={i} className="text-xs font-extrabold text-slate-800">
                          {getInterestsLabel(interest)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mentorship Support */}
                  <div className="bg-secondary/40 border border-border/40 rounded-2xl p-4 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mentorship Status</p>
                    <p className="text-xs font-extrabold text-slate-800">{getHasMentorLabel(selectedDemo.hasMentor)}</p>
                  </div>

                  {/* Learning Preference */}
                  <div className="bg-secondary/40 border border-border/40 rounded-2xl p-4 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Learning Preference</p>
                    <p className="text-xs font-extrabold text-slate-800">{getLearningPrefLabel(selectedDemo.learningPref)}</p>
                  </div>

                  {/* Parental Involvement */}
                  <div className="bg-secondary/40 border border-border/40 rounded-2xl p-4 space-y-1 sm:col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Parent Involvement Level</p>
                    <p className="text-xs font-extrabold text-slate-800">{getParentInvolvementLabel(selectedDemo.parentInvolvement)}</p>
                  </div>
                </div>

                {/* Challenges Faced Checklist */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Growth Challenges in Past Year</p>
                  {selectedDemo.challenges && selectedDemo.challenges.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDemo.challenges.map((challenge: string, idx: number) => (
                        <span 
                          key={idx}
                          className="text-xs font-extrabold bg-rose-500/5 text-rose-500 border border-rose-500/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
                          {getChallengesLabel(challenge)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/60 italic font-semibold">No challenges specified</p>
                  )}
                </div>

                {/* Recommended Programs & Tiers */}
                <div className="border-t border-border/30 pt-6 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recommended Program Formats</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDemo.suggestedPrograms.map((prog: string, idx: number) => (
                      <span 
                        key={idx} 
                        className="text-xs font-black bg-primary/10 text-primary border border-primary/20 px-3.5 py-2 rounded-2xl shadow-sm inline-flex items-center gap-2"
                      >
                        <span className="w-2 h-2 bg-primary rounded-full shrink-0 animate-pulse" />
                        {prog}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="border-t border-border/30 pt-6 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDemoModal(false);
                  setSelectedDemo(null);
                }}
                className="px-6 py-3.5 bg-secondary text-muted-foreground font-black rounded-2xl transition-all border border-border/50 shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
