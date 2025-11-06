import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { companies, controlProgress, evidence, policies, integrations } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

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

    // Get control progress stats
    const progressStats = await db
      .select({
        status: controlProgress.status,
        count: sql<number>`count(*)::int`,
      })
      .from(controlProgress)
      .where(eq(controlProgress.companyId, companyId))
      .groupBy(controlProgress.status);

    const stats = {
      total: progressStats.reduce((sum, stat) => sum + stat.count, 0),
      approved: progressStats.find(s => s.status === 'approved')?.count || 0,
      in_progress: progressStats.find(s => s.status === 'in_progress')?.count || 0,
      not_started: progressStats.find(s => s.status === 'not_started')?.count || 0,
    };

    // Get evidence count
    const evidenceStats = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(evidence)
      .where(eq(evidence.companyId, companyId));

    const totalEvidence = evidenceStats[0]?.count || 0;

    // Get policy count
    const policyStats = await db
      .select({
        status: policies.status,
        count: sql<number>`count(*)::int`,
      })
      .from(policies)
      .where(eq(policies.companyId, companyId))
      .groupBy(policies.status);

    const approvedPolicies = policyStats.find(s => s.status === 'approved')?.count || 0;
    const totalPolicies = policyStats.reduce((sum, stat) => sum + stat.count, 0);

    // Get integrations
    const companyIntegrations = await db
      .select()
      .from(integrations)
      .where(eq(integrations.companyId, companyId));

    const connectedIntegrations = companyIntegrations.filter(i => i.status === 'connected').length;

    // Calculate readiness score
    const completionPercentage = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
    const evidenceScore = totalEvidence >= stats.total ? 100 : Math.round((totalEvidence / stats.total) * 100);
    const policyScore = totalPolicies > 0 ? Math.round((approvedPolicies / 10) * 100) : 0; // Expect at least 10 policies
    const integrationScore = Math.min(connectedIntegrations * 20, 100); // 5 integrations = 100

    const overallReadiness = Math.round(
      (completionPercentage * 0.5) + 
      (evidenceScore * 0.3) + 
      (policyScore * 0.1) + 
      (integrationScore * 0.1)
    );

    const isReady = overallReadiness >= 95; // 95% or higher is audit-ready

    const assessment: {
      overallReadiness: number;
      isReady: boolean;
      breakdown: any;
      recommendations: Array<{
        priority: string;
        area: string;
        message: string;
      }>;
    } = {
      overallReadiness,
      isReady,
      breakdown: {
        controls: {
          score: completionPercentage,
          weight: '50%',
          details: `${stats.approved} of ${stats.total} controls approved`,
        },
        evidence: {
          score: evidenceScore,
          weight: '30%',
          details: `${totalEvidence} evidence files collected`,
        },
        policies: {
          score: policyScore,
          weight: '10%',
          details: `${approvedPolicies} of ${totalPolicies} policies approved`,
        },
        integrations: {
          score: integrationScore,
          weight: '10%',
          details: `${connectedIntegrations} integrations connected`,
        },
      },
      recommendations: [],
    };

    // Generate recommendations
    if (completionPercentage < 100) {
      assessment.recommendations.push({
        priority: 'high',
        area: 'Controls',
        message: `Complete ${stats.total - stats.approved} remaining controls`,
      });
    }

    if (totalEvidence < stats.total) {
      assessment.recommendations.push({
        priority: 'high',
        area: 'Evidence',
        message: `Upload evidence for ${stats.total - totalEvidence} more controls`,
      });
    }

    if (approvedPolicies < 5) {
      assessment.recommendations.push({
        priority: 'medium',
        area: 'Policies',
        message: 'Create and approve at least 5 key policies',
      });
    }

    if (connectedIntegrations === 0) {
      assessment.recommendations.push({
        priority: 'medium',
        area: 'Integrations',
        message: 'Connect integrations for automated monitoring',
      });
    }

    if (assessment.recommendations.length === 0) {
      assessment.recommendations.push({
        priority: 'low',
        area: 'Review',
        message: 'Review all evidence and documentation before CB audit',
      });
    }

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error('Readiness assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to perform readiness assessment' },
      { status: 500 }
    );
  }
}


