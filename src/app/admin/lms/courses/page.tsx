"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
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

export default function LmsCoursesPage() {
  const [courses, setCourses] = useState<LmsCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await apiClient.get<LmsCourse[]>("/lms/admin/courses");
      setCourses(data);
    } catch (error) {
      toast.error("Error fetching courses");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">LMS Courses</h1>
          <p className="text-muted-foreground">Manage your online courses, modules, and chapters.</p>
        </div>
        <Link
          href="/admin/lms/courses/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Create Course
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
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
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No courses found. Create one to get started.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
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
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        course.isActive 
                          ? 'bg-primary/10 text-primary ring-primary/20' 
                          : 'bg-muted text-muted-foreground ring-border'
                      }`}>
                        {course.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/lms/courses/${course.id}/edit`} className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted">
                          <Edit2 size={16} />
                        </Link>
                        <button onClick={() => handleDelete(course.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
