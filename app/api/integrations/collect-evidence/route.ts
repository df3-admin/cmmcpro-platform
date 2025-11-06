import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { integrationService } from '@/lib/integrations/service';
import { db } from '@/lib/db';
import { evidence, controlProgress } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId, controlId } = await req.json();

    if (!companyId || !controlId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Collect evidence from all connected integrations
    const collectedEvidence = await integrationService.collectEvidenceForControl(
      companyId,
      controlId
    );

    if (collectedEvidence.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'No evidence collected. Make sure you have integrations connected.',
        evidenceCount: 0,
      });
    }

    // Store evidence in database
    const savedEvidence = [];
    for (const ev of collectedEvidence) {
      const [saved] = await db
        .insert(evidence)
        .values({
          companyId,
          controlId: ev.controlId,
          fileName: `auto-${ev.metadata.source}-${Date.now()}.json`,
          fileUrl: `data:application/json;base64,${Buffer.from(JSON.stringify(ev.data)).toString('base64')}`,
          fileType: 'application/json',
          fileSize: JSON.stringify(ev.data).length,
          uploaderId: session.user.id,
          aiReviewStatus: ev.complianceStatus === 'compliant' ? 'approved' : 'needs_rework',
          aiFeedback: ev.findings?.join('\n'),
          aiConfidence: ev.confidence,
        })
        .returning();

      savedEvidence.push(saved);
    }

    // Update control progress
    const [currentProgress] = await db
      .select()
      .from(controlProgress)
      .where(
        and(
          eq(controlProgress.companyId, companyId),
          eq(controlProgress.controlId, controlId)
        )
      )
      .limit(1);

    const newEvidenceCount = (currentProgress?.evidenceCount || 0) + savedEvidence.length;
    const hasCompliantEvidence = collectedEvidence.some(e => e.complianceStatus === 'compliant');
    const avgConfidence = collectedEvidence.reduce((sum, e) => sum + e.confidence, 0) / collectedEvidence.length;

    const newStatus = hasCompliantEvidence && avgConfidence >= 80 
      ? 'approved' 
      : 'evidence_uploaded';

    await db
      .update(controlProgress)
      .set({
        status: newStatus,
        evidenceCount: newEvidenceCount,
        completionPercentage: hasCompliantEvidence && avgConfidence >= 80 ? 100 : 75,
        lastUpdated: new Date(),
      })
      .where(
        and(
          eq(controlProgress.companyId, companyId),
          eq(controlProgress.controlId, controlId)
        )
      );

    return NextResponse.json({ 
      success: true,
      evidenceCount: savedEvidence.length,
      evidence: savedEvidence,
      complianceStatus: hasCompliantEvidence ? 'compliant' : 'partial',
      confidence: avgConfidence,
    });
  } catch (error) {
    console.error('Evidence collection error:', error);
    return NextResponse.json({ 
      error: 'Failed to collect evidence',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


