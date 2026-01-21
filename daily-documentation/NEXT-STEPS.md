# Next Steps - Authentication API Deployment

## 🎯 Goal: Deployed Authentication API in 5 Days

**Today's Date**: January 12, 2026
**Target Deployment Date**: January 16, 2026

**Current Status**: ✅ Day 1-2 Complete (Boilerplate + Auth Endpoints Built)

---

## 📅 Day 3: Test Locally & Verify Everything Works

### Step 1: Start Docker Desktop
- Open Docker Desktop application
- Wait for it to fully start (whale icon in system tray should be stable)

### Step 2: Start PostgreSQL Database
```bash
cd "C:\Users\lukel\PSS Portal"
docker compose up -d
```

**Verify it's running:**
```bash
docker ps
# Should show cap_postgres container running
```

### Step 3: Run Database Migrations

**OPTION A - Using Visual Studio (Recommended):**
1. Open `ConsultingAuditPortal.sln` in Visual Studio
2. Go to: `Tools` → `NuGet Package Manager` → `Package Manager Console`
3. Run these commands:
   ```powershell
   Add-Migration InitialCreate -Project CAP.Infrastructure -StartupProject CAP.Api
   Update-Database -Project CAP.Infrastructure -StartupProject CAP.Api
   ```

**OPTION B - Using Migration Bundle:**
```bash
# Generate migration bundle
dotnet ef migrations bundle --project src/CAP.Infrastructure --startup-project src/CAP.Api --output efbundle

# Run it
./efbundle
```

**OPTION C - Generate SQL Script (if tools don't work):**
```bash
dotnet ef migrations script --project src/CAP.Infrastructure --startup-project src/CAP.Api --output migration.sql
# Then manually run migration.sql in PostgreSQL
```

### Step 4: Run the API
```bash
cd "C:\Users\lukel\PSS Portal"
dotnet run --project src/CAP.Api
```

**Expected output:**
```
Now listening on: https://localhost:7xxx
Now listening on: http://localhost:5xxx
```

### Step 5: Test with Swagger

1. **Open Swagger UI:**
   - Go to `https://localhost:7xxx/swagger` in your browser
   - (Replace 7xxx with actual port from console output)

2. **Test Registration:**
   - Find `POST /api/auth/register`
   - Click "Try it out"
   - Enter:
     ```json
     {
       "email": "demo@test.com",
       "password": "Test123!",
       "organizationName": "Demo Company"
     }
     ```
   - Click "Execute"
   - **Expected**: Status 200, response with `accessToken`, `refreshToken`, `organizationId`

3. **Test Authorization:**
   - Copy the `accessToken` value (long string)
   - Click the green **"Authorize"** button at the top
   - Enter: `Bearer <paste-your-token-here>`
   - Click "Authorize"
   - Click "Close"

4. **Test Logout:**
   - Find `POST /api/auth/logout`
   - Click "Try it out"
   - Click "Execute"
   - **Expected**: Status 200

5. **Test Login:**
   - Find `POST /api/auth/login`
   - Click "Try it out"
   - Enter:
     ```json
     {
       "email": "demo@test.com",
       "password": "Test123!"
     }
     ```
   - Click "Execute"
   - **Expected**: Status 200, new tokens returned

6. **Test Refresh Token:**
   - Copy the `refreshToken` from login response
   - Find `POST /api/auth/refresh`
   - Click "Try it out"
   - Enter:
     ```json
     {
       "refreshToken": "<paste-refresh-token-here>"
     }
     ```
   - Click "Execute"
   - **Expected**: Status 200, new access and refresh tokens

7. **Test Health Check:**
   - Open new tab: `https://localhost:7xxx/health`
   - **Expected**: "Healthy" response

### Step 6: Document Test Results
Create a simple test report:
- ✅ Registration works
- ✅ Login works
- ✅ Refresh works
- ✅ Logout works
- ✅ Health check works

**End of Day 3 Goal**: All endpoints tested and working locally ✅

---

## 📅 Day 4: GitHub Repository & CI/CD Pipeline

### Step 1: Initialize Git Repository
```bash
cd "C:\Users\lukel\PSS Portal"

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Authentication API boilerplate

- ASP.NET Core 8 Web API
- JWT authentication with refresh tokens
- Multi-tenant organization support
- PostgreSQL database
- Entity Framework Core
- Clean Architecture (4 projects)
- Swagger documentation
- Rate limiting and CORS
- Health checks
- GitHub Actions CI workflow"
```

### Step 2: Create GitHub Repository

1. **Go to GitHub.com:**
   - Sign in to your account
   - Click the "+" icon (top right) → "New repository"

2. **Repository Settings:**
   - Name: `pss-portal` (or your preferred name)
   - Description: "Consulting Audit Portal - Authentication API"
   - Visibility: Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

3. **Copy the repository URL** shown on the next page

### Step 3: Push Code to GitHub
```bash
# Add remote
git remote add origin https://github.com/YOUR-USERNAME/pss-portal.git

# Rename branch to main (if needed)
git branch -M main

# Push code
git push -u origin main
```

### Step 4: Verify CI Pipeline

1. **Check GitHub Actions:**
   - Go to your repository on GitHub
   - Click the "Actions" tab
   - You should see a workflow run starting automatically
   - Wait for it to complete (usually 1-2 minutes)
   - **Expected**: Green checkmark ✅

2. **If CI fails:**
   - Click on the failed workflow
   - Check the logs
   - Most common issues:
     - Build errors (we already fixed these)
     - Test failures (we have no tests yet, so this is OK)

### Step 5: Create Development Branch (Optional)
```bash
# Create and push develop branch
git checkout -b develop
git push -u origin develop
```

**End of Day 4 Goal**: Code on GitHub with working CI pipeline ✅

---

## 📅 Day 5: Azure Deployment

### Step 1: Create Azure Database for PostgreSQL

1. **Go to Azure Portal:**
   - https://portal.azure.com
   - Sign in

2. **Create PostgreSQL Flexible Server:**
   - Click "Create a resource"
   - Search for "Azure Database for PostgreSQL Flexible Server"
   - Click "Create"

3. **Configure Database:**
   - **Basics:**
     - Resource group: Create new → `rg-pss-portal-prod`
     - Server name: `pss-portal-db` (must be globally unique)
     - Region: Choose closest to you
     - PostgreSQL version: 16
     - Compute + storage:
       - Workload type: Development
       - Compute tier: Burstable
       - Compute size: B1ms (1 vCore, 2 GiB RAM)
       - Storage: 32 GiB
     - Authentication: PostgreSQL authentication
     - Admin username: `pspadmin`
     - Password: Create strong password (SAVE THIS!)
   - **Networking:**
     - Connectivity method: Public access
     - Firewall rules:
       - ✅ Allow public access from Azure services
       - Add your current client IP address
   - **Review + Create** → Click "Create"

4. **Wait for deployment** (5-10 minutes)

5. **Get Connection String:**
   - Go to your database resource
   - Click "Connection strings" in left menu
   - Copy the ADO.NET connection string
   - Replace `{your_password}` with your actual password
   - **Save this connection string!**

### Step 2: Create Azure App Service

1. **Create App Service:**
   - Click "Create a resource"
   - Search for "Web App"
   - Click "Create"

2. **Configure Web App:**
   - **Basics:**
     - Resource group: `rg-pss-portal-prod` (same as database)
     - Name: `pss-portal-api` (must be globally unique)
     - Publish: Code
     - Runtime stack: .NET 8 (LTS)
     - Operating System: Linux
     - Region: Same as database
   - **Pricing:**
     - Plan: Create new
     - Pricing plan: Basic B1 (1 core, 1.75 GB RAM)
   - **Review + Create** → Click "Create"

3. **Wait for deployment** (2-3 minutes)

### Step 3: Configure App Service Settings

1. **Go to your App Service resource**

2. **Configuration → Application settings:**
   Click "New application setting" for each:

   ```
   Name: ConnectionStrings__Default
   Value: <paste your PostgreSQL connection string>

   Name: Jwt__Issuer
   Value: CAP

   Name: Jwt__Audience
   Value: CAP

   Name: Jwt__SigningKey
   Value: <generate strong random 64+ character string>

   Name: Jwt__AccessTokenMinutes
   Value: 30

   Name: Jwt__RefreshTokenDays
   Value: 7

   Name: ASPNETCORE_ENVIRONMENT
   Value: Production
   ```

3. **Generate strong JWT signing key:**
   ```bash
   # On Windows PowerShell:
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

   # Or use online tool:
   # https://randomkeygen.com/ (use "CodeIgniter Encryption Keys")
   ```

4. **Click "Save"** at the top

5. **General settings:**
   - HTTPS Only: On
   - HTTP Version: 2.0
   - Click "Save"

### Step 4: Deploy from GitHub

**OPTION A - GitHub Actions (Recommended):**

1. **Create deployment workflow:**
   ```bash
   # Create new file: .github/workflows/deploy.yml
   ```

2. **Get Azure publish profile:**
   - In Azure Portal, go to your App Service
   - Click "Get publish profile" (top toolbar)
   - This downloads a `.PublishSettings` file
   - Open it and copy all content

3. **Add GitHub Secret:**
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Value: Paste the entire publish profile content
   - Click "Add secret"

4. **Create deployment workflow file locally:**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

env:
  AZURE_WEBAPP_NAME: pss-portal-api

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: '8.0.x'

    - name: Build
      run: dotnet build -c Release

    - name: Publish
      run: dotnet publish src/CAP.Api/CAP.Api.csproj -c Release -o ./publish

    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ env.AZURE_WEBAPP_NAME }}
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./publish
```

5. **Commit and push:**
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add Azure deployment workflow"
   git push origin main
   ```

6. **Watch deployment:**
   - Go to GitHub → Actions tab
   - Watch the deployment run
   - Wait for completion (3-5 minutes)

**OPTION B - VS Code Azure Extension:**
1. Install Azure App Service extension in VS Code
2. Right-click on App Service
3. Select "Deploy to Web App"
4. Select your subscription and app

**OPTION C - Azure CLI:**
```bash
az login
az webapp up --name pss-portal-api --resource-group rg-pss-portal-prod
```

### Step 5: Run Database Migrations on Azure

**OPTION A - Local migration to Azure DB:**
```bash
# Update connection string temporarily in appsettings.Development.json
# to point to Azure PostgreSQL, then:
dotnet ef database update --project src/CAP.Infrastructure --startup-project src/CAP.Api
```

**OPTION B - SSH into App Service:**
1. In Azure Portal, go to your App Service
2. Development Tools → SSH → Go
3. Navigate to your app folder
4. Run migration bundle (if you included it in deployment)

**OPTION C - Use Kudu Console:**
1. Go to `https://pss-portal-api.scm.azurewebsites.net`
2. Debug console → CMD
3. Navigate to site/wwwroot
4. Run migrations manually

### Step 6: Test Deployed API

1. **Get your API URL:**
   - `https://pss-portal-api.azurewebsites.net`
   - (Replace with your actual app name)

2. **Test Swagger:**
   - Go to `https://pss-portal-api.azurewebsites.net/swagger`
   - **Expected**: Swagger UI loads

3. **Test Health Check:**
   - Go to `https://pss-portal-api.azurewebsites.net/health`
   - **Expected**: "Healthy" response

4. **Test Registration:**
   - Use Swagger or Postman
   - POST to `/api/auth/register`
   - **Expected**: Status 200, tokens returned

5. **Test Login:**
   - POST to `/api/auth/login`
   - **Expected**: Status 200, tokens returned

### Step 7: Configure Custom Domain (Optional)

1. **App Service → Custom domains**
2. Add your domain
3. Configure DNS
4. Enable HTTPS with managed certificate

### Step 8: Set Up Monitoring (Recommended)

1. **Application Insights:**
   - Go to your App Service
   - Application Insights → Turn on
   - Create new Application Insights resource
   - This gives you:
     - Request tracking
     - Error monitoring
     - Performance metrics

2. **Set up alerts:**
   - Alerts → New alert rule
   - Alert on HTTP 5xx errors
   - Alert on high response time

**End of Day 5 Goal**: API deployed and accessible on Azure ✅

---

## ✅ Success Checklist

Mark these off as you complete them:

### Day 3: Local Testing
- [ ] Docker Desktop running
- [ ] PostgreSQL container started
- [ ] Database migrations applied successfully
- [ ] API runs locally without errors
- [ ] Registration endpoint tested
- [ ] Login endpoint tested
- [ ] Refresh token endpoint tested
- [ ] Logout endpoint tested
- [ ] Health check endpoint tested

### Day 4: GitHub & CI
- [ ] Git repository initialized
- [ ] Initial commit created
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] GitHub Actions CI pipeline runs successfully
- [ ] Build passes on GitHub

### Day 5: Azure Deployment
- [ ] Azure PostgreSQL database created
- [ ] Azure App Service created
- [ ] App Service configured with connection string
- [ ] JWT signing key configured
- [ ] Code deployed to Azure
- [ ] Database migrations run on Azure
- [ ] Swagger accessible on Azure URL
- [ ] Health check returns "Healthy"
- [ ] Registration works on deployed API
- [ ] Login works on deployed API

---

## 🆘 Troubleshooting

### Docker Issues
**Problem**: Docker won't start
- **Solution**: Restart Docker Desktop, wait 2-3 minutes

**Problem**: PostgreSQL container won't start
- **Solution**:
  ```bash
  docker compose down
  docker compose up -d
  ```

### Migration Issues
**Problem**: dotnet-ef command not found
- **Solution**: Use Visual Studio Package Manager Console or migration bundle

**Problem**: Can't connect to database
- **Solution**: Check PostgreSQL is running: `docker ps`

### Build Issues
**Problem**: Build errors
- **Solution**:
  ```bash
  dotnet clean
  dotnet restore
  dotnet build
  ```

### Azure Issues
**Problem**: 500 error on Azure
- **Solution**:
  - Check App Service logs: Monitoring → Log stream
  - Verify connection string is correct
  - Verify JWT signing key is set
  - Check if migrations ran

**Problem**: Can't connect to Azure PostgreSQL
- **Solution**:
  - Check firewall rules allow Azure services
  - Check connection string format
  - Verify admin password is correct

---

## 📞 Need Help?

If you get stuck:
1. Check the error message carefully
2. Check Azure Portal logs (App Service → Log stream)
3. Check GitHub Actions logs for CI/CD issues
4. Verify all configuration values are set correctly

---

## 🎯 After Deployment

Once everything is deployed:
1. Share your API URL: `https://pss-portal-api.azurewebsites.net/swagger`
2. Test with a real client (Postman, frontend, etc.)
3. Monitor Application Insights for usage
4. Plan next features (see `PSS_Portal_Master_Plan.md`)

**You'll have a fully deployed, production-ready authentication API!** 🚀

---

**Timeline**:
- ✅ **Jan 10-12, 2026**: Days 1-2 Complete (Boilerplate)
- 🔄 **Jan 13, 2026**: Day 3 - Local Testing
- 📅 **Jan 14, 2026**: Day 4 - GitHub & CI/CD
- 📅 **Jan 15-16, 2026**: Day 5 - Azure Deployment

**Current Progress**: Day 1-2 Complete ✅
**Next Up**: Day 3 - Local Testing (Tomorrow, Jan 13)
**Goal**: Deployed on Azure by Jan 16, 2026
