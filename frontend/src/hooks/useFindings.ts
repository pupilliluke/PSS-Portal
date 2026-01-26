import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { findingsApi, type FindingsFilters } from '@/api/findings'
import type { CreateFindingRequest, UpdateFindingRequest } from '@/api/types'
import { useUIStore } from '@/stores/uiStore'
import { auditKeys } from './useAudits'

export const findingKeys = {
  all: ['findings'] as const,
  lists: () => [...findingKeys.all, 'list'] as const,
  list: (filters?: FindingsFilters) => [...findingKeys.lists(), filters] as const,
  details: () => [...findingKeys.all, 'detail'] as const,
  detail: (id: string) => [...findingKeys.details(), id] as const,
}

export function useFindings(filters?: FindingsFilters) {
  return useQuery({
    queryKey: findingKeys.list(filters),
    queryFn: () => findingsApi.list(filters),
    staleTime: 30 * 1000,
  })
}

export function useFinding(id: string) {
  return useQuery({
    queryKey: findingKeys.detail(id),
    queryFn: () => findingsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateFinding() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((state) => state.addToast)

  return useMutation({
    mutationFn: (data: CreateFindingRequest) => findingsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: findingKeys.lists() })
      // Also invalidate the audit detail to refresh finding count
      if (variables.auditId) {
        queryClient.invalidateQueries({ queryKey: auditKeys.detail(variables.auditId) })
      }
      addToast({
        title: 'Finding created',
        description: 'The finding has been created successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Failed to create finding',
        description: 'There was an error creating the finding. Please try again.',
        variant: 'error',
      })
    },
  })
}

export function useUpdateFinding() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((state) => state.addToast)

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFindingRequest }) =>
      findingsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: findingKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: findingKeys.lists() })
      addToast({
        title: 'Finding updated',
        description: 'The finding has been updated successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Failed to update finding',
        description: 'There was an error updating the finding. Please try again.',
        variant: 'error',
      })
    },
  })
}

export function useUpdateFindingStatus() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((state) => state.addToast)

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      findingsApi.updateStatus(id, { status }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: findingKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: findingKeys.lists() })
      addToast({
        title: 'Status updated',
        description: 'The finding status has been updated.',
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

export function useDeleteFinding() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((state) => state.addToast)

  return useMutation({
    mutationFn: (id: string) => findingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: findingKeys.lists() })
      addToast({
        title: 'Finding deleted',
        description: 'The finding has been deleted successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Failed to delete finding',
        description: 'There was an error deleting the finding. Please try again.',
        variant: 'error',
      })
    },
  })
}
