import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in env; admin client may not work.');
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

export default supabaseAdmin;
