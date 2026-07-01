/**
 * Projects API Client
 * ponytail: Type-safe API calls with proper error handling
 */

import type { CreateSiteInput, UpdateSiteInput } from '@/lib/validations/site.schema';

export interface Project {
  id: string;
  name: string;
  url: string;
  workspace_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface ProjectsListResponse {
  projects: Project[];
  total: number;
}

export interface ProjectResponse {
  project: Project;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface ProjectFilter {
  workspace_id?: string;
  status?: 'active' | 'inactive';
}

/**
 * Extract backend error message from response
 * ponytail: Backend returns structured ErrorResponse
 */
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data?.error?.message || data?.error || 'Request failed';
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export const projectsApi = {
  /**
   * List all projects with optional filters
   */
  async list(filter?: ProjectFilter): Promise<ProjectsListResponse> {
    const params = new URLSearchParams();
    if (filter?.workspace_id) params.set('workspace_id', filter.workspace_id);
    if (filter?.status) params.set('status', filter.status);

    const url = `/api/projects${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      throw new Error(message);
    }

    return response.json();
  },

  /**
   * Get single project by ID
   */
  async get(id: string): Promise<Project> {
    const response = await fetch(`/api/projects/${id}`);

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      throw new Error(message);
    }

    const data = await response.json();
    return data.project;
  },

  /**
   * Create new project
   */
  async create(input: CreateSiteInput): Promise<Project> {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      throw new Error(message);
    }

    const data = await response.json();
    return data.project;
  },

  /**
   * Update existing project
   */
  async update(id: string, input: UpdateSiteInput): Promise<Project> {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      throw new Error(message);
    }

    const data = await response.json();
    return data.project;
  },

  /**
   * Delete project (soft delete)
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      throw new Error(message);
    }
  },
};
