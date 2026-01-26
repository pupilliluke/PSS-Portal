import { useQuery } from '@tanstack/react-query'
import { activityApi, type ActivityFilters } from '@/api/activity'

export const activityKeys = {
  all: ['activity'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters?: ActivityFilters) => [...activityKeys.lists(), filters] as const,
  byAudit: (auditId: string) => [...activityKeys.all, 'audit', auditId] as const,
}

export function useActivity(filters?: ActivityFilters) {
  return useQuery({
    queryKey: activityKeys.list(filters),
    queryFn: () => activityApi.list(filters),
    staleTime: 15 * 1000, // 15 seconds - activity changes frequently
  })
}

export function useAuditActivity(auditId: string) {
  return useQuery({
    queryKey: activityKeys.byAudit(auditId),
    queryFn: () => activityApi.getByAudit(auditId),
    enabled: !!auditId,
    staleTime: 15 * 1000,
  })
}
