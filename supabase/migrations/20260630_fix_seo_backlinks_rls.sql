-- Fix critical security issue: Enable RLS on seo_backlinks table
-- Migration: 20260630_fix_seo_backlinks_rls

-- Enable Row Level Security
ALTER TABLE public.seo_backlinks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own workspace backlinks" ON public.seo_backlinks;
DROP POLICY IF EXISTS "Users can insert own workspace backlinks" ON public.seo_backlinks;
DROP POLICY IF EXISTS "Users can update own workspace backlinks" ON public.seo_backlinks;
DROP POLICY IF EXISTS "Users can delete own workspace backlinks" ON public.seo_backlinks;

-- Policy: Users can only view backlinks from their workspaces
CREATE POLICY "Users can view own workspace backlinks"
ON public.seo_backlinks
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM workspace_members
    WHERE workspace_members.workspace_id = seo_backlinks.workspace_id
    AND workspace_members.user_id = auth.uid()
  )
);

-- Policy: Users can insert backlinks to their workspaces
CREATE POLICY "Users can insert own workspace backlinks"
ON public.seo_backlinks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM workspace_members
    WHERE workspace_members.workspace_id = seo_backlinks.workspace_id
    AND workspace_members.user_id = auth.uid()
  )
);

-- Policy: Users can update backlinks in their workspaces
CREATE POLICY "Users can update own workspace backlinks"
ON public.seo_backlinks
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM workspace_members
    WHERE workspace_members.workspace_id = seo_backlinks.workspace_id
    AND workspace_members.user_id = auth.uid()
  )
);

-- Policy: Users can delete backlinks from their workspaces
CREATE POLICY "Users can delete own workspace backlinks"
ON public.seo_backlinks
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM workspace_members
    WHERE workspace_members.workspace_id = seo_backlinks.workspace_id
    AND workspace_members.user_id = auth.uid()
  )
);

-- Add helpful comment
COMMENT ON TABLE public.seo_backlinks IS 'SEO backlinks data with Row Level Security enabled. Access restricted by workspace membership.';
