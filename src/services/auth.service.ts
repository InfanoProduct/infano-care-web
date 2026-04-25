import { apiClient } from "@/lib/api-client";

export const AuthService = {
  async adminLogin(username: string, password: string) {
    return apiClient.post('/auth/admin/login', { username, password });
  },

  async logout() {
    // Optional: Call API logout if needed
    // const refreshToken = useAuthStore.getState().refreshToken;
    // await apiClient.post('/auth/logout', { refreshToken });
  }
};
