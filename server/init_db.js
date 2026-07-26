import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDB() {
  console.log('Initializing database schema and seed data...');

  try {
    // 1. Read schema and seed files
    const schemaPath = path.join(__dirname, '../supabase/migrations/001_schema.sql');
    const seedPath = path.join(__dirname, '../supabase/migrations/002_seed.sql');
    
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');
    let seedSql = fs.readFileSync(seedPath, 'utf8');

    // 2. Modify schema for standalone PostgreSQL (remove Supabase auth dependencies)
    schemaSql = schemaSql.replace(
      'id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,',
      'id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    password_hash VARCHAR(255),'
    );
    // Remove RLS
    schemaSql = schemaSql.replace(/ALTER TABLE .* ENABLE ROW LEVEL SECURITY;/g, '');

    console.log('Resetting Database...');
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    
    console.log('Running Schema...');
    await pool.query(schemaSql);
    console.log('Schema created successfully.');

    // 3. Modify seed for standalone PostgreSQL
    // Remove auth.users inserts and schema
    seedSql = seedSql.replace(/CREATE SCHEMA IF NOT EXISTS auth;/g, '');
    seedSql = seedSql.replace(/CREATE TABLE IF NOT EXISTS auth\.users.*?;/g, '');
    seedSql = seedSql.replace(/INSERT INTO auth\.users.*?;/g, '');

    // Add password_hash to profiles inserts
    const defaultPassword = 'password123';
    const hash = await bcrypt.hash(defaultPassword, 10);

    // Replace the INSERT INTO profiles (...) VALUES (...) with INSERT INTO profiles (..., password_hash) VALUES (..., 'hash')
    // The columns part:
    seedSql = seedSql.replace(
      /INSERT INTO profiles \((.*?)\) VALUES \((.*?)\);/g,
      (match, p1, p2) => `INSERT INTO profiles (${p1}, password_hash) VALUES (${p2}, '${hash}');`
    );

    // Fix array syntax for tags: "['vegetarian']" -> ARRAY['vegetarian']
    seedSql = seedSql.replace(/"\[(.*?)\]"/g, 'ARRAY[$1]');

    console.log('Running Seed (this may take a moment)...');
    await pool.query(seedSql);
    console.log('Seed data inserted successfully.');

    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
}

export { initDB };
