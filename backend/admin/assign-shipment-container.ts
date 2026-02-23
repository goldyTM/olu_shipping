import { api, APIError } from "encore.dev/api";
import { shippingDB } from "../db/db";
import { AssignShipmentToContainerRequest } from "./types";

// Assigns or removes a shipment from a container
export const assignShipmentToContainer = api<AssignShipmentToContainerRequest, void>(
  { expose: true, method: "PUT", path: "/admin/shipment/container" },
  async (req) => {
    // Verify shipment exists
    const existing = await shippingDB.queryRow`
      SELECT tracking_id FROM receiver_shipments WHERE tracking_id = ${req.trackingId}
    `;

    if (!existing) {
      throw APIError.notFound("Shipment not found");
    }

    // If assigning to container, verify container exists
    if (req.containerId !== null) {
      const container = await shippingDB.queryRow`
        SELECT id FROM containers WHERE id = ${req.containerId}
      `;

      if (!container) {
        throw APIError.notFound("Container not found");
      }
    }

    // Update the shipment
    await shippingDB.exec`
      UPDATE receiver_shipments
      SET container_id = ${req.containerId}
      WHERE tracking_id = ${req.trackingId}
    `;

    // Add a shipment update note
    const action = req.containerId ? `Assigned to container ${req.containerId}` : 'Removed from container';
    await shippingDB.exec`
      INSERT INTO shipment_updates (tracking_id, status, notes)
      SELECT tracking_id, status, ${action}
      FROM receiver_shipments
      WHERE tracking_id = ${req.trackingId}
    `;
  }
);