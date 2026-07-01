import { z } from 'zod';

/**
 * Site Validation Schemas
 * ponytail: Zod schemas for runtime validation
 */

export const createSiteSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  url: z.string().url('Invalid URL'),
  workspace_id: z.string().uuid('Invalid workspace ID'),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export const updateSiteSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  url: z.string().url().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const siteFilterSchema = z.object({
  workspace_id: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// Type exports
export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
export type SiteFilter = z.infer<typeof siteFilterSchema>;
