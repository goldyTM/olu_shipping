import { api } from "encore.dev/api";
import { shippingDB } from "../db/db";
import { AdminSearchRequest, AdminSearchResponse, AdminShipmentInfo } from "./types";

// Searches for shipments across all criteria for admin workers.
export const search = api<AdminSearchRequest, AdminSearchResponse>(
  { expose: true, method: "POST", path: "/admin/search" },
  async (req) => {
    let whereClause = '';
    let params: any[] = [];

    switch (req.type) {
      case 'vendor_decl_id':
        whereClause = 'WHERE vs.vendor_decl_id ILIKE $1';
        params = [`%${req.query}%`];
        break;
      case 'tracking_id':
        whereClause = 'WHERE rs.tracking_id ILIKE $1';
        params = [`%${req.query}%`];
        break;
      case 'vendor_id':
        whereClause = 'WHERE vs.vendor_id ILIKE $1';
        params = [`%${req.query}%`];
        break;
      case 'consignee_email':
        whereClause = 'WHERE vs.consignee_email ILIKE $1';
        params = [`%${req.query}%`];
        break;
      default:
        // Global search across all fields
        whereClause = `WHERE vs.vendor_decl_id ILIKE $1 
                      OR rs.tracking_id ILIKE $1 
                      OR vs.vendor_id ILIKE $1 
                      OR vs.consignee_email ILIKE $1
                      OR vs.consignee_name ILIKE $1
                      OR vs.item_name ILIKE $1`;
        params = [`%${req.query}%`];
    }

    const query = `
      SELECT 
        vs.id,
        vs.vendor_decl_id,
        vs.vendor_id,
        rs.tracking_id,
        vs.item_name,
        vs.quantity,
        vs.weight,
        vs.consignee_name,
        vs.consignee_address,
        vs.consignee_email,
        vs.consignee_phone,
        vs.hs_code,
        rs.status,
        rs.dispatch_date,
        vs.created_at,
        vs.qr_code_url,
        vs.invoice_pdf_url,
        vs.packing_list_pdf_url
      FROM vendor_shipments vs
      JOIN receiver_shipments rs ON vs.vendor_decl_id = rs.vendor_decl_id
      ${whereClause}
      ORDER BY vs.created_at DESC
      LIMIT 100
    `;

    const shipments = await shippingDB.rawQueryAll<{
      id: number;
      vendor_decl_id: string;
      vendor_id: string | null;
      tracking_id: string;
      item_name: string;
      quantity: number;
      weight: number;
      consignee_name: string;
      consignee_address: string;
      consignee_email: string;
      consignee_phone: string;
      hs_code: string | null;
      status: string;
      dispatch_date: Date | null;
      created_at: Date;
      qr_code_url: string | null;
      invoice_pdf_url: string | null;
      packing_list_pdf_url: string | null;
    }>(query, ...params);

    const formattedShipments: AdminShipmentInfo[] = shipments.map(s => ({
      id: s.id,
      vendorDeclId: s.vendor_decl_id,
      vendorId: s.vendor_id || undefined,
      trackingId: s.tracking_id,
      itemName: s.item_name,
      quantity: s.quantity,
      weight: s.weight,
      consigneeName: s.consignee_name,
      consigneeAddress: s.consignee_address,
      consigneeEmail: s.consignee_email,
      consigneePhone: s.consignee_phone,
      hsCode: s.hs_code || undefined,
      status: s.status,
      dispatchDate: s.dispatch_date || undefined,
      createdAt: s.created_at,
      qrCodeUrl: s.qr_code_url || undefined,
      invoicePdfUrl: s.invoice_pdf_url || undefined,
      packingListPdfUrl: s.packing_list_pdf_url || undefined,
    }));

    return {
      shipments: formattedShipments,
      total: formattedShipments.length
    };
  }
);
