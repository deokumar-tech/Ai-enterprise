# NexusAI Backend System (Supabase & Render Infrastructure)

This directory contains the dedicated **Supabase Backend & Render Cloud Service** integration layer for NexusAI.

---

## 🔑 Required Credentials from Supabase

Navigate to your Supabase Project Dashboard: `https://supabase.com/dashboard`

1. **Project URL & Anon Key**:
   - Go to **Project Settings** → **API**.
   - Copy **Project URL** → Paste into `SUPABASE_URL`.
   - Copy **Project API Key (anon/public)** → Paste into `SUPABASE_ANON_KEY`.
   - Copy **Project API Key (service_role/secret)** → Paste into `SUPABASE_SERVICE_ROLE_KEY`.

2. **Database Connection String**:
   - Go to **Project Settings** → **Database** → **Connection pooling**.
   - Select **Mode: Transaction** (Port `6543`) or **Session** (Port `5432`).
   - Copy URI: e.g. `postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`
   - Paste into `DATABASE_URL` in both `backend/.env` and `server/.env`.

---

## 🗄️ Database Initialization

Open the **SQL Editor** in Supabase:
1. Open [supabase/schema.sql](./supabase/schema.sql).
2. Copy and paste the entire script into the SQL Editor.
3. Click **Run**.
4. This creates `users`, `tickets`, and `chats` tables with Row Level Security (RLS) policies and indices.

---

## 🧪 Testing Supabase Connection

```bash
cd nexus-ai/backend
npm install
npm run test:supabase
```

---

## ☁️ Deploying Backend on Render

1. Create a new Web Service on [Render](https://dashboard.render.com).
2. Connect your Git repository.
3. Configure settings:
   - **Root Directory**: `nexus-ai/server` (or `server`)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In **Environment Variables**, add:
   - `DATABASE_URL`: Your Supabase transaction pooler URI
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `JWT_SECRET`: Random 32+ character secret
   - `GEMINI_API_KEY`: Google Gemini API Key
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g. `https://nexusai.vercel.app`)
5. Save and Deploy! Your Render backend will be live at `https://your-service.onrender.com`.
