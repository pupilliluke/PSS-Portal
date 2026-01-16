# PSS Portal - Complete Implementation Plan
## Consulting Workflow Audit Portal (SaaS Platform)

**Last Updated**: January 12 2026
**Version**: 2.0 - Optimized for Rapid Deployment

---

## Executive Summary

Build a production-ready client portal + audit delivery platform that serves as both:
1. **Your internal operating system** for consulting delivery
2. **A portfolio-grade .NET backend** proving real-world SWE skills

**Key Differentiators**:
- Multi-tenant architecture from day one
- Industry-standard tech stack (hireable)
- Rapid 3-iteration deployment strategy
- Production-ready security and observability

---

## Tech Stack (Updated for 2026)

### Backend
- **.NET 8** (ASP.NET Core Web API) - Stable LTS release
- **C#** with nullable reference types enabled
- **Entity Framework Core** 8.x (ORM + migrations)
- **PostgreSQL 16** (primary database)
- **Docker** for local development

### Authentication & Authorization
- **ASP.NET Core Identity** (user management)
- **JWT** (access tokens - 30 min expiry)
- **Refresh Tokens** (7 day expiry, stored in DB)
- **Policy-based RBAC** (Owner/Admin/ClientManager/ClientViewer)

### Validation & API
- **FluentValidation** (input validation)
- **Swagger/OpenAPI** (API documentation)
- **DTOs** separate from domain entities

### Logging & Monitoring
- **Serilog** (structured logging)
- **Health Checks** (DB + app status)
- **Activity Logs** (audit trail for compliance)

### Background Jobs
- **Hangfire** (reminders, scheduled reports, status nudges)

### DevOps
- **Docker + docker-compose** (API + DB)
- **GitHub Actions** (CI/CD pipeline)
- **Azure** deployment target:
  - Azure App Service or Container Apps
  - Azure Database for PostgreSQL
  - Azure Key Vault (secrets management)

### Frontend (Phase 2)
- **Next.js 14+** with TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **React Query** (data fetching)
- JWT handling + automatic refresh flow

---

## Core Product Scope (MVP)

### Multi-Tenancy & Users
- **Organization** (tenant) - represents a client company
- **Users** belong to organizations via membership
- **Roles**: Owner (you), Admin (you/team), ClientManager, ClientViewer
- **Org Scoping**: Every query filtered by `org_id` from JWT claims

### Workflow Audit Objects

#### 1. Client Intake
- Questionnaire responses (structured JSON + versioning)
- Tool inventory tracking (CRM/CMS/Ads/Analytics/etc.)
- File uploads (screenshots, data exports, documentation)

#### 2. Audit
- **Status Flow**: Draft → In Review → Delivered → In Progress → Closed
- Audit metadata: date, auditor assignment, notes
- Linked to organization for scoping
- Contains multiple findings

#### 3. Findings
- **Category**: Automation, Data, Marketing, Security, Operations
- **Severity**: Low/Medium/High
- **Effort**: S/M/L (small/medium/large)
- **ROI Estimate**: Expected impact
- **Recommendation**: Detailed next steps
- **Status Tracking**: Identified → In Progress → Resolved

#### 4. Deliverables
- Generated report exports (HTML initially, PDF later)
- Versioned storage of delivered audits
- Client-accessible portal view

#### 5. Activity Log (Audit Trail)
- Who changed what, when
- Entity type, entity ID, action performed
- JSON diff of changes (optional)
- Compliance and credibility

---

## Data Model (Entities)

### Core Entities

```
Organization
├── Id (Guid, PK)
├── Name (string)
├── CreatedAt (DateTimeOffset)
└── Members (List<OrganizationMember>)

User (Identity)
├── Id (string, PK)
├── UserName (string)
├── Email (string)
├── PasswordHash (string)
├── RefreshToken (string, nullable)
└── RefreshTokenExpiry (DateTime, nullable)

OrganizationMember
├── Id (Guid, PK)
├── OrganizationId (Guid, FK)
├── UserId (string, FK)
├── Role (string) - "Owner", "Admin", "ClientManager", "ClientViewer"
└── JoinedAt (DateTimeOffset)

IntakeForm
├── Id (Guid, PK)
├── OrganizationId (Guid, FK)
├── Title (string)
├── Template (JSON) - question structure
├── Version (int)
└── CreatedAt (DateTimeOffset)

IntakeResponse
├── Id (Guid, PK)
├── OrganizationId (Guid, FK)
├── FormId (Guid, FK)
├── Responses (JSON) - structured answers
├── CompletedBy (string, FK to User)
└── CompletedAt (DateTimeOffset)

Audit
├── Id (Guid, PK)
├── OrganizationId (Guid, FK)
├── Title (string)
├── Status (string) - "Draft", "InReview", "Delivered", "InProgress", "Closed"
├── AuditorId (string, FK to User, nullable)
├── Notes (string, nullable)
├── CreatedAt (DateTimeOffset)
├── UpdatedAt (DateTimeOffset)
└── Findings (List<Finding>)

Finding
├── Id (Guid, PK)
├── AuditId (Guid, FK)
├── OrganizationId (Guid, FK) - denormalized for fast scoping
├── Category (string) - "Automation", "Data", "Marketing", "Security", "Ops"
├── Severity (string) - "Low", "Medium", "High"
├── Effort (string) - "S", "M", "L"
├── Title (string)
├── Description (string)
├── Recommendation (string)
├── RoiEstimate (string, nullable)
├── Status (string) - "Identified", "InProgress", "Resolved"
├── CreatedAt (DateTimeOffset)
└── UpdatedAt (DateTimeOffset)

Attachment
├── Id (Guid, PK)
├── OrganizationId (Guid, FK)
├── AuditId (Guid, FK, nullable)
├── IntakeResponseId (Guid, FK, nullable)
├── FileName (string)
├── ContentType (string)
├── FileSize (long)
├── StorageKey (string) - blob storage reference
├── UploadedBy (string, FK to User)
└── UploadedAt (DateTimeOffset)

ActivityLog
├── Id (Guid, PK)
├── OrganizationId (Guid, FK)
├── UserId (string, FK)
├── Action (string) - "Created", "Updated", "Deleted", "StatusChanged"
├── EntityType (string) - "Audit", "Finding", "IntakeResponse"
├── EntityId (Guid)
├── Changes (JSON, nullable) - what changed
└── Timestamp (DateTimeOffset)
```

### Database Indexes (Performance Critical)

```csharp
// Organization
HasIndex(x => x.Name);

// OrganizationMember
HasIndex(x => new { x.OrganizationId, x.UserId }).IsUnique();

// Audit
HasIndex(x => x.OrganizationId);
HasIndex(x => new { x.OrganizationId, x.Status, x.CreatedAt });

// Finding
HasIndex(x => x.OrganizationId);
HasIndex(x => x.AuditId);
HasIndex(x => new { x.OrganizationId, x.Status });

// Attachment
HasIndex(x => x.OrganizationId);
HasIndex(x => x.AuditId);

// ActivityLog
HasIndex(x => x.OrganizationId);
HasIndex(x => new { x.OrganizationId, x.Timestamp });
```

---

## API Endpoints (Complete Set)

### Authentication (`/api/auth`)
- `POST /register` - Create user + organization (auto-Owner role)
- `POST /login` - Email/password → JWT + refresh token
- `POST /refresh` - Refresh token → new JWT
- `POST /logout` - Invalidate refresh token
- `POST /invite` - Invite user to organization (Owner/Admin only)

### Organizations (`/api/organizations`)
- `GET /` - List user's organizations
- `GET /{id}` - Get organization details
- `PUT /{id}` - Update organization (Owner only)
- `GET /{id}/members` - List members
- `POST /{id}/members` - Add member (Owner/Admin)
- `PUT /{id}/members/{userId}` - Update member role (Owner only)
- `DELETE /{id}/members/{userId}` - Remove member (Owner only)

### Intake Forms (`/api/intake-forms`)
- `GET /` - List forms (paginated)
- `GET /{id}` - Get form template
- `POST /` - Create form template (Owner/Admin)
- `PUT /{id}` - Update form template (Owner/Admin)
- `POST /{id}/responses` - Submit response
- `GET /{id}/responses` - List responses (paginated)

### Audits (`/api/audits`)
- `GET /` - List audits (paginated, filterable by status)
- `GET /{id}` - Get audit details with findings
- `POST /` - Create audit (Owner/Admin)
- `PUT /{id}` - Update audit (Owner/Admin)
- `PATCH /{id}/status` - Update status (Owner/Admin)
- `DELETE /{id}` - Delete audit (Owner only)

### Findings (`/api/findings`)
- `GET /` - List findings (paginated, filterable by audit/category/severity)
- `GET /{id}` - Get finding details
- `POST /` - Create finding (Owner/Admin)
- `PUT /{id}` - Update finding (Owner/Admin)
- `PATCH /{id}/status` - Update status
- `DELETE /{id}` - Delete finding (Owner only)

### Attachments (`/api/attachments`)
- `POST /` - Upload file (scoped to org + audit/intake)
- `GET /{id}` - Download file (org-scoped auth check)
- `DELETE /{id}` - Delete file (Owner/Admin)

### Activity Logs (`/api/activity`)
- `GET /` - List activity logs (paginated, filterable by entity)
- `GET /audits/{auditId}` - Get audit-specific activity

### System
- `GET /health` - Health check endpoint
- `GET /error` - Global error handler endpoint

---

## Implementation: 3-Iteration Roadmap

## 🚀 **ITERATION 1: Secure Foundation** (Week 1 - Deploy at End)

**Goal**: Deployable, secure API with core auth + one working feature

### Phase 1A: Project Setup (2-4 hours)

#### 1. Create Solution Structure
```bash
# Create solution and projects
dotnet new sln -n ConsultingAuditPortal

dotnet new webapi -n CAP.Api -o src/CAP.Api
dotnet new classlib -n CAP.Domain -o src/CAP.Domain
dotnet new classlib -n CAP.Application -o src/CAP.Application
dotnet new classlib -n CAP.Infrastructure -o src/CAP.Infrastructure

# Add to solution
dotnet sln add src/CAP.Api/CAP.Api.csproj
dotnet sln add src/CAP.Domain/CAP.Domain.csproj
dotnet sln add src/CAP.Application/CAP.Application.csproj
dotnet sln add src/CAP.Infrastructure/CAP.Infrastructure.csproj

# Setup project references
dotnet add src/CAP.Api reference src/CAP.Application src/CAP.Infrastructure
dotnet add src/CAP.Application reference src/CAP.Domain
dotnet add src/CAP.Infrastructure reference src/CAP.Application src/CAP.Domain
```

#### 2. Install NuGet Packages
```bash
# Infrastructure: EF Core + PostgreSQL + Identity
dotnet add src/CAP.Infrastructure package Microsoft.EntityFrameworkCore
dotnet add src/CAP.Infrastructure package Microsoft.EntityFrameworkCore.Design
dotnet add src/CAP.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add src/CAP.Infrastructure package Microsoft.AspNetCore.Identity.EntityFrameworkCore

# API: JWT + Swagger
dotnet add src/CAP.Api package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add src/CAP.Api package Swashbuckle.AspNetCore

# Logging
dotnet add src/CAP.Api package Serilog.AspNetCore
dotnet add src/CAP.Api package Serilog.Sinks.Console

# Validation
dotnet add src/CAP.Api package FluentValidation.AspNetCore

# Health Checks
dotnet add src/CAP.Api package AspNetCore.HealthChecks.NpgSql
```

#### 3. Docker Compose for PostgreSQL
```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:16
    container_name: cap_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: cap
      POSTGRES_PASSWORD: cap_password
      POSTGRES_DB: cap_dev
    ports:
      - "5432:5432"
    volumes:
      - cap_pgdata:/var/lib/postgresql/data

volumes:
  cap_pgdata:
```

```bash
docker compose up -d
```

### Phase 1B: Domain Layer (1 hour)

Create all domain entities in `src/CAP.Domain/Entities/`:
- `Organization.cs`
- `OrganizationMember.cs`
- `Audit.cs`
- `Finding.cs`
- `IntakeForm.cs`
- `IntakeResponse.cs`
- `Attachment.cs`
- `ActivityLog.cs`

### Phase 1C: Infrastructure Layer (2-3 hours)

#### 1. AppUser (Identity)
```csharp
// src/CAP.Infrastructure/Auth/AppUser.cs
using Microsoft.AspNetCore.Identity;

namespace CAP.Infrastructure.Auth;

public class AppUser : IdentityUser
{
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
}
```

#### 2. DbContext
```csharp
// src/CAP.Infrastructure/Data/AppDbContext.cs
using CAP.Domain.Entities;
using CAP.Infrastructure.Auth;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CAP.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<OrganizationMember> OrganizationMembers => Set<OrganizationMember>();
    public DbSet<Audit> Audits => Set<Audit>();
    public DbSet<Finding> Findings => Set<Finding>();
    public DbSet<IntakeForm> IntakeForms => Set<IntakeForm>();
    public DbSet<IntakeResponse> IntakeResponses => Set<IntakeResponse>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Organization
        builder.Entity<Organization>(b =>
        {
            b.HasIndex(x => x.Name);
        });

        // OrganizationMember
        builder.Entity<OrganizationMember>(b =>
        {
            b.HasIndex(x => new { x.OrganizationId, x.UserId }).IsUnique();
        });

        // Audit
        builder.Entity<Audit>(b =>
        {
            b.HasIndex(x => x.OrganizationId);
            b.HasIndex(x => new { x.OrganizationId, x.Status, x.CreatedAt });
        });

        // Finding
        builder.Entity<Finding>(b =>
        {
            b.HasIndex(x => x.OrganizationId);
            b.HasIndex(x => x.AuditId);
            b.HasIndex(x => new { x.OrganizationId, x.Status });
        });

        // IntakeForm
        builder.Entity<IntakeForm>(b =>
        {
            b.HasIndex(x => x.OrganizationId);
        });

        // IntakeResponse
        builder.Entity<IntakeResponse>(b =>
        {
            b.HasIndex(x => x.OrganizationId);
            b.HasIndex(x => x.FormId);
        });

        // Attachment
        builder.Entity<Attachment>(b =>
        {
            b.HasIndex(x => x.OrganizationId);
            b.HasIndex(x => x.AuditId);
        });

        // ActivityLog
        builder.Entity<ActivityLog>(b =>
        {
            b.HasIndex(x => x.OrganizationId);
            b.HasIndex(x => new { x.OrganizationId, x.Timestamp });
        });
    }
}
```

### Phase 1D: Application Layer (1 hour)

#### 1. Current Organization Context
```csharp
// src/CAP.Application/Common/ICurrentOrg.cs
namespace CAP.Application.Common;

public interface ICurrentOrg
{
    Guid OrganizationId { get; }
}
```

#### 2. Pagination Support
```csharp
// src/CAP.Application/Common/PagedRequest.cs
namespace CAP.Application.Common;

public record PagedRequest(int Page = 1, int PageSize = 20);

public record PagedResponse<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
)
{
    public static PagedResponse<T> Create(List<T> items, int total, int page, int pageSize)
    {
        var totalPages = (int)Math.Ceiling(total / (double)pageSize);
        return new PagedResponse<T>(items, total, page, pageSize, totalPages);
    }
}
```

### Phase 1E: API Layer (4-6 hours)

#### 1. Configuration
```json
// src/CAP.Api/appsettings.Development.json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=cap_dev;Username=cap;Password=cap_password"
  },
  "Jwt": {
    "Issuer": "CAP",
    "Audience": "CAP",
    "SigningKey": "DEV_ONLY_REPLACE_WITH_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS_LONG",
    "AccessTokenMinutes": 30,
    "RefreshTokenDays": 7
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  }
}
```

#### 2. Program.cs (Complete Setup)
```csharp
// src/CAP.Api/Program.cs
using System.Text;
using CAP.Api.Middleware;
using CAP.Application.Common;
using CAP.Infrastructure.Auth;
using CAP.Infrastructure.Data;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Serilog
builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .WriteTo.Console());

builder.Services.AddHttpContextAccessor();

// Database
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// Identity
builder.Services
    .AddIdentityCore<AppUser>(opt =>
    {
        opt.Password.RequiredLength = 8;
        opt.User.RequireUniqueEmail = true;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

// JWT Authentication
var jwtSection = builder.Configuration.GetSection("Jwt");
var signingKey = jwtSection["SigningKey"]!;
var keyBytes = Encoding.UTF8.GetBytes(signingKey);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

// Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("OwnerOrAdmin", p =>
        p.RequireClaim("role", "Owner", "Admin"));
    options.AddPolicy("Owner", p =>
        p.RequireClaim("role", "Owner"));
});

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? context.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }));
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

// Current Organization Context
builder.Services.AddScoped<ICurrentOrg, CurrentOrgFromClaims>();

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddFluentValidationAutoValidation();

// Controllers
builder.Services.AddControllers();

// Health Checks
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("Default")!);

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Consulting Audit Portal API",
        Version = "v1",
        Description = "API for managing consulting workflow audits"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Middleware Pipeline
app.UseSerilogRequestLogging();

app.UseExceptionHandler("/error");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
```

#### 3. Current Organization Implementation
```csharp
// src/CAP.Api/Middleware/CurrentOrgFromClaims.cs
using System.Security.Claims;
using CAP.Application.Common;

namespace CAP.Api.Middleware;

public class CurrentOrgFromClaims : ICurrentOrg
{
    private readonly IHttpContextAccessor _http;

    public CurrentOrgFromClaims(IHttpContextAccessor http) => _http = http;

    public Guid OrganizationId
    {
        get
        {
            var user = _http.HttpContext?.User;
            var orgIdStr = user?.FindFirstValue("org_id");
            if (Guid.TryParse(orgIdStr, out var orgId)) return orgId;
            return Guid.Empty; // For endpoints that don't require org (login/register)
        }
    }
}
```

#### 4. Error Controller
```csharp
// src/CAP.Api/Controllers/ErrorController.cs
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Api.Controllers;

[ApiController]
[ApiExplorerSettings(IgnoreApi = true)]
public class ErrorController : ControllerBase
{
    [Route("/error")]
    public IActionResult Error()
    {
        var context = HttpContext.Features.Get<IExceptionHandlerFeature>();
        var exception = context?.Error;

        // Log exception here
        return Problem(
            title: "An error occurred",
            statusCode: 500
        );
    }
}
```

#### 5. Auth Controller (Register, Login, Refresh)
```csharp
// src/CAP.Api/Controllers/AuthController.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CAP.Domain.Entities;
using CAP.Infrastructure.Auth;
using CAP.Infrastructure.Data;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CAP.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _users;
    private readonly AppDbContext _db;
    private readonly IConfiguration _cfg;

    public AuthController(UserManager<AppUser> users, AppDbContext db, IConfiguration cfg)
    {
        _users = users;
        _db = db;
        _cfg = cfg;
    }

    // DTOs
    public record RegisterRequest(string Email, string Password, string OrganizationName);
    public record LoginRequest(string Email, string Password);
    public record RefreshRequest(string RefreshToken);
    public record AuthResponse(string AccessToken, string RefreshToken, Guid OrganizationId);

    // Validators
    public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
            RuleFor(x => x.OrganizationName).NotEmpty().MaximumLength(200);
        }
    }

    public class LoginRequestValidator : AbstractValidator<LoginRequest>
    {
        public LoginRequestValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Password).NotEmpty();
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req)
    {
        // Create user
        var user = new AppUser { UserName = req.Email, Email = req.Email };
        var createResult = await _users.CreateAsync(user, req.Password);
        if (!createResult.Succeeded)
            return BadRequest(createResult.Errors);

        // Create organization
        var org = new Organization { Name = req.OrganizationName };
        _db.Organizations.Add(org);

        // Add user as Owner
        _db.OrganizationMembers.Add(new OrganizationMember
        {
            OrganizationId = org.Id,
            UserId = user.Id,
            Role = "Owner"
        });

        await _db.SaveChangesAsync();

        // Generate tokens
        var (accessToken, refreshToken) = await GenerateTokensAsync(user, org.Id, "Owner");

        return Ok(new AuthResponse(accessToken, refreshToken, org.Id));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
    {
        var user = await _users.Users.FirstOrDefaultAsync(x => x.Email == req.Email);
        if (user is null) return Unauthorized("Invalid credentials");

        var validPassword = await _users.CheckPasswordAsync(user, req.Password);
        if (!validPassword) return Unauthorized("Invalid credentials");

        // Get user's first organization
        var membership = await _db.OrganizationMembers
            .Where(m => m.UserId == user.Id)
            .OrderBy(m => m.JoinedAt)
            .FirstOrDefaultAsync();

        if (membership is null)
            return Unauthorized("No organization membership found");

        // Generate tokens
        var (accessToken, refreshToken) = await GenerateTokensAsync(
            user, membership.OrganizationId, membership.Role);

        return Ok(new AuthResponse(accessToken, refreshToken, membership.OrganizationId));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh(RefreshRequest req)
    {
        var user = await _users.Users.FirstOrDefaultAsync(u => u.RefreshToken == req.RefreshToken);

        if (user is null || user.RefreshTokenExpiry <= DateTime.UtcNow)
            return Unauthorized("Invalid or expired refresh token");

        // Get user's first organization
        var membership = await _db.OrganizationMembers
            .Where(m => m.UserId == user.Id)
            .OrderBy(m => m.JoinedAt)
            .FirstOrDefaultAsync();

        if (membership is null)
            return Unauthorized("No organization membership found");

        // Generate new tokens
        var (accessToken, refreshToken) = await GenerateTokensAsync(
            user, membership.OrganizationId, membership.Role);

        return Ok(new AuthResponse(accessToken, refreshToken, membership.OrganizationId));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Ok();

        var user = await _users.FindByIdAsync(userId);
        if (user is not null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            await _users.UpdateAsync(user);
        }

        return Ok();
    }

    // Helper Methods
    private async Task<(string accessToken, string refreshToken)> GenerateTokensAsync(
        AppUser user, Guid orgId, string role)
    {
        // Generate access token (JWT)
        var jwt = _cfg.GetSection("Jwt");
        var issuer = jwt["Issuer"]!;
        var audience = jwt["Audience"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SigningKey"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new("org_id", orgId.ToString()),
            new("role", role)
        };

        var minutes = int.Parse(jwt["AccessTokenMinutes"] ?? "30");
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(minutes),
            signingCredentials: creds
        );

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

        // Generate refresh token
        var refreshToken = GenerateRefreshToken();
        var refreshDays = int.Parse(jwt["RefreshTokenDays"] ?? "7");

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(refreshDays);
        await _users.UpdateAsync(user);

        return (accessToken, refreshToken);
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
```

#### 6. Audits Controller (First Real Feature)
```csharp
// src/CAP.Api/Controllers/AuditsController.cs
using CAP.Application.Common;
using CAP.Domain.Entities;
using CAP.Infrastructure.Data;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CAP.Api.Controllers;

[ApiController]
[Route("api/audits")]
[Authorize]
public class AuditsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentOrg _org;

    public AuditsController(AppDbContext db, ICurrentOrg org)
    {
        _db = db;
        _org = org;
    }

    // DTOs
    public record AuditResponse(
        Guid Id,
        string Title,
        string Status,
        string? AuditorId,
        string? Notes,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt
    );

    public record AuditDetailResponse(
        Guid Id,
        string Title,
        string Status,
        string? AuditorId,
        string? Notes,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,
        List<FindingSummary> Findings
    );

    public record FindingSummary(
        Guid Id,
        string Title,
        string Category,
        string Severity,
        string Status
    );

    public record CreateAuditRequest(string Title, string? Notes);
    public record UpdateAuditRequest(string Title, string? Notes);
    public record UpdateStatusRequest(string Status);

    // Validators
    public class CreateAuditRequestValidator : AbstractValidator<CreateAuditRequest>
    {
        public CreateAuditRequestValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Notes).MaximumLength(2000).When(x => x.Notes != null);
        }
    }

    public class UpdateAuditRequestValidator : AbstractValidator<UpdateAuditRequest>
    {
        public UpdateAuditRequestValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Notes).MaximumLength(2000).When(x => x.Notes != null);
        }
    }

    public class UpdateStatusRequestValidator : AbstractValidator<UpdateStatusRequest>
    {
        public UpdateStatusRequestValidator()
        {
            RuleFor(x => x.Status)
                .Must(s => new[] { "Draft", "InReview", "Delivered", "InProgress", "Closed" }.Contains(s))
                .WithMessage("Invalid status");
        }
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<AuditResponse>>> List(
        [FromQuery] PagedRequest page,
        [FromQuery] string? status = null)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized("Missing org_id claim");

        var query = _db.Audits.Where(a => a.OrganizationId == _org.OrganizationId);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(a => a.Status == status);

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page.Page - 1) * page.PageSize)
            .Take(page.PageSize)
            .Select(a => new AuditResponse(
                a.Id,
                a.Title,
                a.Status,
                a.AuditorId,
                a.Notes,
                a.CreatedAt,
                a.UpdatedAt
            ))
            .ToListAsync();

        return Ok(PagedResponse<AuditResponse>.Create(items, total, page.Page, page.PageSize));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AuditDetailResponse>> Get(Guid id)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized("Missing org_id claim");

        var audit = await _db.Audits
            .Include(a => a.Findings)
            .Where(a => a.Id == id && a.OrganizationId == _org.OrganizationId)
            .Select(a => new AuditDetailResponse(
                a.Id,
                a.Title,
                a.Status,
                a.AuditorId,
                a.Notes,
                a.CreatedAt,
                a.UpdatedAt,
                a.Findings.Select(f => new FindingSummary(
                    f.Id,
                    f.Title,
                    f.Category,
                    f.Severity,
                    f.Status
                )).ToList()
            ))
            .FirstOrDefaultAsync();

        if (audit is null)
            return NotFound();

        return Ok(audit);
    }

    [HttpPost]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<ActionResult<AuditResponse>> Create(CreateAuditRequest req)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized("Missing org_id claim");

        var audit = new Audit
        {
            OrganizationId = _org.OrganizationId,
            Title = req.Title,
            Status = "Draft",
            Notes = req.Notes,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _db.Audits.Add(audit);
        await _db.SaveChangesAsync();

        return Ok(new AuditResponse(
            audit.Id,
            audit.Title,
            audit.Status,
            audit.AuditorId,
            audit.Notes,
            audit.CreatedAt,
            audit.UpdatedAt
        ));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<ActionResult<AuditResponse>> Update(Guid id, UpdateAuditRequest req)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized("Missing org_id claim");

        var audit = await _db.Audits
            .FirstOrDefaultAsync(a => a.Id == id && a.OrganizationId == _org.OrganizationId);

        if (audit is null)
            return NotFound();

        audit.Title = req.Title;
        audit.Notes = req.Notes;
        audit.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new AuditResponse(
            audit.Id,
            audit.Title,
            audit.Status,
            audit.AuditorId,
            audit.Notes,
            audit.CreatedAt,
            audit.UpdatedAt
        ));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<ActionResult<AuditResponse>> UpdateStatus(Guid id, UpdateStatusRequest req)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized("Missing org_id claim");

        var audit = await _db.Audits
            .FirstOrDefaultAsync(a => a.Id == id && a.OrganizationId == _org.OrganizationId);

        if (audit is null)
            return NotFound();

        audit.Status = req.Status;
        audit.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new AuditResponse(
            audit.Id,
            audit.Title,
            audit.Status,
            audit.AuditorId,
            audit.Notes,
            audit.CreatedAt,
            audit.UpdatedAt
        ));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "Owner")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized("Missing org_id claim");

        var audit = await _db.Audits
            .FirstOrDefaultAsync(a => a.Id == id && a.OrganizationId == _org.OrganizationId);

        if (audit is null)
            return NotFound();

        _db.Audits.Remove(audit);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
```

### Phase 1F: Database Migrations & First Run (30 min)

```bash
# Install EF Core tools
dotnet tool install --global dotnet-ef

# Create initial migration
dotnet ef migrations add Initial --project src/CAP.Infrastructure --startup-project src/CAP.Api

# Apply migration
dotnet ef database update --project src/CAP.Infrastructure --startup-project src/CAP.Api

# Run the application
dotnet run --project src/CAP.Api
```

Open browser to `https://localhost:<port>/swagger`

**Test Flow**:
1. POST `/api/auth/register` - Create user + org
2. Copy access token
3. Click "Authorize" in Swagger → Enter `Bearer <token>`
4. POST `/api/audits` - Create audit
5. GET `/api/audits` - List audits

### Phase 1G: CI/CD Pipeline (30 min)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: '8.0.x'

    - name: Restore dependencies
      run: dotnet restore

    - name: Build
      run: dotnet build -c Release --no-restore

    - name: Test
      run: dotnet test -c Release --no-build --verbosity normal
```

**✅ ITERATION 1 COMPLETE**: You now have a deployable, secure API with auth + audits feature!

---

## 🔧 **ITERATION 2: Core Features** (Week 2)

**Goal**: Add Findings, Activity Logs, File Uploads

### Phase 2A: Findings Controller (2-3 hours)

Create `src/CAP.Api/Controllers/FindingsController.cs` with full CRUD:
- GET `/api/findings` - Paginated, filterable list
- GET `/api/findings/{id}` - Detail view
- POST `/api/findings` - Create finding (Owner/Admin)
- PUT `/api/findings/{id}` - Update finding
- PATCH `/api/findings/{id}/status` - Status update
- DELETE `/api/findings/{id}` - Delete (Owner only)

### Phase 2B: Activity Logging Middleware (2 hours)

```csharp
// src/CAP.Api/Middleware/ActivityLoggingMiddleware.cs
public class ActivityLoggingMiddleware
{
    private readonly RequestDelegate _next;

    public ActivityLoggingMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, AppDbContext db, ICurrentOrg org)
    {
        await _next(context);

        // Log POST/PUT/PATCH/DELETE requests
        if (context.Request.Method is "POST" or "PUT" or "PATCH" or "DELETE"
            && context.Response.StatusCode < 400
            && org.OrganizationId != Guid.Empty)
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null) return;

            var path = context.Request.Path.Value ?? "";
            var action = context.Request.Method switch
            {
                "POST" => "Created",
                "PUT" => "Updated",
                "PATCH" => "Updated",
                "DELETE" => "Deleted",
                _ => "Unknown"
            };

            // Parse entity type and ID from path
            var (entityType, entityId) = ParseEntityFromPath(path);

            if (entityType is not null && entityId != Guid.Empty)
            {
                db.ActivityLogs.Add(new ActivityLog
                {
                    OrganizationId = org.OrganizationId,
                    UserId = userId,
                    Action = action,
                    EntityType = entityType,
                    EntityId = entityId,
                    Timestamp = DateTimeOffset.UtcNow
                });

                await db.SaveChangesAsync();
            }
        }
    }

    private static (string? entityType, Guid entityId) ParseEntityFromPath(string path)
    {
        // Parse paths like /api/audits/{id} or /api/findings/{id}
        var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length < 3) return (null, Guid.Empty);

        var entityType = segments[1] switch
        {
            "audits" => "Audit",
            "findings" => "Finding",
            "intake-forms" => "IntakeForm",
            _ => null
        };

        if (entityType is null) return (null, Guid.Empty);

        var idStr = segments[2];
        if (Guid.TryParse(idStr, out var id))
            return (entityType, id);

        return (null, Guid.Empty);
    }
}

// Register in Program.cs
app.UseMiddleware<ActivityLoggingMiddleware>();
```

### Phase 2C: Activity Logs Controller (30 min)

```csharp
// src/CAP.Api/Controllers/ActivityController.cs
[ApiController]
[Route("api/activity")]
[Authorize]
public class ActivityController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentOrg _org;

    public ActivityController(AppDbContext db, ICurrentOrg org)
    {
        _db = db;
        _org = org;
    }

    public record ActivityLogResponse(
        Guid Id,
        string UserId,
        string Action,
        string EntityType,
        Guid EntityId,
        DateTimeOffset Timestamp
    );

    [HttpGet]
    public async Task<ActionResult<PagedResponse<ActivityLogResponse>>> List(
        [FromQuery] PagedRequest page,
        [FromQuery] string? entityType = null)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized("Missing org_id claim");

        var query = _db.ActivityLogs.Where(log => log.OrganizationId == _org.OrganizationId);

        if (!string.IsNullOrEmpty(entityType))
            query = query.Where(log => log.EntityType == entityType);

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(log => log.Timestamp)
            .Skip((page.Page - 1) * page.PageSize)
            .Take(page.PageSize)
            .Select(log => new ActivityLogResponse(
                log.Id,
                log.UserId,
                log.Action,
                log.EntityType,
                log.EntityId,
                log.Timestamp
            ))
            .ToListAsync();

        return Ok(PagedResponse<ActivityLogResponse>.Create(items, total, page.Page, page.PageSize));
    }
}
```

### Phase 2D: File Storage Service (3-4 hours)

```csharp
// src/CAP.Application/Common/IFileStorage.cs
namespace CAP.Application.Common;

public interface IFileStorage
{
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType);
    Task<Stream> DownloadAsync(string storageKey);
    Task DeleteAsync(string storageKey);
}

// src/CAP.Infrastructure/Storage/LocalFileStorage.cs
public class LocalFileStorage : IFileStorage
{
    private readonly string _basePath;

    public LocalFileStorage(IConfiguration config)
    {
        _basePath = config["FileStorage:LocalPath"] ?? "uploads";
        Directory.CreateDirectory(_basePath);
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        var storageKey = $"{Guid.NewGuid()}_{fileName}";
        var filePath = Path.Combine(_basePath, storageKey);

        using var fileOut = File.Create(filePath);
        await fileStream.CopyToAsync(fileOut);

        return storageKey;
    }

    public Task<Stream> DownloadAsync(string storageKey)
    {
        var filePath = Path.Combine(_basePath, storageKey);
        if (!File.Exists(filePath))
            throw new FileNotFoundException("File not found", storageKey);

        return Task.FromResult<Stream>(File.OpenRead(filePath));
    }

    public Task DeleteAsync(string storageKey)
    {
        var filePath = Path.combine(_basePath, storageKey);
        if (File.Exists(filePath))
            File.Delete(filePath);

        return Task.CompletedTask;
    }
}

// Register in Program.cs
builder.Services.AddScoped<IFileStorage, LocalFileStorage>();
```

### Phase 2E: Attachments Controller (2 hours)

```csharp
// src/CAP.Api/Controllers/AttachmentsController.cs
[ApiController]
[Route("api/attachments")]
[Authorize]
public class AttachmentsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentOrg _org;
    private readonly IFileStorage _storage;

    public AttachmentsController(AppDbContext db, ICurrentOrg org, IFileStorage storage)
    {
        _db = db;
        _org = org;
        _storage = storage;
    }

    [HttpPost]
    public async Task<ActionResult> Upload(
        IFormFile file,
        [FromForm] Guid? auditId = null,
        [FromForm] Guid? intakeResponseId = null)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized("Missing org_id claim");

        if (file.Length == 0)
            return BadRequest("Empty file");

        // Upload to storage
        using var stream = file.OpenReadStream();
        var storageKey = await _storage.UploadAsync(stream, file.FileName, file.ContentType);

        // Save metadata
        var attachment = new Attachment
        {
            OrganizationId = _org.OrganizationId,
            AuditId = auditId,
            IntakeResponseId = intakeResponseId,
            FileName = file.FileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            StorageKey = storageKey,
            UploadedBy = User.FindFirstValue(ClaimTypes.NameIdentifier)!,
            UploadedAt = DateTimeOffset.UtcNow
        };

        _db.Attachments.Add(attachment);
        await _db.SaveChangesAsync();

        return Ok(new { id = attachment.Id, fileName = attachment.FileName });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Download(Guid id)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized("Missing org_id claim");

        var attachment = await _db.Attachments
            .FirstOrDefaultAsync(a => a.Id == id && a.OrganizationId == _org.OrganizationId);

        if (attachment is null)
            return NotFound();

        var stream = await _storage.DownloadAsync(attachment.StorageKey);
        return File(stream, attachment.ContentType, attachment.FileName);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized("Missing org_id claim");

        var attachment = await _db.Attachments
            .FirstOrDefaultAsync(a => a.Id == id && a.OrganizationId == _org.OrganizationId);

        if (attachment is null)
            return NotFound();

        await _storage.DeleteAsync(attachment.StorageKey);
        _db.Attachments.Remove(attachment);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
```

**✅ ITERATION 2 COMPLETE**: Full audit workflow with findings, file uploads, and audit trail!

---

## 📦 **ITERATION 3: Polish & Production** (Week 3)

**Goal**: Make it production-ready and add remaining features

### Phase 3A: Intake Forms (3-4 hours)

Create `src/CAP.Api/Controllers/IntakeFormsController.cs`:
- Template management (form structure as JSON)
- Response submission
- Response viewing

### Phase 3B: Organizations Management (2-3 hours)

Create `src/CAP.Api/Controllers/OrganizationsController.cs`:
- List user's organizations
- Manage members
- Role assignment
- Invitation system (email optional for MVP)

### Phase 3C: Development Seed Data (1 hour)

```csharp
// src/CAP.Infrastructure/Data/DbSeeder.cs
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, UserManager<AppUser> users)
    {
        if (await db.Organizations.AnyAsync()) return;

        // Create demo user
        var demoUser = new AppUser
        {
            UserName = "demo@pssportal.com",
            Email = "demo@pssportal.com"
        };
        await users.CreateAsync(demoUser, "Demo123!");

        // Create demo organization
        var demoOrg = new Organization { Name = "Demo Consulting Co" };
        db.Organizations.Add(demoOrg);

        db.OrganizationMembers.Add(new OrganizationMember
        {
            OrganizationId = demoOrg.Id,
            UserId = demoUser.Id,
            Role = "Owner"
        });

        // Create sample audit
        var audit = new Audit
        {
            OrganizationId = demoOrg.Id,
            Title = "Q1 2025 Marketing Workflow Audit",
            Status = "InProgress",
            AuditorId = demoUser.Id,
            Notes = "Initial assessment of marketing automation stack"
        };
        db.Audits.Add(audit);

        // Create sample findings
        db.Findings.AddRange(
            new Finding
            {
                AuditId = audit.Id,
                OrganizationId = demoOrg.Id,
                Category = "Automation",
                Severity = "High",
                Effort = "M",
                Title = "Manual lead routing process",
                Description = "Leads are manually assigned daily, causing 4-6 hour delays",
                Recommendation = "Implement automated lead routing via CRM workflow",
                RoiEstimate = "Save 10 hours/week, reduce response time by 80%",
                Status = "Identified"
            },
            new Finding
            {
                AuditId = audit.Id,
                OrganizationId = demoOrg.Id,
                Category = "Data",
                Severity = "Medium",
                Effort = "L",
                Title = "Fragmented data across 3 systems",
                Description = "Customer data exists in CRM, email platform, and spreadsheets",
                Recommendation = "Establish CRM as single source of truth, implement bi-directional sync",
                RoiEstimate = "Eliminate 15 hours/month of manual data reconciliation",
                Status = "Identified"
            }
        );

        await db.SaveChangesAsync();
    }
}

// In Program.cs, add AFTER app.Build():
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
    await DbSeeder.SeedAsync(db, users);
}
```

### Phase 3D: Background Jobs with Hangfire (2-3 hours)

```bash
# Add Hangfire packages
dotnet add src/CAP.Api package Hangfire.Core
dotnet add src/CAP.Api package Hangfire.AspNetCore
dotnet add src/CAP.Api package Hangfire.PostgreSql
```

```csharp
// In Program.cs

// Add Hangfire
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UsePostgreSqlStorage(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddHangfireServer();

// After app.Build()
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireAuthorizationFilter() }
});

// Schedule recurring jobs
RecurringJob.AddOrUpdate<AuditReminderService>(
    "audit-reminders",
    service => service.SendRemindersAsync(),
    Cron.Daily);

// Create reminder service
// src/CAP.Infrastructure/Jobs/AuditReminderService.cs
public class AuditReminderService
{
    private readonly AppDbContext _db;
    private readonly ILogger<AuditReminderService> _logger;

    public AuditReminderService(AppDbContext db, ILogger<AuditReminderService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task SendRemindersAsync()
    {
        // Find audits "In Progress" for > 7 days with no updates
        var cutoff = DateTimeOffset.UtcNow.AddDays(-7);
        var staleAudits = await _db.Audits
            .Where(a => a.Status == "InProgress" && a.UpdatedAt < cutoff)
            .ToListAsync();

        _logger.LogInformation("Found {Count} stale audits", staleAudits.Count);

        // TODO: Send email reminders (implement email service later)
        foreach (var audit in staleAudits)
        {
            _logger.LogInformation("Reminder needed for audit {AuditId}: {Title}",
                audit.Id, audit.Title);
        }
    }
}

// Register service
builder.Services.AddScoped<AuditReminderService>();
```

### Phase 3E: Azure Deployment Prep (2 hours)

```yaml
# Add Azure deployment workflow
# .github/workflows/deploy.yml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

env:
  AZURE_WEBAPP_NAME: cap-api
  DOTNET_VERSION: '8.0.x'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: ${{ env.DOTNET_VERSION }}

    - name: Build
      run: dotnet build -c Release

    - name: Publish
      run: dotnet publish src/CAP.Api/CAP.Api.csproj -c Release -o ./publish

    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ env.AZURE_WEBAPP_NAME }}
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./publish
```

```json
// appsettings.Production.json
{
  "ConnectionStrings": {
    "Default": "" // Set via Azure App Settings / Key Vault
  },
  "Jwt": {
    "Issuer": "CAP",
    "Audience": "CAP",
    "SigningKey": "", // Set via Azure Key Vault
    "AccessTokenMinutes": 30,
    "RefreshTokenDays": 7
  },
  "FileStorage": {
    "Type": "Azure", // or "Local"
    "AzureConnectionString": "" // Set via Azure App Settings
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  }
}
```

### Phase 3F: Integration Tests (2-3 hours)

```csharp
// tests/CAP.Tests.Integration/AuditEndpointsTests.cs
public class AuditEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AuditEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateAudit_WithValidData_ReturnsCreated()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var request = new { title = "Test Audit", notes = "Test notes" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/audits", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var audit = await response.Content.ReadFromJsonAsync<AuditResponse>();
        audit.Should().NotBeNull();
        audit.Title.Should().Be("Test Audit");
    }

    private async Task<string> GetAuthTokenAsync()
    {
        var registerRequest = new
        {
            email = "test@test.com",
            password = "Test123!",
            organizationName = "Test Org"
        };

        var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        return authResponse.AccessToken;
    }
}
```

**✅ ITERATION 3 COMPLETE**: Production-ready, fully featured MVP!

---

## Deployment Checklist

### Azure Resources Setup

1. **Create Azure PostgreSQL Database**
   - Flexible Server (recommended)
   - Basic tier for development
   - Enable SSL connection
   - Note connection string

2. **Create Azure App Service**
   - Linux container or Windows App Service
   - B1 tier minimum
   - Configure connection strings in App Settings
   - Add JWT signing key to Key Vault

3. **Create Azure Key Vault** (optional but recommended)
   - Store JWT signing key
   - Store database connection string
   - Store file storage keys

4. **Create Azure Storage Account** (for file uploads)
   - General Purpose v2
   - Blob containers: `attachments`
   - Note connection string

### Environment Variables

Configure in Azure App Service → Configuration:

```
ConnectionStrings__Default = <PostgreSQL connection string>
Jwt__SigningKey = <Strong random key>
FileStorage__Type = Azure
FileStorage__AzureConnectionString = <Azure Storage connection string>
ASPNETCORE_ENVIRONMENT = Production
```

### Post-Deployment

1. Run database migrations (one-time)
2. Test health endpoint: `https://yourapp.azurewebsites.net/health`
3. Test registration flow
4. Monitor logs in Azure Application Insights

---

## Success Metrics (MVP Launch)

**Technical**:
- ✅ Health checks passing
- ✅ Zero critical security vulnerabilities
- ✅ < 500ms API response times (p95)
- ✅ 99%+ uptime

**Functional**:
- ✅ Can onboard a client in < 5 minutes
- ✅ Can create audit + 10 findings in < 10 minutes
- ✅ Client can log in and view deliverables
- ✅ Activity log tracks all changes

**Demo-Ready**:
- ✅ Seeded demo data
- ✅ Clear API documentation
- ✅ Working Swagger UI
- ✅ GitHub repo with README

---

## Future Enhancements (Post-MVP)

### Phase 4: Advanced Features
- Email notifications (SendGrid integration)
- PDF report generation (QuestPDF)
- Advanced search and filtering
- Dashboard with analytics
- Bulk operations
- Export to Excel/CSV

### Phase 5: Frontend
- Next.js 14 app
- Authentication flow with refresh
- Audit management UI
- Finding management UI
- File upload/download UI
- Activity timeline visualization

### Phase 6: Monetization
- Stripe integration
- Subscription plans (Starter/Professional/Enterprise)
- Usage limits enforcement
- White-label branding
- Custom domain support

### Phase 7: Enterprise Features
- SSO (SAML/OAuth)
- Advanced RBAC (custom roles)
- Audit templates library
- AI-powered recommendations
- API webhooks
- Zapier integration

---

## Technology Upgrade Path

### When to Upgrade
- **.NET 9**: After MVP is stable (Q2 2025)
- **CQRS/MediatR**: When you have 20+ endpoints
- **Repository Pattern**: When testing becomes complex
- **Azure Blob Storage**: When local storage hits limits
- **Redis Caching**: When DB queries slow down
- **Azure Service Bus**: When you need reliable messaging

---

## Development Time Estimates

| Phase | Time | Cumulative |
|-------|------|------------|
| Iteration 1 (Setup + Auth + Audits) | 12-16 hours | Week 1 |
| Iteration 2 (Findings + Files + Logs) | 10-14 hours | Week 2 |
| Iteration 3 (Polish + Deploy) | 8-12 hours | Week 3 |
| **TOTAL MVP** | **30-42 hours** | **3 weeks** |

**With focused effort: 2-3 weeks to production-ready MVP**

---

## Appendix: Quick Reference

### Essential Commands

```bash
# Start database
docker compose up -d

# Create migration
dotnet ef migrations add <MigrationName> --project src/CAP.Infrastructure --startup-project src/CAP.Api

# Apply migrations
dotnet ef database update --project src/CAP.Infrastructure --startup-project src/CAP.Api

# Run API
dotnet run --project src/CAP.Api

# Run tests
dotnet test

# Publish for deployment
dotnet publish src/CAP.Api -c Release -o ./publish
```

### Status Values Reference

**Audit Status**: Draft → InReview → Delivered → InProgress → Closed

**Finding Status**: Identified → InProgress → Resolved

**Roles**: Owner > Admin > ClientManager > ClientViewer

---

**Document Version**: 2.0
**Last Updated**: January 2025
**Next Review**: After MVP deployment

---

This plan synthesizes:
- Original project vision and tech stack
- Modern .NET best practices (2025)
- Security-first approach
- Iterative, deployable milestones
- Practical effort estimates
- Production-ready patterns

Ready to build! 🚀
