import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface LearnerProfile {
  id: string;
  parentId?: string;
  name: string;
  age: string;
  periodStatus?: string | null;
  worries?: string[];
  avatar?: string | null;
  flowersCount?: number;
  petalsCount?: number;
  streakDays?: number;
  completedLessons?: string[];
  lastActiveAt?: string | null;
}

export type ActiveProfileMode =
  | { type: 'PARENT' }
  | { type: 'DAUGHTER'; learner: LearnerProfile };

interface AuthState {
  token: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: string;
    username?: string;
    phone?: string;
    email?: string;
    role: string;
    schoolId?: string;
    peerApplicationStatus?: string;
    peerApplication?: any;
    contentTier?: string;
    ageAtSignup?: number;
    birthYear?: number;
    birthMonth?: number;
    onboardingStep?: number;
    onboardingCompletedAt?: string | null;
    isOnboardingCompleted?: boolean;
    requiresPasswordReset?: boolean;
    hasParentPin?: boolean;
    parentConsent?: boolean;
    learningStyle?: string;
    learners?: LearnerProfile[];
    profile?: {
      displayName?: string;
      [key: string]: any;
    };
  } | null;
  activeProfile: ActiveProfileMode | null;
  learners: LearnerProfile[];
  isParentPinUnlocked: boolean;
  setAuth: (token: string, refreshToken: string, user: AuthState['user']) => void;
  clearAuth: () => void;
  setActiveProfile: (profile: ActiveProfileMode) => void;
  setLearners: (learners: LearnerProfile[]) => void;
  setParentPinUnlocked: (unlocked: boolean) => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      accessToken: null,
      refreshToken: null,
      user: null,
      activeProfile: null,
      learners: [],
      isParentPinUnlocked: false,
      isAuthenticated: false,
      setAuth: (token, refreshToken, user) => set({
        token,
        accessToken: token,
        refreshToken,
        user,
        learners: user?.learners || [],
        activeProfile: (user?.learners && user.learners.length > 0)
          ? { type: 'DAUGHTER', learner: user.learners[0] }
          : { type: 'PARENT' },
        isAuthenticated: true
      }),
      clearAuth: () => set({
        token: null,
        accessToken: null,
        refreshToken: null,
        user: null,
        activeProfile: null,
        learners: [],
        isParentPinUnlocked: false,
        isAuthenticated: false
      }),
      setActiveProfile: (profile) => set({ activeProfile: profile }),
      setLearners: (learners) => set((state) => ({
        learners,
        user: state.user ? { ...state.user, learners } : state.user
      })),
      setParentPinUnlocked: (isParentPinUnlocked) => set({ isParentPinUnlocked }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
