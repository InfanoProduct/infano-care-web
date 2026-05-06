import { apiClient } from "@/lib/api-client";

export interface User {
  id: string;
  phone: string;
  role: string;
  accountStatus: string;
  createdAt: string;
  profile?: {
    displayName: string;
  };
  peerOnboarding: boolean;
  peerApplication?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    personalStatement: string;
    scenarioResponses: string[];
    eligibility: any;
    status: string;
    certificationStatus: string;
    trainingScore: number | null;
  };
}

export interface UserListResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const UserApiService = {
  async fetchUsers(page: number = 1, limit: number = 20, peerOnboarding?: boolean): Promise<UserListResponse> {
    return apiClient.get<UserListResponse>('/admin/users', {
      params: { page, limit, peerOnboarding }
    });
  },

  async approvePeer(userId: string) {
    return apiClient.patch(`/admin/users/${userId}/approve-peer`);
  },

  async updateUserRole(userId: string, role: string) {
    return apiClient.patch(`/admin/users/${userId}/role`, { role });
  },

  async revokePeer(userId: string) {
    return apiClient.patch(`/admin/users/${userId}/revoke-peer`);
  },

  async unapproveAssessment(userId: string) {
    return apiClient.patch(`/admin/users/${userId}/unapprove-assessment`);
  }
};
