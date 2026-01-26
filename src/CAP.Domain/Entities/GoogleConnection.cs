namespace CAP.Domain.Entities;

public class GoogleConnection
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = default!;      // AppUser.Id
    public Guid OrganizationId { get; set; }            // For org-scoped queries

    public string GoogleEmail { get; set; } = default!;
    public string AccessToken { get; set; } = default!;
    public string RefreshToken { get; set; } = default!;
    public DateTimeOffset TokenExpiry { get; set; }
    public string Scopes { get; set; } = default!;      // Comma-separated scopes

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation properties
    public Organization? Organization { get; set; }
}
