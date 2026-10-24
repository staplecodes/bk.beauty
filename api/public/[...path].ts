import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

let cachedDb: typeof mongoose | null = null;

async function connectDB() {
  if (cachedDb) return cachedDb;
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }
  cachedDb = await mongoose.connect(process.env.MONGODB_URI);
  return cachedDb;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();
    
    const { path } = req.query;
    const routePath = Array.isArray(path) ? path.join('/') : path;

    if (req.method === 'GET') {
      // Handle GET requests based on what your frontend is asking for
      return res.status(200).json({ 
        success: true, 
        message: `Handled /api/${routePath}`,
        data: [] 
      });
    }

    if (req.method === 'POST') {
      const body = req.body;
      return res.status(201).json({ success: true, data: body });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}