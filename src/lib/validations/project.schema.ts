import { z } from 'zod';

/**
 * Project creation validation schema
 */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters')
    .trim(),

  url: z
    .string()
    .url('Must be a valid URL')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'URL must start with http:// or https://'
    ),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),

  workspace_id: z.string().uuid().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/**
 * Project update validation schema
 */
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters')
    .trim()
    .optional(),

  url: z
    .string()
    .url('Must be a valid URL')
    .optional(),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),

  status: z.enum(['active', 'paused', 'archived']).optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

/**
 * Project response type
 */
export interface Project {
  id: string;
  workspace_id: string | null;
  name: string;
  url: string;
  description: string | null;
  status: 'active' | 'paused' | 'archived';
  health_score: number;
  last_audit_at: string | null;
  created_at: string;
  updated_at: string | null;
}
