-- Performance Optimization: Add indexes for common queries
-- Migration: 20260630_add_performance_indexes

-- Workflows indexes
CREATE INDEX IF NOT EXISTS idx_workflows_user_id
ON workflows(user_id)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_workflows_status
ON workflows(status)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_workflows_created_at
ON workflows(created_at DESC);

-- Audit jobs indexes
CREATE INDEX IF NOT EXISTS idx_audit_jobs_site_id
ON audit_jobs(site_id)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_audit_jobs_status
ON audit_jobs(status)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_audit_jobs_created_at
ON audit_jobs(created_at DESC);

-- SEO keywords indexes
CREATE INDEX IF NOT EXISTS idx_seo_keywords_site_id
ON seo_keywords(site_id)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_seo_keywords_created_at
ON seo_keywords(created_at DESC);

-- SEO backlinks indexes (now that RLS is enabled)
CREATE INDEX IF NOT EXISTS idx_seo_backlinks_site_id
ON seo_backlinks(site_id);

CREATE INDEX IF NOT EXISTS idx_seo_backlinks_workspace_id
ON seo_backlinks(workspace_id);

-- Sites indexes
CREATE INDEX IF NOT EXISTS idx_sites_workspace_id
ON sites(workspace_id)
WHERE deleted_at IS NULL;

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_workspace_id
ON projects(workspace_id)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_projects_status
ON projects(status)
WHERE deleted_at IS NULL;

-- Workspace members indexes (for RLS performance)
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id
ON workspace_members(user_id)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id
ON workspace_members(workspace_id)
WHERE deleted_at IS NULL;

-- Composite index for common workspace + user lookups
CREATE INDEX IF NOT EXISTS idx_workspace_members_composite
ON workspace_members(workspace_id, user_id)
WHERE deleted_at IS NULL;
