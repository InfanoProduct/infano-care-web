"use client";

import React from "react";
import { useParams } from "next/navigation";
import { CoursePlayerShell } from "@/components/course/CoursePlayerShell";
import { LessonLockedCard } from "@/components/course/LessonLockedCard";
import { useActiveLearnerId, useInvalidateCourse, useLessonDetail } from "@/hooks/use-course";
import { CourseService } from "@/services/course.service";
import { ActivityRenderer } from "@/components/course/activities/ActivityRenderer";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function LessonPlayPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const learnerId = useActiveLearnerId();
  const invalidateCourse = useInvalidateCourse();
  const { data, isLoading, isError } = useLessonDetail(lessonId);

  if (isError) {
    return (
      <CoursePlayerShell backHref="/dashboard/journey" backLabel="Journey">
        <LessonLockedCard />
      </CoursePlayerShell>
    );
  }

  if (isLoading || !data?.lesson) {
    return (
      <CoursePlayerShell backHref={`/dashboard/courses/lesson/${lessonId}`} backLabel="Lesson Hub">
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-[#C2456A]" />
        </div>
      </CoursePlayerShell>
    );
  }

  const { lesson } = data;
  const chapter = lesson.chapter;
  const activity = lesson.activity;
  const softBg = chapter?.colors?.soft || "#E3F0FA";
  const ink = chapter?.colors?.ink || "#2F6494";

  const handleComplete = async (result: { score: number; flags?: string[] }) => {
    if (!learnerId || learnerId === "default") return;
    try {
      const res: any = await CourseService.saveActivityResult(learnerId, lesson.id, result);
      await invalidateCourse();
      if (res?.petalsAwarded > 0) {
        toast.success(`Activity complete! +${res.petalsAwarded} petals 🌸`);
      }
      if (Array.isArray(res?.badgesEarned)) {
        res.badgesEarned.forEach((b: any) => {
          toast.success(`Badge unlocked: ${b.name}! ⭐`);
        });
      }
    } catch {
      // ignore offline error
    }
  };

  return (
    <CoursePlayerShell
      backHref={`/dashboard/courses/lesson/${lesson.id}`}
      backLabel="Lesson Hub"
      worldName={chapter?.worldName}
      lessonCode={lesson.code}
      lessonId={lesson.id}
      activeStep="play"
      stepsDone={data?.progress?.stepsDone || []}
      colors={chapter?.colors}
      calmMode={Boolean(lesson.calmMode)}
      gigiTip="Take your time and have fun with this interactive activity!"
      maxWidthClass="max-w-5xl"
    >
      <div
        style={{ backgroundColor: softBg }}
        className="rounded-[32px] p-5 sm:p-8 border border-[#F1E4E8] shadow-xs flex flex-col gap-6 min-h-[72vh]"
      >
        {/* Header */}
        <div className="max-w-4xl mx-auto w-full">
          <div style={{ color: ink }} className="text-xs font-extrabold uppercase tracking-wider">
            STEP 2 · PLAY · LESSON {lesson.code}
          </div>
          <h1 className="m-0 font-['Baloo_2',sans-serif] font-bold text-2xl sm:text-3xl text-[#3D2C4A] truncate">
            {activity?.name || "Activity"}
          </h1>
        </div>

        {/* Dynamic Activity Engine */}
        {activity && chapter ? (
          <ActivityRenderer
            activity={activity}
            colors={chapter.colors}
            nextHref={`/dashboard/courses/lesson/${lesson.id}/discover`}
            onComplete={handleComplete}
          />
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center text-[#5E4B6B]">
            No activity configured for this lesson.
          </div>
        )}
      </div>
    </CoursePlayerShell>
  );
}

