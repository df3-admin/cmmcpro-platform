import { db } from './index';
import { companies, controlProgress } from './schema';
import { getControlsByLevel } from '@/lib/cmmc/controls';

/**
 * Seed database with initial data
 * 
 * Note: Users are now managed via Clerk authentication.
 * User records are automatically created when users sign up through Clerk.
 * 
 * This seed function can be used to create sample companies or other test data if needed.
 */
export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Users are now managed via Clerk - no password-based seeding needed
    console.log('✅ Users will be created automatically via Clerk sign-up');
    
    // Add any other seed data here (companies, controls, etc.) if needed
    // For example:
    // const [sampleCompany] = await db.insert(companies).values({
    //   name: 'Sample Company',
    //   targetLevel: 1,
    // }).returning();
    
    console.log('✅ Database seeded successfully');
    return { success: true, message: 'Database seeded. Sign up through Clerk to create your user account.' };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

