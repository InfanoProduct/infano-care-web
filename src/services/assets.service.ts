import { apiClient } from "@/lib/api-client";

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
   * Uploads a single file to the uploads/assets folder
   */
  async uploadAsset(file: File): Promise<{ url: string; filename: string }> {
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
