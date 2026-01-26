import { apiClient } from './client'
import type { Attachment } from './types'

export interface AttachmentFilters {
  auditId?: string
  limit?: number
}

export const attachmentsApi = {
  async list(filters?: AttachmentFilters): Promise<Attachment[]> {
    const response = await apiClient.get<Attachment[]>('/attachments', { params: filters })
    return response.data
  },

  async upload(file: File, auditId?: string): Promise<Attachment> {
    const formData = new FormData()
    formData.append('file', file)
    if (auditId) {
      formData.append('auditId', auditId)
    }

    const response = await apiClient.post<Attachment>('/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async download(id: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(`/attachments/${id}`, {
      responseType: 'blob',
    })
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/attachments/${id}`)
  },
}
