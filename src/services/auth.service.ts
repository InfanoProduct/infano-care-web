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
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  async sendOtp(phone: string) {
    return apiClient.post('/auth/otp/send', { phone });
  },

  async verifyOtp(phone: string, otp: string) {
    return apiClient.post<any>('/auth/otp/verify', { phone, otp });
  }
};
