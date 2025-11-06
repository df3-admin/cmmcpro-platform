import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { integrationService } from '@/lib/integrations/service';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Start sync (can be long-running, so consider doing in background)
    await integrationService.syncIntegration(id);

    return NextResponse.json({ 
      success: true,
      message: 'Sync completed successfully',
    });
  } catch (error) {
    console.error('Integration sync error:', error);
    return NextResponse.json({ 
      error: 'Failed to sync integration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


