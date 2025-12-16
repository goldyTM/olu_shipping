import { api, APIError } from "encore.dev/api";
import { shippingDB } from "../db/db";
import { UpdateShipmentRequest } from "./types";

// Updates shipment details for admin workers.
export const updateShipment = api<UpdateShipmentRequest, void>(
  { expose: true, method: "PUT", path: "/admin/shipment" },
  async (req) => {
    // Verify shipment exists
    const existingShipment = await shippingDB.queryRow`
      SELECT vendor_decl_id FROM vendor_shipments WHERE vendor_decl_id = ${req.vendorDeclId}
    `;

    if (!existingShipment) {
      throw APIError.notFound("Shipment not found");
    }

    try {
      // Build dynamic update query
      const updateFields: string[] = [];
      const updateParams: any[] = [];
      let paramIndex = 1;

      if (req.itemName !== undefined) {
        updateFields.push(`item_name = $${paramIndex++}`);
        updateParams.push(req.itemName);
      }
      if (req.quantity !== undefined) {
        updateFields.push(`quantity = $${paramIndex++}`);
        updateParams.push(req.quantity);
      }
      if (req.weight !== undefined) {
        updateFields.push(`weight = $${paramIndex++}`);
        updateParams.push(req.weight);
      }
      if (req.consigneeName !== undefined) {
        updateFields.push(`consignee_name = $${paramIndex++}`);
        updateParams.push(req.consigneeName);
      }
      if (req.consigneeAddress !== undefined) {
        updateFields.push(`consignee_address = $${paramIndex++}`);
        updateParams.push(req.consigneeAddress);
      }
      if (req.consigneeEmail !== undefined) {
        updateFields.push(`consignee_email = $${paramIndex++}`);
        updateParams.push(req.consigneeEmail);
      }
      if (req.consigneePhone !== undefined) {
        updateFields.push(`consignee_phone = $${paramIndex++}`);
        updateParams.push(req.consigneePhone);
      }
      if (req.hsCode !== undefined) {
        updateFields.push(`hs_code = $${paramIndex++}`);
        updateParams.push(req.hsCode);
      }

      if (updateFields.length === 0) {
        throw APIError.invalidArgument("No fields to update");
      }

      const query = `
        UPDATE vendor_shipments 
        SET ${updateFields.join(', ')}
        WHERE vendor_decl_id = $${paramIndex}
      `;
      updateParams.push(req.vendorDeclId);

      await shippingDB.rawExec(query, ...updateParams);

      // If email was updated, update receiver shipments as well
      if (req.consigneeEmail !== undefined) {
        await shippingDB.exec`
          UPDATE receiver_shipments 
          SET customer_email = ${req.consigneeEmail}
          WHERE vendor_decl_id = ${req.vendorDeclId}
        `;
      }

    } catch (error) {
      console.error('Error updating shipment:', error);
      throw APIError.internal("Failed to update shipment");
    }
  }
);
