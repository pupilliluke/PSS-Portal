import { apiClient } from './client'
import type {
  Finding,
  FindingDetail,
  CreateFindingRequest,
  UpdateFindingRequest,
  UpdateStatusRequest,
  FindingCategory,
  FindingSeverity,
  FindingStatus,
} from './types'

export interface FindingsFilters {
  auditId?: string
  category?: FindingCategory
  severity?: FindingSeverity
  status?: FindingStatus
}

export const findingsApi = {
  async list(filters?: FindingsFilters): Promise<Finding[]> {
    const response = await apiClient.get<Finding[]>('/findings', { params: filters })
    return response.data
  },

  async get(id: string): Promise<FindingDetail> {
    const response = await apiClient.get<FindingDetail>(`/findings/${id}`)
    return response.data
  },

  async create(data: CreateFindingRequest): Promise<Finding> {
    const response = await apiClient.post<Finding>('/findings', data)
    return response.data
  },

  async update(id: string, data: UpdateFindingRequest): Promise<Finding> {
    const response = await apiClient.put<Finding>(`/findings/${id}`, data)
    return response.data
  },

  async updateStatus(id: string, data: UpdateStatusRequest): Promise<Finding> {
    const response = await apiClient.patch<Finding>(`/findings/${id}/status`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/findings/${id}`)
  },
}
