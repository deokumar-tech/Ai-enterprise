const { supabaseAdmin } = require('./supabaseAdmin');
const { supabaseClient } = require('./supabaseClient');

/**
 * Enterprise Supabase Service Layer
 * Unified access to Supabase PostgreSQL database tables with entity validation
 */

// ==========================================
// 1. TICKET OPERATIONS
// ==========================================

async function createTicket({ userId, title, description, category, priority = 'MEDIUM' }) {
  const { data, error } = await supabaseAdmin
    .from('tickets')
    .insert([
      {
        user_id: userId,
        title,
        description,
        category,
        status: 'OPEN',
        priority,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase createTicket error: ${error.message}`);
  }
  return data;
}

async function getTicketsByUser(userId, { status, category } = {}) {
  let query = supabaseAdmin
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (status && status !== 'ALL') {
    query = query.eq('status', status.toUpperCase());
  }

  if (category && category !== 'ALL') {
    query = query.eq('category', category.toUpperCase());
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Supabase getTickets error: ${error.message}`);
  }
  return data || [];
}

async function updateTicketStatus(ticketId, status, userId) {
  const { data, error } = await supabaseAdmin
    .from('tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', ticketId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase updateTicketStatus error: ${error.message}`);
  }
  return data;
}

async function getTicketStats(userId) {
  const { data: tickets, error } = await supabaseAdmin
    .from('tickets')
    .select('status, category')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Supabase getTicketStats error: ${error.message}`);
  }

  const list = tickets || [];
  return {
    total: list.length,
    open: list.filter((t) => t.status === 'OPEN').length,
    in_progress: list.filter((t) => t.status === 'IN_PROGRESS').length,
    resolved: list.filter((t) => t.status === 'RESOLVED').length,
    it_support: list.filter((t) => t.category === 'IT_SUPPORT').length,
    hr_request: list.filter((t) => t.category === 'HR_REQUEST').length,
    facilities: list.filter((t) => t.category === 'FACILITIES').length,
    general: list.filter((t) => t.category === 'GENERAL').length,
  };
}

// ==========================================
// 2. CHAT HISTORY OPERATIONS
// ==========================================

async function saveChatMessage(userId, message, role) {
  const { data, error } = await supabaseAdmin
    .from('chats')
    .insert([
      {
        user_id: userId,
        message,
        role,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase saveChatMessage error: ${error.message}`);
  }
  return data;
}

async function getChatHistory(userId, limit = 50) {
  const { data, error } = await supabaseAdmin
    .from('chats')
    .select('id, role, message, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Supabase getChatHistory error: ${error.message}`);
  }
  return data || [];
}

// ==========================================
// 3. USER MANAGEMENT OPERATIONS
// ==========================================

async function createUser(email, passwordHash, fullName) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert([
      {
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name: fullName,
      },
    ])
    .select('id, email, full_name, created_at')
    .single();

  if (error) {
    throw new Error(`Supabase createUser error: ${error.message}`);
  }
  return data;
}

async function getUserByEmail(email) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, password_hash, full_name, created_at')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase getUserByEmail error: ${error.message}`);
  }
  return data;
}

async function getUserById(id) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase getUserById error: ${error.message}`);
  }
  return data;
}

module.exports = {
  createTicket,
  getTicketsByUser,
  updateTicketStatus,
  getTicketStats,
  saveChatMessage,
  getChatHistory,
  createUser,
  getUserByEmail,
  getUserById,
};

