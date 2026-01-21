namespace CAP.Domain.Entities;

public class ActivityLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }
    public string UserId { get; set; } = default!;
    public string Action { get; set; } = default!;     // Created, Updated, StatusChanged, Deleted
    public string EntityType { get; set; } = default!; // Audit, Finding, Attachment
    public Guid EntityId { get; set; }
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

    // Navigation properties
    public Organization? Organization { get; set; }
}
