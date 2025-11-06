import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { integrationService } from '@/lib/integrations/service';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await integrationService.removeIntegration(id);

    return NextResponse.json({ 
      success: true,
    });
  } catch (error) {
    console.error('Integration delete error:', error);
    return NextResponse.json({ 
      error: 'Failed to remove integration'
    }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const status = await integrationService.getIntegrationStatus(id);

    return NextResponse.json({ 
      success: true,
      status,
    });
  } catch (error) {
    console.error('Integration status error:', error);
    return NextResponse.json({ 
      error: 'Failed to get integration status'
    }, { status: 500 });
  }
}


