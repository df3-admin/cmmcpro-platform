import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import TrainingPlatformClient from './TrainingPlatformClient';
import { db } from '@/lib/db';
import { companies, trainingSessions, userCompanies } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export default async function TrainingPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get all training sessions for this company
  const sessions = await db
    .select()
    .from(trainingSessions)
    .where(eq(trainingSessions.companyId, id))
    .orderBy(desc(trainingSessions.scheduledDate));

  // Get company members count
  const members = await db
    .select()
    .from(userCompanies)
    .where(eq(userCompanies.companyId, id));

  const freeSessions = sessions.filter(s => s.isFreeSession);
  const hasUsedFreeSession = freeSessions.some(s => s.status === 'completed');

  return (
    <TrainingPlatformClient
      companyId={id}
      companyName={company.name}
      sessions={sessions}
      memberCount={members.length}
      hasUsedFreeSession={hasUsedFreeSession}
    />
  );
}

