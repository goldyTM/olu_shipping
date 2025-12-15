-- Add vendor_id column to vendor_shipments table
ALTER TABLE vendor_shipments ADD COLUMN vendor_id VARCHAR(20);

-- Create index for vendor_id
CREATE INDEX idx_vendor_shipments_vendor_id ON vendor_shipments(vendor_id);
