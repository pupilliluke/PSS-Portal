using System.Security.Claims;
using CAP.Application.Common;

namespace CAP.Api.Middleware;

public class CurrentOrgFromClaims : ICurrentOrg
{
    private readonly IHttpContextAccessor _http;

    public CurrentOrgFromClaims(IHttpContextAccessor http) => _http = http;

    public Guid OrganizationId
    {
        get
        {
            var user = _http.HttpContext?.User;
            var orgIdStr = user?.FindFirstValue("org_id");
            if (Guid.TryParse(orgIdStr, out var orgId)) return orgId;
            return Guid.Empty; // For endpoints that don't require org (login/register)
        }
    }
}
