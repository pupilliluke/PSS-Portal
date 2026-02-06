import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsApi, type LeadsFilters } from '@/api/leads'
import type { CreateLeadRequest, UpdateLeadRequest, LeadStatus } from '@/api/types'
import { useUIStore } from '@/stores/uiStore'

export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (filters?: LeadsFilters) => [...leadKeys.lists(), filters] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
}

export function useLeads(filters?: LeadsFilters) {
  return useQuery({
    queryKey: leadKeys.list(filters),
    queryFn: () => leadsApi.list(filters),
    staleTime: 30 * 1000,
  })
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((state) => state.addToast)

  return useMutation({
    mutationFn: (data: CreateLeadRequest) => leadsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      addToast({
        title: 'Lead created',
        description: 'The lead has been created successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Failed to create lead',
        description: 'There was an error creating the lead. Please try again.',
        variant: 'error',
      })
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((state) => state.addToast)

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadRequest }) =>
      leadsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      addToast({
        title: 'Lead updated',
        description: 'The lead has been updated successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Failed to update lead',
        description: 'There was an error updating the lead. Please try again.',
        variant: 'error',
      })
    },
  })
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((state) => state.addToast)

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      leadsApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      addToast({
        title: 'Status updated',
        description: 'The lead status has been updated.',
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

export function useDeleteLead() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((state) => state.addToast)

  return useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      addToast({
        title: 'Lead deleted',
        description: 'The lead has been deleted successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Failed to delete lead',
        description: 'There was an error deleting the lead. Please try again.',
        variant: 'error',
      })
    },
  })
}
