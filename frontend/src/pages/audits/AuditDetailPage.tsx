import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Search,
  Activity,
  Paperclip,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useAudit, useUpdateAuditStatus, useDeleteAudit } from '@/hooks/useAudits'
import { useFindings } from '@/hooks/useFindings'
import { useAuditActivity } from '@/hooks/useActivity'
import { useAttachments } from '@/hooks/useAttachments'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { STATUS_COLORS, SEVERITY_COLORS, AUDIT_STATUSES } from '@/lib/constants'

export function AuditDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: audit, isLoading: auditLoading } = useAudit(id!)
  const { data: findings, isLoading: findingsLoading } = useFindings({ auditId: id })
  const { data: activities, isLoading: activitiesLoading } = useAuditActivity(id!)
  const { data: attachments, isLoading: attachmentsLoading } = useAttachments({ auditId: id })

  const updateStatus = useUpdateAuditStatus()
  const deleteAudit = useDeleteAudit()

  const handleStatusChange = async (status: string) => {
    if (id) {
      await updateStatus.mutateAsync({ id, status })
    }
  }

  const handleDelete = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this audit? All associated findings and attachments will also be deleted. This action cannot be undone.'
      )
    ) {
      setIsDeleting(true)
      try {
        await deleteAudit.mutateAsync(id!)
        navigate('/audits')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  if (auditLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (!audit) {
    return (
      <EmptyState
        icon={Search}
        title="Audit not found"
        description="The audit you're looking for doesn't exist or has been deleted"
        action={
          <Button asChild>
            <Link to="/audits">Back to Audits</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" asChild>
          <Link to="/audits">
            <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
            Back to Audits
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold tracking-tight">{audit.title}</h2>
              <Badge className={STATUS_COLORS[audit.status]}>{audit.status}</Badge>
            </div>
            <p className="text-muted-foreground">
              Created {formatDate(audit.createdAt)} · Last updated{' '}
              {formatRelativeTime(audit.updatedAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={audit.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updateStatus.isPending}
              className="w-36"
              aria-label="Update status"
            >
              {AUDIT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>

            <Button variant="outline" size="sm" asChild>
              <Link to={`/audits/${id}/edit`}>
                <Pencil className="h-4 w-4 mr-1" aria-hidden="true" />
                Edit
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Notes */}
      {audit.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {audit.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Findings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4" aria-hidden="true" />
                Findings
              </CardTitle>
              <CardDescription>
                {findings?.length || 0} findings in this audit
              </CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link to={`/findings/new?auditId=${id}`}>
                <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                Add
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {findingsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : !findings || findings.length === 0 ? (
              <EmptyState
                title="No findings yet"
                description="Add findings to document issues discovered"
              />
            ) : (
              <div className="space-y-2">
                {findings.slice(0, 5).map((finding) => (
                  <Link
                    key={finding.id}
                    to={`/findings/${finding.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{finding.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={SEVERITY_COLORS[finding.severity]}
                        >
                          {finding.severity}
                        </Badge>
                        <Badge variant="outline" className={STATUS_COLORS[finding.status]}>
                          {finding.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
                {findings.length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to={`/findings?auditId=${id}`}>
                      View all {findings.length} findings
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" aria-hidden="true" />
              Activity
            </CardTitle>
            <CardDescription>Recent changes to this audit</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : !activities || activities.length === 0 ? (
              <EmptyState
                title="No activity yet"
                description="Activity will be recorded as changes are made"
              />
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <Clock
                      className="h-4 w-4 text-muted-foreground mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p>
                        <span className="font-medium">{activity.userEmail}</span>{' '}
                        {activity.action.toLowerCase()} {activity.entityType.toLowerCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Paperclip className="h-4 w-4" aria-hidden="true" />
                Attachments
              </CardTitle>
              <CardDescription>
                {attachments?.length || 0} files attached
              </CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link to={`/attachments?auditId=${id}`}>
                <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                Upload
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {attachmentsLoading ? (
              <Skeleton className="h-20" />
            ) : !attachments || attachments.length === 0 ? (
              <EmptyState
                title="No attachments"
                description="Upload files to attach to this audit"
              />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    <Paperclip
                      className="h-4 w-4 text-muted-foreground shrink-0"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {attachment.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(attachment.uploadedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
