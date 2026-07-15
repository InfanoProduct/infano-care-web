import { apiClient } from "@/lib/api-client";

export interface User {
  id: string;
  phone: string;
  email?: string;
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
  counts?: {
    active: number;
    inactive: number;
    peer: number;
    pending: number;
  };
}

export const UserApiService = {
  async fetchUsers(
    page: number = 1, 
    limit: number = 15, 
    peerOnboarding?: boolean,
    role?: string,
    accountStatus?: string
  ): Promise<UserListResponse> {
    return apiClient.get<UserListResponse>('/admin/users', {
      params: { page, limit, peerOnboarding, role, accountStatus }
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
  },

  async fetchUserOverview(userId: string): Promise<any> {
    return apiClient.get<any>(`/admin/users/${userId}/overview`);
  },

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED') {
    return apiClient.patch(`/admin/users/${userId}/status`, { status });
  },

  async deleteUser(userId: string) {
    return apiClient.delete(`/admin/users/${userId}`);
  }
};
