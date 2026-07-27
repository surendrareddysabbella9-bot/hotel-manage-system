import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { pool } from '../db.js';

const router = express.Router();

// Get API Key from Render environment variables
const apiKey = process.env.GEMINI_API_KEY;

// Create an instance of the Google Generative AI client
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper to gracefully fallback models on 503 (High Demand) errors
async function generateWithRetry(genAI, prompt) {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];
  let lastError = null;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      return await model.generateContent(prompt);
    } catch (err) {
      lastError = err;
      if (err.status === 503) {
        console.warn(`[AI Fallback] ${modelName} returned 503, trying next model...`);
        continue;
      }
      throw err; 
    }
  }
  throw lastError; 
}

router.post('/recommend', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: 'AI features are not configured on the server.' });
  }

  try {
    const { cartItems } = req.body;
    
    // Fetch all available menu items to recommend from
    const menuRes = await pool.query(`SELECT id, name, category_id, price FROM menu_items WHERE available = true`);
    const menuItems = menuRes.rows;

    // Token optimization: Only send necessary fields to AI
    const optimizedMenu = menuItems.map(m => ({ id: m.id, name: m.name }));

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are a smart restaurant recommendation engine.
      A customer currently has the following items in their cart:
      ${JSON.stringify(cartItems, null, 2)}
      
      Here is our current menu:
      ${JSON.stringify(optimizedMenu, null, 2)}

      Based on their cart, recommend 3 add-on items from the menu that pair well. 
      Do NOT recommend items already in their cart.
      Return ONLY a raw JSON array of the recommended item IDs. No markdown, no explanation.
      Example: ["id-1", "id-2", "id-3"]
    `;

    const result = await generateWithRetry(genAI, prompt);
    let text = result.response.text().trim();
    
    // Extract JSON array
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found");
    
    const recommendedIds = JSON.parse(jsonMatch[0]);
    
    // Fetch full details of recommended items
    const recommendations = menuItems
      .filter(item => recommendedIds.includes(item.id))
      .map(item => ({ ...item, price: Number(item.price) }));
    
    res.json({ recommendations });
  } catch (error) {
    console.error('AI Recommend Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate recommendations' });
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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

    const result = await generateWithRetry(genAI, prompt);
    let text = result.response.text().trim();
    
    // Extract JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON object found");

    const report = JSON.parse(jsonMatch[0]);
    res.json(report);
  } catch (error) {
    console.error('AI Analytics Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI analytics' });
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

    // Token optimization
    const optimizedMenu = menuItems.map(m => ({ id: m.id, name: m.name }));

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are a friendly, helpful, and agentic restaurant ordering assistant.
      The user just said: "${message}"

      Here is the available menu:
      ${JSON.stringify(optimizedMenu, null, 2)}

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

    const result = await generateWithRetry(genAI, prompt);
    let text = result.response.text().trim();
    
    // Extract JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON object found: " + text);

    const aiResponse = JSON.parse(jsonMatch[0]);

    // Hydrate the items with full details for the frontend
    const hydratedItems = (aiResponse.itemsToAdd || []).map(item => {
      const menuDetails = menuItems.find(m => m.id === item.id);
      if (menuDetails) {
        return {
          id: menuDetails.id,
          menuItemId: menuDetails.id,
          name: menuDetails.name,
          price: Number(menuDetails.price),
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
    res.status(500).json({ error: error.message || 'Failed to process chat request' });
  }
});

router.post('/autocomplete', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: 'AI features are not configured.' });
  }

  try {
    const { query } = req.body;
    if (!query || query.length < 2) return res.json({ suggestions: [] });

    // Fetch simplified menu for context
    const menuRes = await pool.query(`SELECT name, tags FROM menu_items WHERE available = true`);
    const optimizedMenu = menuRes.rows.map(m => ({ name: m.name, tags: m.tags }));

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are a predictive search engine for a restaurant. 
      The user is typing: "${query}"

      Menu context:
      ${JSON.stringify(optimizedMenu)}

      Predict exactly 3 relevant menu items or short search queries they might be looking for. 
      Return ONLY a raw JSON array of 3 string suggestions. Example: ["Spicy Chicken", "Chicken Biryani", "Butter Chicken"]
    `;

    const result = await generateWithRetry(genAI, prompt);
    let text = result.response.text().trim();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found");

    const suggestions = JSON.parse(jsonMatch[0]);
    res.json({ suggestions });
  } catch (error) {
    console.error('AI Autocomplete Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate suggestions' });
  }
});

export default router;
