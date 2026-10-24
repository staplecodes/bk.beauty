import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return app(req, res);
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: error?.message || 'Unknown error',
      stack: error?.stack,
    });
  }
}