import pkg from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    // 1. Ensure auth schema and auth.users exist
    await pool.query(`
      CREATE SCHEMA IF NOT EXISTS auth;
      CREATE TABLE IF NOT EXISTS auth.users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE
      );
    `);

    // 2. Add columns to profiles if missing
    await pool.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS security_question VARCHAR(255),
      ADD COLUMN IF NOT EXISTS security_answer_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS loyalty_tier VARCHAR(50) DEFAULT 'Bronze';
    `);

    const bcrypt = await import('bcrypt');
    const defaultHash = await bcrypt.hash('butter chicken', 10);
    
    await pool.query(`
      UPDATE profiles 
      SET security_question = 'What is the most loved item in our restaurant?', 
          security_answer_hash = $1
      WHERE security_question IS NULL OR security_question = 'What is the name of your first pet?' OR security_question = 'What is the default recovery PIN?';
    `, [defaultHash]);
    
    const staffHash = await bcrypt.hash('Staff@123', 10);
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const customerHash = await bcrypt.hash('Laddu@123', 10);

    // Helper to ensure profile exists
    async function ensureUser(email, fullName, roleName, passwordHash) {
      const roleRes = await pool.query("SELECT id FROM roles WHERE name ILIKE $1", [roleName]);
      if (roleRes.rows.length === 0) return;
      const roleId = roleRes.rows[0].id;

      const profRes = await pool.query("SELECT id FROM profiles WHERE email = $1", [email]);
      if (profRes.rows.length === 0) {
        const userId = crypto.randomUUID();
        await pool.query("INSERT INTO auth.users (id, email) VALUES ($1, $2) ON CONFLICT DO NOTHING", [userId, email]);
        await pool.query(
          "INSERT INTO profiles (id, role_id, email, full_name, password_hash, security_question, security_answer_hash) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [userId, roleId, email, fullName, passwordHash, 'What is the most loved item in our restaurant?', defaultHash]
        );
        console.log(`✅ Created demo profile: ${email}`);
      } else {
        await pool.query(
          "UPDATE profiles SET role_id = $1, password_hash = $2 WHERE email = $3",
          [roleId, passwordHash, email]
        );
        console.log(`✅ Updated demo profile credentials: ${email}`);
      }
    }

    await ensureUser('staff@gmail.com', 'Staff Demo', 'Waiter', staffHash);
    await ensureUser('admin@gmail.com', 'Admin Demo', 'Admin', adminHash);
    await ensureUser('anilreddysbs@gmail.com', 'Anil Reddy', 'Customer', customerHash);
    await ensureUser('admin@restaurantos.in', 'Admin RestaurantOS', 'Admin', adminHash);
    
    console.log("🎉 Successfully verified and updated demo credentials.");
  } catch (err) {
    console.error("❌ Error updating profiles schema/users:", err);
  } finally {
    await pool.end();
  }
}

main();
