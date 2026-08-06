-- TrustGuard AI Production PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enums
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

-- Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'analyst',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Security Logs Table
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    original_input TEXT NOT NULL,
    processed_output TEXT,
    risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
    max_risk_level risk_level DEFAULT 'low',
    pii_detected JSONB DEFAULT '[]',
    threats_detected JSONB DEFAULT '[]',
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Security Policies Table
CREATE TABLE IF NOT EXISTS security_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    policy_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sensitivity risk_level DEFAULT 'medium',
    rules JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast analytics & search
CREATE INDEX IF NOT EXISTS idx_security_logs_org_id ON security_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_risk_score ON security_logs(risk_score);
CREATE INDEX IF NOT EXISTS idx_security_policies_org_id ON security_policies(organization_id);

-- Row Level Security Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY org_isolation_security_logs ON security_logs
        FOR ALL
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::UUID);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
