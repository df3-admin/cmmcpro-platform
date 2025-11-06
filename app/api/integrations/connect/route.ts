import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { integrationService } from '@/lib/integrations/service';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId, integrationType, credentials } = await req.json();

    if (!companyId || !integrationType || !credentials) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Add integration
    const integrationId = await integrationService.addIntegration(
      companyId,
      integrationType,
      credentials
    );

    // Start initial sync in background
    integrationService.syncIntegration(integrationId).catch((error) => {
      console.error('Initial sync failed:', error);
    });

    return NextResponse.json({ 
      success: true,
      integrationId,
    });
  } catch (error) {
    console.error('Integration connect error:', error);
    return NextResponse.json({ 
      error: 'Failed to connect integration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


