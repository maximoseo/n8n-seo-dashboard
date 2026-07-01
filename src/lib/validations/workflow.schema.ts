import { z } from 'zod';

/**
 * Workflow Validation Schemas
 * ponytail: Zod schemas for runtime validation
 */

export const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  n8n_id: z.string().min(1, 'N8N ID is required'),
  workspace_id: z.string().uuid('Invalid workspace ID'),
  status: z.enum(['active', 'inactive']).optional().default('active'),
  description: z.string().max(1000).optional(),
});

export const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  description: z.string().max(1000).optional(),
});

export const workflowFilterSchema = z.object({
  workspace_id: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// Type exports
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
export type WorkflowFilter = z.infer<typeof workflowFilterSchema>;
