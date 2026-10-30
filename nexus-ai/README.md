# NexusAI — Autonomous Enterprise Assistant & Workflow Orchestrator

NexusAI is split into **3 independent production systems**:

| System | Role | Hosting Target | Primary Technology |
|---|---|---|---|
| **`client`** | Frontend Web Application | **Vercel** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **`server`** | Application API & AI Gateway | **Render** | Node.js, Express.js, JWT, Zod, Gemini AI SDK |
| **`backend`** | Database & Infrastructure | **Supabase** | PostgreSQL, Row Level Security (RLS), Supabase JS SDK |

---

## 🏛️ Tri-System Architecture Diagram

```mermaid
flowchart LR
    subgraph Vercel["Vercel Cloud (Client)"]
        ReactApp["React / Vite SPA\n(client/)"]
        VercelConfig["vercel.json\n(SPA Rewrites & Headers)"]
    end

    subgraph Render["Render Cloud (Server)"]
        ExpressAPI["Express REST API\n(server/)"]
        GeminiEngine["Gemini AI Orchestrator\n(@google/genai)"]
        RenderBlueprint["render.yaml\n(Web Service Blueprint)"]
    end

    subgraph Supabase["Supabase Cloud (Backend)"]
        SupaPostgres[("PostgreSQL Database\n(Port 6543 / 5432)")]
        SupaRLS["Row-Level Security\n(RLS Policies)"]
        SupaAdminSDK["Admin SDK (Service Role)\n(backend/supabase/)"]
        SupaAnonSDK["Anon SDK (Public Key)\n(backend/supabase/)"]
    end

    ReactApp -->|VITE_API_URL: HTTPS Requests with Bearer JWT| ExpressAPI
    ExpressAPI -->|Gemini AI Prompts| GeminiEngine
    ExpressAPI -->|DATABASE_URL: Connection Pooler| SupaPostgres
    ExpressAPI -->|SUPABASE_SERVICE_ROLE_KEY| SupaAdminSDK
    ReactApp -.->|VITE_SUPABASE_ANON_KEY (Optional Direct)| SupaAnonSDK
```

---

## 🔐 1. Dedicated Environment Files (`.env`)

Each of the 3 systems has its own independent `.env` file:

### A. Client Configuration: [`client/.env`](file:///c:/Users/ASUS/deo%20kumar%20ai/nexus-ai/client/.env)
Configured exclusively for **Vercel** deployment:
```env
# Backend API URL (Points to your deployed Render service)
VITE_API_URL=https://nexusai-backend.onrender.com/api

# Supabase Public Credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### B. Server Configuration: [`server/.env`](file:///c:/Users/ASUS/deo%20kumar%20ai/nexus-ai/server/.env)
Configured for the Express API running on **Render**:
```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://nexusai.vercel.app
RENDER_EXTERNAL_URL=https://nexusai-backend.onrender.com

# Supabase PostgreSQL Connection Pooler (Port 6543)
DATABASE_URL=postgresql://postgres.your-project-id:your-db-password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true

# Supabase Project API Credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Security & Gemini AI
JWT_SECRET=your_super_secret_jwt_key_enterprise_nexus_2026
GEMINI_API_KEY=your_gemini_api_key_here
```

### C. Backend Configuration: [`backend/.env`](file:///c:/Users/ASUS/deo%20kumar%20ai/nexus-ai/backend/.env)
Dedicated to the **Supabase** database and storage layer:
```env
# Supabase API Credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Supabase Connection Strings
DATABASE_URL=postgresql://postgres.your-project-id:your-db-password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.your-project-id:your-db-password@aws-0-region.pooler.supabase.com:5432/postgres

# Render Reference
RENDER_EXTERNAL_URL=https://nexusai-backend.onrender.com
PORT=5000
```

---

## 🗄️ 2. Supabase Files & Structure

Located in [`nexus-ai/backend/supabase/`](file:///c:/Users/ASUS/deo%20kumar%20ai/nexus-ai/backend/supabase):

1. **[`schema.sql`](file:///c:/Users/ASUS/deo%20kumar%20ai/nexus-ai/backend/supabase/schema.sql)**:
   - Production SQL script with UUID extensions, `users`, `tickets`, and `chats` tables.
   - Enables Row Level Security (RLS) on all tables with explicit security policies for `service_role` and `authenticated` users.
   - Run this directly in your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).
2. **[`supabaseClient.js`](file:///c:/Users/ASUS/deo%20kumar%20ai/nexus-ai/backend/supabase/supabaseClient.js)**:
   - Initializes `@supabase/supabase-js` using `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
3. **[`supabaseAdmin.js`](file:///c:/Users/ASUS/deo%20kumar%20ai/nexus-ai/backend/supabase/supabaseAdmin.js)**:
   - Initializes elevated client with `SUPABASE_SERVICE_ROLE_KEY` for server-side ticket generation and administrative tasks.
4. **[`supabaseService.js`](file:///c:/Users/ASUS/deo%20kumar%20ai/nexus-ai/backend/supabase/supabaseService.js)**:
   - Modular helper functions for ticket CRUD, chat history, and user authentication.
5. **[`verifyConnection.js`](file:///c:/Users/ASUS/deo%20kumar%20ai/nexus-ai/backend/supabase/verifyConnection.js)**:
   - Diagnostic script to test your Supabase credentials:
     ```bash
     npm run test:supabase
     ```

---

## 🚀 3. Deployment Guides

### Deploying the Client to Vercel
1. Import the repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `nexus-ai/client` (or `client`).
3. Set **Framework Preset** to `Vite`.
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your Render backend URL (`https://your-service.onrender.com/api`)
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
5. Deploy! Vercel handles SPA rewrites via [`client/vercel.json`](file:///c:/Users/ASUS/deo%20kumar%20ai/nexus-ai/client/vercel.json).

### Deploying the Server to Render
1. Create a **New Web Service** on [Render](https://render.com).
2. Connect your Git repository.
3. Configure settings:
   - **Root Directory**: `nexus-ai/server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add the environment variables from [`server/.env`](file:///c:/Users/ASUS/deo%20kumar%20ai/nexus-ai/server/.env).
5. Deploy! Render automatically verifies health via `/api/health`.
