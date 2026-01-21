using System.Security.Claims;
using CAP.Application.Common;
using CAP.Domain.Entities;
using CAP.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CAP.Api.Controllers;

[ApiController]
[Route("api/attachments")]
[Authorize]
public class AttachmentsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentOrg _org;
    private readonly IFileStorage _fileStorage;
    private readonly ILogger<AttachmentsController> _logger;

    private static readonly string[] AllowedContentTypes =
    {
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
        "application/vnd.ms-excel", // xls
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
        "application/msword", // doc
        "text/csv",
        "text/plain"
    };

    private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB

    public AttachmentsController(
        AppDbContext db,
        ICurrentOrg org,
        IFileStorage fileStorage,
        ILogger<AttachmentsController> logger)
    {
        _db = db;
        _org = org;
        _fileStorage = fileStorage;
        _logger = logger;
    }

    // DTOs
    public record AttachmentResponse(
        Guid Id,
        Guid? AuditId,
        string FileName,
        string ContentType,
        long FileSize,
        DateTimeOffset UploadedAt,
        string UploadedByEmail
    );

    /// <summary>
    /// Upload a file attachment
    /// </summary>
    [HttpPost]
    [RequestSizeLimit(11 * 1024 * 1024)] // 11 MB to account for overhead
    public async Task<ActionResult<AttachmentResponse>> Upload(
        IFormFile file,
        [FromForm] Guid? auditId = null)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file provided" });

        if (file.Length > MaxFileSize)
            return BadRequest(new { message = $"File size exceeds maximum of {MaxFileSize / 1024 / 1024} MB" });

        if (!AllowedContentTypes.Contains(file.ContentType))
            return BadRequest(new { message = $"File type '{file.ContentType}' is not allowed" });

        // Verify audit belongs to this organization if provided
        if (auditId.HasValue)
        {
            var auditExists = await _db.Audits
                .AnyAsync(a => a.Id == auditId.Value && a.OrganizationId == _org.OrganizationId);

            if (!auditExists)
                return BadRequest(new { message = "Audit not found or does not belong to your organization" });
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? "Unknown";

        // Upload file to storage
        using var stream = file.OpenReadStream();
        var storageKey = await _fileStorage.UploadAsync(stream, file.FileName, file.ContentType);

        // Save metadata to database
        var attachment = new Attachment
        {
            OrganizationId = _org.OrganizationId,
            AuditId = auditId,
            FileName = file.FileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            StorageKey = storageKey,
            UploadedById = userId,
            UploadedAt = DateTimeOffset.UtcNow
        };

        _db.Attachments.Add(attachment);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Attachment uploaded: {AttachmentId} ({FileName}, {FileSize} bytes)",
            attachment.Id, file.FileName, file.Length);

        return CreatedAtAction(
            nameof(Download),
            new { id = attachment.Id },
            new AttachmentResponse(
                attachment.Id,
                attachment.AuditId,
                attachment.FileName,
                attachment.ContentType,
                attachment.FileSize,
                attachment.UploadedAt,
                userEmail
            ));
    }

    /// <summary>
    /// Download a file attachment
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> Download(Guid id)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var attachment = await _db.Attachments
            .FirstOrDefaultAsync(a => a.Id == id && a.OrganizationId == _org.OrganizationId);

        if (attachment is null)
            return NotFound(new { message = "Attachment not found" });

        try
        {
            var stream = await _fileStorage.DownloadAsync(attachment.StorageKey);
            return File(stream, attachment.ContentType, attachment.FileName);
        }
        catch (FileNotFoundException)
        {
            _logger.LogWarning("File not found in storage for attachment {AttachmentId}", id);
            return NotFound(new { message = "File not found in storage" });
        }
    }

    /// <summary>
    /// List attachments for the organization
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<AttachmentResponse>>> List(
        [FromQuery] Guid? auditId = null,
        [FromQuery] int limit = 50)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        limit = Math.Clamp(limit, 1, 200);

        var query = _db.Attachments
            .Where(a => a.OrganizationId == _org.OrganizationId);

        if (auditId.HasValue)
            query = query.Where(a => a.AuditId == auditId.Value);

        var attachments = await query
            .OrderByDescending(a => a.UploadedAt)
            .Take(limit)
            .Join(
                _db.Users,
                att => att.UploadedById,
                user => user.Id,
                (att, user) => new AttachmentResponse(
                    att.Id,
                    att.AuditId,
                    att.FileName,
                    att.ContentType,
                    att.FileSize,
                    att.UploadedAt,
                    user.Email ?? "Unknown"
                ))
            .ToListAsync();

        _logger.LogInformation("Listed {Count} attachments for organization {OrgId}", attachments.Count, _org.OrganizationId);

        return Ok(attachments);
    }

    /// <summary>
    /// Delete an attachment (Owner/Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var attachment = await _db.Attachments
            .FirstOrDefaultAsync(a => a.Id == id && a.OrganizationId == _org.OrganizationId);

        if (attachment is null)
            return NotFound(new { message = "Attachment not found" });

        // Delete from storage
        try
        {
            await _fileStorage.DeleteAsync(attachment.StorageKey);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete file from storage: {StorageKey}", attachment.StorageKey);
        }

        // Delete from database
        _db.Attachments.Remove(attachment);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Attachment deleted: {AttachmentId}", id);

        return NoContent();
    }
}
