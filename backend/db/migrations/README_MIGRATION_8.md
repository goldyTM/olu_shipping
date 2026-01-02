# Applying Database Migration for Public Tracking

This migration enables public read access for shipment tracking without requiring authentication.

## To Apply This Migration:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `8_enable_public_tracking.up.sql`
4. Click **Run** to execute the migration

## What This Does:

- Enables Row Level Security (RLS) on all shipment tables
- Allows anonymous (public) users to READ tracking information
- Allows authenticated users to INSERT/UPDATE/DELETE shipments
- Ensures tracking works for customers without requiring login

## Verification:

After running the migration, test by:
1. Logging out of the app
2. Going to the tracking page
3. Entering a tracking ID (TRK-XXXX-XXXXX)
4. Verifying that tracking information loads correctly
