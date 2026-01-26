import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardCheck,
  Search,
  Activity,
  Paperclip,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Audits', href: '/app/audits', icon: ClipboardCheck },
  { name: 'Findings', href: '/app/findings', icon: Search },
  { name: 'Activity', href: '/app/activity', icon: Activity },
  { name: 'Attachments', href: '/app/attachments', icon: Paperclip },
]

const bottomNavigation = [
  { name: 'Settings', href: '/app/settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()
  const { sidebarCollapsed, setSidebarCollapsed, sidebarOpen, setSidebarOpen } = useUIStore()
  const { user, logout } = useAuthStore()

  const isActive = (href: string) => {
    if (href === '/app/dashboard') {
      return location.pathname === '/app/dashboard' || location.pathname === '/app'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo - Microsoft style header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-white/5">
          <NavLink to="/app/dashboard" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-semibold text-sm">
              PSS
            </div>
            {!sidebarCollapsed && (
              <span className="text-sm font-semibold tracking-tight">PSS Portal</span>
            )}
          </NavLink>

          {/* Collapse toggle - desktop only */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10 transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                sidebarCollapsed && 'rotate-180'
              )}
              aria-hidden="true"
            />
          </button>

          {/* Close button - mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation - Microsoft Fluent style */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded text-sm font-normal transition-all duration-100',
                isActive(item.href)
                  ? 'bg-sidebar-accent text-white font-medium'
                  : 'text-sidebar-foreground/80 hover:bg-white/8 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section - Microsoft style */}
        <div className="border-t border-white/5 px-3 py-3 space-y-0.5">
          {bottomNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded text-sm font-normal transition-all duration-100',
                isActive(item.href)
                  ? 'bg-sidebar-accent text-white font-medium'
                  : 'text-sidebar-foreground/80 hover:bg-white/8 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}

          {/* Logout button */}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded text-sm font-normal text-sidebar-foreground/80 hover:bg-white/8 hover:text-sidebar-foreground transition-all duration-100"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            {!sidebarCollapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* User profile - Microsoft style persona */}
        {user && (
          <div className="border-t border-white/5 p-3">
            <div className="flex items-center gap-3 px-1">
              <Avatar fallback={user.email} size="sm" />
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate text-sidebar-foreground">{user.email}</p>
                  <p className="text-xs text-sidebar-foreground/50 truncate">
                    Organization Admin
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 lg:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>
    </>
  )
}
