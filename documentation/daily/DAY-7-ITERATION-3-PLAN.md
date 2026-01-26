# Day 7 Plan: Iteration 3 - Polish & Production

**Date**: January 21, 2026
**Status**: Planning
**Prerequisite**: Day 6 Complete (Iteration 2)

---

## Iteration 3 Overview

Based on the Master Plan and Day 6 completion, Iteration 3 focuses on making the PSS Portal production-ready with remaining features and polish.

**Goal**: Complete the MVP with Intake Forms, Organizations Management, Background Jobs, Seed Data, and Integration Tests.

---

## Day 7 Objectives

### Phase 3A: Intake Forms Management

Build the questionnaire system for client intake.

#### Entities
- `IntakeForm` - Form templates with JSON structure
- `IntakeResponse` - Client responses to forms

#### Endpoints to Implement

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/intake-forms` | GET | List forms (paginated) | User |
| `/api/intake-forms/{id}` | GET | Get form template | User |
| `/api/intake-forms` | POST | Create form template | Owner/Admin |
| `/api/intake-forms/{id}` | PUT | Update form template | Owner/Admin |
| `/api/intake-forms/{id}` | DELETE | Delete form template | Owner |
| `/api/intake-forms/{id}/responses` | GET | List responses | User |
| `/api/intake-forms/{id}/responses` | POST | Submit response | User |

#### Data Structure

```json
// IntakeForm.Template example
{
  "sections": [
    {
      "title": "Company Information",
      "questions": [
        { "id": "company_name", "type": "text", "label": "Company Name", "required": true },
        { "id": "industry", "type": "select", "label": "Industry", "options": ["Tech", "Finance", "Healthcare"] },
        { "id": "tools", "type": "multi-select", "label": "Current Tools", "options": ["Salesforce", "HubSpot", "Excel"] }
      ]
    }
  ]
}
```

---

### Phase 3B: Organizations Management

Enable multi-organization support and member management.

#### Endpoints to Implement

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/organizations` | GET | List user's organizations | User |
| `/api/organizations/{id}` | GET | Get organization details | User |
| `/api/organizations/{id}` | PUT | Update organization | Owner |
| `/api/organizations/{id}/members` | GET | List members | User |
| `/api/organizations/{id}/members` | POST | Add/invite member | Owner/Admin |
| `/api/organizations/{id}/members/{userId}` | PUT | Update member role | Owner |
| `/api/organizations/{id}/members/{userId}` | DELETE | Remove member | Owner |

#### Role Hierarchy
- **Owner**: Full access, can manage all members and settings
- **Admin**: Can manage audits, findings, and invite members
- **ClientManager**: Can view and update assigned audits
- **ClientViewer**: Read-only access to audits

---

### Phase 3C: Development Seed Data

Create seeder for demo data to facilitate testing and demos.

#### Seed Data Contents
- Demo user: `demo@pssportal.com` / `Demo123!`
- Demo organization: "Demo Consulting Co"
- Sample audit with findings
- Sample intake form with responses
- Activity log entries

#### Implementation Location
- `src/CAP.Infrastructure/Data/DbSeeder.cs`
- Called conditionally in Development environment

---

### Phase 3D: Background Jobs (Hangfire)

Implement scheduled tasks for reminders and automation.

#### Jobs to Implement
1. **Audit Reminders** - Notify when audits are stale (>7 days no updates)
2. **Status Nudges** - Remind clients about pending actions
3. **Weekly Summary** - Aggregate activity for reporting (future email)

#### Packages Required
```bash
dotnet add src/CAP.Api package Hangfire.Core
dotnet add src/CAP.Api package Hangfire.AspNetCore
dotnet add src/CAP.Api package Hangfire.PostgreSql
```

#### Dashboard Access
- URL: `/hangfire`
- Protected by authorization filter

---

### Phase 3E: Integration Tests

Create automated tests for API endpoints.

#### Test Project Setup
```bash
dotnet new xunit -n CAP.Tests.Integration -o tests/CAP.Tests.Integration
dotnet add tests/CAP.Tests.Integration package Microsoft.AspNetCore.Mvc.Testing
dotnet add tests/CAP.Tests.Integration package FluentAssertions
dotnet sln add tests/CAP.Tests.Integration/CAP.Tests.Integration.csproj
```

#### Test Coverage
- Auth flow (register, login, refresh, logout)
- Audit CRUD operations
- Finding CRUD operations
- Organization scoping validation
- Authorization policy enforcement

---

## Implementation Order

1. **Intake Forms Controller** - Core questionnaire functionality
2. **Organizations Controller** - Member management
3. **Database Seeder** - Demo data for testing
4. **Hangfire Setup** - Background job infrastructure
5. **Integration Tests** - Automated validation

---

## Files to Create

```
src/CAP.Api/Controllers/
├── IntakeFormsController.cs
└── OrganizationsController.cs

src/CAP.Infrastructure/Data/
└── DbSeeder.cs

src/CAP.Infrastructure/Jobs/
└── AuditReminderService.cs

tests/CAP.Tests.Integration/
├── AuthEndpointsTests.cs
├── AuditEndpointsTests.cs
└── FindingEndpointsTests.cs
```

---

## Definition of Done

- [ ] Intake Forms CRUD working
- [ ] Intake Responses CRUD working
- [ ] Organizations list/detail working
- [ ] Member management working
- [ ] Seed data populating in development
- [ ] Hangfire dashboard accessible
- [ ] At least one recurring job configured
- [ ] Integration tests passing
- [ ] All endpoints documented in Swagger
- [ ] Deployed to production
- [ ] Day 7 completion report written

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Total Endpoints | 30+ |
| Test Coverage | Key flows |
| API Response Time | <500ms p95 |
| Zero Critical Bugs | Yes |

---

## Current API Summary (After Iteration 2)

| Category | Endpoints |
|----------|-----------|
| Auth | 4 |
| Audits | 6 |
| Findings | 6 |
| Activity | 2 |
| Attachments | 4 |
| System | 1 |
| **Total** | **23** |

### After Iteration 3 (Projected)

| Category | Endpoints |
|----------|-----------|
| Auth | 4 |
| Audits | 6 |
| Findings | 6 |
| Activity | 2 |
| Attachments | 4 |
| Intake Forms | 7 |
| Organizations | 7 |
| System | 2 (+ hangfire) |
| **Total** | **38** |

---

## Resources

- **Master Plan**: `PSS_Portal_Master_Plan.md`
- **Day 6 Completion**: `guides/DAY-6-COMPLETION-REPORT.md`
- **Production API**: https://pss-portal-api.onrender.com
- **Swagger**: https://pss-portal-api.onrender.com/swagger

---

**Ready to implement Iteration 3!**
