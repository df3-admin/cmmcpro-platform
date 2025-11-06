import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { companies, integrations as integrationsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAllIntegrations, getIntegrationsByCategory } from '@/lib/integrations/registry';
import IntegrationsClient from './IntegrationsClient';

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get existing integrations
  const existingIntegrations = await db
    .select()
    .from(integrationsTable)
    .where(eq(integrationsTable.companyId, id));

  // Get all available integrations
  const availableIntegrations = getAllIntegrations();

  // Group by category
  const categories = {
    identity: getIntegrationsByCategory('identity'),
    cloud: getIntegrationsByCategory('cloud'),
    endpoint: getIntegrationsByCategory('endpoint'),
    security: getIntegrationsByCategory('security'),
    network: getIntegrationsByCategory('network'),
    devops: getIntegrationsByCategory('devops'),
    backup: getIntegrationsByCategory('backup'),
    collaboration: getIntegrationsByCategory('collaboration'),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600 mt-2">
          Connect your services to automate compliance monitoring and evidence collection
        </p>
      </div>

      <IntegrationsClient
        companyId={id}
        existingIntegrations={existingIntegrations}
        availableIntegrations={availableIntegrations}
        categories={categories}
      />
    </div>
  );
}


