import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden: Invalid token' });
    req.user = user;
    next();
  });
};

router.use(authenticateToken);

router.get('/', async (req, res) => {
  const query = req.query.q;
  if (!query || query.trim().length === 0) {
    return res.json({ orders: [], menuItems: [], tables: [] });
  }

  const searchPattern = `%${query.trim()}%`;
  const userRole = req.user.role;
  const userId = req.user.id;

  try {
    let ordersQuery, ordersValues;
    
    // RBAC: Customers only see their own orders in search
    if (userRole === 'customer') {
      ordersQuery = `
        SELECT id, order_number, status, total, created_at 
        FROM orders 
        WHERE customer_id = $1 AND (order_number ILIKE $2 OR customer_name ILIKE $2)
        LIMIT 5
      `;
      ordersValues = [userId, searchPattern];
    } else {
      ordersQuery = `
        SELECT id, order_number, status, total, created_at 
        FROM orders 
        WHERE order_number ILIKE $1 OR customer_name ILIKE $1
        LIMIT 5
      `;
      ordersValues = [searchPattern];
    }

    const menuQuery = `
      SELECT id, name, price, category_id 
      FROM menu_items 
      WHERE name ILIKE $1 OR description ILIKE $1
      LIMIT 5
    `;

    // Customers don't typically search for tables, but let's allow basic visibility
    const tablesQuery = `
      SELECT id, number, capacity, section 
      FROM restaurant_tables 
      WHERE section ILIKE $1 OR CAST(number AS TEXT) ILIKE $1
      LIMIT 5
    `;

    const [ordersRes, menuRes, tablesRes] = await Promise.all([
      pool.query(ordersQuery, ordersValues),
      pool.query(menuQuery, [searchPattern]),
      pool.query(tablesQuery, [searchPattern])
    ]);

    res.json({
      orders: ordersRes.rows,
      menuItems: menuRes.rows,
      tables: tablesRes.rows
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to perform global search' });
  }
});

export default router;
