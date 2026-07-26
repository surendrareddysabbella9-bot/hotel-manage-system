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

// Apply auth middleware to all API routes
router.use(authenticateToken);

// Generic GET multiple rows
router.get('/:table', async (req, res) => {
  const { table } = req.params;
  
  // Basic SQL injection prevention (whitelist tables or just restrict characters)
  if (!/^[a-z_]+$/.test(table)) return res.status(400).json({ error: 'Invalid table name' });

  try {
    let query = `SELECT * FROM ${table}`;
    const values = [];
    
    // Very basic filtering (e.g. ?status=pending)
    const filters = Object.entries(req.query).filter(([k]) => k !== 'order' && k !== 'limit');
    if (filters.length > 0) {
      const conditions = filters.map(([key, val], index) => {
        values.push(val);
        return `${key} = $${index + 1}`;
      });
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Basic ordering
    if (req.query.order) {
      const [col, dir] = req.query.order.split('.');
      if (/^[a-z_]+$/.test(col) && (dir === 'asc' || dir === 'desc')) {
         query += ` ORDER BY ${col} ${dir.toUpperCase()}`;
      }
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(`Error fetching from ${table}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Generic GET single row
router.get('/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  if (!/^[a-z_]+$/.test(table)) return res.status(400).json({ error: 'Invalid table name' });

  try {
    const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Custom POST for full order (with items)
router.post('/orders/create-full', async (req, res) => {
  try {
    const { order_number, customer_name, table_id, order_type, subtotal, tax, total, items } = req.body;
    
    const orderRes = await pool.query(
      `INSERT INTO orders (order_number, customer_name, table_id, order_type, status, subtotal, tax, total) 
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7) RETURNING *`,
      [order_number, customer_name, table_id, order_type, subtotal, tax, total]
    );
    const newOrder = orderRes.rows[0];

    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, menu_item_id, name, quantity, unit_price, total_price, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [newOrder.id, item.menu_item_id, item.name, item.quantity, item.unit_price, item.total_price, item.notes || '']
      );
    }

    if (req.io) {
      req.io.emit('orders_created', newOrder);
    }

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generic POST (Insert)
router.post('/:table', async (req, res) => {
  const { table } = req.params;
  if (!/^[a-z_]+$/.test(table)) return res.status(400).json({ error: 'Invalid table name' });

  try {
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);
    
    const columns = keys.join(', ');
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, values);
    
    // Emit event to all connected clients
    if (req.io) {
      req.io.emit(`${table}_created`, result.rows[0]);
    }
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generic PUT/PATCH (Update)
router.patch('/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  if (!/^[a-z_]+$/.test(table)) return res.status(400).json({ error: 'Invalid table name' });

  try {
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);
    
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    values.push(id); // ID is the last parameter

    const query = `UPDATE ${table} SET ${setClause} WHERE id = $${values.length} RETURNING *`;
    const result = await pool.query(query, values);
    
    // --- HACKATHON BONUS: Phase 5 Auto-Inventory Deduction ---
    if (table === 'orders' && req.body.status === 'cooking') {
      try {
        // Find total quantity of items in this order
        const itemsRes = await pool.query('SELECT quantity FROM order_items WHERE order_id = $1', [id]);
        const totalItems = itemsRes.rows.reduce((sum, item) => sum + item.quantity, 0);
        
        if (totalItems > 0) {
          // Deduct basic ingredients based on total items ordered (mock recipe deduction)
          const deduction = totalItems * 0.5;
          await pool.query(`
            UPDATE inventory 
            SET quantity = GREATEST(quantity - $1, 0) 
            WHERE name IN ('Onions', 'Red Tomatoes', 'Whole Paneer', 'Fresh Chicken')
          `, [deduction]);

          // Trigger low stock alerts if thresholds are crossed
          await pool.query(`
            UPDATE inventory 
            SET status = 'low_stock' 
            WHERE quantity <= min_threshold AND status = 'in_stock'
          `);
          
          // Emit inventory update socket event so admin dashboard updates live
          if (req.io) {
            req.io.emit('inventory_updated', { message: 'Inventory deducted for order cooking' });
          }
        }
      } catch (err) {
        console.error('Inventory deduction failed', err);
      }
    }
    // --------------------------------------------------------

    // Emit event to all connected clients
    if (req.io) {
      req.io.emit(`${table}_updated`, result.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generic DELETE
router.delete('/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  if (!/^[a-z_]+$/.test(table)) return res.status(400).json({ error: 'Invalid table name' });

  try {
    const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    // Emit event to all connected clients
    if (req.io) {
      req.io.emit(`${table}_deleted`, { id });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
