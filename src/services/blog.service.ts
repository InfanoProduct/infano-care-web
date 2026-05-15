import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005/api';

class BlogService {
  private async fetchWithAuth<T>(endpoint: string, options: any = {}): Promise<T> {
    const { body, ...rest } = options;
    return apiClient.request<T>(endpoint, {
      ...rest,
      body: body,
    });
  }

  // --- Posts ---
  async getAllPosts(page = 1, limit = 10, search = '') {
    return this.fetchWithAuth(`/blog/posts?page=${page}&limit=${limit}&search=${search}`);
  }

  async getPostById(id: string) {
    return this.fetchWithAuth(`/blog/posts/${id}`);
  }

  async getPostBySlug(slug: string) {
    return this.fetchWithAuth(`/blog/posts/slug/${slug}`);
  }

  async createPost(data: any) {
    return this.fetchWithAuth('/blog/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePost(id: string, data: any) {
    return this.fetchWithAuth(`/blog/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePost(id: string) {
    return this.fetchWithAuth(`/blog/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async incrementViews(id: string) {
    return this.fetchWithAuth(`/blog/posts/${id}/view`, {
      method: 'PATCH',
    });
  }

  // --- Authors ---
  async getAuthors() {
    return this.fetchWithAuth('/blog/authors');
  }

  async createAuthor(data: any) {
    return this.fetchWithAuth('/blog/authors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAuthor(id: string, data: any) {
    return this.fetchWithAuth(`/blog/authors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAuthor(id: string) {
    return this.fetchWithAuth(`/blog/authors/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Categories ---
  async getCategories() {
    return this.fetchWithAuth('/blog/categories');
  }

  async createCategory(data: any) {
    return this.fetchWithAuth('/blog/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: any) {
    return this.fetchWithAuth(`/blog/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.fetchWithAuth(`/blog/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // --- CTAs ---
  async getCTAs() {
    return this.fetchWithAuth('/blog/ctas');
  }

  async createCTA(data: any) {
    return this.fetchWithAuth('/blog/ctas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCTA(id: string, data: any) {
    return this.fetchWithAuth(`/blog/ctas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCTA(id: string) {
    return this.fetchWithAuth(`/blog/ctas/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Stats ---
  async getStats() {
    return this.fetchWithAuth('/blog/stats');
  }

  async getGlobalStats() {
    return this.fetchWithAuth('/blog/stats/global');
  }

  async updateGlobalStats(data: any) {
    return this.fetchWithAuth('/blog/stats/global', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // --- Image Upload ---
  async uploadImage(file: File, folder: string = 'blog') {
    const formData = new FormData();
    formData.append('file', file);

    let uploadUrl = process.env.NEXT_PUBLIC_UPLOAD_API_URL 
      ? `${process.env.NEXT_PUBLIC_UPLOAD_API_URL}/admin/upload`
      : '/admin/upload';

    uploadUrl += `?folder=${folder}`;

    return apiClient.request<any>(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'skip' as any,
      }
    });
  }

  // --- Comments ---
  async getPostComments(postId: string) {
    return this.fetchWithAuth<any[]>(`/blog/posts/${postId}/comments`);
  }

  async createComment(postId: string, data: { name: string; email: string; content: string }) {
    return this.fetchWithAuth(`/blog/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const blogService = new BlogService();
