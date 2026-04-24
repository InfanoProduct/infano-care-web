const API_BASE_URL = 'http://localhost:4005/api';

export const AuthService = {
  async adminLogin(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  },

  async logout() {
    // Optional: Call API logout if needed
    // const refreshToken = useAuthStore.getState().refreshToken;
    // await fetch(`${API_BASE_URL}/auth/logout`, { ... });
  }
};
