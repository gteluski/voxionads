-- Database Schema for Voxion Ads
-- Generated on 2026-06-04

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigger function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. admin_users
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER update_admin_users_modtime
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. meta_tokens
CREATE TABLE IF NOT EXISTS meta_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    account_id VARCHAR(255),
    account_name VARCHAR(255),
    business_manager_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER update_meta_tokens_modtime
    BEFORE UPDATE ON meta_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. campaigns
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE NOT NULL,
    meta_campaign_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    objective VARCHAR(100),
    daily_budget NUMERIC(15, 2),
    lifetime_budget NUMERIC(15, 2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER update_campaigns_modtime
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. ad_sets
CREATE TABLE IF NOT EXISTS ad_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
    meta_adset_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    daily_budget NUMERIC(15, 2),
    optimization_goal VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER update_ad_sets_modtime
    BEFORE UPDATE ON ad_sets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. ads
CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE NOT NULL,
    adset_id UUID REFERENCES ad_sets(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
    meta_ad_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER update_ads_modtime
    BEFORE UPDATE ON ads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. ads_metrics
CREATE TABLE IF NOT EXISTS ads_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
    adset_id UUID REFERENCES ad_sets(id) ON DELETE CASCADE,
    ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    spend NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    impressions INTEGER DEFAULT 0 NOT NULL,
    clicks INTEGER DEFAULT 0 NOT NULL,
    link_clicks INTEGER DEFAULT 0 NOT NULL,
    reach INTEGER DEFAULT 0 NOT NULL,
    frequency NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    conversions INTEGER DEFAULT 0 NOT NULL,
    messages INTEGER DEFAULT 0 NOT NULL,
    cpc NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    cpc_link NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    cpm NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    cpm_impression NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    cpa NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    cpm_message NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    ctr NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    roi NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    sync_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. shared_dashboards
CREATE TABLE IF NOT EXISTS shared_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE NOT NULL,
    business_manager_id VARCHAR(255),
    share_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    has_password BOOLEAN DEFAULT FALSE NOT NULL,
    campaign_ids TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER update_shared_dashboards_modtime
    BEFORE UPDATE ON shared_dashboards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. reports
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    adset_id UUID REFERENCES ad_sets(id) ON DELETE SET NULL,
    ad_id UUID REFERENCES ads(id) ON DELETE SET NULL,
    overall_health VARCHAR(100),
    main_issues TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    recommendations TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    performance_trend VARCHAR(100),
    date_range_start DATE,
    date_range_end DATE,
    generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. sync_log
CREATE TABLE IF NOT EXISTS sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(50) NOT NULL,
    message TEXT,
    synced_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    duration_ms INTEGER NOT NULL
);

-- 10. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. admin_settings
CREATE TABLE IF NOT EXISTS admin_settings (
    admin_id UUID PRIMARY KEY REFERENCES admin_users(id) ON DELETE CASCADE,
    sync_frequency VARCHAR(50) DEFAULT '30min' NOT NULL,
    auto_sync BOOLEAN DEFAULT TRUE NOT NULL,
    data_retention_period VARCHAR(50) DEFAULT 'ilimitado' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER update_admin_settings_modtime
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- INDEXES
-- campaigns(admin_id), ad_sets(campaign_id), ads(adset_id)
CREATE INDEX IF NOT EXISTS idx_campaigns_admin_id ON campaigns(admin_id);
CREATE INDEX IF NOT EXISTS idx_ad_sets_campaign_id ON ad_sets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ads_adset_id ON ads(adset_id);

-- ads_metrics(admin_id, date DESC, campaign_id, adset_id, ad_id)
CREATE INDEX IF NOT EXISTS idx_ads_metrics_composite ON ads_metrics(admin_id, date DESC, campaign_id, adset_id, ad_id);

-- shared_dashboards(admin_id, id)
CREATE INDEX IF NOT EXISTS idx_shared_dashboards_admin_id_id ON shared_dashboards(admin_id, id);

-- reports(admin_id)
CREATE INDEX IF NOT EXISTS idx_reports_admin_id ON reports(admin_id);

-- sync_log(admin_id)
CREATE INDEX IF NOT EXISTS idx_sync_log_admin_id ON sync_log(admin_id);


-- Seed default admin user (email: admin@voxion.ads, password: adminpassword)
-- The password hash here corresponds to bcrypt('adminpassword') with salt strength 10
INSERT INTO admin_users (email, password_hash, name, is_active)
VALUES (
    'admin@voxion.ads',
    '$2a$10$w8T.K2Uj7PrcvGqYtY/YIu2/R9l1Wc4P5c8j.Q7L/2h6v3D7x6i3m',
    'Administrator',
    true
) ON CONFLICT (email) DO NOTHING;
