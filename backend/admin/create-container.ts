import { api } from "encore.dev/api";
import { shippingDB } from "../db/db";
import { CreateContainerRequest, ContainerInfo } from "./types";

// Creates a new container
export const createContainer = api<CreateContainerRequest, ContainerInfo>(
  { expose: true, method: "POST", path: "/admin/container" },
  async (req) => {
    const result = await shippingDB.queryRow`
      INSERT INTO containers (container_name, status)
      VALUES (${req.containerName}, 'empty')
      RETURNING id, container_name, status, created_at, updated_at
    `;

    return {
      id: result.id,
      containerName: result.container_name,
      status: result.status,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }
);