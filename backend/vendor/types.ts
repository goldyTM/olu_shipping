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
  vendorDeclId: string;
  vendorId?: string;
  itemName: string;
  quantity: number;
  weight: number;
  consigneeName: string;
  consigneeAddress: string;
  consigneeEmail: string;
  consigneePhone: string;
  hsCode?: string;
  qrCodeUrl?: string;
  invoicePdfUrl?: string;
  packingListPdfUrl?: string;
  createdAt: Date;
}

export interface DeclarationResponse {
  vendorDeclId: string;
  vendorId: string;
  qrCodeUrl: string;
  invoicePdfUrl: string;
  packingListPdfUrl: string;
}
