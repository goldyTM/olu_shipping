import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { shippingDB } from "../db/db";
import { VendorShipment } from "./types";

interface ListShipmentsParams {
  limit?: Query<number>;
  offset?: Query<number>;
}

interface ListShipmentsResponse {
  shipments: VendorShipment[];
  total: number;
}

// Retrieves all vendor shipments with pagination.
export const list = api<ListShipmentsParams, ListShipmentsResponse>(
  { expose: true, method: "GET", path: "/vendor/shipments" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    const shipments = await shippingDB.queryAll<{
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
      SELECT * FROM vendor_shipments 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalResult = await shippingDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM vendor_shipments
    `;

    const total = totalResult?.count || 0;

    const formattedShipments: VendorShipment[] = shipments.map(s => ({
      id: s.id,
      vendorDeclId: s.vendor_decl_id,
      vendorId: s.vendor_id || undefined,
      itemName: s.item_name,
      quantity: s.quantity,
      weight: s.weight,
      consigneeName: s.consignee_name,
      consigneeAddress: s.consignee_address,
      consigneeEmail: s.consignee_email,
      consigneePhone: s.consignee_phone,
      hsCode: s.hs_code || undefined,
      qrCodeUrl: s.qr_code_url || undefined,
      invoicePdfUrl: s.invoice_pdf_url || undefined,
      packingListPdfUrl: s.packing_list_pdf_url || undefined,
      createdAt: s.created_at
    }));

    return {
      shipments: formattedShipments,
      total
    };
  }
);
