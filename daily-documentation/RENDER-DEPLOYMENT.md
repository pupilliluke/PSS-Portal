# Render.com Deployment Guide - PSS Portal
## 100% FREE Deployment (No Credit Card Required)

**Estimated Setup Time**: 10-15 minutes
**Monthly Cost**: $0.00
**Database**: PostgreSQL (90 days free, renewable)

---

## ✅ What You've Got Ready

All configuration files are created:
- ✅ `render.yaml` - Render infrastructure configuration
- ✅ `Dockerfile` - Optimized .NET 8 container
- ✅ `.dockerignore` - Build optimization
- ✅ `appsettings.Production.json` - Production configuration

---

## 🚀 Deployment Steps

### Step 1: Commit and Push to GitHub

```bash
cd "C:\Users\lukel\z-Personal Software Solutions\PSS Portal"
git add .
git commit -m "Add Render.com deployment configuration"
git push origin main
```

---

### Step 2: Create Render Account

1. Go to: https://render.com
2. Click **"Get Started"**
3. Sign up with **GitHub** (easiest option)
4. Authorize Render to access your GitHub repositories

---

### Step 3: Create New Blueprint Instance

1. In Render Dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository: **PSS-Portal**
3. Render will detect the `render.yaml` file automatically
4. Click **"Apply"**

Render will now:
- Create a PostgreSQL database (pss-portal-db)
- Create a web service (pss-portal-api)
- Auto-generate secure passwords and JWT keys
- Start building and deploying your app

---

### Step 4: Monitor Deployment

1. Watch the **"Events"** tab for build progress
2. Build time: ~5-10 minutes (first deployment)
3. Look for: **"Deploy succeeded"** ✅

---

### Step 5: Run Database Migrations

Once deployed, you need to initialize the database:

#### Option A: Using Render Shell (Recommended)

1. Go to your **pss-portal-api** service
2. Click **"Shell"** tab
3. Run migration command:
   ```bash
   dotnet ef database update --project /app/CAP.Infrastructure.dll --startup-project /app/CAP.Api.dll
   ```

#### Option B: Using Local Connection (Alternative)

1. Get database connection string:
   - Go to **pss-portal-db** service
   - Click **"Connect"** → Copy **External Database URL**

2. Run migrations locally:
   ```bash
   # Temporarily update appsettings.Development.json with Render DB connection string
   dotnet ef database update --project src/CAP.Infrastructure --startup-project src/CAP.Api
   ```

---

### Step 6: Test Your Deployed API

Your API will be live at: `https://pss-portal-api.onrender.com`

#### Test Endpoints:

1. **Health Check**:
   ```
   GET https://pss-portal-api.onrender.com/health
   Expected: "Healthy"
   ```

2. **Swagger UI**:
   ```
   https://pss-portal-api.onrender.com/swagger
   ```

3. **Register a User**:
   ```http
   POST https://pss-portal-api.onrender.com/api/auth/register
   Content-Type: application/json

   {
     "email": "demo@test.com",
     "password": "Test12345",
     "organizationName": "Demo Company"
   }
   ```

4. **Create an Audit** (use token from registration):
   ```http
   POST https://pss-portal-api.onrender.com/api/audits
   Authorization: Bearer <your-access-token>
   Content-Type: application/json

   {
     "title": "Q1 2026 Workflow Audit",
     "notes": "Initial audit"
   }
   ```

---

## 🔧 Configuration Details

### Environment Variables (Auto-configured via render.yaml)

These are automatically set by Render:

| Variable | Value | Notes |
|----------|-------|-------|
| `ASPNETCORE_ENVIRONMENT` | Production | .NET environment |
| `ASPNETCORE_URLS` | http://0.0.0.0:8080 | Listen on port 8080 |
| `ConnectionStrings__Default` | Auto-generated | From PostgreSQL service |
| `Jwt__SigningKey` | Auto-generated | Secure random key |
| `Jwt__Issuer` | CAP | Token issuer |
| `Jwt__Audience` | CAP | Token audience |
| `Jwt__AccessTokenMinutes` | 30 | Access token lifetime |
| `Jwt__RefreshTokenDays` | 7 | Refresh token lifetime |

---

## 📊 Free Tier Limits

### Web Service (pss-portal-api)
- **RAM**: 512 MB
- **CPU**: Shared
- **Hours**: 750 hours/month (more than enough)
- **Bandwidth**: 100 GB/month
- **Cold Starts**: Spins down after 15 min inactivity
  - First request after sleep: ~30 seconds
  - Subsequent requests: Fast

### PostgreSQL Database (pss-portal-db)
- **Storage**: 1 GB
- **Connections**: Shared
- **Duration**: 90 days
- **After 90 days**: Create new free database, migrate data

---

## 🔄 Auto-Deployment

Every push to `main` branch will automatically:
1. Trigger a new build on Render
2. Run tests (if configured)
3. Deploy new version
4. Zero-downtime deployment

**No GitHub Actions needed** - Render handles everything!

---

## 💡 Tips for Free Tier

### Keep It Awake (Prevent Cold Starts)

Use a free uptime monitor to ping your API every 10 minutes:

**Option 1: UptimeRobot** (Free)
1. Go to: https://uptimerobot.com
2. Add monitor: `https://pss-portal-api.onrender.com/health`
3. Interval: 5 minutes

**Option 2: Cron-Job.org** (Free)
1. Go to: https://cron-job.org
2. Add job: `https://pss-portal-api.onrender.com/health`
3. Interval: Every 10 minutes

### Database Renewal (After 90 Days)

When your free database expires:

1. **Create new database** in Render (takes 2 min)
2. **Backup old data**:
   ```bash
   pg_dump <OLD_DB_URL> > backup.sql
   ```
3. **Restore to new database**:
   ```bash
   psql <NEW_DB_URL> < backup.sql
   ```
4. **Update service** to use new database

---

## 🐛 Troubleshooting

### Issue: "Application failed to start"

**Check logs**:
1. Go to **pss-portal-api** service
2. Click **"Logs"** tab
3. Look for error messages

**Common causes**:
- Missing database migrations
- Invalid connection string
- Port configuration (must be 8080)

### Issue: "Database connection failed"

**Solution**:
1. Verify database is running (check **pss-portal-db** status)
2. Check connection string in environment variables
3. Ensure database migrations were applied

### Issue: "Cold start takes too long"

**Solution**:
- Set up UptimeRobot to keep service warm
- Or upgrade to paid tier ($7/month for always-on)

### Issue: "Cannot access Swagger UI"

**Solution**:
- Swagger is enabled in Production by default
- Check if service is fully deployed
- Try: `https://pss-portal-api.onrender.com/swagger/index.html`

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Blueprint applied successfully
- [ ] Both services (API + DB) showing "Live"
- [ ] Database migrations applied
- [ ] Health check returns "Healthy"
- [ ] Swagger UI loads
- [ ] User registration works
- [ ] User login works
- [ ] Audit creation works

---

## 🔗 Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **Your API**: https://pss-portal-api.onrender.com
- **Swagger**: https://pss-portal-api.onrender.com/swagger
- **GitHub Repo**: https://github.com/pupilliluke/PSS-Portal
- **Render Docs**: https://render.com/docs

---

## 🚀 Next Steps After Deployment

1. **Set up UptimeRobot** to keep service warm
2. **Add custom domain** (optional, free with Render)
3. **Continue Iteration 2** features (Findings, File uploads)
4. **Build frontend** (Next.js on Vercel - also free!)

---

## 💰 Cost Comparison

| Provider | Monthly Cost | Database | Notes |
|----------|--------------|----------|-------|
| **Render (Free)** | $0 | 90 days | Perfect for MVP/demos |
| Render (Starter) | $7 | Unlimited | Always-on, no cold starts |
| Azure | $26 | Unlimited | More expensive |
| AWS | $0 (12mo) | 12 months | Then ~$20/month |
| Fly.io | $0 | Unlimited | 256 MB RAM |

---

**Last Updated**: January 19, 2026
**Status**: Ready to deploy! 🚀
**Deployment Time**: ~15 minutes from start to finish
