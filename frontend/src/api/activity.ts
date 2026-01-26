import { apiClient } from './client'
import type { ActivityLog, EntityType } from './types'

export interface ActivityFilters {
  entityType?: EntityType
  entityId?: string
  limit?: number
}

export const activityApi = {
  async list(filters?: ActivityFilters): Promise<ActivityLog[]> {
    const response = await apiClient.get<ActivityLog[]>('/activity', { params: filters })
    return response.data
  },

  async getByAudit(auditId: string): Promise<ActivityLog[]> {
    const response = await apiClient.get<ActivityLog[]>(`/activity/audits/${auditId}`)
    return response.data
  },
}
