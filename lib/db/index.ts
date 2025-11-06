import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Allow build without DATABASE_URL (for static generation)
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/db';

// Use Neon's HTTP connection for serverless
const sql = neon(DATABASE_URL);
export const db = drizzle(sql, { schema });

export { schema };
export * from './schema';

