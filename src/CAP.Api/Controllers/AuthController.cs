using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CAP.Domain.Entities;
using CAP.Infrastructure.Auth;
using CAP.Infrastructure.Data;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CAP.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _users;
    private readonly AppDbContext _db;
    private readonly IConfiguration _cfg;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<AppUser> users,
        AppDbContext db,
        IConfiguration cfg,
        ILogger<AuthController> logger)
    {
        _users = users;
        _db = db;
        _cfg = cfg;
        _logger = logger;
    }

    // DTOs
    public record RegisterRequest(string Email, string Password, string OrganizationName);
    public record LoginRequest(string Email, string Password);
    public record RefreshRequest(string RefreshToken);
    public record AuthResponse(string AccessToken, string RefreshToken, Guid OrganizationId, string Email);

    // Validators
    public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
            RuleFor(x => x.OrganizationName).NotEmpty().MaximumLength(200);
        }
    }

    public class LoginRequestValidator : AbstractValidator<LoginRequest>
    {
        public LoginRequestValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Password).NotEmpty();
        }
    }

    public class RefreshRequestValidator : AbstractValidator<RefreshRequest>
    {
        public RefreshRequestValidator()
        {
            RuleFor(x => x.RefreshToken).NotEmpty();
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req)
    {
        _logger.LogInformation("Registration attempt for email: {Email}", req.Email);

        // Check if user already exists
        var existingUser = await _users.FindByEmailAsync(req.Email);
        if (existingUser != null)
        {
            return BadRequest(new { message = "User with this email already exists" });
        }

        // Create user
        var user = new AppUser { UserName = req.Email, Email = req.Email };
        var createResult = await _users.CreateAsync(user, req.Password);

        if (!createResult.Succeeded)
        {
            _logger.LogWarning("Registration failed for {Email}: {Errors}",
                req.Email,
                string.Join(", ", createResult.Errors.Select(e => e.Description)));
            return BadRequest(new { errors = createResult.Errors });
        }

        // Create organization
        var org = new Organization { Name = req.OrganizationName };
        _db.Organizations.Add(org);

        // Add user as Owner
        _db.OrganizationMembers.Add(new OrganizationMember
        {
            OrganizationId = org.Id,
            UserId = user.Id,
            Role = "Owner"
        });

        await _db.SaveChangesAsync();

        _logger.LogInformation("User {Email} registered successfully with organization {OrgId}",
            req.Email, org.Id);

        // Generate tokens
        var (accessToken, refreshToken) = await GenerateTokensAsync(user, org.Id, "Owner");

        return Ok(new AuthResponse(accessToken, refreshToken, org.Id, user.Email!));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
    {
        _logger.LogInformation("Login attempt for email: {Email}", req.Email);

        var user = await _users.Users.FirstOrDefaultAsync(x => x.Email == req.Email);
        if (user is null)
        {
            _logger.LogWarning("Login failed - user not found: {Email}", req.Email);
            return Unauthorized(new { message = "Invalid credentials" });
        }

        var validPassword = await _users.CheckPasswordAsync(user, req.Password);
        if (!validPassword)
        {
            _logger.LogWarning("Login failed - invalid password for: {Email}", req.Email);
            return Unauthorized(new { message = "Invalid credentials" });
        }

        // Get user's first organization
        var membership = await _db.OrganizationMembers
            .Where(m => m.UserId == user.Id)
            .OrderBy(m => m.JoinedAt)
            .FirstOrDefaultAsync();

        if (membership is null)
        {
            _logger.LogWarning("Login failed - no organization membership for: {Email}", req.Email);
            return Unauthorized(new { message = "No organization membership found" });
        }

        _logger.LogInformation("User {Email} logged in successfully", req.Email);

        // Generate tokens
        var (accessToken, refreshToken) = await GenerateTokensAsync(
            user, membership.OrganizationId, membership.Role);

        return Ok(new AuthResponse(accessToken, refreshToken, membership.OrganizationId, user.Email!));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh(RefreshRequest req)
    {
        _logger.LogInformation("Token refresh attempt");

        var user = await _users.Users.FirstOrDefaultAsync(u => u.RefreshToken == req.RefreshToken);

        if (user is null || user.RefreshTokenExpiry <= DateTime.UtcNow)
        {
            _logger.LogWarning("Refresh failed - invalid or expired token");
            return Unauthorized(new { message = "Invalid or expired refresh token" });
        }

        // Get user's first organization
        var membership = await _db.OrganizationMembers
            .Where(m => m.UserId == user.Id)
            .OrderBy(m => m.JoinedAt)
            .FirstOrDefaultAsync();

        if (membership is null)
        {
            _logger.LogWarning("Refresh failed - no organization membership for user: {UserId}", user.Id);
            return Unauthorized(new { message = "No organization membership found" });
        }

        _logger.LogInformation("Token refreshed successfully for user: {Email}", user.Email);

        // Generate new tokens
        var (accessToken, refreshToken) = await GenerateTokensAsync(
            user, membership.OrganizationId, membership.Role);

        return Ok(new AuthResponse(accessToken, refreshToken, membership.OrganizationId, user.Email!));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
        {
            return Ok(new { message = "Logged out successfully" });
        }

        var user = await _users.FindByIdAsync(userId);
        if (user is not null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            await _users.UpdateAsync(user);
            _logger.LogInformation("User {UserId} logged out", userId);
        }

        return Ok(new { message = "Logged out successfully" });
    }

    // Helper Methods
    private async Task<(string accessToken, string refreshToken)> GenerateTokensAsync(
        AppUser user, Guid orgId, string role)
    {
        // Generate access token (JWT)
        var jwt = _cfg.GetSection("Jwt");
        var issuer = jwt["Issuer"]!;
        var audience = jwt["Audience"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SigningKey"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new(ClaimTypes.NameIdentifier, user.Id),
            new("org_id", orgId.ToString()),
            new("role", role)
        };

        var minutes = int.Parse(jwt["AccessTokenMinutes"] ?? "30");
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(minutes),
            signingCredentials: creds
        );

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

        // Generate refresh token
        var refreshToken = GenerateRefreshToken();
        var refreshDays = int.Parse(jwt["RefreshTokenDays"] ?? "7");

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(refreshDays);
        await _users.UpdateAsync(user);

        return (accessToken, refreshToken);
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
