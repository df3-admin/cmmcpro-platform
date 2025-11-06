import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { geminiService } from '@/lib/ai/gemini';
import { getControlById } from '@/lib/cmmc/controls';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { controlId, level } = await req.json();

    if (!controlId || !level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const control = getControlById(controlId, level);
    
    if (!control) {
      return NextResponse.json({ error: 'Control not found' }, { status: 404 });
    }

    const explanation = await geminiService.explainControl(
      control.id,
      control.title,
      control.practice
    );

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('AI explain error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

