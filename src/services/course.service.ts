import { apiClient } from "@/lib/api-client";

export interface ChapterColors {
  background: string;
  ink: string;
  accent: string;
  accent_light: string;
  soft: string;
}

export interface CourseTopic {
  id: string;
  start_seconds: number;
  start_label: string;
  title: string;
  caption?: string;
}

export interface PauseAndThinkQuestion {
  id: string;
  type: "single_choice" | "true_false";
  prompt: string;
  options: Array<{ id: string; text: string }>;
  correct_option_id: string;
  explanation: string;
  at_seconds: number;
  at_label?: string;
  skippable?: boolean;
  reward?: string;
}

export interface DiscoverCard {
  id: string;
  kind: "fact" | "myth" | "gigi_wonders" | string;
  label: string;
  front: string;
  verdict?: string | null;
  back: string;
  icon?: string;
  tap_to_reveal?: boolean;
  counts_as_myth_busted?: boolean;
}

export interface QuickCheckQuestion {
  id: string;
  type: "single_choice" | "true_false";
  prompt: string;
  options: Array<{ id: string; text: string }>;
  correct_option_id: string;
  explanation: string;
}

export interface CourseActivity {
  id: string;
  lessonId: string;
  name: string;
  estMinutes: number;
  petalsOnComplete: number;
  engine:
    | "cycle_moon"
    | "flip_collect"
    | "scenario"
    | "sort"
    | "sequence"
    | "branching_story"
    | "body_hotspot"
    | "mood_garden"
    | string;
  instructions: string;
  config: any;
}

export interface CourseLesson {
  id: string;
  code: string;
  chapterId: string;
  sortOrder: number;
  orderInChapter: number;
  title: string;
  tagline: string;
  contentStatus: string;
  calmMode: boolean;
  unlockRequires: string | null;
  freePreview: boolean;
  video: {
    provider?: string;
    video_id?: string | null;
    url?: string | null;
    duration_seconds: number;
    duration_label: string;
    language?: string;
    expert?: { name: string; role: string };
    poster_image?: string;
  };
  topics: CourseTopic[];
  pauseAndThink: PauseAndThinkQuestion[];
  discoverCards: DiscoverCard[];
  reflect: {
    journal_prompt: string;
    sentence_starters: string[];
    saves_to?: string;
    saves_to_safe_circle?: boolean;
    quick_check: QuickCheckQuestion[];
    summary_line?: string;
  };
  completion: {
    flower_colors?: string[];
    badge_id?: string | null;
    next?: { type: string; id: string };
  };
  imageIds?: Record<string, string>;
  activity?: CourseActivity | null;
  chapter?: CourseChapter;
}

export interface CourseChapter {
  id: string;
  courseId: string;
  number: number;
  worldName: string;
  theme: string;
  sortOrder: number;
  colors: ChapterColors;
  iconSvgPath: string;
  expert: { name: string; role: string; photo_url?: string | null };
  unlockRequires: string | null;
  calmMode: boolean;
  contentStatus: string;
  images?: Record<string, string>;
  checkinId: string | null;
  badgeId: string | null;
  lessons: CourseLesson[];
  checkin?: CourseCheckin | null;
}

export interface CourseCheckin {
  id: string;
  courseId: string;
  chapterId: string | null;
  title: string;
  questionCount: number;
  passMark: number;
  timer: boolean;
  lives: boolean;
  hintsReducePetals: boolean;
  badgeOnPass: string | null;
  perfectScoreBadge: string | null;
  failTitle: string;
  reviewLinks: Array<{ label: string; target_screen: string }>;
  questions: Array<{
    id: string;
    type: string;
    prompt: string;
    options: Array<{ id: string; text: string }>;
    correct_option_id: string;
    explanation: string;
    hint?: string;
    skill_tag?: string;
  }>;
  chapter?: CourseChapter | null;
}

export interface CourseBadge {
  id: string;
  name: string;
  type: string;
  hiddenUntilEarned: boolean;
  description: string;
  rule: any;
  sortOrder: number;
  petalsOnAward: number;
  imageId?: string | null;
  shownToParent: boolean;
  unlocksShopItem?: string | null;
}

export interface CourseCurriculum {
  course: {
    id: string;
    title: string;
    audience: string;
    chapterCount: number;
    lessonCount: number;
    chapters: CourseChapter[];
    checkins: CourseCheckin[];
  };
  badges: CourseBadge[];
  pools: {
    petal_rules?: any[];
    app_copy?: {
      gigi_notes?: string[];
      myth_of_the_day?: Array<{
        id?: string;
        statement: string;
        is_myth?: boolean;
        verdict: string;
        explanation: string;
      }>;
      [key: string]: any;
    };
    support_config?: any[];
  };
}

export interface LearnerLessonProgress {
  id: string;
  learnerId: string;
  lessonId: string;
  watchPositionS: number;
  watchPercent: number;
  stepsDone: string[];
  pauseThinkAnswers: Record<string, any>;
  reflectAnswers: Record<string, any>;
  bustedMyths: string[];
  completedAt: string | null;
}

export interface LearnerCourseState {
  isEnrolled?: boolean;
  learner: {
    id: string;
    name: string;
    age: string;
    avatar?: string | null;
    flowersCount: number;
    petalsCount: number;
    streakDays: number;
    lastActiveAt?: string | null;
  };
  completedLessons: string[];
  lessonProgress: Record<string, LearnerLessonProgress>;
  activityResults: Array<{
    id: string;
    activityId: string;
    score: number;
    flags: string[];
    completedAt: string;
  }>;
  passedCheckins: string[];
  bestCheckinScores: Record<string, number>;
  earnedBadges: Array<{
    id: string;
    badgeId: string;
    sharedWithParent: boolean;
    awardedAt: string;
    badge: CourseBadge;
  }>;
  unlockedChapters: string[];
  unlockedLessons: string[];
  readyCheckins?: string[];
  pendingCheckinId?: string | null;
  pendingCheckinChapterId?: string | null;
  nextLessonId: string;
  bloomChallengeUnlocked: boolean;
  certificateUnlocked: boolean;
}

export const CourseService = {
  getCurriculum(): Promise<CourseCurriculum> {
    return apiClient.get<CourseCurriculum>("/course/curriculum");
  },

  getLearnerState(learnerId: string): Promise<LearnerCourseState> {
    return apiClient.get<LearnerCourseState>(`/course/learner/${learnerId}/state`);
  },

  getLessonDetail(lessonId: string, learnerId?: string): Promise<{
    lesson: CourseLesson;
    progress: LearnerLessonProgress | null;
    activityResult: any;
    journalEntry?: { id: string; text: string; updatedAt: string } | null;
    prevLesson: { id: string; code: string; title: string; chapterId: string } | null;
    nextLesson: { id: string; code: string; title: string; chapterId: string } | null;
  }> {
    return apiClient.get(`/course/lessons/${lessonId}`, {
      params: learnerId ? { learnerId } : undefined,
    });
  },

  saveWatchProgress(
    learnerId: string,
    lessonId: string,
    data: {
      watchPositionS: number;
      watchPercent: number;
      pauseThinkAnswers?: Record<string, any>;
    }
  ) {
    return apiClient.post(`/course/learner/${learnerId}/lessons/${lessonId}/watch`, data);
  },

  saveActivityResult(
    learnerId: string,
    lessonId: string,
    data: { score: number; flags?: string[] }
  ) {
    return apiClient.post(`/course/learner/${learnerId}/lessons/${lessonId}/activity`, data);
  },

  completeDiscover(
    learnerId: string,
    lessonId: string,
    data: { bustedMythIds?: string[] } = {}
  ) {
    return apiClient.post(`/course/learner/${learnerId}/lessons/${lessonId}/discover`, data);
  },

  completeReflect(
    learnerId: string,
    lessonId: string,
    data: { journalText?: string; quickCheckAnswers?: Record<string, any> }
  ) {
    return apiClient.post<{
      progress: LearnerLessonProgress;
      petalsAwarded: number;
      badgesEarned: Array<{ badgeId: string; name: string; petals: number }>;
      wasAlreadyCompleted: boolean;
      completedCount: number;
    }>(`/course/learner/${learnerId}/lessons/${lessonId}/reflect`, data);
  },

  getCheckin(checkinId: string, learnerId?: string): Promise<{
    checkin: CourseCheckin;
    lastAttempt: any;
  }> {
    return apiClient.get(`/course/checkins/${checkinId}`, {
      params: learnerId ? { learnerId } : undefined,
    });
  },

  submitCheckin(
    learnerId: string,
    checkinId: string,
    answers: Record<string, string>
  ): Promise<{
    score: number;
    total: number;
    passMark: number;
    passed: boolean;
    knows: string[];
    petalsAwarded: number;
    badgesEarned: Array<{ badgeId: string; name: string; petals: number }>;
  }> {
    return apiClient.post(`/course/learner/${learnerId}/checkins/${checkinId}/submit`, {
      answers,
    });
  },

  shareBadge(learnerId: string, badgeId: string) {
    return apiClient.post(`/course/learner/${learnerId}/badges/${badgeId}/share`, {});
  },

  recordMythAnswered(learnerId: string) {
    return apiClient.post<{ petalsAwarded: number }>(`/course/learner/${learnerId}/myth-answered`, {});
  },

  getParentOverview(learnerId: string) {
    return apiClient.get<any>(`/course/parent/overview/${learnerId}`);
  },
};

