import { api, APIError } from "encore.dev/api";
import { shippingDB } from "../db/db";
import { TrackingInfo, ShipmentUpdate } from "./types";

interface TrackShipmentParams {
  trackingId: string;
}

// Retrieves tracking information for a shipment by tracking ID.
export const track = api<TrackShipmentParams, TrackingInfo>(
  { expose: true, method: "GET", path: "/tracking/:trackingId" },
  async (req) => {
    // Get receiver shipment info
    const receiverShipment = await shippingDB.queryRow<{
      tracking_id: string;
      vendor_decl_id: string;
      customer_email: string;
      status: string;
      dispatch_date: Date | null;
    }>`
      SELECT tracking_id, vendor_decl_id, customer_email, status, dispatch_date
      FROM receiver_shipments 
      WHERE tracking_id = ${req.trackingId}
    `;

    if (!receiverShipment) {
      throw APIError.notFound("Tracking ID not found");
    }

    // Get vendor shipment details
    const vendorShipment = await shippingDB.queryRow<{
      item_name: string;
      consignee_name: string;
      consignee_email: string;
    }>`
      SELECT item_name, consignee_name, consignee_email
      FROM vendor_shipments 
      WHERE vendor_decl_id = ${receiverShipment.vendor_decl_id}
    `;

    if (!vendorShipment) {
      throw APIError.internal("Vendor shipment data not found");
    }

    // Get all updates for this tracking ID
    const updates = await shippingDB.queryAll<{
      id: number;
      tracking_id: string;
      status: string;
      location: string | null;
      timestamp: Date;
      notes: string | null;
    }>`
      SELECT id, tracking_id, status, location, timestamp, notes
      FROM shipment_updates 
      WHERE tracking_id = ${req.trackingId}
      ORDER BY timestamp DESC
    `;

    const formattedUpdates: ShipmentUpdate[] = updates.map(u => ({
      id: u.id,
      trackingId: u.tracking_id,
      status: u.status,
      location: u.location || undefined,
      timestamp: u.timestamp,
      notes: u.notes || undefined
    }));

    return {
      trackingId: receiverShipment.tracking_id,
      vendorDeclId: receiverShipment.vendor_decl_id,
      status: receiverShipment.status,
      itemName: vendorShipment.item_name,
      consigneeName: vendorShipment.consignee_name,
      consigneeEmail: vendorShipment.consignee_email,
      dispatchDate: receiverShipment.dispatch_date || undefined,
      updates: formattedUpdates
    };
  }
);
