namespace CAP.Application.Common;

public interface IGoogleSheetsService
{
    /// <summary>
    /// Generate Google OAuth authorization URL
    /// </summary>
    string GetAuthorizationUrl(string state, string redirectUri);

    /// <summary>
    /// Exchange authorization code for tokens
    /// </summary>
    Task<GoogleTokenResponse> ExchangeCodeAsync(string code, string redirectUri);

    /// <summary>
    /// Refresh an expired access token
    /// </summary>
    Task<GoogleTokenResponse> RefreshTokenAsync(string refreshToken);

    /// <summary>
    /// List spreadsheets accessible to the user
    /// </summary>
    Task<List<GoogleSheetInfo>> ListSheetsAsync(string accessToken);

    /// <summary>
    /// Read data from a specific spreadsheet
    /// </summary>
    Task<SheetData> ReadSheetAsync(string accessToken, string spreadsheetId, string? sheetName = null);

    /// <summary>
    /// Get spreadsheet metadata (name, sheets)
    /// </summary>
    Task<SpreadsheetInfo> GetSpreadsheetInfoAsync(string accessToken, string spreadsheetId);
}

public record GoogleTokenResponse(
    string AccessToken,
    string? RefreshToken,
    int ExpiresInSeconds,
    string Email
);

public record GoogleSheetInfo(
    string Id,
    string Name,
    DateTimeOffset ModifiedTime
);

public record SheetData(
    List<string> Headers,
    List<List<string>> Rows,
    int TotalRows
);

public record SpreadsheetInfo(
    string Id,
    string Name,
    List<string> SheetNames
);
