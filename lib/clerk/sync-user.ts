import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

/**
 * Sync Clerk user to database
 * This function checks if a user exists in the database based on their Clerk ID
 * If not, it creates a new user record
 */
export async function syncUser() {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }

    // Check if user already exists in database
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUser.id))
      .limit(1);

    if (existingUser) {
      return existingUser;
    }

    // Create new user in database
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    const username = 
      clerkUser.username || 
      clerkUser.firstName || 
      email.split('@')[0] || 
      'user';

    const [newUser] = await db
      .insert(users)
      .values({
        clerkUserId: clerkUser.id,
        email,
        username,
        role: 'user', // Default role, can be updated via Clerk metadata or admin panel
      })
      .returning();

    return newUser;
  } catch (error) {
    console.error('Error syncing user:', error);
    return null;
  }
}

/**
 * Get user from database by Clerk ID
 */
export async function getUserByClerkId(clerkUserId: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    return user || null;
  } catch (error) {
    console.error('Error getting user by Clerk ID:', error);
    return null;
  }
}

/**
 * Update user role
 */
export async function updateUserRole(clerkUserId: string, role: string) {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.clerkUserId, clerkUserId))
      .returning();

    return updatedUser || null;
  } catch (error) {
    console.error('Error updating user role:', error);
    return null;
  }
}

