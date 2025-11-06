import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import RiskDashboardClient from './RiskDashboardClient';
import { db } from '@/lib/db';
import { companies, controlProgress, evidence, monitoringChecks } from '@/lib/db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';
import { CMMC_DATA } from '@/lib/cmmc/controls';

export default async function RiskAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get company
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, id))
    .limit(1);

  if (!company) {
    redirect('/dashboard');
  }

  // Get control progress
  const controls = await db
    .select()
    .from(controlProgress)
    .where(eq(controlProgress.companyId, id));

  // Get evidence counts
  const evidenceCounts = await db
    .select({
      controlId: evidence.controlId,
      count: sql<number>`count(*)::int`,
    })
    .from(evidence)
    .where(eq(evidence.companyId, id))
    .groupBy(evidence.controlId);

  // Get monitoring check results
  const monitoringResults = await db
    .select({
      controlId: monitoringChecks.controlId,
      status: monitoringChecks.status,
      checkedAt: monitoringChecks.checkedAt,
    })
    .from(monitoringChecks)
    .where(eq(monitoringChecks.companyId, id))
    .orderBy(desc(monitoringChecks.checkedAt));

  // Calculate risk scores for each control
  const controlRisks = controls.map(control => {
    const controlData = CMMC_DATA.levels['1'].controls.find(c => c.id === control.controlId) ||
                        CMMC_DATA.levels['2'].controls.find(c => c.id === control.controlId);
    
    const evidenceCount = evidenceCounts.find(e => e.controlId === control.controlId)?.count || 0;
    const latestCheck = monitoringResults.find(m => m.controlId === control.controlId);

    // Calculate risk score (0-100, where 100 is highest risk)
    let riskScore = 100; // Start with max risk

    // Reduce risk based on control status
    if (control.status === 'approved') {
      riskScore -= 40; // Major risk reduction
    } else if (control.status === 'in_progress') {
      riskScore -= 20;
    }

    // Reduce risk based on evidence
    if (evidenceCount > 0) {
      riskScore -= Math.min(evidenceCount * 10, 30);
    }

    // Adjust based on monitoring results
    if (latestCheck) {
      if (latestCheck.status === 'pass') {
        riskScore -= 20;
      } else if (latestCheck.status === 'fail') {
        riskScore += 10;
      }
    }

    // Ensure risk score is between 0 and 100
    riskScore = Math.max(0, Math.min(100, riskScore));

    // Determine severity based on control domain
    const domain = controlData?.domain || 'Other';
    const criticalDomains = ['Access Control', 'Identification and Authentication', 'Incident Response'];
    const isCritical = criticalDomains.includes(domain);

    return {
      controlId: control.controlId,
      controlName: controlData?.title || control.controlId,
      domain,
      status: control.status,
      evidenceCount,
      riskScore,
      severity: (riskScore > 70 ? 'critical' : riskScore > 40 ? 'high' : riskScore > 20 ? 'medium' : 'low') as 'critical' | 'high' | 'medium' | 'low',
      isCritical,
      lastChecked: latestCheck?.checkedAt,
      monitoringStatus: latestCheck?.status,
    };
  });

  // Calculate overall metrics
  const overallRiskScore = controlRisks.length > 0
    ? Math.round(controlRisks.reduce((sum, c) => sum + c.riskScore, 0) / controlRisks.length)
    : 0;

  const criticalRisks = controlRisks.filter(c => c.severity === 'critical').length;
  const highRisks = controlRisks.filter(c => c.severity === 'high').length;
  const mediumRisks = controlRisks.filter(c => c.severity === 'medium').length;
  const lowRisks = controlRisks.filter(c => c.severity === 'low').length;

  // Calculate domain-level risks
  const domainRisks = controlRisks.reduce((acc, control) => {
    if (!acc[control.domain]) {
      acc[control.domain] = {
        domain: control.domain,
        controls: [],
        avgRiskScore: 0,
      };
    }
    acc[control.domain].controls.push(control);
    return acc;
  }, {} as Record<string, any>);

  Object.values(domainRisks).forEach((domain: any) => {
    domain.avgRiskScore = Math.round(
      domain.controls.reduce((sum: number, c: any) => sum + c.riskScore, 0) / domain.controls.length
    );
  });

  const domainRiskArray = Object.values(domainRisks).sort((a: any, b: any) => b.avgRiskScore - a.avgRiskScore);

  return (
    <RiskDashboardClient
      companyId={id}
      companyName={company.name}
      overallRiskScore={overallRiskScore}
      riskBreakdown={{
        critical: criticalRisks,
        high: highRisks,
        medium: mediumRisks,
        low: lowRisks,
      }}
      controlRisks={controlRisks}
      domainRisks={domainRiskArray}
      targetLevel={company.targetLevel}
    />
  );
}

