import { api, APIError } from "encore.dev/api";
import { shippingDB } from "../db/db";
import { VendorShipment } from "./types";

interface GetShipmentParams {
  vendorDeclId: string;
}

// Retrieves a specific vendor shipment by declaration ID.
export const getShipment = api<GetShipmentParams, VendorShipment>(
  { expose: true, method: "GET", path: "/vendor/shipment/:vendorDeclId" },
  async (req) => {
    const shipment = await shippingDB.queryRow<{
      id: number;
      vendor_decl_id: string;
      vendor_id: string | null;
      item_name: string;
      quantity: number;
      weight: number;
      consignee_name: string;
      consignee_address: string;
      consignee_email: string;
      consignee_phone: string;
      hs_code: string | null;
      qr_code_url: string | null;
      invoice_pdf_url: string | null;
      packing_list_pdf_url: string | null;
      created_at: Date;
    }>`
      SELECT * FROM vendor_shipments WHERE vendor_decl_id = ${req.vendorDeclId}
    `;

    if (!shipment) {
      throw APIError.notFound("Shipment not found");
    }

    return {
      id: shipment.id,
      vendorDeclId: shipment.vendor_decl_id,
      vendorId: shipment.vendor_id || undefined,
      itemName: shipment.item_name,
      quantity: shipment.quantity,
      weight: shipment.weight,
      consigneeName: shipment.consignee_name,
      consigneeAddress: shipment.consignee_address,
      consigneeEmail: shipment.consignee_email,
      consigneePhone: shipment.consignee_phone,
      hsCode: shipment.hs_code || undefined,
      qrCodeUrl: shipment.qr_code_url || undefined,
      invoicePdfUrl: shipment.invoice_pdf_url || undefined,
      packingListPdfUrl: shipment.packing_list_pdf_url || undefined,
      createdAt: shipment.created_at
    };
  }
);
