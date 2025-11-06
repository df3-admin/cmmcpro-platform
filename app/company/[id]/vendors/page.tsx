import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import VendorManagementClient from './VendorManagementClient';
import { db } from '@/lib/db';
import { companies, vendors } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export default async function VendorsPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get all vendors for this company
  const companyVendors = await db
    .select()
    .from(vendors)
    .where(eq(vendors.companyId, id))
    .orderBy(desc(vendors.createdAt));

  return (
    <VendorManagementClient
      companyId={id}
      companyName={company.name}
      vendors={companyVendors}
    />
  );
}

