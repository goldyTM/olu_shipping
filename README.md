# Olu Shipping Company

A shipping management system built with React, Express, and Supabase.

## Features

- **Vendor Dashboard**: Declare and manage shipments
- **Admin Panel**: Search, update, and manage all shipments
- **Tracking System**: Track shipments by tracking number or QR code
- **Authentication**: Supabase Auth with automatic profile creation

## Setup Instructions

### 1. Prerequisites

- Node.js (v18 or higher)
- Supabase account
- Supabase CLI (optional, for migrations)

### 2. Supabase Setup

1. Create a new Supabase project at [https://app.supabase.com](https://app.supabase.com)
2. Get your project credentials:
   - Project URL
   - `anon` key (public)
   - `service_role` key (secret)

### 3. Run Database Migrations

Apply the SQL migrations in order:

```sql
-- Run these in the Supabase SQL Editor or using Supabase CLI
backend/db/migrations/1_create_tables.up.sql
backend/db/migrations/2_add_vendor_id.up.sql
backend/db/migrations/3_id_generation.up.sql
backend/db/migrations/4_profiles.up.sql
backend/db/migrations/5_auto_create_profile.up.sql
```

### 4. Backend Configuration

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` with your Supabase credentials:
```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PORT=4000
```

Start the backend:
```bash
npm run dev
```

### 5. Frontend Configuration

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=http://localhost:4000/api
```

Start the frontend:
```bash
npm run dev
```

## User Registration & Profile Creation

When a user registers via Supabase Auth:
1. Supabase creates the auth user
2. A trigger automatically creates a profile entry with `role='receiver'`
3. The user can now log in and use the system

To change a user's role to `vendor` or `admin`, update the `profiles` table in Supabase:
```sql
UPDATE profiles SET role = 'vendor' WHERE id = '<user-id>';
```

## API Endpoints

### Vendor Endpoints
- `POST /api/vendor/declare` - Declare a new shipment
- `GET /api/vendor/shipments?limit=50&offset=0` - List shipments with pagination
- `GET /api/vendor/get-shipment/:id` - Get specific shipment
- `PUT /api/vendor/update-shipment/:id` - Update shipment
- `DELETE /api/vendor/delete-shipment/:id` - Delete shipment
- `GET /api/vendor/check-status/:id` - Check shipment status

### Admin Endpoints
- `GET /api/admin/search?query=...` - Search shipments
- `PUT /api/admin/update-shipment/:id` - Update any shipment
- `DELETE /api/admin/delete-shipment/:id` - Delete any shipment

### Tracking Endpoints
- `GET /api/tracking/track/:trackingNumber` - Track by number
- `GET /api/tracking/search-by-qr/:qrCode` - Search by QR
- `PUT /api/tracking/update-status/:id` - Update tracking status

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth

## Troubleshooting

### Profile not created after registration
Ensure migration `5_auto_create_profile.up.sql` is applied. This creates a trigger that automatically creates profiles.

### 404 errors on API calls
- Check that backend is running on port 4000
- Verify `VITE_API_URL` in frontend `.env` is correct
- Check browser console for CORS errors

### Supabase connection errors
- Verify environment variables are set correctly
- Check that Supabase credentials are valid
- Ensure RLS policies allow the operations you need
