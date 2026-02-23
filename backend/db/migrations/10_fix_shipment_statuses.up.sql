-- Fix any NULL or invalid statuses in receiver_shipments
UPDATE receiver_shipments
SET status = 'pending'
WHERE status IS NULL
   OR status NOT IN ('pending', 'processing', 'in_transit', 'out_for_delivery', 'delivered');

-- Drop existing constraint if it exists, then add the CHECK constraint
ALTER TABLE receiver_shipments
DROP CONSTRAINT IF EXISTS receiver_shipments_valid_status;

ALTER TABLE receiver_shipments
ADD CONSTRAINT receiver_shipments_valid_status CHECK (
  status IN ('pending', 'processing', 'in_transit', 'out_for_delivery', 'delivered')
);

-- Ensure shipment_updates also have valid statuses
UPDATE shipment_updates
SET status = 'pending'
WHERE status IS NULL
   OR status NOT IN ('pending', 'processing', 'in_transit', 'out_for_delivery', 'delivered');

-- Drop existing constraint if it exists, then add the CHECK constraint
ALTER TABLE shipment_updates
DROP CONSTRAINT IF EXISTS shipment_updates_valid_status;

ALTER TABLE shipment_updates
ADD CONSTRAINT shipment_updates_valid_status CHECK (
  status IN ('pending', 'processing', 'in_transit', 'out_for_delivery', 'delivered')
);
