# Day 4: Azure Deployment Guide
## PSS Portal - Production Deployment

**Date**: January 16, 2026
**Status**: In Progress
**GitHub Repo**: https://github.com/pupilliluke/PSS-Portal

---

## ✅ Completed

- [x] Git repository initialized
- [x] Code committed to Git
- [x] GitHub repository created
- [x] Code pushed to GitHub
- [x] Azure deployment workflow created

---

## 🔵 Azure Resources to Create

### Estimated Monthly Cost
- PostgreSQL Flexible Server (B1ms): ~$13/month
- App Service (B1 Linux): ~$13/month
- **Total**: ~$26/month

---

## 📝 STEP 1: Create Azure PostgreSQL Flexible Server

### Instructions

1. **Go to**: https://portal.azure.com
2. **Click**: "Create a resource" (top left)
3. **Search**: "Azure Database for PostgreSQL Flexible Server"
4. **Click**: "Create"

### Configuration

#### **Basics Tab:**
- **Subscription**: (Your Azure subscription)
- **Resource group**: Click "Create new" → `rg-pss-portal-prod`
- **Server name**: `pss-portal-db` (must be globally unique - try variations if taken)
- **Region**: Choose closest to you:
  - East US
  - East US 2
  - West US 2
  - Central US
- **PostgreSQL version**: **16**
- **Workload type**: **Development**
- **Compute + storage**: Click "Configure server"
  - Compute tier: **Burstable**
  - Compute size: **B1ms** (1 vCore, 2 GiB RAM)
  - Storage: **32 GiB**
  - Click "Save"

#### **Authentication:**
- **Authentication method**: PostgreSQL authentication only
- **Admin username**: `pspadmin`
- **Password**: Create a strong password (e.g., use LastPass, 1Password, or generate one)

#### **Networking Tab:**
- **Connectivity method**: Public access (selected servers and IP addresses)
- **Firewall rules**:
  - ✅ Check: "Allow public access from any Azure service within Azure to this server"
  - Click: "+ Add current client IP address"

#### **Review + Create:**
- Review all settings
- Click "Create"

⏰ **Wait 5-10 minutes for deployment to complete**

---

## 📋 REQUIRED INFORMATION - FILL THIS OUT

### PostgreSQL Server Details

**Question 1: What server name did you use?**
Answer: `pss-portal-db` (or your chosen name)
_Note: This will be part of your connection string_

**Question 2: What region did you select?**
Answer: ________________
_Examples: East US, West US 2, Central US_

**Question 3: What password did you set for the admin user (pspadmin)?**
Answer: ________________
⚠️ **KEEP THIS SECURE - You'll need it for the connection string**

**Question 4: What is your PostgreSQL server's fully qualified domain name?**
_After deployment, go to the PostgreSQL resource → Overview → Server name_
Answer: `pss-portal-db.postgres.database.azure.com` (example)

---

## 📝 STEP 2: Create Azure App Service (Web App)

### Instructions

1. **In Azure Portal**, click "Create a resource"
2. **Search**: "Web App"
3. **Click**: "Create"

### Configuration

#### **Basics Tab:**
- **Subscription**: (Your Azure subscription)
- **Resource group**: `rg-pss-portal-prod` (same as database)
- **Name**: `pss-portal-api` (must be globally unique - try variations if taken)
- **Publish**: **Code**
- **Runtime stack**: **.NET 8 (LTS)**
- **Operating System**: **Linux**
- **Region**: **Same as your PostgreSQL server**

#### **Pricing Plans:**
- **Linux Plan**: Create new → `asp-pss-portal-prod`
- **Pricing plan**: Click "Explore pricing plans"
  - Select: **Basic B1** (1 core, 1.75 GB RAM)
  - Click "Select"

#### **Review + Create:**
- Review all settings
- Click "Create"

⏰ **Wait 2-3 minutes for deployment to complete**

---

## 📋 REQUIRED INFORMATION - FILL THIS OUT

### App Service Details

**Question 5: What app service name did you use?**
Answer: `pss-portal-api` (or your chosen name)
_Your API URL will be: https://pss-portal-api.azurewebsites.net_

**Question 6: Did you use the same region as PostgreSQL?**
Answer: Yes / No
_Should be: Yes (for best performance)_

---

## 🔐 STEP 3: Generate JWT Signing Key

You need a strong, random key for JWT token signing (minimum 64 characters).

### Option A: PowerShell (Windows)
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### Option B: Online Generator
Go to: https://randomkeygen.com/
Use: "CodeIgniter Encryption Keys" (504-bit)

**Question 7: What is your JWT Signing Key?**
Answer: ________________
⚠️ **KEEP THIS SECURE - Never commit to Git**

---

## ⚙️ STEP 4: Configure App Service Application Settings

1. **Go to your App Service** in Azure Portal
2. **Click**: "Configuration" (in Settings menu)
3. **Click**: "New application setting" for each below:

### Required Application Settings

| Name | Value | Notes |
|------|-------|-------|
| `ConnectionStrings__Default` | See below | PostgreSQL connection |
| `Jwt__Issuer` | `CAP` | JWT issuer claim |
| `Jwt__Audience` | `CAP` | JWT audience claim |
| `Jwt__SigningKey` | _(Your 64-char key from Q7)_ | Token signing key |
| `Jwt__AccessTokenMinutes` | `30` | Access token lifetime |
| `Jwt__RefreshTokenDays` | `7` | Refresh token lifetime |
| `ASPNETCORE_ENVIRONMENT` | `Production` | Environment name |

### Connection String Format

```
Host=<SERVER_NAME>.postgres.database.azure.com;Database=cap_dev;Username=pspadmin;Password=<YOUR_PASSWORD>;SSL Mode=Require;Trust Server Certificate=true
```

**Replace:**
- `<SERVER_NAME>` with your server name (Q1)
- `<YOUR_PASSWORD>` with your admin password (Q3)

**Example:**
```
Host=pss-portal-db.postgres.database.azure.com;Database=cap_dev;Username=pspadmin;Password=MySecurePass123!;SSL Mode=Require;Trust Server Certificate=true
```

4. **Click "Save"** at the top
5. **Click "Continue"** to confirm restart

---

## 📤 STEP 5: Get Azure Publish Profile

1. **Go to your App Service** in Azure Portal
2. **Click**: "Get publish profile" (top toolbar - download icon)
3. **Save the file** - it will download as `<appname>.PublishSettings`
4. **Open the file** in Notepad
5. **Copy ALL the XML content**

**Question 8: Did you download and open the publish profile?**
Answer: Yes / No
_Keep this file open - you'll need to copy the content in the next step_

---

## 🔑 STEP 6: Add GitHub Secret

1. **Go to**: https://github.com/pupilliluke/PSS-Portal
2. **Click**: "Settings" tab
3. **Click**: "Secrets and variables" → "Actions"
4. **Click**: "New repository secret"
5. **Fill in:**
   - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Value: Paste the ENTIRE content from the .PublishSettings file (from Step 5)
6. **Click**: "Add secret"

---

## 🚀 STEP 7: Trigger Deployment

1. **Make a small change** to trigger deployment:
   ```bash
   cd "C:\Users\lukel\PSS PORTAL"
   echo "# PSS Portal API" >> README.md
   git add README.md
   git commit -m "Trigger Azure deployment"
   git push origin main
   ```

2. **Watch the deployment**:
   - Go to: https://github.com/pupilliluke/PSS-Portal/actions
   - You should see "Deploy to Azure" workflow running
   - Click on it to watch progress
   - Wait for green checkmark ✅ (3-5 minutes)

---

## 🗄️ STEP 8: Apply Database Migrations

After deployment succeeds, apply the database schema:

### Option A: From Local Machine (Easiest)

1. **Update your local connection string temporarily**:
   - Open: `src/CAP.Api/appsettings.Development.json`
   - Change `ConnectionStrings.Default` to your Azure PostgreSQL connection string

2. **Run migration**:
   ```bash
   cd "C:\Users\lukel\PSS PORTAL"
   dotnet ef database update --project src/CAP.Infrastructure --startup-project src/CAP.Api
   ```

3. **Verify tables created**:
   - Should create 11 tables including Audits

### Option B: Using Azure Cloud Shell

1. **In Azure Portal**, click Cloud Shell icon (>_) at top
2. **Upload your migration SQL**:
   - Click "Upload/Download files" icon
   - Upload `migration-all.sql` from your project
3. **Connect to PostgreSQL**:
   ```bash
   psql "host=<SERVER_NAME>.postgres.database.azure.com port=5432 dbname=cap_dev user=pspadmin sslmode=require"
   # Enter password when prompted
   ```
4. **Run migration**:
   ```sql
   \i migration-all.sql
   \dt
   ```

---

## ✅ STEP 9: Test Your Deployed API

### Test URL
Your API is live at: `https://<YOUR_APP_NAME>.azurewebsites.net`

### Test Endpoints

1. **Health Check**:
   ```
   GET https://pss-portal-api.azurewebsites.net/health
   Expected: "Healthy"
   ```

2. **Swagger UI**:
   ```
   https://pss-portal-api.azurewebsites.net/swagger
   Expected: API documentation page loads
   ```

3. **Register a User**:
   ```http
   POST https://pss-portal-api.azurewebsites.net/api/auth/register
   Content-Type: application/json

   {
     "email": "demo@test.com",
     "password": "Test12345",
     "organizationName": "Demo Company"
   }
   ```
   Expected: Returns accessToken, refreshToken, organizationId

4. **Create an Audit** (use token from registration):
   ```http
   POST https://pss-portal-api.azurewebsites.net/api/audits
   Authorization: Bearer <your-access-token>
   Content-Type: application/json

   {
     "title": "Q1 2026 Security Audit",
     "notes": "Initial audit setup"
   }
   ```
   Expected: Returns audit details with ID

---

## 🎉 Success Checklist

- [ ] PostgreSQL Flexible Server created and running
- [ ] App Service created and running
- [ ] Application settings configured (connection string, JWT key, etc.)
- [ ] GitHub secret added (publish profile)
- [ ] Code deployed to Azure (GitHub Actions succeeded)
- [ ] Database migrations applied (11 tables created)
- [ ] Health check returns "Healthy"
- [ ] Swagger UI loads successfully
- [ ] User registration works
- [ ] User login works
- [ ] Audit creation works

---

## 🆘 Troubleshooting

### Issue: App Service shows 500 error

**Solution:**
1. Go to App Service → "Log stream" (in Monitoring)
2. Check for errors:
   - Connection string incorrect?
   - JWT signing key missing?
   - Database not accessible?

### Issue: Can't connect to PostgreSQL

**Solution:**
1. Check firewall rules (Networking tab)
2. Verify "Allow Azure services" is checked
3. Test connection from Cloud Shell:
   ```bash
   psql "host=<server>.postgres.database.azure.com dbname=cap_dev user=pspadmin sslmode=require"
   ```

### Issue: GitHub Actions deployment fails

**Solution:**
1. Check workflow run logs in GitHub
2. Verify publish profile secret is correctly set
3. Verify app name matches in workflow file

---

## 📊 Cost Management

### Current Setup (Monthly)
- PostgreSQL B1ms: ~$13
- App Service B1: ~$13
- **Total**: ~$26/month

### To Reduce Costs (Development)
- Scale down to Free tier App Service (F1)
- Use Burstable B1s for PostgreSQL (~$12/month)
- Stop resources when not in use

### To Stop Resources
```bash
# Stop App Service (still charges for plan)
az webapp stop --name pss-portal-api --resource-group rg-pss-portal-prod

# Stop PostgreSQL (still charges for storage)
az postgres flexible-server stop --name pss-portal-db --resource-group rg-pss-portal-prod
```

---

## 🔗 Useful Links

- **GitHub Repository**: https://github.com/pupilliluke/PSS-Portal
- **Azure Portal**: https://portal.azure.com
- **Your API**: https://<your-app-name>.azurewebsites.net
- **Swagger**: https://<your-app-name>.azurewebsites.net/swagger

---

**Last Updated**: January 16, 2026
**Status**: Ready for Azure deployment
**Next**: Complete the questions above and follow each step in order
