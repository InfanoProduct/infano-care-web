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
  moderators?: any[];
  moderatorIds?: string[];
  _count?: {
    members: number;
  };
}

export interface SanctuaryRoom {
  id: string;
  communityId: string;
  name: string;
  topic?: string;
  type: 'TOPIC_ROOM' | 'VOICE_LOUNGE' | 'WHISPER_ROOM' | 'STORY_THREAD' | 'GREENHOUSE_STAGE' | 'ANNOUNCEMENT';
  isPrivate: boolean;
  allowAnonymous: boolean;
  hasScreenshotDRM: boolean;
  sortOrder: number;
}

export interface SanctuaryCommunity {
  id: string;
  slug: string;
  name: string;
  description?: string;
  iconEmoji: string;
  bannerUrl?: string;
  accentColor: string;
  audience: 'TEEN' | 'PARENT';
  minAge?: number;
  maxAge?: number;
  isSystemDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  rooms: SanctuaryRoom[];
  _count?: {
    memberships: number;
    rooms: number;
  };
}

export const CommunityService = {
  // Public Methods
  async getCircles(): Promise<CommunityCircle[]> {
    return apiClient.get<CommunityCircle[]>('/community/circles');
  },

  // Admin Methods
  async adminGetMentors(): Promise<any[]> {
    return apiClient.get<any[]>('/admin/mentors');
  },

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
  },

  // Sanctuary Admin Methods
  async adminGetSanctuaryCommunities(): Promise<SanctuaryCommunity[]> {
    return apiClient.get<SanctuaryCommunity[]>('/admin/sanctuary/communities');
  },

  async adminCreateSanctuaryCommunity(data: Partial<SanctuaryCommunity>): Promise<SanctuaryCommunity> {
    return apiClient.post<SanctuaryCommunity>('/admin/sanctuary/communities', data);
  },

  async adminUpdateSanctuaryCommunity(id: string, data: Partial<SanctuaryCommunity>): Promise<SanctuaryCommunity> {
    return apiClient.patch<SanctuaryCommunity>(`/admin/sanctuary/communities/${id}`, data);
  },

  async adminDeleteSanctuaryCommunity(id: string): Promise<void> {
    return apiClient.delete(`/admin/sanctuary/communities/${id}`);
  },

  async adminCreateSanctuaryRoom(communityId: string, data: Partial<SanctuaryRoom>): Promise<SanctuaryRoom> {
    return apiClient.post<SanctuaryRoom>(`/admin/sanctuary/communities/${communityId}/rooms`, data);
  },

  async adminUpdateSanctuaryRoom(roomId: string, data: Partial<SanctuaryRoom>): Promise<SanctuaryRoom> {
    return apiClient.patch<SanctuaryRoom>(`/admin/sanctuary/rooms/${roomId}`, data);
  },

  async adminDeleteSanctuaryRoom(roomId: string): Promise<void> {
    return apiClient.delete(`/admin/sanctuary/rooms/${roomId}`);
  }
};

