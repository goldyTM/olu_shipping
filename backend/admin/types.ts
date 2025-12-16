export interface AdminSearchRequest {
  query: string;
  type: 'vendor_decl_id' | 'tracking_id' | 'vendor_id' | 'consignee_email';
}

export interface AdminShipmentInfo {
  id: number;
  vendorDeclId: string;
  vendorId?: string;
  trackingId: string;
  itemName: string;
  quantity: number;
  weight: number;
  consigneeName: string;
  consigneeAddress: string;
  consigneeEmail: string;
  consigneePhone: string;
  hsCode?: string;
  status: string;
  dispatchDate?: Date;
  createdAt: Date;
  qrCodeUrl?: string;
  invoicePdfUrl?: string;
  packingListPdfUrl?: string;
}

export interface UpdateShipmentRequest {
  vendorDeclId: string;
  itemName?: string;
  quantity?: number;
  weight?: number;
  consigneeName?: string;
  consigneeAddress?: string;
  consigneeEmail?: string;
  consigneePhone?: string;
  hsCode?: string;
}

export interface AdminSearchResponse {
  shipments: AdminShipmentInfo[];
  total: number;
}
