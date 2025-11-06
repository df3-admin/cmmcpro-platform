// Vercel Cron job for continuous monitoring
// Runs daily at 9 AM (configured in vercel.json)

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { companies, integrations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { integrationService } from '@/lib/integrations/service';

export async function GET(req: Request) {
  try {
    // Verify cron secret (only Vercel cron can call this)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Starting daily monitoring sync...');

    // Get all companies
    const allCompanies = await db.select().from(companies);

    let syncedCount = 0;
    let errorCount = 0;

    // For each company, sync all their integrations
    for (const company of allCompanies) {
      try {
        console.log(`[CRON] Syncing integrations for company: ${company.name}`);
        await integrationService.syncAllIntegrations(company.id);
        syncedCount++;
      } catch (error) {
        console.error(`[CRON] Failed to sync company ${company.id}:`, error);
        errorCount++;
      }
    }

    console.log(`[CRON] Monitoring sync complete. Synced: ${syncedCount}, Errors: ${errorCount}`);

    return NextResponse.json({ 
      success: true,
      synced: syncedCount,
      errors: errorCount,
    });
  } catch (error) {
    console.error('[CRON] Monitoring sync error:', error);
    return NextResponse.json({ 
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


