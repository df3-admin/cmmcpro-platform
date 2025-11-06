import { auth } from '@/auth';
import { db } from '@/lib/db';
import { companies, userCompanies, controlProgress } from '@/lib/db/schema';
import { getControlsByLevel } from '@/lib/cmmc/controls';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { companyName, industry, companySize, targetLevel } = data;

    if (!companyName || !targetLevel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create company
    const [company] = await db
      .insert(companies)
      .values({
        name: companyName,
        industry,
        companySize,
        targetLevel: targetLevel as 1 | 2,
        onboardingComplete: true,
      })
      .returning();

    // Link user to company
    await db.insert(userCompanies).values({
      userId: session.user.id,
      companyId: company.id,
      role: 'owner',
    });

    // Initialize control progress for all controls in the target level
    const controls = getControlsByLevel(targetLevel);
    const controlProgressRecords = controls.map((control) => ({
      companyId: company.id,
      controlId: control.id,
      level: targetLevel as number,
      status: 'not_started' as const,
      completionPercentage: 0,
      evidenceCount: 0,
    }));

    await db.insert(controlProgress).values(controlProgressRecords);

    return NextResponse.json({ 
      success: true,
      companyId: company.id,
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

