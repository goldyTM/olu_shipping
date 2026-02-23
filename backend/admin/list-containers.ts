import { api } from "encore.dev/api";
import { shippingDB } from "../db/db";
import { ContainerInfo } from "./types";

// Lists all containers with shipment count
export const listContainers = api<{}, ContainerInfo[]>(
  { expose: true, method: "GET", path: "/admin/containers" },
  async () => {
    const containers = await shippingDB.query`
      SELECT c.id, c.container_name, c.status, c.created_at, c.updated_at,
             COUNT(rs.id) as shipment_count
      FROM containers c
      LEFT JOIN receiver_shipments rs ON c.id = rs.container_id
      GROUP BY c.id, c.container_name, c.status, c.created_at, c.updated_at
      ORDER BY c.created_at DESC
    `;

    return containers.map(c => ({
      id: c.id,
      containerName: c.container_name,
      status: c.status,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      shipmentCount: parseInt(c.shipment_count),
    }));
  }
);