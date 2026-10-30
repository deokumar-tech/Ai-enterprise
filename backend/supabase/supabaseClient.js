const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend .env or parent
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('your-project-id')) {
  console.warn('[Supabase Client] Notice: SUPABASE_URL or SUPABASE_ANON_KEY is not yet populated in backend/.env.');
}

/**
 * Standard Supabase Client (Anon Public Key)
 * Respects Supabase Row-Level Security (RLS) policies.
 */
const supabaseClient = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      persistSession: false,
    },
  }
);

module.exports = {
  supabaseClient,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
};
