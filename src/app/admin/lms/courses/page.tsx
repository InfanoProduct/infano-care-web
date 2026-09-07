"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  IndianRupee,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  FileQuestion,
  Video as VideoIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

interface LmsChapter {
  id: string;
  title: string;
  type: "VIDEO" | "ASSESSMENT";
}

interface LmsModule {
  id: string;
  title: string;
  order: number;
  chapters?: LmsChapter[];
}

interface LmsCourse {
  id: string;
  title: string;
  description: string;
  timeDuration: number;
  thumbnailUrl?: string | null;
  price: number;
  isFree: boolean;
  isActive: boolean;
  category?: string | null;
  highlights?: string[];
  modules?: LmsModule[];
}

interface LmsEnrollment {
  id: string;
  userId: string;
  courseId: string;
  pricePaid: number;
  status: string;
  createdAt: string;
  course: {
    id: string;
    title: string;
    price: number;
  };
  user: {
    id: string;
    username: string;
    email: string | null;
    phone: string;
  };
}

export default function LmsCoursesPage() {
  const [courses, setCourses] = useState<LmsCourse[]>([]);
  const [enrollments, setEnrollments] = useState<LmsEnrollment[]>([]);
  const [showEnrollments, setShowEnrollments] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [togglingCourseId, setTogglingCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (showEnrollments) {
      fetchEnrollments();
    } else {
      fetchCourses();
    }
  }, [showEnrollments]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<LmsCourse[]>("/lms/admin/courses");
      setCourses(data);
    } catch (error) {
      toast.error("Error fetching courses");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<LmsEnrollment[]>("/lms/admin/courseenrollments");
      setEnrollments(data);
    } catch (error) {
      toast.error("Error fetching enrollments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will permanently remove all modules, lessons, and quizzes within this course.`)) return;
    try {
      await apiClient.delete(`/lms/admin/courses/${id}`);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const handleToggleStatus = async (course: LmsCourse) => {
    setTogglingCourseId(course.id);
    const newStatus = !course.isActive;
    try {
      await apiClient.put(`/lms/admin/courses/${course.id}`, {
        ...course,
        isActive: newStatus,
      });
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, isActive: newStatus } : c))
      );
      toast.success(`Course ${newStatus ? "published (active)" : "saved as draft"}`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setTogglingCourseId(null);
    }
  };

  // Metrics calculations
  const totalCoursesCount = courses.length;
  const activeCoursesCount = courses.filter((c) => c.isActive).length;
  const totalEnrollmentsCount = enrollments.length;
  const totalRevenue = enrollments.reduce((sum, e) => sum + (e.pricePaid || 0), 0);

  // Extract unique categories
  const categories = ["ALL", ...Array.from(new Set(courses.map((c) => c.category || "General").filter(Boolean)))];

  // Filtering
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "ALL" || (c.category || "General") === selectedCategory;

    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "ACTIVE" && c.isActive) ||
      (selectedStatus === "DRAFT" && !c.isActive) ||
      (selectedStatus === "FREE" && c.isFree) ||
      (selectedStatus === "PAID" && !c.isFree);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredEnrollments = enrollments.filter((e) => {
    const query = searchQuery.toLowerCase();
    const username = e.user?.username?.toLowerCase() || "";
    const email = e.user?.email?.toLowerCase() || "";
    const phone = e.user?.phone || "";
    const courseTitle = e.course?.title?.toLowerCase() || "";
    return (
      username.includes(query) ||
      email.includes(query) ||
      phone.includes(query) ||
      courseTitle.includes(query)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                LMS Course Management
              </h1>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">
                Build structured video curriculum, assessments, modules, and track enrollments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEnrollments(!showEnrollments)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all shadow-xs ${
              showEnrollments
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-muted"
            }`}
          >
            <Users size={16} />
            {showEnrollments ? "Back to Courses" : `Enrollments (${enrollments.length || 0})`}
          </button>

          {!showEnrollments && (
            <Link
              href="/admin/lms/courses/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md shadow-primary/20 text-sm font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={18} />
              Create Course
            </Link>
          )}
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Courses</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">{totalCoursesCount}</h3>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              {activeCoursesCount} Published · {totalCoursesCount - activeCoursesCount} Drafts
            </p>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active & Live</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">{activeCoursesCount}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {totalCoursesCount > 0 ? Math.round((activeCoursesCount / totalCoursesCount) * 100) : 0}% of catalog live
            </p>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Students</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">{totalEnrollmentsCount}</h3>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Across all courses</p>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">LMS Revenue</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">₹{totalRevenue.toLocaleString("en-IN")}</h3>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">Direct course purchases</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        {/* Controls / Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={showEnrollments ? "Search student, email, phone, or course..." : "Search courses by title, keywords..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>

            {!showEnrollments && (
              <>
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3.5 py-2 bg-background border border-border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  {categories.filter((c) => c !== "ALL").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Status / Price Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3.5 py-2 bg-background border border-border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground cursor-pointer"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Published (Active)</option>
                  <option value="DRAFT">Drafts Only</option>
                  <option value="FREE">Free Courses</option>
                  <option value="PAID">Paid Courses</option>
                </select>
              </>
            )}
          </div>

          {!showEnrollments && (
            <div className="flex items-center gap-1.5 bg-background p-1 rounded-xl border border-border self-end md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Table View"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Courses View */}
        {!showEnrollments ? (
          isLoading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-muted-foreground">Loading course catalog...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-16 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <BookOpen size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">No courses found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || selectedCategory !== "ALL" || selectedStatus !== "ALL"
                    ? "Try adjusting your search criteria or active filters."
                    : "Get started by building your first online course with chapters and quizzes."}
                </p>
              </div>
              <Link
                href="/admin/lms/courses/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-xs"
              >
                <Plus size={16} /> Create Course
              </Link>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const totalModules = course.modules?.length || 0;
                const totalChapters = (course.modules || []).reduce(
                  (sum, m) => sum + (m.chapters?.length || 0),
                  0
                );
                const isToggling = togglingCourseId === course.id;

                return (
                  <div
                    key={course.id}
                    className="bg-card border border-border/70 hover:border-primary/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group"
                  >
                    {/* Course Thumbnail */}
                    <div className="relative w-full aspect-video bg-muted/40 overflow-hidden border-b border-border/40">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 p-4">
                          <BookOpen size={36} className="mb-1" />
                          <span className="text-xs font-semibold">No thumbnail set</span>
                        </div>
                      )}

                      {/* Category Badge */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white shadow-xs">
                        {course.category || "General"}
                      </span>

                      {/* Duration Badge */}
                      {course.timeDuration > 0 && (
                        <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/70 backdrop-blur-md text-white flex items-center gap-1 shadow-xs">
                          <Clock size={12} /> {course.timeDuration} min
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-foreground text-base line-clamp-1 group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {course.description || "No description provided."}
                        </p>
                      </div>

                      {/* Meta stats badges */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground pt-1 border-t border-border/40">
                        <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                          <Layers size={13} className="text-primary" /> {totalModules} Modules
                        </span>
                        <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                          <VideoIcon size={13} className="text-primary" /> {totalChapters} Lessons
                        </span>
                        <span
                          className={`ml-auto font-black px-2 py-0.5 rounded-md text-xs ${
                            course.isFree
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-purple-500/10 text-purple-600"
                          }`}
                        >
                          {course.isFree ? "FREE" : `₹${course.price}`}
                        </span>
                      </div>

                      {/* Actions footer */}
                      <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                        {/* Publish Status Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(course)}
                          disabled={isToggling}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            course.isActive
                              ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              course.isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                            }`}
                          />
                          {isToggling ? "Updating..." : course.isActive ? "Published" : "Draft"}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/lms/courses/${course.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold rounded-lg transition-all"
                          >
                            <Edit2 size={13} /> Curriculum Builder
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(course.id, course.title)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Delete course"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-bold tracking-wider border-b border-border/60">
                  <tr>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Curriculum</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredCourses.map((course) => {
                    const totalModules = course.modules?.length || 0;
                    const totalChapters = (course.modules || []).reduce(
                      (sum, m) => sum + (m.chapters?.length || 0),
                      0
                    );
                    const isToggling = togglingCourseId === course.id;

                    return (
                      <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 rounded-lg bg-muted/60 overflow-hidden shrink-0 border border-border/40">
                              {course.thumbnailUrl ? (
                                <img
                                  src={course.thumbnailUrl}
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <BookOpen size={14} />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-foreground line-clamp-1">{course.title}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[260px]">
                                {course.description || "No description"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-xs text-muted-foreground">
                          <span className="px-2 py-0.5 rounded-md bg-muted text-foreground">
                            {course.category || "General"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-xs text-muted-foreground">
                          {course.timeDuration} min
                        </td>
                        <td className="px-6 py-4 font-medium text-xs">
                          {totalModules} modules · {totalChapters} lessons
                        </td>
                        <td className="px-6 py-4 font-bold text-xs">
                          {course.isFree ? (
                            <span className="text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              FREE
                            </span>
                          ) : (
                            `₹${course.price}`
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(course)}
                            disabled={isToggling}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                              course.isActive
                                ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20"
                                : "bg-muted text-muted-foreground ring-1 ring-border"
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                course.isActive ? "bg-emerald-500" : "bg-muted-foreground"
                              }`}
                            />
                            {course.isActive ? "Published" : "Draft"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/lms/courses/${course.id}/edit`}
                              className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                            >
                              <Edit2 size={13} /> Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(course.id, course.title)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              title="Delete Course"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Enrollments View */
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-bold tracking-wider border-b border-border/60">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Enrolled Course</th>
                  <th className="px-6 py-4">Price Paid</th>
                  <th className="px-6 py-4">Enrolled On</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading student enrollments...
                    </td>
                  </tr>
                ) : filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No student enrollments found.
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-xs">
                            {(enrollment.user?.username || "U").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">
                              {enrollment.user?.username || "Unnamed User"}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              ID: {enrollment.userId.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-xs text-foreground">
                          {enrollment.user?.phone || "--"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {enrollment.user?.email || "--"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">
                          {enrollment.course?.title || "Unknown Course"}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-xs">
                        {enrollment.pricePaid > 0 ? (
                          <span className="text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-md">
                            ₹{enrollment.pricePaid}
                          </span>
                        ) : (
                          <span className="text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            FREE
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                        {new Date(enrollment.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
                            enrollment.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                              : enrollment.status === "COMPLETED"
                              ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                              : "bg-amber-50 text-amber-700 ring-amber-600/20"
                          }`}
                        >
                          {enrollment.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

