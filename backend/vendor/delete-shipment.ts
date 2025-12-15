import { api, APIError } from "encore.dev/api";
import { shippingDB } from "../db/db";

interface DeleteVendorShipmentRequest {
  vendorDeclId: string;
}

// Deletes a vendor shipment declaration and all related records.
export const deleteShipment = api<DeleteVendorShipmentRequest, void>(
  { expose: true, method: "DELETE", path: "/vendor/shipment/:vendorDeclId" },
  async (req) => {
    // Verify shipment exists
    const existingShipment = await shippingDB.queryRow`
      SELECT vendor_decl_id FROM vendor_shipments WHERE vendor_decl_id = ${req.vendorDeclId}
    `;

    if (!existingShipment) {
      throw APIError.notFound("Shipment not found");
    }

    try {
      // Get tracking ID for deletion cascade
      const receiverShipment = await shippingDB.queryRow<{ tracking_id: string }>`
        SELECT tracking_id FROM receiver_shipments WHERE vendor_decl_id = ${req.vendorDeclId}
      `;

      if (receiverShipment) {
        // Delete shipment updates first (foreign key constraint)
        await shippingDB.exec`
          DELETE FROM shipment_updates WHERE tracking_id = ${receiverShipment.tracking_id}
        `;

        // Delete receiver shipment
        await shippingDB.exec`
          DELETE FROM receiver_shipments WHERE vendor_decl_id = ${req.vendorDeclId}
        `;
      }

      // Delete vendor shipment
      await shippingDB.exec`
        DELETE FROM vendor_shipments WHERE vendor_decl_id = ${req.vendorDeclId}
      `;

    } catch (error) {
      console.error('Error deleting vendor shipment:', error);
      throw APIError.internal("Failed to delete shipment");
    }
  }
);
