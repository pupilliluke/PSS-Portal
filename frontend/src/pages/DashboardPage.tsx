import { Link } from 'react-router-dom'
import {
  ClipboardCheck,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useAudits } from '@/hooks/useAudits'
import { useFindings } from '@/hooks/useFindings'
import { useActivity } from '@/hooks/useActivity'
import { formatRelativeTime } from '@/lib/utils'
import { STATUS_COLORS, SEVERITY_COLORS } from '@/lib/constants'
import type { Audit, Finding, ActivityLog } from '@/api/types'

// Stats Card Component - Microsoft Fluent style
function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  trend?: { value: number; positive: boolean }
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
          <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tabular-nums text-foreground">{value}</div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp
              className={`h-3 w-3 ${trend.positive ? 'text-success' : 'text-destructive'}`}
              aria-hidden="true"
            />
            <span
              className={`text-xs ${trend.positive ? 'text-success' : 'text-destructive'}`}
            >
              {trend.positive ? '+' : ''}{trend.value}% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Recent Audits Component
function RecentAudits({ audits, isLoading }: { audits?: Audit[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (!audits || audits.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="No audits yet"
        description="Create your first audit to get started"
        action={
          <Button asChild size="sm">
            <Link to="/audits/new">
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              Create Audit
            </Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-3">
      {audits.slice(0, 5).map((audit) => (
        <Link
          key={audit.id}
          to={`/audits/${audit.id}`}
          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{audit.title}</p>
            <p className="text-sm text-muted-foreground">
              {formatRelativeTime(audit.updatedAt)}
            </p>
          </div>
          <Badge className={STATUS_COLORS[audit.status]}>{audit.status}</Badge>
        </Link>
      ))}
    </div>
  )
}

// Recent Activity Component
function RecentActivity({ activities, isLoading }: { activities?: ActivityLog[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No activity yet"
        description="Activity will appear here as you make changes"
      />
    )
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Created':
        return <Plus className="h-4 w-4 text-green-500" aria-hidden="true" />
      case 'Updated':
      case 'StatusChanged':
        return <Clock className="h-4 w-4 text-blue-500" aria-hidden="true" />
      case 'Deleted':
        return <AlertTriangle className="h-4 w-4 text-red-500" aria-hidden="true" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    }
  }

  return (
    <div className="space-y-3">
      {activities.slice(0, 10).map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="mt-1">{getActionIcon(activity.action)}</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm">
              <span className="font-medium">{activity.userEmail}</span>{' '}
              <span className="text-muted-foreground">
                {activity.action.toLowerCase()} a {activity.entityType.toLowerCase()}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(activity.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Findings Summary Component
function FindingsSummary({ findings, isLoading }: { findings?: Finding[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (!findings || findings.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No findings yet"
        description="Findings will appear here once you create audits"
      />
    )
  }

  // Group by severity
  const bySeverity = findings.reduce(
    (acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Group by status
  const byStatus = findings.reduce(
    (acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="space-y-4">
      {/* By Severity */}
      <div>
        <h4 className="text-sm font-medium mb-2">By Severity</h4>
        <div className="flex gap-2 flex-wrap">
          {['High', 'Medium', 'Low'].map((severity) => (
            <Badge
              key={severity}
              className={SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS]}
            >
              {severity}: {bySeverity[severity] || 0}
            </Badge>
          ))}
        </div>
      </div>

      {/* By Status */}
      <div>
        <h4 className="text-sm font-medium mb-2">By Status</h4>
        <div className="flex gap-2 flex-wrap">
          {['Identified', 'InProgress', 'Resolved'].map((status) => (
            <Badge
              key={status}
              className={STATUS_COLORS[status as keyof typeof STATUS_COLORS]}
            >
              {status}: {byStatus[status] || 0}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { data: audits, isLoading: auditsLoading } = useAudits()
  const { data: findings, isLoading: findingsLoading } = useFindings()
  const { data: activities, isLoading: activitiesLoading } = useActivity({ limit: 10 })

  // Calculate stats
  const totalAudits = audits?.length || 0
  const activeAudits = audits?.filter((a) => a.status === 'InProgress' || a.status === 'InReview').length || 0
  const totalFindings = findings?.length || 0
  const resolvedFindings = findings?.filter((f) => f.status === 'Resolved').length || 0
  const highSeverity = findings?.filter((f) => f.severity === 'High' && f.status !== 'Resolved').length || 0

  return (
    <div className="space-y-6">
      {/* Header - Microsoft style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your consulting audits and findings
          </p>
        </div>
        <Button asChild>
          <Link to="/audits/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Audit
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Audits"
          value={auditsLoading ? '—' : totalAudits}
          description={`${activeAudits} active`}
          icon={ClipboardCheck}
        />
        <StatsCard
          title="Total Findings"
          value={findingsLoading ? '—' : totalFindings}
          description={`${resolvedFindings} resolved`}
          icon={Search}
        />
        <StatsCard
          title="High Priority"
          value={findingsLoading ? '—' : highSeverity}
          description="Unresolved findings"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Resolution Rate"
          value={
            findingsLoading || totalFindings === 0
              ? '—'
              : `${Math.round((resolvedFindings / totalFindings) * 100)}%`
          }
          description="Findings resolved"
          icon={CheckCircle2}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Audits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Audits</CardTitle>
              <CardDescription>Your latest audit activities</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/audits">
                View all
                <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <RecentAudits audits={audits} isLoading={auditsLoading} />
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest changes across your organization</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/activity">
                View all
                <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <RecentActivity activities={activities} isLoading={activitiesLoading} />
          </CardContent>
        </Card>

        {/* Findings Overview */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Findings Overview</CardTitle>
              <CardDescription>Summary of all findings by severity and status</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/findings">
                View all
                <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <FindingsSummary findings={findings} isLoading={findingsLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
