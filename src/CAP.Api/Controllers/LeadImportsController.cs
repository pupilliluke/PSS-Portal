using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using CAP.Application.Common;
using CAP.Domain.Entities;
using CAP.Infrastructure.Data;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CAP.Api.Controllers;

[ApiController]
[Route("api/lead-imports")]
[Authorize]
public class LeadImportsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentOrg _org;
    private readonly IGoogleSheetsService _sheets;
    private readonly ILogger<LeadImportsController> _logger;
    private readonly IConfiguration _config;

    // In-memory state storage for OAuth (use distributed cache in production)
    private static readonly Dictionary<string, OAuthState> _oauthStates = new();

    public LeadImportsController(
        AppDbContext db,
        ICurrentOrg org,
        IGoogleSheetsService sheets,
        ILogger<LeadImportsController> logger,
        IConfiguration config)
    {
        _db = db;
        _org = org;
        _sheets = sheets;
        _logger = logger;
        _config = config;
    }

    // DTOs
    public record GoogleConnectionStatus(bool IsConnected, string? GoogleEmail, DateTimeOffset? ConnectedAt);

    public record GoogleAuthUrlResponse(string AuthUrl);

    public record GoogleSheetListItem(string Id, string Name, DateTimeOffset ModifiedTime);

    public record PreviewImportRequest(
        string SpreadsheetId,
        string? SheetName,
        int HeaderRow = 1,
        Dictionary<string, string>? ColumnMapping = null
    );

    public record PreviewImportResponse(
        string SpreadsheetName,
        List<string> AvailableSheets,
        List<string> DetectedColumns,
        Dictionary<string, string> SuggestedMapping,
        List<Dictionary<string, string>> SampleRows,
        int TotalRows
    );

    public record ExecuteImportRequest(
        string SpreadsheetId,
        string? SheetName,
        Dictionary<string, string> ColumnMapping,
        string DuplicateStrategy = "Skip",  // Skip, Update, Create
        string DefaultSource = "GoogleSheets"
    );

    public record ImportResultResponse(
        Guid BatchId,
        string Status,
        int TotalRows,
        int ImportedCount,
        int SkippedCount,
        int ErrorCount,
        List<ImportError>? Errors
    );

    public record ImportError(int Row, string Error, Dictionary<string, string>? Data);

    public record ImportBatchResponse(
        Guid Id,
        string SourceType,
        string? SourceId,
        string? SourceName,
        string Status,
        int TotalRows,
        int ImportedCount,
        int SkippedCount,
        int ErrorCount,
        DateTimeOffset CreatedAt,
        DateTimeOffset? CompletedAt
    );

    private record OAuthState(string UserId, Guid OrganizationId, DateTimeOffset ExpiresAt);

    // Validators
    public class PreviewImportRequestValidator : AbstractValidator<PreviewImportRequest>
    {
        public PreviewImportRequestValidator()
        {
            RuleFor(x => x.SpreadsheetId).NotEmpty();
            RuleFor(x => x.HeaderRow).GreaterThan(0);
        }
    }

    public class ExecuteImportRequestValidator : AbstractValidator<ExecuteImportRequest>
    {
        private static readonly string[] ValidStrategies = { "Skip", "Update", "Create" };
        private static readonly string[] ValidSources = { "Website", "Referral", "GoogleSheets", "Manual", "Advertisement", "Other" };

        public ExecuteImportRequestValidator()
        {
            RuleFor(x => x.SpreadsheetId).NotEmpty();
            RuleFor(x => x.ColumnMapping).NotEmpty();
            RuleFor(x => x.DuplicateStrategy)
                .Must(s => ValidStrategies.Contains(s))
                .WithMessage($"Invalid strategy. Must be one of: {string.Join(", ", ValidStrategies)}");
            RuleFor(x => x.DefaultSource)
                .Must(s => ValidSources.Contains(s))
                .WithMessage($"Invalid source. Must be one of: {string.Join(", ", ValidSources)}");
        }
    }

    /// <summary>
    /// Check if user has a Google connection
    /// </summary>
    [HttpGet("google/status")]
    public async Task<ActionResult<GoogleConnectionStatus>> GetGoogleStatus()
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var userId = User.FindFirstValue("sub");

        var connection = await _db.GoogleConnections
            .FirstOrDefaultAsync(c => c.UserId == userId && c.OrganizationId == _org.OrganizationId);

        if (connection == null)
            return Ok(new GoogleConnectionStatus(false, null, null));

        return Ok(new GoogleConnectionStatus(true, connection.GoogleEmail, connection.CreatedAt));
    }

    /// <summary>
    /// Get Google OAuth authorization URL
    /// </summary>
    [HttpGet("google/auth-url")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public ActionResult<GoogleAuthUrlResponse> GetGoogleAuthUrl()
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var userId = User.FindFirstValue("sub")!;

        // Generate state token
        var stateToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-").Replace("/", "_").TrimEnd('=');

        // Store state with expiration
        _oauthStates[stateToken] = new OAuthState(
            userId,
            _org.OrganizationId,
            DateTimeOffset.UtcNow.AddMinutes(10)
        );

        // Clean up expired states
        var expired = _oauthStates.Where(kv => kv.Value.ExpiresAt < DateTimeOffset.UtcNow).Select(kv => kv.Key).ToList();
        foreach (var key in expired) _oauthStates.Remove(key);

        var redirectUri = GetRedirectUri();
        var authUrl = _sheets.GetAuthorizationUrl(stateToken, redirectUri);

        _logger.LogInformation("Generated Google OAuth URL for user {UserId}", userId);

        return Ok(new GoogleAuthUrlResponse(authUrl));
    }

    /// <summary>
    /// Google OAuth callback
    /// </summary>
    [HttpGet("google/callback")]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleCallback([FromQuery] string? code, [FromQuery] string? state, [FromQuery] string? error)
    {
        var frontendUrl = _config["Frontend:Url"] ?? "http://localhost:3000";

        if (!string.IsNullOrEmpty(error))
        {
            _logger.LogWarning("Google OAuth error: {Error}", error);
            return Redirect($"{frontendUrl}/settings/integrations?error={Uri.EscapeDataString(error)}");
        }

        if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(state))
        {
            return Redirect($"{frontendUrl}/settings/integrations?error=missing_parameters");
        }

        // Validate state
        if (!_oauthStates.TryGetValue(state, out var oauthState) || oauthState.ExpiresAt < DateTimeOffset.UtcNow)
        {
            _logger.LogWarning("Invalid or expired OAuth state");
            return Redirect($"{frontendUrl}/settings/integrations?error=invalid_state");
        }

        _oauthStates.Remove(state);

        try
        {
            var redirectUri = GetRedirectUri();
            var tokenResponse = await _sheets.ExchangeCodeAsync(code, redirectUri);

            // Check for existing connection
            var existing = await _db.GoogleConnections
                .FirstOrDefaultAsync(c => c.UserId == oauthState.UserId && c.OrganizationId == oauthState.OrganizationId);

            if (existing != null)
            {
                // Update existing connection
                existing.GoogleEmail = tokenResponse.Email;
                existing.AccessToken = tokenResponse.AccessToken;
                existing.RefreshToken = tokenResponse.RefreshToken ?? existing.RefreshToken;
                existing.TokenExpiry = DateTimeOffset.UtcNow.AddSeconds(tokenResponse.ExpiresInSeconds);
                existing.UpdatedAt = DateTimeOffset.UtcNow;
            }
            else
            {
                // Create new connection
                var connection = new GoogleConnection
                {
                    UserId = oauthState.UserId,
                    OrganizationId = oauthState.OrganizationId,
                    GoogleEmail = tokenResponse.Email,
                    AccessToken = tokenResponse.AccessToken,
                    RefreshToken = tokenResponse.RefreshToken ?? "",
                    TokenExpiry = DateTimeOffset.UtcNow.AddSeconds(tokenResponse.ExpiresInSeconds),
                    Scopes = "spreadsheets.readonly,drive.metadata.readonly",
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };
                _db.GoogleConnections.Add(connection);
            }

            await _db.SaveChangesAsync();

            _logger.LogInformation("Google connection saved for user {UserId}, email {Email}",
                oauthState.UserId, tokenResponse.Email);

            return Redirect($"{frontendUrl}/settings/integrations?google=connected");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to exchange Google OAuth code");
            return Redirect($"{frontendUrl}/settings/integrations?error=token_exchange_failed");
        }
    }

    /// <summary>
    /// Disconnect Google account
    /// </summary>
    [HttpDelete("google/disconnect")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<IActionResult> DisconnectGoogle()
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var userId = User.FindFirstValue("sub");

        var connection = await _db.GoogleConnections
            .FirstOrDefaultAsync(c => c.UserId == userId && c.OrganizationId == _org.OrganizationId);

        if (connection == null)
            return NotFound(new { message = "No Google connection found" });

        _db.GoogleConnections.Remove(connection);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Google connection removed for user {UserId}", userId);

        return NoContent();
    }

    /// <summary>
    /// List user's Google Sheets
    /// </summary>
    [HttpGet("google/sheets")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<ActionResult<List<GoogleSheetListItem>>> ListGoogleSheets()
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var accessToken = await GetValidAccessTokenAsync();
        if (accessToken == null)
            return BadRequest(new { message = "No Google connection. Please connect your Google account first." });

        var sheets = await _sheets.ListSheetsAsync(accessToken);

        return Ok(sheets.Select(s => new GoogleSheetListItem(s.Id, s.Name, s.ModifiedTime)).ToList());
    }

    /// <summary>
    /// Preview import with column mapping suggestions
    /// </summary>
    [HttpPost("google/preview")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<ActionResult<PreviewImportResponse>> PreviewImport(PreviewImportRequest req)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var accessToken = await GetValidAccessTokenAsync();
        if (accessToken == null)
            return BadRequest(new { message = "No Google connection. Please connect your Google account first." });

        try
        {
            // Get spreadsheet info
            var spreadsheetInfo = await _sheets.GetSpreadsheetInfoAsync(accessToken, req.SpreadsheetId);

            // Read sheet data
            var sheetData = await _sheets.ReadSheetAsync(accessToken, req.SpreadsheetId, req.SheetName);

            // Generate suggested mapping
            var suggestedMapping = SuggestColumnMapping(sheetData.Headers);

            // Apply provided mapping or use suggestions
            var mapping = req.ColumnMapping ?? suggestedMapping;

            // Create sample rows (first 5)
            var sampleRows = sheetData.Rows.Take(5)
                .Select(row => CreateRowDictionary(sheetData.Headers, row))
                .ToList();

            return Ok(new PreviewImportResponse(
                spreadsheetInfo.Name,
                spreadsheetInfo.SheetNames,
                sheetData.Headers,
                suggestedMapping,
                sampleRows,
                sheetData.TotalRows
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to preview spreadsheet {SpreadsheetId}", req.SpreadsheetId);
            return BadRequest(new { message = "Failed to read spreadsheet. Please check the ID and try again." });
        }
    }

    /// <summary>
    /// Execute lead import from Google Sheets
    /// </summary>
    [HttpPost("google/import")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<ActionResult<ImportResultResponse>> ExecuteImport(ExecuteImportRequest req)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var userId = User.FindFirstValue("sub")!;
        var accessToken = await GetValidAccessTokenAsync();
        if (accessToken == null)
            return BadRequest(new { message = "No Google connection. Please connect your Google account first." });

        try
        {
            // Get spreadsheet info for name
            var spreadsheetInfo = await _sheets.GetSpreadsheetInfoAsync(accessToken, req.SpreadsheetId);

            // Read sheet data
            var sheetData = await _sheets.ReadSheetAsync(accessToken, req.SpreadsheetId, req.SheetName);

            // Create import batch
            var batch = new LeadImportBatch
            {
                OrganizationId = _org.OrganizationId,
                UserId = userId,
                SourceType = "GoogleSheets",
                SourceId = req.SpreadsheetId,
                SourceName = spreadsheetInfo.Name,
                Status = "Processing",
                TotalRows = sheetData.TotalRows,
                ColumnMapping = JsonSerializer.Serialize(req.ColumnMapping),
                DuplicateStrategy = req.DuplicateStrategy,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _db.LeadImportBatches.Add(batch);
            await _db.SaveChangesAsync();

            var errors = new List<ImportError>();
            var rowNumber = 2; // Start at 2 (after header)

            foreach (var row in sheetData.Rows)
            {
                try
                {
                    var rowData = CreateRowDictionary(sheetData.Headers, row);
                    var lead = MapRowToLead(rowData, req.ColumnMapping, req.DefaultSource);

                    if (string.IsNullOrEmpty(lead.Email))
                    {
                        batch.SkippedCount++;
                        errors.Add(new ImportError(rowNumber, "Missing email address", rowData));
                        rowNumber++;
                        continue;
                    }

                    // Check for duplicates
                    var existing = await _db.Leads
                        .FirstOrDefaultAsync(l => l.Email == lead.Email && l.OrganizationId == _org.OrganizationId);

                    if (existing != null)
                    {
                        switch (req.DuplicateStrategy)
                        {
                            case "Skip":
                                batch.SkippedCount++;
                                rowNumber++;
                                continue;

                            case "Update":
                                existing.FirstName = lead.FirstName;
                                existing.LastName = lead.LastName;
                                existing.Phone = lead.Phone;
                                existing.Company = lead.Company;
                                existing.Notes = lead.Notes;
                                existing.UpdatedAt = DateTimeOffset.UtcNow;
                                batch.ImportedCount++;
                                break;

                            case "Create":
                                // Fall through to create new
                                break;
                        }
                    }

                    if (existing == null || req.DuplicateStrategy == "Create")
                    {
                        lead.OrganizationId = _org.OrganizationId;
                        lead.ImportBatchId = batch.Id;
                        lead.ImportSourceId = req.SpreadsheetId;
                        _db.Leads.Add(lead);
                        batch.ImportedCount++;
                    }
                }
                catch (Exception ex)
                {
                    batch.ErrorCount++;
                    errors.Add(new ImportError(rowNumber, ex.Message, CreateRowDictionary(sheetData.Headers, row)));
                }

                rowNumber++;
            }

            batch.Status = "Completed";
            batch.CompletedAt = DateTimeOffset.UtcNow;
            batch.ErrorDetails = errors.Any() ? JsonSerializer.Serialize(errors.Take(100)) : null;

            await _db.SaveChangesAsync();

            _logger.LogInformation(
                "Import completed: BatchId={BatchId}, Imported={Imported}, Skipped={Skipped}, Errors={Errors}",
                batch.Id, batch.ImportedCount, batch.SkippedCount, batch.ErrorCount);

            return Ok(new ImportResultResponse(
                batch.Id,
                batch.Status,
                batch.TotalRows,
                batch.ImportedCount,
                batch.SkippedCount,
                batch.ErrorCount,
                errors.Take(10).ToList()
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to import from spreadsheet {SpreadsheetId}", req.SpreadsheetId);
            return BadRequest(new { message = "Import failed. Please try again." });
        }
    }

    /// <summary>
    /// List import batches
    /// </summary>
    [HttpGet("batches")]
    public async Task<ActionResult<List<ImportBatchResponse>>> ListBatches([FromQuery] int limit = 20)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        limit = Math.Clamp(limit, 1, 100);

        var batches = await _db.LeadImportBatches
            .Where(b => b.OrganizationId == _org.OrganizationId)
            .OrderByDescending(b => b.CreatedAt)
            .Take(limit)
            .Select(b => new ImportBatchResponse(
                b.Id,
                b.SourceType,
                b.SourceId,
                b.SourceName,
                b.Status,
                b.TotalRows,
                b.ImportedCount,
                b.SkippedCount,
                b.ErrorCount,
                b.CreatedAt,
                b.CompletedAt
            ))
            .ToListAsync();

        return Ok(batches);
    }

    /// <summary>
    /// Get import batch details
    /// </summary>
    [HttpGet("batches/{id}")]
    public async Task<ActionResult<ImportBatchResponse>> GetBatch(Guid id)
    {
        if (_org.OrganizationId == Guid.Empty)
            return Unauthorized(new { message = "Missing organization context" });

        var batch = await _db.LeadImportBatches
            .Where(b => b.Id == id && b.OrganizationId == _org.OrganizationId)
            .Select(b => new ImportBatchResponse(
                b.Id,
                b.SourceType,
                b.SourceId,
                b.SourceName,
                b.Status,
                b.TotalRows,
                b.ImportedCount,
                b.SkippedCount,
                b.ErrorCount,
                b.CreatedAt,
                b.CompletedAt
            ))
            .FirstOrDefaultAsync();

        if (batch == null)
            return NotFound(new { message = "Import batch not found" });

        return Ok(batch);
    }

    // Helper methods

    private string GetRedirectUri()
    {
        var baseUrl = _config["Api:BaseUrl"] ?? $"{Request.Scheme}://{Request.Host}";
        return $"{baseUrl}/api/lead-imports/google/callback";
    }

    private async Task<string?> GetValidAccessTokenAsync()
    {
        var userId = User.FindFirstValue("sub");

        var connection = await _db.GoogleConnections
            .FirstOrDefaultAsync(c => c.UserId == userId && c.OrganizationId == _org.OrganizationId);

        if (connection == null)
            return null;

        // Check if token is expired (with 5 minute buffer)
        if (connection.TokenExpiry < DateTimeOffset.UtcNow.AddMinutes(5))
        {
            try
            {
                var newTokens = await _sheets.RefreshTokenAsync(connection.RefreshToken);
                connection.AccessToken = newTokens.AccessToken;
                connection.TokenExpiry = DateTimeOffset.UtcNow.AddSeconds(newTokens.ExpiresInSeconds);
                connection.UpdatedAt = DateTimeOffset.UtcNow;
                await _db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to refresh Google token for user {UserId}", userId);
                return null;
            }
        }

        return connection.AccessToken;
    }

    private static readonly Dictionary<string, string[]> ColumnAliases = new()
    {
        ["firstName"] = new[] { "first name", "firstname", "first", "given name", "givenname" },
        ["lastName"] = new[] { "last name", "lastname", "last", "surname", "family name", "familyname" },
        ["email"] = new[] { "email", "e-mail", "email address", "emailaddress" },
        ["phone"] = new[] { "phone", "telephone", "mobile", "cell", "phone number", "phonenumber" },
        ["company"] = new[] { "company", "organization", "org", "business", "company name", "companyname" },
        ["notes"] = new[] { "notes", "note", "comments", "comment", "description" },
    };

    private Dictionary<string, string> SuggestColumnMapping(List<string> headers)
    {
        var mapping = new Dictionary<string, string>();

        foreach (var header in headers)
        {
            var headerLower = header.ToLowerInvariant().Trim();

            foreach (var (field, aliases) in ColumnAliases)
            {
                if (aliases.Contains(headerLower) && !mapping.ContainsValue(field))
                {
                    mapping[header] = field;
                    break;
                }
            }
        }

        return mapping;
    }

    private static Dictionary<string, string> CreateRowDictionary(List<string> headers, List<string> row)
    {
        var dict = new Dictionary<string, string>();
        for (int i = 0; i < headers.Count && i < row.Count; i++)
        {
            dict[headers[i]] = row[i];
        }
        return dict;
    }

    private static Lead MapRowToLead(Dictionary<string, string> rowData, Dictionary<string, string> columnMapping, string source)
    {
        var lead = new Lead
        {
            Source = source,
            Status = "New",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        foreach (var (columnName, fieldName) in columnMapping)
        {
            if (!rowData.TryGetValue(columnName, out var value) || string.IsNullOrWhiteSpace(value))
                continue;

            switch (fieldName)
            {
                case "firstName":
                    lead.FirstName = value.Trim();
                    break;
                case "lastName":
                    lead.LastName = value.Trim();
                    break;
                case "email":
                    lead.Email = value.Trim().ToLowerInvariant();
                    break;
                case "phone":
                    lead.Phone = value.Trim();
                    break;
                case "company":
                    lead.Company = value.Trim();
                    break;
                case "notes":
                    lead.Notes = value.Trim();
                    break;
            }
        }

        // Set defaults if not mapped
        if (string.IsNullOrEmpty(lead.FirstName)) lead.FirstName = "Unknown";
        if (string.IsNullOrEmpty(lead.LastName)) lead.LastName = "Unknown";

        return lead;
    }
}
