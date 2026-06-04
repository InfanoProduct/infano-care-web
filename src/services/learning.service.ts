import { apiClient } from "@/lib/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Episode {
  id: string;
  journeyId: string;
  title: string;
  slug: string;
  description: string | null;
  order: number;
  content: any;
  points: number;
  isActive: boolean;
  createdAt?: string;
}

export interface LearningJourney {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  bannerImage: string | null;
  totalXP: number;
  category: string | null;
  isActive: boolean;
  ageBand: string | null;
  topics: string[];
  goals: string[];
  tags: string[];
  contentTone: string;
  minContentTier: string;
  episodes: Episode[];
  createdAt?: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  episodeId: string;
  completed: boolean;
  lastViewedItemId: string | null;
  completedItems: any;
  history: any;
  updatedAt: string;
  episode?: Episode;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const LearningService = {
  /**
   * List all active learning journeys (with their episodes).
   * Optionally filter by ageBand.
   */
  async getJourneys(ageBand?: string): Promise<LearningJourney[]> {
    const params = ageBand ? { ageBand } : undefined;
    return apiClient.get<LearningJourney[]>('/learning/journeys', { params });
  },

  /**
   * Get a single journey by ID or slug, including episodes in order.
   */
  async getJourney(id: string): Promise<LearningJourney> {
    return apiClient.get<LearningJourney>(`/learning/journeys/${id}`);
  },

  /**
   * Get the authenticated user's progress across all episodes.
   */
  async getMyProgress(): Promise<UserProgress[]> {
    return apiClient.get<UserProgress[]>('/learning/my-progress');
  },

  /**
   * Get a single episode's details (including JSON content).
   */
  async getEpisode(id: string): Promise<Episode> {
    return apiClient.get<Episode>(`/learning/episodes/${id}`);
  },

  /**
   * Update progress inside an episode (e.g. tracking slides completed).
   */
  async updateEpisodeProgress(
    episodeId: string,
    data: { completedItems?: string[]; lastViewedItemId?: string; history?: any }
  ): Promise<any> {
    return apiClient.post(`/learning/episodes/${episodeId}/progress`, data);
  },

  /**
   * Complete an episode and award points.
   */
  async completeEpisode(
    episodeId: string,
    data: {
      knowledgeCheckAccuracy?: number;
      reflectionMode?: 'private' | 'community';
      reflectionContent?: string;
      voiceUrl?: string;
      isBingeBonus?: boolean;
    } = {}
  ): Promise<{ progress: any; pointsEarned: number }> {
    return apiClient.post<{ progress: any; pointsEarned: number }>(
      `/learning/episodes/${episodeId}/complete`,
      data
    );
  },
};
