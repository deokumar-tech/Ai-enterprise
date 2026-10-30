const { supabaseClient, SUPABASE_URL, SUPABASE_ANON_KEY } = require('./supabase/supabaseClient');
const { supabaseAdmin, SUPABASE_SERVICE_ROLE_KEY } = require('./supabase/supabaseAdmin');
const supabaseService = require('./supabase/supabaseService');

module.exports = {
  supabaseClient,
  supabaseAdmin,
  supabaseService,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
};

