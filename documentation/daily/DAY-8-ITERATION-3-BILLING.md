# Day 8 Plan: Iteration 3 - Billing & Service Framework

**Date**: January 26, 2026
**Status**: Planning
**Prerequisite**: Frontend Landing Page Complete, Research Document Finalized

---

## Project Pivot Summary

The PSS Portal has pivoted from a consulting audit tool to an **Enterprise Lead Generation CRM Portal** with:
- Pay-per-service business model
- Service paywalls (customers pay for features they use)
- Social media messaging integration
- Full CRM capabilities

See `ENTERPRISE-LEADGEN-CRM-RESEARCH.md` for complete details.

---

## Iteration 3 Overview

**Goal**: Implement Stripe billing infrastructure with pay-per-service paywalls.

This is the **foundation** for all other features - customers must be able to subscribe to services before accessing them.

---

## Day 8 Objectives

### Phase 1: Stripe Integration Setup

#### 1.1 Install Stripe NuGet Package

```bash
dotnet add src/CAP.Api package Stripe.net
```

#### 1.2 Configure Stripe Settings

**appsettings.json additions:**
```json
{
  "Stripe": {
    "SecretKey": "",
    "PublishableKey": "",
    "WebhookSecret": "",
    "CustomerPortalUrl": ""
  }
}
```

**Environment variables for production:**
```
Stripe__SecretKey=sk_live_xxx
Stripe__PublishableKey=pk_live_xxx
Stripe__WebhookSecret=whsec_xxx
```

---

### Phase 2: Database Schema

#### 2.1 New Entities

**Subscriptions**
```csharp
public class Subscription
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string StripeSubscriptionId { get; set; }
    public string StripeCustomerId { get; set; }
    public string Status { get; set; } // active, canceled, past_due, trialing
    public DateTimeOffset CurrentPeriodStart { get; set; }
    public DateTimeOffset CurrentPeriodEnd { get; set; }
    public bool CancelAtPeriodEnd { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation
    public Organization Organization { get; set; }
    public ICollection<SubscriptionItem> Items { get; set; }
}
```

**SubscriptionItems**
```csharp
public class SubscriptionItem
{
    public Guid Id { get; set; }
    public Guid SubscriptionId { get; set; }
    public string StripeSubscriptionItemId { get; set; }
    public string StripePriceId { get; set; }
    public ServiceModule ServiceModule { get; set; }
    public int Quantity { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    // Navigation
    public Subscription Subscription { get; set; }
}

public enum ServiceModule
{
    BasicCRM = 0,           // Free - always accessible
    LeadGeneration = 1,     // Paid
    EmailAutomation = 2,    // Paid
    SocialInbox = 3,        // Paid
    AdvancedAnalytics = 4,  // Paid
    Integrations = 5,       // Paid
    EnterpriseFeatures = 6  // Paid
}
```

**Invoices**
```csharp
public class Invoice
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string StripeInvoiceId { get; set; }
    public string InvoiceNumber { get; set; }
    public string Status { get; set; } // draft, open, paid, void, uncollectible
    public decimal AmountDue { get; set; }
    public decimal AmountPaid { get; set; }
    public string Currency { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
    public string HostedInvoiceUrl { get; set; }
    public string InvoicePdfUrl { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    // Navigation
    public Organization Organization { get; set; }
}
```

**PaymentMethods**
```csharp
public class PaymentMethod
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string StripePaymentMethodId { get; set; }
    public string Type { get; set; } // card, bank_account
    public string Last4 { get; set; }
    public string Brand { get; set; } // visa, mastercard, etc.
    public int? ExpMonth { get; set; }
    public int? ExpYear { get; set; }
    public bool IsDefault { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    // Navigation
    public Organization Organization { get; set; }
}
```

#### 2.2 Organization Enhancement

Add to existing Organization entity:
```csharp
public string StripeCustomerId { get; set; }
```

#### 2.3 Migration

```bash
dotnet ef migrations add AddBillingEntities --project src/CAP.Infrastructure --startup-project src/CAP.Api
dotnet ef database update --project src/CAP.Infrastructure --startup-project src/CAP.Api
```

---

### Phase 3: Service Access Middleware

#### 3.1 Service Access Check

```csharp
// src/CAP.Api/Middleware/ServiceAccessMiddleware.cs
public class ServiceAccessMiddleware
{
    private readonly RequestDelegate _next;

    public ServiceAccessMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IServiceAccessService accessService)
    {
        var endpoint = context.GetEndpoint();
        var requiresService = endpoint?.Metadata.GetMetadata<RequiresServiceAttribute>();

        if (requiresService != null)
        {
            var orgId = context.User.GetOrganizationId();
            var hasAccess = await accessService.HasAccessAsync(orgId, requiresService.Service);

            if (!hasAccess)
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "subscription_required",
                    message = $"This feature requires a {requiresService.Service} subscription.",
                    service = requiresService.Service.ToString()
                });
                return;
            }
        }

        await _next(context);
    }
}
```

#### 3.2 RequiresService Attribute

```csharp
// src/CAP.Api/Attributes/RequiresServiceAttribute.cs
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class RequiresServiceAttribute : Attribute
{
    public ServiceModule Service { get; }

    public RequiresServiceAttribute(ServiceModule service)
    {
        Service = service;
    }
}
```

#### 3.3 Usage Example

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeadsController : ControllerBase
{
    [HttpGet]
    [RequiresService(ServiceModule.LeadGeneration)]
    public async Task<IActionResult> GetLeads()
    {
        // Only accessible if org has LeadGeneration subscription
    }
}
```

---

### Phase 4: Billing API Endpoints

#### 4.1 BillingController

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BillingController : ControllerBase
{
    // GET /api/billing/subscription - Get current subscription status
    // GET /api/billing/invoices - List invoices
    // GET /api/billing/payment-methods - List payment methods
    // POST /api/billing/checkout - Create Stripe checkout session
    // POST /api/billing/portal - Create customer portal session
}
```

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/billing/subscription` | GET | Get current subscription & services | User |
| `/api/billing/services` | GET | List available services with pricing | Public |
| `/api/billing/invoices` | GET | List organization invoices | User |
| `/api/billing/payment-methods` | GET | List saved payment methods | User |
| `/api/billing/checkout` | POST | Create Stripe checkout session | Owner/Admin |
| `/api/billing/portal` | POST | Create customer portal session | Owner/Admin |

#### 4.2 Webhook Controller

```csharp
[ApiController]
[Route("api/webhooks")]
public class WebhooksController : ControllerBase
{
    [HttpPost("stripe")]
    public async Task<IActionResult> StripeWebhook()
    {
        // Handle Stripe webhook events
    }
}
```

**Webhook Events to Handle:**
- `checkout.session.completed` - New subscription started
- `customer.subscription.created` - Provision access
- `customer.subscription.updated` - Update access levels
- `customer.subscription.deleted` - Revoke access
- `invoice.paid` - Record payment
- `invoice.payment_failed` - Handle failed payment
- `payment_method.attached` - Store payment method

---

### Phase 5: Stripe Products Setup

#### 5.1 Create Products in Stripe Dashboard

| Product | Price ID | Monthly | Yearly |
|---------|----------|---------|--------|
| Lead Generation Portal | price_leadgen_monthly | $99 | $999 |
| Email Automation | price_email_monthly | $49 | $499 |
| Social Media Inbox | price_social_monthly | $79 | $799 |
| Advanced Analytics | price_analytics_monthly | $29 | $299 |
| Integrations Hub | price_integrations_monthly | $49 | $499 |
| Enterprise Features | price_enterprise_monthly | $199 | $1999 |

#### 5.2 Service-Price Mapping

```csharp
public static class StripePriceMapping
{
    public static readonly Dictionary<string, ServiceModule> PriceToService = new()
    {
        ["price_leadgen_monthly"] = ServiceModule.LeadGeneration,
        ["price_leadgen_yearly"] = ServiceModule.LeadGeneration,
        ["price_email_monthly"] = ServiceModule.EmailAutomation,
        ["price_email_yearly"] = ServiceModule.EmailAutomation,
        ["price_social_monthly"] = ServiceModule.SocialInbox,
        ["price_social_yearly"] = ServiceModule.SocialInbox,
        // ... etc
    };
}
```

---

## Implementation Checklist

### Database & Entities
- [ ] Create Subscription entity
- [ ] Create SubscriptionItem entity
- [ ] Create Invoice entity
- [ ] Create PaymentMethod entity
- [ ] Create ServiceModule enum
- [ ] Add StripeCustomerId to Organization
- [ ] Generate and apply migration

### Services
- [ ] Create IStripeService interface
- [ ] Implement StripeService
- [ ] Create IServiceAccessService interface
- [ ] Implement ServiceAccessService
- [ ] Create IBillingService interface
- [ ] Implement BillingService

### Middleware
- [ ] Create RequiresServiceAttribute
- [ ] Create ServiceAccessMiddleware
- [ ] Register middleware in pipeline

### Controllers
- [ ] Create BillingController
- [ ] Implement GET /subscription
- [ ] Implement GET /services
- [ ] Implement GET /invoices
- [ ] Implement GET /payment-methods
- [ ] Implement POST /checkout
- [ ] Implement POST /portal
- [ ] Create WebhooksController
- [ ] Implement Stripe webhook handler

### Stripe Setup
- [ ] Create Stripe account (if needed)
- [ ] Create products in Stripe
- [ ] Create prices for each product
- [ ] Set up webhook endpoint
- [ ] Configure environment variables

### Testing
- [ ] Test checkout flow locally
- [ ] Test webhook handling
- [ ] Test service access middleware
- [ ] Test subscription status endpoints
- [ ] Deploy to staging
- [ ] Test with Stripe test mode

### Frontend Integration
- [ ] Create pricing page component
- [ ] Create checkout button
- [ ] Create billing settings page
- [ ] Show locked/unlocked services on dashboard

---

## Files to Create

```
src/CAP.Domain/Entities/
├── Subscription.cs
├── SubscriptionItem.cs
├── Invoice.cs
├── PaymentMethod.cs
└── Enums/ServiceModule.cs

src/CAP.Application/Services/
├── IStripeService.cs
├── IServiceAccessService.cs
└── IBillingService.cs

src/CAP.Infrastructure/Services/
├── StripeService.cs
├── ServiceAccessService.cs
└── BillingService.cs

src/CAP.Api/
├── Controllers/
│   ├── BillingController.cs
│   └── WebhooksController.cs
├── Middleware/
│   └── ServiceAccessMiddleware.cs
└── Attributes/
    └── RequiresServiceAttribute.cs

frontend/src/
├── pages/
│   ├── PricingPage.tsx
│   └── BillingSettingsPage.tsx
├── components/
│   └── billing/
│       ├── ServiceCard.tsx
│       ├── SubscriptionStatus.tsx
│       └── InvoiceList.tsx
└── api/
    └── billing.ts
```

---

## Definition of Done

- [ ] Stripe integration configured
- [ ] All billing entities created and migrated
- [ ] Service access middleware working
- [ ] Checkout flow creates subscriptions
- [ ] Webhooks properly provision/revoke access
- [ ] Customer portal accessible
- [ ] Invoice history visible
- [ ] At least one service gated by paywall
- [ ] All endpoints documented in Swagger
- [ ] Deployed to production with Stripe live keys
- [ ] Day 8 completion report written

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Checkout Success Rate | >95% |
| Webhook Processing | <5s |
| Service Access Check | <50ms |
| Zero Payment Bugs | Yes |

---

## Next Iterations Preview

After Billing (Phase 1) is complete:

| Phase | Focus | Iteration |
|-------|-------|-----------|
| 2 | Core CRM (Leads, Contacts, Accounts, Opportunities) | 4 |
| 3 | Communication & Email | 5 |
| 4 | Social Media Inbox | 6 |
| 5 | Automation Engine | 7 |
| 6 | Lead Management | 8 |
| 7 | Analytics | 9 |
| 8 | Integrations Hub | 10 |
| 9 | Enterprise Features | 11 |

---

## Resources

- **Research Document**: `ENTERPRISE-LEADGEN-CRM-RESEARCH.md`
- **Stripe Docs**: https://docs.stripe.com/billing
- **Stripe .NET SDK**: https://github.com/stripe/stripe-dotnet
- **Production API**: https://pss-portal-api.onrender.com
- **Swagger**: https://pss-portal-api.onrender.com/swagger

---

**Ready to implement Stripe billing!**
