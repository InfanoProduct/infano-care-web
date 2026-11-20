import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchDashboardStats } from '../services/dashboard-api';

export const useDashboardStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['dashboard-stats', startDate, endDate],
    queryFn: () => fetchDashboardStats(startDate, endDate),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};
