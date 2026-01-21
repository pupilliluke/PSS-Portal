using System.Security.Claims;
using System.Text.Json;
using CAP.Application.Common;
using CAP.Domain.Entities;
using CAP.Infrastructure.Data;

namespace CAP.Api.Middleware;

public class ActivityLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ActivityLoggingMiddleware> _logger;

    public ActivityLoggingMiddleware(RequestDelegate next, ILogger<ActivityLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext db, ICurrentOrg org)
    {
        // Capture response body for POST requests to get created entity ID
        var originalBodyStream = context.Response.Body;
        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        await _next(context);

        // Copy response back to original stream
        responseBody.Seek(0, SeekOrigin.Begin);
        await responseBody.CopyToAsync(originalBodyStream);

        // Only log mutating operations that succeeded
        if (ShouldLog(context))
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null || org.OrganizationId == Guid.Empty) return;

            var (entityType, entityId, action) = await ParseRequest(context, responseBody);

            if (entityType is not null && entityId != Guid.Empty)
            {
                db.ActivityLogs.Add(new ActivityLog
                {
                    OrganizationId = org.OrganizationId,
                    UserId = userId,
                    Action = action,
                    EntityType = entityType,
                    EntityId = entityId,
                    Timestamp = DateTimeOffset.UtcNow
                });

                try
                {
                    await db.SaveChangesAsync();
                    _logger.LogDebug("Activity logged: {Action} {EntityType} {EntityId}", action, entityType, entityId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to save activity log");
                }
            }
        }
    }

    private static bool ShouldLog(HttpContext context)
    {
        var isModifyingRequest = context.Request.Method is "POST" or "PUT" or "PATCH" or "DELETE";
        var isSuccess = context.Response.StatusCode >= 200 && context.Response.StatusCode < 300;
        var isApiEndpoint = context.Request.Path.StartsWithSegments("/api");
        var isNotAuthEndpoint = !context.Request.Path.StartsWithSegments("/api/auth");
        var isNotActivityEndpoint = !context.Request.Path.StartsWithSegments("/api/activity");

        return isModifyingRequest && isSuccess && isApiEndpoint && isNotAuthEndpoint && isNotActivityEndpoint;
    }

    private static async Task<(string? entityType, Guid entityId, string action)> ParseRequest(
        HttpContext context, MemoryStream responseBody)
    {
        var path = context.Request.Path.Value ?? "";
        var method = context.Request.Method;
        var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);

        if (segments.Length < 2) return (null, Guid.Empty, "Unknown");

        var entityType = segments[1] switch
        {
            "audits" => "Audit",
            "findings" => "Finding",
            "attachments" => "Attachment",
            _ => null
        };

        if (entityType is null) return (null, Guid.Empty, "Unknown");

        var action = method switch
        {
            "POST" => "Created",
            "PUT" => "Updated",
            "PATCH" => "StatusChanged",
            "DELETE" => "Deleted",
            _ => "Unknown"
        };

        Guid entityId = Guid.Empty;

        // For non-POST requests, extract ID from path
        if (method != "POST" && segments.Length >= 3 && Guid.TryParse(segments[2], out var id))
        {
            entityId = id;
        }
        // For POST requests, try to extract ID from response body
        else if (method == "POST")
        {
            try
            {
                responseBody.Seek(0, SeekOrigin.Begin);
                using var reader = new StreamReader(responseBody, leaveOpen: true);
                var responseText = await reader.ReadToEndAsync();

                if (!string.IsNullOrEmpty(responseText))
                {
                    using var doc = JsonDocument.Parse(responseText);
                    if (doc.RootElement.TryGetProperty("id", out var idElement))
                    {
                        if (idElement.TryGetGuid(out var createdId))
                        {
                            entityId = createdId;
                        }
                    }
                }
            }
            catch
            {
                // If we can't parse the response, skip logging
            }
        }

        return (entityType, entityId, action);
    }
}
