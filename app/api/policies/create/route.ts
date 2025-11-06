import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { policies } from '@/lib/db/schema';
import { syncUser } from '@/lib/clerk/sync-user';

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await syncUser();
    if (!user) {
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
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
        createdBy: user.id,
        approvedBy: status === 'approved' ? user.id : null,
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

