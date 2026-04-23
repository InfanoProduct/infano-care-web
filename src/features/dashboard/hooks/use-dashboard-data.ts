import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '../services/dashboard-api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });
};
