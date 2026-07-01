import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-error';
import { createAuditsService } from '@/services/audits.service';

/**
 * GET /api/audits
 * ponytail: Service layer pattern with auth middleware
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = request.nextUrl;
    const site_id = searchParams.get('site_id') || undefined;
    const status = searchParams.get('status') as any;

    const service = await createAuditsService();
    const audits = await service.getAudits({ site_id, status });

    return NextResponse.json({ audits });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * POST /api/audits
 * ponytail: Zod validation + service layer + N8N webhook
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();

    // ponytail: Import validation at top when Zod is stable
    const { createAuditSchema } = await import('@/lib/validations/audit.schema');
    const validated = createAuditSchema.parse(body);

    const service = await createAuditsService();
    const audit = await service.createAudit(validated);

    // ponytail: N8N webhook trigger (optional - doesn't fail request)
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET || '',
        },
        body: JSON.stringify({
          audit_id: audit.id,
          site_id: validated.site_id,
          type: validated.type,
        }),
      }).catch(err => console.warn('N8N webhook failed:', err));
    }

    return NextResponse.json({ audit }, { status: 201 });
  } catch (error) {
    return handleAPIError(error);
  }
}
