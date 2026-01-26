import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useFindings, useDeleteFinding, useUpdateFindingStatus } from '@/hooks/useFindings'
import { useAudits } from '@/hooks/useAudits'
import { formatRelativeTime } from '@/lib/utils'
import {
  STATUS_COLORS,
  SEVERITY_COLORS,
  CATEGORY_COLORS,
  FINDING_CATEGORIES,
  FINDING_SEVERITIES,
  FINDING_STATUSES,
} from '@/lib/constants'
import type { FindingCategory, FindingSeverity, FindingStatus } from '@/api/types'

export function FindingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')

  // Get filters from URL
  const auditId = searchParams.get('auditId') || undefined
  const category = (searchParams.get('category') as FindingCategory) || undefined
  const severity = (searchParams.get('severity') as FindingSeverity) || undefined
  const status = (searchParams.get('status') as FindingStatus) || undefined

  const { data: findings, isLoading } = useFindings({ auditId, category, severity, status })
  const { data: audits } = useAudits()
  const deleteFinding = useDeleteFinding()
  const updateStatus = useUpdateFindingStatus()

  // Filter by search query
  const filteredFindings = findings?.filter(
    (f) =>
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this finding?')) {
      await deleteFinding.mutateAsync(id)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateStatus.mutateAsync({ id, status: newStatus })
  }

  const getSeverityIcon = (sev: FindingSeverity) => {
    switch (sev) {
      case 'High':
        return <AlertTriangle className="h-4 w-4 text-red-500" aria-hidden="true" />
      case 'Medium':
        return <Clock className="h-4 w-4 text-yellow-500" aria-hidden="true" />
      case 'Low':
        return <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Findings</h2>
          <p className="text-muted-foreground">
            Manage and track all audit findings
          </p>
        </div>
        <Button asChild>
          <Link to={`/findings/new${auditId ? `?auditId=${auditId}` : ''}`}>
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            New Finding
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search findings…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Search findings"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />

              <Select
                value={auditId || ''}
                onChange={(e) => updateFilter('auditId', e.target.value)}
                className="w-40"
                aria-label="Filter by audit"
              >
                <option value="">All audits</option>
                {audits?.map((audit) => (
                  <option key={audit.id} value={audit.id}>
                    {audit.title}
                  </option>
                ))}
              </Select>

              <Select
                value={category || ''}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-36"
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {FINDING_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>

              <Select
                value={severity || ''}
                onChange={(e) => updateFilter('severity', e.target.value)}
                className="w-32"
                aria-label="Filter by severity"
              >
                <option value="">All severities</option>
                {FINDING_SEVERITIES.map((sev) => (
                  <option key={sev} value={sev}>
                    {sev}
                  </option>
                ))}
              </Select>

              <Select
                value={status || ''}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-32"
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                {FINDING_STATUSES.map((stat) => (
                  <option key={stat} value={stat}>
                    {stat}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Findings List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : !filteredFindings || filteredFindings.length === 0 ? (
        <EmptyState
          icon={Search}
          title={searchQuery ? 'No findings found' : 'No findings yet'}
          description={
            searchQuery
              ? 'Try adjusting your search or filters'
              : 'Create your first finding to document issues'
          }
          action={
            !searchQuery && (
              <Button asChild>
                <Link to="/findings/new">
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  Create Finding
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredFindings.map((finding) => (
            <Card key={finding.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      {getSeverityIcon(finding.severity)}
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/findings/${finding.id}`}
                          className="font-semibold hover:underline block truncate"
                        >
                          {finding.title}
                        </Link>
                        <p className="text-sm text-muted-foreground truncate-2 mt-1">
                          {finding.description}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge className={CATEGORY_COLORS[finding.category]}>
                        {finding.category}
                      </Badge>
                      <Badge className={SEVERITY_COLORS[finding.severity]}>
                        {finding.severity}
                      </Badge>
                      <Badge variant="outline">Effort: {finding.effort}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Updated {formatRelativeTime(finding.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                    <Select
                      value={finding.status}
                      onChange={(e) => handleStatusChange(finding.id, e.target.value)}
                      className={`w-32 ${STATUS_COLORS[finding.status]}`}
                      aria-label={`Update status for ${finding.title}`}
                    >
                      {FINDING_STATUSES.map((stat) => (
                        <option key={stat} value={stat}>
                          {stat}
                        </option>
                      ))}
                    </Select>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/findings/${finding.id}`} aria-label="View finding">
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/findings/${finding.id}/edit`} aria-label="Edit finding">
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(finding.id)}
                        aria-label="Delete finding"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
