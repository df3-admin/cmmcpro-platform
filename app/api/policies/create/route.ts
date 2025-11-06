import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { policies } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId, title, content, controlIds, status } = await request.json();

    if (!companyId || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [policy] = await db
      .insert(policies)
      .values({
        companyId,
        title,
        content,
        version: '1.0',
        status: status || 'draft',
        controlIds: controlIds || [],
        createdBy: session.user.id,
        approvedBy: status === 'approved' ? session.user.id : null,
        approvedAt: status === 'approved' ? new Date() : null,
      })
      .returning();

    return NextResponse.json({ 
      success: true,
      policy,
    });
  } catch (error) {
    console.error('Policy creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create policy' },
      { status: 500 }
    );
  }
}

