# Day 3 Implementation Guide
## Local Testing & Verification

**Date**: January 14, 2026
**Status**: Ready to Execute

---

## 🎯 Quick Reference Guide

### What Should I Test First in Swagger?

**Testing Order:**
1. **Register** - Create user + organization
2. **Login** - Get access and refresh tokens
3. **Authorize** - Add Bearer token to Swagger
4. **Logout** - Test protected endpoint
5. **Refresh** - Get new tokens
6. **Health** - Verify system health

### Expected JWT Payload on Login

When you decode the `accessToken` at https://jwt.io, you'll see:

```json
{
  "sub": "a5f8e3d2-1234-5678-90ab-cdef12345678",
  "email": "owner@testcompany.com",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "a5f8e3d2-...",
  "org_id": "b6c9d4e3-8765-4321-09ba-fedcba987654",
  "role": "Owner",
  "iss": "CAP",
  "aud": "CAP",
  "exp": 1736875902,
  "iat": 1736874102
}
```

**Key Claims:**
- `sub` - User ID (ASP.NET Identity)
- `email` - User's email
- `org_id` - Organization ID (multi-tenancy)
- `role` - Owner/Admin/ClientManager/ClientViewer
- `exp` - Expiration (30 minutes)

**Token Lifetimes:**
- Access Token: 30 minutes
- Refresh Token: 7 days

### How to Simulate Multiple Organizations

**Option A: Multiple Registrations (Easiest)**
```json
// User 1 - Organization A
POST /api/auth/register
{
  "email": "owner@companyA.com",
  "password": "Password123!",
  "organizationName": "Company A"
}

// User 2 - Organization B
POST /api/auth/register
{
  "email": "owner@companyB.com",
  "password": "Password123!",
  "organizationName": "Company B"
}
```

Each registration automatically creates:
- New user
- New organization
- OrganizationMember link (role: Owner)

**Testing Multi-Tenancy:**
1. Register User A → Create data as User A
2. Register User B → Try to access User A's data
3. Expected: User B cannot see User A's data (org_id filter)

### What Endpoints Should Be Protected Next?

**Recommended Protection Patterns:**

```csharp
[Authorize]  // Requires authentication
[Authorize(Policy = "Owner")]  // Owner only
[Authorize(Policy = "OwnerOrAdmin")]  // Owner or Admin only
```

**Next Endpoints to Build:**
1. **Audits CRUD** - Core business feature
2. **Organizations Management** - Invite users, manage members
3. **Findings** - Audit details
4. **Activity Logs** - Audit trail

### Cleanest Way to Add First Real Feature

**Recommended: Audits CRUD**

**Why Audits First?**
- Uses all auth infrastructure
- Demonstrates multi-tenancy
- Shows role-based access control
- Foundation for rest of app

**Implementation Steps:**
1. Create `Audit` entity in Domain
2. Add `DbSet<Audit>` to DbContext
3. Create and apply migration
4. Create `AuditsController` with CRUD endpoints
5. Test in Swagger

**See "Adding Your First Feature" section below for complete code.**

---

## Prerequisites Check

### ✅ Completed (Day 1-2)
- [x] Solution structure created
- [x] All NuGet packages installed
- [x] Domain entities created (Organization, OrganizationMember)
- [x] Infrastructure layer (AppUser, AppDbContext)
- [x] Authentication API (AuthController)
- [x] Program.cs configured
- [x] Docker Compose file ready

### 🔄 To Complete Today (Day 3)
- [ ] Start Docker Desktop
- [ ] Start PostgreSQL container
- [ ] Create initial database migration
- [ ] Apply migrations to database
- [ ] Run the API
- [ ] Test all authentication endpoints
- [ ] Verify health check

---

## Step-by-Step Implementation

### Step 1: Start Docker Desktop

**Windows Users:**
1. Open **Docker Desktop** from Start Menu
2. Wait 1-2 minutes for Docker Desktop to fully start
3. Look for the Docker whale icon in system tray
4. When the icon is stable (not animated), Docker is ready

**Verify Docker is Running:**
```bash
docker --version
docker ps
```

Expected: Docker version info and empty container list (or running containers)

---

### Step 2: Start PostgreSQL Database

```bash
cd "C:\Users\lukel\PSS Portal"
docker compose up -d
```

**Expected Output:**
```
[+] Running 2/2
 ✔ Network pss portal_default     Created
 ✔ Container cap_postgres         Started
```

**Verify PostgreSQL is Running:**
```bash
docker ps
```

**Expected Output:**
```
CONTAINER ID   IMAGE         PORTS                    NAMES
xxxxxxxxxxxx   postgres:16   0.0.0.0:5432->5432/tcp   cap_postgres
```

**Database Connection Details:**
- Host: `localhost`
- Port: `5432`
- Database: `cap_dev`
- Username: `cap`
- Password: `cap_password`

---

### Step 3: Create Initial Database Migration

```bash
cd "C:\Users\lukel\PSS Portal"

# Create the initial migration
dotnet ef migrations add InitialCreate --project src/CAP.Infrastructure --startup-project src/CAP.Api
```

**Expected Output:**
```
Build started...
Build succeeded.
Done. To undo this action, use 'dotnet ef migrations remove'
```

**What This Creates:**
- `src/CAP.Infrastructure/Migrations/XXXXXX_InitialCreate.cs`
- Migration files for:
  - ASP.NET Core Identity tables (Users, Roles, etc.)
  - Organization table
  - OrganizationMember table
  - All indexes defined in AppDbContext

---

### Step 4: Apply Database Migrations

```bash
dotnet ef database update --project src/CAP.Infrastructure --startup-project src/CAP.Api
```

**Expected Output:**
```
Build started...
Build succeeded.
Applying migration '20260114XXXX_InitialCreate'.
Done.
```

**Verify Database Created:**
```bash
# Connect to PostgreSQL and check tables
docker exec -it cap_postgres psql -U cap -d cap_dev -c "\dt"
```

**Expected Tables:**
```
                    List of relations
 Schema |              Name              | Type  | Owner
--------+--------------------------------+-------+-------
 public | AspNetRoles                    | table | cap
 public | AspNetRoleClaims               | table | cap
 public | AspNetUsers                    | table | cap
 public | AspNetUserClaims               | table | cap
 public | AspNetUserLogins               | table | cap
 public | AspNetUserRoles                | table | cap
 public | AspNetUserTokens               | table | cap
 public | Organizations                  | table | cap
 public | OrganizationMembers            | table | cap
 public | __EFMigrationsHistory          | table | cap
```

---

### Step 5: Build and Run the API

```bash
cd "C:\Users\lukel\PSS Portal"
dotnet build
```

**Expected Output:**
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

**Run the API:**
```bash
dotnet run --project src/CAP.Api
```

**Expected Output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7xxx
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5xxx
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

**Note:** Replace `7xxx` and `5xxx` with actual port numbers shown in your console.

---

### Step 6: Test with Swagger UI

**Open Swagger:**
1. Open browser to `https://localhost:7xxx/swagger` (use your actual port)
2. Accept the self-signed certificate warning

**Expected:** Swagger UI loads showing:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /health`
- `GET /error`

---

### Step 7: Test Authentication Flow

#### Test 1: Register New User

1. In Swagger UI, find `POST /api/auth/register`
2. Click **"Try it out"**
3. Enter request body:
```json
{
  "email": "demo@test.com",
  "password": "Test123!",
  "organizationName": "Demo Company"
}
```
4. Click **"Execute"**

**Expected Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "CfDJ8...",
  "organizationId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Copy the `accessToken` value for next steps.**

---

#### Test 2: Authorize in Swagger

1. Scroll to top of Swagger UI
2. Click the green **"Authorize"** button (🔓)
3. In the dialog, enter: `Bearer <paste-your-access-token>`
4. Click **"Authorize"**
5. Click **"Close"**

**You should now see a 🔒 (locked) icon, meaning you're authenticated.**

---

#### Test 3: Test Login

1. Find `POST /api/auth/login`
2. Click **"Try it out"**
3. Enter:
```json
{
  "email": "demo@test.com",
  "password": "Test123!"
}
```
4. Click **"Execute"**

**Expected Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "CfDJ8...",
  "organizationId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

#### Test 4: Test Refresh Token

1. Copy the `refreshToken` from login response
2. Find `POST /api/auth/refresh`
3. Click **"Try it out"**
4. Enter:
```json
{
  "refreshToken": "<paste-refresh-token-here>"
}
```
5. Click **"Execute"**

**Expected Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "CfDJ8...",
  "organizationId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

#### Test 5: Test Logout (Requires Authorization)

1. Make sure you're authorized (see Test 2)
2. Find `POST /api/auth/logout`
3. Click **"Try it out"**
4. Click **"Execute"**

**Expected Response (200 OK):** Empty response body

---

#### Test 6: Test Health Check

1. Find `GET /health`
2. Click **"Try it out"**
3. Click **"Execute"**

**Expected Response (200 OK):**
```
Healthy
```

---

## Verification Checklist

Mark each as complete:

- [ ] Docker Desktop is running
- [ ] PostgreSQL container is running (`docker ps` shows `cap_postgres`)
- [ ] Database migration created successfully
- [ ] Database migration applied successfully
- [ ] Tables exist in database (verified with `\dt` command)
- [ ] API builds without errors
- [ ] API runs without errors
- [ ] Swagger UI loads successfully
- [ ] ✅ Register endpoint works (returns tokens)
- [ ] ✅ Login endpoint works (returns tokens)
- [ ] ✅ Refresh endpoint works (returns new tokens)
- [ ] ✅ Logout endpoint works (returns 200 OK)
- [ ] ✅ Health check returns "Healthy"
- [ ] JWT token can be decoded (check at jwt.io)
- [ ] Token contains correct claims: `sub`, `email`, `org_id`, `role`

---

## Troubleshooting

### Issue: Docker Desktop won't start
**Solution:**
- Restart Docker Desktop
- Wait 2-3 minutes for full startup
- Check Docker Desktop dashboard for errors

### Issue: Port 5432 already in use
**Solution:**
```bash
# Check what's using port 5432
netstat -ano | findstr :5432

# Stop existing PostgreSQL if needed
# Or change port in docker-compose.yml
```

### Issue: `dotnet ef` command not found
**Solution:**
```bash
# Install EF Core tools globally
dotnet tool install --global dotnet-ef

# Or use migration bundle approach (see README.md)
```

### Issue: Migration fails with connection error
**Solution:**
- Verify PostgreSQL is running: `docker ps`
- Test connection:
  ```bash
  docker exec -it cap_postgres psql -U cap -d cap_dev -c "SELECT 1;"
  ```
- Check connection string in `appsettings.Development.json`

### Issue: Build errors
**Solution:**
```bash
# Clean and restore
dotnet clean
dotnet restore
dotnet build
```

### Issue: API crashes on startup
**Solution:**
- Check console for error messages
- Verify database connection string
- Verify JWT SigningKey is set in appsettings.Development.json
- Check that PostgreSQL is accepting connections

---

## Success Criteria

**✅ Day 3 Complete When:**
1. PostgreSQL is running in Docker
2. Database tables are created
3. API runs without errors
4. All authentication endpoints tested successfully
5. Health check returns "Healthy"
6. You can register, login, refresh, and logout

---

## Next Steps (Day 4)

Once Day 3 is complete, you'll move to:
1. Initialize Git repository
2. Create GitHub repository
3. Push code to GitHub
4. Set up GitHub Actions CI/CD pipeline
5. Verify build passes on GitHub

See `NEXT-STEPS.md` for Day 4 details.

---

## Quick Reference Commands

```bash
# Start database
docker compose up -d

# Check containers
docker ps

# Create migration
dotnet ef migrations add InitialCreate --project src/CAP.Infrastructure --startup-project src/CAP.Api

# Apply migration
dotnet ef database update --project src/CAP.Infrastructure --startup-project src/CAP.Api

# Build project
dotnet build

# Run API
dotnet run --project src/CAP.Api

# Stop database
docker compose down

# View database tables
docker exec -it cap_postgres psql -U cap -d cap_dev -c "\dt"
```

---

**Status**: Ready to execute
**Estimated Time**: 30-45 minutes
**Blockers**: Docker Desktop must be running

---

## 🚀 Adding Your First Feature: Audits CRUD

Once you've completed testing the authentication endpoints, you're ready to add your first real feature. Here's the complete implementation.

### Step 1: Create the Audit Entity

**Create:** `src/CAP.Domain/Entities/Audit.cs`

```csharp
namespace CAP.Domain.Entities;

public class Audit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }  // Multi-tenant scoping
    public string Title { get; set; } = default!;
    public string Status { get; set; } = "Draft";  // Draft/InReview/Delivered/InProgress/Closed
    public string? AuditorId { get; set; }  // User who performed audit
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
```

### Step 2: Update DbContext

**Edit:** `src/CAP.Infrastructure/Data/AppDbContext.cs`

Add this DbSet property:
```csharp
public DbSet<Audit> Audits => Set<Audit>();
```

Add this in `OnModelCreating` method:
```csharp
// Audit
builder.Entity<Audit>(b =>
{
    b.HasIndex(x => x.OrganizationId);
    b.HasIndex(x => new { x.OrganizationId, x.Status, x.CreatedAt });
});
```

### Step 3: Create and Apply Migration

```bash
cd "C:\Users\lukel\PSS portal"

# Create migration
dotnet ef migrations add AddAudits --project src/CAP.Infrastructure --startup-project src/CAP.Api

# Generate SQL script
dotnet ef migrations script --output migration-audits.sql --idempotent

# Apply to database
docker exec -i cap_postgres psql -U cap -d cap_dev < migration-audits.sql
```

### Step 4: Create the Audits Controller

**Create:** `src/CAP.Api/Controllers/AuditsController.cs`

```csharp
using CAP.Application.Common;
using CAP.Domain.Entities;
using CAP.Infrastructure.Data;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CAP.Api.Controllers;

[ApiController]
[Route("api/audits")]
[Authorize]  // All endpoints require authentication
public class AuditsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentOrg _org;
    private readonly ILogger<AuditsController> _logger;

    public AuditsController(AppDbContext db, ICurrentOrg org, ILogger<AuditsController> logger)
    {
        _db = db;
        _org = org;
        _logger = logger;
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

    public record CreateAuditRequest(string Title, string? Notes);
    public record UpdateAuditRequest(string Title, string? Notes);

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

    /// <summary>
    /// List all audits for the current organization
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<AuditResponse>>> List([FromQuery] string? status = null)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var query = _db.Audits.Where(a => a.OrganizationId == _org.OrganizationId);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(a => a.Status == status);

        var audits = await query
            .OrderByDescending(a => a.CreatedAt)
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

        return Ok(audits);
    }

    /// <summary>
    /// Get a specific audit by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<AuditResponse>> Get(Guid id)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var audit = await _db.Audits
            .Where(a => a.Id == id && a.OrganizationId == _org.OrganizationId)
            .Select(a => new AuditResponse(
                a.Id,
                a.Title,
                a.Status,
                a.AuditorId,
                a.Notes,
                a.CreatedAt,
                a.UpdatedAt
            ))
            .FirstOrDefaultAsync();

        if (audit is null)
            return NotFound(new { message = "Audit not found" });

        return Ok(audit);
    }

    /// <summary>
    /// Create a new audit (Owner/Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<ActionResult<AuditResponse>> Create(CreateAuditRequest req)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var audit = new Audit
        {
            OrganizationId = _org.OrganizationId,
            Title = req.Title,
            Status = "Draft",
            AuditorId = userId,
            Notes = req.Notes,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _db.Audits.Add(audit);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Audit created: {AuditId} by user {UserId}", audit.Id, userId);

        return CreatedAtAction(
            nameof(Get),
            new { id = audit.Id },
            new AuditResponse(
                audit.Id,
                audit.Title,
                audit.Status,
                audit.AuditorId,
                audit.Notes,
                audit.CreatedAt,
                audit.UpdatedAt
            ));
    }

    /// <summary>
    /// Update an existing audit (Owner/Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<ActionResult<AuditResponse>> Update(Guid id, UpdateAuditRequest req)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var audit = await _db.Audits
            .FirstOrDefaultAsync(a => a.Id == id && a.OrganizationId == _org.OrganizationId);

        if (audit is null)
            return NotFound(new { message = "Audit not found" });

        audit.Title = req.Title;
        audit.Notes = req.Notes;
        audit.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Audit updated: {AuditId}", id);

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

    /// <summary>
    /// Delete an audit (Owner only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "Owner")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var audit = await _db.Audits
            .FirstOrDefaultAsync(a => a.Id == id && a.OrganizationId == _org.OrganizationId);

        if (audit is null)
            return NotFound(new { message = "Audit not found" });

        _db.Audits.Remove(audit);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Audit deleted: {AuditId}", id);

        return NoContent();
    }
}
```

### Step 5: Test the Audits API

**Restart the API:**
```bash
# Stop with Ctrl+C if running
dotnet run --project src/CAP.Api
```

**In Swagger:**

1. **Authorize** (use token from login)

2. **Create Audit:**
```json
POST /api/audits
{
  "title": "Q1 2026 Marketing Audit",
  "notes": "Comprehensive review of marketing workflows"
}
```

3. **List Audits:**
```
GET /api/audits
```

4. **Get Specific Audit:**
```
GET /api/audits/{id}
```

5. **Update Audit:**
```json
PUT /api/audits/{id}
{
  "title": "Q1 2026 Marketing Audit - Updated",
  "notes": "Updated notes here"
}
```

6. **Delete Audit:**
```
DELETE /api/audits/{id}
```

### Step 6: Test Multi-Tenancy

1. **Login as User A** (Organization A)
2. **Create Audit** as User A → Note the audit ID
3. **Login as User B** (Organization B)
4. **Try to get User A's audit** using the ID
5. **Expected:** 404 Not Found (because org_id filter prevents cross-tenant access)

---

## 🎉 Success Criteria

After completing all steps, you should have:

- ✅ Working authentication (Register, Login, Refresh, Logout)
- ✅ JWT tokens with proper claims
- ✅ Multi-tenant data isolation working
- ✅ First feature (Audits CRUD) implemented
- ✅ Role-based authorization working
- ✅ All endpoints testable in Swagger

---

**Good luck with Day 3! 🚀**
