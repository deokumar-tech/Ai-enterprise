const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend .env or parent
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || SUPABASE_URL.includes('your-project-id')) {
  console.warn('[Supabase Admin] Notice: SUPABASE_SERVICE_ROLE_KEY is not yet populated in backend/.env.');
}

/**
 * Elevated Supabase Admin Client (Service Role Secret Key)
 * Bypasses RLS for trusted server-side execution, autonomous AI ticket creation, and system administration.
 * WARNING: NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client/frontend.
 */
const supabaseAdmin = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

module.exports = {
  supabaseAdmin,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
};
