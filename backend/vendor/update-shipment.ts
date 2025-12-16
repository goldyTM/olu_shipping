import { api, APIError } from "encore.dev/api";
import { shippingDB } from "../db/db";
import { VendorShipmentDeclaration } from "./types";

interface UpdateVendorShipmentRequest extends VendorShipmentDeclaration {
  vendorDeclId: string;
}

// Updates a vendor shipment declaration.
export const updateShipment = api<UpdateVendorShipmentRequest, void>(
  { expose: true, method: "PUT", path: "/vendor/shipment" },
  async (req) => {
    // Verify shipment exists
    const existingShipment = await shippingDB.queryRow`
      SELECT vendor_decl_id FROM vendor_shipments WHERE vendor_decl_id = ${req.vendorDeclId}
    `;

    if (!existingShipment) {
      throw APIError.notFound("Shipment not found");
    }

    try {
      // Update vendor shipment
      await shippingDB.exec`
        UPDATE vendor_shipments 
        SET 
          item_name = ${req.itemName},
          quantity = ${req.quantity},
          weight = ${req.weight},
          consignee_name = ${req.consigneeName},
          consignee_address = ${req.consigneeAddress},
          consignee_email = ${req.consigneeEmail},
          consignee_phone = ${req.consigneePhone},
          hs_code = ${req.hsCode || null}
        WHERE vendor_decl_id = ${req.vendorDeclId}
      `;

      // Update receiver shipment email if changed
      await shippingDB.exec`
        UPDATE receiver_shipments 
        SET customer_email = ${req.consigneeEmail}
        WHERE vendor_decl_id = ${req.vendorDeclId}
      `;

    } catch (error) {
      console.error('Error updating vendor shipment:', error);
      throw APIError.internal("Failed to update shipment");
    }
  }
);
