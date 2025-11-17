import { readFileSync } from 'fs';
import { pool } from '../lib/db';

async function main() {
  const sql = readFileSync('db/schema.sql', 'utf8');
  await pool.query(sql);
  console.log('Schema applied');
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
