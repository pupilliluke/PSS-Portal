import { apiClient } from './client'
import type {
  Lead,
  CreateLeadRequest,
  UpdateLeadRequest,
  LeadStatus,
  LeadSource,
} from './types'

export interface LeadsFilters {
  status?: LeadStatus
  source?: LeadSource
  search?: string
}

export const leadsApi = {
  async list(filters?: LeadsFilters): Promise<Lead[]> {
    const params: Record<string, string> = {}
    if (filters?.status) params.status = filters.status
    if (filters?.source) params.source = filters.source
    if (filters?.search) params.search = filters.search
    const response = await apiClient.get<Lead[]>('/leads', { params })
    return response.data
  },

  async get(id: string): Promise<Lead> {
    const response = await apiClient.get<Lead>(`/leads/${id}`)
    return response.data
  },

  async create(data: CreateLeadRequest): Promise<Lead> {
    const response = await apiClient.post<Lead>('/leads', data)
    return response.data
  },

  async update(id: string, data: UpdateLeadRequest): Promise<Lead> {
    const response = await apiClient.put<Lead>(`/leads/${id}`, data)
    return response.data
  },

  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    const response = await apiClient.patch<Lead>(`/leads/${id}/status`, { status })
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/leads/${id}`)
  },
}
