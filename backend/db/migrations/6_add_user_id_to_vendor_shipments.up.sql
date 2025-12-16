-- Add user_id column to vendor_shipments to link declarations to auth users
ALTER TABLE vendor_shipments 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_vendor_shipments_user_id ON vendor_shipments(user_id);

-- Update existing rows to set user_id from vendor_id if possible
-- (This is optional - existing data won't have user_id, so they'll be visible to all)
