import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { pool } from '../db.js';

const router = express.Router();

// Get API Key from Render environment variables
const apiKey = process.env.GEMINI_API_KEY;

// Create an instance of the Google Generative AI client
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

router.post('/recommend', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: 'AI features are not configured on the server.' });
  }

  try {
    const { cartItems } = req.body;
    
    // Fetch all available menu items to recommend from
    const menuRes = await pool.query(`SELECT id, name, category_id, price FROM menu_items WHERE available = true`);
    const menuItems = menuRes.rows;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      You are a smart restaurant recommendation engine.
      A customer currently has the following items in their cart:
      ${JSON.stringify(cartItems, null, 2)}
      
      Here is our current menu:
      ${JSON.stringify(menuItems, null, 2)}

      Based on their cart, recommend 3 add-on items from the menu that pair well. 
      Do NOT recommend items already in their cart.
      Return ONLY a raw JSON array of the recommended item IDs. No markdown, no explanation.
      Example: ["id-1", "id-2", "id-3"]
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Strip markdown if it returned any
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    const recommendedIds = JSON.parse(text);
    
    // Fetch full details of recommended items
    const recommendations = menuItems.filter(item => recommendedIds.includes(item.id));
    
    res.json({ recommendations });
  } catch (error) {
    console.error('AI Recommend Error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

router.get('/analytics', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: 'AI features are not configured on the server.' });
  }

  try {
    // Gather data for AI analysis
    const ordersRes = await pool.query(`
      SELECT o.status, o.total, o.created_at, oi.name as item_name, oi.quantity
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.created_at >= NOW() - INTERVAL '7 days'
    `);
    
    const inventoryRes = await pool.query(`
      SELECT name, quantity, unit, min_threshold
      FROM inventory
    `);

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      You are an expert restaurant operations manager.
      Analyze the following data and generate a JSON report.
      
      Recent Orders (Last 7 days):
      ${JSON.stringify(ordersRes.rows)}
      
      Current Inventory:
      ${JSON.stringify(inventoryRes.rows)}
      
      Output ONLY raw JSON with this exact structure:
      {
        "demandForecast": "1-2 sentence forecast based on popular items",
        "inventoryWarnings": ["warning 1", "warning 2"],
        "bottleneckSummary": "1-2 sentence analysis of order statuses"
      }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    const report = JSON.parse(text);
    res.json(report);
  } catch (error) {
    console.error('AI Analytics Error:', error);
    res.status(500).json({ error: 'Failed to generate AI analytics' });
  }
});

router.post('/chat-order', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: 'AI features are not configured on the server.' });
  }

  try {
    const { message } = req.body;

    const menuRes = await pool.query(`SELECT id, name, price, image_url FROM menu_items WHERE available = true`);
    const menuItems = menuRes.rows;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      You are a friendly, helpful, and agentic restaurant ordering assistant.
      The user just said: "${message}"

      Here is the available menu:
      ${JSON.stringify(menuItems, null, 2)}

      Analyze the user's intent. If they want to order specific items, find the closest matching items from the menu.
      Extract the items they want and their quantities.
      
      You must ONLY reply with raw JSON matching this schema:
      {
        "reply": "Your friendly conversational response to the user, confirming what you added.",
        "itemsToAdd": [
          { "id": "menu_item_id_from_database", "quantity": number }
        ]
      }
      If they didn't order anything, just respond normally in the "reply" field and leave "itemsToAdd" empty.
      Do not use markdown blocks like \`\`\`json. Just raw JSON.
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    const aiResponse = JSON.parse(text);

    // Hydrate the items with full details for the frontend
    const hydratedItems = (aiResponse.itemsToAdd || []).map(item => {
      const menuDetails = menuItems.find(m => m.id === item.id);
      if (menuDetails) {
        return {
          id: menuDetails.id,
          menuItemId: menuDetails.id,
          name: menuDetails.name,
          price: menuDetails.price,
          imageUrl: menuDetails.image_url,
          quantity: item.quantity
        };
      }
      return null;
    }).filter(Boolean);

    res.json({
      reply: aiResponse.reply,
      itemsToAdd: hydratedItems
    });
  } catch (error) {
    console.error('Agentic Chatbot Error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

export default router;
