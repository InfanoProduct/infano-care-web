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
  async fetchUsers(page: number = 1, limit: number = 20): Promise<UserListResponse> {
    return apiClient.get<UserListResponse>('/admin/users', {
      params: { page, limit }
    });
  },

  async updateUserRole(userId: string, role: string) {
    return apiClient.patch(`/admin/users/${userId}/role`, { role });
  }
};
