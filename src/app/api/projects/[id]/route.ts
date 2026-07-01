import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-error';
import { createSitesService } from '@/services/sites.service';
import { updateSiteSchema } from '@/lib/validations/site.schema';

/**
 * GET /api/projects/[id]
 * ponytail: Service layer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const service = await createSitesService();
    const project = await service.getSite(params.id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * PATCH /api/projects/[id]
 * ponytail: Zod validation + service layer
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const body = await request.json();
    const validated = updateSiteSchema.parse(body);

    const service = await createSitesService();
    const project = await service.updateSite(params.id, validated);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * DELETE /api/projects/[id]
 * ponytail: Soft delete via service layer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const service = await createSitesService();
    const success = await service.deleteSite(params.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
