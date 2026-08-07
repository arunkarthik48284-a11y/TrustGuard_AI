# TrustGuard AI — AI Security, Privacy & Trust Platform 🛡️

**TrustGuard AI** is an enterprise-grade AI Security, Privacy & Trust Platform designed to safeguard sensitive data, detect real-time security threats (Prompt Injection, Jailbreaks, AI Toxicity), redact PII tokens, and maintain compliance transparency across LLM applications.

---

## ⚡ Vercel Deployment Instructions (One-Click / CLI / GitHub)

The repository is configured for immediate deployment on **Vercel** via `vercel.json` (serverless Node.js backend functions + Vite static React build).

### Method 1: Deploy via Vercel CLI
```bash
# 1. Install Vercel CLI (if not installed)
npm install -g vercel

# 2. Deploy to Vercel
vercel

# 3. Deploy to Production
vercel --prod
```

### Method 2: Deploy via GitHub + Vercel Dashboard
1. Push this workspace to your GitHub / GitLab repository.
2. Go to **[Vercel Dashboard](https://vercel.com/new)** ➔ Click **Import Repository**.
3. Select your repository.
4. Under **Environment Variables**, add the required environment keys below.
> ⚠️ **IMPORTANT SECURITY NOTE**: Set these in your Vercel project's Environment Variables dashboard — never commit real secrets to this file or repository.

   - `DATABASE_URL` = `postgresql://user:password@host:6543/postgres`
   - `JWT_SECRET` = `your_jwt_secret_here`
   - `GEMINI_API_KEY` = `your_gemini_api_key_here`

5. Click **Deploy**!

---

## 📂 Project Structure

```
c:\Users\ARUN\OneDrive\Desktop\Hackathon\
├── api/
│   └── index.js                         # Vercel Serverless Function API Entrypoint
├── backend/                             # Express Engine Service
│   ├── src/
│   │   ├── app.js                       # Express Application Export
│   │   ├── server.js                    # Local Dev Server Listener
│   │   ├── config/db.js                 # PostgreSQL Pool & Fallback Store
│   │   ├── controllers/                 # Auth, Scan, Policy, Audit Controllers
│   │   ├── middleware/                  # JWT & Rate Limiting Middleware
│   │   ├── routes/                      # Route Handlers (/api/auth, /api/security, /api/policies)
│   │   └── services/                    # PII Engine & Google Gemini @google/genai SDK Service
│   ├── .env.example
│   └── package.json
├── frontend/                            # Vite + React App
│   ├── src/
│   │   ├── components/                  # Sidebar, Navbar, MetricCard, ThreatChart, ScanPlayground, PolicyEditor, AuditTable
│   │   ├── pages/                       # Login, Register, Dashboard, Scanner, Policies, AuditLogs, Settings
│   │   └── services/api.js              # Axios Client (Auto-routes to /api on Vercel)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── supabase/                            # Supabase DDL Migrations & Seed Data
│   ├── migrations/20260806000000_trustguard_init.sql
│   └── seed.sql
├── vercel.json                          # Vercel Production Build & Route Map
└── README.md
```
