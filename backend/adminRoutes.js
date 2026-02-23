import express from 'express';
import { supabaseAdmin } from './supabaseAdminClient.js';

const router = express.Router();
const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

function checkSecret(req, res) {
  const header = req.header('x-admin-secret');
  if (!ADMIN_SECRET || header !== ADMIN_SECRET) {
    res.status(403).json({ error: 'forbidden' });
    return false;
  }
  return true;
}

// List users (requires admin secret)
router.get('/users', async (req, res) => {
  if (!checkSecret(req, res)) return;
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.users || data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Promote or create profile (upsert into profiles)
router.post('/promote', async (req, res) => {
  if (!checkSecret(req, res)) return;
  const { userId, role, vendorId } = req.body;
  if (!userId || !role) return res.status(400).json({ error: 'userId and role are required' });
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({ id: userId, role: role, vendor_id: vendorId }, { returning: 'representation' });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Get profile by user id
router.get('/profiles/:id', async (req, res) => {
  if (!checkSecret(req, res)) return;
  const userId = req.params.id;
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).limit(1).single();
    if (error) return res.status(404).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Container management routes

// Create a new container
router.post('/container', async (req, res) => {
  if (!checkSecret(req, res)) return;
  try {
    const { containerName } = req.body;
    if (!containerName) return res.status(400).json({ error: 'containerName is required' });

    const { data, error } = await supabaseAdmin
      .from('containers')
      .insert({
        container_name: containerName,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    res.json({
      id: data.id,
      containerName: data.container_name,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (error) {
    console.error('Error creating container:', error);
    res.status(500).json({ error: error.message });
  }
});

// List all containers
router.get('/containers', async (req, res) => {
  if (!checkSecret(req, res)) return;
  try {
    const { data, error } = await supabaseAdmin
      .from('containers')
      .select(`
        *,
        receiver_shipments(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const containers = data?.map(c => ({
      id: c.id,
      containerName: c.container_name,
      status: c.status,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      shipmentCount: c.receiver_shipments?.[0]?.count || 0,
    })) || [];
    res.json(containers);
  } catch (error) {
    console.error('Error listing containers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update container
router.put('/container', async (req, res) => {
  if (!checkSecret(req, res)) return;
  try {
    const { id, status, containerName } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });

    // Verify container exists
    const { data: existing, error: findError } = await supabaseAdmin
      .from('containers')
      .select('id')
      .eq('id', id)
      .single();

    if (findError || !existing) {
      return res.status(404).json({ error: 'Container not found' });
    }

    // Build update object
    const updateData = { updated_at: new Date().toISOString() };
    if (containerName !== undefined) updateData.container_name = containerName;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabaseAdmin
      .from('containers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If status changed, update all shipments in this container
    if (status !== undefined) {
      // Update shipments
      const { error: shipmentError } = await supabaseAdmin
        .from('receiver_shipments')
        .update({ status: status })
        .eq('container_id', id);

      if (shipmentError) throw shipmentError;

      // Add updates for tracking
      const { data: shipments } = await supabaseAdmin
        .from('receiver_shipments')
        .select('tracking_id')
        .eq('container_id', id);

      if (shipments && shipments.length > 0) {
        const updates = shipments.map(s => ({
          tracking_id: s.tracking_id,
          status: status,
          notes: 'Status updated via container',
          timestamp: new Date().toISOString(),
        }));

        const { error: updateError } = await supabaseAdmin
          .from('shipment_updates')
          .insert(updates);

        if (updateError) throw updateError;
      }
    }

    res.json({
      id: data.id,
      containerName: data.container_name,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (error) {
    console.error('Error updating container:', error);
    res.status(500).json({ error: error.message });
  }
});

// Assign shipment to container
router.put('/shipment/container', async (req, res) => {
  if (!checkSecret(req, res)) return;
  try {
    const { trackingId, containerId } = req.body;
    if (!trackingId) return res.status(400).json({ error: 'trackingId is required' });

    // Verify shipment exists
    const { data: existing, error: findError } = await supabaseAdmin
      .from('receiver_shipments')
      .select('tracking_id, status')
      .eq('tracking_id', trackingId)
      .single();

    if (findError || !existing) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // If assigning to container, verify container exists and sync status
    let containerStatus = existing.status || 'pending';
    if (containerId !== null) {
      const { data: container, error: containerError } = await supabaseAdmin
        .from('containers')
        .select('id, status')
        .eq('id', containerId)
        .single();

      if (containerError || !container) {
        return res.status(404).json({ error: 'Container not found' });
      }

      // Set containerStatus to sync with the container
      containerStatus = container.status;
    }

    // Update the shipment with container_id and sync status
    const { error } = await supabaseAdmin
      .from('receiver_shipments')
      .update({ container_id: containerId, status: containerStatus })
      .eq('tracking_id', trackingId);

    if (error) throw error;

    // Add tracking update
    const action = containerId ? `Assigned to container ${containerId}` : 'Removed from container';
    const { error: updateError } = await supabaseAdmin
      .from('shipment_updates')
      .insert({
        tracking_id: trackingId,
        status: containerStatus,
        notes: action,
        timestamp: new Date().toISOString(),
      });

    if (updateError) throw updateError;

    res.json({ success: true });
  } catch (error) {
    console.error('Error assigning shipment to container:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get shipments in a container
router.get('/container/:id/shipments', async (req, res) => {
  if (!checkSecret(req, res)) return;
  try {
    const { id } = req.params;
    
    const { data, error } = await supabaseAdmin
      .from('receiver_shipments')
      .select(`
        *,
        vendor_shipments!receiver_shipments_vendor_decl_id_fkey (*)
      `)
      .eq('container_id', id);

    if (error) throw error;
    
    const shipments = data?.map(rs => ({
      ...rs.vendor_shipments,
      tracking_id: rs.tracking_id,
      status: rs.status,
      container_id: rs.container_id,
    })) || [];
    
    res.json(shipments);
  } catch (error) {
    console.error('Error getting container shipments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete container
router.delete('/container/:id', async (req, res) => {
  if (!checkSecret(req, res)) return;
  try {
    const { id } = req.params;
    
    // First, remove container_id from all shipments in this container
    const { error: updateError } = await supabaseAdmin
      .from('receiver_shipments')
      .update({ container_id: null })
      .eq('container_id', id);

    if (updateError) throw updateError;

    // Then delete the container
    const { error } = await supabaseAdmin
      .from('containers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting container:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
