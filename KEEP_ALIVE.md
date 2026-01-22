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

### Alternative: Manual Cron Setup

If not using GitHub Actions, you can use any external cron service:

- **cron-job.org**: Free service to ping URLs on schedule
- **UptimeRobot**: Free monitoring with 5-minute intervals
- **Render**: Built-in cron jobs if hosting there

Simply configure them to ping your `/health` endpoint every few hours.

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
