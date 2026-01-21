namespace CAP.Domain.Entities;

public class Finding
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }
    public Guid AuditId { get; set; }
    public string Category { get; set; } = default!;  // Automation, Data, Marketing, Security, Ops
    public string Severity { get; set; } = default!;  // Low, Medium, High
    public string Effort { get; set; } = default!;    // S, M, L
    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
    public string Recommendation { get; set; } = default!;
    public string? RoiEstimate { get; set; }
    public string Status { get; set; } = "Identified";  // Identified, InProgress, Resolved
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation properties
    public Organization? Organization { get; set; }
    public Audit? Audit { get; set; }
}
