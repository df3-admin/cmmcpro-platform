import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { trainingSessions } from '@/lib/db/schema';
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

    await db
      .update(trainingSessions)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(trainingSessions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Training cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel training' },
      { status: 500 }
    );
  }
}

