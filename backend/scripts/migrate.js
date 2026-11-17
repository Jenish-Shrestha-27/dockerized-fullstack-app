import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Parse .env
const envPath = path.resolve(process.cwd(), '.env');
const env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
}

const host = process.env.DB_HOST || env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || env.DB_PORT || '5432', 10);
const user = process.env.DB_USERNAME || env.DB_USERNAME || 'postgres';
const password = process.env.DB_PASSWORD || env.DB_PASSWORD;
const database = process.env.DB_DATABASE || env.DB_DATABASE || 'task_management';

async function migrate() {
  // Step 1: Ensure database exists
  const adminClient = new pg.Client({ host, port, user, password, database: 'postgres' });
  try {
    await adminClient.connect();
    const dbCheck = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [database]);
    if (dbCheck.rows.length === 0) {
      console.log(`Database "${database}" does not exist. Creating...`);
      await adminClient.query(`CREATE DATABASE "${database}"`);
      console.log(`Database "${database}" created.`);
    }
  } catch (err) {
    console.error('Warning while checking/creating database:', err.message);
  } finally {
    await adminClient.end().catch(() => {});
  }

  // Step 2: Connect to target database and execute migration
  const client = new pg.Client({ host, port, user, password, database });
  try {
    await client.connect();
    console.log(`Connected to database "${database}".`);

    const schemaFile = path.resolve(process.cwd(), 'src/tasks/schema');
    if (fs.existsSync(schemaFile)) {
      const sql = fs.readFileSync(schemaFile, 'utf-8');
      console.log(`Running migration from ${schemaFile}...`);
      await client.query(sql);
      console.log('Migration executed successfully.');
    }
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

migrate();

