import { api, APIError } from "encore.dev/api";
import { shippingDB } from "../db/db";
import { VendorShipmentDeclaration, DeclarationResponse } from "./types";
import { generateVendorDeclId, generateTrackingId, generateVendorId } from "./utils";
import { generateQRCode } from "./qr-generator";
import { generateInvoicePDF, generatePackingListPDF } from "./pdf-generator";

// Creates a new shipment declaration and generates all associated documents.
export const declare = api<VendorShipmentDeclaration, DeclarationResponse>(
  { expose: true, method: "POST", path: "/vendor/declare" },
  async (req) => {
    const vendorDeclId = generateVendorDeclId();
    const trackingId = generateTrackingId();
    const vendorId = req.vendorId || generateVendorId();
    const now = new Date();

    try {
      // Generate QR code
      const qrCodeUrl = await generateQRCode(vendorDeclId);

      // Generate PDFs
      const invoicePdfUrl = await generateInvoicePDF({
        vendorDeclId,
        itemName: req.itemName,
        quantity: req.quantity,
        weight: req.weight,
        consigneeName: req.consigneeName,
        consigneeAddress: req.consigneeAddress,
        date: now
      });

      const packingListPdfUrl = await generatePackingListPDF({
        vendorDeclId,
        itemName: req.itemName,
        quantity: req.quantity,
        weight: req.weight,
        consigneeName: req.consigneeName,
        date: now
      });

      // Store vendor shipment
      await shippingDB.exec`
        INSERT INTO vendor_shipments (
          vendor_decl_id, vendor_id, item_name, quantity, weight, consignee_name,
          consignee_address, consignee_email, consignee_phone, hs_code,
          qr_code_url, invoice_pdf_url, packing_list_pdf_url
        ) VALUES (
          ${vendorDeclId}, ${vendorId}, ${req.itemName}, ${req.quantity}, ${req.weight},
          ${req.consigneeName}, ${req.consigneeAddress}, ${req.consigneeEmail},
          ${req.consigneePhone}, ${req.hsCode || null}, ${qrCodeUrl},
          ${invoicePdfUrl}, ${packingListPdfUrl}
        )
      `;

      // Create corresponding receiver shipment record
      await shippingDB.exec`
        INSERT INTO receiver_shipments (tracking_id, vendor_decl_id, customer_email, status)
        VALUES (${trackingId}, ${vendorDeclId}, ${req.consigneeEmail}, 'declared')
      `;

      // Add initial shipment update
      await shippingDB.exec`
        INSERT INTO shipment_updates (tracking_id, status, location, notes)
        VALUES (${trackingId}, 'declared', 'Origin - China', 'Shipment declared by vendor')
      `;

      return {
        vendorDeclId,
        vendorId,
        qrCodeUrl,
        invoicePdfUrl,
        packingListPdfUrl
      };

    } catch (error) {
      console.error('Error creating shipment declaration:', error);
      throw APIError.internal("Failed to create shipment declaration");
    }
  }
);
