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
[Route("api/leads")]
[Authorize]
public class LeadsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentOrg _org;
    private readonly ILogger<LeadsController> _logger;

    public LeadsController(AppDbContext db, ICurrentOrg org, ILogger<LeadsController> logger)
    {
        _db = db;
        _org = org;
        _logger = logger;
    }

    // DTOs
    public record LeadResponse(
        Guid Id,
        string FirstName,
        string LastName,
        string Email,
        string? Phone,
        string? Company,
        string Source,
        string Status,
        int? Score,
        string? Notes,
        Guid? ImportBatchId,
        string? ImportSourceId,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt
    );

    public record CreateLeadRequest(
        string FirstName,
        string LastName,
        string Email,
        string? Phone,
        string? Company,
        string Source,
        int? Score,
        string? Notes
    );

    public record UpdateLeadRequest(
        string FirstName,
        string LastName,
        string Email,
        string? Phone,
        string? Company,
        string Source,
        int? Score,
        string? Notes
    );

    public record UpdateLeadStatusRequest(string Status);

    // Validators
    public class CreateLeadRequestValidator : AbstractValidator<CreateLeadRequest>
    {
        private static readonly string[] ValidSources = { "Website", "Referral", "GoogleSheets", "Manual", "Advertisement", "Other" };

        public CreateLeadRequestValidator()
        {
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(255);
            RuleFor(x => x.Phone).MaximumLength(50).When(x => x.Phone != null);
            RuleFor(x => x.Company).MaximumLength(200).When(x => x.Company != null);
            RuleFor(x => x.Source)
                .Must(s => ValidSources.Contains(s))
                .WithMessage($"Invalid source. Must be one of: {string.Join(", ", ValidSources)}");
            RuleFor(x => x.Score)
                .InclusiveBetween(0, 100).When(x => x.Score.HasValue)
                .WithMessage("Score must be between 0 and 100");
            RuleFor(x => x.Notes).MaximumLength(2000).When(x => x.Notes != null);
        }
    }

    public class UpdateLeadRequestValidator : AbstractValidator<UpdateLeadRequest>
    {
        private static readonly string[] ValidSources = { "Website", "Referral", "GoogleSheets", "Manual", "Advertisement", "Other" };

        public UpdateLeadRequestValidator()
        {
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(255);
            RuleFor(x => x.Phone).MaximumLength(50).When(x => x.Phone != null);
            RuleFor(x => x.Company).MaximumLength(200).When(x => x.Company != null);
            RuleFor(x => x.Source)
                .Must(s => ValidSources.Contains(s))
                .WithMessage($"Invalid source. Must be one of: {string.Join(", ", ValidSources)}");
            RuleFor(x => x.Score)
                .InclusiveBetween(0, 100).When(x => x.Score.HasValue)
                .WithMessage("Score must be between 0 and 100");
            RuleFor(x => x.Notes).MaximumLength(2000).When(x => x.Notes != null);
        }
    }

    public class UpdateLeadStatusRequestValidator : AbstractValidator<UpdateLeadStatusRequest>
    {
        private static readonly string[] ValidStatuses = { "New", "Contacted", "Qualified", "Converted", "Lost" };

        public UpdateLeadStatusRequestValidator()
        {
            RuleFor(x => x.Status)
                .Must(s => ValidStatuses.Contains(s))
                .WithMessage($"Invalid status. Must be one of: {string.Join(", ", ValidStatuses)}");
        }
    }

    /// <summary>
    /// List leads with optional filters and search
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<LeadResponse>>> List(
        [FromQuery] string? status = null,
        [FromQuery] string? source = null,
        [FromQuery] string? search = null,
        [FromQuery] int limit = 50)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        limit = Math.Clamp(limit, 1, 200);

        var query = _db.Leads.Where(l => l.OrganizationId == _org.OrganizationId);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(l => l.Status == status);

        if (!string.IsNullOrEmpty(source))
            query = query.Where(l => l.Source == source);

        if (!string.IsNullOrEmpty(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(l =>
                l.FirstName.ToLower().Contains(searchLower) ||
                l.LastName.ToLower().Contains(searchLower) ||
                l.Email.ToLower().Contains(searchLower) ||
                (l.Company != null && l.Company.ToLower().Contains(searchLower)));
        }

        var leads = await query
            .OrderByDescending(l => l.CreatedAt)
            .Take(limit)
            .Select(l => new LeadResponse(
                l.Id,
                l.FirstName,
                l.LastName,
                l.Email,
                l.Phone,
                l.Company,
                l.Source,
                l.Status,
                l.Score,
                l.Notes,
                l.ImportBatchId,
                l.ImportSourceId,
                l.CreatedAt,
                l.UpdatedAt
            ))
            .ToListAsync();

        _logger.LogInformation("Listed {Count} leads for organization {OrgId}", leads.Count, _org.OrganizationId);

        return Ok(leads);
    }

    /// <summary>
    /// Get lead details
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<LeadResponse>> Get(Guid id)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var lead = await _db.Leads
            .Where(l => l.Id == id && l.OrganizationId == _org.OrganizationId)
            .Select(l => new LeadResponse(
                l.Id,
                l.FirstName,
                l.LastName,
                l.Email,
                l.Phone,
                l.Company,
                l.Source,
                l.Status,
                l.Score,
                l.Notes,
                l.ImportBatchId,
                l.ImportSourceId,
                l.CreatedAt,
                l.UpdatedAt
            ))
            .FirstOrDefaultAsync();

        if (lead is null)
            return NotFound(new { message = "Lead not found" });

        return Ok(lead);
    }

    /// <summary>
    /// Create a new lead (Owner/Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<ActionResult<LeadResponse>> Create(CreateLeadRequest req)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var lead = new Lead
        {
            OrganizationId = _org.OrganizationId,
            FirstName = req.FirstName,
            LastName = req.LastName,
            Email = req.Email,
            Phone = req.Phone,
            Company = req.Company,
            Source = req.Source,
            Status = "New",
            Score = req.Score,
            Notes = req.Notes,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _db.Leads.Add(lead);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Lead created: {LeadId} ({Email})", lead.Id, lead.Email);

        return CreatedAtAction(
            nameof(Get),
            new { id = lead.Id },
            new LeadResponse(
                lead.Id,
                lead.FirstName,
                lead.LastName,
                lead.Email,
                lead.Phone,
                lead.Company,
                lead.Source,
                lead.Status,
                lead.Score,
                lead.Notes,
                lead.ImportBatchId,
                lead.ImportSourceId,
                lead.CreatedAt,
                lead.UpdatedAt
            ));
    }

    /// <summary>
    /// Update a lead (Owner/Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<ActionResult<LeadResponse>> Update(Guid id, UpdateLeadRequest req)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var lead = await _db.Leads
            .FirstOrDefaultAsync(l => l.Id == id && l.OrganizationId == _org.OrganizationId);

        if (lead is null)
            return NotFound(new { message = "Lead not found" });

        lead.FirstName = req.FirstName;
        lead.LastName = req.LastName;
        lead.Email = req.Email;
        lead.Phone = req.Phone;
        lead.Company = req.Company;
        lead.Source = req.Source;
        lead.Score = req.Score;
        lead.Notes = req.Notes;
        lead.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Lead updated: {LeadId}", id);

        return Ok(new LeadResponse(
            lead.Id,
            lead.FirstName,
            lead.LastName,
            lead.Email,
            lead.Phone,
            lead.Company,
            lead.Source,
            lead.Status,
            lead.Score,
            lead.Notes,
            lead.ImportBatchId,
            lead.ImportSourceId,
            lead.CreatedAt,
            lead.UpdatedAt
        ));
    }

    /// <summary>
    /// Update lead status
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<ActionResult<LeadResponse>> UpdateStatus(Guid id, UpdateLeadStatusRequest req)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var lead = await _db.Leads
            .FirstOrDefaultAsync(l => l.Id == id && l.OrganizationId == _org.OrganizationId);

        if (lead is null)
            return NotFound(new { message = "Lead not found" });

        var oldStatus = lead.Status;
        lead.Status = req.Status;
        lead.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Lead {LeadId} status changed from {OldStatus} to {NewStatus}",
            id, oldStatus, req.Status);

        return Ok(new LeadResponse(
            lead.Id,
            lead.FirstName,
            lead.LastName,
            lead.Email,
            lead.Phone,
            lead.Company,
            lead.Source,
            lead.Status,
            lead.Score,
            lead.Notes,
            lead.ImportBatchId,
            lead.ImportSourceId,
            lead.CreatedAt,
            lead.UpdatedAt
        ));
    }

    /// <summary>
    /// Delete a lead (Owner only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "Owner")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var lead = await _db.Leads
            .FirstOrDefaultAsync(l => l.Id == id && l.OrganizationId == _org.OrganizationId);

        if (lead is null)
            return NotFound(new { message = "Lead not found" });

        _db.Leads.Remove(lead);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Lead deleted: {LeadId}", id);

        return NoContent();
    }
}
