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
      WHERE security_question IS NULL OR security_question = 'What is the name of your first pet?';
    `, [defaultHash]);
    
    console.log("Successfully added security question columns and updated existing users.");
  } catch (err) {
    console.error("Error updating schema:", err);
  } finally {
    await pool.end();
  }
}

main();
