import { apiClient } from "@/lib/api-client";

export interface ParentLink {
  id: string;
  parentId: string | null;
  teenId: string | null;
  senderId: string;
  receiverPhone: string;
  status: "PENDING" | "LINKED" | "CANCELLED";
  createdAt: string;
  parent?: {
    phone?: string;
    profile?: {
      displayName: string;
    };
  };
  teen?: {
    phone?: string;
    profile?: {
      displayName: string;
    };
  };
  sender?: {
    phone?: string;
    profile?: {
      displayName: string;
    };
  };
}

export const ParentService = {
  async invite(phone: string): Promise<ParentLink> {
    return apiClient.post<ParentLink>('/parent/invite', { phone });
  },

  async getLinks(): Promise<ParentLink[]> {
    return apiClient.get<ParentLink[]>('/parent');
  },

  async cancelInvite(id: string): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(`/parent/cancel/${id}`);
  },

  async acceptInvite(id: string): Promise<ParentLink> {
    return apiClient.post<ParentLink>(`/parent/accept/${id}`);
  },

  // --- Expert Session Methods ---

  async getExperts(specialisation?: string): Promise<any[]> {
    const params = specialisation ? { specialisation } : undefined;
    return apiClient.get<any[]>('/parent/experts', { params });
  },

  async bookExpertSession(expertId: string, scheduledAt: string): Promise<any> {
    return apiClient.post<any>('/parent/experts/book', { expertId, scheduledAt });
  },

  async verifyExpertSessionPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    expertId: string;
    scheduledAt: string;
  }): Promise<any> {
    return apiClient.post<any>('/parent/experts/verify-payment', data);
  },

  async getExpertSessions(): Promise<any[]> {
    return apiClient.get<any[]>('/parent/expert-sessions');
  },

  async getTeenExpertSessions(): Promise<any[]> {
    return apiClient.get<any[]>('/teen/expert-sessions');
  },

  async cancelExpertSession(sessionId: string): Promise<any> {
    return apiClient.patch<any>(`/parent/expert-sessions/${sessionId}/cancel`);
  },

  async rescheduleExpertSession(sessionId: string, newScheduledAt: string): Promise<any> {
    return apiClient.patch<any>(`/parent/expert-sessions/${sessionId}/reschedule`, { newScheduledAt });
  },

  // --- Resource Library & Bookmark Methods ---

  async getResources(categoryId?: string): Promise<any[]> {
    const params = categoryId ? { category: categoryId } : undefined;
    return apiClient.get<any[]>('/parent/resources', { params });
  },

  async bookmarkResource(postId: string): Promise<any> {
    return apiClient.post<any>(`/parent/resources/${postId}/bookmark`);
  },

  async unbookmarkResource(postId: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/parent/resources/${postId}/bookmark`);
  },

  async getBookmarks(): Promise<any[]> {
    return apiClient.get<any[]>('/parent/bookmarks');
  },

  async getTeenParentBookmarks(): Promise<any[]> {
    return apiClient.get<any[]>('/teen/parent-bookmarks');
  }
};
