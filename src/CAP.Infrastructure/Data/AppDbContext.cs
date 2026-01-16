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
    }
}
