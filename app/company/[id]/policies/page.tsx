import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import PolicyManagementClient from './PolicyManagementClient';
import { db } from '@/lib/db';
import { companies, policies, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export default async function PoliciesPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get all policies for this company
  const companyPolicies = await db
    .select({
      id: policies.id,
      title: policies.title,
      version: policies.version,
      status: policies.status,
      controlIds: policies.controlIds,
      createdAt: policies.createdAt,
      updatedAt: policies.updatedAt,
      approvedAt: policies.approvedAt,
      creatorName: users.username,
    })
    .from(policies)
    .leftJoin(users, eq(policies.createdBy, users.id))
    .where(eq(policies.companyId, id))
    .orderBy(desc(policies.updatedAt));

  return (
    <PolicyManagementClient
      companyId={id}
      companyName={company.name}
      policies={companyPolicies}
      targetLevel={company.targetLevel}
    />
  );
}

