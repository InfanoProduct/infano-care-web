import { apiClient } from "@/lib/api-client";

export interface ParentOrdersSummaryResponse {
  orders: any[];
  courseEnrollments: any[];
  lmsEnrollments?: any[];
  programEnrollments: any[];
  refunds: any[];
  learners: Array<{ id: string; name: string; age: string }>;
}

export interface ParentSettingsResponse {
  id: string;
  phone?: string | null;
  email?: string | null;
  parentEmail?: string | null;
  parentConsent: boolean;
  coppaConsentAt?: string | null;
  createdAt: string;
  pinAskMode: "always" | "every_24h";
  whatsappWeeklySummary: boolean;
  whatsappLessonNudge: boolean;
  whatsappNudgeTime?: string | null;
  notifyOrderUpdates: boolean;
  marketingOptIn: boolean;
  improveCourseOptIn: boolean;
  communityWaitlist: boolean;
  profile?: { displayName?: string | null } | null;
  learners: Array<{
    id: string;
    name: string;
    age: string;
    periodStatus?: string | null;
    completedLessons: string[];
    createdAt: string;
  }>;
}

export const ParentSpaceService = {
  getOrdersSummary(): Promise<ParentOrdersSummaryResponse> {
    return apiClient.get("/parent/orders-summary");
  },

  requestRefund(
    orderId: string,
    payload: { reason: string; feedback?: string; dataOption: "keep" | "delete" }
  ) {
    return apiClient.post(`/parent/orders/${orderId}/refund`, payload);
  },

  reportOrderIssue(
    orderId: string,
    payload: { issueType: string; notes?: string }
  ) {
    return apiClient.post(`/parent/orders/${orderId}/report`, payload);
  },

  updateOrderAddress(
    orderId: string,
    payload: { shippingAddress: string; city: string; pincode: string; phone?: string }
  ) {
    return apiClient.patch(`/parent/orders/${orderId}/address`, payload);
  },

  getSettings(): Promise<ParentSettingsResponse> {
    return apiClient.get("/parent/settings");
  },

  updateSettings(payload: Partial<{
    displayName: string;
    email: string;
    whatsappWeeklySummary: boolean;
    whatsappLessonNudge: boolean;
    notifyOrderUpdates: boolean;
    marketingOptIn: boolean;
    improveCourseOptIn: boolean;
    pinAskMode: "always" | "every_24h";
    communityWaitlist: boolean;
  }>): Promise<ParentSettingsResponse> {
    return apiClient.patch("/parent/settings", payload);
  },

  changePin(currentPin: string, newPin: string) {
    return apiClient.post("/parent/settings/change-pin", { currentPin, newPin });
  },

  updateLearner(learnerId: string, payload: { name?: string; age?: string }) {
    return apiClient.patch(`/parent/learners/${learnerId}`, payload);
  },

  clearLearnerHealthAnswers(learnerId: string) {
    return apiClient.delete(`/parent/learners/${learnerId}/health-answers`);
  },

  deleteLearner(learnerId: string) {
    return apiClient.delete(`/parent/learners/${learnerId}`);
  },

  submitConcern(payload: { message: string; learnerId?: string }) {
    return apiClient.post("/parent/support/concern", payload);
  },
};

