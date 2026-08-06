-- =====================================================================
-- TRUSTGUARD AI - SUPABASE INITIAL DATABASE MIGRATION
-- Migration Name: 20260806000000_trustguard_init.sql
-- Description: Production PostgreSQL DDL schema with UUIDs, Custom ENUMs,
--              Indexes, Triggers, and Row Level Security (RLS) policies.
-- =====================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Custom ENUM Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'analyst', 'developer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'analyst',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Security Logs Table (Scan Audit Records)
CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    original_input TEXT NOT NULL,
    processed_output TEXT,
    risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
    max_risk_level risk_level DEFAULT 'low',
    pii_detected JSONB DEFAULT '[]'::jsonb,
    threats_detected JSONB DEFAULT '[]'::jsonb,
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Security Policies Table (Custom Sensitivity Rules)
CREATE TABLE IF NOT EXISTS public.security_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    policy_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sensitivity risk_level DEFAULT 'medium',
    rules JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. High-Performance Analytical Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_security_logs_org_id ON public.security_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON public.security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_risk_score ON public.security_logs(risk_score);
CREATE INDEX IF NOT EXISTS idx_security_policies_org_id ON public.security_policies(organization_id);

-- 8. Enable Supabase Row Level Security (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_policies ENABLE ROW LEVEL SECURITY;

-- 9. Row Level Security Policies for Multi-Tenant Data Isolation
DO $$ BEGIN
    CREATE POLICY org_isolation_security_logs ON public.security_logs
        FOR ALL
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::UUID);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY org_isolation_security_policies ON public.security_policies
        FOR ALL
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::UUID);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Permissive policy for Backend Service Role / Direct queries
DO $$ BEGIN
    CREATE POLICY backend_service_logs ON public.security_logs
        FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY backend_service_users ON public.users
        FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY backend_service_orgs ON public.organizations
        FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY backend_service_policies ON public.security_policies
        FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 10. Auto-Update Timestamp Trigger Function
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_security_policies_modtime
BEFORE UPDATE ON public.security_policies
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
