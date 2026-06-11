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
  async sendMessage(
    content: string,
    sessionId?: string,
    moodCode?: string,
    history?: { sender: 'USER' | 'GIGI'; content: string }[]
  ): Promise<SendMessageResponse> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const res = await apiClient.post<ApiEnvelope<SendMessageResponse>>('/chat/send', {
          content,
          platform: 'web',
          ...(sessionId && { sessionId }),
          ...(moodCode && { moodCode }),
          ...(history && { history }),
        });
        // Unwrap the envelope
        return res.data;
      } catch (err: any) {
        const is429 = err.status === 429 || String(err.message).toLowerCase().includes('rate');

        if (is429 && attempt < maxRetries - 1) {
          // Extract retry-after info
          const details = err.details || {};
          const fromHeader = details.retryAfterHeader || details.retryAfter;
          const capped = details.cappedRetryAfterSec ?? (fromHeader ? parseInt(String(fromHeader), 10) : undefined);
          // Exponential backoff: 1s, 2s, 4s + jitter (±25%)
          const baseDelay = Math.pow(2, attempt) * 1000;
          const jitter = baseDelay * 0.25 * (Math.random() - 0.5);
          const delay = Math.max(100, (capped ? capped * 1000 : baseDelay) + jitter);

          console.warn(`[ChatService] 429 retry ${attempt + 1}/${maxRetries - 1}, waiting ${Math.round(delay)}ms`);
          await new Promise(r => setTimeout(r, delay));
          attempt++;
          continue;
        }

        // Either not a 429, or we've exhausted retries
        console.warn('[ChatService] sendMessage failed:', err.message || err);
        const details = err.details || {};
        const fromHeader = details.retryAfterHeader || details.retryAfter;
        const capped = details.cappedRetryAfterSec ?? (fromHeader ? parseInt(String(fromHeader), 10) : undefined);
        const parsed = capped ?? 10;

        const isNetworkError = String(err.message).toLowerCase().includes('network error');
        let errorContent = 'Something went wrong while contacting Gigi. Please try again.';
        if (is429) {
          errorContent = `Gigi is temporarily busy due to high load. Please try again in about ${parsed} seconds.`;
        } else if (isNetworkError) {
          errorContent = 'Network error. Please try again.';
        } else {
          errorContent = 'Server error. Please try again.';
        }

        const fallback: SendMessageResponse = {
          message: {
            id: `gigi-error-${Date.now()}`,
            sessionId: sessionId || 'guest',
            sender: 'GIGI',
            content: errorContent,
            createdAt: new Date().toISOString(),
          },
          sessionId: sessionId || 'guest'
        };
        return fallback;
      }
    }

    // Fallback (should not reach here)
    return {
      message: {
        id: `gigi-error-${Date.now()}`,
        sessionId: sessionId || 'guest',
        sender: 'GIGI',
        content: 'Something went wrong. Please try again.',
        createdAt: new Date().toISOString(),
      },
      sessionId: sessionId || 'guest'
    };
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

