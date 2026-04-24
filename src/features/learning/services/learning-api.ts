import { useAuthStore } from "@/store/auth-store";

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

const API_BASE_URL = 'http://127.0.0.1:4005/api';

export const LearningApiService = {
  async fetchJourneys(): Promise<LearningJourney[]> {
    const token = useAuthStore.getState().token;
    
    const response = await fetch(`${API_BASE_URL}/admin/learning/journeys`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch journeys');
    }
    
    return response.json();
  },

  async getJourney(id: string): Promise<LearningJourney> {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${API_BASE_URL}/admin/learning/journeys/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch journey');
    return response.json();
  },

  async createJourney(data: Partial<LearningJourney>) {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${API_BASE_URL}/admin/learning/journeys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create journey');
    return response.json();
  },

  async updateJourney(id: string, data: Partial<LearningJourney>) {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${API_BASE_URL}/admin/learning/journeys/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update journey');
    return response.json();
  },

  async deleteJourney(id: string) {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${API_BASE_URL}/admin/learning/journeys/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete journey');
  },

  async fetchEpisodes(journeyId: string) {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${API_BASE_URL}/admin/learning/journeys/${journeyId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch episodes');
    const data = await response.json();
    return data?.episodes || [];
  },

  async createEpisode(journeyId: string, data: any) {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${API_BASE_URL}/admin/learning/journeys/${journeyId}/episodes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create episode');
    return response.json();
  },

  async updateEpisode(id: string, data: any) {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${API_BASE_URL}/admin/learning/episodes/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update episode');
    return response.json();
  },

  async deleteEpisode(id: string) {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${API_BASE_URL}/admin/learning/episodes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete episode');
  }
};
