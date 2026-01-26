import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useFinding, useUpdateFindingStatus, useDeleteFinding } from '@/hooks/useFindings'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import {
  STATUS_COLORS,
  SEVERITY_COLORS,
  CATEGORY_COLORS,
  FINDING_STATUSES,
} from '@/lib/constants'

export function FindingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: finding, isLoading } = useFinding(id!)
  const updateStatus = useUpdateFindingStatus()
  const deleteFinding = useDeleteFinding()

  const handleStatusChange = async (status: string) => {
    await updateStatus.mutateAsync({ id: id!, status })
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this finding?')) {
      await deleteFinding.mutateAsync(id!)
      navigate('/findings')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!finding) {
    return (
      <EmptyState
        title="Finding not found"
        description="The finding you're looking for doesn't exist"
        action={
          <Button asChild>
            <Link to="/findings">Back to Findings</Link>
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
          <Link to="/findings">
            <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
            Back to Findings
          </Link>
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold tracking-tight">{finding.title}</h2>
              <Badge className={SEVERITY_COLORS[finding.severity]}>
                {finding.severity}
              </Badge>
              <Badge className={CATEGORY_COLORS[finding.category]}>
                {finding.category}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created {formatDate(finding.createdAt)} · Updated{' '}
              {formatRelativeTime(finding.updatedAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={finding.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updateStatus.isPending}
              className="w-36"
              aria-label="Update status"
            >
              {FINDING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>

            <Button variant="outline" size="sm" asChild>
              <Link to={`/findings/${id}/edit`}>
                <Pencil className="h-4 w-4 mr-1" aria-hidden="true" />
                Edit
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Linked Audit */}
      {finding.audit && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Related Audit</p>
                <p className="font-medium">{finding.audit.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={STATUS_COLORS[finding.audit.status]}>
                  {finding.audit.status}
                </Badge>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/audits/${finding.audit.id}`}>
                    View Audit
                    <ExternalLink className="h-4 w-4 ml-1" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Description */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>Details about the finding</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{finding.description}</p>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={STATUS_COLORS[finding.status]}>
                {finding.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Severity</p>
              <div className="flex items-center gap-2">
                {finding.severity === 'High' && (
                  <AlertTriangle className="h-4 w-4 text-red-500" aria-hidden="true" />
                )}
                {finding.severity === 'Medium' && (
                  <Clock className="h-4 w-4 text-yellow-500" aria-hidden="true" />
                )}
                {finding.severity === 'Low' && (
                  <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                )}
                <span className="font-medium">{finding.severity}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{finding.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Effort</p>
              <Badge variant="outline">
                {finding.effort === 'S' && 'Small'}
                {finding.effort === 'M' && 'Medium'}
                {finding.effort === 'L' && 'Large'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recommendation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recommendation</CardTitle>
            <CardDescription>Suggested actions to address this finding</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{finding.recommendation}</p>
          </CardContent>
        </Card>

        {/* ROI Estimate */}
        {finding.roiEstimate && (
          <Card>
            <CardHeader>
              <CardTitle>ROI Estimate</CardTitle>
              <CardDescription>Expected return on investment</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{finding.roiEstimate}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
