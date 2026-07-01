import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-error';
import { createSitesService } from '@/services/sites.service';
import { createSiteSchema } from '@/lib/validations/site.schema';

/**
 * GET /api/projects
 * ponytail: Service layer + clean separation
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = request.nextUrl;
    const workspace_id = searchParams.get('workspace_id') || undefined;
    const status = searchParams.get('status') as any;

    const service = await createSitesService();
    const projects = await service.getSites({ workspace_id, status });

    return NextResponse.json({
      projects,
      total: projects.length,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * POST /api/projects
 * ponytail: Zod validation + service layer
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const validated = createSiteSchema.parse(body);

    const service = await createSitesService();
    const project = await service.createSite(validated);

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return handleAPIError(error);
  }
}
