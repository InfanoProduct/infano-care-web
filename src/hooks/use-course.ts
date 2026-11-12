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
  return () => {
    queryClient.invalidateQueries({ queryKey: ["course-learner-state"] });
    queryClient.invalidateQueries({ queryKey: ["course-lesson"] });
    queryClient.invalidateQueries({ queryKey: ["course-checkin"] });
    queryClient.invalidateQueries({ queryKey: ["parent-course-overview"] });
  };
}

