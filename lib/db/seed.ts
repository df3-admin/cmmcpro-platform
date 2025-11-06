import { db } from './index';
import { users } from './schema';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  try {
    // Create hardcoded user: df3 / 1223
    const passwordHash = await hash('1223', 10);
    
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, 'df3'))
      .limit(1);

    if (!existingUser) {
      await db.insert(users).values({
        username: 'df3',
        email: 'admin@cmmcpro.com',
        passwordHash,
        role: 'admin',
      });
      console.log('✅ Seeded hardcoded user: df3');
    } else {
      console.log('✅ User df3 already exists');
    }

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

