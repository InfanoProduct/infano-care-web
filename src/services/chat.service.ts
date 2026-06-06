import { apiClient } from '@/lib/api-client';

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'USER' | 'GIGI';
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string | null;
  lastMsgAt: string;
  createdAt: string;
}

export interface SendMessageResponse {
  message: ChatMessage;
  sessionId: string;
  flagged?: boolean;
}

// API always returns { success: boolean, data: T }
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const ChatService = {
  async sendMessage(content: string, sessionId?: string, moodCode?: string): Promise<SendMessageResponse> {
    const res = await apiClient.post<ApiEnvelope<SendMessageResponse>>('/chat/send', {
      content,
      ...(sessionId && { sessionId }),
      ...(moodCode && { moodCode }),
    });
    // Unwrap the envelope
    return res.data;
  },

  async getSessions(): Promise<ChatSession[]> {
    const res = await apiClient.get<ApiEnvelope<ChatSession[]>>('/chat/sessions');
    return res.data;
  },

  async getHistory(sessionId: string, limit = 20): Promise<ChatMessage[]> {
    const res = await apiClient.get<ApiEnvelope<ChatMessage[]>>(`/chat/history/${sessionId}?limit=${limit}`);
    return res.data ?? [];
  },

  async deleteSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/chat/sessions/${sessionId}`);
  },

  async deleteAllSessions(): Promise<void> {
    await apiClient.delete('/chat/sessions');
  },
};

