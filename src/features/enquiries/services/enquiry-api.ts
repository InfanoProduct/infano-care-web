import { apiClient } from "@/lib/api-client";

export interface Enquiry {
  id: string;
  type: string;
  schoolName: string;
  schoolType?: string;
  cityState?: string;
  totalGirls?: number;
  contactName?: string;
  email: string;
  phone?: string;
  preferredTime?: string;
  goals?: string;
  details?: string;
  ngoDetail?: string;
  peerMentorName?: string;
  preferredDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const EnquiryApiService = {
  async getEnquiries(): Promise<Enquiry[]> {
    return apiClient.get<Enquiry[]>('/admin/enquiries');
  },

  async getEnquiryById(id: string): Promise<Enquiry> {
    return apiClient.get<Enquiry>(`/admin/enquiries/${id}`);
  }
};
