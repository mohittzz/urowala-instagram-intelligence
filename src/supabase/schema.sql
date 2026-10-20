-- ==============================================================================
-- UROWALA Instagram Reel Intelligence Dashboard - Database Schema
-- Supabase PostgreSQL Architecture
-- Target: socialmedia.urowala.com / analytics.urowala.com
-- Account: @dr.mohit_urowala
-- ==============================================================================

-- 1. Enable UUID and cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Topics Master Table
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#0263c7',
    description TEXT,
    keywords TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Seed predefined urology topics
INSERT INTO topics (id, name, color, description, keywords) VALUES
('kidney_stones', 'Kidney Stones', '#0284c7', 'Renal calculi, lithotripsy, ureteroscopy, symptoms, prevention, diet', ARRAY['stone', 'kidney', 'stent', 'rirs', 'pcnl', 'calcium', 'pain', 'ureter', 'lithotripsy']),
('prostate_bph', 'Prostate & BPH', '#0f766e', 'Enlarged prostate, BPH, TURP, prostate health, urination difficulties', ARRAY['prostate', 'bph', 'turp', 'enlarged', 'urine stream', 'frequent urination', 'psa']),
('sexual_health', 'Sexual Health', '#7c3aed', 'Male sexual health, performance, myths, vitality, hormones', ARRAY['sexual', 'vitality', 'testosterone', 'performance', 'stamina', 'libido', 'intimacy']),
('erectile_dysfunction', 'Erectile Dysfunction', '#db2777', 'ED diagnosis, treatment options, shockwave therapy, vascular health', ARRAY['erectile', 'dysfunction', 'ed', 'penile', 'erection', 'viagra', 'shockwave']),
('male_infertility', 'Male Infertility', '#d97706', 'Semen analysis, varicocele, sperm count, motility, fertility solutions', ARRAY['fertility', 'sperm', 'varicocele', 'motility', 'semen', 'infertility', 'azoospermia']),
('uti_bladder', 'UTI & Bladder Health', '#0284c7', 'Urinary tract infections, cystitis, bladder habits, overactive bladder', ARRAY['uti', 'infection', 'bladder', 'burning urine', 'burning', 'incontinence', 'cystitis']),
('urology_procedures', 'Urology Procedures', '#2563eb', 'Surgical walkthroughs, recovery, laser surgery, hospital care', ARRAY['surgery', 'procedure', 'laser', 'operation', 'recovery', 'hospital', 'endourology']),
('general_education', 'General Urology Education', '#475569', 'Hydration habits, prevention tips, when to see a urologist', ARRAY['water', 'hydration', 'health', 'doctor', 'prevention', 'checkup', 'tips', 'myths'])
ON CONFLICT (id) DO NOTHING;

-- 3. Instagram Connected Accounts
CREATE TABLE IF NOT EXISTS instagram_accounts (
    id TEXT PRIMARY KEY, -- Instagram Business/Creator Account ID
    username TEXT NOT NULL UNIQUE,
    name TEXT,
    profile_picture_url TEXT,
    followers_count BIGINT NOT NULL DEFAULT 0,
    follows_count BIGINT NOT NULL DEFAULT 0,
    media_count INTEGER NOT NULL DEFAULT 0,
    access_token TEXT, -- Long-lived token (stored server-side only)
    token_expires_at TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ,
    sync_status TEXT NOT NULL DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error')),
    sync_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. Account Level Historical Snapshots (for follower growth tracking)
CREATE TABLE IF NOT EXISTS account_snapshots (
    id BIGSERIAL PRIMARY KEY,
    account_id TEXT NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    followers_count BIGINT NOT NULL,
    follows_count BIGINT,
    media_count INTEGER
);

CREATE INDEX IF NOT EXISTS idx_account_snapshots_lookup 
ON account_snapshots (account_id, timestamp DESC);

-- 5. Reels Core Catalog
CREATE TABLE IF NOT EXISTS reels (
    id TEXT PRIMARY KEY, -- Instagram Media ID
    account_id TEXT NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    shortcode TEXT,
    caption TEXT,
    media_type TEXT NOT NULL DEFAULT 'VIDEO',
    media_product_type TEXT NOT NULL DEFAULT 'REELS',
    permalink TEXT NOT NULL,
    thumbnail_url TEXT,
    posted_at TIMESTAMPTZ NOT NULL,
    topic_id TEXT REFERENCES topics(id) ON DELETE SET NULL,
    topic_manual_override BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_reels_account_posted 
ON reels (account_id, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_topic 
ON reels (topic_id);

-- 6. Reel Periodic Snapshots (Core Historical Engine)
-- Captures metrics per hourly sync
CREATE TABLE IF NOT EXISTS reel_snapshots (
    id BIGSERIAL PRIMARY KEY,
    reel_id TEXT NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    views BIGINT NOT NULL DEFAULT 0, -- Instagram plays
    reach BIGINT NOT NULL DEFAULT 0,
    likes BIGINT NOT NULL DEFAULT 0,
    comments_count BIGINT NOT NULL DEFAULT 0,
    shares BIGINT, -- NULL if not provided by API
    saves BIGINT, -- NULL if not provided by API
    avg_watch_time NUMERIC(10, 2), -- In seconds, NULL if unavailable
    total_play_time NUMERIC(12, 2), -- In seconds, NULL if unavailable
    attributed_follows BIGINT -- Per-media 'follows' metric from Instagram Graph API insights
);

CREATE INDEX IF NOT EXISTS idx_reel_snapshots_lookup 
ON reel_snapshots (reel_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_reel_snapshots_timestamp 
ON reel_snapshots (timestamp DESC);

-- 7. Reel Comments Intelligence
CREATE TABLE IF NOT EXISTS reel_comments (
    id TEXT PRIMARY KEY, -- Instagram Comment ID
    reel_id TEXT NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    commenter_username TEXT,
    posted_at TIMESTAMPTZ NOT NULL,
    like_count INTEGER NOT NULL DEFAULT 0,
    is_question BOOLEAN NOT NULL DEFAULT FALSE,
    detected_intent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_reel_comments_reel_date 
ON reel_comments (reel_id, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_reel_comments_posted_at 
ON reel_comments (posted_at DESC);

-- 8. Sync Logs Table
CREATE TABLE IF NOT EXISTS sync_logs (
    id BIGSERIAL PRIMARY KEY,
    account_id TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    finished_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'partial', 'failed')),
    reels_synced INTEGER NOT NULL DEFAULT 0,
    comments_synced INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    trigger_type TEXT NOT NULL DEFAULT 'cron' CHECK (trigger_type IN ('cron', 'manual', 'webhook'))
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_started 
ON sync_logs (started_at DESC);

-- 9. Automatic Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_instagram_accounts_updated ON instagram_accounts;
CREATE TRIGGER trg_instagram_accounts_updated
BEFORE UPDATE ON instagram_accounts
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_reels_updated ON reels;
CREATE TRIGGER trg_reels_updated
BEFORE UPDATE ON reels
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_topics_updated ON topics;
CREATE TRIGGER trg_topics_updated
BEFORE UPDATE ON topics
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- 10. PostgreSQL Stored Procedure for Calculating Period Performance
-- Compares the latest snapshot with the closest baseline snapshot near (NOW() - INTERVAL)
CREATE OR REPLACE FUNCTION get_reel_period_metrics(
    target_reel_id TEXT,
    baseline_time TIMESTAMPTZ
)
RETURNS TABLE (
    reel_id TEXT,
    current_views BIGINT,
    baseline_views BIGINT,
    views_gained BIGINT,
    current_comments BIGINT,
    baseline_comments BIGINT,
    comments_gained BIGINT,
    current_shares BIGINT,
    current_saves BIGINT,
    current_reach BIGINT,
    attributed_follows BIGINT
) AS $$
DECLARE
    latest_snap RECORD;
    baseline_snap RECORD;
BEGIN
    -- Get newest snapshot
    SELECT * INTO latest_snap 
    FROM reel_snapshots 
    WHERE reel_snapshots.reel_id = target_reel_id 
    ORDER BY timestamp DESC 
    LIMIT 1;

    -- Get closest snapshot to baseline_time
    SELECT * INTO baseline_snap 
    FROM reel_snapshots 
    WHERE reel_snapshots.reel_id = target_reel_id 
      AND timestamp <= baseline_time
    ORDER BY timestamp DESC 
    LIMIT 1;

    -- If no snapshot exists strictly before baseline, fallback to earliest available
    IF baseline_snap.id IS NULL THEN
        SELECT * INTO baseline_snap 
        FROM reel_snapshots 
        WHERE reel_snapshots.reel_id = target_reel_id 
        ORDER BY timestamp ASC 
        LIMIT 1;
    END IF;

    IF latest_snap.id IS NOT NULL THEN
        RETURN QUERY SELECT
            target_reel_id,
            latest_snap.views,
            COALESCE(baseline_snap.views, latest_snap.views),
            GREATEST(0, latest_snap.views - COALESCE(baseline_snap.views, latest_snap.views)),
            latest_snap.comments_count,
            COALESCE(baseline_snap.comments_count, latest_snap.comments_count),
            GREATEST(0, latest_snap.comments_count - COALESCE(baseline_snap.comments_count, latest_snap.comments_count)),
            latest_snap.shares,
            latest_snap.saves,
            latest_snap.reach,
            latest_snap.attributed_follows;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 11. Row Level Security (RLS) Configuration
ALTER TABLE instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users read and manage operations
CREATE POLICY "Allow authenticated read on instagram_accounts" ON instagram_accounts
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on reels" ON reels
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update on reels" ON reels
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on reel_snapshots" ON reel_snapshots
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on reel_comments" ON reel_comments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on topics" ON topics
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on sync_logs" ON sync_logs
    FOR SELECT TO authenticated USING (true);

-- Service role bypasses RLS for server-side API cron & sync operations
