export interface ShipmentUpdate {
  id: number;
  trackingId: string;
  status: string;
  location?: string;
  timestamp: Date;
  notes?: string;
}

export interface ReceiverShipment {
  id: number;
  trackingId: string;
  vendorDeclId: string;
  customerEmail: string;
  status: string;
  dispatchDate?: Date;
  createdAt: Date;
}

export interface TrackingInfo {
  trackingId: string;
  vendorDeclId: string;
  status: string;
  itemName: string;
  consigneeName: string;
  consigneeEmail: string;
  dispatchDate?: Date;
  updates: ShipmentUpdate[];
}

export interface UpdateStatusRequest {
  trackingId: string;
  status: string;
  location?: string;
  notes?: string;
}
