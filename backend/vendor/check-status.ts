import { api, APIError } from "encore.dev/api";
import { shippingDB } from "../db/db";

interface CheckStatusParams {
  vendorId: string;
}

interface VendorStatusInfo {
  vendorId: string;
  vendorDeclId: string;
  trackingId: string;
  status: string;
  itemName: string;
  consigneeName: string;
  received: boolean;
  inTransit: boolean;
  createdAt: Date;
}

interface CheckStatusResponse {
  shipments: VendorStatusInfo[];
}

// Checks the status of shipments by vendor ID.
export const checkStatus = api<CheckStatusParams, CheckStatusResponse>(
  { expose: true, method: "GET", path: "/vendor/status/:vendorId" },
  async (req) => {
    // Get all shipments for this vendor ID
    const shipments = await shippingDB.queryAll<{
      vendor_decl_id: string;
      vendor_id: string;
      item_name: string;
      consignee_name: string;
      created_at: Date;
    }>`
      SELECT vendor_decl_id, vendor_id, item_name, consignee_name, created_at
      FROM vendor_shipments 
      WHERE vendor_id = ${req.vendorId}
      ORDER BY created_at DESC
    `;

    if (shipments.length === 0) {
      throw APIError.notFound("No shipments found for this vendor ID");
    }

    const statusInfo: VendorStatusInfo[] = [];

    for (const shipment of shipments) {
      // Get receiver shipment info
      const receiverShipment = await shippingDB.queryRow<{
        tracking_id: string;
        status: string;
      }>`
        SELECT tracking_id, status
        FROM receiver_shipments 
        WHERE vendor_decl_id = ${shipment.vendor_decl_id}
      `;

      if (receiverShipment) {
        const received = receiverShipment.status !== 'declared';
        const inTransit = ['dispatched', 'in_transit', 'customs', 'out_for_delivery'].includes(receiverShipment.status);

        statusInfo.push({
          vendorId: shipment.vendor_id,
          vendorDeclId: shipment.vendor_decl_id,
          trackingId: receiverShipment.tracking_id,
          status: receiverShipment.status,
          itemName: shipment.item_name,
          consigneeName: shipment.consignee_name,
          received,
          inTransit,
          createdAt: shipment.created_at
        });
      }
    }

    return {
      shipments: statusInfo
    };
  }
);
