import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { pool } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, fullName, role, securityQuestion, securityAnswer } = req.body;

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

    // 4. Insert into profiles
    let securityAnswerHash = null;
    if (securityAnswer) {
      securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);
    }

    const insertRes = await pool.query(
      `INSERT INTO profiles (role_id, email, full_name, password_hash, security_question, security_answer_hash) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, full_name, created_at`,
      [roleId, email, fullName, passwordHash, securityQuestion || null, securityAnswerHash]
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

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const userRes = await pool.query('SELECT security_question FROM profiles WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      // Return generic success to prevent email enumeration, or specific error depending on strictness
      return res.status(404).json({ error: 'Account not found' });
    }

    let question = userRes.rows[0].security_question;
    if (!question) {
      question = "What is the most loved item in our restaurant?";
    }

    res.json({ question });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, answer, newPassword } = req.body;
  if (!email || !answer || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const userRes = await pool.query('SELECT id, security_answer_hash FROM profiles WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const user = userRes.rows[0];
    let answerHash = user.security_answer_hash;
    
    // If no security question configured, default to '1234'
    if (!answerHash) {
      answerHash = await bcrypt.hash('1234', 10);
    }

    // Verify answer
    const validAnswer = await bcrypt.compare(answer.toLowerCase().trim(), answerHash);
    if (!validAnswer) {
      return res.status(401).json({ error: 'Incorrect answer to security question' });
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE profiles SET password_hash = $1 WHERE id = $2', [passwordHash, user.id]);

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
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

// GET /api/auth/config/google
router.get('/config/google', (req, res) => {
  res.json({ client_id: process.env.GOOGLE_CLIENT_ID || '' });
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token is required' });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(500).json({ error: 'Google Client ID not configured on server' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: clientId,
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;
    const fullName = [payload.given_name, payload.family_name].filter(Boolean).join(' ').trim() || email.split('@')[0];

    // Get or create user
    let userRes = await pool.query('SELECT * FROM profiles WHERE email = $1', [email]);
    let user;

    if (userRes.rows.length === 0) {
      // Create user
      const passwordHash = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
      let roleRes = await pool.query("SELECT id FROM roles WHERE name ILIKE 'Customer'");
      if (roleRes.rows.length === 0) {
        return res.status(500).json({ error: 'Database roles not initialized' });
      }
      const roleId = roleRes.rows[0].id;
      
      const insertRes = await pool.query(
        `INSERT INTO profiles (role_id, email, full_name, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, created_at`,
        [roleId, email, fullName, passwordHash]
      );
      user = insertRes.rows[0];
      user.role_name = 'Customer';
    } else {
      user = userRes.rows[0];
      const roleRes = await pool.query('SELECT name FROM roles WHERE id = $1', [user.role_id]);
      user.role_name = roleRes.rows[0].name;
    }

    const rawRole = (user.role_name || '').toLowerCase();
    const roleVal = (rawRole === 'admin' || rawRole === 'manager') ? 'admin' : (rawRole === 'customer' ? 'customer' : 'staff');

    const jwtToken = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      role: roleVal, 
      fullName: user.full_name, 
      createdAt: user.created_at 
    }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: roleVal,
        createdAt: user.created_at
      },
      token: jwtToken
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(400).json({ error: 'Invalid Google ID Token' });
  }
});

// POST /api/auth/guest — Ephemeral guest session for QR walk-in booking
router.post('/guest', async (req, res) => {
  const { guestName } = req.body;
  if (!guestName || guestName.trim().length === 0) {
    return res.status(400).json({ error: 'Guest name is required' });
  }

  try {
    const guestId = `guest-${crypto.randomUUID()}`;
    const token = jwt.sign(
      { id: guestId, email: `${guestId}@guest.local`, role: 'guest', fullName: guestName.trim(), createdAt: new Date().toISOString() },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      user: {
        id: guestId,
        email: `${guestId}@guest.local`,
        fullName: guestName.trim(),
        role: 'guest',
        createdAt: new Date().toISOString()
      },
      token
    });
  } catch (err) {
    console.error('Guest session error:', err);
    res.status(500).json({ error: 'Failed to create guest session' });
  }
});

export default router;
