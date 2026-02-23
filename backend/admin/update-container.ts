import { api, APIError } from "encore.dev/api";
import { shippingDB } from "../db/db";
import { UpdateContainerRequest, ContainerInfo } from "./types";

// Updates container details and cascades status to shipments
export const updateContainer = api<UpdateContainerRequest, ContainerInfo>(
  { expose: true, method: "PUT", path: "/admin/container" },
  async (req) => {
    // Verify container exists
    const existing = await shippingDB.queryRow`
      SELECT id FROM containers WHERE id = ${req.id}
    `;

    if (!existing) {
      throw APIError.notFound("Container not found");
    }

    // Build update query
    const updateFields: string[] = [];
    const updateParams: any[] = [];
    let paramIndex = 1;

    if (req.containerName !== undefined) {
      updateFields.push(`container_name = $${paramIndex++}`);
      updateParams.push(req.containerName);
    }
    if (req.status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      updateParams.push(req.status);
    }

    updateFields.push(`updated_at = NOW()`);

    const updateQuery = `
      UPDATE containers
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, container_name, status, created_at, updated_at
    `;
    updateParams.push(req.id);

    const result = await shippingDB.queryRow(updateQuery, updateParams);

    // If status changed, update all shipments in this container
    if (req.status !== undefined) {
      await shippingDB.exec`
        UPDATE receiver_shipments
        SET status = ${req.status}
        WHERE container_id = ${req.id}
      `;

      // Also add shipment updates for tracking
      const shipments = await shippingDB.query`
        SELECT tracking_id FROM receiver_shipments WHERE container_id = ${req.id}
      `;

      for (const shipment of shipments) {
        await shippingDB.exec`
          INSERT INTO shipment_updates (tracking_id, status, notes)
          VALUES (${shipment.tracking_id}, ${req.status}, 'Status updated via container')
        `;
      }
    }

    return {
      id: result.id,
      containerName: result.container_name,
      status: result.status,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }
);