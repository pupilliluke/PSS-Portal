import { useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Upload,
  Paperclip,
  Download,
  Trash2,
  File,
  FileImage,
  FileText,
  FileSpreadsheet,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import {
  useAttachments,
  useUploadAttachment,
  useDownloadAttachment,
  useDeleteAttachment,
} from '@/hooks/useAttachments'
import { useAudits } from '@/hooks/useAudits'
import { formatRelativeTime, formatFileSize } from '@/lib/utils'
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/lib/constants'

export function AttachmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const auditId = searchParams.get('auditId') || undefined

  const { data: attachments, isLoading } = useAttachments({ auditId })
  const { data: audits } = useAudits()
  const uploadAttachment = useUploadAttachment()
  const downloadAttachment = useDownloadAttachment()
  const deleteAttachment = useDeleteAttachment()

  const updateFilter = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set('auditId', value)
    } else {
      newParams.delete('auditId')
    }
    setSearchParams(newParams)
  }

  const isValidFile = (file: File) => {
    const allAllowedTypes = [
      ...ALLOWED_FILE_TYPES.images,
      ...ALLOWED_FILE_TYPES.documents,
      ...ALLOWED_FILE_TYPES.data,
    ]

    if (!allAllowedTypes.includes(file.type)) {
      return { valid: false, error: `File type not allowed: ${file.type}` }
    }

    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File too large. Maximum size is 10 MB` }
    }

    return { valid: true }
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      const validation = isValidFile(file)
      if (!validation.valid) {
        alert(validation.error)
        continue
      }

      await uploadAttachment.mutateAsync({ file, auditId })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDownload = async (id: string, fileName: string) => {
    await downloadAttachment.mutateAsync({ id, fileName })
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      await deleteAttachment.mutateAsync(id)
    }
  }

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return <FileImage className="h-8 w-8 text-blue-500" aria-hidden="true" />
    }
    if (contentType === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" aria-hidden="true" />
    }
    if (
      contentType.includes('spreadsheet') ||
      contentType.includes('excel') ||
      contentType === 'text/csv'
    ) {
      return <FileSpreadsheet className="h-8 w-8 text-green-500" aria-hidden="true" />
    }
    if (contentType.includes('word') || contentType === 'text/plain') {
      return <FileText className="h-8 w-8 text-blue-500" aria-hidden="true" />
    }
    return <File className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attachments</h2>
          <p className="text-muted-foreground">
            Manage files attached to your audits
          </p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
          Upload File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          aria-label="Upload file"
        />
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Select
              value={auditId || ''}
              onChange={(e) => updateFilter(e.target.value)}
              className="w-64"
              aria-label="Filter by audit"
            >
              <option value="">All audits</option>
              {audits?.map((audit) => (
                <option key={audit.id} value={audit.id}>
                  {audit.title}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Upload Zone */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Upload
              className={`h-12 w-12 mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}
              aria-hidden="true"
            />
            <h3 className="text-lg font-medium mb-1">
              {isDragging ? 'Drop files here' : 'Drag and drop files'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              or click the Upload button above
            </p>
            <p className="text-xs text-muted-foreground">
              Max file size: 10 MB. Supported: Images, PDF, Word, Excel, CSV, TXT
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Attachments List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : !attachments || attachments.length === 0 ? (
        <EmptyState
          icon={Paperclip}
          title="No attachments yet"
          description="Upload files to attach them to your audits"
          action={
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
              Upload File
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {getFileIcon(attachment.contentType)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" title={attachment.fileName}>
                      {attachment.fileName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(attachment.fileSize)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Uploaded {formatRelativeTime(attachment.uploadedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment.id, attachment.fileName)}
                    disabled={downloadAttachment.isPending}
                  >
                    <Download className="h-4 w-4 mr-1" aria-hidden="true" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(attachment.id)}
                    disabled={deleteAttachment.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
