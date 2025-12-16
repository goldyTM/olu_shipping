-- Profiles table to map auth users to roles (vendor, receiver, admin)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'receiver' CHECK (role IN ('vendor', 'receiver', 'admin')),
  vendor_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_vendor_id ON profiles(vendor_id);

-- Example: ensure an admin can be created by inserting a row with role='admin'
