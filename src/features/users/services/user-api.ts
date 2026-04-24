import { useAuthStore } from "@/store/auth-store";

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

const API_BASE_URL = 'http://127.0.0.1:4005/api';

export const UserApiService = {
  async fetchUsers(page: number = 1, limit: number = 20): Promise<UserListResponse> {
    const token = useAuthStore.getState().token;
    
    const response = await fetch(`${API_BASE_URL}/admin/users?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch users');
    }
    
    return response.json();
  },

  async updateUserRole(userId: string, role: string) {
    // To be implemented in backend if needed
  }
};
