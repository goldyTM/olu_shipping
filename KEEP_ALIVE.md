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
   - **Custom headers** (optional, for security):
     - Header name: `X-Health-Token`
     - Header value: Your secret token (generate a random string)
3. If using authentication, add `HEALTH_CHECK_TOKEN` to your Vercel environment variables with the same token value

Other options:
- **UptimeRobot**: Free monitoring with 5-minute intervals
- **GitHub Actions**: Already configured in `.github/workflows/keep-alive.yml`

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
