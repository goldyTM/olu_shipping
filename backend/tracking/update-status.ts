import { api, APIError } from "encore.dev/api";
import { shippingDB } from "../db/db";
import { UpdateStatusRequest } from "./types";

// Updates the status of a shipment and adds a new tracking update.
export const updateStatus = api<UpdateStatusRequest, void>(
  { expose: true, method: "POST", path: "/tracking/update-status" },
  async (req) => {
    // Verify tracking ID exists
    const existingShipment = await shippingDB.queryRow`
      SELECT tracking_id FROM receiver_shipments WHERE tracking_id = ${req.trackingId}
    `;

    if (!existingShipment) {
      throw APIError.notFound("Tracking ID not found");
    }

    try {
      // Update the main status in receiver_shipments
      await shippingDB.exec`
        UPDATE receiver_shipments 
        SET status = ${req.status}
        WHERE tracking_id = ${req.trackingId}
      `;

      // Add new tracking update
      await shippingDB.exec`
        INSERT INTO shipment_updates (tracking_id, status, location, notes)
        VALUES (${req.trackingId}, ${req.status}, ${req.location || null}, ${req.notes || null})
      `;

      // If status is 'dispatched', update dispatch_date
      if (req.status === 'dispatched') {
        await shippingDB.exec`
          UPDATE receiver_shipments 
          SET dispatch_date = NOW()
          WHERE tracking_id = ${req.trackingId}
        `;
      }

    } catch (error) {
      console.error('Error updating shipment status:', error);
      throw APIError.internal("Failed to update shipment status");
    }
  }
);
