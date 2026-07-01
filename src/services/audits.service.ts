import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { APIError, ErrorCodes } from '@/lib/api-error';
import type { CreateAuditInput, AuditFilter } from '@/lib/validations/audit.schema';

/**
 * Audits Service
 * ponytail: Single responsibility - audit data access
 */

interface AuditJob {
  id: string;
  site_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  type: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

interface AuditResults {
  audit_id: string;
  scores: {
    technical: number;
    content: number;
    performance: number;
    overall: number;
  };
  issues: Array<{
    category: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
  }>;
}

export class AuditsService {
  constructor(private supabase: SupabaseClient) {}

  async getAudits(filter?: AuditFilter): Promise<AuditJob[]> {
    let query = this.supabase
      .from('seo_audit_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter?.site_id) {
      query = query.eq('site_id', filter.site_id);
    }

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }

    const { data, error } = await query;
    if (error) {
      throw new APIError(
        500,
        ErrorCodes.DB_ERROR,
        'Failed to fetch audits',
        error
      );
    }

    return data as AuditJob[];
  }

  async getAudit(id: string): Promise<AuditJob | null> {
    const { data, error } = await this.supabase
      .from('seo_audit_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new APIError(
        500,
        ErrorCodes.DB_ERROR,
        'Failed to fetch audit',
        error
      );
    }

    return data as AuditJob;
  }

  async createAudit(input: CreateAuditInput): Promise<AuditJob> {
    const { data, error } = await this.supabase
      .from('seo_audit_jobs')
      .insert({
        site_id: input.site_id,
        status: 'pending',
        type: input.type || 'full',
      })
      .select()
      .single();

    if (error) {
      throw new APIError(
        500,
        ErrorCodes.DB_ERROR,
        'Failed to create audit',
        error
      );
    }

    return data as AuditJob;
  }

  async getAuditResults(auditId: string): Promise<AuditResults | null> {
    const { data, error } = await this.supabase
      .from('seo_audit_results')
      .select('*')
      .eq('audit_id', auditId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new APIError(
        500,
        ErrorCodes.DB_ERROR,
        'Failed to fetch audit results',
        error
      );
    }

    return data as AuditResults;
  }
}

// Factory function
export async function createAuditsService() {
  const supabase = await createClient();
  return new AuditsService(supabase);
}
