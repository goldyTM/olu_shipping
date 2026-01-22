# Keep Alive Setup

This project includes a health check system to keep Supabase active on the free tier.

## Components

### 1. Health Check Endpoint
- **Location**: `frontend/api/health.ts`
- **URL**: `/api/health` (GET)
- **Purpose**: Vercel serverless function that queries Supabase to keep it active

### 2. GitHub Actions Workflow
- **Location**: `.github/workflows/keep-alive.yml`
- **Schedule**: Runs every 6 hours
- **Can be triggered manually** from the Actions tab

## Setup Instructions

### For GitHub Actions:

1. Deploy your app to Vercel (the health endpoint will be automatically available at `/api/health`)
2. Go to your GitHub repository settings
3. Navigate to **Secrets and variables** → **Actions**
4. Add a new repository secret:
   - **Name**: `HEALTH_CHECK_URL`
   - **Value**: Your Vercel deployment URL + `/api/health` (e.g., `https://your-app.vercel.app/api/health`)

### Alternative: Using cron-job.org

1. Go to [cron-job.org](https://cron-job.org) and create a free account
2. Create a new cron job with these settings:
   - **URL**: `https://your-app.vercel.app/api/health`
   - **Schedule**: Every 6 hours (or your preference)
   - **Request method**: GET
   - **Custom headers** (required):
     - Header name: `Authorization`
     - Header value: `Bearer YOUR_SUPABASE_ANON_KEY`
     - (Use your Supabase anon key from your `.env` file)

**Note**: The endpoint requires your Supabase anon key in the Authorization header for security.

Other options:
- **UptimeRobot**: Free monitoring (configure with custom headers)
- **GitHub Actions**: Already configured in `.github/workflows/keep-alive.yml` (needs header setup)

## Testing

Test the health check endpoint:
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-22T...",
  "database": "connected"
}
```

## Notes

- The workflow runs every 6 hours by default (adjust the cron schedule as needed)
- Free tier Supabase typically pauses after ~7 days of inactivity
- This keeps your database connection warm and prevents sleep
