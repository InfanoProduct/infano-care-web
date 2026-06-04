import { apiClient } from "@/lib/api-client";

export interface ProgramSession {
  title: string;
  description: string;
}

export interface Program {
  id: string;
  title: string;
  tagline: string;
  description?: string;
  classRange: string;
  minClass: number;
  maxClass: number;
  sessions: number;
  duration: string;
  topics: string[];
  pricePrivate: number;
  priceGroup: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sessionsList?: ProgramSession[];
  curriculum?: ProgramSession[];
}

export interface ProgramEnrollment {
  id: string;
  userId: string;
  programId: string;
  type: string;
  status: string;
  pricePaid: number;
  createdAt: string;
  updatedAt: string;
  program: Program;
  user: {
    id?: string;
    role?: string;
    username: string;
    phone: string;
    parentEmail: string | null;
    profile?: {
      displayName: string;
    };
    scheduledSessions?: any[];
  };
}

export interface DemoSession {
  id: string;
  parentName: string;
  phone: string;
  email: string | null;
  classRange: string;
  confidence: string;
  interests: string[];
  hasMentor: string;
  challenges: string[];
  learningPref: string;
  parentInvolvement: string;
  suggestedPrograms: string[];
  slotDate: string | null;
  slotTime: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const ProgramsService = {
  /**
   * Fetches all active programs for public marketing page / user dashboard
   */
  async getPrograms(): Promise<Program[]> {
    const res = await apiClient.get<{ success: boolean; data: Program[] }>('/programs');
    return res.data;
  },

  /**
   * Fetches a single program details (by UUID or slug title)
   */
  async getProgram(idOrSlug: string): Promise<Program> {
    const res = await apiClient.get<{ success: boolean; data: Program }>(`/programs/${idOrSlug}`);
    return res.data;
  },

  /**
   * Fetches all programs for admin panel (active & inactive)
   */
  async getAdminPrograms(): Promise<Program[]> {
    return apiClient.get<Program[]>('/admin/programs');
  },

  /**
   * Creates a new program
   */
  async createProgram(data: Partial<Program>): Promise<Program> {
    return apiClient.post<Program>('/admin/programs', data);
  },

  /**
   * Updates an existing program
   */
  async updateProgram(id: string, data: Partial<Program>): Promise<Program> {
    return apiClient.patch<Program>(`/admin/programs/${id}`, data);
  },

  /**
   * Deletes a program
   */
  async deleteProgram(id: string): Promise<void> {
    return apiClient.delete(`/admin/programs/${id}`);
  },

  /**
   * Fetches all user program enrollments for the admin panel
   */
  async getAdminEnrollments(): Promise<ProgramEnrollment[]> {
    return apiClient.get<ProgramEnrollment[]>('/admin/programs/enrollments');
  },

  /**
   * Updates the status of an enrollment (e.g. ACTIVE, COMPLETED, CANCELLED)
   */
  async updateEnrollmentStatus(id: string, status: string): Promise<ProgramEnrollment> {
    return apiClient.patch<ProgramEnrollment>(`/admin/programs/enrollments/${id}`, { status });
  },

  /**
   * Fetches all demo session bookings for the admin panel
   */
  async getAdminDemos(): Promise<DemoSession[]> {
    return apiClient.get<DemoSession[]>('/admin/programs/demos');
  },

  /**
   * Updates the status of a demo session request (e.g. PENDING, CONTACTED, SCHEDULED, COMPLETED, CANCELLED)
   */
  async updateDemoStatus(id: string, status: string): Promise<DemoSession> {
    return apiClient.patch<DemoSession>(`/admin/programs/demos/${id}`, { status });
  },

  /**
   * Submits/books a new demo session request
   */
  async bookDemoSession(data: Partial<DemoSession>): Promise<{ success: boolean; data: DemoSession }> {
    return apiClient.post<{ success: boolean; data: DemoSession }>('/programs/demo/book', data);
  },

  /**
   * Enrolls the current logged-in user in a program
   */
  async enrollInProgram(programId: string, type: 'PRIVATE' | 'GROUP'): Promise<{ success: boolean; message: string; enrollment: any }> {
    return apiClient.post<{ success: boolean; message: string; enrollment: any }>(`/programs/${programId}/enroll`, { type });
  },

  /**
   * Fetches all enrollments for the current logged-in user
   */
  async getUserEnrollments(): Promise<{ success: boolean; data: ProgramEnrollment[] }> {
    return apiClient.get<{ success: boolean; data: ProgramEnrollment[] }>('/programs/me');
  }
};
