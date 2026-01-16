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

    // Navigation properties
    public Organization? Organization { get; set; }
}
