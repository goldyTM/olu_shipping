-- Create containers table
CREATE TABLE containers (
  id BIGSERIAL PRIMARY KEY,
  container_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'empty',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add container_id to receiver_shipments
ALTER TABLE receiver_shipments ADD COLUMN container_id BIGINT REFERENCES containers(id);

-- Create indexes
CREATE INDEX idx_containers_status ON containers(status);
CREATE INDEX idx_receiver_shipments_container_id ON receiver_shipments(container_id);

-- Enable RLS on containers
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;

-- Policies for containers (admin access)
CREATE POLICY "Allow authenticated read for containers"
ON containers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert for containers"
ON containers FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update for containers"
ON containers FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete for containers"
ON containers FOR DELETE
TO authenticated
USING (true);