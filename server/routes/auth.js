import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, fullName, role } = req.body;

  try {
    // 1. Check if user already exists
    const checkUser = await pool.query('SELECT id FROM profiles WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // 2. Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Get role ID
    const targetRoleName = role === 'admin' ? 'Admin' : role === 'staff' ? 'Waiter' : 'Customer';
    let roleRes = await pool.query('SELECT id FROM roles WHERE name ILIKE $1', [targetRoleName]);
    
    if (roleRes.rows.length === 0) {
      // Fallback to customer if role not found
      roleRes = await pool.query('SELECT id FROM roles WHERE name ILIKE $1', ['Customer']);
    }

    if (roleRes.rows.length === 0) {
      return res.status(500).json({ error: 'Database roles not initialized. Please run seeds.' });
    }
    const roleId = roleRes.rows[0].id;

    // 4. Insert into profiles (Assuming we added a password_hash column to profiles)
    // For a real migration from Supabase, you must ALTER TABLE profiles ADD COLUMN password_hash VARCHAR(255);
    const insertRes = await pool.query(
      `INSERT INTO profiles (role_id, email, full_name, password_hash) 
       VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, created_at`,
      [roleId, email, fullName, passwordHash]
    );

    const user = insertRes.rows[0];

    // 5. Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email, role: role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: role,
        createdAt: user.created_at
      },
      token
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error during signup' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Fetch user by email
    const userRes = await pool.query(`
      SELECT p.id, p.email, p.full_name, p.password_hash, p.created_at, r.name as role_name
      FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.email = $1
    `, [email]);

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userRes.rows[0];

    // 2. Compare password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 3. Map role
    const rawRole = (user.role_name || '').toLowerCase();
    const roleVal = (rawRole === 'admin' || rawRole === 'manager') ? 'admin' : (rawRole === 'customer' ? 'customer' : 'staff');

    // 4. Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: roleVal, fullName: user.full_name, createdAt: user.created_at }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: roleVal,
        createdAt: user.created_at
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized: No token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden: Invalid token' });
    
    // We packed everything in the token for speed, but in a real app you'd query the DB here
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  });
});

export default router;
