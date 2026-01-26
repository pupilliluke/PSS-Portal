import { useLocation } from 'react-router-dom'
import { Bell, Search, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/audits': 'Audits',
  '/app/findings': 'Findings',
  '/app/activity': 'Activity Log',
  '/app/attachments': 'Attachments',
  '/app/settings': 'Settings',
}

export function Navbar() {
  const location = useLocation()
  const { theme, setTheme, sidebarCollapsed } = useUIStore()

  // Get page title from current path
  const getPageTitle = () => {
    // Check for exact match first
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname]
    }
    // Check for partial match (e.g., /audits/123)
    for (const [path, title] of Object.entries(pageTitles)) {
      if (location.pathname.startsWith(path) && path !== '/') {
        return title
      }
    }
    return 'Dashboard'
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-12 items-center justify-between border-b bg-background px-4 transition-all',
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-68'
      )}
    >
      {/* Breadcrumb / Page title - Microsoft style */}
      <div className="flex items-center gap-2 pl-12 lg:pl-0">
        <span className="text-sm text-muted-foreground">PSS Portal</span>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-sm font-medium text-foreground">
          {getPageTitle()}
        </span>
      </div>

      {/* Actions - Microsoft style compact */}
      <div className="flex items-center gap-1">
        {/* Search - hidden on mobile */}
        <div className="hidden md:flex relative">
          <Search
            className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search..."
            className="w-56 h-8 pl-8 text-sm bg-secondary/50 border-0 focus-visible:ring-1"
            aria-label="Search"
          />
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Notifications">
          <Bell className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </header>
  )
}
