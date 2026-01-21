using System.Security.Claims;
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
                .WithMessage("Invalid status. Must be one of: Draft, InReview, Delivered, InProgress, Closed");
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

        _logger.LogInformation("Listed {Count} audits for organization {OrgId}", audits.Count, _org.OrganizationId);

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

        var userId = User.FindFirstValue("sub");

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
    /// Update audit status (Owner/Admin only)
    /// </summary>
    [HttpPatch("{id}/status")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<ActionResult<AuditResponse>> UpdateStatus(Guid id, UpdateStatusRequest req)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var audit = await _db.Audits
            .FirstOrDefaultAsync(a => a.Id == id && a.OrganizationId == _org.OrganizationId);

        if (audit is null)
            return NotFound(new { message = "Audit not found" });

        var oldStatus = audit.Status;
        audit.Status = req.Status;
        audit.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Audit {AuditId} status changed from {OldStatus} to {NewStatus}",
            id, oldStatus, req.Status);

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
