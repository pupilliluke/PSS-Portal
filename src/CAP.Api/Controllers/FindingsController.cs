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
[Route("api/findings")]
[Authorize]
public class FindingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentOrg _org;
    private readonly ILogger<FindingsController> _logger;

    public FindingsController(AppDbContext db, ICurrentOrg org, ILogger<FindingsController> logger)
    {
        _db = db;
        _org = org;
        _logger = logger;
    }

    // DTOs
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

    // Validators
    public class CreateFindingRequestValidator : AbstractValidator<CreateFindingRequest>
    {
        private static readonly string[] ValidCategories = { "Automation", "Data", "Marketing", "Security", "Ops" };
        private static readonly string[] ValidSeverities = { "Low", "Medium", "High" };
        private static readonly string[] ValidEfforts = { "S", "M", "L" };

        public CreateFindingRequestValidator()
        {
            RuleFor(x => x.AuditId).NotEmpty();
            RuleFor(x => x.Category)
                .Must(c => ValidCategories.Contains(c))
                .WithMessage($"Invalid category. Must be one of: {string.Join(", ", ValidCategories)}");
            RuleFor(x => x.Severity)
                .Must(s => ValidSeverities.Contains(s))
                .WithMessage($"Invalid severity. Must be one of: {string.Join(", ", ValidSeverities)}");
            RuleFor(x => x.Effort)
                .Must(e => ValidEfforts.Contains(e))
                .WithMessage($"Invalid effort. Must be one of: {string.Join(", ", ValidEfforts)}");
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
            RuleFor(x => x.Recommendation).NotEmpty().MaximumLength(2000);
            RuleFor(x => x.RoiEstimate).MaximumLength(500).When(x => x.RoiEstimate != null);
        }
    }

    public class UpdateFindingRequestValidator : AbstractValidator<UpdateFindingRequest>
    {
        private static readonly string[] ValidCategories = { "Automation", "Data", "Marketing", "Security", "Ops" };
        private static readonly string[] ValidSeverities = { "Low", "Medium", "High" };
        private static readonly string[] ValidEfforts = { "S", "M", "L" };

        public UpdateFindingRequestValidator()
        {
            RuleFor(x => x.Category)
                .Must(c => ValidCategories.Contains(c))
                .WithMessage($"Invalid category. Must be one of: {string.Join(", ", ValidCategories)}");
            RuleFor(x => x.Severity)
                .Must(s => ValidSeverities.Contains(s))
                .WithMessage($"Invalid severity. Must be one of: {string.Join(", ", ValidSeverities)}");
            RuleFor(x => x.Effort)
                .Must(e => ValidEfforts.Contains(e))
                .WithMessage($"Invalid effort. Must be one of: {string.Join(", ", ValidEfforts)}");
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
            RuleFor(x => x.Recommendation).NotEmpty().MaximumLength(2000);
            RuleFor(x => x.RoiEstimate).MaximumLength(500).When(x => x.RoiEstimate != null);
        }
    }

    public class UpdateFindingStatusRequestValidator : AbstractValidator<UpdateFindingStatusRequest>
    {
        private static readonly string[] ValidStatuses = { "Identified", "InProgress", "Resolved" };

        public UpdateFindingStatusRequestValidator()
        {
            RuleFor(x => x.Status)
                .Must(s => ValidStatuses.Contains(s))
                .WithMessage($"Invalid status. Must be one of: {string.Join(", ", ValidStatuses)}");
        }
    }

    /// <summary>
    /// List findings with optional filters
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<FindingResponse>>> List(
        [FromQuery] Guid? auditId = null,
        [FromQuery] string? category = null,
        [FromQuery] string? severity = null,
        [FromQuery] string? status = null)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var query = _db.Findings.Where(f => f.OrganizationId == _org.OrganizationId);

        if (auditId.HasValue)
            query = query.Where(f => f.AuditId == auditId.Value);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(f => f.Category == category);

        if (!string.IsNullOrEmpty(severity))
            query = query.Where(f => f.Severity == severity);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(f => f.Status == status);

        var findings = await query
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new FindingResponse(
                f.Id,
                f.AuditId,
                f.Category,
                f.Severity,
                f.Effort,
                f.Title,
                f.Description,
                f.Recommendation,
                f.RoiEstimate,
                f.Status,
                f.CreatedAt,
                f.UpdatedAt
            ))
            .ToListAsync();

        _logger.LogInformation("Listed {Count} findings for organization {OrgId}", findings.Count, _org.OrganizationId);

        return Ok(findings);
    }

    /// <summary>
    /// Get finding details with audit summary
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<FindingDetailResponse>> Get(Guid id)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var finding = await _db.Findings
            .Include(f => f.Audit)
            .Where(f => f.Id == id && f.OrganizationId == _org.OrganizationId)
            .Select(f => new FindingDetailResponse(
                f.Id,
                f.AuditId,
                f.Category,
                f.Severity,
                f.Effort,
                f.Title,
                f.Description,
                f.Recommendation,
                f.RoiEstimate,
                f.Status,
                f.CreatedAt,
                f.UpdatedAt,
                new AuditSummary(f.Audit!.Id, f.Audit.Title, f.Audit.Status)
            ))
            .FirstOrDefaultAsync();

        if (finding is null)
            return NotFound(new { message = "Finding not found" });

        return Ok(finding);
    }

    /// <summary>
    /// Create a new finding (Owner/Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<ActionResult<FindingResponse>> Create(CreateFindingRequest req)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        // Verify audit belongs to this organization
        var audit = await _db.Audits
            .FirstOrDefaultAsync(a => a.Id == req.AuditId && a.OrganizationId == _org.OrganizationId);

        if (audit is null)
            return BadRequest(new { message = "Audit not found or does not belong to your organization" });

        var finding = new Finding
        {
            OrganizationId = _org.OrganizationId,
            AuditId = req.AuditId,
            Category = req.Category,
            Severity = req.Severity,
            Effort = req.Effort,
            Title = req.Title,
            Description = req.Description,
            Recommendation = req.Recommendation,
            RoiEstimate = req.RoiEstimate,
            Status = "Identified",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _db.Findings.Add(finding);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Finding created: {FindingId} for audit {AuditId}", finding.Id, req.AuditId);

        return CreatedAtAction(
            nameof(Get),
            new { id = finding.Id },
            new FindingResponse(
                finding.Id,
                finding.AuditId,
                finding.Category,
                finding.Severity,
                finding.Effort,
                finding.Title,
                finding.Description,
                finding.Recommendation,
                finding.RoiEstimate,
                finding.Status,
                finding.CreatedAt,
                finding.UpdatedAt
            ));
    }

    /// <summary>
    /// Update a finding (Owner/Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<ActionResult<FindingResponse>> Update(Guid id, UpdateFindingRequest req)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var finding = await _db.Findings
            .FirstOrDefaultAsync(f => f.Id == id && f.OrganizationId == _org.OrganizationId);

        if (finding is null)
            return NotFound(new { message = "Finding not found" });

        finding.Category = req.Category;
        finding.Severity = req.Severity;
        finding.Effort = req.Effort;
        finding.Title = req.Title;
        finding.Description = req.Description;
        finding.Recommendation = req.Recommendation;
        finding.RoiEstimate = req.RoiEstimate;
        finding.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Finding updated: {FindingId}", id);

        return Ok(new FindingResponse(
            finding.Id,
            finding.AuditId,
            finding.Category,
            finding.Severity,
            finding.Effort,
            finding.Title,
            finding.Description,
            finding.Recommendation,
            finding.RoiEstimate,
            finding.Status,
            finding.CreatedAt,
            finding.UpdatedAt
        ));
    }

    /// <summary>
    /// Update finding status
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<ActionResult<FindingResponse>> UpdateStatus(Guid id, UpdateFindingStatusRequest req)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var finding = await _db.Findings
            .FirstOrDefaultAsync(f => f.Id == id && f.OrganizationId == _org.OrganizationId);

        if (finding is null)
            return NotFound(new { message = "Finding not found" });

        var oldStatus = finding.Status;
        finding.Status = req.Status;
        finding.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Finding {FindingId} status changed from {OldStatus} to {NewStatus}",
            id, oldStatus, req.Status);

        return Ok(new FindingResponse(
            finding.Id,
            finding.AuditId,
            finding.Category,
            finding.Severity,
            finding.Effort,
            finding.Title,
            finding.Description,
            finding.Recommendation,
            finding.RoiEstimate,
            finding.Status,
            finding.CreatedAt,
            finding.UpdatedAt
        ));
    }

    /// <summary>
    /// Delete a finding (Owner only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "Owner")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var finding = await _db.Findings
            .FirstOrDefaultAsync(f => f.Id == id && f.OrganizationId == _org.OrganizationId);

        if (finding is null)
            return NotFound(new { message = "Finding not found" });

        _db.Findings.Remove(finding);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Finding deleted: {FindingId}", id);

        return NoContent();
    }
}
