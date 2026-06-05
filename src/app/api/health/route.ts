import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, any>,
  };

  try {
    // 1. Check Supabase DB
    const { error: dbError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);

    health.checks.supabase = dbError ? 'error' : 'ok';
    if (dbError) {
      health.checks.supabase_details = dbError.message;
    }

    // 2. Check Meta API connectivity
    try {
      // Just ping the basic graph API endpoint
      const metaRes = await fetch('https://graph.facebook.com/v18.0/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      health.checks.meta_api = metaRes.ok || metaRes.status === 400 ? 'ok' : 'error';
    } catch {
      health.checks.meta_api = 'error';
    }

    // 3. Check Environment Variables
    const requiredEnvs = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'META_CLIENT_ID',
      'META_CLIENT_SECRET',
      'META_REDIRECT_URI',
      'CRON_SECRET',
    ];

    const missingEnvs = requiredEnvs.filter((env) => !process.env[env]);
    health.checks.environment = missingEnvs.length === 0 ? 'ok' : missingEnvs;

    // 4. Determine overall status
    const hasErrors = Object.values(health.checks).some((v) => v !== 'ok');
    health.status = hasErrors ? 'warning' : 'ok';

    return NextResponse.json(health, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message || 'Unknown error',
    }, { status: 500 });
  }
}
