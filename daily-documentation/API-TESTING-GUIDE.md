# PSS Portal API Testing Guide

## Production Environment

- **API Base URL**: https://pss-portal-api.onrender.com
- **Swagger UI**: https://pss-portal-api.onrender.com/swagger
- **Health Check**: https://pss-portal-api.onrender.com/health

---

## Test Account Credentials

```
Email: iteration2test@pssportal.com
Password: TestPass1234!
Organization: Iteration 2 Test Org
```

---

## Authentication

### 1. Login

```bash
curl -X POST "https://pss-portal-api.onrender.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "iteration2test@pssportal.com", "password": "TestPass1234!"}'
```

**Response:**
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "FQhOFH...",
  "organizationId": "fa63aae1-0db0-4ff8-ab4e-5b1459552b0e",
  "email": "iteration2test@pssportal.com"
}
```

### 2. Register New User

```bash
curl -X POST "https://pss-portal-api.onrender.com/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com", "password": "SecurePass123!", "organizationName": "My Company"}'
```

### 3. Refresh Token

```bash
curl -X POST "https://pss-portal-api.onrender.com/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

---

## Using the Access Token

All authenticated endpoints require the `Authorization` header:

```bash
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Audits API

### List Audits

```bash
curl -X GET "https://pss-portal-api.onrender.com/api/audits" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Audit by ID

```bash
curl -X GET "https://pss-portal-api.onrender.com/api/audits/9ec700f8-671d-4408-8dc6-9eafc0facec2" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Audit (Owner/Admin only)

```bash
curl -X POST "https://pss-portal-api.onrender.com/api/audits" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "Q2 2026 Ops Audit", "notes": "Operations review"}'
```

### Update Audit (Owner/Admin only)

```bash
curl -X PUT "https://pss-portal-api.onrender.com/api/audits/AUDIT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "Updated Title", "notes": "Updated notes"}'
```

### Update Audit Status (Owner/Admin only)

```bash
curl -X PATCH "https://pss-portal-api.onrender.com/api/audits/AUDIT_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "InProgress"}'
```

**Valid statuses:** `Draft`, `InReview`, `Delivered`, `InProgress`, `Closed`

### Delete Audit (Owner only)

```bash
curl -X DELETE "https://pss-portal-api.onrender.com/api/audits/AUDIT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Findings API

### List Findings

```bash
# All findings
curl -X GET "https://pss-portal-api.onrender.com/api/findings" \
  -H "Authorization: Bearer $TOKEN"

# Filter by audit
curl -X GET "https://pss-portal-api.onrender.com/api/findings?auditId=AUDIT_ID" \
  -H "Authorization: Bearer $TOKEN"

# Filter by category
curl -X GET "https://pss-portal-api.onrender.com/api/findings?category=Security" \
  -H "Authorization: Bearer $TOKEN"

# Filter by severity
curl -X GET "https://pss-portal-api.onrender.com/api/findings?severity=High" \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl -X GET "https://pss-portal-api.onrender.com/api/findings?status=Identified" \
  -H "Authorization: Bearer $TOKEN"

# Combined filters
curl -X GET "https://pss-portal-api.onrender.com/api/findings?category=Security&severity=High" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Finding Details

```bash
curl -X GET "https://pss-portal-api.onrender.com/api/findings/FINDING_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Finding (Owner/Admin only)

```bash
curl -X POST "https://pss-portal-api.onrender.com/api/findings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "auditId": "9ec700f8-671d-4408-8dc6-9eafc0facec2",
    "category": "Security",
    "severity": "High",
    "effort": "M",
    "title": "Weak Password Policy",
    "description": "Password policy allows weak passwords",
    "recommendation": "Enforce stronger password requirements",
    "roiEstimate": "Reduce breach risk by 40%"
  }'
```

**Valid values:**
- **Category**: `Automation`, `Data`, `Marketing`, `Security`, `Ops`
- **Severity**: `Low`, `Medium`, `High`
- **Effort**: `S`, `M`, `L`

### Update Finding (Owner/Admin only)

```bash
curl -X PUT "https://pss-portal-api.onrender.com/api/findings/FINDING_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "category": "Security",
    "severity": "Medium",
    "effort": "S",
    "title": "Updated Title",
    "description": "Updated description",
    "recommendation": "Updated recommendation"
  }'
```

### Update Finding Status

```bash
curl -X PATCH "https://pss-portal-api.onrender.com/api/findings/FINDING_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "InProgress"}'
```

**Valid statuses:** `Identified`, `InProgress`, `Resolved`

### Delete Finding (Owner only)

```bash
curl -X DELETE "https://pss-portal-api.onrender.com/api/findings/FINDING_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Activity Logs API

### List All Activity

```bash
curl -X GET "https://pss-portal-api.onrender.com/api/activity" \
  -H "Authorization: Bearer $TOKEN"

# With limit
curl -X GET "https://pss-portal-api.onrender.com/api/activity?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Filter by entity type
curl -X GET "https://pss-portal-api.onrender.com/api/activity?entityType=Finding" \
  -H "Authorization: Bearer $TOKEN"

# Filter by entity ID
curl -X GET "https://pss-portal-api.onrender.com/api/activity?entityId=ENTITY_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Activity for Specific Audit

```bash
curl -X GET "https://pss-portal-api.onrender.com/api/activity/audits/AUDIT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Attachments API

### Upload File

```bash
curl -X POST "https://pss-portal-api.onrender.com/api/attachments" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "auditId=9ec700f8-671d-4408-8dc6-9eafc0facec2"
```

**Constraints:**
- Max file size: 10 MB
- Allowed types: Images (JPEG, PNG, GIF, WebP), PDF, Excel, Word, CSV, TXT

### List Attachments

```bash
# All attachments
curl -X GET "https://pss-portal-api.onrender.com/api/attachments" \
  -H "Authorization: Bearer $TOKEN"

# Filter by audit
curl -X GET "https://pss-portal-api.onrender.com/api/attachments?auditId=AUDIT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Download Attachment

```bash
curl -X GET "https://pss-portal-api.onrender.com/api/attachments/ATTACHMENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -o downloaded_file.pdf
```

### Delete Attachment (Owner/Admin only)

```bash
curl -X DELETE "https://pss-portal-api.onrender.com/api/attachments/ATTACHMENT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Test Data Reference

### Existing Test Data (Created Jan 21, 2026)

| Entity | ID | Description |
|--------|-----|-------------|
| **Organization** | `fa63aae1-0db0-4ff8-ab4e-5b1459552b0e` | Iteration 2 Test Org |
| **User** | `ee96396d-e37f-491c-971b-2dd5f21a1114` | iteration2test@pssportal.com |
| **Audit** | `9ec700f8-671d-4408-8dc6-9eafc0facec2` | Q1 2026 Security Audit |
| **Finding 1** | `c94c7404-1415-4fc8-ac35-78dc94fd24e8` | SQL Injection Vulnerability (Security/High/InProgress) |
| **Finding 2** | `22f26994-e21a-4b57-90f4-9062e44c91ab` | Manual Data Entry Process (Automation/Medium) |
| **Finding 3** | `6aa9b858-a857-4030-8617-9bd34b6af869` | Missing Data Backup (Data/Low) |
| **Attachment** | `818e2d2a-01fd-4bfd-87c1-60c1c93467ea` | test-report.txt |

---

## Quick Test Script

Save this as `test-api.sh` and run with `bash test-api.sh`:

```bash
#!/bin/bash
BASE_URL="https://pss-portal-api.onrender.com"

# Login
echo "=== Logging in ==="
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "iteration2test@pssportal.com", "password": "TestPass1234!"}')

TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Token obtained: ${TOKEN:0:20}..."

# Test endpoints
echo ""
echo "=== Testing Audits ==="
curl -s "$BASE_URL/api/audits" -H "Authorization: Bearer $TOKEN" | head -c 100
echo "..."

echo ""
echo "=== Testing Findings ==="
curl -s "$BASE_URL/api/findings" -H "Authorization: Bearer $TOKEN" | head -c 100
echo "..."

echo ""
echo "=== Testing Activity Logs ==="
curl -s "$BASE_URL/api/activity?limit=3" -H "Authorization: Bearer $TOKEN" | head -c 100
echo "..."

echo ""
echo "=== Testing Attachments ==="
curl -s "$BASE_URL/api/attachments" -H "Authorization: Bearer $TOKEN" | head -c 100
echo "..."

echo ""
echo "=== All tests completed ==="
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Notes

- **File uploads are ephemeral** on Render's free tier - files are lost when the container restarts
- **Tokens expire** after 30 minutes - use the refresh endpoint to get a new one
- All timestamps are in UTC
- Activity logs are automatically created for all POST, PUT, PATCH, DELETE operations
