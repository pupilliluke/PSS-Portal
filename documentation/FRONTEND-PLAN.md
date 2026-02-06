# PSS Portal Frontend Plan

**Date**: January 26, 2026
**Status**: Planning
**Goal**: Build a comprehensive, production-ready frontend to test and interact with the PSS Portal API

---

## Executive Summary

This plan outlines the development of a modern React-based frontend for the PSS Portal. The frontend will provide a complete UI for all 23 API endpoints, incorporating industry-standard practices for authentication, state management, testing, and deployment.

---

## Technology Stack (Industry Standards)

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI framework (component-based architecture) |
| **TypeScript** | 5.x | Type safety, better DX, fewer runtime errors |
| **Vite** | 5.x | Build tool (fast HMR, optimized builds) |

### State & Data Management
| Technology | Purpose |
|------------|---------|
| **TanStack Query (React Query)** | Server state management, caching, background sync |
| **Zustand** | Client state management (auth, UI state) |
| **React Hook Form** | Form handling with validation |
| **Zod** | Schema validation (pairs with TypeScript) |

### UI & Styling
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | Accessible, customizable component library |
| **Lucide React** | Icon library |
| **Framer Motion** | Animations (optional) |

### Routing & Navigation
| Technology | Purpose |
|------------|---------|
| **React Router v6** | Client-side routing with data loaders |

### Testing
| Technology | Purpose |
|------------|---------|
| **Vitest** | Unit testing (Vite-native) |
| **React Testing Library** | Component testing |
| **Playwright** | E2E testing |
| **MSW (Mock Service Worker)** | API mocking for tests |

### Developer Experience
| Technology | Purpose |
|------------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Husky** | Git hooks (pre-commit checks) |
| **lint-staged** | Run linters on staged files |

---

## Project Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                          # API layer
│   │   ├── client.ts                 # Axios/fetch instance with interceptors
│   │   ├── endpoints/
│   │   │   ├── auth.ts               # Auth API calls
│   │   │   ├── audits.ts             # Audits API calls
│   │   │   ├── findings.ts           # Findings API calls
│   │   │   ├── activity.ts           # Activity logs API calls
│   │   │   └── attachments.ts        # Attachments API calls
│   │   └── types.ts                  # API response types (generated from Swagger)
│   │
│   ├── components/                   # Reusable UI components
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx         # Main app layout with sidebar
│   │   │   ├── Navbar.tsx            # Top navigation bar
│   │   │   ├── Sidebar.tsx           # Side navigation
│   │   │   └── Footer.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── audits/
│   │   │   ├── AuditCard.tsx
│   │   │   ├── AuditList.tsx
│   │   │   ├── AuditForm.tsx
│   │   │   ├── AuditDetail.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── findings/
│   │   │   ├── FindingCard.tsx
│   │   │   ├── FindingList.tsx
│   │   │   ├── FindingForm.tsx
│   │   │   ├── FindingDetail.tsx
│   │   │   ├── SeverityBadge.tsx
│   │   │   └── CategoryFilter.tsx
│   │   ├── activity/
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── ActivityItem.tsx
│   │   └── attachments/
│   │       ├── FileUpload.tsx
│   │       ├── FileList.tsx
│   │       └── FilePreview.tsx
│   │
│   ├── features/                     # Feature-based modules
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── RecentActivity.tsx
│   │   ├── audits/
│   │   │   ├── AuditsPage.tsx
│   │   │   ├── AuditDetailPage.tsx
│   │   │   └── CreateAuditPage.tsx
│   │   ├── findings/
│   │   │   ├── FindingsPage.tsx
│   │   │   └── FindingDetailPage.tsx
│   │   └── settings/
│   │       └── SettingsPage.tsx
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts                # Auth state hook
│   │   ├── useAudits.ts              # TanStack Query hooks for audits
│   │   ├── useFindings.ts            # TanStack Query hooks for findings
│   │   ├── useActivity.ts            # Activity log hooks
│   │   ├── useAttachments.ts         # File management hooks
│   │   └── useDebounce.ts            # Utility hooks
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── authStore.ts              # Auth state (tokens, user)
│   │   └── uiStore.ts                # UI state (sidebar, theme)
│   │
│   ├── lib/                          # Utilities
│   │   ├── utils.ts                  # Helper functions (cn, formatDate)
│   │   ├── constants.ts              # App constants
│   │   └── validators.ts             # Zod schemas
│   │
│   ├── routes/                       # Route definitions
│   │   ├── index.tsx                 # Route configuration
│   │   └── guards.tsx                # Route guards
│   │
│   ├── styles/
│   │   └── globals.css               # Global styles + Tailwind
│   │
│   ├── App.tsx                       # Root component
│   ├── main.tsx                      # Entry point
│   └── vite-env.d.ts                 # Vite types
│
├── tests/
│   ├── unit/                         # Unit tests
│   ├── integration/                  # Integration tests
│   └── e2e/                          # Playwright E2E tests
│
├── .env.development                  # Dev environment variables
├── .env.production                   # Prod environment variables
├── .eslintrc.cjs                     # ESLint config
├── .prettierrc                       # Prettier config
├── tailwind.config.js                # Tailwind config
├── tsconfig.json                     # TypeScript config
├── vite.config.ts                    # Vite config
├── playwright.config.ts              # Playwright config
└── package.json
```

---

## Implementation Phases

### Phase 1: Project Setup & Core Infrastructure (Day 1)

#### 1.1 Initialize Project
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

#### 1.2 Install Dependencies
```bash
# Core
npm install react-router-dom @tanstack/react-query zustand

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# UI
npm install tailwindcss postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast
# (shadcn/ui components added via CLI)

# HTTP Client
npm install axios

# Dev Dependencies
npm install -D @types/node vitest @testing-library/react @testing-library/jest-dom
npm install -D eslint prettier eslint-plugin-react-hooks
npm install -D husky lint-staged
npm install -D playwright @playwright/test
npm install -D msw
```

#### 1.3 Configure Tailwind & shadcn/ui
```bash
npx tailwindcss init -p
npx shadcn@latest init
```

#### 1.4 Set Up API Client
- Create axios instance with base URL configuration
- Implement request interceptor for JWT tokens
- Implement response interceptor for token refresh (401 handling)
- Set up error handling middleware

#### 1.5 Configure Environment
```env
# .env.development
VITE_API_URL=http://localhost:5062/api

# .env.production
VITE_API_URL=https://pss-portal-api.onrender.com/api
```

---

### Phase 2: Authentication System (Day 1-2)

#### 2.1 Auth Store (Zustand)
```typescript
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { email: string; organizationId: string } | null;
  isAuthenticated: boolean;
  login: (tokens: AuthResponse) => void;
  logout: () => void;
  refreshTokens: (tokens: AuthResponse) => void;
}
```

#### 2.2 Auth Components
| Component | Description |
|-----------|-------------|
| `LoginForm` | Email/password form with validation |
| `RegisterForm` | Registration with organization name |
| `ProtectedRoute` | Route wrapper that redirects if not authenticated |
| `AuthProvider` | Context provider for auth state |

#### 2.3 Token Management
- Store tokens in memory (Zustand) + localStorage for persistence
- Auto-refresh tokens before expiry (background refresh)
- Clear tokens on logout
- Handle 401 responses globally

#### 2.4 Auth Pages
- `/login` - Login page
- `/register` - Registration page
- `/logout` - Logout handler (redirect to login)

---

### Phase 3: Core Layout & Navigation (Day 2)

#### 3.1 App Layout
- Responsive sidebar navigation
- Top navbar with user menu
- Breadcrumb navigation
- Mobile-responsive hamburger menu

#### 3.2 Navigation Structure
```
Dashboard
├── Overview (leads stats, pipeline, recent activity)
│
Leads (NEW - Primary CRM module)
├── All Leads (list with filters)
├── Create Lead
└── Lead Detail
    ├── Contact Info
    ├── Activity Timeline
    └── Notes
│
Audits (Legacy)
├── All Audits (list with filters)
├── Create Audit
└── Audit Detail
    ├── Overview
    ├── Findings (nested)
    ├── Attachments
    └── Activity Log
│
Findings (Legacy)
├── All Findings (global view with filters)
└── Finding Detail
│
Activity
├── Activity Log (filterable)
│
Settings
├── Billing (Stripe integration)
└── Profile
```

#### 3.3 Route Configuration
```typescript
const routes = [
  { path: '/', element: <Navigate to="/dashboard" /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'audits', element: <AuditsPage /> },
      { path: 'audits/new', element: <CreateAuditPage /> },
      { path: 'audits/:id', element: <AuditDetailPage /> },
      { path: 'findings', element: <FindingsPage /> },
      { path: 'findings/:id', element: <FindingDetailPage /> },
      { path: 'activity', element: <ActivityPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
];
```

---

### Phase 4: Dashboard & Overview (Day 2-3)

#### 4.1 Dashboard Components
| Component | Data Source | Description |
|-----------|-------------|-------------|
| `StatsCard` | Computed | Total audits, findings by status |
| `RecentAudits` | GET /audits | Last 5 audits |
| `RecentActivity` | GET /activity | Last 10 activities |
| `FindingsByStatus` | GET /findings | Pie chart of statuses |
| `FindingsBySeverity` | GET /findings | Bar chart by severity |

#### 4.2 Stats Calculations
- Total audits (by status)
- Total findings (by severity, status)
- Resolved vs pending findings
- Recent activity count

---

### Phase 5: Audits Module (Day 3-4)

#### 5.1 Audits List Page
| Feature | Implementation |
|---------|----------------|
| List view | Card or table layout |
| Filtering | By status (Draft, InReview, Delivered, InProgress, Closed) |
| Sorting | By date, title |
| Pagination | Client-side with TanStack Query |
| Search | Client-side filter by title |

#### 5.2 Create/Edit Audit
| Field | Type | Validation |
|-------|------|------------|
| Title | Text input | Required, max 200 chars |
| Notes | Textarea | Optional, max 2000 chars |
| Status | Dropdown | Required (default: Draft) |

#### 5.3 Audit Detail Page
| Section | Description |
|---------|-------------|
| Header | Title, status badge, actions (edit, delete) |
| Info | Created date, auditor, notes |
| Findings | List of findings with create button |
| Attachments | File list with upload |
| Activity | Activity log for this audit |

#### 5.4 TanStack Query Hooks
```typescript
// useAudits.ts
export const useAudits = (status?: string) =>
  useQuery(['audits', status], () => api.audits.list(status));

export const useAudit = (id: string) =>
  useQuery(['audit', id], () => api.audits.get(id));

export const useCreateAudit = () =>
  useMutation(api.audits.create, {
    onSuccess: () => queryClient.invalidateQueries(['audits'])
  });

export const useUpdateAudit = () =>
  useMutation(api.audits.update, {
    onSuccess: (_, { id }) => queryClient.invalidateQueries(['audit', id])
  });

export const useDeleteAudit = () =>
  useMutation(api.audits.delete, {
    onSuccess: () => queryClient.invalidateQueries(['audits'])
  });
```

---

### Phase 5.5: Leads Module (IMPLEMENTED)

#### 5.5.1 Leads List Page
| Feature | Implementation |
|---------|----------------|
| List view | Card layout with contact info |
| Filtering | By status, source, search |
| Sorting | By date |
| Search | Full-text search on name/email/company |

#### 5.5.2 Lead Statuses
| Status | Color | Description |
|--------|-------|-------------|
| New | Blue | Fresh lead, not contacted |
| Contacted | Yellow | Initial contact made |
| Qualified | Purple | Lead qualified as opportunity |
| Converted | Green | Converted to customer |
| Lost | Gray | Lead lost/disqualified |

#### 5.5.3 Lead Sources
- Website
- Referral
- GoogleSheets (imported)
- Manual
- Advertisement
- Other

#### 5.5.4 Create/Edit Lead
| Field | Type | Validation |
|-------|------|------------|
| First Name | Text | Required |
| Last Name | Text | Required |
| Email | Email | Required, valid email |
| Phone | Text | Optional |
| Company | Text | Optional |
| Source | Dropdown | Required |
| Notes | Textarea | Optional |

#### 5.5.5 TanStack Query Hooks
```typescript
// useLeads.ts
export const useLeads = (filters?: LeadsFilters) =>
  useQuery(['leads', filters], () => leadsApi.list(filters));

export const useLead = (id: string) =>
  useQuery(['lead', id], () => leadsApi.get(id));

export const useCreateLead = () =>
  useMutation(leadsApi.create, {
    onSuccess: () => queryClient.invalidateQueries(['leads'])
  });

export const useUpdateLead = () =>
  useMutation(leadsApi.update, {
    onSuccess: () => queryClient.invalidateQueries(['leads'])
  });

export const useDeleteLead = () =>
  useMutation(leadsApi.delete, {
    onSuccess: () => queryClient.invalidateQueries(['leads'])
  });
```

#### 5.5.6 Dashboard Integration
The dashboard displays leads-focused metrics:
- Total Leads count with trend
- New Leads awaiting contact
- Conversion rate
- Pipeline value estimate
- Recent leads list
- Leads by status (progress bars)
- Leads by source (icons)

---

### Phase 6: Findings Module (Day 4-5)

#### 6.1 Findings List Page
| Feature | Implementation |
|---------|----------------|
| List view | Table with row actions |
| Filters | Category, Severity, Status, Audit |
| Multi-filter | Combine multiple filters |
| Quick status update | Inline status dropdown |

#### 6.2 Create/Edit Finding
| Field | Type | Validation |
|-------|------|------------|
| Audit | Dropdown | Required |
| Category | Dropdown | Automation, Data, Marketing, Security, Ops |
| Severity | Dropdown | Low, Medium, High |
| Effort | Dropdown | S, M, L |
| Title | Text | Required, max 200 |
| Description | Textarea | Required, max 2000 |
| Recommendation | Textarea | Required, max 2000 |
| ROI Estimate | Text | Optional, max 500 |

#### 6.3 Finding Detail Page
| Section | Description |
|---------|-------------|
| Header | Title, severity/category badges |
| Details | Full description, recommendation |
| Metadata | Created, updated, audit link |
| Status | Status update with timeline |

#### 6.4 Visual Elements
- Severity badges (color-coded: green/yellow/red)
- Category icons
- Status progression indicator
- Effort estimation badge

---

### Phase 7: Activity & Attachments (Day 5-6)

#### 7.1 Activity Feed
| Feature | Implementation |
|---------|----------------|
| Timeline view | Chronological list with icons |
| Filters | Entity type, date range |
| Action icons | Different icons for Create/Update/Delete |
| User display | Show who performed action |
| Entity links | Click to navigate to entity |

#### 7.2 File Management
| Feature | Implementation |
|---------|----------------|
| Upload | Drag-and-drop zone + file picker |
| Progress | Upload progress indicator |
| Preview | Image thumbnails, PDF icon |
| Download | Direct download button |
| Delete | Confirmation dialog |
| Validation | File size (10MB), allowed types |

#### 7.3 Allowed File Types UI
```typescript
const ALLOWED_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/vnd.openxmlformats-officedocument.*'],
  data: ['text/csv', 'text/plain'],
};
```

---

### Phase 8: Forms & Validation (Throughout)

#### 8.1 Form Schema (Zod)
```typescript
// validators.ts
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const auditSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  notes: z.string().max(2000).optional(),
});

export const findingSchema = z.object({
  auditId: z.string().uuid('Select an audit'),
  category: z.enum(['Automation', 'Data', 'Marketing', 'Security', 'Ops']),
  severity: z.enum(['Low', 'Medium', 'High']),
  effort: z.enum(['S', 'M', 'L']),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  recommendation: z.string().min(1).max(2000),
  roiEstimate: z.string().max(500).optional(),
});
```

#### 8.2 Form Components
- Consistent error display
- Loading states during submission
- Success/error toasts
- Optimistic updates where appropriate

---

### Phase 9: Error Handling & UX (Day 6)

#### 9.1 Error Boundaries
- Global error boundary for uncaught errors
- Feature-level error boundaries
- Fallback UI with retry button

#### 9.2 Loading States
- Skeleton loaders for lists
- Spinner for actions
- Optimistic UI updates

#### 9.3 Toast Notifications
| Type | Use Case |
|------|----------|
| Success | Created, updated, deleted |
| Error | API errors, validation errors |
| Info | Background sync, refresh |
| Warning | Destructive action confirmation |

#### 9.4 Empty States
- No audits: "Create your first audit"
- No findings: "Add findings to this audit"
- No activity: "No activity yet"

#### 9.5 Confirmation Dialogs
- Delete audit
- Delete finding
- Delete attachment
- Logout

---

### Phase 10: Testing Strategy (Day 6-7)

#### 10.1 Unit Tests (Vitest)
| Target | Tests |
|--------|-------|
| Utils | formatDate, cn helper |
| Validators | Zod schema validation |
| Stores | Auth store actions |
| Hooks | Custom hook logic |

#### 10.2 Component Tests (React Testing Library)
| Component | Tests |
|-----------|-------|
| LoginForm | Validation, submission, error display |
| AuditCard | Render, click handlers |
| StatusBadge | Correct colors per status |
| FileUpload | File selection, size validation |

#### 10.3 E2E Tests (Playwright)
| Flow | Tests |
|------|-------|
| Auth | Register, login, logout, token refresh |
| Audits | Create, view, edit, delete audit |
| Findings | Create, filter, status update |
| Files | Upload, download, delete |

#### 10.4 API Mocking (MSW)
```typescript
// mocks/handlers.ts
export const handlers = [
  http.post('/api/auth/login', () => {
    return HttpResponse.json({ accessToken: '...', refreshToken: '...' });
  }),
  http.get('/api/audits', () => {
    return HttpResponse.json([mockAudit1, mockAudit2]);
  }),
];
```

---

### Phase 11: Performance & Optimization (Day 7)

#### 11.1 Code Splitting
```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
const AuditsPage = lazy(() => import('./features/audits/AuditsPage'));
```

#### 11.2 Query Optimization
- Stale time configuration
- Background refetching
- Query deduplication
- Prefetching on hover

#### 11.3 Bundle Optimization
- Tree shaking
- Dynamic imports
- Image optimization
- Gzip compression

---

### Phase 12: Deployment (Day 7)

#### 12.1 Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
});
```

#### 12.2 Deployment Options
| Platform | Configuration |
|----------|---------------|
| **Vercel** | Zero-config React deployment |
| **Netlify** | `netlify.toml` with SPA redirects |
| **Render** | Static site with build command |
| **GitHub Pages** | CI/CD with GitHub Actions |

#### 12.3 Environment Variables
- Production API URL
- Feature flags (if needed)
- Analytics keys (if needed)

---

## UI/UX Design Guidelines

### Color Palette (Tailwind)
```css
/* Status Colors */
--status-draft: gray-400
--status-inreview: blue-500
--status-inprogress: yellow-500
--status-delivered: green-500
--status-closed: gray-600

/* Severity Colors */
--severity-low: green-500
--severity-medium: yellow-500
--severity-high: red-500

/* Category Colors */
--category-automation: purple-500
--category-data: blue-500
--category-marketing: pink-500
--category-security: red-500
--category-ops: orange-500
```

### Typography
- Headings: Inter (sans-serif)
- Body: Inter (sans-serif)
- Code: JetBrains Mono (monospace)

### Responsive Breakpoints
| Breakpoint | Size | Layout |
|------------|------|--------|
| Mobile | <640px | Single column, bottom nav |
| Tablet | 640-1024px | Collapsed sidebar |
| Desktop | >1024px | Full sidebar |

---

## API Integration Summary

### Endpoints to Implement

| Module | Endpoints | Priority |
|--------|-----------|----------|
| Auth | 4 (register, login, refresh, logout) | P0 |
| Audits | 6 (CRUD + status) | P0 |
| Findings | 6 (CRUD + status) | P0 |
| Activity | 2 (list, by-audit) | P1 |
| Attachments | 4 (upload, list, download, delete) | P1 |
| Health | 1 | P2 |

### Type Generation
Consider using `openapi-typescript` to generate types from Swagger:
```bash
npx openapi-typescript https://pss-portal-api.onrender.com/swagger/v1/swagger.json -o src/api/types.ts
```

---

## Definition of Done

### Phase Checklist
- [ ] Project initialized with all dependencies
- [ ] Auth flow complete (register, login, logout, refresh)
- [ ] Protected routes working
- [ ] Dashboard with stats
- [ ] Audits CRUD working
- [ ] Findings CRUD working
- [ ] Activity log displaying
- [ ] File upload/download working
- [ ] Form validation working
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Toast notifications working
- [ ] Responsive design complete
- [ ] Unit tests passing
- [ ] E2E tests passing
- [ ] Production build working
- [ ] Deployed to production

### Quality Metrics
| Metric | Target |
|--------|--------|
| Lighthouse Performance | >90 |
| Lighthouse Accessibility | >95 |
| Type Coverage | 100% |
| Test Coverage | >80% |
| Bundle Size | <500KB gzipped |

---

## Skills Integration (Active)

Two Vercel skills are installed and will be actively used during development:

### 1. `vercel-react-best-practices` (57 Rules)
Applied during code writing and review for performance optimization:

| Priority | Category | When Applied |
|----------|----------|--------------|
| CRITICAL | Async/Waterfalls | Data fetching, API calls |
| CRITICAL | Bundle Size | Imports, dynamic loading, code splitting |
| HIGH | Server Performance | RSC patterns (if using Next.js) |
| MEDIUM-HIGH | Client Data | SWR/TanStack Query patterns |
| MEDIUM | Re-renders | State management, memo, callbacks |
| MEDIUM | Rendering | JSX optimization, hydration |
| LOW-MEDIUM | JavaScript | Loops, lookups, caching |

**Key Rules to Apply:**
- `bundle-barrel-imports` - Import directly from component files
- `async-parallel` - Use Promise.all for independent fetches
- `rerender-functional-setstate` - Stable callbacks in Zustand
- `rerender-derived-state` - Compute in render, not effects
- `client-swr-dedup` - TanStack Query deduplication
- `bundle-dynamic-imports` - Lazy load heavy components

### 2. `web-design-guidelines`
Applied during UI review for accessibility and UX compliance:
- Use `/web-design-guidelines <file>` to audit components
- Checks against Web Interface Guidelines
- Outputs findings in `file:line` format

### Skill Usage in Workflow

| Phase | Skill | Usage |
|-------|-------|-------|
| Component Creation | react-best-practices | Follow patterns during coding |
| Code Review | react-best-practices | Run `/vercel-react-best-practices` on PRs |
| UI Review | web-design-guidelines | Run `/web-design-guidelines src/components/` |
| Refactoring | Both | Apply rules to optimize existing code |

### Example Skill Commands
```bash
# Review a component for React best practices
/vercel-react-best-practices src/components/audits/AuditList.tsx

# Audit UI for accessibility
/web-design-guidelines src/features/dashboard/
```

---

## Timeline Summary

| Day | Phase | Deliverables |
|-----|-------|--------------|
| 1 | Setup + Auth | Project scaffold, auth working |
| 2 | Layout + Navigation | App shell, routing |
| 3 | Dashboard + Audits List | Dashboard, audit list |
| 4 | Audits CRUD | Create, edit, delete audits |
| 5 | Findings Module | Full findings functionality |
| 6 | Activity + Files + Polish | Activity feed, file uploads |
| 7 | Testing + Deploy | Tests, production deployment |

---

## Resources

- **API Documentation**: https://pss-portal-api.onrender.com/swagger
- **Production API**: https://pss-portal-api.onrender.com/api
- **shadcn/ui Docs**: https://ui.shadcn.com
- **TanStack Query**: https://tanstack.com/query
- **React Router**: https://reactrouter.com

---

**Ready to build the frontend!**
