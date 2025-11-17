import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL');
}

// Vercel/Supabaseでも動くようプール使う
export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Supabase向け。ローカルPostgresなら外してOK
});

export async function query<T = any>(text: string, params?: any[]) {
  const res = await pool.query(text, params);
  return res as { rows: T[] };
}
