# Enterprise Lead Generation CRM Platform - Full Scale Research

## Executive Summary

This document provides comprehensive research on building an enterprise-grade lead generation CRM portal with automations and integrations. Based on industry analysis and current market trends for 2026, this outlines all components required for a full-scale implementation.

---

## Table of Contents

1. [Market Context](#1-market-context)
2. [Core CRM Components](#2-core-crm-components)
3. [Database Schema Design](#3-database-schema-design)
4. [Lead Management System](#4-lead-management-system)
5. [Automation Engine](#5-automation-engine)
6. [Integration Architecture](#6-integration-architecture)
7. [Invoicing & Payments](#7-invoicing--payments)
8. [Social Media Messaging Integration](#8-social-media-messaging-integration)
9. [Analytics & Reporting](#9-analytics--reporting)
10. [Multi-Tenant Enterprise Features](#10-multi-tenant-enterprise-features)
11. [Platform Constraints: Railway & Render](#11-platform-constraints-railway--render)
12. [Current Backend Gap Analysis](#12-current-backend-gap-analysis)
13. [Implementation Roadmap](#13-implementation-roadmap)
14. [Technical Specifications](#14-technical-specifications)
15. [Estimated Scope](#15-estimated-scope)

---

## 1. Market Context

### Industry Trends (2026)

- Global CRM market projected to exceed **$100 billion by 2030**
- AI-powered CRMs seeing **45% increase in qualified leads**
- Companies using automated lead scoring see **20% reduction in time-to-first-contact**
- **5-minute response time** to inbound leads increases meeting booking by **100x**

### Pricing Tiers in Market

| Tier | Price Range | Target |
|------|-------------|--------|
| Starter | $50-100/user/month | Small teams |
| Professional | $100-500/user/month | Growing businesses |
| Enterprise | $500-1,000+/user/month | Large organizations |

### Key Competitors

- **Salesforce** - Enterprise leader, AI-powered, $100B+ valuation
- **HubSpot** - Inbound marketing focus, freemium model
- **ZoomInfo** - Data enrichment, $15K+ annual subscriptions
- **Apollo.io** - 275M+ contacts, credit-based model
- **Pipedrive** - Pipeline-focused, SMB market

---

## 2. Core CRM Components

### 2.1 Entity Hierarchy

```
Organization (Tenant)
├── Users (Team Members)
│   └── Roles & Permissions
├── Accounts (Companies)
│   ├── Contacts (People)
│   └── Opportunities (Deals)
├── Leads (Unqualified Prospects)
├── Campaigns
├── Activities (Calls, Emails, Meetings)
└── Reports & Dashboards
```

### 2.2 Core Modules Required

| Module | Description | Priority |
|--------|-------------|----------|
| **Lead Management** | Capture, qualify, score, route leads | Critical |
| **Contact Management** | Store and manage contact records | Critical |
| **Account Management** | Company records with hierarchy | Critical |
| **Opportunity/Deal Pipeline** | Sales stages, forecasting | Critical |
| **Activity Tracking** | Calls, emails, meetings, tasks | Critical |
| **Campaign Management** | Marketing campaign tracking | High |
| **Email Automation** | Sequences, drip campaigns | High |
| **Lead Scoring** | AI/rule-based scoring | High |
| **Reporting & Analytics** | Dashboards, KPIs | High |
| **Workflow Automation** | Trigger-action workflows | High |
| **Integrations Hub** | Third-party connections | Medium |
| **Document Management** | Proposals, contracts | Medium |
| **Calendar/Scheduling** | Meeting booking | Medium |

---

## 3. Database Schema Design

### 3.1 Core Entities

#### Organizations (Tenants)
```
Organizations
├── Id (GUID, PK)
├── Name
├── Domain
├── Industry
├── SubscriptionTier
├── BillingInfo (encrypted)
├── Settings (JSON)
├── CreatedAt
└── UpdatedAt
```

#### Users & Team Management
```
Users
├── Id (GUID, PK)
├── OrganizationId (FK)
├── Email
├── FirstName, LastName
├── Avatar
├── Role
├── Permissions (JSON)
├── LastLoginAt
├── IsActive
└── Timestamps

Teams
├── Id (GUID, PK)
├── OrganizationId (FK)
├── Name
├── ManagerId (FK → Users)
└── Timestamps

TeamMembers
├── TeamId (FK)
├── UserId (FK)
└── Role
```

#### Accounts (Companies)
```
Accounts
├── Id (GUID, PK)
├── OrganizationId (FK)
├── Name
├── Domain/Website
├── Industry
├── EmployeeCount
├── AnnualRevenue
├── Address (embedded)
├── Phone
├── OwnerId (FK → Users)
├── ParentAccountId (FK, self-referential for hierarchy)
├── Source
├── Status (Active, Inactive, Prospect)
├── CustomFields (JSON)
└── Timestamps
```

#### Contacts (People)
```
Contacts
├── Id (GUID, PK)
├── OrganizationId (FK)
├── AccountId (FK, nullable)
├── FirstName, LastName
├── Email
├── Phone
├── Mobile
├── JobTitle
├── Department
├── LinkedInUrl
├── Address (embedded)
├── OwnerId (FK → Users)
├── Source
├── LeadScore
├── Status
├── DoNotContact (boolean)
├── CustomFields (JSON)
├── Tags (array)
└── Timestamps
```

#### Leads (Unqualified Prospects)
```
Leads
├── Id (GUID, PK)
├── OrganizationId (FK)
├── FirstName, LastName
├── Email
├── Phone
├── Company
├── JobTitle
├── Website
├── Industry
├── EmployeeCount
├── Source (Web Form, LinkedIn, Referral, etc.)
├── CampaignId (FK, nullable)
├── OwnerId (FK → Users)
├── Status (New, Contacted, Qualified, Unqualified, Converted)
├── LeadScore
├── ScoreBreakdown (JSON)
├── ConvertedToContactId (FK, nullable)
├── ConvertedToAccountId (FK, nullable)
├── ConvertedAt
├── CustomFields (JSON)
├── Tags (array)
└── Timestamps
```

#### Opportunities (Deals)
```
Opportunities
├── Id (GUID, PK)
├── OrganizationId (FK)
├── AccountId (FK)
├── PrimaryContactId (FK)
├── Name
├── Amount
├── Currency
├── Stage (configurable per org)
├── Probability
├── ExpectedCloseDate
├── ActualCloseDate
├── OwnerId (FK → Users)
├── Source
├── LostReason
├── WonReason
├── NextStepDate
├── NextStepDescription
├── CustomFields (JSON)
└── Timestamps

OpportunityStages (per organization)
├── Id (GUID, PK)
├── OrganizationId (FK)
├── Name
├── Order
├── Probability
├── IsClosed
├── IsWon
└── Color
```

#### Activities
```
Activities
├── Id (GUID, PK)
├── OrganizationId (FK)
├── Type (Call, Email, Meeting, Task, Note)
├── Subject
├── Description
├── DueDate
├── CompletedAt
├── Duration (minutes)
├── Outcome
├── RelatedEntityType (Lead, Contact, Account, Opportunity)
├── RelatedEntityId
├── OwnerId (FK → Users)
├── CreatedById (FK → Users)
├── Priority (Low, Medium, High)
├── Status (Pending, Completed, Cancelled)
└── Timestamps

EmailActivities (extends Activities)
├── ActivityId (FK)
├── FromEmail
├── ToEmails (array)
├── CcEmails (array)
├── BccEmails (array)
├── HtmlBody
├── TextBody
├── OpenedAt
├── ClickedAt
├── BouncedAt
├── UnsubscribedAt
└── TrackingId

CallActivities (extends Activities)
├── ActivityId (FK)
├── PhoneNumber
├── Direction (Inbound, Outbound)
├── Duration
├── RecordingUrl
├── Transcript
└── Sentiment
```

#### Campaigns
```
Campaigns
├── Id (GUID, PK)
├── OrganizationId (FK)
├── Name
├── Type (Email, Social, Event, Referral, Paid Ads)
├── Status (Draft, Active, Paused, Completed)
├── StartDate
├── EndDate
├── Budget
├── ActualCost
├── ExpectedRevenue
├── ActualRevenue
├── OwnerId (FK → Users)
├── ParentCampaignId (FK, self-ref for hierarchy)
└── Timestamps

CampaignMembers
├── CampaignId (FK)
├── LeadId or ContactId (polymorphic)
├── Status (Sent, Responded, Converted)
├── FirstRespondedAt
└── Timestamps
```

### 3.2 Lead Scoring Schema

```
LeadScoringRules
├── Id (GUID, PK)
├── OrganizationId (FK)
├── Name
├── IsActive
├── Priority
└── Timestamps

LeadScoringCriteria
├── Id (GUID, PK)
├── RuleId (FK)
├── Category (Demographic, Behavioral, Firmographic)
├── Field (e.g., "JobTitle", "PageVisited", "CompanySize")
├── Operator (Equals, Contains, GreaterThan, etc.)
├── Value
├── Points (positive or negative)
└── Order

LeadScoreHistory
├── Id (GUID, PK)
├── LeadId (FK)
├── PreviousScore
├── NewScore
├── ChangeReason
├── CriteriaId (FK, nullable)
├── Timestamp
```

### 3.3 Automation Schema

```
Workflows
├── Id (GUID, PK)
├── OrganizationId (FK)
├── Name
├── Description
├── TriggerType (Event, Schedule, Manual)
├── TriggerConfig (JSON)
├── IsActive
├── CreatedById (FK)
└── Timestamps

WorkflowSteps
├── Id (GUID, PK)
├── WorkflowId (FK)
├── Order
├── Type (Action, Condition, Delay, Split)
├── Config (JSON)
├── NextStepId (FK, nullable)
├── TrueStepId (FK, for conditions)
├── FalseStepId (FK, for conditions)
└── Timestamps

WorkflowExecutions
├── Id (GUID, PK)
├── WorkflowId (FK)
├── EntityType
├── EntityId
├── Status (Running, Completed, Failed, Cancelled)
├── CurrentStepId (FK)
├── StartedAt
├── CompletedAt
├── ErrorMessage
└── ExecutionLog (JSON)

EmailSequences
├── Id (GUID, PK)
├── OrganizationId (FK)
├── Name
├── Description
├── IsActive
└── Timestamps

EmailSequenceSteps
├── Id (GUID, PK)
├── SequenceId (FK)
├── Order
├── DelayDays
├── DelayHours
├── Subject
├── HtmlBody
├── TextBody
├── TemplateId (FK, nullable)
└── Timestamps

EmailSequenceEnrollments
├── Id (GUID, PK)
├── SequenceId (FK)
├── ContactId or LeadId
├── CurrentStepId (FK)
├── Status (Active, Completed, Paused, Unsubscribed, Bounced)
├── EnrolledAt
├── CompletedAt
├── NextSendAt
└── Timestamps
```

### 3.4 Integration Schema

```
Integrations
├── Id (GUID, PK)
├── OrganizationId (FK)
├── Provider (e.g., "sendgrid", "linkedin", "zapier")
├── Name
├── Status (Active, Inactive, Error)
├── Config (JSON, encrypted)
├── Credentials (encrypted)
├── LastSyncAt
├── ErrorMessage
└── Timestamps

Webhooks
├── Id (GUID, PK)
├── OrganizationId (FK)
├── Name
├── Url
├── Secret
├── Events (array)
├── IsActive
├── Headers (JSON)
└── Timestamps

WebhookDeliveries
├── Id (GUID, PK)
├── WebhookId (FK)
├── Event
├── Payload (JSON)
├── ResponseStatus
├── ResponseBody
├── Attempts
├── DeliveredAt
└── Timestamps

ExternalSyncs
├── Id (GUID, PK)
├── IntegrationId (FK)
├── EntityType
├── InternalEntityId
├── ExternalEntityId
├── LastSyncedAt
├── SyncDirection (Inbound, Outbound, Bidirectional)
└── Timestamps
```

---

## 4. Lead Management System

### 4.1 Lead Capture Methods

| Method | Implementation |
|--------|----------------|
| **Web Forms** | Embeddable forms with custom fields |
| **Landing Pages** | Hosted landing pages with tracking |
| **API** | REST API for programmatic creation |
| **CSV Import** | Bulk import with field mapping |
| **Email Parsing** | Auto-create from forwarded emails |
| **Chrome Extension** | Capture from LinkedIn, websites |
| **Chatbot** | AI chatbot qualification |
| **Webhooks** | Inbound from third-party sources |

### 4.2 Lead Qualification Process

```
Lead Entry → Duplicate Check → Data Enrichment → Lead Scoring → Assignment → Nurture/Convert
```

1. **Duplicate Detection**
   - Match on email (exact)
   - Match on phone (normalized)
   - Fuzzy match on name + company

2. **Data Enrichment** (via integrations)
   - Company firmographics (size, revenue, industry)
   - Contact details (verified email, phone, LinkedIn)
   - Technographics (technologies used)
   - Intent data (buying signals)

3. **Lead Scoring**
   - **Demographic Score**: Job title, seniority, department
   - **Firmographic Score**: Company size, industry, revenue
   - **Behavioral Score**: Website visits, email opens, form fills
   - **Negative Scoring**: Personal emails (-10), competitors (-20)
   - **Time Decay**: 25% monthly reduction without engagement

4. **Lead Assignment**
   - Round-robin distribution
   - Territory-based routing
   - Score-based prioritization
   - Manual assignment

### 4.3 Lead Conversion

```csharp
// Lead converts to:
// 1. New Contact + New Account + New Opportunity (most common)
// 2. New Contact + Existing Account + New Opportunity
// 3. Existing Contact + New Opportunity
```

---

## 5. Automation Engine

### 5.1 Trigger Types

| Trigger Category | Examples |
|------------------|----------|
| **Event-Based** | Lead created, Stage changed, Email opened |
| **Time-Based** | 3 days after creation, Every Monday 9am |
| **Condition-Based** | Score > 80, No activity in 30 days |
| **Manual** | User initiates workflow |

### 5.2 Action Types

| Action | Description |
|--------|-------------|
| **Send Email** | Template-based or custom |
| **Create Task** | Assign follow-up to user |
| **Update Field** | Change entity field value |
| **Add Tag** | Tag entity for segmentation |
| **Assign Owner** | Route to user or team |
| **Send Webhook** | Trigger external system |
| **Enroll in Sequence** | Start email drip campaign |
| **Create Activity** | Log call/meeting |
| **Send Notification** | Alert user via email/SMS/Slack |
| **Wait/Delay** | Pause for duration |

### 5.3 Workflow Patterns

#### Welcome Sequence
```
Trigger: New Lead Created
├── Wait 1 hour
├── Send Welcome Email
├── Wait 3 days
├── Check: Email Opened?
│   ├── Yes → Send Follow-up A
│   └── No → Send Follow-up B
├── Wait 5 days
├── Create Task: "Follow-up call"
└── End
```

#### Lead Nurture
```
Trigger: Lead Score > 50 AND Status = "Contacted"
├── Enroll in Email Sequence "Product Education"
├── Wait until Sequence Complete
├── Check: Any email clicked?
│   ├── Yes → Update Status to "Qualified", Notify Owner
│   └── No → Add Tag "Cold Lead"
└── End
```

#### Deal Stage Automation
```
Trigger: Opportunity Stage changed to "Proposal Sent"
├── Create Task: "Follow up on proposal" (Due: 3 days)
├── Send Email: "Proposal Confirmation" to Contact
├── Send Slack Notification to Owner
└── End
```

### 5.4 Email Sequences

**Sequence Types:**
- **Nurture Sequences**: Educational content over weeks
- **Follow-up Sequences**: Post-meeting, post-demo
- **Re-engagement Sequences**: Dormant leads
- **Onboarding Sequences**: New customer welcome

**Sequence Features:**
- Personalization tokens (`{{FirstName}}`, `{{Company}}`)
- A/B testing subject lines
- Send time optimization
- Auto-stop on reply
- Bounce handling
- Unsubscribe management

---

## 6. Integration Architecture

### 6.1 Integration Categories

| Category | Platforms | Purpose |
|----------|-----------|---------|
| **Email Delivery** | SendGrid, Mailchimp, Postmark | Transactional & marketing emails |
| **Calendar** | Google Calendar, Outlook | Meeting scheduling |
| **Communication** | Slack, Teams, Twilio | Notifications, SMS, Calls |
| **Data Enrichment** | ZoomInfo, Apollo, Clearbit | Lead/account data |
| **Social** | LinkedIn Sales Navigator | Social selling |
| **Advertising** | Google Ads, Facebook Ads | Lead attribution |
| **Analytics** | Google Analytics, Mixpanel | Behavior tracking |
| **Automation** | Zapier, Make, n8n | Universal connector |
| **Documents** | DocuSign, PandaDoc | Proposals, contracts |
| **Payment** | Stripe, PayPal | Billing |

### 6.2 API Architecture

```
External Systems
      │
      ▼
┌─────────────────────────────────────────┐
│           API Gateway                    │
│  - Rate Limiting                         │
│  - Authentication (OAuth 2.0, API Keys)  │
│  - Request Validation                    │
│  - Logging & Monitoring                  │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│         Integration Service              │
│  - Webhook Receiver                      │
│  - Webhook Sender                        │
│  - OAuth Flow Manager                    │
│  - Credential Vault                      │
│  - Sync Orchestrator                     │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│         Provider Adapters                │
│  - SendGridAdapter                       │
│  - ZapierAdapter                         │
│  - LinkedInAdapter                       │
│  - ZoomInfoAdapter                       │
│  - etc.                                  │
└─────────────────────────────────────────┘
```

### 6.3 Webhook System

**Outbound Webhooks** (Events your system sends):
- `lead.created`
- `lead.updated`
- `lead.converted`
- `contact.created`
- `opportunity.stage_changed`
- `opportunity.won`
- `opportunity.lost`
- `activity.completed`
- `email.sent`, `email.opened`, `email.clicked`

**Inbound Webhooks** (Events you receive):
- Form submissions
- Email delivery status
- Calendar events
- Payment events
- Third-party notifications

### 6.4 Zapier Integration

Expose your platform to 6,000+ apps via Zapier:

**Triggers (events that start Zaps):**
- New Lead
- New Contact
- New Opportunity
- Opportunity Stage Changed
- Lead Score Changed
- Activity Created

**Actions (things Zapier can do in your system):**
- Create Lead
- Create Contact
- Create Account
- Create Opportunity
- Create Activity
- Update Lead Score
- Add Tag

---

## 7. Invoicing & Payments

### 7.1 Business Model: Pay-Per-Service with Paywalls

**Core Concept**: Customers sign in, see their company info and all available services. Each service is protected by a paywall - customers pay based on services used.

```
Customer Login
      │
      ▼
┌─────────────────────────────────────────┐
│           Customer Dashboard             │
│  - Company Info                          │
│  - Available Services (with pricing)     │
│  - Active Subscriptions                  │
│  - Usage & Billing History               │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│           Service Selection              │
│  🔒 Lead Generation Portal ($X/month)   │
│  🔒 Email Automation ($Y/month)          │
│  🔒 Social Media Inbox ($Z/month)        │
│  🔒 Analytics Dashboard ($W/month)       │
│  🔓 Basic CRM (included)                 │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│           Stripe Checkout                │
│  - Subscribe to service                  │
│  - Manage payment methods                │
│  - View invoices                         │
└─────────────────────────────────────────┘
```

### 7.2 Stripe Integration Architecture

#### Stripe Products & Pricing Model

```
Stripe Products (one per service module)
├── product_leadgen          → Lead Generation Portal
├── product_email_automation → Email Sequences & Automation
├── product_social_inbox     → Social Media Messaging
├── product_analytics        → Advanced Analytics
├── product_integrations     → Third-Party Integrations
└── product_enterprise       → Enterprise Features (SSO, API)

Stripe Prices (pricing options per product)
├── price_leadgen_monthly    → $99/month
├── price_leadgen_yearly     → $999/year (save 17%)
├── price_email_monthly      → $49/month
├── price_social_monthly     → $79/month
└── ...etc
```

#### Database Schema for Billing

```
Subscriptions
├── Id (GUID, PK)
├── OrganizationId (FK)
├── StripeSubscriptionId
├── StripeCustomerId
├── Status (active, canceled, past_due, trialing)
├── CurrentPeriodStart
├── CurrentPeriodEnd
├── CancelAtPeriodEnd
└── Timestamps

SubscriptionItems
├── Id (GUID, PK)
├── SubscriptionId (FK)
├── StripeSubscriptionItemId
├── StripePriceId
├── ServiceModule (enum: LeadGen, EmailAutomation, SocialInbox, etc.)
├── Quantity
└── Timestamps

Invoices
├── Id (GUID, PK)
├── OrganizationId (FK)
├── StripeInvoiceId
├── InvoiceNumber
├── Status (draft, open, paid, void, uncollectible)
├── AmountDue
├── AmountPaid
├── Currency
├── DueDate
├── PaidAt
├── HostedInvoiceUrl
├── InvoicePdfUrl
├── LineItems (JSON)
└── Timestamps

PaymentMethods
├── Id (GUID, PK)
├── OrganizationId (FK)
├── StripePaymentMethodId
├── Type (card, bank_account)
├── Last4
├── Brand (visa, mastercard, etc.)
├── ExpMonth, ExpYear
├── IsDefault
└── Timestamps

UsageRecords (for metered billing if needed)
├── Id (GUID, PK)
├── OrganizationId (FK)
├── ServiceModule
├── Quantity
├── RecordedAt
├── StripeUsageRecordId
└── Timestamps
```

### 7.3 Stripe API Integration

#### Key Stripe APIs Used

| API | Purpose |
|-----|---------|
| **Customers** | Create/manage customer records |
| **Products & Prices** | Define service offerings |
| **Subscriptions** | Manage recurring billing |
| **Invoices** | Generate and send invoices |
| **Payment Intents** | Process one-time payments |
| **Payment Methods** | Store cards/bank accounts |
| **Webhooks** | Real-time event notifications |
| **Customer Portal** | Self-service billing management |
| **Checkout Sessions** | Hosted payment pages |

#### Webhook Events to Handle

```csharp
// Critical webhook events
invoice.paid              → Unlock/continue service access
invoice.payment_failed    → Notify customer, retry logic
customer.subscription.created    → Provision service access
customer.subscription.updated    → Update access levels
customer.subscription.deleted    → Revoke service access
checkout.session.completed       → New subscription started
payment_method.attached          → Update stored methods
```

### 7.4 Service Access Control (Paywall Logic)

```csharp
public class ServiceAccessMiddleware
{
    // Check if organization has active subscription for requested service
    public async Task<bool> HasAccess(Guid orgId, ServiceModule service)
    {
        var subscription = await _db.Subscriptions
            .Include(s => s.Items)
            .Where(s => s.OrganizationId == orgId
                     && s.Status == "active")
            .FirstOrDefaultAsync();

        if (subscription == null) return false;

        return subscription.Items.Any(i => i.ServiceModule == service);
    }
}

// Service modules enum
public enum ServiceModule
{
    BasicCRM,           // Free - always accessible
    LeadGeneration,     // Paid
    EmailAutomation,    // Paid
    SocialInbox,        // Paid
    AdvancedAnalytics,  // Paid
    Integrations,       // Paid
    EnterpriseFeatures  // Paid
}
```

### 7.5 Pricing Page & Checkout Flow

```
1. User clicks "Subscribe" on service card
2. Backend creates Stripe Checkout Session
3. User redirected to Stripe-hosted checkout
4. Stripe processes payment
5. Webhook: checkout.session.completed
6. Backend provisions service access
7. User redirected to success page with service unlocked
```

### 7.6 Customer Self-Service Portal

Stripe Customer Portal provides:
- View and download invoices
- Update payment methods
- Cancel/upgrade subscriptions
- View billing history
- Update billing address

```csharp
// Create portal session
var options = new Stripe.BillingPortal.SessionCreateOptions
{
    Customer = stripeCustomerId,
    ReturnUrl = "https://app.yoursite.com/settings/billing",
};
var session = await _portalService.CreateAsync(options);
// Redirect user to session.Url
```

---

## 8. Social Media Messaging Integration

### 8.1 Platform Overview & Feasibility

| Platform | API Available | Messaging Support | Requirements | Feasibility |
|----------|--------------|-------------------|--------------|-------------|
| **Facebook Messenger** | ✅ Yes | ✅ Full | Meta Business verification, linked FB Page | ✅ High |
| **Instagram DM** | ✅ Yes | ✅ Full | Business/Creator account, 1000+ followers, Meta verification | ⚠️ Medium |
| **WhatsApp Business** | ✅ Yes | ✅ Full | Meta Business verification, phone number | ✅ High |
| **TikTok** | ✅ Yes | ✅ Yes | Business account, **NOT available in US/EU/UK** | ⚠️ Limited |

### 8.2 Meta Platform (Facebook, Instagram, WhatsApp)

#### Unified Inbox Architecture

All three Meta platforms use the same underlying API infrastructure:

```
┌─────────────────────────────────────────────────────────┐
│                   Meta Graph API                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │  Messenger  │ │  Instagram  │ │  WhatsApp Cloud │   │
│  │     API     │ │   Graph API │ │       API       │   │
│  └─────────────┘ └─────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              PSS Portal Unified Inbox                    │
│  - Single view of all conversations                     │
│  - Reply to FB, IG, WhatsApp from one place             │
│  - Conversation history sync                            │
│  - Auto-assign to team members                          │
│  - Canned responses / templates                         │
└─────────────────────────────────────────────────────────┘
```

#### Requirements for Meta Integration

1. **Facebook Business Page** - Required for all Meta messaging
2. **Meta Business Verification** - Identity verification process
3. **App Review** - Submit app for permissions approval
4. **Instagram Business Account** - Must be linked to FB Page
5. **1000+ Followers** (Instagram) - Minimum for API access

#### Messaging Window Restrictions

| Platform | Window | Extension |
|----------|--------|-----------|
| **Messenger** | 24 hours after user message | HUMAN_AGENT tag: 7 days |
| **Instagram** | 24 hours after user message | HUMAN_AGENT tag: 7 days |
| **WhatsApp** | 24 hours after user message | Template messages (pre-approved) |

⚠️ **Important**: Customer must initiate conversation first. You cannot cold-message.

#### Database Schema for Social Messaging

```
SocialConnections
├── Id (GUID, PK)
├── OrganizationId (FK)
├── Platform (Facebook, Instagram, WhatsApp, TikTok)
├── ExternalPageId / ExternalAccountId
├── PageName / AccountName
├── AccessToken (encrypted)
├── TokenExpiresAt
├── Status (active, expired, disconnected)
├── Permissions (JSON array)
└── Timestamps

SocialConversations
├── Id (GUID, PK)
├── OrganizationId (FK)
├── ConnectionId (FK)
├── Platform
├── ExternalConversationId
├── ParticipantExternalId
├── ParticipantName
├── ParticipantProfilePic
├── Status (open, closed, snoozed)
├── AssignedToUserId (FK)
├── LastMessageAt
├── UnreadCount
├── LinkedLeadId (FK, nullable)
├── LinkedContactId (FK, nullable)
└── Timestamps

SocialMessages
├── Id (GUID, PK)
├── ConversationId (FK)
├── ExternalMessageId
├── Direction (inbound, outbound)
├── MessageType (text, image, video, audio, file, template)
├── Content
├── MediaUrl
├── SentAt
├── DeliveredAt
├── ReadAt
├── SentByUserId (FK, nullable - for outbound)
└── Timestamps
```

### 8.3 TikTok Business Messaging

#### Capabilities

- Real-time direct messaging
- Automated replies and welcome messages
- Multi-channel integration with Messenger/WhatsApp
- Chatbot support

#### Restrictions

⚠️ **Geographic Limitations**: TikTok Business Messaging is **NOT available** in:
- United States
- European Economic Area (EU)
- Switzerland
- United Kingdom

This significantly limits usefulness for US/EU-based businesses.

#### 48-Hour Messaging Window

Similar to Meta, TikTok has a 48-hour window after user's last message.

### 8.4 Implementation Approach

#### Option A: Direct API Integration (Recommended for FB/IG/WhatsApp)

```csharp
// Facebook Messenger webhook handler
[HttpPost("webhooks/facebook")]
public async Task<IActionResult> FacebookWebhook([FromBody] WebhookPayload payload)
{
    foreach (var entry in payload.Entry)
    {
        foreach (var message in entry.Messaging)
        {
            if (message.Message != null)
            {
                // Inbound message
                await _socialInboxService.ProcessInboundMessage(
                    Platform.Facebook,
                    message.Sender.Id,
                    message.Message.Text,
                    message.Message.Attachments
                );
            }
        }
    }
    return Ok();
}
```

#### Option B: Unified Messaging Provider (Alternative)

Third-party providers that unify all platforms:

| Provider | Platforms | Pricing | Notes |
|----------|-----------|---------|-------|
| **Unipile** | LinkedIn, WhatsApp, IG, Messenger, Telegram, X | API-based | Full sync |
| **Respond.io** | WhatsApp, FB, IG, TikTok, Email, SMS | $99+/month | Hosted inbox |
| **SleekFlow** | WhatsApp, FB, IG, TikTok, WeChat | $79+/month | E-commerce focus |

Using a provider simplifies development but adds cost and dependency.

### 8.5 Social Inbox Features

| Feature | Description |
|---------|-------------|
| **Unified Thread View** | All platforms in one inbox |
| **Assignment** | Route conversations to team members |
| **Canned Responses** | Pre-written reply templates |
| **Auto-Replies** | Out-of-hours automated responses |
| **Lead Conversion** | Create lead/contact from conversation |
| **Tags & Labels** | Organize conversations |
| **Notes** | Internal notes on conversations |
| **Analytics** | Response time, volume metrics |

### 8.6 API Endpoints for Social Messaging

```
# Connections
GET    /api/social/connections
POST   /api/social/connections/{platform}/connect
DELETE /api/social/connections/{id}
GET    /api/social/connections/{id}/status

# Conversations
GET    /api/social/conversations
GET    /api/social/conversations/{id}
PATCH  /api/social/conversations/{id}/assign
PATCH  /api/social/conversations/{id}/status
POST   /api/social/conversations/{id}/link-lead

# Messages
GET    /api/social/conversations/{id}/messages
POST   /api/social/conversations/{id}/messages
POST   /api/social/conversations/{id}/messages/template

# Webhooks (inbound from platforms)
POST   /api/webhooks/facebook
POST   /api/webhooks/instagram
POST   /api/webhooks/whatsapp
POST   /api/webhooks/tiktok
```

---

## 9. Analytics & Reporting

### 9.1 Key Performance Indicators

#### Sales Metrics
| Metric | Formula | Target |
|--------|---------|--------|
| **Lead Conversion Rate** | Qualified Leads / Total Leads | 15-25% |
| **Opportunity Win Rate** | Won Deals / Total Deals | 20-30% |
| **Average Deal Size** | Total Revenue / Won Deals | Varies |
| **Sales Cycle Length** | Avg days from Lead to Close | Industry-dependent |
| **Pipeline Velocity** | (Deals × Win Rate × Value) / Cycle Days | Higher is better |
| **Lead Response Time** | Time to first contact | < 5 minutes |

#### Activity Metrics
| Metric | Description |
|--------|-------------|
| **Calls Made** | Daily/weekly call volume |
| **Emails Sent** | Outbound email volume |
| **Meetings Booked** | Scheduled meetings |
| **Tasks Completed** | Task completion rate |

#### Financial Metrics
| Metric | Formula |
|--------|---------|
| **Customer Acquisition Cost (CAC)** | Sales & Marketing Cost / New Customers |
| **Customer Lifetime Value (CLV)** | Avg Revenue × Avg Lifespan |
| **CLV:CAC Ratio** | CLV / CAC (target: 3:1) |
| **Monthly Recurring Revenue (MRR)** | Active Subscriptions × Monthly Price |

### 9.2 Dashboard Types

1. **Executive Dashboard**
   - Revenue vs. Target
   - Pipeline Value
   - Win Rate Trend
   - Top Deals
   - Forecast

2. **Sales Rep Dashboard**
   - My Pipeline
   - Activities Due Today
   - Lead Queue
   - Personal Win Rate
   - Quota Attainment

3. **Marketing Dashboard**
   - Lead Sources
   - Campaign Performance
   - Lead Score Distribution
   - Conversion by Source
   - Cost per Lead

4. **Pipeline Dashboard**
   - Deals by Stage
   - Stage Conversion Rates
   - Stuck Deals
   - Deal Aging
   - Forecasted Close

### 9.3 Report Types

- **Tabular Reports**: List views with filters
- **Summary Reports**: Grouped with subtotals
- **Matrix Reports**: Two-dimensional grouping
- **Trend Reports**: Time-series analysis
- **Funnel Reports**: Stage progression

---

## 10. Multi-Tenant Enterprise Features

### 10.1 Role-Based Access Control

#### Standard Roles
| Role | Permissions |
|------|-------------|
| **Owner** | Full system access, billing, delete org |
| **Admin** | User management, settings, all data |
| **Manager** | Team data, reports, limited settings |
| **Sales Rep** | Own data, team visibility (optional) |
| **Marketing** | Campaigns, leads, analytics |
| **Viewer** | Read-only access |

#### Custom Roles
- Organizations can define custom roles
- Granular permissions per entity type (Read, Create, Update, Delete)
- Field-level security (hide sensitive fields)
- Record-level security (own records, team records, all records)

### 10.2 Team Hierarchy

```
Organization
├── Division (e.g., North America)
│   ├── Region (e.g., Northeast)
│   │   ├── Team (e.g., Enterprise Sales)
│   │   │   ├── Manager
│   │   │   └── Sales Reps
│   │   └── Team (e.g., SMB Sales)
│   └── Region (e.g., Southeast)
└── Division (e.g., Europe)
```

### 10.3 Enterprise Features

| Feature | Description |
|---------|-------------|
| **SSO/SAML** | Single sign-on integration |
| **Audit Logs** | Complete activity audit trail |
| **Data Export** | Full data export capability |
| **API Access** | Programmatic access with rate limits |
| **Custom Objects** | User-defined entities |
| **Custom Fields** | Extend standard objects |
| **Sandbox** | Testing environment |
| **IP Whitelisting** | Restrict access by IP |
| **Two-Factor Auth** | Enhanced security |
| **Data Retention** | Configurable retention policies |

### 10.4 Multi-Tenant Architecture

```
┌─────────────────────────────────────────────┐
│              Load Balancer                   │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│              API Gateway                     │
│   - Tenant Identification (subdomain/header)│
│   - Rate Limiting (per tenant)              │
│   - Authentication                          │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│           Application Layer                  │
│   - Tenant Context Middleware               │
│   - Data Isolation Enforcement              │
│   - Feature Flags (per tier)                │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│           Database Layer                     │
│   - Row-Level Security (OrganizationId)     │
│   - Encrypted PII                           │
│   - Tenant-Specific Indexes                 │
└─────────────────────────────────────────────┘
```

---

## 11. Platform Constraints: Railway & Render

### 11.1 Platform Comparison

| Feature | Railway | Render |
|---------|---------|--------|
| **Free Tier** | 30-day trial only | Limited (sleeps after 15 min) |
| **Minimum Cost** | $5/month (Hobby) | $0-7/month |
| **PostgreSQL** | ✅ One-click, included in credits | ✅ Managed, $0+ |
| **Redis** | ✅ One-click | ✅ Native support |
| **Background Workers** | ⚠️ Manual setup as separate service | ✅ Native support |
| **Cron Jobs** | ⚠️ Basic (no dynamic params) | ✅ Native ($1/month) |
| **Websockets** | ✅ Supported | ✅ Supported |
| **Auto-scaling** | ✅ Pay for actual CPU/RAM used | ⚠️ Manual scaling |
| **BYOC** | ❌ No | ❌ No |
| **Volumes/Storage** | ✅ New feature, limited | ✅ Persistent disks |

### 11.2 Railway Specifics

#### Pricing Model
- **Hobby**: $5/month + usage credits
- **Pro**: $20/month + usage credits
- **Usage**: CPU ($20/vCPU), RAM ($10/GB), Storage ($0.15/GB)
- Pay for actual utilization (idle apps cost less)

#### Limitations to Consider
- No dedicated background worker type - must set up as separate service
- Each worker consumes credits from same pool
- Cron support is functional but limited (no dynamic parameters)
- Basic logging, limited observability tools
- Database backups require manual management

#### Best For
- Simple deployments with predictable workloads
- Apps that may be idle much of the time (cost savings)
- Quick prototyping and MVPs

### 11.3 Render Specifics

#### Pricing Model
- **Web Services**: $0-25+/month based on instance
- **Background Workers**: $7+/month
- **Cron Jobs**: $1/month
- **PostgreSQL**: $0 (free tier) to $20+/month
- **Redis**: $0 (free tier) to $10+/month

#### Limitations to Consider
- Free tier apps sleep after 15 minutes of inactivity
- Slow cold starts on free tier
- MongoDB requires external hosting
- No BYOC option

#### Best For
- Apps requiring persistent background workers
- Scheduled jobs/cron tasks
- Multi-service architectures
- SaaS backends with steady traffic

### 11.4 Architecture Recommendations for Railway/Render

#### Recommended Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Render Services                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────┐    │
│  │   Web Service   │    │   Background Worker     │    │
│  │   (API + Web)   │    │   (Hangfire/Jobs)       │    │
│  │   $7-25/month   │    │   $7/month              │    │
│  └─────────────────┘    └─────────────────────────┘    │
│           │                        │                    │
│           ▼                        ▼                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                 │   │
│  │              $7-20/month                         │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────┐    ┌─────────────────────────┐   │
│  │      Redis      │    │      Cron Jobs          │   │
│  │   $0-10/month   │    │   $1/month              │   │
│  └─────────────────┘    └─────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

External Services:
├── Stripe (Payments)
├── SendGrid (Email)
├── Meta APIs (Social)
└── S3/Cloudflare R2 (File Storage)
```

#### Estimated Monthly Costs (Render)

| Service | Free/Dev | Production |
|---------|----------|------------|
| Web Service | $0-7 | $25-85 |
| Background Worker | - | $7-25 |
| PostgreSQL | $0 | $20-50 |
| Redis | $0 | $10-25 |
| Cron Jobs | - | $1-5 |
| **Total** | **$0-7** | **$63-190** |

### 11.5 Background Job Strategy

Since background jobs are critical for:
- Workflow execution
- Email sequence sending
- Webhook delivery
- Lead score recalculation
- Data sync with integrations

**Recommended Approach for Render:**

```csharp
// Use Hangfire with PostgreSQL storage
services.AddHangfire(config => config
    .UsePostgreSqlStorage(connectionString));

// Deploy as separate Background Worker service on Render
// This keeps the web service responsive
```

**Job Types:**
| Job | Frequency | Priority |
|-----|-----------|----------|
| WorkflowExecutor | Event-driven | High |
| EmailSequenceSender | Every minute | High |
| WebhookDelivery | Event-driven | High |
| LeadScoreDecay | Daily | Low |
| DataCleanup | Daily | Low |

### 11.6 File Storage Strategy

Railway/Render have ephemeral file systems. For production:

**Option A: Cloudflare R2 (Recommended)**
- S3-compatible API
- Generous free tier (10GB storage, 10M requests)
- No egress fees
- $0.015/GB after free tier

**Option B: AWS S3**
- Industry standard
- More expensive egress
- $0.023/GB storage

**Option C: Render Disks**
- Attached to single service
- Not suitable for multi-service access
- Limited size

### 11.7 What's NOT Possible on Railway/Render

| Feature | Workaround |
|---------|------------|
| **Elasticsearch** | Use PostgreSQL full-text search or Algolia |
| **MongoDB** | Use PostgreSQL JSONB or MongoDB Atlas |
| **Custom domains SSL** | ✅ Supported on both |
| **WebSockets** | ✅ Supported on both |
| **Long-running requests** | Background jobs with polling |
| **Large file processing** | Queue to background worker |

---

## 12. Current Backend Gap Analysis

### Current State (PSS Portal)

| Component | Status | Notes |
|-----------|--------|-------|
| **Organizations (Multi-tenant)** | ✅ Exists | Basic implementation |
| **Users & Roles** | ✅ Exists | Owner, Admin, ClientManager, ClientViewer |
| **Audits** | ✅ Exists | Keep as low-priority "Assessments" module |
| **Findings** | ✅ Exists | Keep linked to Audits, low-priority |
| **Activity Logs** | ✅ Exists | Good foundation |
| **Attachments** | ✅ Exists | File storage ready |
| **JWT Auth** | ✅ Exists | Solid implementation |
| **PostgreSQL** | ✅ Exists | Scalable database |

### Required New Components

| Component | Priority | Complexity |
|-----------|----------|------------|
| **Stripe Billing/Subscriptions** | Critical | High |
| **Service Paywall System** | Critical | Medium |
| **Invoices & Payment Methods** | Critical | Medium |
| **Leads Entity** | Critical | Medium |
| **Contacts Entity** | Critical | Medium |
| **Accounts Entity** | Critical | Medium |
| **Opportunities Entity** | Critical | High |
| **Pipeline Stages** | Critical | Low |
| **Activities (Calls, Emails, Tasks)** | Critical | High |
| **Social Media Connections (FB/IG/WhatsApp)** | High | Very High |
| **Unified Social Inbox** | High | Very High |
| **Lead Scoring Engine** | High | High |
| **Workflow Automation Engine** | High | Very High |
| **Email Sequences** | High | High |
| **Campaigns** | High | Medium |
| **Custom Fields** | High | Medium |
| **Integrations Framework** | High | Very High |
| **Webhook System** | High | Medium |
| **Analytics/Reporting** | High | High |
| **Email Delivery Integration** | High | Medium |
| **Background Worker Service** | High | Medium |
| **Calendar Integration** | Medium | Medium |
| **TikTok Messaging** | Medium | High |
| **Data Enrichment Integration** | Medium | High |
| **Zapier Integration** | Medium | Medium |
| **Advanced RBAC** | Medium | Medium |
| **Custom Objects** | Low | High |
| **Audits/Assessments Module** | Low | Already exists |

---

## 13. Implementation Roadmap

### Phase 1: Billing & Service Framework (Iteration 3)
**Focus**: Pay-per-service foundation with Stripe

- [ ] Stripe integration setup
- [ ] Subscriptions & SubscriptionItems entities
- [ ] Invoices & PaymentMethods entities
- [ ] Service module enum and paywall middleware
- [ ] Stripe webhook handlers
- [ ] Checkout flow for subscribing to services
- [ ] Customer billing portal integration
- [ ] Service access control on all protected endpoints

### Phase 2: Core CRM Foundation (Iteration 4)
**Focus**: Basic lead-to-opportunity flow

- [ ] Leads entity with CRUD
- [ ] Contacts entity with CRUD
- [ ] Accounts entity with CRUD
- [ ] Opportunities entity with stages
- [ ] Pipeline stages (per-organization configurable)
- [ ] Basic activities (notes, tasks)
- [ ] Lead-to-Contact conversion
- [ ] Pipeline view UI

### Phase 3: Communication & Email (Iteration 5)
**Focus**: Email integration and activity tracking

- [ ] SendGrid integration
- [ ] Email templates system
- [ ] Email tracking (opens, clicks, bounces)
- [ ] Call logging
- [ ] Activity timeline on entities
- [ ] Background worker service (Hangfire)

### Phase 4: Social Media Inbox (Iteration 6)
**Focus**: Facebook, Instagram, WhatsApp messaging

- [ ] Meta Business API integration
- [ ] SocialConnections entity
- [ ] SocialConversations & SocialMessages entities
- [ ] OAuth flow for connecting accounts
- [ ] Webhook handlers for inbound messages
- [ ] Unified inbox UI
- [ ] Reply from CRM
- [ ] Link conversations to leads/contacts

### Phase 5: Automation Engine (Iteration 7)
**Focus**: Workflows and sequences

- [ ] Workflow builder UI
- [ ] Workflows, WorkflowSteps entities
- [ ] Event-based triggers
- [ ] Time-based triggers
- [ ] Email sequences
- [ ] WorkflowExecutor background job
- [ ] Automated task creation

### Phase 6: Lead Management (Iteration 8)
**Focus**: Lead capture and scoring

- [ ] Embeddable web forms
- [ ] Lead duplicate detection
- [ ] Lead scoring rules engine
- [ ] Lead assignment rules
- [ ] Import/Export (CSV)
- [ ] Tags system
- [ ] Lead score decay job

### Phase 7: Analytics & Reporting (Iteration 9)
**Focus**: Dashboards and insights

- [ ] Dashboard framework
- [ ] Pipeline analytics
- [ ] Activity analytics
- [ ] Lead source analytics
- [ ] Revenue/billing reports
- [ ] Export to PDF/Excel

### Phase 8: Integrations Hub (Iteration 10)
**Focus**: Third-party connections

- [ ] Webhook system (inbound/outbound)
- [ ] Zapier integration
- [ ] Calendar integration (Google/Outlook)
- [ ] Data enrichment APIs (optional)
- [ ] TikTok messaging (if available in region)

### Phase 9: Enterprise Features (Iteration 11)
**Focus**: Advanced enterprise needs

- [ ] Custom fields
- [ ] Advanced RBAC
- [ ] SSO/SAML
- [ ] API rate limiting per tier
- [ ] Multi-currency support
- [ ] Audit log enhancements

### Future / Low Priority
- [ ] Audits/Assessments module (already exists - enhance as needed)
- [ ] Custom objects
- [ ] AI-powered lead scoring
- [ ] Chatbot integration

---

## 14. Technical Specifications

### 14.1 API Endpoints (New)

```
# Leads
GET    /api/leads
GET    /api/leads/{id}
POST   /api/leads
PUT    /api/leads/{id}
PATCH  /api/leads/{id}/score
POST   /api/leads/{id}/convert
DELETE /api/leads/{id}

# Contacts
GET    /api/contacts
GET    /api/contacts/{id}
POST   /api/contacts
PUT    /api/contacts/{id}
DELETE /api/contacts/{id}

# Accounts
GET    /api/accounts
GET    /api/accounts/{id}
POST   /api/accounts
PUT    /api/accounts/{id}
DELETE /api/accounts/{id}

# Opportunities
GET    /api/opportunities
GET    /api/opportunities/{id}
POST   /api/opportunities
PUT    /api/opportunities/{id}
PATCH  /api/opportunities/{id}/stage
DELETE /api/opportunities/{id}

# Pipeline
GET    /api/pipeline/stages
POST   /api/pipeline/stages
PUT    /api/pipeline/stages/{id}
DELETE /api/pipeline/stages/{id}

# Activities
GET    /api/activities
GET    /api/activities/{id}
POST   /api/activities
PUT    /api/activities/{id}
DELETE /api/activities/{id}

# Campaigns
GET    /api/campaigns
GET    /api/campaigns/{id}
POST   /api/campaigns
PUT    /api/campaigns/{id}
DELETE /api/campaigns/{id}

# Lead Scoring
GET    /api/scoring/rules
POST   /api/scoring/rules
PUT    /api/scoring/rules/{id}
POST   /api/scoring/calculate/{leadId}

# Workflows
GET    /api/workflows
GET    /api/workflows/{id}
POST   /api/workflows
PUT    /api/workflows/{id}
POST   /api/workflows/{id}/activate
POST   /api/workflows/{id}/deactivate
DELETE /api/workflows/{id}

# Email Sequences
GET    /api/sequences
GET    /api/sequences/{id}
POST   /api/sequences
PUT    /api/sequences/{id}
POST   /api/sequences/{id}/enroll
POST   /api/sequences/{id}/pause
DELETE /api/sequences/{id}

# Webhooks
GET    /api/webhooks
POST   /api/webhooks
PUT    /api/webhooks/{id}
DELETE /api/webhooks/{id}
POST   /api/webhooks/inbound/{provider}

# Analytics
GET    /api/analytics/dashboard
GET    /api/analytics/pipeline
GET    /api/analytics/activities
GET    /api/analytics/leads
GET    /api/reports
POST   /api/reports
GET    /api/reports/{id}/execute

# Integrations
GET    /api/integrations
POST   /api/integrations/{provider}/connect
POST   /api/integrations/{provider}/disconnect
GET    /api/integrations/{provider}/status
```

### 14.2 Background Jobs Required

| Job | Trigger | Purpose |
|-----|---------|---------|
| **LeadScoreCalculation** | On lead update, scheduled | Recalculate scores |
| **LeadScoreDecay** | Daily | Reduce scores for inactive leads |
| **WorkflowExecutor** | Event-driven | Execute workflow steps |
| **EmailSequenceSender** | Scheduled (every minute) | Send sequence emails |
| **WebhookDelivery** | Event-driven | Deliver outbound webhooks |
| **DataEnrichment** | On lead create, scheduled | Enrich lead data |
| **EmailStatusSync** | Webhook/polling | Update email delivery status |
| **ReportGenerator** | Scheduled/on-demand | Generate reports |
| **DataCleanup** | Daily | Clean old data per retention policy |

### 14.3 Technology Additions

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Background Jobs** | Hangfire or Quartz.NET | Job scheduling |
| **Message Queue** | RabbitMQ or Azure Service Bus | Async processing |
| **Caching** | Redis | Performance, rate limiting |
| **Search** | Elasticsearch (optional) | Full-text search |
| **Email Delivery** | SendGrid API | Transactional emails |
| **File Storage** | AWS S3 or Azure Blob | Scalable storage |

---

## 15. Estimated Scope

### Development Effort Breakdown

| Phase | Focus | Entities | Endpoints | Est. Story Points |
|-------|-------|----------|-----------|-------------------|
| Phase 1 | Billing & Paywalls | 4 | 15 | 50-60 |
| Phase 2 | Core CRM | 6 | 30 | 50-60 |
| Phase 3 | Communication | 3 | 15 | 40-50 |
| Phase 4 | Social Media Inbox | 3 | 20 | 60-80 |
| Phase 5 | Automation Engine | 4 | 20 | 60-80 |
| Phase 6 | Lead Management | 3 | 15 | 40-50 |
| Phase 7 | Analytics | 2 | 15 | 30-40 |
| Phase 8 | Integrations Hub | 3 | 15 | 40-50 |
| Phase 9 | Enterprise | 3 | 10 | 30-40 |
| **Total** | | **~31** | **155+** | **400-510** |

### Database Tables Summary

| Category | New Tables |
|----------|------------|
| Billing | 4 (Subscriptions, SubscriptionItems, Invoices, PaymentMethods, UsageRecords) |
| Core Entities | 6 (Leads, Contacts, Accounts, Opportunities, OpportunityStages, Activities) |
| Activity Types | 2 (EmailActivities, CallActivities) |
| Social Messaging | 3 (SocialConnections, SocialConversations, SocialMessages) |
| Campaigns | 2 (Campaigns, CampaignMembers) |
| Lead Scoring | 3 (LeadScoringRules, LeadScoringCriteria, LeadScoreHistory) |
| Automation | 6 (Workflows, WorkflowSteps, WorkflowExecutions, EmailSequences, EmailSequenceSteps, EmailSequenceEnrollments) |
| Integrations | 4 (Integrations, Webhooks, WebhookDeliveries, ExternalSyncs) |
| Support | 3 (Tags, EntityTags, CustomFields) |
| **Total New** | **~33 tables** |

### What to Do with Existing Entities

| Entity | Recommendation |
|--------|----------------|
| **Audits** | ✅ Keep - low priority "Assessments" module, accessible from settings/tools |
| **Findings** | ✅ Keep - linked to Audits, used for assessment reports |
| **ActivityLogs** | ✅ Keep - rename to SystemAuditLogs |
| **Attachments** | ✅ Keep - associate with Leads/Contacts/Opportunities/Audits |
| **Organizations** | ✅ Keep - enhance with StripeCustomerId, billing settings |
| **OrganizationMembers** | ✅ Keep - enhance with team hierarchy |

---

## Sources

### CRM & Lead Generation
- [Monday.com - Lead Generation Automation](https://monday.com/blog/crm-and-sales/lead-generation-automation/)
- [ZoomInfo - AI Lead Generation Tools](https://pipeline.zoominfo.com/sales/ai-lead-generation-tools)
- [Hyegro - CRM Future Trends](https://www.hyegro.com/blog/crm-future-trends)
- [Salesforce - Lead Generation Tools](https://www.salesforce.com/marketing/lead-generation-guide/best-lead-generation-tools/)
- [DragonflyDB - CRM Database Schema](https://www.dragonflydb.io/databases/schema/crm)
- [Microsoft Dynamics 365 - Leads, Accounts, Contacts](https://www.microsoft.com/en-us/dynamics-365/blog/no-audience/2007/08/27/leads-accounts-contacts-and-opportunities/)
- [Formaloo - Lead Scoring Best Practices](https://www.formaloo.com/blog/lead-scoring-automation)
- [Coupler.io - CRM Dashboards](https://blog.coupler.io/crm-dashboards/)

### Payments & Billing
- [Stripe Billing Documentation](https://docs.stripe.com/billing)
- [Stripe Invoicing API](https://docs.stripe.com/invoicing/integration)
- [Stripe Subscriptions](https://docs.stripe.com/billing/subscriptions/build-subscriptions)
- [Stripe Webhooks](https://docs.stripe.com/webhooks)

### Social Media APIs
- [Bot.space - Instagram DM API Guide](https://www.bot.space/blog/the-instagram-dm-api-your-ultimate-guide-to-automation-sales-and-customer-loyalty-svpt5)
- [Brevo - Instagram Messenger for Business](https://www.brevo.com/blog/instagram-dm-api/)
- [Sinch - Instagram Direct Messaging API](https://sinch.com/apis/messaging/instagram/)
- [TikTok Business API Portal](https://business-api.tiktok.com/portal)
- [SleekFlow - TikTok Business Messaging](https://sleekflow.io/channels-integrations/tiktok-business-messaging)
- [Unipile - WhatsApp API Guide](https://www.unipile.com/whatsapp-api-a-complete-guide-to-integration/)
- [Respond.io - WhatsApp Cloud API](https://respond.io/blog/whatsapp-cloud-api)

### Platform Hosting
- [Northflank - Railway vs Render Comparison](https://northflank.com/blog/railway-vs-render)
- [Railway Pricing](https://railway.com/pricing)
- [Kuberns - Railway Hosting Explained](https://kuberns.com/blogs/post/railway-hosting-explained/)
- [Render Pricing](https://render.com/pricing)
- [Render Background Workers Documentation](https://render.com/docs/background-workers)

### Multi-Tenancy & Authorization
- [Permit.io - Multi-Tenant Authorization](https://www.permit.io/blog/best-practices-for-multi-tenant-authorization)
- [Clerk - Multi-Tenancy for B2B SaaS](https://clerk.com/blog/what-is-multi-tenancy-and-why-it-matters-for-B2B-SaaS)
- [Logto - Building Multi-Tenant SaaS](https://logto.medium.com/build-a-multi-tenant-saas-application-a-complete-guide-from-design-to-implementation-d109d041f253)

### Integrations
- [SendGrid](https://sendgrid.com/)
- [Zapier Webhooks](https://zapier.com/apps/webhook/integrations)
- [Apollo.io](https://www.apollo.io/)

---

*Document created for PSS Portal enterprise lead generation CRM transformation planning.*
*Last updated: January 2026*
