import { apiClient } from "@/lib/api-client";

export interface DashboardStats {
  totalMembers: number;
  activeConsultations: number;
  totalJourneys: number;
  totalEpisodes: number;
  revenue: string;
  growth: string;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  return apiClient.get<DashboardStats>('/admin/stats');
};
