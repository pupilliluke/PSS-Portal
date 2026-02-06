import { Link } from 'react-router-dom'
import {
  Users,
  UserPlus,
  UserCheck,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock,
  Mail,
  Phone,
  Building2,
  DollarSign,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Fake lead data for demonstration
const fakeLeads = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '(555) 123-4567',
    company: 'TechCorp Industries',
    source: 'Website',
    status: 'Qualified',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'mchen@innovate.io',
    phone: '(555) 234-5678',
    company: 'Innovate.io',
    source: 'Referral',
    status: 'New',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.r@globalsoft.com',
    phone: '(555) 345-6789',
    company: 'GlobalSoft Solutions',
    source: 'GoogleSheets',
    status: 'Contacted',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'jwilson@enterprise.co',
    phone: '(555) 456-7890',
    company: 'Enterprise Co',
    source: 'Advertisement',
    status: 'New',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    firstName: 'Amanda',
    lastName: 'Taylor',
    email: 'ataylor@startup.xyz',
    phone: '(555) 567-8901',
    company: 'Startup XYZ',
    source: 'Website',
    status: 'Converted',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
]

const fakeActivity = [
  { id: '1', action: 'New lead added', user: 'You', lead: 'Sarah Johnson', time: '2 hours ago' },
  { id: '2', action: 'Status changed to Contacted', user: 'You', lead: 'Emily Rodriguez', time: '5 hours ago' },
  { id: '3', action: 'Note added', user: 'You', lead: 'Michael Chen', time: '1 day ago' },
  { id: '4', action: 'Lead converted', user: 'You', lead: 'Amanda Taylor', time: '2 days ago' },
  { id: '5', action: 'Imported 15 leads', user: 'System', lead: 'Google Sheets', time: '3 days ago' },
]

const STATUS_COLORS: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  Qualified: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  Converted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Lost: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
}

// Stats Card Component
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
              className={`h-3 w-3 ${trend.positive ? 'text-green-500' : 'text-red-500'}`}
              aria-hidden="true"
            />
            <span
              className={`text-xs ${trend.positive ? 'text-green-500' : 'text-red-500'}`}
            >
              {trend.positive ? '+' : ''}{trend.value}% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Recent Leads Component
function RecentLeads() {
  return (
    <div className="space-y-3">
      {fakeLeads.slice(0, 5).map((lead) => (
        <Link
          key={lead.id}
          to={`/app/leads/${lead.id}`}
          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {lead.firstName} {lead.lastName}
            </p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" aria-hidden="true" />
                {lead.company}
              </span>
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{lead.source}</span>
            </div>
          </div>
          <Badge className={STATUS_COLORS[lead.status]}>{lead.status}</Badge>
        </Link>
      ))}
    </div>
  )
}

// Recent Activity Component
function RecentActivity() {
  return (
    <div className="space-y-3">
      {fakeActivity.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="mt-1">
            <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm">
              <span className="font-medium">{activity.action}</span>{' '}
              <span className="text-muted-foreground">
                - {activity.lead}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {activity.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Leads by Status Component
function LeadsByStatus() {
  const statusCounts = {
    New: 12,
    Contacted: 8,
    Qualified: 5,
    Converted: 15,
    Lost: 3,
  }

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-4">
      {Object.entries(statusCounts).map(([status, count]) => (
        <div key={status} className="flex items-center gap-3">
          <div className="w-24 text-sm font-medium">{status}</div>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${
                status === 'Converted' ? 'bg-green-500' :
                status === 'Qualified' ? 'bg-purple-500' :
                status === 'Contacted' ? 'bg-yellow-500' :
                status === 'Lost' ? 'bg-gray-400' :
                'bg-blue-500'
              }`}
              style={{ width: `${(count / total) * 100}%` }}
            />
          </div>
          <div className="w-8 text-sm text-muted-foreground text-right">{count}</div>
        </div>
      ))}
    </div>
  )
}

// Leads by Source Component
function LeadsBySource() {
  const sourceCounts = [
    { source: 'Website', count: 18, icon: '🌐' },
    { source: 'Referral', count: 12, icon: '🤝' },
    { source: 'Google Sheets', count: 8, icon: '📊' },
    { source: 'Advertisement', count: 5, icon: '📢' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {sourceCounts.map(({ source, count, icon }) => (
        <div
          key={source}
          className="flex items-center gap-3 p-3 rounded-lg border bg-card"
        >
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="text-2xl font-semibold">{count}</p>
            <p className="text-sm text-muted-foreground">{source}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your leads and sales pipeline
          </p>
        </div>
        <Button asChild>
          <Link to="/app/leads/new">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            New Lead
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={43}
          description="12 this month"
          icon={Users}
          trend={{ value: 23, positive: true }}
        />
        <StatsCard
          title="New Leads"
          value={12}
          description="Awaiting contact"
          icon={UserPlus}
          trend={{ value: 15, positive: true }}
        />
        <StatsCard
          title="Converted"
          value={15}
          description="35% conversion rate"
          icon={UserCheck}
          trend={{ value: 8, positive: true }}
        />
        <StatsCard
          title="Pipeline Value"
          value="$127K"
          description="Estimated revenue"
          icon={DollarSign}
          trend={{ value: 12, positive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>Your latest lead activities</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/leads">
                View all
                <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <RecentLeads />
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest changes to your leads</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/activity">
                View all
                <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>

        {/* Leads by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Status</CardTitle>
            <CardDescription>Pipeline breakdown by status</CardDescription>
          </CardHeader>
          <CardContent>
            <LeadsByStatus />
          </CardContent>
        </Card>

        {/* Leads by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Source</CardTitle>
            <CardDescription>Where your leads are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <LeadsBySource />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
