import { apiClient } from "@/lib/api-client";

export interface CommunityCircle {
  id: string;
  slug: string;
  name: string;
  description?: string;
  iconEmoji?: string;
  accentColor?: string;
  benefits: string[];
  minContentTier?: string;
  maxContentTier?: string;
  requiresPreReview: boolean;
  isAgeSpecific: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CommunityService = {
  // Public Methods
  async getCircles(): Promise<CommunityCircle[]> {
    return apiClient.get<CommunityCircle[]>('/community/circles');
  },

  // Admin Methods
  async adminGetCircles(): Promise<CommunityCircle[]> {
    return apiClient.get<CommunityCircle[]>('/admin/circles');
  },

  async adminCreateCircle(data: Partial<CommunityCircle>): Promise<CommunityCircle> {
    return apiClient.post<CommunityCircle>('/admin/circles', data);
  },

  async adminUpdateCircle(id: string, data: Partial<CommunityCircle>): Promise<CommunityCircle> {
    return apiClient.patch<CommunityCircle>(`/admin/circles/${id}`, data);
  },

  async adminDeleteCircle(id: string): Promise<void> {
    return apiClient.delete(`/admin/circles/${id}`);
  }
};
