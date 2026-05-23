import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

export interface Asset {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
}

export const AssetsService = {
  /**
   * Fetches all universal assets from the server uploads/assets folder
   */
  async getAssets(): Promise<Asset[]> {
    return apiClient.get<Asset[]>('/admin/assets');
  },

  /**
   * Uploads a single file to the uploads/assets folder with optional progress callback
   */
  async uploadAsset(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ url: string; filename: string }> {
    // If progress tracking is requested, perform the upload using XMLHttpRequest
    if (onProgress) {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);

        const uploadUrl = process.env.NEXT_PUBLIC_UPLOAD_API_URL 
          ? `${process.env.NEXT_PUBLIC_UPLOAD_API_URL}/admin/upload?folder=assets`
          : '/admin/upload?folder=assets';

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005/api';
        const url = uploadUrl.startsWith('http')
          ? uploadUrl
          : `${API_BASE_URL}${uploadUrl.startsWith('/') ? uploadUrl : `/${uploadUrl}`}`;

        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);

        // Fetch auth token from our auth store
        const token = useAuthStore.getState().token;
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        // Add upload progress listener
        if (xhr.upload) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(percent);
            }
          });
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error('Failed to parse upload response'));
            }
          } else {
            let errMsg = `Upload failed with status ${xhr.status}`;
            try {
              const errorData = JSON.parse(xhr.responseText);
              errMsg = errorData.message || errorData.error || errMsg;
            } catch (_) {}
            reject(new Error(errMsg));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error during upload'));
        };

        xhr.send(formData);
      });
    }

    // Default implementation using fetch if no progress callback is needed
    const formData = new FormData();
    formData.append('file', file);

    const uploadUrl = process.env.NEXT_PUBLIC_UPLOAD_API_URL 
      ? `${process.env.NEXT_PUBLIC_UPLOAD_API_URL}/admin/upload?folder=assets`
      : '/admin/upload?folder=assets';

    return apiClient.request<{ url: string; filename: string }>(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'skip' as any // Tell apiClient to skip setting application/json Content-Type
      }
    });
  },

  /**
   * Deletes an asset by filename
   */
  async deleteAsset(filename: string): Promise<void> {
    return apiClient.delete(`/admin/assets/${encodeURIComponent(filename)}`);
  }
};
