# UROWALA Instagram Reel Intelligence Dashboard

Production-ready, private Instagram analytics intelligence platform engineered for **Dr. Mohit Sharma** and the **UROWALA** brand (`@dr.mohit_urowala`).

**Target Production Domain:** `https://socialmedia.urowala.com` (or `https://analytics.urowala.com`)

---

## 🌟 Key Capabilities

1. **24-Hour & Period View Velocity:**
   - Tracks which Reels gain the most views in rolling 24 hours, 7 days, 30 days, or custom date ranges.
   - Compares performance against the previous equivalent period to identify surging vs cooling videos.
2. **Comment Intelligence & Patient Question Mining:**
   - Real-time comment stream with automated clinical question extraction (`?`, "how", "what", "can I", "is it").
   - Frequent keyword analysis (e.g., *kidney stone*, *laser*, *stent*, *bph*, *sperm*, *ed*).
   - Generates actionable video hooks and content ideas from recurring audience questions.
3. **Comment-to-View & Engagement Ratios:**
   - Evaluates true audience engagement depth: `(Comments / Views) × 100%` and `(Likes + Comments + Shares + Saves) / Reach`.
4. **Follower Conversion Attribution:**
   - Ranks Reels by verified attributed follows where provided by Meta's native media-level insights.
   - Calculates conversion efficiency: `(Attributed Follows / Period Reach) × 100%`.
   - Strictly distinguishes account-level net follower growth from per-Reel conversions. Never attributes account growth arbitrarily.
5. **8 Core Urology Topics Classification:**
   - Auto-categorizes Reels into 8 clinical pillars:
     1. Kidney Stones
     2. Prostate & BPH
     3. Sexual Health
     4. Erectile Dysfunction
     5. Male Infertility
     6. UTI & Bladder Health
     7. Urology Procedures
     8. General Urology Education
   - Allows authorized users to manually override or edit topic categories on any Reel.
6. **Historical Analytics Engine:**
   - Captures timestamped metric snapshots in Supabase PostgreSQL every 60 minutes via Vercel Cron (`0 * * * *`).
   - Computes period gains by comparing the closest valid snapshots around requested time boundaries in `Asia/Kolkata` (IST) timezone.
7. **Production Grade & Privacy Compliant:**
   - Built exclusively on official Meta Instagram Graph API v19.0.
   - No unauthorized scraping or private message access.
   - Full CSV export and manual "Sync Now" triggers.

---

## 🛠️ Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS with authentic UROWALA navy-blue medical branding (`#072449`, `#0263c7`)
- **Visuals & Charts:** Recharts and Lucide Icons
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Deployment:** Vercel with Serverless API Routes and Vercel Cron Jobs
- **Timezone:** `Asia/Kolkata` (IST)

---

## 🚀 Step-by-Step Setup & Deployment

### 1. Meta Developer App Configuration

1. Visit [Meta for Developers](https://developers.facebook.com/) and click **Create App**.
2. Select **Other** &rarr; **Business**.
3. Under **Add products to your app**, add:
   - **Instagram Graph API**
   - **Facebook Login for Business**
4. Under Facebook Login &rarr; Settings &rarr; **Valid OAuth Redirect URIs**, enter:
   ```
   https://socialmedia.urowala.com/api/auth/instagram/callback
   ```
   *(For local testing, also add `http://localhost:3000/api/auth/instagram/callback`)*
5. Ensure Dr. Mohit Sharma's Instagram account (`@dr.mohit_urowala`) is configured as a **Professional (Creator or Business)** account and connected to a Facebook Page.
6. Copy your **App ID** and **App Secret** from App Settings &rarr; Basic.

---

### 2. Supabase PostgreSQL Schema

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and navigate to the **SQL Editor**.
2. Run the complete migration script provided at:
   ```
   src/supabase/schema.sql
   ```
3. This creates:
   - `instagram_accounts`
   - `account_snapshots`
   - `reels`
   - `reel_snapshots`
   - `reel_comments`
   - `topics` (pre-seeded with 8 urology pillars)
   - `sync_logs`
   - Stored procedure `get_reel_period_metrics`
   - Row-Level Security policies

---

### 3. Vercel Environment Variables

In your Vercel Project Settings &rarr; **Environment Variables**, configure:

| Variable | Description |
|---|---|
| `INSTAGRAM_APP_ID` | Your Meta Developer App ID |
| `INSTAGRAM_APP_SECRET` | Your Meta Developer App Secret |
| `INSTAGRAM_REDIRECT_URI` | `https://socialmedia.urowala.com/api/auth/instagram/callback` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL (`https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase public anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role secret key (backend only) |
| `CRON_SECRET` | A secure random 32-character string |
| `NEXT_PUBLIC_APP_URL` | `https://socialmedia.urowala.com` |

---

### 4. Custom Domain Connection

In your DNS manager (Cloudflare, GoDaddy, Namecheap) for `urowala.com`:
- Add a `CNAME` record:
  - **Name:** `socialmedia`
  - **Target:** `cname.vercel-dns.com`
  - **TTL:** Auto

In Vercel &rarr; Settings &rarr; **Domains**, add `socialmedia.urowala.com`.

---

### 5. Automated Hourly Snapshot Collection

The repository includes `vercel.json` configured with:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "0 * * * *"
    }
  ]
}
```
Vercel triggers this endpoint every hour, passing the `CRON_SECRET` in the `Authorization` header to automatically snapshot views, reach, comments, shares, and saves.

---

## 🔒 Security Best Practices

- Secrets (`INSTAGRAM_APP_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`) are never bundled in client-side code.
- Instagram long-lived access tokens (60 days) are held server-side in Supabase and automatically refreshed.
- All endpoints support zero-trust authentication checks.
