import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { integrationService } from '@/lib/integrations/service';

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    const integrations = await integrationService.getCompanyIntegrations(companyId);

    return NextResponse.json({ 
      success: true,
      integrations,
    });
  } catch (error) {
    console.error('Integration list error:', error);
    return NextResponse.json({ 
      error: 'Failed to list integrations'
    }, { status: 500 });
  }
}


