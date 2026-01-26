using CAP.Domain.Entities;
using CAP.Infrastructure.Auth;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CAP.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<OrganizationMember> OrganizationMembers => Set<OrganizationMember>();
    public DbSet<Audit> Audits => Set<Audit>();
    public DbSet<Finding> Findings => Set<Finding>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<GoogleConnection> GoogleConnections => Set<GoogleConnection>();
    public DbSet<LeadImportBatch> LeadImportBatches => Set<LeadImportBatch>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Organization
        builder.Entity<Organization>(b =>
        {
            b.HasIndex(x => x.Name);
        });

        // OrganizationMember
        builder.Entity<OrganizationMember>(b =>
        {
            b.HasIndex(x => new { x.OrganizationId, x.UserId }).IsUnique();
        });

        // Audit
        builder.Entity<Audit>(b =>
        {
            b.HasIndex(x => x.OrganizationId);
            b.HasIndex(x => new { x.OrganizationId, x.Status, x.CreatedAt });
        });

        // Finding
        builder.Entity<Finding>(b =>
        {
            b.HasIndex(x => x.OrganizationId);
            b.HasIndex(x => x.AuditId);
            b.HasIndex(x => new { x.OrganizationId, x.Status });
            b.HasIndex(x => new { x.OrganizationId, x.Category });
        });

        // ActivityLog
        builder.Entity<ActivityLog>(b =>
        {
            b.HasIndex(x => x.OrganizationId);
            b.HasIndex(x => new { x.OrganizationId, x.Timestamp });
            b.HasIndex(x => new { x.EntityType, x.EntityId });
        });

        // Attachment
        builder.Entity<Attachment>(b =>
        {
            b.HasIndex(x => x.OrganizationId);
            b.HasIndex(x => x.AuditId);
            b.HasIndex(x => x.StorageKey).IsUnique();
        });

        // Lead
        builder.Entity<Lead>(b =>
        {
            b.HasIndex(x => x.OrganizationId);
            b.HasIndex(x => new { x.OrganizationId, x.Status });
            b.HasIndex(x => new { x.OrganizationId, x.Email });
            b.HasIndex(x => x.ImportBatchId);
        });

        // GoogleConnection
        builder.Entity<GoogleConnection>(b =>
        {
            b.HasIndex(x => new { x.UserId, x.OrganizationId }).IsUnique();
            b.HasIndex(x => x.OrganizationId);
        });

        // LeadImportBatch
        builder.Entity<LeadImportBatch>(b =>
        {
            b.HasIndex(x => x.OrganizationId);
            b.HasIndex(x => new { x.OrganizationId, x.CreatedAt });
        });
    }
}
