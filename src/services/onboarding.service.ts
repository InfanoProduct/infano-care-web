import { apiClient } from '@/lib/api-client';
import { LearnerProfile } from '@/store/auth-store';

export interface ParentConsentPayload {
  consentGuardian: boolean;
  consentChildData: boolean;
  consentAnalytics?: boolean;
  parentName?: string;
}

export interface DaughterProfilePayload {
  name: string;
  age: string;
  periodStatus?: string | null;
  worries?: string[];
}

export interface ParentSpacePayload {
  parentPin: string;
  learningStyle?: string;
  whatsappWeeklySummary?: boolean;
  whatsappLessonNudge?: boolean;
  whatsappNudgeTime?: string;
}

export interface OnboardingStatusResponse {
  success: boolean;
  onboardingStep: number;
  isOnboardingCompleted: boolean;
  parentConsent: boolean;
  hasParentPin: boolean;
  learningStyle: string;
  whatsappWeeklySummary: boolean;
  whatsappLessonNudge: boolean;
  whatsappNudgeTime: string;
  learners: LearnerProfile[];
  parentName: string;
}

export const OnboardingService = {
  async getStatus(): Promise<OnboardingStatusResponse> {
    return apiClient.get('/onboarding/status');
  },

  async saveParentConsent(data: ParentConsentPayload): Promise<{ success: boolean; onboardingStep: number }> {
    return apiClient.post('/onboarding/parent-consent', data);
  },

  async saveDaughterProfile(data: DaughterProfilePayload): Promise<{ success: boolean; learner: LearnerProfile; onboardingStep: number }> {
    return apiClient.post('/onboarding/daughter-profile', data);
  },

  async saveParentSpace(data: ParentSpacePayload): Promise<{ success: boolean; user: any }> {
    return apiClient.post('/onboarding/parent-space', data);
  },

  async verifyParentPin(pin: string): Promise<{ success: boolean; verified: boolean }> {
    return apiClient.post('/onboarding/verify-pin', { pin });
  },

  async requestPinReset(): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/onboarding/reset-pin/request', {});
  },

  async confirmPinReset(data: { otp: string; newPin: string }): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/onboarding/reset-pin/confirm', data);
  },

  async getLearners(): Promise<{ learners: LearnerProfile[] }> {
    return apiClient.get('/onboarding/learners');
  },

  async addLearner(data: DaughterProfilePayload): Promise<{ success: boolean; learner: LearnerProfile }> {
    return apiClient.post('/onboarding/learners', data);
  },

  async completeOnboarding(): Promise<{ accountStatus: string; onboardingStep: number }> {
    return apiClient.post('/onboarding/complete', {});
  }
};

