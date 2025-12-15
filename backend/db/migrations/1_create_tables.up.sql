-- Vendor shipments table
CREATE TABLE vendor_shipments (
  id BIGSERIAL PRIMARY KEY,
  vendor_decl_id VARCHAR(20) UNIQUE NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  weight DOUBLE PRECISION NOT NULL,
  consignee_name TEXT NOT NULL,
  consignee_address TEXT NOT NULL,
  consignee_email TEXT NOT NULL,
  consignee_phone TEXT NOT NULL,
  hs_code VARCHAR(20),
  qr_code_url TEXT,
  invoice_pdf_url TEXT,
  packing_list_pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receiver shipments table
CREATE TABLE receiver_shipments (
  id BIGSERIAL PRIMARY KEY,
  tracking_id VARCHAR(20) UNIQUE NOT NULL,
  vendor_decl_id VARCHAR(20) NOT NULL REFERENCES vendor_shipments(vendor_decl_id),
  customer_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  dispatch_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipment updates table
CREATE TABLE shipment_updates (
  id BIGSERIAL PRIMARY KEY,
  tracking_id VARCHAR(20) NOT NULL REFERENCES receiver_shipments(tracking_id),
  status TEXT NOT NULL,
  location TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_vendor_shipments_vendor_decl_id ON vendor_shipments(vendor_decl_id);
CREATE INDEX idx_receiver_shipments_tracking_id ON receiver_shipments(tracking_id);
CREATE INDEX idx_receiver_shipments_vendor_decl_id ON receiver_shipments(vendor_decl_id);
CREATE INDEX idx_shipment_updates_tracking_id ON shipment_updates(tracking_id);
