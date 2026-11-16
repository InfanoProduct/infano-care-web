import { apiClient } from "@/lib/api-client";

export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'SCHEDULED' | 'COMPLETED';

export interface Enquiry {
  id: string;
  type: string;
  schoolName: string;
  schoolType?: string;
  cityState?: string;
  totalGirls?: number;
  studentCount?: number | null;
  board?: string | null;
  contactName?: string;
  contactRole?: string | null;
  email?: string | null;
  phone?: string;
  preferredTime?: string;
  preferredWeek?: string | null;
  wantsDemo?: boolean | null;
  goals?: string;
  details?: string;
  ngoDetail?: string;
  peerMentorName?: string;
  preferredDate?: string;
  status: EnquiryStatus;
  followUpAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolHealthCheckSubmission {
  type: 'school_health_check';
  schoolName: string;
  cityState: string;
  studentCount: number;
  board: 'CBSE' | 'ICSE' | 'State board' | 'IB / Cambridge' | 'Other';
  contactName: string;
  contactRole: string;
  phone: string;
  preferredWeek: 'Next week' | 'In 2 weeks' | 'Later this month';
  wantsDemo: boolean;
}

export const EnquiryApiService = {
  async submitSchoolHealthCheck(data: SchoolHealthCheckSubmission): Promise<Enquiry> {
    const response = await apiClient.post<{ enquiry: Enquiry }>('/enquiry/submit', data);
    return response.enquiry;
  },

  async getEnquiries(): Promise<Enquiry[]> {
    return apiClient.get<Enquiry[]>('/admin/enquiries');
  },

  async getEnquiryById(id: string): Promise<Enquiry> {
    return apiClient.get<Enquiry>(`/admin/enquiries/${id}`);
  },

  async updateEnquiry(
    id: string,
    data: { status?: EnquiryStatus; followUpAt?: string | null },
  ): Promise<Enquiry> {
    return apiClient.patch<Enquiry>(`/admin/enquiries/${id}`, data);
  },
};
