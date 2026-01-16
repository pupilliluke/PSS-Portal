namespace CAP.Domain.Entities;

public class OrganizationMember
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = default!;
    public string UserId { get; set; } = default!; // Identity user id (string)
    public string Role { get; set; } = "ClientViewer"; // Owner/Admin/ClientManager/ClientViewer
    public DateTimeOffset JoinedAt { get; set; } = DateTimeOffset.UtcNow;
}
