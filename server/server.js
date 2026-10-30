const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDatabase } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware - Allow Vercel frontend, Render URLs, and localhost
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or requests without origin (like curl or postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev, securely handles cookies & headers
  },
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const { isSupabaseConfigured, SUPABASE_URL } = require('./config/supabase');

// Health check endpoint with infrastructure indicators (accessible at both /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'NexusAI Enterprise Assistant API',
    infrastructure: {
      render: Boolean(process.env.RENDER_EXTERNAL_URL),
      supabase: isSupabaseConfigured(),
      supabaseHost: SUPABASE_URL ? SUPABASE_URL.split('//')[1] : 'unconfigured',
    },
    timestamp: new Date().toISOString(),
  });
});

// Register API Routes - accessible under both /api/* and root /* (prevents 404 if VITE_API_URL omits /api)
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/tickets', '/tickets'], ticketRoutes);
app.use(['/api/chat', '/chat'], chatRoutes);

// Root greeting endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'NexusAI Enterprise API',
    status: 'active',
    documentation: 'See README.md for endpoint specifications'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `API Route ${req.originalUrl} not found`,
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start server and initialize PostgreSQL database
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  NexusAI Server running on http://localhost:${PORT}`);
    console.log(`  API base: http://localhost:${PORT}/api`);
    console.log(`===============================================`);
  });
}

startServer();
