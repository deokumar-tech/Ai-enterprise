const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function run() {
  console.log('--- Initializing NexusAI PostgreSQL Database ---');
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully.');
    
    await client.query(schemaSql);
    console.log('Schema executed successfully. All tables and indices are ready.');
    client.release();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Database initialization error:', err.message);
    process.exit(1);
  }
}

run();

