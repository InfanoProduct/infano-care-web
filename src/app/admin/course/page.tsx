'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Edit3,
  Loader2,
  PlayCircle,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

interface LessonItem {
  id: string;
  code: string;
  chapterId: string;
  sortOrder: number;
  orderInChapter: number;
  title: string;
  tagline: string;
  freePreview: boolean;
  calmMode: boolean;
  contentStatus: string;
  video: { url?: string; hlsUrl?: string; durationSec?: number; captionsUrl?: string; [k: string]: any };
  activity?: { id: string; name: string; type: string; estMinutes: number } | null;
}

interface ChapterItem {
  id: string;
  number: number;
  worldName: string;
  theme: string;
  calmMode: boolean;
  contentStatus: string;
  expert: { name?: string; title?: string; [k: string]: any };
  lessons: LessonItem[];
  checkin?: { id: string; title: string; passThreshold: number; calmMode: boolean; questions: any[] } | null;
}

interface CourseOverviewData {
  course: {
    id: string;
    slug?: string | null;
    title: string;
    description: string;
    audience: string;
    price: number;
    mrp: number;
    isFree: boolean;
    isActive: boolean;
    unlockRule: string;
    chapterCount: number;
    lessonCount: number;
    chapters: ChapterItem[];
  } | null;
  badges: Array<{ id: string; name: string; description: string; petalsOnAward: number }>;
  enrollments: Array<{
    id: string;
    status: string;
    pricePaid: number;
    currency: string;
    createdAt: string;
    user?: { id: string; phone?: string; email?: string; profile?: { displayName?: string } };
  }>;
  learnersCount: number;
}

export default function AdminHerNextCoursePage() {
  const [data, setData] = useState<CourseOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'settings' | 'enrollments'>('curriculum');
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [grantIdentifier, setGrantIdentifier] = useState('');
  const [granting, setGranting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Editing modals
  const [editingLesson, setEditingLesson] = useState<LessonItem | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    tagline: '',
    freePreview: false,
    calmMode: false,
    contentStatus: 'published',
    videoUrl: '',
    durationSec: 0,
  });

  const [courseForm, setCourseForm] = useState({
    title: '',
    slug: '',
    description: '',
    audience: '',
    price: 999,
    mrp: 1998,
    isFree: false,
    isActive: true,
  });

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<CourseOverviewData>('/course/admin/overview');
      setData(res);
      if (res.course) {
        setCourseForm({
          title: res.course.title || '',
          slug: res.course.slug || 'girlhood-hernext',
          description: res.course.description || '',
          audience: res.course.audience || '',
          price: res.course.price ?? 999,
          mrp: res.course.mrp ?? 1998,
          isFree: Boolean(res.course.isFree),
          isActive: res.course.isActive !== false,
        });
        if (!expandedChapter && res.course.chapters?.length > 0) {
          setExpandedChapter(res.course.chapters[0].id);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load HerNext course data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const handleReseed = async () => {
    setSeeding(true);
    try {
      await apiClient.post('/course/admin/seed', {});
      toast.success('Course curriculum synced from seed JSON');
      await loadOverview();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to re-seed course');
    } finally {
      setSeeding(false);
    }
  };

  const handleSaveCourseSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.course) return;
    setSaving(true);
    try {
      await apiClient.patch(`/course/admin/courses/${data.course.id}`, courseForm);
      toast.success('Course catalog & pricing updated');
      await loadOverview();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update course settings');
    } finally {
      setSaving(false);
    }
  };

  const handleGrantEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantIdentifier.trim()) return;
    setGranting(true);
    try {
      await apiClient.post('/course/admin/enrollments', {
        identifier: grantIdentifier.trim(),
        plan: 'admin_grant',
        amountPaid: 0,
      });
      toast.success('Course access granted');
      setGrantIdentifier('');
      await loadOverview();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to grant access');
    } finally {
      setGranting(false);
    }
  };

  const handleToggleEnrollmentStatus = async (enrollmentId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
    setTogglingId(enrollmentId);
    try {
      await apiClient.patch(`/course/admin/enrollments/${enrollmentId}`, {
        status: nextStatus,
      });
      toast.success(`Enrollment marked ${nextStatus}`);
      await loadOverview();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update enrollment status');
    } finally {
      setTogglingId(null);
    }
  };

  const openLessonEditor = (lesson: LessonItem) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title || '',
      tagline: lesson.tagline || '',
      freePreview: Boolean(lesson.freePreview),
      calmMode: Boolean(lesson.calmMode),
      contentStatus: lesson.contentStatus || 'published',
      videoUrl: lesson.video?.hlsUrl || lesson.video?.url || '',
      durationSec: Number(lesson.video?.durationSec || 0),
    });
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;
    setSaving(true);
    try {
      const nextVideo = {
        ...(editingLesson.video || {}),
        hlsUrl: lessonForm.videoUrl,
        url: lessonForm.videoUrl,
        durationSec: Number(lessonForm.durationSec) || 0,
      };
      await apiClient.patch(`/course/admin/lessons/${editingLesson.id}`, {
        title: lessonForm.title,
        tagline: lessonForm.tagline,
        freePreview: lessonForm.freePreview,
        calmMode: lessonForm.calmMode,
        contentStatus: lessonForm.contentStatus,
        video: nextVideo,
      });
      toast.success(`Updated lesson ${editingLesson.code}`);
      setEditingLesson(null);
      await loadOverview();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update lesson');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const course = data?.course;
  const totalLessons = course?.chapters.reduce((s, c) => s + c.lessons.length, 0) || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
            <Sparkles size={14} /> Structured Curriculum Engine
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {course?.title || 'HerNext Course Manager'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {course?.chapters.length || 0} Worlds · {totalLessons} Lessons · {data?.badges.length || 0} Badges · {data?.learnersCount || 0} Learners
          </p>
        </div>

        <button
          onClick={handleReseed}
          disabled={seeding}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-60"
        >
          {seeding ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Sync Seed JSON
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'curriculum', label: 'Worlds & Lessons', icon: Compass },
          { id: 'settings', label: 'Catalog & Pricing', icon: BookOpen },
          { id: 'enrollments', label: `Enrollments (${data?.enrollments.length || 0})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                active
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Curriculum Tab */}
      {activeTab === 'curriculum' && course && (
        <div className="space-y-4">
          {course.chapters.map((ch) => {
            const isOpen = expandedChapter === ch.id;
            return (
              <div
                key={ch.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => setExpandedChapter(isOpen ? null : ch.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 font-black flex items-center justify-center text-sm">
                      W{ch.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900">{ch.worldName}</h3>
                        {ch.calmMode && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full">
                            Calm Mode
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {ch.theme} · {ch.lessons.length} Lessons
                        {ch.expert?.name ? ` · ${ch.expert.name}` : ''}
                      </p>
                    </div>
                  </div>
                  {isOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 divide-y divide-slate-100">
                    {ch.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50/50"
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 text-xs font-black px-2 py-1 rounded-lg bg-slate-100 text-slate-700">
                            {lesson.code}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">{lesson.title}</span>
                              {lesson.freePreview && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                                  Free Preview
                                </span>
                              )}
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {lesson.contentStatus}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{lesson.tagline}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <PlayCircle size={12} />{' '}
                                {lesson.video?.hlsUrl || lesson.video?.url ? 'Video configured' : 'No video URL'}
                              </span>
                              {lesson.activity && (
                                <span className="inline-flex items-center gap-1">
                                  <CheckCircle2 size={12} /> {lesson.activity.name} ({lesson.activity.type})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => openLessonEditor(lesson)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-primary/40 hover:bg-primary/5 text-xs font-bold text-slate-700 self-start sm:self-center"
                        >
                          <Edit3 size={13} /> Edit Lesson
                        </button>
                      </div>
                    ))}

                    {ch.checkin && (
                      <div className="px-5 py-3.5 bg-amber-50/40 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-amber-900">
                          <ShieldCheck size={15} className="text-amber-600" />
                          World Check-in: {ch.checkin.title} (Pass threshold: {ch.checkin.passThreshold} · {ch.checkin.questions?.length || 0} questions)
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Catalog & Pricing Tab */}
      {activeTab === 'settings' && course && (
        <form
          onSubmit={handleSaveCourseSettings}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5 shadow-2xs"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Title</label>
              <input
                type="text"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">URL Slug</label>
              <input
                type="text"
                value={courseForm.slug}
                onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price (INR)</label>
              <input
                type="number"
                value={courseForm.price}
                onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">MRP (INR)</label>
              <input
                type="number"
                value={courseForm.mrp}
                onChange={(e) => setCourseForm({ ...courseForm, mrp: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Audience</label>
            <input
              type="text"
              value={courseForm.audience}
              onChange={(e) => setCourseForm({ ...courseForm, audience: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={courseForm.isActive}
                onChange={(e) => setCourseForm({ ...courseForm, isActive: e.target.checked })}
                className="rounded"
              />
              Published / Active in Catalog
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={courseForm.isFree}
                onChange={(e) => setCourseForm({ ...courseForm, isFree: e.target.checked })}
                className="rounded"
              />
              Free Enrollment
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-all"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Course Settings
          </button>
        </form>
      )}

      {/* Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">
                Course Enrollments ({data?.enrollments.length || 0})
              </h2>
              <p className="text-xs text-slate-500">
                Grant or revoke full HerNext access by user phone or email
              </p>
            </div>
            <form onSubmit={handleGrantEnrollment} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={grantIdentifier}
                onChange={(e) => setGrantIdentifier(e.target.value)}
                placeholder="Phone or email (e.g. 1234567891)"
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-primary min-w-[210px]"
              />
              <button
                type="submit"
                disabled={granting || !grantIdentifier.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 disabled:opacity-50"
              >
                {granting ? 'Granting...' : 'Grant Access'}
              </button>
            </form>
          </div>
          {data?.enrollments.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Paid</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.enrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {enr.user?.profile?.displayName || 'Customer'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {enr.user?.phone || enr.user?.email || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            enr.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {enr.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">
                        {enr.currency || 'INR'} {enr.pricePaid ?? 0}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">
                        {new Date(enr.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          disabled={togglingId === enr.id}
                          onClick={() => handleToggleEnrollmentStatus(enr.id, enr.status)}
                          className="text-xs font-bold px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-50"
                        >
                          {togglingId === enr.id
                            ? 'Updating...'
                            : enr.status === 'ACTIVE'
                            ? 'Revoke'
                            : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-slate-500">
              No course enrollments recorded yet.
            </div>
          )}
        </div>
      )}

      {/* Lesson Editor Modal */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">
                Edit Lesson {editingLesson.code}
              </h3>
              <button
                onClick={() => setEditingLesson(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Title</label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={lessonForm.tagline}
                  onChange={(e) => setLessonForm({ ...lessonForm, tagline: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Content Status</label>
                  <select
                    value={lessonForm.contentStatus}
                    onChange={(e) => setLessonForm({ ...lessonForm, contentStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  >
                    <option value="published">published</option>
                    <option value="medical_review_pending">medical_review_pending</option>
                    <option value="draft">draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Video Duration (sec)</label>
                  <input
                    type="number"
                    value={lessonForm.durationSec}
                    onChange={(e) => setLessonForm({ ...lessonForm, durationSec: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">HLS (.m3u8) / Video URL</label>
                <input
                  type="text"
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  placeholder="https://.../playlist.m3u8"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono text-xs"
                />
              </div>
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={lessonForm.freePreview}
                    onChange={(e) => setLessonForm({ ...lessonForm, freePreview: e.target.checked })}
                  />
                  Free Preview
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={lessonForm.calmMode}
                    onChange={(e) => setLessonForm({ ...lessonForm, calmMode: e.target.checked })}
                  />
                  Calm Mode
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

