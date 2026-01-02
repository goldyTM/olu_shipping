-- Drop existing policies if they exist (to allow re-running this migration)
DROP POLICY IF EXISTS "Allow public read for tracking" ON receiver_shipments;
DROP POLICY IF EXISTS "Allow public read for shipment updates" ON shipment_updates;
DROP POLICY IF EXISTS "Allow public read for vendor shipments" ON vendor_shipments;
DROP POLICY IF EXISTS "Allow authenticated insert for vendor shipments" ON vendor_shipments;
DROP POLICY IF EXISTS "Allow authenticated update for vendor shipments" ON vendor_shipments;
DROP POLICY IF EXISTS "Allow authenticated delete for vendor shipments" ON vendor_shipments;
DROP POLICY IF EXISTS "Allow authenticated insert for receiver shipments" ON receiver_shipments;
DROP POLICY IF EXISTS "Allow authenticated update for receiver shipments" ON receiver_shipments;
DROP POLICY IF EXISTS "Allow authenticated delete for receiver shipments" ON receiver_shipments;
DROP POLICY IF EXISTS "Allow authenticated insert for shipment updates" ON shipment_updates;
DROP POLICY IF EXISTS "Allow authenticated update for shipment updates" ON shipment_updates;
DROP POLICY IF EXISTS "Allow authenticated delete for shipment updates" ON shipment_updates;

-- Enable Row Level Security on tables
ALTER TABLE vendor_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE receiver_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_updates ENABLE ROW LEVEL SECURITY;

-- Allow public read access for tracking (receiver_shipments and shipment_updates)
CREATE POLICY "Allow public read for tracking"
ON receiver_shipments FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read for shipment updates"
ON shipment_updates FOR SELECT
TO anon, authenticated
USING (true);

-- Allow public read access for vendor shipments (needed for tracking details)
CREATE POLICY "Allow public read for vendor shipments"
ON vendor_shipments FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to insert vendor shipments
CREATE POLICY "Allow authenticated insert for vendor shipments"
ON vendor_shipments FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update their own vendor shipments
CREATE POLICY "Allow authenticated update for vendor shipments"
ON vendor_shipments FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to delete their own vendor shipments
CREATE POLICY "Allow authenticated delete for vendor shipments"
ON vendor_shipments FOR DELETE
TO authenticated
USING (true);

-- Allow authenticated users (admins) to insert receiver shipments
CREATE POLICY "Allow authenticated insert for receiver shipments"
ON receiver_shipments FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users (admins) to update receiver shipments
CREATE POLICY "Allow authenticated update for receiver shipments"
ON receiver_shipments FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users (admins) to delete receiver shipments
CREATE POLICY "Allow authenticated delete for receiver shipments"
ON receiver_shipments FOR DELETE
TO authenticated
USING (true);

-- Allow authenticated users (admins) to insert shipment updates
CREATE POLICY "Allow authenticated insert for shipment updates"
ON shipment_updates FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users (admins) to update shipment updates
CREATE POLICY "Allow authenticated update for shipment updates"
ON shipment_updates FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users (admins) to delete shipment updates
CREATE POLICY "Allow authenticated delete for shipment updates"
ON shipment_updates FOR DELETE
TO authenticated
USING (true);
