import { api, APIError } from "encore.dev/api";
import { shippingDB } from "../db/db";

interface SearchByQRParams {
  qrCode: string;
}

interface SearchByQRResponse {
  trackingId: string;
  vendorDeclId: string;
}

// Finds tracking ID by QR code content or vendor declaration ID.
export const searchByQR = api<SearchByQRParams, SearchByQRResponse>(
  { expose: true, method: "POST", path: "/tracking/search-qr" },
  async (req) => {
    // Extract vendor declaration ID from QR code content
    let vendorDeclId = req.qrCode;
    
    // If QR code contains our prefix, extract the vendor decl ID
    if (req.qrCode.startsWith('OLU-SHIPPING:')) {
      vendorDeclId = req.qrCode.replace('OLU-SHIPPING:', '');
    }

    // Find the tracking ID for this vendor declaration ID
    const result = await shippingDB.queryRow<{
      tracking_id: string;
      vendor_decl_id: string;
    }>`
      SELECT tracking_id, vendor_decl_id
      FROM receiver_shipments 
      WHERE vendor_decl_id = ${vendorDeclId}
    `;

    if (!result) {
      throw APIError.notFound("No shipment found for this QR code");
    }

    return {
      trackingId: result.tracking_id,
      vendorDeclId: result.vendor_decl_id
    };
  }
);
