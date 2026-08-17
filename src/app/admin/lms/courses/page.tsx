"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

interface LmsCourse {
  id: string;
  title: string;
  description: string;
  timeDuration: number;
  price: number;
  isFree: boolean;
  isActive: boolean;
  modules: any[];
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
  const [enrollmentSearchQuery, setEnrollmentSearchQuery] = useState("");

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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course? This will delete all modules and chapters within it.")) return;
    try {
      await apiClient.delete(`/lms/admin/courses/${id}`);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter((e) => {
    const query = enrollmentSearchQuery.toLowerCase();
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {showEnrollments ? "Course Enrollments" : "LMS Courses"}
          </h1>
          <p className="text-muted-foreground">
            {showEnrollments
              ? "View registered course students, emails, phone numbers, and payments."
              : "Manage your online courses, modules, and chapters."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEnrollments(!showEnrollments)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-border bg-card hover:bg-muted text-card-foreground rounded-md shadow-sm text-sm font-medium transition-colors"
          >
            <Users size={16} />
            {showEnrollments ? "Manage Courses" : "View Enrollments"}
          </button>
          {!showEnrollments && (
            <Link
              href="/admin/lms/courses/create"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Create Course
            </Link>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={showEnrollments ? "Search enrollments..." : "Search courses..."}
              value={showEnrollments ? enrollmentSearchQuery : searchQuery}
              onChange={(e) =>
                showEnrollments
                  ? setEnrollmentSearchQuery(e.target.value)
                  : setSearchQuery(e.target.value)
              }
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {!showEnrollments ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Modules</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      Loading courses...
                    </td>
                  </tr>
                ) : filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No courses found.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{course.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {course.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">{course.timeDuration} min</td>
                      <td className="px-6 py-4">{course.modules?.length || 0} Modules</td>
                      <td className="px-6 py-4">
                        {course.isFree ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Free
                          </span>
                        ) : (
                          `₹${course.price}`
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${course.isActive
                              ? "bg-primary/10 text-primary ring-primary/20"
                              : "bg-muted text-muted-foreground ring-border"
                            }`}
                        >
                          {course.isActive ? "Active" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/lms/courses/${course.id}/edit`}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Phone No.</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Course Name</th>
                  <th className="px-6 py-4">Amt</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      Loading enrollments...
                    </td>
                  </tr>
                ) : filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No enrollments found.
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">
                          {enrollment.user?.username || "Unnamed User"}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {enrollment.user?.phone || "--"}
                      </td>
                      <td className="px-6 py-4">
                        {enrollment.user?.email || "--"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">
                          {enrollment.course?.title || "Unknown Course"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {enrollment.pricePaid > 0 ? `₹${enrollment.pricePaid}` : "Free"}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(enrollment.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${enrollment.status === "ACTIVE"
                              ? "bg-green-50 text-green-700 ring-green-600/20"
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
          )}
        </div>
      </div>
    </div>
  );
}
