import { useQuery } from "@tanstack/react-query";
import {
  ParentOrdersSummaryResponse,
  ParentSettingsResponse,
  ParentSpaceService,
} from "@/services/parent-space.service";

export const parentOrdersSummaryQueryKey = (userId?: string | null) =>
  userId ? ["parent-orders-summary", userId] as const : ["parent-orders-summary"] as const;

export const parentSettingsQueryKey = (userId?: string | null) =>
  ["parent-settings", userId] as const;

export function useParentOrdersSummary(
  userId?: string | null,
  enabled = true,
) {
  return useQuery<ParentOrdersSummaryResponse>({
    queryKey: parentOrdersSummaryQueryKey(userId),
    queryFn: () => ParentSpaceService.getOrdersSummary(),
    enabled: Boolean(userId && enabled),
  });
}

export function useParentSettings(userId?: string | null) {
  return useQuery<ParentSettingsResponse>({
    queryKey: parentSettingsQueryKey(userId),
    queryFn: () => ParentSpaceService.getSettings(),
    enabled: Boolean(userId),
  });
}
