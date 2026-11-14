import { useQuery } from "@tanstack/react-query";
import { OnboardingService } from "@/services/onboarding.service";
import { ParentLink, ParentService } from "@/services/parent.service";
import { DemoSession, Program, ProgramEnrollment, ProgramsService } from "@/services/programs.service";
import { ShopService } from "@/services/shop.service";
import { apiClient } from "@/lib/api-client";
import { LearnerProfile } from "@/store/auth-store";

export interface DashboardExpertSession {
  id: string;
  scheduledAt: string;
  status: string;
  meetLink?: string | null;
  sessionNumber?: number | null;
  user: {
    id?: string;
    username: string;
    role?: string;
    profile?: { displayName?: string };
  };
  expert?: {
    id?: string;
    username: string;
    profile?: { displayName?: string; specialisation?: string; consultationPrice?: number | null };
  };
  program?: { id: string; title: string } | null;
  programId?: string | null;
  createdAt: string;
  amount?: number | null;
  razorpayPaymentId?: string | null;
  razorpayOrderId?: string | null;
}

interface DashboardPeerStats {
  sessionsTotal?: number;
  avgScore?: number;
  badgeTier?: string;
}

export type DashboardOverviewData = {
  enrollments: ProgramEnrollment[];
  programs: Program[];
  isLinked: boolean;
  demoSessions: DemoSession[];
  orders: Awaited<ReturnType<typeof ShopService.getUserOrders>>;
  parentBookmarks: Awaited<ReturnType<typeof ParentService.getTeenParentBookmarks>>;
  peerStats: DashboardPeerStats | null;
  expertSessions: DashboardExpertSession[];
};

export const dashboardOverviewQueryKey = (
  userId?: string | null,
  role?: string,
  isTeen?: boolean,
) => {
  if (!userId) return ["dashboard-overview"] as const;
  if (role === undefined) return ["dashboard-overview", userId] as const;
  return ["dashboard-overview", userId, role, isTeen] as const;
};

export function useDashboardOverview(
  userId: string | undefined,
  role: string | undefined,
  isTeen: boolean,
) {
  return useQuery<DashboardOverviewData>({
    queryKey: dashboardOverviewQueryKey(userId, role, isTeen),
    enabled: Boolean(userId),
    queryFn: async () => {
      if (role === "EXPERT" || role === "ADMIN") {
        const expertSessions =
          role === "EXPERT"
            ? await apiClient.get<DashboardExpertSession[]>("/expert/sessions").catch(() => [])
            : [];
        return {
          enrollments: [],
          programs: [],
          isLinked: false,
          demoSessions: [],
          orders: [],
          parentBookmarks: [],
          peerStats: null,
          expertSessions: Array.isArray(expertSessions) ? expertSessions : [],
        };
      }

      const [
        enrollmentsRes,
        programs,
        links,
        demosRes,
        orders,
        bookmarks,
        peerStats,
      ] = await Promise.all([
        ProgramsService.getUserEnrollments().catch(() => ({
          success: true,
          data: [] as ProgramEnrollment[],
        })),
        ProgramsService.getPrograms().catch(() => []),
        ParentService.getLinks().catch(() => [] as ParentLink[]),
        ProgramsService.getUserDemos().catch(() => ({
          success: true,
          data: [] as DemoSession[],
        })),
        ShopService.getUserOrders().catch(() => []),
        isTeen ? ParentService.getTeenParentBookmarks().catch(() => []) : Promise.resolve([]),
        role === "PEER"
          ? apiClient.get<DashboardPeerStats>("/peerline/mentor/stats").catch(() => null)
          : Promise.resolve(null),
      ]);

      const isLinked = links.some((link) => link.status === "LINKED");
      return {
        enrollments: enrollmentsRes.data || [],
        programs: programs || [],
        isLinked,
        demoSessions: demosRes.data || [],
        orders: orders || [],
        parentBookmarks: isLinked ? bookmarks || [] : [],
        peerStats,
        expertSessions: [],
      };
    },
  });
}

export const dashboardLearnersQueryKey = (userId?: string | null) =>
  userId ? ["dashboard-learners", userId] as const : ["dashboard-learners"] as const;

export function useDashboardLearners(
  userId: string | undefined,
  initialLearners: LearnerProfile[],
) {
  return useQuery<LearnerProfile[]>({
    queryKey: dashboardLearnersQueryKey(userId),
    enabled: Boolean(userId),
    queryFn: async () => {
      const response = await OnboardingService.getLearners();
      return response.learners;
    },
    initialData: initialLearners.length > 0 ? initialLearners : undefined,
  });
}
