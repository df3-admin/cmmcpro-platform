import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { companies, controlProgress } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getControlsByLevel, getControlById } from '@/lib/cmmc/controls';
import WizardClient from './WizardClient';

export default async function WizardPage({ params, searchParams }: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ control?: string }>;
}) {
  const { id } = await params;
  const { control: controlIdParam } = await searchParams;
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

  // Get all controls for this level
  const allControls = getControlsByLevel(company.targetLevel as 1 | 2);

  // Get progress for all controls
  const progressData = await db
    .select()
    .from(controlProgress)
    .where(eq(controlProgress.companyId, id));

  // Determine current control
  let currentControlId = controlIdParam;
  
  if (!currentControlId) {
    // Find first non-completed control
    const nextControl = progressData.find(p => p.status !== 'approved');
    currentControlId = nextControl?.controlId || allControls[0].id;
  }

  const currentControl = getControlById(currentControlId, company.targetLevel as 1 | 2);
  
  if (!currentControl) {
    redirect(`/company/${id}`);
  }

  const currentProgress = progressData.find(p => p.controlId === currentControlId);

  // Calculate overall progress
  const approvedCount = progressData.filter(p => p.status === 'approved').length;
  const overallProgress = Math.round((approvedCount / allControls.length) * 100);

  return (
    <WizardClient
      companyId={id}
      company={company}
      currentControl={currentControl}
      currentProgress={currentProgress || null}
      allControls={allControls}
      progressData={progressData}
      overallProgress={overallProgress}
    />
  );
}

