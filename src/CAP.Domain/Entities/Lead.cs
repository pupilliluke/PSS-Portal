namespace CAP.Domain.Entities;

public class Lead
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }

    // Contact Information
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string? Phone { get; set; }
    public string? Company { get; set; }

    // Lead Management
    public string Source { get; set; } = default!;      // Website, Referral, GoogleSheets, Manual, Advertisement, Other
    public string Status { get; set; } = "New";         // New, Contacted, Qualified, Converted, Lost
    public int? Score { get; set; }                     // 0-100 optional lead score
    public string? Notes { get; set; }

    // Import Tracking
    public Guid? ImportBatchId { get; set; }
    public string? ImportSourceId { get; set; }         // Google Sheet ID if imported

    // Timestamps
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation properties
    public Organization? Organization { get; set; }
    public LeadImportBatch? ImportBatch { get; set; }
}
