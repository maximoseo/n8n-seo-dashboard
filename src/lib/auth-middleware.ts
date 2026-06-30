/**
 * Authentication Middleware
 * Reusable auth checking for API routes
 */

import { createClient } from '@/lib/supabase/server';
import { createError } from './api-error';

export async function requireAuth() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw createError.unauthorized('Authentication required');
  }

  return { user, supabase };
}

export async function requireWorkspaceAccess(workspaceId: string) {
  const { user, supabase } = await requireAuth();

  const { data: membership, error } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  if (error || !membership) {
    throw createError.forbidden('Access to this workspace is forbidden');
  }

  return { user, supabase, membership };
}
