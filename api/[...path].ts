import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

// مسار مؤقت لتخزين قاعدة البيانات المحلية على سيرفر Vercel
const DB_FILE = '/tmp/bkbeauty_db.json';

// بيانات افتراضية أولية في حال لم تكن موجودة
const INITIAL_DB = {
  products: [],
  categories: [
    { id: 'cat_1', nameFr: 'Visage', nameAr: 'الوجه', slug: 'visage' },
    { id: 'cat_2', nameFr: 'Yeux', nameAr: 'العينين', slug: 'yeux' },
    { id: 'cat_3', nameFr: 'Lèvres', nameAr: 'الشفاه', slug: 'levres' },
    { id: 'cat_4', nameFr: 'Teint', nameAr: 'البشرة', slug: 'teint' }
  ],
  settings: {
    storeName: 'BK Beauty',
    currency: 'DZD',
    shippingFee: 500
  },
  orders: []
};

function getDbData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading db', e);
  }
  return INITIAL_DB;
}

function saveDbData(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving db', e);
  }
}

export default async function handler(req: VercelRequest, reqRes: VercelResponse) {
  // تفعيل CORS لضمان عدم حظر الطلبات
  reqRes.setHeader('Access-Control-Allow-Credentials', 'true');
  reqRes.setHeader('Access-Control-Allow-Origin', '*');
  reqRes.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  reqRes.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    reqRes.status(200).end();
    return;
  }

  const url = req.url || '';
  const db = getDbData();

  // --- 1. Authentication ---
  if (url.includes('/api/admin/login')) {
    if (req.method === 'POST') {
      const { email, password } = req.body || {};
      const username = (email || '').trim().toLowerCase();
      if ((username === 'admin@bkbeauty.dz' || username === 'admin') && password === 'admin12345678') {
        return reqRes.status(200).json({
          success: true,
          user: { id: 'admin_1', email: 'admin@bkbeauty.dz', name: 'BK Beauty Admin', role: 'admin' }
        });
      }
      return reqRes.status(401).json({ error: 'Identifiants invalides.' });
    }
  }

  if (url.includes('/api/admin/me')) {
    return reqRes.status(200).json({
      user: { id: 'admin_1', email: 'admin@bkbeauty.dz', name: 'BK Beauty Admin', role: 'admin' }
    });
  }

  // --- 2. Public Storefront Data ---
  if (url.includes('/api/public/products') || url.includes('/api/admin/products')) {
    if (req.method === 'GET') {
      return reqRes.status(200).json({ success: true, products: db.products || [] });
    }
    if (req.method === 'POST' || req.method === 'PUT') {
      const item = req.body;
      if (!item.id) {
        item.id = 'prod_' + Date.now();
      }
      const index = db.products.findIndex((p: any) => p.id === item.id);
      if (index >= 0) {
        db.products[index] = { ...db.products[index], ...item };
      } else {
        db.products.push(item);
      }
      saveDbData(db);
      return reqRes.status(200).json({ success: true, product: item });
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      db.products = db.products.filter((p: any) => p.id !== id);
      saveDbData(db);
      return reqRes.status(200).json({ success: true });
    }
  }

  if (url.includes('/api/public/categories')) {
    return reqRes.status(200).json({ success: true, categories: db.categories || INITIAL_DB.categories });
  }

  if (url.includes('/api/public/settings')) {
    return reqRes.status(200).json({ success: true, settings: db.settings || INITIAL_DB.settings });
  }

  // --- 3. Orders Management ---
  if (url.includes('/api/admin/orders') || url.includes('/api/public/orders')) {
    if (req.method === 'GET') {
      return reqRes.status(200).json({ success: true, orders: db.orders || [] });
    }
    if (req.method === 'POST') {
      const order = req.body;
      order.id = 'BK-' + Math.floor(100000 + Math.random() * 900000);
      order.createdAt = new Date().toISOString();
      db.orders.unshift(order);
      saveDbData(db);
      return reqRes.status(200).json({ success: true, order });
    }
  }

  return reqRes.status(200).json({ success: true, message: 'Endpoint handled successfully' });
}