namespace CAP.Domain.Entities;

public class LeadImportBatch
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }
    public string UserId { get; set; } = default!;

    public string SourceType { get; set; } = "GoogleSheets";  // GoogleSheets, CSV, Manual
    public string? SourceId { get; set; }                     // Sheet ID or file name
    public string? SourceName { get; set; }                   // Display name for the source

    public string Status { get; set; } = "Pending";           // Pending, Processing, Completed, Failed
    public int TotalRows { get; set; }
    public int ImportedCount { get; set; }
    public int SkippedCount { get; set; }
    public int ErrorCount { get; set; }
    public string? ErrorDetails { get; set; }                 // JSON array of row errors

    public string? ColumnMapping { get; set; }                // JSON mapping configuration
    public string DuplicateStrategy { get; set; } = "Skip";   // Skip, Update, Create

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? CompletedAt { get; set; }

    // Navigation properties
    public Organization? Organization { get; set; }
    public ICollection<Lead> Leads { get; set; } = new List<Lead>();
}
