// Vercel Cron job for evidence renewal
// Runs weekly on Sunday at midnight (configured in vercel.json)

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { companies, controlProgress } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { integrationService } from '@/lib/integrations/service';

export async function GET(req: Request) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Starting evidence renewal...');

    // Get all companies
    const allCompanies = await db.select().from(companies);

    let renewedCount = 0;
    let errorCount = 0;

    // For each company, collect fresh evidence for approved controls
    for (const company of allCompanies) {
      try {
        console.log(`[CRON] Renewing evidence for company: ${company.name}`);

        // Get all approved controls
        const approvedControls = await db
          .select()
          .from(controlProgress)
          .where(eq(controlProgress.companyId, company.id));

        // Collect fresh evidence for each control
        for (const control of approvedControls) {
          if (control.status === 'approved') {
            try {
              await integrationService.collectEvidenceForControl(
                company.id,
                control.controlId
              );
              renewedCount++;
            } catch (error) {
              console.error(`Failed to renew evidence for ${control.controlId}:`, error);
            }
          }
        }
      } catch (error) {
        console.error(`[CRON] Failed to renew evidence for company ${company.id}:`, error);
        errorCount++;
      }
    }

    console.log(`[CRON] Evidence renewal complete. Renewed: ${renewedCount}, Errors: ${errorCount}`);

    return NextResponse.json({ 
      success: true,
      renewed: renewedCount,
      errors: errorCount,
    });
  } catch (error) {
    console.error('[CRON] Evidence renewal error:', error);
    return NextResponse.json({ 
      error: 'Renewal failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


