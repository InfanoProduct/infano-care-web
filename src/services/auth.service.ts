import { apiClient } from "@/lib/api-client";

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
  role: string;
}

export const AuthService = {
  async adminLogin(username: string, password: string): Promise<AdminLoginResponse> {
    return apiClient.post<AdminLoginResponse>('/auth/admin/login', { username, password });
  },

  async logout() {
    // Optional: Call API logout if needed
    // const refreshToken = useAuthStore.getState().refreshToken;
    // await apiClient.post('/auth/logout', { refreshToken });
  }
};
