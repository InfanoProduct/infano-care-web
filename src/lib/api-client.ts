import { useAuthStore } from "@/store/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private refreshPromise: Promise<string | null> | null = null;

  private async getAuthToken(): Promise<string | null> {
    return useAuthStore.getState().token;
  }

  private async getRefreshToken(): Promise<string | null> {
    return useAuthStore.getState().refreshToken;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        this.refreshPromise = null;
        return null;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          // If the server explicitly says no (401), it's a known expiry, not a crash
          if (response.status === 401) {
            useAuthStore.getState().clearAuth();
            if (typeof window !== 'undefined') {
              document.cookie = 'customer-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
              document.cookie = 'peer-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
              document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            }
            return null;
          }
          throw new Error(`Refresh failed with status ${response.status}`);
        }

        const data = await response.json();
        const { accessToken, refreshToken: newRefreshToken } = data;

        const user = useAuthStore.getState().user;
        if (user) {
          useAuthStore.getState().setAuth(accessToken, newRefreshToken || refreshToken, user);
        }

        return accessToken;
      } catch (error: any) {
        // Only log serious errors, not routine auth failures
        if (error.message !== 'Unauthorized' && !error.message?.includes('401')) {
          console.warn('Token refresh system notice:', error.message || error);
        }

        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          document.cookie = 'customer-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'peer-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...init } = options;

    // Construct URL with query params
    let url = endpoint.startsWith('http')
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
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
      if (!requestHeaders.has('Content-Type') && !(init.body instanceof FormData)) {
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

    let response: Response;
    try {
      response = await fetchWithToken(token);
    } catch (err: any) {
      // Catch network errors (like CORS, DNS, or server down) and throw a clearer error
      console.error(`[ApiClient] Network Error when fetching ${url}:`, err);
      throw new Error(`Network Error: Unable to reach the server at ${url}. Please check if the backend is running.`);
    }

    // Handle 401 Unauthorized - Attempt refresh (skip for auth endpoints)
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/admin/login') || url.includes('/auth/refresh');

    if (response.status === 401 && !isAuthEndpoint) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        response = await fetchWithToken(newToken);
      } else {
        // Refresh failed, redirect to login if we are in admin or peerline area
        if (typeof window !== 'undefined') {
          useAuthStore.getState().clearAuth();
          document.cookie = 'customer-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'peer-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

          const path = window.location.pathname;
          if (path.startsWith('/admin') && path !== '/admin/login') {
            window.location.href = '/admin/login';
          } else if (path.startsWith('/peerline') && !path.includes('/login') && !path.includes('onboarding')) {
            window.location.href = '/peerline/login';
          } else if (path.startsWith('/schools') && !path.includes('/login')) {
            window.location.href = '/schools/login';
          } else if (path.startsWith('/dashboard')) {
            window.location.href = '/login';
          }
        }
        throw new Error('Unauthorized');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Surface Retry-After information for 429s
      if (response.status === 429) {
        const retryHeader = response.headers.get('retry-after');
        const err = new Error(errorData.error || errorData.message || `Rate limited by server (429)`);
        (err as any).status = 429;
        (err as any).details = errorData.details || {};
        (err as any).details.retryAfterHeader = retryHeader;
        throw err;
      }

      const error = new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
      (error as any).details = errorData.details;
      throw error;
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
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined)
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
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined)
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
