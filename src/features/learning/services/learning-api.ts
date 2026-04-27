import { apiClient } from "@/lib/api-client";

export interface Episode {
  id: string;
  journeyId: string;
  order: number;
  title: string;
  description: string | null;
  content: any;
  points: number;
  isActive: boolean;
  createdAt: string;
}

export interface LearningJourney {
  id: string;
  title: string;
  description: string;
  category: string;
  ageBand: string | null;
  topics: string[];
  goals: string[];
  tags: string[];
  contentTone: string;
  minContentTier: 'TEEN_EARLY' | 'TEEN_LATE' | 'ADULT';
  bannerImage: string | null;
  thumbnailUrl: string | null;
  totalXP: number;
  isActive: boolean;
  createdAt: string;
  episodes?: Episode[];
  _count: {
    episodes: number;
  };
}

export const LearningApiService = {
  async fetchJourneys(): Promise<LearningJourney[]> {
    return apiClient.get<LearningJourney[]>('/admin/learning/journeys');
  },

  async getJourney(id: string): Promise<LearningJourney> {
    return apiClient.get<LearningJourney>(`/admin/learning/journeys/${id}`);
  },

  async createJourney(data: Partial<LearningJourney>) {
    return apiClient.post<LearningJourney>('/admin/learning/journeys', data);
  },

  async updateJourney(id: string, data: Partial<LearningJourney>) {
    return apiClient.patch<LearningJourney>(`/admin/learning/journeys/${id}`, data);
  },

  async deleteJourney(id: string) {
    return apiClient.delete(`/admin/learning/journeys/${id}`);
  },

  async fetchEpisodes(journeyId: string) {
    const data = await apiClient.get<LearningJourney>(`/admin/learning/journeys/${journeyId}`);
    return data?.episodes || [];
  },

  async createEpisode(journeyId: string, data: any) {
    return apiClient.post(`/admin/learning/journeys/${journeyId}/episodes`, data);
  },

  async updateEpisode(id: string, data: any) {
    return apiClient.patch(`/admin/learning/episodes/${id}`, data);
  },

  async deleteEpisode(id: string) {
    return apiClient.delete(`/admin/learning/episodes/${id}`);
  },

  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const uploadUrl = process.env.NEXT_PUBLIC_UPLOAD_API_URL 
      ? `${process.env.NEXT_PUBLIC_UPLOAD_API_URL}/admin/upload`
      : '/admin/upload';

    return apiClient.request<{ url: string; filename: string }>(uploadUrl, {
      method: 'POST',
      body: formData,
      // We don't set Content-Type header here because fetch will set it automatically with the boundary for FormData
      headers: {
        'Content-Type': 'skip' as any // Hack to tell our apiClient to not set application/json
      }
    });
  }
};
