using CAP.Application.Common;
using CAP.Infrastructure.Auth;
using CAP.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CAP.Api.Controllers;

[ApiController]
[Route("api/activity")]
[Authorize]
public class ActivityController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentOrg _org;
    private readonly ILogger<ActivityController> _logger;

    public ActivityController(AppDbContext db, ICurrentOrg org, ILogger<ActivityController> logger)
    {
        _db = db;
        _org = org;
        _logger = logger;
    }

    // DTOs
    public record ActivityLogResponse(
        Guid Id,
        string UserId,
        string UserEmail,
        string Action,
        string EntityType,
        Guid EntityId,
        DateTimeOffset Timestamp
    );

    /// <summary>
    /// List activity logs for the organization
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ActivityLogResponse>>> List(
        [FromQuery] string? entityType = null,
        [FromQuery] Guid? entityId = null,
        [FromQuery] int limit = 50)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        limit = Math.Clamp(limit, 1, 200);

        var query = _db.ActivityLogs
            .Where(a => a.OrganizationId == _org.OrganizationId);

        if (!string.IsNullOrEmpty(entityType))
            query = query.Where(a => a.EntityType == entityType);

        if (entityId.HasValue)
            query = query.Where(a => a.EntityId == entityId.Value);

        var logs = await query
            .OrderByDescending(a => a.Timestamp)
            .Take(limit)
            .Join(
                _db.Users,
                log => log.UserId,
                user => user.Id,
                (log, user) => new ActivityLogResponse(
                    log.Id,
                    log.UserId,
                    user.Email ?? "Unknown",
                    log.Action,
                    log.EntityType,
                    log.EntityId,
                    log.Timestamp
                ))
            .ToListAsync();

        _logger.LogInformation("Listed {Count} activity logs for organization {OrgId}", logs.Count, _org.OrganizationId);

        return Ok(logs);
    }

    /// <summary>
    /// Get activity logs for a specific audit
    /// </summary>
    [HttpGet("audits/{auditId}")]
    public async Task<ActionResult<List<ActivityLogResponse>>> GetAuditActivity(
        Guid auditId,
        [FromQuery] int limit = 50)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        // Verify audit belongs to this organization
        var auditExists = await _db.Audits
            .AnyAsync(a => a.Id == auditId && a.OrganizationId == _org.OrganizationId);

        if (!auditExists)
            return NotFound(new { message = "Audit not found" });

        limit = Math.Clamp(limit, 1, 200);

        // Get activity for the audit itself and all findings under it
        var findingIds = await _db.Findings
            .Where(f => f.AuditId == auditId)
            .Select(f => f.Id)
            .ToListAsync();

        var entityIds = new List<Guid> { auditId };
        entityIds.AddRange(findingIds);

        var logs = await _db.ActivityLogs
            .Where(a => a.OrganizationId == _org.OrganizationId && entityIds.Contains(a.EntityId))
            .OrderByDescending(a => a.Timestamp)
            .Take(limit)
            .Join(
                _db.Users,
                log => log.UserId,
                user => user.Id,
                (log, user) => new ActivityLogResponse(
                    log.Id,
                    log.UserId,
                    user.Email ?? "Unknown",
                    log.Action,
                    log.EntityType,
                    log.EntityId,
                    log.Timestamp
                ))
            .ToListAsync();

        _logger.LogInformation("Listed {Count} activity logs for audit {AuditId}", logs.Count, auditId);

        return Ok(logs);
    }
}
