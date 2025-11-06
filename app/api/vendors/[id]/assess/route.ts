import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { vendors } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { responses, riskScore } = await request.json();

    await db
      .update(vendors)
      .set({
        riskScore,
        assessmentStatus: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, id));

    return NextResponse.json({ 
      success: true,
      riskScore,
    });
  } catch (error) {
    console.error('Vendor assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}

