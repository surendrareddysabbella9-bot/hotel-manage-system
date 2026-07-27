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
      ADD COLUMN IF NOT EXISTS security_answer_hash VARCHAR(255);
    `);

    // For existing users who don't have a security question, set a default one
    // We will hash the answer "admin123" (or something standard) so they can test the reset flow
    // In a real scenario, they would be prompted to set this on next login.
    const bcrypt = await import('bcrypt');
    const defaultHash = await bcrypt.hash('password123', 10);
    
    await pool.query(`
      UPDATE profiles 
      SET security_question = 'What is the default recovery PIN?', 
          security_answer_hash = $1
      WHERE security_question IS NULL;
    `, [defaultHash]);
    
    console.log("Successfully added security question columns and updated existing users.");
  } catch (err) {
    console.error("Error updating schema:", err);
  } finally {
    await pool.end();
  }
}

main();
