/**
 * Sites Service
 * Business logic layer for sites management
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { APIError, ErrorCodes } from '@/lib/api-error';

export interface Site {
  id: string;
  workspace_id: string;
  url: string;
  name: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface SiteFilter {
  workspace_id?: string;
  status?: string;
}

export interface CreateSiteInput {
  workspace_id: string;
  url: string;
  name: string;
}

export interface UpdateSiteInput {
  url?: string;
  name?: string;
}

export class SitesService {
  constructor(private supabase: SupabaseClient) {}

  async getSites(filter?: SiteFilter): Promise<Site[]> {
    let query = this.supabase
      .from('sites')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (filter?.workspace_id) {
      query = query.eq('workspace_id', filter.workspace_id);
    }
    
    const { data, error } = await query;
    if (error) {
      throw new APIError(
        500,
        ErrorCodes.DB_ERROR,
        'Failed to fetch sites',
        error
      );
    }
    
    return data as Site[];
  }

  async getSite(id: string): Promise<Site | null> {
    const { data, error } = await this.supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new APIError(
        500,
        ErrorCodes.DB_ERROR,
        'Failed to fetch site',
        error
      );
    }
    
    return data as Site;
  }

  async createSite(input: CreateSiteInput): Promise<Site> {
    const { data, error } = await this.supabase
      .from('sites')
      .insert({
        workspace_id: input.workspace_id,
        url: input.url,
        name: input.name,
      })
      .select()
      .single();
    
    if (error) {
      throw new APIError(
        500,
        ErrorCodes.DB_ERROR,
        'Failed to create site',
        error
      );
    }
    
    return data as Site;
  }

  async updateSite(id: string, input: UpdateSiteInput): Promise<Site | null> {
    const { data, error } = await this.supabase
      .from('sites')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new APIError(
        500,
        ErrorCodes.DB_ERROR,
        'Failed to update site',
        error
      );
    }
    
    return data as Site;
  }

  async deleteSite(id: string): Promise<boolean> {
    // Soft delete
    const { error } = await this.supabase
      .from('sites')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .is('deleted_at', null);
    
    if (error) {
      throw new APIError(
        500,
        ErrorCodes.DB_ERROR,
        'Failed to delete site',
        error
      );
    }
    
    return true;
  }
}

export async function createSitesService() {
  const supabase = await createClient();
  return new SitesService(supabase);
}
