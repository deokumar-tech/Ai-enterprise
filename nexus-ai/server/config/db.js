const { Pool } = require('pg');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nexusai';

// Configure PostgreSQL pool
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' && !connectionString.includes('localhost')
    ? { rejectUnauthorized: false }
    : false,
  connectionTimeoutMillis: 5000,
});

let isPgConnected = false;

// Fallback in-memory database store for dev environments without active Postgres instance
const memoryDb = {
  users: [],
  tickets: [],
  chats: []
};

/**
 * Initialize PostgreSQL Schema with extensions and tables
 */
async function initDatabase() {
  try {
    const client = await pool.connect();
    isPgConnected = true;
    console.log('✓ Successfully connected to PostgreSQL database.');

    try {
      // Attempt to enable uuid-ossp extension
      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    } catch (extErr) {
      console.warn('Note: uuid-ossp extension could not be created or already exists. Fallback gen_random_uuid supported.');
    }

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create tickets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL CHECK (category IN ('IT_SUPPORT', 'HR_REQUEST', 'FACILITIES', 'GENERAL')),
        status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
        priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create chats table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'model')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indices
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);`);

    client.release();
    console.log('✓ PostgreSQL tables and schema initialized successfully.');
  } catch (err) {
    isPgConnected = false;
    console.warn(`! PostgreSQL is not reachable at ${connectionString.split('@')[1] || connectionString}.`);
    console.warn('! [Resilience Mode] Using high-fidelity in-memory enterprise storage until PostgreSQL service is started.');
    console.warn(`! Error detail: ${err.message}`);
  }
}

/**
 * Universal Query Executor
 * Parameterized queries to prevent SQL Injection
 */
async function query(text, params = []) {
  if (isPgConnected) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('PostgreSQL query error:', err.message);
      throw err;
    }
  }

  // Fallback simulator mimicking PostgreSQL pg result shape: { rows: [...] }
  const singleSpaced = text.replace(/\s+/g, ' ').trim();

  // 1. SELECT from users WHERE email = $1
  if (singleSpaced.startsWith('SELECT') && singleSpaced.includes('FROM users WHERE email = $1')) {
    const user = memoryDb.users.find(u => u.email.toLowerCase() === params[0].toLowerCase());
    return { rows: user ? [user] : [] };
  }

  // 2. SELECT from users WHERE id = $1
  if (singleSpaced.startsWith('SELECT') && singleSpaced.includes('FROM users WHERE id = $1')) {
    const user = memoryDb.users.find(u => u.id === params[0]);
    return { rows: user ? [user] : [] };
  }

  // 3. INSERT INTO users
  if (singleSpaced.startsWith('INSERT INTO users')) {
    const [email, password_hash, full_name] = params;
    const existing = memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const err = new Error('duplicate key value violates unique constraint "users_email_key"');
      err.code = '23505';
      throw err;
    }
    const newUser = {
      id: crypto.randomUUID(),
      email,
      password_hash,
      full_name,
      created_at: new Date().toISOString()
    };
    memoryDb.users.push(newUser);
    return { rows: [newUser] };
  }

  // 4. SELECT FROM tickets WHERE user_id = $1
  if (singleSpaced.startsWith('SELECT') && singleSpaced.includes('COUNT(*) as total')) {
    const userTickets = memoryDb.tickets.filter(t => t.user_id === params[0]);
    const stats = {
      total: userTickets.length,
      open: userTickets.filter(t => t.status === 'OPEN').length,
      in_progress: userTickets.filter(t => t.status === 'IN_PROGRESS').length,
      resolved: userTickets.filter(t => t.status === 'RESOLVED').length,
      it_support: userTickets.filter(t => t.category === 'IT_SUPPORT').length,
      hr_request: userTickets.filter(t => t.category === 'HR_REQUEST').length,
      facilities: userTickets.filter(t => t.category === 'FACILITIES').length,
      general: userTickets.filter(t => t.category === 'GENERAL').length
    };
    return { rows: [stats] };
  }

  if (singleSpaced.startsWith('SELECT') && singleSpaced.includes('FROM tickets WHERE user_id = $1')) {
    let tickets = memoryDb.tickets.filter(t => t.user_id === params[0]);
    const statusMatch = singleSpaced.match(/status = \$(\d+)/);
    if (statusMatch) {
      const idx = parseInt(statusMatch[1], 10) - 1;
      if (params[idx]) tickets = tickets.filter(t => t.status === params[idx]);
    }
    const catMatch = singleSpaced.match(/category = \$(\d+)/);
    if (catMatch) {
      const idx = parseInt(catMatch[1], 10) - 1;
      if (params[idx]) tickets = tickets.filter(t => t.category === params[idx]);
    }
    // Sort descending by created_at
    tickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: tickets };
  }

  // 5. INSERT INTO tickets
  if (singleSpaced.startsWith('INSERT INTO tickets')) {
    const [user_id, title, description, category, priority] = params;
    const newTicket = {
      id: crypto.randomUUID(),
      user_id,
      title,
      description,
      category,
      status: 'OPEN',
      priority: priority || 'MEDIUM',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryDb.tickets.push(newTicket);
    return { rows: [newTicket] };
  }

  // 6. UPDATE tickets SET status = $1 WHERE id = $2 AND user_id = $3
  if (singleSpaced.startsWith('UPDATE tickets')) {
    const [status, id, user_id] = params;
    const ticket = memoryDb.tickets.find(t => t.id === id && t.user_id === user_id);
    if (ticket) {
      ticket.status = status;
      ticket.updated_at = new Date().toISOString();
      return { rows: [ticket] };
    }
    return { rows: [] };
  }

  // 7. SELECT FROM chats WHERE user_id = $1
  if (singleSpaced.startsWith('SELECT') && singleSpaced.includes('FROM chats WHERE user_id = $1')) {
    const chats = memoryDb.chats
      .filter(c => c.user_id === params[0])
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return { rows: chats };
  }

  // 8. INSERT INTO chats
  if (singleSpaced.startsWith('INSERT INTO chats')) {
    const [user_id, message, role] = params;
    const newChat = {
      id: crypto.randomUUID(),
      user_id,
      message,
      role,
      created_at: new Date().toISOString()
    };
    memoryDb.chats.push(newChat);
    return { rows: [newChat] };
  }

  return { rows: [] };
}

module.exports = {
  pool,
  query,
  initDatabase,
  isPgConnected: () => isPgConnected
};
