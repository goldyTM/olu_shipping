# Quick Start Guide

## ⚡ You Need To Do These Steps

### 1. Apply the Profile Auto-Creation Migration to Supabase

**This is REQUIRED to fix the profile creation issue!**

Go to your Supabase project dashboard → SQL Editor and run this:

```sql
-- Trigger function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, created_at)
  VALUES (
    NEW.id,
    'receiver', -- default role
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function after user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

This migration is also saved in: `backend/db/migrations/5_auto_create_profile.up.sql`

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PORT=4000
```

**Frontend** (`frontend/.env`):
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=http://localhost:4000/api
```

### 3. Start the Servers

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## ✅ What Was Fixed

### 1. Profile Auto-Creation
- Added Supabase trigger that automatically creates a profile entry when a user registers
- Default role is `receiver`
- No more empty profile issues!

### 2. Removed Encore Dependency
- Replaced Encore with standard Express.js REST API
- All endpoints now work at `http://localhost:4000/api`
- Updated frontend to use Express API client

### 3. Updated API Structure

**New Vendor Endpoints:**
- `GET /api/vendor/shipments?limit=5&offset=0` - List with pagination (fixed 404!)
- `POST /api/vendor/declare` - Create shipment
- `GET /api/vendor/get-shipment/:id` - Get shipment
- `PUT /api/vendor/update-shipment/:id` - Update shipment
- `DELETE /api/vendor/delete-shipment/:id` - Delete shipment

All endpoints now properly connect to Supabase database.

## 🔧 Troubleshooting

**If profiles still aren't created:**
1. Make sure you ran the SQL migration in Step 1
2. Try registering a new user to test
3. Check the `profiles` table in Supabase to verify

**If you get 404 errors:**
1. Ensure backend is running on port 4000
2. Check that `VITE_API_URL` in frontend/.env is set to `http://localhost:4000/api`
3. Look at browser console for detailed errors

**To manually set a user's role:**
```sql
UPDATE profiles SET role = 'vendor' WHERE id = '<user-id>';
UPDATE profiles SET role = 'admin' WHERE id = '<user-id>';
```
