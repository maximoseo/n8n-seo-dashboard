import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/audits
 * List all audit jobs (optionally filtered by project)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('audit_jobs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (projectId) {
      query = query.eq('site_id', projectId);
    }

    const { data: audits, error, count } = await query;

    if (error) {
      console.error('Failed to fetch audits:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audits' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      audits: audits || [],
      total: count || 0,
      offset,
      limit,
    });
  } catch (error) {
    console.error('GET /api/audits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audits
 * Trigger a new audit job
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { site_id, audit_type = 'full' } = body;

    if (!site_id) {
      return NextResponse.json(
        { error: 'site_id is required' },
        { status: 400 }
      );
    }

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('sites')
      .select('id, url')
      .eq('id', site_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Create audit job
    const { data: audit, error: createError } = await supabase
      .from('audit_jobs')
      .insert({
        site_id,
        status: 'pending',
        audit_type,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError || !audit) {
      console.error('Failed to create audit:', createError);
      return NextResponse.json(
        { error: 'Failed to create audit' },
        { status: 500 }
      );
    }

    // Trigger N8N workflow
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET || '',
          },
          body: JSON.stringify({
            audit_id: audit.id,
            site_id,
            url: project.url,
            audit_type,
          }),
        });
        console.log(`N8N webhook triggered for audit ${audit.id}`);
      } catch (webhookError) {
        console.error('Failed to trigger N8N webhook:', webhookError);
        // Don't fail the request if webhook fails
      }
    } else {
      console.log(`Audit ${audit.id} created (N8N webhook not configured)`);
    }

    return NextResponse.json({
      success: true,
      audit,
      message: 'Audit job created successfully',
    });
  } catch (error) {
    console.error('POST /api/audits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
