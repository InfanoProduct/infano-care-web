"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Video, PlayCircle, Play } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";

export default function MyCoursesPage() {
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const myCoursesRes = await apiClient.get("/lms/my-courses");
      if (myCoursesRes) setMyCourses(myCoursesRes as any[]);
    } catch {
      toast.error("Failed to load your courses");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pb-24 overflow-x-hidden">

      {/* Floating sparkle stars — using brand primary color */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: "8%",  left: "5%",  size: 14, delay: "0s"   },
          { top: "15%", left: "28%", size: 10, delay: "0.5s" },
          { top: "5%",  left: "55%", size: 16, delay: "1s"   },
          { top: "22%", left: "80%", size: 11, delay: "1.5s" },
          { top: "60%", left: "3%",  size: 9,  delay: "0.8s" },
          { top: "70%", left: "92%", size: 13, delay: "0.3s" },
        ].map((s, i) => (
          <svg
            key={i}
            style={{ position: "absolute", top: s.top, left: s.left, animationDelay: s.delay }}
            width={s.size} height={s.size} viewBox="0 0 24 24" fill="#4a1e7f"
            className="opacity-20 animate-pulse"
          >
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">

        {/* ── Page Header ── */}
        <div className="flex flex-col items-center text-center mb-14">
          <div className="relative inline-block">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
              My Learning{" "}
              <span className="text-primary">Journey</span>
            </h1>
            {/* Leaf illustration — matches sidebar primary color #4a1e7f */}
            <svg
              className="absolute -top-4 -right-10 opacity-70"
              width="36" height="40" viewBox="0 0 36 40" fill="none"
            >
              <path d="M18 2 C10 8 4 18 8 30 C12 38 20 38 26 32 C32 24 30 12 18 2Z" fill="#4a1e7f" opacity="0.25" />
              <path d="M18 2 C24 10 28 22 22 32" stroke="#4a1e7f" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M16 28 C20 24 24 18 22 12" stroke="#4a1e7f" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d="M20 34 C18 36 17 38 18 40" stroke="#4a1e7f" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <circle cx="28" cy="6" r="1.5" fill="#4a1e7f" opacity="0.5" />
              <circle cx="32" cy="12" r="1" fill="#4a1e7f" opacity="0.4" />
              <circle cx="30" cy="4" r="1" fill="#4a1e7f" opacity="0.35" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium mt-4 text-lg">
            Pick up right where you left off.
          </p>
          {/* Accent underline — same as sidebar active color */}
          <div className="w-14 h-1 bg-primary rounded-full mt-4" />
        </div>

        {/* ── Loading Skeletons ── */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-primary/5" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty State ── */}
        {!isLoading && myCourses.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[32px] border border-slate-100 shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">No courses yet</h3>
            <p className="text-slate-500 mt-3 font-medium text-lg max-w-sm mx-auto">
              You haven&apos;t enrolled in any courses. Explore our catalog to start learning!
            </p>
            <button
              onClick={() => router.push("/dashboard/courses")}
              className="mt-8 px-8 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-full font-bold transition-all shadow-lg shadow-primary/20 inline-flex items-center gap-2"
            >
              Explore Catalog <span className="text-xl">→</span>
            </button>
          </div>
        )}

        {/* ── Course Grid ── */}
        {!isLoading && myCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((enrollment) => {
              const course = enrollment.course;
              const totalChapters =
                course.modules?.reduce(
                  (acc: number, m: any) => acc + (m.chapters?.length || 0),
                  0
                ) || 0;
              const completedChapters =
                enrollment.progress?.filter((p: any) => p.isCompleted).length || 0;
              const progressPct =
                totalChapters > 0
                  ? Math.round((completedChapters / totalChapters) * 100)
                  : 0;

              return (
                <Link
                  key={enrollment.id}
                  href={`/dashboard/courses/${course.id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_20px_rgba(74,30,127,0.05)] hover:shadow-[0_8px_32px_rgba(74,30,127,0.12)] transition-all duration-300 overflow-hidden">

                    {/* ── Thumbnail ── */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-slate-50">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/30">
                          <Video size={56} />
                        </div>
                      )}

                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      {/* Continue pill — top right — uses primary on hover */}
                      <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur text-primary text-xs font-black px-3.5 py-2 rounded-full shadow-md border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-200">
                        <PlayCircle size={14} />
                        Continue
                      </div>

                      {/* Progress overlay — bottom of image */}
                      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3.5 pt-2">
                        <div className="flex justify-between text-[11px] font-black text-white uppercase tracking-wider mb-2">
                          <span>{progressPct}% Completed</span>
                          <span>{completedChapters}/{totalChapters} Lessons</span>
                        </div>
                        {/* Progress bar using primary color to match sidebar */}
                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(74,30,127,0.5)]"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ── Card Body ── */}
                    <div className="p-4">
                      <h3 className="font-extrabold text-[16px] text-slate-800 line-clamp-1 group-hover:text-primary transition-colors mb-3">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          <div className="w-7 h-7 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center text-[11px] shadow-sm">
                            👩‍🏫
                          </div>
                          <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[11px] shadow-sm">
                            👨‍⚕️
                          </div>
                        </div>
                        <span className="text-[13px] font-bold text-slate-400">
                          Expert Led
                        </span>
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-primary font-bold text-[12px]">
                          Resume <Play className="w-3 h-3" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
