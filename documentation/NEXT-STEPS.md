# PSS Portal - Next Steps & Project Status

**Last Updated**: January 28, 2026

---

## Current Status

### Completed
- [x] Backend API (ASP.NET Core 8, PostgreSQL)
- [x] Authentication (JWT, refresh tokens)
- [x] Multi-tenant organizations
- [x] Audits & Findings (legacy - low priority)
- [x] Activity logging
- [x] File attachments
- [x] Deployed to Render (https://pss-portal-api.onrender.com)
- [x] Frontend (React 19, Vite 7, Tailwind CSS 4)
- [x] Landing page with full marketing sections
- [x] Dashboard UI shell
- [x] Auth pages (Login, Register)
- [x] **Leads CRM module**
- [x] **Google Sheets import**
- [x] **Stripe billing integration**

### Project Pivot
The PSS Portal has evolved from a consulting audit tool to an **Enterprise Lead Generation CRM Portal** with:
- Pay-per-service business model (Stripe)
- Social media messaging (Facebook, Instagram, WhatsApp)
- Full CRM capabilities (Leads, Contacts, Accounts, Opportunities)
- Workflow automation
- Analytics & reporting

---

## Implementation Roadmap

### Phase 1: Billing & Service Framework (Iteration 3) - **COMPLETE**
**Priority**: Critical
**Status**: Done

- [x] Stripe integration (Stripe.net v50.2.0)
- [x] Subscriptions & invoices (database entities + API)
- [x] Service paywall middleware (RequiresService attribute)
- [x] Checkout flow (Stripe Checkout Sessions)
- [x] Customer portal (Stripe Billing Portal)
- [x] Pricing page UI (/pricing)
- [x] Billing settings page (/app/settings/billing)
- [x] Webhook handling (7 event types)

**Documentation**: `documentation/BILLING.md`

---

### Phase 2: Core CRM Foundation (Iteration 4) - **NEXT**
**Priority**: Critical
**Status**: Leads complete, Contacts/Accounts/Opportunities pending

- [x] Leads entity & API (complete with Google Sheets import)
- [ ] Contacts entity & API
- [ ] Accounts entity & API
- [ ] Opportunities & pipeline
- [ ] Basic activities (notes, tasks)
- [ ] Lead conversion flow

---

### Phase 3: Communication & Email (Iteration 5)
**Priority**: High

- [ ] SendGrid integration
- [ ] Email templates
- [ ] Email tracking (opens, clicks)
- [ ] Activity timeline
- [ ] Background worker service (Hangfire)

---

### Phase 4: Social Media Inbox (Iteration 6)
**Priority**: High

- [ ] Meta Business API integration
- [ ] Facebook Messenger support
- [ ] Instagram DM support
- [ ] WhatsApp Business support
- [ ] Unified inbox UI
- [ ] Conversation-to-lead linking

**Note**: TikTok not available in US/EU/UK

---

### Phase 5: Automation Engine (Iteration 7)
**Priority**: High

- [ ] Workflow builder
- [ ] Event-based triggers
- [ ] Time-based triggers
- [ ] Email sequences
- [ ] Automated actions

---

### Phase 6: Lead Management (Iteration 8)
**Priority**: High

- [ ] Web form builder
- [ ] Lead scoring engine
- [ ] Duplicate detection
- [ ] Lead assignment rules
- [ ] Import/Export

---

### Phase 7: Analytics & Reporting (Iteration 9)
**Priority**: Medium

- [ ] Dashboard framework
- [ ] Pipeline analytics
- [ ] Activity reports
- [ ] Revenue reports
- [ ] Export to PDF/Excel

---

### Phase 8: Integrations Hub (Iteration 10)
**Priority**: Medium

- [ ] Webhook system
- [ ] Zapier integration
- [ ] Calendar integration
- [ ] Data enrichment APIs

---

### Phase 9: Enterprise Features (Iteration 11)
**Priority**: Low

- [ ] Custom fields
- [ ] Advanced RBAC
- [ ] SSO/SAML
- [ ] API rate limiting tiers

---

### Future / Low Priority
- [ ] Audits module (already exists - maintain as "Assessments")
- [ ] Custom objects
- [ ] AI-powered lead scoring
- [ ] Chatbot integration

---

## Technical Stack

### Backend
- ASP.NET Core 8
- PostgreSQL (Render managed)
- Entity Framework Core
- JWT authentication
- Hangfire (background jobs)
- Stripe.net

### Frontend
- React 19
- Vite 7
- TypeScript
- Tailwind CSS 4
- React Query
- Zustand
- React Router

### Hosting
- **API**: Render (Web Service)
- **Database**: Render PostgreSQL
- **Frontend**: TBD (Render Static Site, Vercel, or Netlify)

### External Services
- Stripe (payments)
- SendGrid (email)
- Meta Graph API (social messaging)
- Cloudflare R2 (file storage - planned)

---

## Estimated Scope

| Metric | Value |
|--------|-------|
| New Database Tables | ~33 |
| New API Endpoints | ~155 |
| Story Points | 400-510 |
| Phases | 9 |

---

## Quick Links

| Resource | URL |
|----------|-----|
| Production API | https://pss-portal-api.onrender.com |
| Swagger | https://pss-portal-api.onrender.com/swagger |
| Health Check | https://pss-portal-api.onrender.com/health |
| GitHub | https://github.com/pupilliluke/PSS-Portal |

---

## Test Accounts

### Local Development
```
Email: test@pssportal.com
Password: TestPass1234@
```

### Production (Render)
```
Email: iteration2test@pssportal.com
Password: TestPass1234!
```

---

## Key Documents

| Document | Purpose |
|----------|---------|
| `documentation/BILLING.md` | Stripe billing integration guide |
| `documentation/API-TESTING-GUIDE.md` | API testing reference |
| `documentation/FRONTEND-PLAN.md` | Frontend architecture |
| `ENTERPRISE-LEADGEN-CRM-RESEARCH.md` | Full research & architecture |
| `PSS_Portal_Master_Plan.md` | Original project plan |

---

## Platform Constraints (Railway/Render)

### Recommended Architecture (Render)
- Web Service: $7-25/month
- Background Worker: $7/month
- PostgreSQL: $7-20/month
- Redis (optional): $0-10/month
- **Total**: $21-62/month base

### Limitations
- No Elasticsearch (use PostgreSQL full-text search)
- No MongoDB (use PostgreSQL JSONB)
- Ephemeral file system (use Cloudflare R2 or S3)
- Free tier sleeps after 15 minutes

---

## Getting Started (Development)

### Prerequisites
- .NET 8 SDK
- Node.js 20+
- Docker Desktop
- PostgreSQL (via Docker)

### Run Backend
```bash
docker compose up -d
dotnet run --project src/CAP.Api
```

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```

---

**Next Action**: Continue Phase 2 - Core CRM (Contacts, Accounts, Opportunities)
