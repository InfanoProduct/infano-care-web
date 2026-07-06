import { apiClient } from "@/lib/api-client";

export interface RecentOrder {
  id: string;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
  guestName?: string | null;
  user?: {
    username: string;
    profile?: {
      displayName: string;
    } | null;
  } | null;
}

export interface RecentSchool {
  id: string;
  schoolId: string;
  name: string;
  city: string;
  tier: string;
  totalMouValue: number | null;
  status: string;
  createdAt: string;
}

export interface RecentBooking {
  id: string;
  scheduledAt: string;
  status: string;
  amount: number | null;
  user: {
    username: string;
    profile?: {
      displayName: string;
    };
  };
  expert: {
    username: string;
    profile?: {
      displayName: string;
    };
  };
}

export interface RecentProgram {
  id: string;
  title: string;
  tagline: string;
  classRange: string;
  duration: string;
  price: number;
  enrolledCount: number;
  revenue: number;
  createdAt: string;
}

export interface MonthlyTrend {
  month: string;
  users: number;
  revenue: number;
}

export interface DashboardStats {
  totalMembers: number;
  activeConsultations: number;
  totalJourneys: number;
  totalEpisodes: number;
  totalEnquiries: number;
  learningPrograms: number;
  books: number;
  blogs: number;
  schools: number;
  orders: number;
  bookRevenue: number;
  programRevenue: number;
  expertRevenue: number;
  totalRevenue: number;
  growth: string;
  memberGrowth: string;
  schoolGrowth: string;
  programGrowth: string;
  journeyGrowth: string;
  bookGrowth: string;
  orderGrowth: string;
  recentOrders: RecentOrder[];
  recentSchools: RecentSchool[];
  recentBookings: RecentBooking[];
  recentPrograms: RecentProgram[];
  trends: MonthlyTrend[];
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  return apiClient.get<DashboardStats>('/admin/stats');
};
