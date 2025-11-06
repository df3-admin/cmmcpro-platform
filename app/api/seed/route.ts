import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';

export async function GET(req: Request) {
  try {
    // Only allow in development or with a secret key
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    
    if (process.env.NODE_ENV === 'production' && secret !== process.env.SEED_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await seedDatabase();
    
    return NextResponse.json({ 
      success: true,
      message: 'Database seeded successfully. You can now login with username: df3, password: 1223'
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

