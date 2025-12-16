// Shared types for API responses matching database schema

export interface VendorShipmentDeclaration {
  itemName: string;
  quantity: number;
  weight: number;
  consigneeName: string;
  consigneeAddress: string;
  consigneeEmail: string;
  consigneePhone: string;
  hsCode?: string;
  vendorId?: string;
}

export interface VendorShipment {
  id: number;
  vendor_decl_id: string;
  vendor_id?: string;
  item_name: string;
  quantity: number;
  weight: number;
  consignee_name: string;
  consignee_address: string;
  consignee_email: string;
  consignee_phone: string;
  hs_code?: string;
  qr_code_url?: string;
  invoice_pdf_url?: string;
  packing_list_pdf_url?: string;
  created_at: Date | string;
  tracking_id?: string;
}

export interface AdminShipmentInfo extends VendorShipment {
  // Admin view includes all vendor fields
}

export interface TrackingInfo {
  id: number;
  vendor_decl_id: string;
  tracking_id?: string;
  status: string;
  location?: string;
  updated_at: Date | string;
}
