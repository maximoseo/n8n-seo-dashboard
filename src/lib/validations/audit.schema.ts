import { z } from 'zod';

/**
 * Audit Validation Schemas
 * ponytail: Zod schemas for runtime validation
 */

export const createAuditSchema = z.object({
  site_id: z.string().uuid('Invalid site ID'),
  type: z.enum(['full', 'quick', 'custom']).optional().default('full'),
});

export const auditFilterSchema = z.object({
  site_id: z.string().uuid().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']).optional(),
});

// Type exports
export type CreateAuditInput = z.infer<typeof createAuditSchema>;
export type AuditFilter = z.infer<typeof auditFilterSchema>;
