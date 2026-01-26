using System.Net.Http.Headers;
using System.Text.Json;
using CAP.Application.Common;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using Google.Apis.Sheets.v4;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CAP.Infrastructure.Google;

public class GoogleSheetsService : IGoogleSheetsService
{
    private readonly string _clientId;
    private readonly string _clientSecret;
    private readonly ILogger<GoogleSheetsService> _logger;
    private readonly HttpClient _httpClient;

    private static readonly string[] Scopes = new[]
    {
        SheetsService.Scope.SpreadsheetsReadonly,
        DriveService.Scope.DriveMetadataReadonly
    };

    public GoogleSheetsService(IConfiguration config, ILogger<GoogleSheetsService> logger, IHttpClientFactory httpClientFactory)
    {
        _clientId = config["Google:ClientId"] ?? throw new InvalidOperationException("Google:ClientId not configured");
        _clientSecret = config["Google:ClientSecret"] ?? throw new InvalidOperationException("Google:ClientSecret not configured");
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();
    }

    public string GetAuthorizationUrl(string state, string redirectUri)
    {
        var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
        {
            ClientSecrets = new ClientSecrets
            {
                ClientId = _clientId,
                ClientSecret = _clientSecret
            },
            Scopes = Scopes
        });

        var authUri = flow.CreateAuthorizationCodeRequest(redirectUri);
        authUri.State = state;

        return authUri.Build().ToString();
    }

    public async Task<GoogleTokenResponse> ExchangeCodeAsync(string code, string redirectUri)
    {
        var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
        {
            ClientSecrets = new ClientSecrets
            {
                ClientId = _clientId,
                ClientSecret = _clientSecret
            },
            Scopes = Scopes
        });

        var tokenResponse = await flow.ExchangeCodeForTokenAsync(
            userId: "user",
            code: code,
            redirectUri: redirectUri,
            CancellationToken.None);

        // Get user email from Google
        var email = await GetUserEmailAsync(tokenResponse.AccessToken);

        _logger.LogInformation("Google OAuth token exchanged for user {Email}", email);

        return new GoogleTokenResponse(
            tokenResponse.AccessToken,
            tokenResponse.RefreshToken,
            (int)(tokenResponse.ExpiresInSeconds ?? 3600),
            email
        );
    }

    public async Task<GoogleTokenResponse> RefreshTokenAsync(string refreshToken)
    {
        var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
        {
            ClientSecrets = new ClientSecrets
            {
                ClientId = _clientId,
                ClientSecret = _clientSecret
            },
            Scopes = Scopes
        });

        var tokenResponse = await flow.RefreshTokenAsync(
            userId: "user",
            refreshToken: refreshToken,
            CancellationToken.None);

        var email = await GetUserEmailAsync(tokenResponse.AccessToken);

        _logger.LogInformation("Google OAuth token refreshed for user {Email}", email);

        return new GoogleTokenResponse(
            tokenResponse.AccessToken,
            tokenResponse.RefreshToken ?? refreshToken, // Refresh token may not be returned
            (int)(tokenResponse.ExpiresInSeconds ?? 3600),
            email
        );
    }

    public async Task<List<GoogleSheetInfo>> ListSheetsAsync(string accessToken)
    {
        var credential = GoogleCredential.FromAccessToken(accessToken);
        var driveService = new DriveService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "PSS Portal"
        });

        var request = driveService.Files.List();
        request.Q = "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false";
        request.Fields = "files(id, name, modifiedTime)";
        request.OrderBy = "modifiedTime desc";
        request.PageSize = 100;

        var response = await request.ExecuteAsync();

        var sheets = response.Files?.Select(f => new GoogleSheetInfo(
            f.Id,
            f.Name,
            f.ModifiedTimeDateTimeOffset ?? DateTimeOffset.MinValue
        )).ToList() ?? new List<GoogleSheetInfo>();

        _logger.LogInformation("Listed {Count} Google Sheets", sheets.Count);

        return sheets;
    }

    public async Task<SheetData> ReadSheetAsync(string accessToken, string spreadsheetId, string? sheetName = null)
    {
        var credential = GoogleCredential.FromAccessToken(accessToken);
        var sheetsService = new SheetsService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "PSS Portal"
        });

        // If no sheet name specified, get the first sheet
        if (string.IsNullOrEmpty(sheetName))
        {
            var spreadsheet = await sheetsService.Spreadsheets.Get(spreadsheetId).ExecuteAsync();
            sheetName = spreadsheet.Sheets?.FirstOrDefault()?.Properties?.Title ?? "Sheet1";
        }

        var range = $"'{sheetName}'";
        var request = sheetsService.Spreadsheets.Values.Get(spreadsheetId, range);
        var response = await request.ExecuteAsync();

        var values = response.Values;
        if (values == null || values.Count == 0)
        {
            return new SheetData(new List<string>(), new List<List<string>>(), 0);
        }

        // First row is headers
        var headers = values[0].Select(h => h?.ToString() ?? "").ToList();

        // Remaining rows are data
        var rows = values.Skip(1)
            .Select(row => row.Select(cell => cell?.ToString() ?? "").ToList())
            .ToList();

        _logger.LogInformation("Read {RowCount} rows from spreadsheet {SpreadsheetId}", rows.Count, spreadsheetId);

        return new SheetData(headers, rows, rows.Count);
    }

    public async Task<SpreadsheetInfo> GetSpreadsheetInfoAsync(string accessToken, string spreadsheetId)
    {
        var credential = GoogleCredential.FromAccessToken(accessToken);
        var sheetsService = new SheetsService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "PSS Portal"
        });

        var spreadsheet = await sheetsService.Spreadsheets.Get(spreadsheetId).ExecuteAsync();

        var sheetNames = spreadsheet.Sheets?
            .Select(s => s.Properties?.Title ?? "")
            .Where(name => !string.IsNullOrEmpty(name))
            .ToList() ?? new List<string>();

        return new SpreadsheetInfo(
            spreadsheet.SpreadsheetId,
            spreadsheet.Properties?.Title ?? "Untitled",
            sheetNames
        );
    }

    private async Task<string> GetUserEmailAsync(string accessToken)
    {
        try
        {
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            var response = await _httpClient.GetAsync("https://www.googleapis.com/oauth2/v2/userinfo");
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.GetProperty("email").GetString() ?? "unknown";
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get user email from Google");
            return "unknown";
        }
    }
}
