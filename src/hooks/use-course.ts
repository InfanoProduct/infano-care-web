"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CourseService } from "@/services/course.service";
import { useAuthStore } from "@/store/auth-store";

export function useActiveLearnerId(): string | null {
  const { activeProfile, learners } = useAuthStore();
  if (activeProfile?.type === "DAUGHTER" && activeProfile.learner?.id) {
    return activeProfile.learner.id;
  }
  if (learners && learners.length > 0 && learners[0]?.id) {
    return learners[0].id;
  }
  return null;
}

export function useCourseCurriculum() {
  return useQuery({
    queryKey: ["course-curriculum"],
    queryFn: () => CourseService.getCurriculum(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useLearnerCourseState(explicitLearnerId?: string | null) {
  const activeLearnerId = useActiveLearnerId();
  const { isAuthenticated } = useAuthStore();
  const learnerId = explicitLearnerId ?? activeLearnerId;

  return useQuery({
    queryKey: ["course-learner-state", learnerId],
    queryFn: () => CourseService.getLearnerState(learnerId!),
    enabled: Boolean(isAuthenticated && learnerId && learnerId !== "default"),
    staleTime: 1000 * 30,
  });
}

export function useLessonDetail(lessonId: string, explicitLearnerId?: string | null) {
  const activeLearnerId = useActiveLearnerId();
  const { isAuthenticated } = useAuthStore();
  const learnerId = explicitLearnerId ?? activeLearnerId;
  const validLearner = learnerId && learnerId !== "default" ? learnerId : undefined;

  return useQuery({
    queryKey: ["course-lesson", lessonId, validLearner],
    queryFn: () => CourseService.getLessonDetail(lessonId, validLearner),
    enabled: Boolean(isAuthenticated && lessonId),
  });
}

export function useCheckinDetail(checkinId: string, explicitLearnerId?: string | null) {
  const activeLearnerId = useActiveLearnerId();
  const { isAuthenticated } = useAuthStore();
  const learnerId = explicitLearnerId ?? activeLearnerId;
  const validLearner = learnerId && learnerId !== "default" ? learnerId : undefined;

  return useQuery({
    queryKey: ["course-checkin", checkinId, validLearner],
    queryFn: () => CourseService.getCheckin(checkinId, validLearner),
    enabled: Boolean(isAuthenticated && checkinId),
  });
}

export function useInvalidateCourse() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["course-learner-state"] }),
      queryClient.invalidateQueries({ queryKey: ["course-lesson"] }),
      queryClient.invalidateQueries({ queryKey: ["course-checkin"] }),
      queryClient.invalidateQueries({ queryKey: ["parent-course-overview"] }),
    ]);
  };
}

export function resolveResumeStepPath(
  lessonId: string,
  progress?: { stepsDone?: string[]; watchPositionS?: number; watchPercent?: number } | null
): {
  stepKey: "watch" | "play" | "discover" | "reflect" | "done";
  href: string;
  label: string;
  hasStarted: boolean;
} {
  const steps = new Set(progress?.stepsDone || []);
  const pos = progress?.watchPositionS || 0;
  const pct = progress?.watchPercent || 0;
  const hasStarted = steps.size > 0 || pos > 0 || pct > 0;

  if (!steps.has("watch")) {
    return {
      stepKey: "watch",
      href: `/dashboard/courses/lesson/${lessonId}/watch`,
      label: pos > 5 ? `Resume Watch (${pct}%)` : "Start Watch",
      hasStarted,
    };
  }
  if (!steps.has("play")) {
    return {
      stepKey: "play",
      href: `/dashboard/courses/lesson/${lessonId}/play`,
      label: "Resume Play",
      hasStarted: true,
    };
  }
  if (!steps.has("discover")) {
    return {
      stepKey: "discover",
      href: `/dashboard/courses/lesson/${lessonId}/discover`,
      label: "Resume Discover",
      hasStarted: true,
    };
  }
  if (!steps.has("reflect")) {
    return {
      stepKey: "reflect",
      href: `/dashboard/courses/lesson/${lessonId}/reflect`,
      label: "Resume Reflect",
      hasStarted: true,
    };
  }
  return {
    stepKey: "done",
    href: `/dashboard/courses/lesson/${lessonId}`,
    label: "Review lesson",
    hasStarted: true,
  };
}

