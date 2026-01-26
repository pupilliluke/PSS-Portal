# PSS Portal - Enterprise Lead Generation CRM

A multi-tenant CRM platform with lead management, Google Sheets integration, and pay-per-service billing.

## Project Status

**Current Phase:** Leads Module Complete, Billing Next

- [x] Authentication (JWT, refresh tokens)
- [x] Multi-tenant organizations
- [x] Audits & Findings (legacy)
- [x] Activity logging
- [x] File attachments
- [x] **Leads CRM module**
- [x] **Google Sheets import**
- [ ] Stripe billing (Phase 1)
- [ ] Core CRM - Contacts, Accounts, Opportunities (Phase 2)

## Quick Start

### Prerequisites

- Docker Desktop
- .NET 8 SDK
- Node.js 20+ (for frontend)

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This starts PostgreSQL on **port 5434** with:
- Database: `cap_dev`
- Username: `cap`
- Password: `cap_password`

> **Note:** Port 5434 is used to avoid conflicts with local PostgreSQL installations.

### 2. Run the API

```bash
dotnet run --project src/CAP.Api
```

The API starts on:
- **http://localhost:5000** (or check console output)
- Migrations apply automatically on startup

### 3. Open Swagger UI

http://localhost:5000/swagger

### 4. Test the API

```bash
# Health check
curl http://localhost:5000/health

# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","organizationName":"My Company"}'
```

## Test Account (Production)

```
Email: iteration2test@pssportal.com
Password: TestPass1234!
```

## API Endpoints

### Authentication (4)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create user + organization |
| POST | `/api/auth/login` | Login, get tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Invalidate refresh token |

### Leads (6)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List leads (filter: status, source, search) |
| GET | `/api/leads/{id}` | Get lead details |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/{id}` | Update lead |
| PATCH | `/api/leads/{id}/status` | Change status |
| DELETE | `/api/leads/{id}` | Delete lead |

### Google Sheets Import (9)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lead-imports/google/status` | Check connection |
| GET | `/api/lead-imports/google/auth-url` | Start OAuth |
| GET | `/api/lead-imports/google/callback` | OAuth callback |
| DELETE | `/api/lead-imports/google/disconnect` | Remove connection |
| GET | `/api/lead-imports/google/sheets` | List spreadsheets |
| POST | `/api/lead-imports/google/preview` | Preview import |
| POST | `/api/lead-imports/google/import` | Execute import |
| GET | `/api/lead-imports/batches` | List import history |
| GET | `/api/lead-imports/batches/{id}` | Get batch details |

### Audits & Findings (12)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PUT/PATCH/DELETE | `/api/audits/*` | Audit CRUD |
| GET/POST/PUT/PATCH/DELETE | `/api/findings/*` | Finding CRUD |

### Activity & Attachments (6)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activity` | List activity logs |
| GET | `/api/activity/audits/{id}` | Activity for audit |
| GET/POST/DELETE | `/api/attachments/*` | File attachments |

### System (1)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

**Total: 32 endpoints**

## Project Structure

```
PSS Portal/
├── src/
│   ├── CAP.Api/                 # Web API
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs
│   │   │   ├── LeadsController.cs
│   │   │   ├── LeadImportsController.cs
│   │   │   └── ...
│   │   └── Program.cs
│   ├── CAP.Domain/              # Entities
│   │   └── Entities/
│   │       ├── Lead.cs
│   │       ├── GoogleConnection.cs
│   │       └── ...
│   ├── CAP.Application/         # Interfaces
│   │   └── Common/
│   │       ├── ICurrentOrg.cs
│   │       └── IGoogleSheetsService.cs
│   └── CAP.Infrastructure/      # Implementations
│       ├── Data/AppDbContext.cs
│       └── Google/GoogleSheetsService.cs
├── frontend/                    # React 19 + Vite
├── daily-documentation/         # Progress reports
├── docker-compose.yml
└── README.md
```

## Configuration

### Development (`appsettings.Development.json`)

```json
{
  "ConnectionStrings": {
    "Default": "Host=127.0.0.1;Port=5434;Database=cap_dev;Username=cap;Password=cap_password;..."
  },
  "Jwt": {
    "SigningKey": "DEV_ONLY_...",
    "AccessTokenMinutes": 30,
    "RefreshTokenDays": 7
  },
  "Google": {
    "ClientId": "",
    "ClientSecret": ""
  }
}
```

### Google Sheets Setup (Optional)

1. Create Google Cloud project
2. Enable Google Sheets API and Google Drive API
3. Create OAuth 2.0 credentials (Web application)
4. Add redirect URI: `http://localhost:5000/api/lead-imports/google/callback`
5. Add ClientId and ClientSecret to config

## Deployment

**Production API:** https://pss-portal-api.onrender.com

**Swagger:** https://pss-portal-api.onrender.com/swagger

**Hosting:** Render (Web Service + PostgreSQL)

## Tech Stack

### Backend
- ASP.NET Core 8
- Entity Framework Core
- PostgreSQL
- JWT Authentication
- FluentValidation
- Serilog
- Google.Apis.Sheets.v4

### Frontend
- React 19
- Vite 7
- TypeScript
- Tailwind CSS 4
- React Router

## Troubleshooting

### Port 5432/5433 already in use
The project uses port **5434** to avoid conflicts. If issues persist:
```bash
netstat -ano | findstr :543
```

### Docker volume issues
```bash
docker compose down -v
docker compose up -d
```

### Build errors
```bash
dotnet clean && dotnet restore && dotnet build
```

## Documentation

- `daily-documentation/DAY-8-COMPLETION-REPORT.md` - Latest progress
- `daily-documentation/NEXT-STEPS.md` - Roadmap
- `ENTERPRISE-LEADGEN-CRM-RESEARCH.md` - Architecture research
- `LANDING-PAGE-DEV-PLAN.md` - Frontend guide

## License

Private - Personal Software Solutions
