import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { integrations, monitoringChecks, controlProgress } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { integrationService } from '@/lib/integrations/service';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    // Get all connected integrations for this company
    const companyIntegrations = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.companyId, companyId),
          eq(integrations.status, 'connected')
        )
      );

    if (companyIntegrations.length === 0) {
      return NextResponse.json({ 
        message: 'No connected integrations to check',
        checksRun: 0 
      });
    }

    // Get all approved controls for this company
    const approvedControls = await db
      .select()
      .from(controlProgress)
      .where(
        and(
          eq(controlProgress.companyId, companyId),
          eq(controlProgress.status, 'approved')
        )
      );

    let totalChecksRun = 0;

    // Run checks for each approved control
    for (const control of approvedControls) {
      try {
        // Collect evidence from all integrations for this control
        const evidence = await integrationService.collectEvidenceForControl(
          companyId,
          control.controlId
        );

        // Determine overall status based on evidence
        let overallStatus: 'pass' | 'fail' | 'warning' = 'pass';
        let details: any = {
          message: 'All checks passed',
          evidenceCount: evidence.length,
        };

        if (evidence.length === 0) {
          overallStatus = 'warning';
          details.message = 'No evidence collected from integrations';
        } else {
          const hasNonCompliant = evidence.some(e => e.complianceStatus === 'non_compliant');
          const hasPartial = evidence.some(e => e.complianceStatus === 'partial');

          if (hasNonCompliant) {
            overallStatus = 'fail';
            details.message = 'Non-compliant evidence detected';
          } else if (hasPartial) {
            overallStatus = 'warning';
            details.message = 'Partially compliant';
          } else {
            overallStatus = 'pass';
            details.message = 'All evidence shows compliance';
          }

          details.evidence = evidence.map(e => ({
            source: e.metadata.source,
            status: e.complianceStatus,
            confidence: e.confidence,
          }));
        }

        // Insert monitoring check record
        await db.insert(monitoringChecks).values({
          companyId,
          controlId: control.controlId,
          checkType: 'automated',
          status: overallStatus,
          details,
          checkedAt: new Date(),
        });

        totalChecksRun++;
      } catch (error) {
        console.error(`Failed to check control ${control.controlId}:`, error);
        
        // Log failed check
        await db.insert(monitoringChecks).values({
          companyId,
          controlId: control.controlId,
          checkType: 'automated',
          status: 'fail',
          details: {
            message: 'Check failed to run',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          checkedAt: new Date(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Ran ${totalChecksRun} monitoring checks`,
      checksRun: totalChecksRun,
      controlsChecked: approvedControls.length,
      integrationsUsed: companyIntegrations.length,
    });
  } catch (error) {
    console.error('Run checks error:', error);
    return NextResponse.json(
      { error: 'Failed to run monitoring checks' },
      { status: 500 }
    );
  }
}

