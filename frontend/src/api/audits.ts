import { apiClient } from './client'
import type {
  Audit,
  CreateAuditRequest,
  UpdateAuditRequest,
  UpdateStatusRequest,
  AuditStatus,
} from './types'

export const auditsApi = {
  async list(status?: AuditStatus): Promise<Audit[]> {
    const params = status ? { status } : {}
    const response = await apiClient.get<Audit[]>('/audits', { params })
    return response.data
  },

  async get(id: string): Promise<Audit> {
    const response = await apiClient.get<Audit>(`/audits/${id}`)
    return response.data
  },

  async create(data: CreateAuditRequest): Promise<Audit> {
    const response = await apiClient.post<Audit>('/audits', data)
    return response.data
  },

  async update(id: string, data: UpdateAuditRequest): Promise<Audit> {
    const response = await apiClient.put<Audit>(`/audits/${id}`, data)
    return response.data
  },

  async updateStatus(id: string, data: UpdateStatusRequest): Promise<Audit> {
    const response = await apiClient.patch<Audit>(`/audits/${id}/status`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/audits/${id}`)
  },
}
