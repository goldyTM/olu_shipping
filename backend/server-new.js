import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import adminRoutes from './adminRoutes.js';

// Import utility functions
import { generateVendorDeclId, generateTrackingId, generateVendorId } from './vendor/utils.js';
import { generateQRCode } from './vendor/qr-generator.js';
import { generateInvoicePDF, generatePackingListPDF } from './vendor/pdf-generator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set');
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '', {
  auth: {
    persistSession: false,
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ============================================================================
// VENDOR ROUTES
// ============================================================================

// Declare a new shipment
app.post('/api/vendor/declare', async (req, res) => {
  try {
    const vendorDeclId = generateVendorDeclId();
    const trackingId = generateTrackingId();
    const vendorId = req.body.vendorId || generateVendorId();
    const now = new Date();

    // Generate QR code
    const qrCodeUrl = await generateQRCode(vendorDeclId);

    // Generate PDFs
    const invoicePdfUrl = await generateInvoicePDF({
      vendorDeclId,
      itemName: req.body.itemName,
      quantity: req.body.quantity,
      weight: req.body.weight,
      consigneeName: req.body.consigneeName,
      consigneeAddress: req.body.consigneeAddress,
      date: now
    });

    const packingListPdfUrl = await generatePackingListPDF({
      vendorDeclId,
      itemName: req.body.itemName,
      quantity: req.body.quantity,
      weight: req.body.weight,
      consigneeName: req.body.consigneeName,
      date: now
    });

    // Store vendor shipment in Supabase
    const { data: vendorShipment, error: vendorError } = await supabase
      .from('vendor_shipments')
      .insert({
        vendor_decl_id: vendorDeclId,
        vendor_id: vendorId,
        item_name: req.body.itemName,
        quantity: req.body.quantity,
        weight: req.body.weight,
        consignee_name: req.body.consigneeName,
        consignee_address: req.body.consigneeAddress,
        consignee_email: req.body.consigneeEmail,
        consignee_phone: req.body.consigneePhone,
        hs_code: req.body.hsCode || null,
        qr_code_url: qrCodeUrl,
        invoice_pdf_url: invoicePdfUrl,
        packing_list_pdf_url: packingListPdfUrl
      })
      .select()
      .single();

    if (vendorError) {
      throw vendorError;
    }

    // Create corresponding receiver shipment record
    const { error: receiverError } = await supabase
      .from('receiver_shipments')
      .insert({
        tracking_id: trackingId,
        vendor_decl_id: vendorDeclId,
        customer_email: req.body.consigneeEmail,
        status: 'declared'
      });

    if (receiverError) {
      throw receiverError;
    }

    // Add initial shipment update
    const { error: updateError } = await supabase
      .from('shipment_updates')
      .insert({
        tracking_id: trackingId,
        status: 'declared',
        location: 'Origin - China',
        notes: 'Shipment declared by vendor'
      });

    if (updateError) {
      throw updateError;
    }

    res.json({
      vendorDeclId,
      trackingId,
      vendorId,
      qrCodeUrl,
      invoicePdfUrl,
      packingListPdfUrl
    });
  } catch (error) {
    console.error('Error creating shipment declaration:', error);
    res.status(500).json({ error: 'Failed to create shipment declaration' });
  }
});

// List all vendor shipments (with pagination)
app.get('/api/vendor/shipments', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const { data: shipments, error: shipmentsError, count } = await supabase
      .from('vendor_shipments')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (shipmentsError) {
      throw shipmentsError;
    }

    res.json({
      shipments: shipments || [],
      total: count || 0
    });
  } catch (error) {
    console.error('Error listing shipments:', error);
    res.status(500).json({ error: 'Failed to list shipments' });
  }
});

// List shipments for a specific vendor
app.get('/api/vendor/list', async (req, res) => {
  try {
    const { vendorId } = req.query;

    const { data: shipments, error } = await supabase
      .from('vendor_shipments')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(shipments || []);
  } catch (error) {
    console.error('Error listing vendor shipments:', error);
    res.status(500).json({ error: 'Failed to list vendor shipments' });
  }
});

// Get a specific shipment by vendor_decl_id
app.get('/api/vendor/get-shipment/:vendorDeclId', async (req, res) => {
  try {
    const { vendorDeclId } = req.params;

    const { data: shipment, error } = await supabase
      .from('vendor_shipments')
      .select('*')
      .eq('vendor_decl_id', vendorDeclId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Shipment not found' });
      }
      throw error;
    }

    res.json(shipment);
  } catch (error) {
    console.error('Error getting shipment:', error);
    res.status(500).json({ error: 'Failed to get shipment' });
  }
});

// Update a vendor shipment
app.put('/api/vendor/update-shipment/:vendorDeclId', async (req, res) => {
  try {
    const { vendorDeclId } = req.params;

    const { data: shipment, error } = await supabase
      .from('vendor_shipments')
      .update(req.body)
      .eq('vendor_decl_id', vendorDeclId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Shipment not found' });
      }
      throw error;
    }

    res.json(shipment);
  } catch (error) {
    console.error('Error updating shipment:', error);
    res.status(500).json({ error: 'Failed to update shipment' });
  }
});

// Delete a vendor shipment
app.delete('/api/vendor/delete-shipment/:vendorDeclId', async (req, res) => {
  try {
    const { vendorDeclId } = req.params;

    const { error } = await supabase
      .from('vendor_shipments')
      .delete()
      .eq('vendor_decl_id', vendorDeclId);

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    res.status(500).json({ error: 'Failed to delete shipment' });
  }
});

// Check shipment status by vendor_decl_id
app.get('/api/vendor/check-status/:vendorDeclId', async (req, res) => {
  try {
    const { vendorDeclId } = req.params;

    // Get tracking_id from receiver_shipments
    const { data: receiverShipment, error: receiverError } = await supabase
      .from('receiver_shipments')
      .select('status')
      .eq('vendor_decl_id', vendorDeclId)
      .single();

    if (receiverError) {
      if (receiverError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Shipment not found' });
      }
      throw receiverError;
    }

    res.json({ status: receiverShipment.status });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

// ============================================================================
// TRACKING ROUTES
// ============================================================================

// Track shipment by tracking ID
app.get('/api/tracking/track/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;

    // Get receiver shipment info
    const { data: receiverShipment, error: receiverError } = await supabase
      .from('receiver_shipments')
      .select('tracking_id, vendor_decl_id, customer_email, status, dispatch_date')
      .eq('tracking_id', trackingId)
      .single();

    if (receiverError) {
      if (receiverError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Tracking ID not found' });
      }
      throw receiverError;
    }

    // Get vendor shipment details
    const { data: vendorShipment, error: vendorError } = await supabase
      .from('vendor_shipments')
      .select('item_name, consignee_name, consignee_email')
      .eq('vendor_decl_id', receiverShipment.vendor_decl_id)
      .single();

    if (vendorError) {
      throw vendorError;
    }

    // Get all updates for this tracking ID
    const { data: updates, error: updatesError } = await supabase
      .from('shipment_updates')
      .select('*')
      .eq('tracking_id', trackingId)
      .order('timestamp', { ascending: true });

    if (updatesError) {
      throw updatesError;
    }

    res.json({
      trackingId: receiverShipment.tracking_id,
      vendorDeclId: receiverShipment.vendor_decl_id,
      status: receiverShipment.status,
      itemName: vendorShipment.item_name,
      consigneeName: vendorShipment.consignee_name,
      consigneeEmail: vendorShipment.consignee_email,
      dispatchDate: receiverShipment.dispatch_date,
      updates: updates || []
    });
  } catch (error) {
    console.error('Error tracking shipment:', error);
    res.status(500).json({ error: 'Failed to track shipment' });
  }
});

// Search shipment by QR code (vendor_decl_id)
app.get('/api/tracking/search-by-qr/:qrCode', async (req, res) => {
  try {
    const { qrCode } = req.params;

    // Get receiver shipment using vendor_decl_id (which is the QR code value)
    const { data: receiverShipment, error: receiverError } = await supabase
      .from('receiver_shipments')
      .select('tracking_id, vendor_decl_id, customer_email, status')
      .eq('vendor_decl_id', qrCode)
      .single();

    if (receiverError) {
      if (receiverError.code === 'PGRST116') {
        return res.status(404).json({ error: 'QR code not found' });
      }
      throw receiverError;
    }

    // Get vendor shipment details
    const { data: vendorShipment, error: vendorError } = await supabase
      .from('vendor_shipments')
      .select('*')
      .eq('vendor_decl_id', qrCode)
      .single();

    if (vendorError) {
      throw vendorError;
    }

    res.json({
      trackingId: receiverShipment.tracking_id,
      vendorDeclId: receiverShipment.vendor_decl_id,
      status: receiverShipment.status,
      shipment: vendorShipment
    });
  } catch (error) {
    console.error('Error searching by QR:', error);
    res.status(500).json({ error: 'Failed to search by QR code' });
  }
});

// Update shipment status
app.put('/api/tracking/update-status/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { status, location, notes } = req.body;

    // Update receiver shipment status
    const { error: updateError } = await supabase
      .from('receiver_shipments')
      .update({ status })
      .eq('tracking_id', trackingId);

    if (updateError) {
      throw updateError;
    }

    // Add shipment update entry
    const { data: updateEntry, error: insertError } = await supabase
      .from('shipment_updates')
      .insert({
        tracking_id: trackingId,
        status,
        location,
        notes
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    res.json(updateEntry);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

// Mount admin auth routes (protected by ADMIN_SECRET header)
app.use('/api/admin/auth', adminRoutes);

// Admin search across all shipments
app.post('/api/admin/search', async (req, res) => {
  try {
    const { query, type } = req.body;

    let supabaseQuery = supabase
      .from('vendor_shipments')
      .select(`
        id,
        vendor_decl_id,
        vendor_id,
        item_name,
        quantity,
        weight,
        consignee_name,
        consignee_address,
        consignee_email,
        consignee_phone,
        hs_code,
        qr_code_url,
        invoice_pdf_url,
        packing_list_pdf_url,
        created_at
      `);

    if (query) {
      switch (type) {
        case 'vendor_decl_id':
          supabaseQuery = supabaseQuery.ilike('vendor_decl_id', `%${query}%`);
          break;
        case 'vendor_id':
          supabaseQuery = supabaseQuery.ilike('vendor_id', `%${query}%`);
          break;
        case 'consignee_email':
          supabaseQuery = supabaseQuery.ilike('consignee_email', `%${query}%`);
          break;
        default:
          // Global search across all fields using or
          supabaseQuery = supabaseQuery.or(`vendor_decl_id.ilike.%${query}%,vendor_id.ilike.%${query}%,consignee_email.ilike.%${query}%,consignee_name.ilike.%${query}%,item_name.ilike.%${query}%`);
      }
    }

    const { data: vendorShipments, error: vendorError } = await supabaseQuery;

    if (vendorError) {
      throw vendorError;
    }

    // For each vendor shipment, get corresponding receiver shipment info
    const enrichedShipments = await Promise.all(
      (vendorShipments || []).map(async (vs) => {
        const { data: receiverShipment } = await supabase
          .from('receiver_shipments')
          .select('tracking_id, status, dispatch_date')
          .eq('vendor_decl_id', vs.vendor_decl_id)
          .single();

        return {
          ...vs,
          tracking_id: receiverShipment?.tracking_id || null,
          status: receiverShipment?.status || 'unknown',
          dispatch_date: receiverShipment?.dispatch_date || null
        };
      })
    );

    res.json({
      shipments: enrichedShipments,
      count: enrichedShipments.length
    });
  } catch (error) {
    console.error('Error searching shipments:', error);
    res.status(500).json({ error: 'Failed to search shipments' });
  }
});

// Admin update shipment
app.put('/api/admin/update-shipment/:vendorDeclId', async (req, res) => {
  try {
    const { vendorDeclId } = req.params;
    const updates = req.body;

    // Update vendor shipment
    const { data: vendorShipment, error: vendorError } = await supabase
      .from('vendor_shipments')
      .update(updates)
      .eq('vendor_decl_id', vendorDeclId)
      .select()
      .single();

    if (vendorError) {
      throw vendorError;
    }

    // If status is provided, update receiver shipment status
    if (updates.status) {
      const { error: receiverError } = await supabase
        .from('receiver_shipments')
        .update({ status: updates.status })
        .eq('vendor_decl_id', vendorDeclId);

      if (receiverError) {
        throw receiverError;
      }

      // Add status update entry
      const { data: receiverShipment } = await supabase
        .from('receiver_shipments')
        .select('tracking_id')
        .eq('vendor_decl_id', vendorDeclId)
        .single();

      if (receiverShipment) {
        await supabase
          .from('shipment_updates')
          .insert({
            tracking_id: receiverShipment.tracking_id,
            status: updates.status,
            location: updates.location || null,
            notes: updates.notes || 'Updated by admin'
          });
      }
    }

    res.json(vendorShipment);
  } catch (error) {
    console.error('Error updating shipment:', error);
    res.status(500).json({ error: 'Failed to update shipment' });
  }
});

// Admin delete shipment
app.delete('/api/admin/delete-shipment/:vendorDeclId', async (req, res) => {
  try {
    const { vendorDeclId } = req.params;

    // Delete from vendor_shipments (cascade should handle related records)
    const { error } = await supabase
      .from('vendor_shipments')
      .delete()
      .eq('vendor_decl_id', vendorDeclId);

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    res.status(500).json({ error: 'Failed to delete shipment' });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 Express + Supabase server running on http://localhost:${PORT}`);
  console.log(`📦 Encore has been removed - using direct Supabase integration`);
});
