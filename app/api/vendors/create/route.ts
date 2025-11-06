import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { vendors } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId, name, contactEmail, hasAccess, accessDetails, contractStart, contractEnd } = await request.json();

    if (!companyId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [vendor] = await db
      .insert(vendors)
      .values({
        companyId,
        name,
        contactEmail: contactEmail || null,
        hasAccess: hasAccess || false,
        accessDetails: accessDetails || null,
        contractStart: contractStart ? new Date(contractStart) : null,
        contractEnd: contractEnd ? new Date(contractEnd) : null,
        assessmentStatus: 'pending',
        riskScore: null,
      })
      .returning();

    return NextResponse.json({ 
      success: true,
      vendor,
    });
  } catch (error) {
    console.error('Vendor creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}

