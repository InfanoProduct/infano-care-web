import { useAuthStore } from "@/store/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
}

class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    return useAuthStore.getState().token;
  }

  private async getRefreshToken(): Promise<string | null> {
    return useAuthStore.getState().refreshToken;
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const data = await response.json();
      const { accessToken, refreshToken: newRefreshToken } = data;
      
      const user = useAuthStore.getState().user;
      if (user) {
        useAuthStore.getState().setAuth(accessToken, newRefreshToken || refreshToken, user);
      }
      
      return accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      useAuthStore.getState().clearAuth();
      return null;
    }
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...init } = options;
    
    // Construct URL with query params
    let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    // Get current token
    let token = await this.getAuthToken();
    
    const fetchWithToken = async (authToken: string | null) => {
      const requestHeaders = new Headers(headers);
      if (authToken) {
        requestHeaders.set('Authorization', `Bearer ${authToken}`);
      }
      if (!requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
      }
      if (requestHeaders.get('Content-Type') === 'skip') {
        requestHeaders.delete('Content-Type');
      }

      return fetch(url, {
        ...init,
        headers: requestHeaders,
      });
    };

    let response = await fetchWithToken(token);

    // Handle 401 Unauthorized - Attempt refresh
    if (response.status === 401) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        response = await fetchWithToken(newToken);
      } else {
        // Refresh failed, redirect to login if we are in admin area
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
        throw new Error('Unauthorized');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined 
    });
  }

  put<T>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: body ? JSON.stringify(body) : undefined 
    });
  }

  patch<T>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: body ? JSON.stringify(body) : undefined 
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
