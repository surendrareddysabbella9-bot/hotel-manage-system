import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL environment variable is missing in .env!");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runSqlFile(filePath, client) {
  const fileName = path.basename(filePath);
  console.log(`⏳ Executing ${fileName}...`);
  const sql = fs.readFileSync(filePath, 'utf8');
  await client.query(sql);
  console.log(`✅ Completed ${fileName}`);
}

async function main() {
  const client = await pool.connect();
  try {
    console.log("🚀 Checking database setup...");

    // Check if database is already initialized and seeded
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reservations'
      );
    `);

    if (checkTable.rows[0].exists) {
      try {
        const checkSeed = await client.query(`SELECT COUNT(*) FROM menu_items;`);
        if (parseInt(checkSeed.rows[0].count, 10) > 0) {
          console.log("ℹ️ Database is already initialized and seeded with menu items. Skipping full reload.");
          return;
        }
      } catch (err) {
        console.log("⚠️ Core tables missing menu items count, running full init...");
      }
    }

    console.log("⏳ Initializing brand new PostgreSQL database...");

    // 1. Ensure auth schema and auth.users exist for standalone Postgres compatibility
    console.log("⏳ Initializing auth schema...");
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS auth;
      CREATE TABLE IF NOT EXISTS auth.users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE
      );
    `);
    console.log("✅ Auth schema initialized.");

    // 2. Execute schema.sql
    const schemaPath = path.join(rootDir, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      await runSqlFile(schemaPath, client);
    } else {
      console.warn("⚠️ schema.sql not found at project root!");
    }

    // 3. Execute seed.sql
    const seedPath = path.join(rootDir, 'seed.sql');
    if (fs.existsSync(seedPath)) {
      await runSqlFile(seedPath, client);
    } else {
      console.warn("⚠️ seed.sql not found at project root!");
    }

    // 4. Execute policies.sql
    const policiesPath = path.join(rootDir, 'policies.sql');
    if (fs.existsSync(policiesPath)) {
      await runSqlFile(policiesPath, client);
    } else {
      console.warn("⚠️ policies.sql not found at project root!");
    }

    console.log("🎉 Database schema and seed data loaded successfully!");
  } catch (err) {
    console.error("❌ Error setting up database:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
