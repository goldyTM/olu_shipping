# Keep Alive Setup

This project includes a health check system to keep Supabase active on the free tier.

## Quick Setup (Recommended)

**Ping Supabase REST API directly** - no deployment needed!

### Using cron-job.org:

1. Go to [cron-job.org](https://cron-job.org) and create a free account
2. Create a new cron job with these settings:
   - **URL**: `https://tndlbjxkdrftxbcxyawi.supabase.co/rest/v1/vendor_shipments?limit=1`
   - **Schedule**: Every 6 hours (or every 1 hour for best results)
   - **Request method**: GET
   - **Custom headers**:
     - Header name: `apikey`
     - Header value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZGxianhrZHJmdHhiY3h5YXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MjAyMzMsImV4cCI6MjA4MDk5NjIzM30.jYuDrthdhVBxS5jqNN8ByNAgv4zJ2afOVK9vaqQrM5A`
     
     Also add:
     - Header name: `Authorization`
     - Header value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZGxianhrZHJmdHhiY3h5YXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MjAyMzMsImV4cCI6MjA4MDk5NjIzM30.jYuDrthdhVBxS5jqNN8ByNAgv4zJ2afOVK9vaqQrM5A`

This pings your Supabase database directly and keeps it active.

## Alternative: Vercel Health Endpoint

If you prefer to use the Vercel endpoint:

1. Ensure environment variables are set in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Deploy and use: `https://your-app.vercel.app/api/health`

## Alternative: GitHub Actions

A GitHub Actions workflow is configured in `.github/workflows/keep-alive.yml`:
- Runs every 6 hours automatically
- Can be triggered manually from the Actions tab
- Update the URL in the workflow to your preferred endpoint

## Testing
Supabase endpoint directly:
```bash
curl -H "apikey: YOUR_ANON_KEY" -H "Authorization: Bearer YOUR_ANON_KEY" "https://tndlbjxkdrftxbcxyawi.supabase.co/rest/v1/vendor_shipments?limit=1"
```

Expected response: JSON array (empty or with data)
```

## Notes

- The workflow runs every 6 hours by default (adjust the cron schedule as needed)
- Free tier Supabase typically pauses after ~7 days of inactivity
- This keeps your database connection warm and prevents sleep
