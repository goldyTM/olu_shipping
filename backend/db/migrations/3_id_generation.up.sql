-- Create sequences used for generating human-readable IDs
CREATE SEQUENCE IF NOT EXISTS vendor_decl_seq START 1;
CREATE SEQUENCE IF NOT EXISTS tracking_seq START 1;

-- Generator for Vendor Declaration ID: VD-YYYY-XXXX
CREATE OR REPLACE FUNCTION gen_vendor_decl_id()
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT 'VD-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(nextval('vendor_decl_seq')::text, 4, '0');
$$;

-- Generator for Tracking ID: TRK-YYYY-XXXX
CREATE OR REPLACE FUNCTION gen_tracking_id()
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT 'TRK-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(nextval('tracking_seq')::text, 4, '0');
$$;

-- Trigger function to populate vendor_decl_id before insert
CREATE OR REPLACE FUNCTION set_vendor_decl_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vendor_decl_id IS NULL OR NEW.vendor_decl_id = '' THEN
    NEW.vendor_decl_id := gen_vendor_decl_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to populate tracking_id before insert
CREATE OR REPLACE FUNCTION set_tracking_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_id IS NULL OR NEW.tracking_id = '' THEN
    NEW.tracking_id := gen_tracking_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers to tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_vendor_decl_id'
  ) THEN
    CREATE TRIGGER trg_set_vendor_decl_id
    BEFORE INSERT ON vendor_shipments
    FOR EACH ROW
    EXECUTE FUNCTION set_vendor_decl_id();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_tracking_id'
  ) THEN
    CREATE TRIGGER trg_set_tracking_id
    BEFORE INSERT ON receiver_shipments
    FOR EACH ROW
    EXECUTE FUNCTION set_tracking_id();
  END IF;
END;
$$ LANGUAGE plpgsql;
