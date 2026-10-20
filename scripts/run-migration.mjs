import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const defaultDbUrl = process.env.DATABASE_URL || 'postgresql://postgres.hjbilhbiwddsxdmwenqo:Hisuprabase123%40@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=no-verify';

const connectionString = process.argv[2] || defaultDbUrl;

async function runMigration() {
  console.log('[Migration Runner] Connecting to PostgreSQL database...');
  console.log('[Migration Runner] Host:', connectionString.replace(/:[^:@]+@/, ':****@'));

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('[Migration Runner] Connected successfully!');

    const schemaPath = path.resolve(__dirname, '../src/supabase/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[Migration Runner] Executing src/supabase/schema.sql...');
    await client.query(sql);

    console.log('[Migration Runner] Migration executed successfully!');

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('instagram_accounts', 'account_snapshots', 'reels', 'reel_snapshots', 'reel_comments', 'topics', 'sync_logs')
      ORDER BY table_name;
    `);

    console.log('[Migration Runner] Verified public tables:');
    res.rows.forEach(r => console.log('  - ' + r.table_name));

    // Verify seeded topics
    const topicsRes = await client.query('SELECT id, name FROM topics ORDER BY name;');
    console.log('[Migration Runner] Seeded Urology Topics:');
    topicsRes.rows.forEach(t => console.log(`  - [${t.id}] ${t.name}`));

  } catch (err) {
    console.error('[Migration Runner Error]', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
