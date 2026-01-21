# Day 6: Iteration 2 - Core Features Development Plan
## PSS Portal - Findings, Activity Logs & File Uploads

**Date**: January 20, 2026 (Planned)
**Status**: 📋 Ready to Execute
**Current Phase**: Iteration 2 - Core Features
**Estimated Time**: 6-8 hours (can be split across multiple sessions)

---

## 🎯 Session Objectives

### Primary Goal
Extend PSS Portal with **Findings management**, **Activity logging**, and **File upload** capabilities to complete Iteration 2 of the master plan.

### Success Criteria
- ✅ Findings CRUD operations fully functional
- ✅ Automatic activity logging for all mutations
- ✅ File upload/download system operational
- ✅ All features deployed to production
- ✅ Swagger documentation updated
- ✅ Production testing completed

---

## 📋 Pre-Session Checklist

Before starting Day 6 development:

- [ ] **Production API validated** (from Day 5)
  - Health check returns "Healthy"
  - Swagger UI loads successfully
  - Database migrations applied (11 tables created)
  - Test user registered and can authenticate
  - Test audit created successfully

- [ ] **Development environment ready**
  - Docker PostgreSQL container running (`docker-compose up -d`)
  - .NET 8 SDK installed and working
  - Entity Framework CLI tools available (`dotnet ef --version`)
  - Local API running (`dotnet run --project src/CAP.Api`)
  - Swagger accessible at `https://localhost:<port>/swagger`

- [ ] **Codebase current**
  - Latest code pulled from GitHub (`git pull origin main`)
  - No uncommitted changes (`git status` clean)
  - All dependencies restored (`dotnet restore`)

---

## 🏗️ Implementation Roadmap

### Phase 1: Findings Management (2-3 hours)

#### 1.1 Create DTOs and Validators

**File**: `src/CAP.Api/Controllers/FindingsController.cs`

**DTOs to Create**:
```csharp
public record FindingResponse(
    Guid Id,
    Guid AuditId,
    string Category,
    string Severity,
    string Effort,
    string Title,
    string Description,
    string Recommendation,
    string? RoiEstimate,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public record FindingDetailResponse(
    Guid Id,
    Guid AuditId,
    string Category,
    string Severity,
    string Effort,
    string Title,
    string Description,
    string Recommendation,
    string? RoiEstimate,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    AuditSummary Audit
);

public record AuditSummary(Guid Id, string Title, string Status);

public record CreateFindingRequest(
    Guid AuditId,
    string Category,
    string Severity,
    string Effort,
    string Title,
    string Description,
    string Recommendation,
    string? RoiEstimate
);

public record UpdateFindingRequest(
    string Category,
    string Severity,
    string Effort,
    string Title,
    string Description,
    string Recommendation,
    string? RoiEstimate
);

public record UpdateFindingStatusRequest(string Status);
```

**FluentValidation Rules**:
```csharp
public class CreateFindingRequestValidator : AbstractValidator<CreateFindingRequest>
{
    public CreateFindingRequestValidator()
    {
        RuleFor(x => x.AuditId).NotEmpty();
        RuleFor(x => x.Category)
            .Must(c => new[] { "Automation", "Data", "Marketing", "Security", "Ops" }.Contains(c))
            .WithMessage("Invalid category");
        RuleFor(x => x.Severity)
            .Must(s => new[] { "Low", "Medium", "High" }.Contains(s))
            .WithMessage("Invalid severity");
        RuleFor(x => x.Effort)
            .Must(e => new[] { "S", "M", "L" }.Contains(e))
            .WithMessage("Invalid effort");
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Recommendation).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.RoiEstimate).MaximumLength(500).When(x => x.RoiEstimate != null);
    }
}

public class UpdateFindingStatusRequestValidator : AbstractValidator<UpdateFindingStatusRequest>
{
    public UpdateFindingStatusRequestValidator()
    {
        RuleFor(x => x.Status)
            .Must(s => new[] { "Identified", "InProgress", "Resolved" }.Contains(s))
            .WithMessage("Invalid status");
    }
}
```

---

#### 1.2 Implement Findings Controller

**Endpoints to Implement**:

1. **GET /api/findings** - List findings (paginated, filterable)
   ```csharp
   public async Task<ActionResult<PagedResponse<FindingResponse>>> List(
       [FromQuery] PagedRequest page,
       [FromQuery] Guid? auditId = null,
       [FromQuery] string? category = null,
       [FromQuery] string? severity = null,
       [FromQuery] string? status = null)
   ```

2. **GET /api/findings/{id}** - Get finding details
   ```csharp
   public async Task<ActionResult<FindingDetailResponse>> Get(Guid id)
   ```

3. **POST /api/findings** - Create finding (Owner/Admin only)
   ```csharp
   [Authorize(Policy = "OwnerOrAdmin")]
   public async Task<ActionResult<FindingResponse>> Create(CreateFindingRequest req)
   ```

4. **PUT /api/findings/{id}** - Update finding (Owner/Admin only)
   ```csharp
   [Authorize(Policy = "OwnerOrAdmin")]
   public async Task<ActionResult<FindingResponse>> Update(Guid id, UpdateFindingRequest req)
   ```

5. **PATCH /api/findings/{id}/status** - Update status
   ```csharp
   public async Task<ActionResult<FindingResponse>> UpdateStatus(Guid id, UpdateFindingStatusRequest req)
   ```

6. **DELETE /api/findings/{id}** - Delete finding (Owner only)
   ```csharp
   [Authorize(Policy = "Owner")]
   public async Task<IActionResult> Delete(Guid id)
   ```

**Key Implementation Details**:
- All queries scoped to `ICurrentOrg.OrganizationId`
- Verify audit belongs to organization before creating finding
- Include audit summary in detail response
- Support multiple filter combinations (AND logic)
- Order by CreatedAt descending by default

---

#### 1.3 Testing Findings Endpoints

**Test Plan**:

1. **Local Testing** (via Swagger):
   - Create 3 findings for test audit (different categories/severities)
   - List findings with various filters
   - Update finding details
   - Update finding status (Identified → InProgress → Resolved)
   - Verify organization scoping (can't access other org's findings)
   - Delete a finding

2. **Validation Testing**:
   - Invalid category/severity/effort (expect 400 errors)
   - Missing required fields
   - Creating finding for non-existent audit
   - Creating finding for audit in different organization

**Expected Results**:
- All CRUD operations successful
- Proper authorization enforcement
- Organization scoping working correctly
- FluentValidation errors clear and helpful

---

### Phase 2: Activity Logging System (2-3 hours)

#### 2.1 Create Activity Logging Middleware

**File**: `src/CAP.Api/Middleware/ActivityLoggingMiddleware.cs`

**Functionality**:
```csharp
public class ActivityLoggingMiddleware
{
    private readonly RequestDelegate _next;

    public ActivityLoggingMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, AppDbContext db, ICurrentOrg org)
    {
        await _next(context);

        // Only log mutating operations that succeeded
        if (ShouldLog(context))
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null || org.OrganizationId == Guid.Empty) return;

            var (entityType, entityId, action) = ParseRequest(context);

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

    private static bool ShouldLog(HttpContext context)
    {
        // Log POST/PUT/PATCH/DELETE that succeeded (200-299)
        var isModifyingRequest = context.Request.Method is "POST" or "PUT" or "PATCH" or "DELETE";
        var isSuccess = context.Response.StatusCode >= 200 && context.Response.StatusCode < 300;
        var isApiEndpoint = context.Request.Path.StartsWithSegments("/api");

        return isModifyingRequest && isSuccess && isApiEndpoint;
    }

    private static (string? entityType, Guid entityId, string action) ParseRequest(HttpContext context)
    {
        var path = context.Request.Path.Value ?? "";
        var method = context.Request.Method;

        // Parse paths like /api/audits/{id}, /api/findings/{id}
        var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);

        if (segments.Length < 2) return (null, Guid.Empty, "Unknown");

        var entityType = segments[1] switch
        {
            "audits" => "Audit",
            "findings" => "Finding",
            "intake-forms" => "IntakeForm",
            "attachments" => "Attachment",
            _ => null
        };

        var action = method switch
        {
            "POST" => "Created",
            "PUT" => "Updated",
            "PATCH" => "StatusChanged",
            "DELETE" => "Deleted",
            _ => "Unknown"
        };

        // Extract entity ID from path
        Guid entityId = Guid.Empty;
        if (segments.Length >= 3 && Guid.TryParse(segments[2], out var id))
        {
            entityId = id;
        }
        else if (method == "POST" && entityType is not null)
        {
            // For POST requests, we need to extract the created entity ID from response
            // This is a simplified approach - production might use IActionFilter for better access
            entityId = Guid.NewGuid(); // Placeholder - ideally extract from response body
        }

        return (entityType, entityId, action);
    }
}
```

**Registration** (in `Program.cs`):
```csharp
// Add after UseAuthorization()
app.UseMiddleware<ActivityLoggingMiddleware>();
```

**Note**: This is a simplified implementation. For production, consider using `IActionFilter` or intercepting at the service layer for more accurate entity ID tracking.

---

#### 2.2 Create Activity Logs Controller

**File**: `src/CAP.Api/Controllers/ActivityController.cs`

**Endpoints**:

1. **GET /api/activity** - List activity logs (paginated, filterable)
   ```csharp
   public async Task<ActionResult<PagedResponse<ActivityLogResponse>>> List(
       [FromQuery] PagedRequest page,
       [FromQuery] string? entityType = null,
       [FromQuery] Guid? entityId = null)
   ```

2. **GET /api/activity/audits/{auditId}** - Activity for specific audit
   ```csharp
   public async Task<ActionResult<PagedResponse<ActivityLogResponse>>> GetAuditActivity(
       Guid auditId,
       [FromQuery] PagedRequest page)
   ```

**DTOs**:
```csharp
public record ActivityLogResponse(
    Guid Id,
    string UserId,
    string UserEmail, // Join with Users table
    string Action,
    string EntityType,
    Guid EntityId,
    DateTimeOffset Timestamp
);
```

**Implementation Notes**:
- Join with `AspNetUsers` to get user email for display
- Order by Timestamp descending (most recent first)
- Organization scoping automatically applied
- Support filtering by entity type and entity ID

---

#### 2.3 Testing Activity Logging

**Test Plan**:

1. **Create Test Data**:
   - Create an audit
   - Create 2 findings for that audit
   - Update an audit status
   - Update a finding status
   - Delete a finding

2. **Verify Logging**:
   - GET /api/activity (should show 5+ log entries)
   - Filter by entityType=Audit (should show audit operations)
   - Filter by entityType=Finding (should show finding operations)
   - GET /api/activity/audits/{auditId} (should show audit-specific activity)

3. **Verify Details**:
   - User email displayed correctly
   - Timestamps accurate
   - Action names correct (Created/Updated/StatusChanged/Deleted)
   - Organization scoping working (can't see other org's activity)

---

### Phase 3: File Upload System (2-3 hours)

#### 3.1 Create File Storage Interface

**File**: `src/CAP.Application/Common/IFileStorage.cs`

```csharp
namespace CAP.Application.Common;

public interface IFileStorage
{
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType);
    Task<Stream> DownloadAsync(string storageKey);
    Task DeleteAsync(string storageKey);
    Task<bool> ExistsAsync(string storageKey);
}
```

---

#### 3.2 Implement Local File Storage

**File**: `src/CAP.Infrastructure/Storage/LocalFileStorage.cs`

```csharp
using CAP.Application.Common;
using Microsoft.Extensions.Configuration;

namespace CAP.Infrastructure.Storage;

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
        var storageKey = $"{Guid.NewGuid()}_{SanitizeFileName(fileName)}";
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
        var filePath = Path.Combine(_basePath, storageKey);
        if (File.Exists(filePath))
            File.Delete(filePath);

        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(string storageKey)
    {
        var filePath = Path.Combine(_basePath, storageKey);
        return Task.FromResult(File.Exists(filePath));
    }

    private static string SanitizeFileName(string fileName)
    {
        var invalid = Path.GetInvalidFileNameChars();
        return string.Join("_", fileName.Split(invalid, StringSplitOptions.RemoveEmptyEntries));
    }
}
```

**Registration** (in `Program.cs`):
```csharp
// Add to service registration
builder.Services.AddScoped<IFileStorage, LocalFileStorage>();
```

**Configuration** (in `appsettings.Development.json`):
```json
{
  "FileStorage": {
    "LocalPath": "uploads"
  }
}
```

---

#### 3.3 Create Attachments Controller

**File**: `src/CAP.Api/Controllers/AttachmentsController.cs`

**Endpoints**:

1. **POST /api/attachments** - Upload file
   ```csharp
   [Authorize]
   public async Task<ActionResult<AttachmentResponse>> Upload(
       IFormFile file,
       [FromForm] Guid? auditId = null,
       [FromForm] Guid? intakeResponseId = null)
   ```

2. **GET /api/attachments/{id}** - Download file
   ```csharp
   [Authorize]
   public async Task<IActionResult> Download(Guid id)
   ```

3. **GET /api/attachments** - List attachments (paginated)
   ```csharp
   [Authorize]
   public async Task<ActionResult<PagedResponse<AttachmentResponse>>> List(
       [FromQuery] PagedRequest page,
       [FromQuery] Guid? auditId = null)
   ```

4. **DELETE /api/attachments/{id}** - Delete file (Owner/Admin)
   ```csharp
   [Authorize(Policy = "OwnerOrAdmin")]
   public async Task<IActionResult> Delete(Guid id)
   ```

**DTOs**:
```csharp
public record AttachmentResponse(
    Guid Id,
    string FileName,
    string ContentType,
    long FileSize,
    DateTimeOffset UploadedAt,
    string UploadedByEmail
);
```

**Implementation Notes**:
- Validate file size (max 10 MB for free tier)
- Validate file types (images, PDFs, Excel, Word)
- Generate unique storage keys
- Save metadata to database
- Return download URL in response
- Organization scoping on all operations

---

#### 3.4 Update Dockerfile for File Storage

Add volume mount for persistent storage:

**File**: `Dockerfile` (no changes needed for local dev)

**For Production** (Render):
- Render's free tier doesn't support persistent volumes
- Files stored in container are ephemeral
- **Solution**: For MVP, accept ephemeral storage
- **Future**: Migrate to cloud storage (AWS S3, Azure Blob, Cloudflare R2)

**Note**: Document this limitation in deployment guide

---

#### 3.5 Testing File Upload System

**Test Plan**:

1. **Upload Files**:
   - Upload image (PNG/JPG) to an audit
   - Upload PDF document to an audit
   - Upload Excel file
   - Verify file size validation (try 15 MB file, expect error)

2. **Download Files**:
   - Download each uploaded file
   - Verify content type headers correct
   - Verify file contents intact

3. **List Files**:
   - GET /api/attachments (all attachments)
   - GET /api/attachments?auditId={id} (audit-specific)
   - Verify metadata accurate (filename, size, upload date)

4. **Delete Files**:
   - Delete an attachment as Owner/Admin
   - Verify file removed from disk
   - Verify metadata removed from database
   - Try to download deleted file (expect 404)

5. **Security Testing**:
   - Try to download attachment from different organization (expect 404)
   - Try to upload without authentication (expect 401)
   - Verify file paths don't allow directory traversal

---

### Phase 4: Deployment & Production Testing (1 hour)

#### 4.1 Commit & Push Changes

```bash
git add .
git commit -m "Implement Iteration 2: Findings, Activity Logs, File Uploads

- Add Findings CRUD endpoints with full filtering
- Add Activity Logging Middleware for audit trail
- Add Activity Logs API endpoints
- Add Local File Storage service
- Add Attachments CRUD endpoints
- Update Swagger documentation
- Add FluentValidation for all new endpoints

Completes Iteration 2 of PSS Portal Master Plan

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git push origin main
```

**Render Auto-Deploy**: Changes will automatically deploy to production in ~5 minutes

---

#### 4.2 Production Smoke Tests

**After deployment completes**:

1. **Findings Endpoints**:
   - Create finding via Swagger
   - List findings
   - Update finding status

2. **Activity Logs**:
   - Check /api/activity
   - Verify recent operations logged

3. **File Uploads**:
   - Upload test file via Swagger
   - Download file
   - Verify file accessible

**Note**: File uploads in Render free tier are ephemeral (lost on container restart). Document this limitation.

---

## 📊 Progress Tracking Checklist

### Phase 1: Findings Management
- [ ] DTOs created (FindingResponse, CreateFindingRequest, etc.)
- [ ] FluentValidation rules implemented
- [ ] FindingsController created
- [ ] GET /api/findings (list) implemented
- [ ] GET /api/findings/{id} (detail) implemented
- [ ] POST /api/findings (create) implemented
- [ ] PUT /api/findings/{id} (update) implemented
- [ ] PATCH /api/findings/{id}/status (status update) implemented
- [ ] DELETE /api/findings/{id} (delete) implemented
- [ ] Local testing completed
- [ ] Swagger documentation verified

### Phase 2: Activity Logging
- [ ] ActivityLoggingMiddleware created
- [ ] Middleware registered in Program.cs
- [ ] ActivityController created
- [ ] GET /api/activity (list) implemented
- [ ] GET /api/activity/audits/{auditId} (audit-specific) implemented
- [ ] User email join working correctly
- [ ] Local testing completed
- [ ] Audit trail verified for all CRUD operations

### Phase 3: File Upload System
- [ ] IFileStorage interface created
- [ ] LocalFileStorage implementation created
- [ ] Service registered in Program.cs
- [ ] uploads/ directory configured
- [ ] AttachmentsController created
- [ ] POST /api/attachments (upload) implemented
- [ ] GET /api/attachments/{id} (download) implemented
- [ ] GET /api/attachments (list) implemented
- [ ] DELETE /api/attachments/{id} (delete) implemented
- [ ] File size validation working
- [ ] File type validation working
- [ ] Local testing completed
- [ ] Security testing completed

### Phase 4: Deployment & Testing
- [ ] All changes committed to Git
- [ ] Code pushed to GitHub
- [ ] Render auto-deployment completed
- [ ] Production smoke tests passed
- [ ] Swagger documentation verified in production
- [ ] Performance acceptable (<500ms p95)

---

## 🔧 Troubleshooting Guide

### Issue: EF Core Migration Needed

**Symptoms**: New tables or columns not available

**Solution**:
```bash
# Create migration for Activity Logs or Attachments if schema changed
dotnet ef migrations add AddIterationTwoFeatures --project src/CAP.Infrastructure --startup-project src/CAP.Api

# Apply locally
dotnet ef database update --project src/CAP.Infrastructure --startup-project src/CAP.Api

# Apply to production (get connection string from Render)
$env:ConnectionStrings__Default="<render-db-connection-string>"
dotnet ef database update --project src/CAP.Infrastructure --startup-project src/CAP.Api
```

---

### Issue: File Upload Fails

**Symptoms**: 500 error on POST /api/attachments

**Possible Causes**:
1. uploads/ directory doesn't exist
2. File size exceeds limit
3. Invalid content type

**Solution**:
- Check `FileStorage:LocalPath` in appsettings
- Verify directory permissions
- Check file size validation logic
- Review Swagger request format (multipart/form-data)

---

### Issue: Activity Logs Not Being Created

**Symptoms**: /api/activity returns empty list

**Possible Causes**:
1. Middleware not registered
2. Middleware registered in wrong order
3. Organization scoping issue

**Solution**:
- Verify middleware in Program.cs: `app.UseMiddleware<ActivityLoggingMiddleware>();`
- Ensure it's after `UseAuthorization()`
- Check `ICurrentOrg.OrganizationId` is being set correctly
- Add logging to middleware to debug

---

### Issue: Render Deployment Fails

**Symptoms**: Build fails or deployment doesn't start

**Possible Causes**:
1. Compilation errors
2. Dockerfile issues
3. Missing dependencies

**Solution**:
- Check Render build logs in dashboard
- Verify local build works: `dotnet build -c Release`
- Test Docker build locally:
  ```bash
  docker build -t pss-portal-test .
  docker run -p 8080:8080 pss-portal-test
  ```

---

## 📈 Success Metrics

### Code Quality
- ✅ All endpoints follow RESTful conventions
- ✅ Consistent error handling across controllers
- ✅ FluentValidation on all inputs
- ✅ Authorization policies enforced
- ✅ Organization scoping on all queries

### Feature Completeness
- ✅ 18+ new endpoints implemented (Findings: 6, Activity: 2, Attachments: 4)
- ✅ Activity logging captures all mutations
- ✅ File upload/download working
- ✅ Swagger documentation complete

### Performance
- ✅ API response times <500ms (p95)
- ✅ Database queries optimized (proper indexes)
- ✅ File operations performant

### Security
- ✅ All endpoints require authentication
- ✅ Proper authorization on sensitive operations
- ✅ Organization data isolation maintained
- ✅ File upload validation prevents abuse
- ✅ Activity logs provide audit trail

---

## 🔮 Next Steps: Iteration 3 Prep

After completing Iteration 2, you'll be ready for:

### Iteration 3: Polish & Production Features
1. **Intake Forms Management** (questionnaire system)
2. **Organizations Management** (member invites, role management)
3. **Background Jobs** (Hangfire - reminders, scheduled reports)
4. **Database Seeding** (demo data for testing)
5. **Integration Tests** (automated testing suite)

**Estimated Time**: 8-12 hours
**Target**: Week 3 completion

---

## 📚 Reference Materials

### Master Plan Alignment
- **Current Phase**: Iteration 2 - Core Features
- **Progress**: 60% complete (Iteration 1 done, starting Iteration 2)
- **On Track**: Yes (within estimated timeline)

### API Endpoints Count
- **Iteration 1**: 11 endpoints (Auth: 4, Audits: 6, System: 1)
- **Iteration 2 (Adding)**: 12 endpoints (Findings: 6, Activity: 2, Attachments: 4)
- **Total After Day 6**: 23 endpoints

### Database Schema Progress
- **Iteration 1**: 11 tables (Users, Organizations, Audits core)
- **Iteration 2**: All tables utilized (Findings, ActivityLogs, Attachments)
- **Coverage**: ~70% of master plan schema in use

---

## 💡 Pro Tips

### Development Efficiency
1. **Use Swagger for Testing**: Faster than Postman for authenticated requests
2. **Keep Docker Running**: Restart penalty is 30+ seconds
3. **Test Locally First**: Don't push until local tests pass
4. **Commit Often**: Small commits easier to debug if issues arise

### Code Organization
1. **DTOs Near Controllers**: Keep request/response types close to usage
2. **Validators with DTOs**: FluentValidation classes in same file
3. **Middleware Separate**: Keep middleware in dedicated folder
4. **Service Interfaces in Application**: Keep Infrastructure decoupled

### Testing Strategy
1. **Happy Path First**: Verify basic CRUD before edge cases
2. **Security Second**: Test authorization after functionality works
3. **Performance Last**: Optimize after features complete

---

## ✅ Day 6 Definition of Done

- [ ] **All Iteration 2 features implemented** (Findings, Activity Logs, Attachments)
- [ ] **Local testing 100% passed** (all endpoints working)
- [ ] **Code pushed to GitHub** (clean commit history)
- [ ] **Deployed to Render production** (auto-deploy successful)
- [ ] **Production smoke tests passed** (key workflows verified)
- [ ] **Swagger documentation complete** (all new endpoints documented)
- [ ] **Day 6 completion report written** (progress documented)
- [ ] **Performance acceptable** (<500ms API responses)
- [ ] **No regressions** (Iteration 1 features still working)
- [ ] **Security validated** (authorization working correctly)

---

## 📞 Support Resources

**Development Questions**:
- Master Plan: `PSS_Portal_Master_Plan.md`
- Domain Models: `src/CAP.Domain/Entities/`
- Existing Controllers: `src/CAP.Api/Controllers/AuditsController.cs` (reference)

**Deployment Questions**:
- Deployment Guide: `RENDER-DEPLOYMENT.md`
- Render Dashboard: https://dashboard.render.com
- Production API: https://pss-portal-api.onrender.com

**Database Questions**:
- Connection String: Render dashboard (pss-portal-db → Connect)
- Schema: `src/CAP.Infrastructure/Data/AppDbContext.cs`
- Migrations: `src/CAP.Infrastructure/Migrations/`

---

**Prepared by**: Claude Opus 4.5
**Plan Date**: January 19, 2026
**Execution Date**: January 20, 2026 (Planned)
**Estimated Duration**: 6-8 hours
**Complexity**: Medium
**Risk Level**: Low (incremental changes, well-defined scope)
**Status**: 📋 **READY TO EXECUTE**
