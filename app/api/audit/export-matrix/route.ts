import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { companies, controlProgress, evidence } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { CMMC_DATA } from '@/lib/cmmc/controls';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = await request.json();

    // Get company
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get all control progress
    const controls = await db
      .select()
      .from(controlProgress)
      .where(eq(controlProgress.companyId, companyId));

    // Get evidence counts
    const evidenceCounts = await db
      .select({
        controlId: evidence.controlId,
        count: sql<number>`count(*)::int`,
      })
      .from(evidence)
      .where(eq(evidence.companyId, companyId))
      .groupBy(evidence.controlId);

    // Build compliance matrix
    const matrix = controls.map(control => {
      const controlData = CMMC_DATA.levels['1'].controls.find(c => c.id === control.controlId) ||
                          CMMC_DATA.levels['2'].controls.find(c => c.id === control.controlId);
      
      const evidenceCount = evidenceCounts.find(e => e.controlId === control.controlId)?.count || 0;

      return {
        controlId: control.controlId,
        title: controlData?.title || control.controlId,
        domain: controlData?.domain || 'Unknown',
        status: control.status,
        completionPercentage: control.completionPercentage,
        evidenceCount,
        lastUpdated: control.lastUpdated,
      };
    });

    // Generate CSV
    const csv = [
      ['Control ID', 'Title', 'Domain', 'Status', 'Completion %', 'Evidence Count', 'Last Updated'],
      ...matrix.map(row => [
        row.controlId,
        row.title,
        row.domain,
        row.status,
        row.completionPercentage.toString(),
        row.evidenceCount.toString(),
        new Date(row.lastUpdated).toISOString(),
      ])
    ].map(row => row.join(',')).join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${company.name}-compliance-matrix-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export matrix error:', error);
    return NextResponse.json(
      { error: 'Failed to export compliance matrix' },
      { status: 500 }
    );
  }
}


