import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import MonitoringDashboardClient from './MonitoringDashboardClient';
import { db } from '@/lib/db';
import { companies, integrations, monitoringChecks, controlProgress } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export default async function MonitoringPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get integrations
  const companyIntegrations = await db
    .select()
    .from(integrations)
    .where(eq(integrations.companyId, id));

  // Get recent monitoring checks
  const recentChecks = await db
    .select()
    .from(monitoringChecks)
    .where(eq(monitoringChecks.companyId, id))
    .orderBy(desc(monitoringChecks.checkedAt))
    .limit(50);

  // Get control progress stats
  const progressStats = await db
    .select({
      status: controlProgress.status,
      count: sql<number>`count(*)::int`,
    })
    .from(controlProgress)
    .where(eq(controlProgress.companyId, id))
    .groupBy(controlProgress.status);

  const stats = {
    total: progressStats.reduce((sum, stat) => sum + stat.count, 0),
    approved: progressStats.find(s => s.status === 'approved')?.count || 0,
    in_progress: progressStats.find(s => s.status === 'in_progress')?.count || 0,
  };

  // Calculate monitoring stats
  const monitoringStats = {
    total: recentChecks.length,
    passed: recentChecks.filter(c => c.status === 'pass').length,
    failed: recentChecks.filter(c => c.status === 'fail').length,
    warnings: recentChecks.filter(c => c.status === 'warning').length,
  };

  return (
    <MonitoringDashboardClient 
      companyId={id}
      companyName={company.name}
      integrations={companyIntegrations}
      recentChecks={recentChecks}
      controlStats={stats}
      monitoringStats={monitoringStats}
    />
  );
}

