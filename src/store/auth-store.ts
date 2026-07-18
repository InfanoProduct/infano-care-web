import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
    contentTier?: string;
    ageAtSignup?: number;
    onboardingStep?: number;
    onboardingCompletedAt?: string | null;
    isOnboardingCompleted?: boolean;
    profile?: {
      displayName?: string;
      [key: string]: any;
    };
  } | null;
  setAuth: (token: string, refreshToken: string, user: AuthState['user']) => void;
  clearAuth: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, refreshToken, user) => set({ token, accessToken: token, refreshToken, user, isAuthenticated: true }),
      clearAuth: () => set({ token: null, accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
