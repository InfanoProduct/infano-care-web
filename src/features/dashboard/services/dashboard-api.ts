import { useAuthStore } from "@/store/auth-store";

export interface DashboardStats {
  totalMembers: number;
  activeConsultations: number;
  totalJourneys: number;
  totalEpisodes: number;
  revenue: string;
  growth: string;
}

const API_BASE_URL = 'http://127.0.0.1:4005/api';

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const token = useAuthStore.getState().token;

  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch stats');
  }

  return response.json();
};
