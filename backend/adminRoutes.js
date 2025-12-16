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

export default router;
