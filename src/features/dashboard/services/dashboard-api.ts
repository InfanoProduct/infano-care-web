export interface DashboardStats {
  totalPatients: number;
  appointmentsToday: number;
  revenue: string;
  growth: string;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  return {
    totalPatients: 1284,
    appointmentsToday: 42,
    revenue: '$12,450',
    growth: '+12.5%',
  };
};
