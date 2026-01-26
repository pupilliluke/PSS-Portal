import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { auditsApi } from '@/api/audits'
import type { AuditStatus, CreateAuditRequest, UpdateAuditRequest } from '@/api/types'
import { useUIStore } from '@/stores/uiStore'

export const auditKeys = {
  all: ['audits'] as const,
  lists: () => [...auditKeys.all, 'list'] as const,
  list: (status?: AuditStatus) => [...auditKeys.lists(), { status }] as const,
  details: () => [...auditKeys.all, 'detail'] as const,
  detail: (id: string) => [...auditKeys.details(), id] as const,
}

export function useAudits(status?: AuditStatus) {
  return useQuery({
    queryKey: auditKeys.list(status),
    queryFn: () => auditsApi.list(status),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useAudit(id: string) {
  return useQuery({
    queryKey: auditKeys.detail(id),
    queryFn: () => auditsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateAudit() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((state) => state.addToast)

  return useMutation({
    mutationFn: (data: CreateAuditRequest) => auditsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditKeys.lists() })
      addToast({
        title: 'Audit created',
        description: 'The audit has been created successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Failed to create audit',
        description: 'There was an error creating the audit. Please try again.',
        variant: 'error',
      })
    },
  })
}

export function useUpdateAudit() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((state) => state.addToast)

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAuditRequest }) =>
      auditsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: auditKeys.lists() })
      addToast({
        title: 'Audit updated',
        description: 'The audit has been updated successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Failed to update audit',
        description: 'There was an error updating the audit. Please try again.',
        variant: 'error',
      })
    },
  })
}

export function useUpdateAuditStatus() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((state) => state.addToast)

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      auditsApi.updateStatus(id, { status }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: auditKeys.lists() })
      addToast({
        title: 'Status updated',
        description: 'The audit status has been updated.',
        variant: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Failed to update status',
        description: 'There was an error updating the status. Please try again.',
        variant: 'error',
      })
    },
  })
}

export function useDeleteAudit() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((state) => state.addToast)

  return useMutation({
    mutationFn: (id: string) => auditsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditKeys.lists() })
      addToast({
        title: 'Audit deleted',
        description: 'The audit has been deleted successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Failed to delete audit',
        description: 'There was an error deleting the audit. Please try again.',
        variant: 'error',
      })
    },
  })
}
