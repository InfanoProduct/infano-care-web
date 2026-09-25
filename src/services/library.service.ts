import { apiClient } from "@/lib/api-client";

export interface LibraryBookItem {
  entitlementId: string;
  bookId: string;
  slug: string;
  title: string;
  author: string;
  description: string;
  coverImageUrl?: string;
  totalPages: number;
  lastReadPage: number;
  progressPercent: number;
  bookmarksCount: number;
  source: string;
  unlockedAt: string;
  lastReadAt: string;
}

export interface ChapterManifest {
  index: number;
  id: string;
  title: string;
  pageStart: number;
  pageEnd: number;
  summary?: string;
}

export interface BookReaderData {
  book: {
    id: string;
    slug: string;
    title: string;
    author: string;
    description: string;
    coverImageUrl?: string;
    totalPages: number;
    tableOfContents: ChapterManifest[];
  };
  readingState: {
    lastReadPage: number;
    progressPercent: number;
    bookmarks: Array<{ page: number; note?: string; createdAt: string }>;
    lastAccessedAt: string;
  };
}

export interface ChapterContentResponse {
  chapterIndex: number;
  totalChapters: number;
  chapter: {
    id: string;
    title: string;
    pageStart: number;
    pageEnd: number;
    contentHtml: string;
  };
}

export const LibraryService = {
  /**
   * Fetch all unlocked books in user's library
   */
  async getMyBooks(): Promise<LibraryBookItem[]> {
    const res = await apiClient.get<any>("/library/my-books");
    return res.data || res || [];
  },

  /**
   * Claim an Etsy order receipt to unlock the book
   */
  async claimEtsyOrder(receiptId: string): Promise<any> {
    const res = await apiClient.post<any>("/library/claim-etsy", { receiptId });
    return res.data || res;
  },

  /**
   * Pre-verify an Etsy order receipt (public)
   */
  async verifyEtsyOrder(receiptId: string): Promise<any> {
    const res = await apiClient.get<any>(`/library/verify-order/${encodeURIComponent(receiptId)}`);
    return res.data || res;
  },

  /**
   * Get reader metadata and table of contents
   */
  async getBookDetails(bookIdOrSlug: string): Promise<BookReaderData> {
    const res = await apiClient.get<any>(`/library/books/${encodeURIComponent(bookIdOrSlug)}`);
    return res.data || res;
  },

  /**
   * Stream single chapter content (protected)
   */
  async getChapterContent(bookIdOrSlug: string, chapterIndex: number): Promise<ChapterContentResponse> {
    const res = await apiClient.get<any>(`/library/books/${encodeURIComponent(bookIdOrSlug)}/chapters/${chapterIndex}`);
    return res.data || res;
  },

  /**
   * Save reading progress & bookmarks
   */
  async updateProgress(
    bookIdOrSlug: string,
    data: { lastReadPage?: number; progressPercent?: number; bookmark?: { page: number; note?: string } }
  ): Promise<any> {
    const res = await apiClient.post<any>(`/library/books/${encodeURIComponent(bookIdOrSlug)}/progress`, data);
    return res.data || res;
  },
};
