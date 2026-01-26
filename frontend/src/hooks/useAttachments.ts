import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attachmentsApi, type AttachmentFilters } from '@/api/attachments'
import { useUIStore } from '@/stores/uiStore'
import { auditKeys } from './useAudits'

export const attachmentKeys = {
  all: ['attachments'] as const,
  lists: () => [...attachmentKeys.all, 'list'] as const,
  list: (filters?: AttachmentFilters) => [...attachmentKeys.lists(), filters] as const,
}

export function useAttachments(filters?: AttachmentFilters) {
  return useQuery({
    queryKey: attachmentKeys.list(filters),
    queryFn: () => attachmentsApi.list(filters),
    staleTime: 30 * 1000,
  })
}

export function useUploadAttachment() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((state) => state.addToast)

  return useMutation({
    mutationFn: ({ file, auditId }: { file: File; auditId?: string }) =>
      attachmentsApi.upload(file, auditId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.lists() })
      if (variables.auditId) {
        queryClient.invalidateQueries({ queryKey: auditKeys.detail(variables.auditId) })
      }
      addToast({
        title: 'File uploaded',
        description: 'The file has been uploaded successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Failed to upload file',
        description: 'There was an error uploading the file. Please try again.',
        variant: 'error',
      })
    },
  })
}

export function useDownloadAttachment() {
  const addToast = useUIStore((state) => state.addToast)

  return useMutation({
    mutationFn: async ({ id, fileName }: { id: string; fileName: string }) => {
      const blob = await attachmentsApi.download(id)
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },
    onError: () => {
      addToast({
        title: 'Failed to download file',
        description: 'There was an error downloading the file. Please try again.',
        variant: 'error',
      })
    },
  })
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((state) => state.addToast)

  return useMutation({
    mutationFn: (id: string) => attachmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.lists() })
      addToast({
        title: 'File deleted',
        description: 'The file has been deleted successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Failed to delete file',
        description: 'There was an error deleting the file. Please try again.',
        variant: 'error',
      })
    },
  })
}
