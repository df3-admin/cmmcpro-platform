import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { trainingSessions } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      companyId, 
      topic, 
      scheduledDate, 
      attendeeCount, 
      notes, 
      isFreeSession 
    } = await request.json();

    if (!companyId || !scheduledDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [trainingSession] = await db
      .insert(trainingSessions)
      .values({
        companyId,
        userId: session.user.id,
        status: 'scheduled',
        scheduledDate: new Date(scheduledDate),
        sessionType: 'live',
        isFreeSession: isFreeSession || false,
        notes: `${topic || 'Training Session'}${notes ? '\n\n' + notes : ''}${attendeeCount ? `\n\nAttendees: ${attendeeCount}` : ''}`,
        // In production, instructor would be assigned by admin
        instructorName: 'TBD',
        // In production, meeting URL would be generated (Zoom/Teams)
        meetingUrl: null,
      })
      .returning();

    return NextResponse.json({ 
      success: true,
      session: trainingSession,
    });
  } catch (error) {
    console.error('Training scheduling error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule training' },
      { status: 500 }
    );
  }
}

