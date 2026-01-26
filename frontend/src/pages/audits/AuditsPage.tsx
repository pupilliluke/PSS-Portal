import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useAudits, useDeleteAudit } from '@/hooks/useAudits'
import { formatDate } from '@/lib/utils'
import { STATUS_COLORS, AUDIT_STATUSES } from '@/lib/constants'
import type { AuditStatus } from '@/api/types'

export function AuditsPage() {
  const [statusFilter, setStatusFilter] = useState<AuditStatus | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: audits, isLoading } = useAudits(statusFilter || undefined)
  const deleteAudit = useDeleteAudit()

  // Filter audits by search query
  const filteredAudits = audits?.filter((audit) =>
    audit.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this audit? This action cannot be undone.')) {
      await deleteAudit.mutateAsync(id)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audits</h2>
          <p className="text-muted-foreground">
            Manage your consulting audits
          </p>
        </div>
        <Button asChild>
          <Link to="/audits/new">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            New Audit
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search audits…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Search audits"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AuditStatus | '')}
                className="w-40"
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                {AUDIT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audits List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : !filteredAudits || filteredAudits.length === 0 ? (
        <EmptyState
          icon={Search}
          title={searchQuery ? 'No audits found' : 'No audits yet'}
          description={
            searchQuery
              ? 'Try adjusting your search or filters'
              : 'Create your first audit to get started'
          }
          action={
            !searchQuery && (
              <Button asChild>
                <Link to="/audits/new">
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  Create Audit
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAudits.map((audit) => (
            <Card key={audit.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="min-w-0 flex-1 pr-2">
                  <CardTitle className="text-base truncate">
                    <Link
                      to={`/audits/${audit.id}`}
                      className="hover:underline"
                    >
                      {audit.title}
                    </Link>
                  </CardTitle>
                </div>
                <Badge className={STATUS_COLORS[audit.status]}>
                  {audit.status}
                </Badge>
              </CardHeader>
              <CardContent>
                {audit.notes && (
                  <p className="text-sm text-muted-foreground truncate-2 mb-4">
                    {audit.notes}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Created {formatDate(audit.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/audits/${audit.id}`}>
                      <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
                      View
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/audits/${audit.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-1" aria-hidden="true" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(audit.id)}
                    disabled={deleteAudit.isPending && deleteId === audit.id}
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
