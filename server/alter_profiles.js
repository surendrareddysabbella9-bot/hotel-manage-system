import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    await pool.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS security_question VARCHAR(255),
      ADD COLUMN IF NOT EXISTS security_answer_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS loyalty_tier VARCHAR(50) DEFAULT 'Bronze';
    `);

    // For existing users who don't have a security question, set a default one
    const bcrypt = await import('bcrypt');
    const defaultHash = await bcrypt.hash('butter chicken', 10);
    
    await pool.query(`
      UPDATE profiles 
      SET security_question = 'What is the most loved item in our restaurant?', 
          security_answer_hash = $1
      WHERE security_question IS NULL OR security_question = 'What is the name of your first pet?' OR security_question = 'What is the default recovery PIN?';
    `, [defaultHash]);
    
    // Ensure Staff and Admin demo users exist with correct roles
    const staffHash = await bcrypt.hash('Staff@123', 10);
    const adminHash = await bcrypt.hash('Admin@123', 10);

    const staffRole = await pool.query("SELECT id FROM roles WHERE name ILIKE 'Waiter'");
    if (staffRole.rows.length > 0) {
      const staffRes = await pool.query("SELECT id FROM profiles WHERE email = 'staff@gmail.com'");
      if (staffRes.rows.length === 0) {
        await pool.query(
          "INSERT INTO profiles (role_id, email, full_name, password_hash, security_question, security_answer_hash) VALUES ($1, $2, $3, $4, $5, $6)", 
          [staffRole.rows[0].id, 'staff@gmail.com', 'Staff Demo', staffHash, 'What is the most loved item in our restaurant?', defaultHash]
        );
      } else {
        await pool.query("UPDATE profiles SET role_id = $1 WHERE email = 'staff@gmail.com'", [staffRole.rows[0].id]);
      }
    }

    const adminRole = await pool.query("SELECT id FROM roles WHERE name ILIKE 'Admin'");
    if (adminRole.rows.length > 0) {
      const adminRes = await pool.query("SELECT id FROM profiles WHERE email = 'admin@gmail.com'");
      if (adminRes.rows.length === 0) {
        await pool.query(
          "INSERT INTO profiles (role_id, email, full_name, password_hash, security_question, security_answer_hash) VALUES ($1, $2, $3, $4, $5, $6)", 
          [adminRole.rows[0].id, 'admin@gmail.com', 'Admin Demo', adminHash, 'What is the most loved item in our restaurant?', defaultHash]
        );
      } else {
        await pool.query("UPDATE profiles SET role_id = $1 WHERE email = 'admin@gmail.com'", [adminRole.rows[0].id]);
      }
    }
    
    console.log("Successfully added security question columns and updated existing users.");
  } catch (err) {
    console.error("Error updating schema:", err);
  } finally {
    await pool.end();
  }
}

main();
