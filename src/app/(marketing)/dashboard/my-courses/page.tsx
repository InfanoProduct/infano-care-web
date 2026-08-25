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
              const totalModules = course.modules?.length || 0;
              const hoursLeft = course.timeDuration
                ? Math.ceil(((100 - progressPct) / 100) * (course.timeDuration / 60))
                : null;

              return (
                <Link
                  key={enrollment.id}
                  href={`/dashboard/courses/${course.id}/overview`}
                  className="block group"
                >
                  <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(74,30,127,0.05)] hover:shadow-[0_8px_32px_rgba(74,30,127,0.12)] transition-all duration-300 overflow-hidden">

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
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                      {/* Top meta row */}
                      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3.5 pt-3.5">
                        {course.category && (
                          <span className="bg-white/90 backdrop-blur-sm text-primary text-[11px] font-black px-3 py-1 rounded-full shadow-sm border border-primary/10">
                            {course.category}
                          </span>
                        )}
                        {hoursLeft !== null && hoursLeft > 0 && (
                          <span className="ml-auto bg-black/40 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                            {hoursLeft}h left
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── Card Body ── */}
                    <div className="p-4 pb-3">
                      <h3 className="font-extrabold text-[15px] text-slate-800 line-clamp-2 group-hover:text-primary transition-colors leading-snug mb-2">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center text-[10px] shadow-sm">👩‍🏫</div>
                          <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] shadow-sm">👨‍⚕️</div>
                        </div>
                        <span className="text-[12px] font-bold text-slate-400">Expert Led</span>
                        {totalModules > 0 && (
                          <span className="ml-auto text-[11px] font-bold text-slate-400">{totalModules} modules</span>
                        )}
                      </div>
                    </div>

                    {/* ── Progress + Continue row ── */}
                    <div className="px-4 pb-4 pt-1 border-t border-slate-50">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[12px] font-bold text-slate-500">Progress: <span className="text-slate-700">{progressPct}%</span></span>
                        <span className="ml-auto text-[11px] font-semibold text-slate-400">{completedChapters}/{totalChapters} lessons</span>
                      </div>
                      {/* Green progress bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-700 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <button
                          onClick={(e) => { e.preventDefault(); router.push(`/dashboard/courses/${course.id}/overview`); }}
                          className="shrink-0 flex items-center gap-1.5 bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-600 text-[12px] font-extrabold px-4 py-1.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md group-hover:border-primary group-hover:text-primary"
                        >
                          <PlayCircle size={13} />
                          Continue
                        </button>
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
