/**
 * Workflows API v2 - Example of refactored route using service layer
 * This is how ALL API routes should look after refactor
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-error';
import { createWorkflowsService } from '@/services/workflows.service';

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const { user } = await requireAuth();

    // 2. Parse query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'active' | 'inactive' | null;
    const workspace_id = searchParams.get('workspace_id');

    // 3. Get service and fetch data
    const workflowsService = await createWorkflowsService();
    const workflows = await workflowsService.getWorkflows({
      ...(status && { status }),
      ...(workspace_id && { workspace_id }),
    });

    // 4. Return response
    return Response.json({ workflows });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const { user } = await requireAuth();

    // 2. Parse and validate body
    const body = await request.json();
    const { name, n8n_id, workspace_id, status = 'active' } = body;

    if (!name || !n8n_id || !workspace_id) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // 3. Create via service
    const workflowsService = await createWorkflowsService();
    const workflow = await workflowsService.createWorkflow({
      name,
      n8n_id,
      workspace_id,
      status,
    });

    // 4. Return response
    return Response.json({ workflow }, { status: 201 });
  } catch (error) {
    return handleAPIError(error);
  }
}
