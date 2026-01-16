using Microsoft.AspNetCore.Identity;

namespace CAP.Infrastructure.Auth;

public class AppUser : IdentityUser
{
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
}
