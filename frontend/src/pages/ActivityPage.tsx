import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity as ActivityIcon,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Filter,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useActivity } from '@/hooks/useActivity'
import { formatRelativeTime, formatDateTime } from '@/lib/utils'
import type { EntityType, ActivityAction } from '@/api/types'

const entityTypes: EntityType[] = ['Audit', 'Finding', 'Attachment']

export function ActivityPage() {
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityType | ''>('')
  const [limit, setLimit] = useState(50)

  const { data: activities, isLoading } = useActivity({
    entityType: entityTypeFilter || undefined,
    limit,
  })

  const getActionIcon = (action: ActivityAction) => {
    switch (action) {
      case 'Created':
        return <Plus className="h-4 w-4 text-green-500" aria-hidden="true" />
      case 'Updated':
        return <Pencil className="h-4 w-4 text-blue-500" aria-hidden="true" />
      case 'StatusChanged':
        return <Clock className="h-4 w-4 text-yellow-500" aria-hidden="true" />
      case 'Deleted':
        return <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    }
  }

  const getActionText = (action: ActivityAction) => {
    switch (action) {
      case 'Created':
        return 'created'
      case 'Updated':
        return 'updated'
      case 'StatusChanged':
        return 'changed status of'
      case 'Deleted':
        return 'deleted'
      default:
        return String(action).toLowerCase()
    }
  }

  const getEntityLink = (entityType: EntityType, entityId: string) => {
    switch (entityType) {
      case 'Audit':
        return `/audits/${entityId}`
      case 'Finding':
        return `/findings/${entityId}`
      case 'Attachment':
        return `/attachments`
      default:
        return '#'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Activity Log</h2>
        <p className="text-muted-foreground">
          Track all changes across your organization
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Select
                value={entityTypeFilter}
                onChange={(e) => setEntityTypeFilter(e.target.value as EntityType | '')}
                className="w-40"
                aria-label="Filter by entity type"
              >
                <option value="">All types</option>
                {entityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}s
                  </option>
                ))}
              </Select>
            </div>

            <Select
              value={limit.toString()}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="w-32"
              aria-label="Number of results"
            >
              <option value="25">Last 25</option>
              <option value="50">Last 50</option>
              <option value="100">Last 100</option>
              <option value="200">Last 200</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : !activities || activities.length === 0 ? (
        <EmptyState
          icon={ActivityIcon}
          title="No activity yet"
          description="Activity will be recorded as changes are made to audits, findings, and attachments"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                      {getActionIcon(activity.action)}
                    </div>
                    {index < activities.length - 1 && (
                      <div className="w-px h-full bg-border mt-2" aria-hidden="true" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{activity.userEmail}</span>{' '}
                          <span className="text-muted-foreground">
                            {getActionText(activity.action)} a{' '}
                            {activity.entityType.toLowerCase()}
                          </span>
                        </p>
                        <p
                          className="text-xs text-muted-foreground mt-1"
                          title={formatDateTime(activity.timestamp)}
                        >
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>

                      {activity.action !== 'Deleted' && (
                        <Link
                          to={getEntityLink(activity.entityType, activity.entityId)}
                          className="text-primary hover:underline text-sm flex items-center gap-1 shrink-0"
                        >
                          View
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
