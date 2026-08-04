import { apiClient } from "@/lib/api-client";

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
  role: string;
  requiresPasswordReset?: boolean;
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
  },

  async updateRole(role: string) {
    return apiClient.patch<any>('/user/role', { role });
  },

  async resetCoordinatorPassword(newPassword: string, token: string): Promise<any> {
    return apiClient.post('/auth/coordinator/reset-password', { newPassword }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  async resetAdminPassword(newPassword: string, token: string): Promise<any> {
    return apiClient.post('/auth/admin/reset-password', { newPassword }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  async requestNewCredentials(username: string, phone: string): Promise<any> {
    return apiClient.post('/auth/coordinator/request-credentials', { username, phone });
  },

  async getMe(): Promise<any> {
    return apiClient.get('/user/me');
  },

  async sendSettingsEmailOtp(): Promise<any> {
    return apiClient.post('/expert/settings/password-reset/send-otp');
  },

  async verifySettingsEmailOtpAndResetPassword(otp: string, newPassword: string): Promise<any> {
    return apiClient.post('/expert/settings/password-reset/verify-otp', { otp, newPassword });
  },

  async checkUser(phone: string): Promise<{ exists: boolean; role?: string }> {
    return apiClient.post('/auth/check-user', { phone });
  }
};
