import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import adminRoutes from './adminRoutes.js';
import { supabaseAdmin } from './supabaseClient.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Mount admin auth routes (protected by ADMIN_SECRET header)
app.use('/api/admin/auth', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Helper function to generate unique vendor declaration ID
async function generateUniqueVendorDeclId() {
  const year = new Date().getFullYear();
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const vendorDeclId = `VD-${year}-${random}`;
    
    // Check if this ID already exists
    const { data, error } = await supabaseAdmin
      .from('vendor_shipments')
      .select('vendor_decl_id')
      .eq('vendor_decl_id', vendorDeclId)
      .single();
    
    // If no data found (error is "PGRST116"), the ID is unique
    if (error && error.code === 'PGRST116') {
      return vendorDeclId;
    }
    
    attempts++;
  }
  
  // Fallback to timestamp-based ID if all random attempts fail
  return `VD-${year}-${Date.now()}`;
}

// Vendor routes
app.post('/api/vendor/declare', async (req, res) => {
  try {
    // Generate unique vendor declaration ID
    const vendorDeclId = await generateUniqueVendorDeclId();
    
    const { data, error } = await supabaseAdmin
      .from('vendor_shipments')
      .insert([{
        vendor_decl_id: vendorDeclId,
        item_name: req.body.itemName,
        quantity: req.body.quantity,
        weight: req.body.weight,
        consignee_name: req.body.consigneeName,
        consignee_address: req.body.consigneeAddress,
        consignee_email: req.body.consigneeEmail,
        consignee_phone: req.body.consigneePhone,
        hs_code: req.body.hsCode,
        vendor_id: req.body.vendorId || null,
        user_id: req.body.userId || null // Store the authenticated user's ID
      }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error declaring shipment:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vendor/list', async (req, res) => {
  try {
    const { vendorId } = req.query;
    let query = supabaseAdmin.from('vendor_shipments').select('*');
    
    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error listing shipments:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vendor/shipments', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const userId = req.query.userId; // User ID from frontend (auth.user.id)

    // Build query
    let query = supabaseAdmin
      .from('vendor_shipments')
      .select(`
        *,
        receiver_shipments!vendor_decl_id (
          tracking_id
        )
      `);
    
    // Filter by user_id if provided: show declarations that belong to this user OR have no user_id (legacy)
    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }
    
    const { data: shipments, error: shipmentsError } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (shipmentsError) throw shipmentsError;

    // Flatten the data structure to include tracking_id at root level
    const formattedShipments = shipments?.map(shipment => ({
      ...shipment,
      tracking_id: shipment.receiver_shipments?.[0]?.tracking_id || null,
      receiver_shipments: undefined // Remove nested object
    })) || [];

    const { count, error: countError } = await supabaseAdmin
      .from('vendor_shipments')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    res.json({
      shipments: formattedShipments,
      total: count || 0
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vendor/get-shipment/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('vendor_shipments')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(404).json({ error: 'Shipment not found' });
  }
});

app.put('/api/vendor/update-shipment/:id', async (req, res) => {
  try {
    const updateData = {};
    if (req.body.itemName) updateData.item_name = req.body.itemName;
    if (req.body.quantity) updateData.quantity = req.body.quantity;
    if (req.body.weight) updateData.weight = req.body.weight;
    if (req.body.consigneeName) updateData.consignee_name = req.body.consigneeName;
    if (req.body.consigneeAddress) updateData.consignee_address = req.body.consigneeAddress;
    if (req.body.consigneeEmail) updateData.consignee_email = req.body.consigneeEmail;
    if (req.body.consigneePhone) updateData.consignee_phone = req.body.consigneePhone;
    if (req.body.hsCode) updateData.hs_code = req.body.hsCode;

    const { data, error } = await supabaseAdmin
      .from('vendor_shipments')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error updating shipment:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/vendor/delete-shipment/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('vendor_shipments')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vendor/check-status/:id', async (req, res) => {
  try {
    const { data: tracking, error } = await supabaseAdmin
      .from('shipment_tracking')
      .select('status')
      .eq('vendor_decl_id', req.params.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json({ status: tracking?.status || 'unknown' });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin routes
app.get('/api/admin/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    // Join with receiver_shipments to get tracking_id
    let dbQuery = supabaseAdmin
      .from('vendor_shipments')
      .select(`
        *,
        receiver_shipments!vendor_decl_id (
          tracking_id
        )
      `);
    
    if (query) {
      // Search in vendor_shipments fields
      dbQuery = dbQuery.or(`vendor_decl_id.ilike.%${query}%,item_name.ilike.%${query}%,consignee_name.ilike.%${query}%,consignee_email.ilike.%${query}%,vendor_id.ilike.%${query}%`);
    }
    
    const { data, error } = await dbQuery.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Flatten the data structure and filter by tracking_id if needed
    let formattedData = data?.map(shipment => ({
      ...shipment,
      tracking_id: shipment.receiver_shipments?.[0]?.tracking_id || null,
      receiver_shipments: undefined
    })) || [];
    
    // If query provided, also filter by tracking_id (case-insensitive)
    if (query) {
      formattedData = formattedData.filter(shipment => 
        shipment.vendor_decl_id?.toLowerCase().includes(query.toLowerCase()) ||
        shipment.item_name?.toLowerCase().includes(query.toLowerCase()) ||
        shipment.consignee_name?.toLowerCase().includes(query.toLowerCase()) ||
        shipment.consignee_email?.toLowerCase().includes(query.toLowerCase()) ||
        shipment.vendor_id?.toLowerCase().includes(query.toLowerCase()) ||
        shipment.tracking_id?.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    res.json(formattedData);
  } catch (error) {
    console.error('Error searching shipments:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/update-shipment/:id', async (req, res) => {
  try {
    const updateData = {};
    if (req.body.itemName) updateData.item_name = req.body.itemName;
    if (req.body.quantity) updateData.quantity = req.body.quantity;
    if (req.body.weight) updateData.weight = req.body.weight;
    if (req.body.consigneeName) updateData.consignee_name = req.body.consigneeName;
    if (req.body.consigneeAddress) updateData.consignee_address = req.body.consigneeAddress;
    if (req.body.consigneeEmail) updateData.consignee_email = req.body.consigneeEmail;
    if (req.body.consigneePhone) updateData.consignee_phone = req.body.consigneePhone;
    if (req.body.hsCode) updateData.hs_code = req.body.hsCode;

    const { data, error } = await supabaseAdmin
      .from('vendor_shipments')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    // If status is provided, update tracking
    if (req.body.status) {
      await supabaseAdmin
        .from('shipment_tracking')
        .upsert({
          vendor_decl_id: data.vendor_decl_id,
          status: req.body.status,
          location: req.body.currentLocation,
          updated_at: new Date().toISOString()
        });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error updating shipment:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/delete-shipment/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('vendor_shipments')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin dispatch shipment - creates receiver_shipment with tracking_id
app.post('/api/admin/dispatch', async (req, res) => {
  try {
    const { vendor_decl_id, customer_email } = req.body;
    
    // Check if already dispatched
    const { data: existing } = await supabaseAdmin
      .from('receiver_shipments')
      .select('tracking_id')
      .eq('vendor_decl_id', vendor_decl_id)
      .single();
    
    if (existing) {
      return res.status(400).json({ error: 'Shipment already dispatched', tracking_id: existing.tracking_id });
    }
    
    // Create receiver shipment (tracking_id will be auto-generated by database trigger)
    const { data, error } = await supabaseAdmin
      .from('receiver_shipments')
      .insert([{
        vendor_decl_id,
        customer_email,
        status: 'pending',
        dispatch_date: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Update vendor_shipments with the tracking_id so vendors can track their shipments
    if (data.tracking_id) {
      await supabaseAdmin
        .from('vendor_shipments')
        .update({ tracking_id: data.tracking_id })
        .eq('vendor_decl_id', vendor_decl_id);
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error dispatching shipment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin update shipment status
app.post('/api/admin/update-status', async (req, res) => {
  try {
    const { tracking_id, status, location, notes } = req.body;
    
    // Update receiver_shipment status
    const { error: updateError } = await supabaseAdmin
      .from('receiver_shipments')
      .update({ status })
      .eq('tracking_id', tracking_id);
    
    if (updateError) throw updateError;
    
    // Add status update entry
    const { data, error } = await supabaseAdmin
      .from('shipment_updates')
      .insert([{
        tracking_id,
        status,
        location: location || null,
        notes: notes || null
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error updating shipment status:', error);
    res.status(500).json({ error: error.message });
  }
});


// Tracking routes
app.get('/api/tracking/track/:trackingNumber', async (req, res) => {
  try {
    const trackingInput = req.params.trackingNumber;
    
    // Determine if input is tracking_id (TRK-) or vendor_decl_id (VD-)
    let query = supabaseAdmin
      .from('receiver_shipments')
      .select(`
        *,
        vendor_shipments!vendor_decl_id (
          item_name,
          quantity,
          weight,
          consignee_name,
          consignee_address,
          consignee_email,
          consignee_phone,
          created_at
        ),
        shipment_updates (
          status,
          location,
          notes,
          timestamp
        )
      `);
    
    // Search by tracking_id (TRK-) or vendor_decl_id (VD-)
    if (trackingInput.startsWith('TRK-')) {
      query = query.eq('tracking_id', trackingInput);
    } else if (trackingInput.startsWith('VD-')) {
      query = query.eq('vendor_decl_id', trackingInput);
    } else {
      // Try tracking_id first, fallback to vendor_decl_id
      query = query.eq('tracking_id', trackingInput);
    }
    
    const { data: receiverShipment, error } = await query.single();

    if (error || !receiverShipment) {
      return res.status(404).json({ 
        error: 'Shipment not found or not yet dispatched',
        message: trackingInput.startsWith('VD-') 
          ? 'This shipment has not been dispatched yet. Please wait for the shipping company to assign a tracking ID.'
          : 'Unable to find shipment with this tracking ID. Please check the ID and try again.'
      });
    }
    
    const vendorDetails = receiverShipment.vendor_shipments || {};
    const updates = receiverShipment.shipment_updates || [];
    
    // Sort updates by timestamp ascending (oldest first for timeline progression)
    // Frontend will display in order: pending -> processing -> in_transit -> delivered
    updates.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json({
      trackingId: receiverShipment.tracking_id,
      vendorDeclId: receiverShipment.vendor_decl_id,
      itemName: vendorDetails.item_name,
      quantity: vendorDetails.quantity,
      weight: vendorDetails.weight,
      consigneeName: vendorDetails.consignee_name,
      consigneeAddress: vendorDetails.consignee_address,
      consigneeEmail: vendorDetails.consignee_email,
      consigneePhone: vendorDetails.consignee_phone,
      status: receiverShipment.status || 'pending',
      location: updates[0]?.location || null,
      dispatchDate: receiverShipment.created_at,
      updates: updates
    });
  } catch (error) {
    console.error('Error tracking shipment:', error);
    res.status(404).json({ error: 'Shipment not found' });
  }
});

app.get('/api/tracking/search-by-qr/:qrCode', async (req, res) => {
  try {
    const { data: shipment, error } = await supabaseAdmin
      .from('vendor_shipments')
      .select('*, shipment_tracking(*)')
      .eq('qr_code_url', req.params.qrCode)
      .single();

    if (error) throw error;
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    // Format response for frontend compatibility
    const trackingData = shipment.shipment_tracking?.[0] || {};
    res.json({
      trackingId: shipment.vendor_decl_id,
      vendorDeclId: shipment.vendor_decl_id,
      itemName: shipment.item_name,
      quantity: shipment.quantity,
      weight: shipment.weight,
      consigneeName: shipment.consignee_name,
      consigneeAddress: shipment.consignee_address,
      consigneeEmail: shipment.consignee_email,
      consigneePhone: shipment.consignee_phone,
      status: trackingData.status || 'declared',
      location: trackingData.location,
      dispatchDate: shipment.created_at,
      updates: shipment.shipment_tracking || []
    });
  } catch (error) {
    console.error('Error searching by QR:', error);
    res.status(404).json({ error: 'Shipment not found' });
  }
});

app.put('/api/tracking/update-status/:id', async (req, res) => {
  try {
    const { data: shipment } = await supabaseAdmin
      .from('vendor_shipments')
      .select('vendor_decl_id')
      .eq('id', req.params.id)
      .single();

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const { data, error } = await supabaseAdmin
      .from('shipment_tracking')
      .upsert({
        vendor_decl_id: shipment.vendor_decl_id,
        status: req.body.status,
        location: req.body.location,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📦 API available at http://localhost:${PORT}/api`);
});

