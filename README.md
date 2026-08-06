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
4. Under **Environment Variables**, add the following keys:
   - `DATABASE_URL` = `postgresql://postgres.[PROJECT-REF]:ArunK5arthik@aws-0-[REGION].pooler.supabase.com:6543/postgres`
   - `JWT_SECRET` = `PUIC3KCcmhdPByLXk3zmJ5fMXv6ZE0V2X9ithO1+NvAAEZhowTWgevClP0d7oq5FspI9vOiIBOymzihmLCgl3w==`
   - `GEMINI_API_KEY` = `AIzaSyD_bsJUEvHz1Vg3ax4XcE9vH0Ak-4mm2c0`
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
│   ├── .env
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
