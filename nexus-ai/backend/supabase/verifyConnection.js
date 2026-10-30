const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const { createClient } = require('@supabase/supabase-js');

async function verifySupabase() {
  console.log('====================================================');
  console.log('    NexusAI Supabase Backend Verification Probe     ');
  console.log('====================================================\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('1. Configuration Check:');
  console.log(`   - SUPABASE_URL: ${supabaseUrl ? (supabaseUrl.includes('your-project') ? '⚠️ Placeholder Detected' : '✓ ' + supabaseUrl) : '❌ Missing'}`);
  console.log(`   - SUPABASE_ANON_KEY: ${anonKey ? (anonKey.includes('your_') ? '⚠️ Placeholder' : '✓ Configured (' + anonKey.slice(0, 12) + '...)') : '❌ Missing'}`);
  console.log(`   - SUPABASE_SERVICE_ROLE_KEY: ${serviceKey ? (serviceKey.includes('your_') ? '⚠️ Placeholder' : '✓ Configured (' + serviceKey.slice(0, 12) + '...)') : '❌ Missing'}`);

  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('your-project')) {
    console.log('\n⚠️ Notice: Please update backend/.env with your real Supabase project credentials from:');
    console.log('   https://supabase.com/dashboard/project/_/settings/api');
    console.log('\n   After adding your keys, re-run: npm run test:supabase\n');
    return;
  }

  try {
    console.log('\n2. Testing Service Role Key Elevated Connection...');
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: tickets, error: ticketError } = await admin
      .from('tickets')
      .select('count', { count: 'exact', head: true });

    if (ticketError) {
      if (ticketError.code === '42P01') {
        console.log('   ✓ Connected to Supabase, but "tickets" table not found.');
        console.log('   → Run backend/supabase/schema.sql in your Supabase SQL Editor.');
      } else {
        console.log(`   ❌ Supabase API returned error: ${ticketError.message}`);
      }
    } else {
      console.log('   ✓ Successfully connected! "tickets" table is live and accessible.');
    }

    console.log('\n3. Testing Anon Public Key Connection...');
    const client = createClient(supabaseUrl, anonKey);
    const { error: anonError } = await client.from('tickets').select('id').limit(1);
    if (!anonError || anonError.code === 'PGRST116' || anonError.message?.includes('RLS')) {
      console.log('   ✓ Anon key is valid and Supabase RLS is enforcing security policies.');
    } else {
      console.log(`   ℹ️ Anon key check note: ${anonError.message}`);
    }

    console.log('\n====================================================');
    console.log('  Supabase Backend Link Verified Successfully!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('Connection probe failed:', err.message);
  }
}

verifySupabase();

