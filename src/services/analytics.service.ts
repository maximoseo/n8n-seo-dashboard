import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { APIError, ErrorCodes } from '@/lib/api-error';

/**
 * Analytics Service
 * ponytail: Aggregation queries for dashboard stats
 */

interface WorkflowStats {
  total: number;
  active: number;
  inactive: number;
  recent_executions: number;
}

interface SiteMetrics {
  total_audits: number;
  latest_score: number | null;
  avg_score: number | null;
  trend: 'up' | 'down' | 'stable';
}

export class AnalyticsService {
  constructor(private supabase: SupabaseClient) {}

  async getWorkflowStats(workspaceId: string): Promise<WorkflowStats> {
    // Total workflows
    const { count: total, error: totalError } = await this.supabase
      .from('workflows')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId);

    if (totalError) {
      throw new APIError(
        500,
        ErrorCodes.DB_ERROR,
        'Failed to fetch workflow stats',
        totalError
      );
    }

    // Active workflows
    const { count: active, error: activeError } = await this.supabase
      .from('workflows')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('status', 'active');

    if (activeError) {
      throw new APIError(
        500,
        ErrorCodes.DB_ERROR,
        'Failed to fetch active workflows',
        activeError
      );
    }

    return {
      total: total || 0,
      active: active || 0,
      inactive: (total || 0) - (active || 0),
      recent_executions: 0, // ponytail: Add when execution tracking exists
    };
  }

  async getSiteMetrics(siteId: string): Promise<SiteMetrics> {
    // Total audits
    const { count: total_audits, error: countError } = await this.supabase
      .from('seo_audit_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId);

    if (countError) {
      throw new APIError(
        500,
        ErrorCodes.DB_ERROR,
        'Failed to fetch audit count',
        countError
      );
    }

    // Latest score
    const { data: latestAudit, error: latestError } = await this.supabase
      .from('seo_audit_results')
      .select('scores')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latestError && latestError.code !== 'PGRST116') {
      throw new APIError(
        500,
        ErrorCodes.DB_ERROR,
        'Failed to fetch latest score',
        latestError
      );
    }

    const latest_score = latestAudit?.scores?.overall || null;

    // Average score (last 10 audits)
    const { data: recentAudits, error: avgError } = await this.supabase
      .from('seo_audit_results')
      .select('scores')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (avgError) {
      throw new APIError(
        500,
        ErrorCodes.DB_ERROR,
        'Failed to fetch average score',
        avgError
      );
    }

    const avg_score =
      recentAudits && recentAudits.length > 0
        ? recentAudits.reduce((sum, a) => sum + (a.scores?.overall || 0), 0) /
          recentAudits.length
        : null;

    // Trend calculation
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentAudits && recentAudits.length >= 2) {
      const current = recentAudits[0]?.scores?.overall || 0;
      const previous = recentAudits[1]?.scores?.overall || 0;
      if (current > previous + 5) trend = 'up';
      else if (current < previous - 5) trend = 'down';
    }

    return {
      total_audits: total_audits || 0,
      latest_score,
      avg_score,
      trend,
    };
  }
}

// Factory function
export async function createAnalyticsService() {
  const supabase = await createClient();
  return new AnalyticsService(supabase);
}
