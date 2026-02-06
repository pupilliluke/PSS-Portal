import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Filter,
  Mail,
  Phone,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useLeads, useDeleteLead } from '@/hooks/useLeads'
import { formatDate } from '@/lib/utils'
import type { LeadStatus, LeadSource } from '@/api/types'

const LEAD_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost']
const LEAD_SOURCES: LeadSource[] = ['Website', 'Referral', 'GoogleSheets', 'Manual', 'Advertisement', 'Other']

const STATUS_COLORS: Record<LeadStatus, string> = {
  New: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  Qualified: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  Converted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Lost: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
}

export function LeadsPage() {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('')
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: leads, isLoading } = useLeads({
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
    search: searchQuery || undefined,
  })
  const deleteLead = useDeleteLead()

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      await deleteLead.mutateAsync(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
          <p className="text-muted-foreground">
            Manage your sales leads and prospects
          </p>
        </div>
        <Button asChild>
          <Link to="/app/leads/new">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            New Lead
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
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Search leads"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
                className="w-36"
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                {LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
              <Select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as LeadSource | '')}
                className="w-36"
                aria-label="Filter by source"
              >
                <option value="">All sources</option>
                {LEAD_SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : !leads || leads.length === 0 ? (
        <EmptyState
          icon={Search}
          title={searchQuery ? 'No leads found' : 'No leads yet'}
          description={
            searchQuery
              ? 'Try adjusting your search or filters'
              : 'Create your first lead to get started'
          }
          action={
            !searchQuery && (
              <Button asChild>
                <Link to="/app/leads/new">
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  Create Lead
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="min-w-0 flex-1 pr-2">
                  <CardTitle className="text-base">
                    {lead.firstName} {lead.lastName}
                  </CardTitle>
                  {lead.company && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Building2 className="h-3 w-3" aria-hidden="true" />
                      {lead.company}
                    </p>
                  )}
                </div>
                <Badge className={STATUS_COLORS[lead.status]}>
                  {lead.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <p className="flex items-center gap-2">
                    <Mail className="h-3 w-3" aria-hidden="true" />
                    {lead.email}
                  </p>
                  {lead.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3 w-3" aria-hidden="true" />
                      {lead.phone}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">{lead.source}</span>
                  <span>Added {formatDate(lead.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/app/leads/${lead.id}`}>
                      <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
                      View
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/app/leads/${lead.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-1" aria-hidden="true" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(lead.id)}
                    disabled={deleteLead.isPending}
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
