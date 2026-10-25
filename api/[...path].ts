import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';

const DB_FILE = '/tmp/bkbeauty_db.json';

// منتجات افتراضية لضمان عدم ظهور المتجر فارغاً أبدياً
const INITIAL_DB = {
  products: [
    {
      id: 'prod_1',
      sku: 'BK-001',
      nameFr: 'Sérum Éclat Visage',
      nameAr: 'سيروم إشراقة الوجه',
      descriptionFr: 'Sérum hydratant et illuminateur à la vitamine C.',
      descriptionAr: 'سيروم مرطب ومضيء للبشرة فيتامين سي.',
      price: 3500,
      category: 'visage',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
      inStock: true,
      stockQuantity: 20,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_2',
      sku: 'BK-002',
      nameFr: 'Rouge à Lèvres Mat',
      nameAr: 'أحمر شفاه مطفي',
      descriptionFr: 'Rouge à lèvres longue tenue effet velours.',
      descriptionAr: 'أحمر شفاه ثابت طويل المدى بملمس مخملي.',
      price: 1800,
      category: 'levres',
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800',
      inStock: true,
      stockQuantity: 35,
      createdAt: new Date().toISOString()
    }
  ],
  categories: [
    { id: 'visage', nameFr: 'Visage', nameAr: 'الوجه' },
    { id: 'yeux', nameFr: 'Yeux', nameAr: 'العينين' },
    { id: 'levres', nameFr: 'Lèvres', nameAr: 'الشفاه' },
    { id: 'teint', nameFr: 'Teint', nameAr: 'البشرة' }
  ],
  settings: {
    storeName: 'BK Beauty',
    currency: 'DZD'
  },
  orders: []
};

function getDbData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && parsed.products && parsed.products.length > 0) {
        return parsed;
      }
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = req.url || '';
  const db = getDbData();

  // --- Login ---
  if (url.includes('/api/admin/login')) {
    if (req.method === 'POST') {
      const { email, password } = req.body || {};
      const username = (email || '').trim().toLowerCase();
      if ((username === 'admin@bkbeauty.dz' || username === 'admin') && password === 'admin12345678') {
        return res.status(200).json({
          success: true,
          user: { id: 'admin_1', email: 'admin@bkbeauty.dz', name: 'BK Beauty Admin', role: 'admin' }
        });
      }
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }
  }

  if (url.includes('/api/admin/me')) {
    return res.status(200).json({
      user: { id: 'admin_1', email: 'admin@bkbeauty.dz', name: 'BK Beauty Admin', role: 'admin' }
    });
  }

  // --- Products (GET, POST, PUT, DELETE) ---
  if (url.includes('/api/public/products') || url.includes('/api/admin/products')) {
    if (req.method === 'GET') {
      return res.status(200).json({ success: true, products: db.products || [] });
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
      return res.status(200).json({ success: true, product: item, products: db.products });
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      db.products = db.products.filter((p: any) => p.id !== id);
      saveDbData(db);
      return res.status(200).json({ success: true, products: db.products });
    }
  }

  // --- Categories & Settings ---
  if (url.includes('/api/public/categories')) {
    return res.status(200).json({ success: true, categories: db.categories || INITIAL_DB.categories });
  }

  if (url.includes('/api/public/settings')) {
    return res.status(200).json({ success: true, settings: db.settings || INITIAL_DB.settings });
  }

  // --- Orders ---
  if (url.includes('/api/admin/orders') || url.includes('/api/public/orders')) {
    if (req.method === 'GET') {
      return res.status(200).json({ success: true, orders: db.orders || [] });
    }
    if (req.method === 'POST') {
      const order = req.body;
      order.id = order.id || 'BK-' + Math.floor(100000 + Math.random() * 900000);
      order.createdAt = order.createdAt || new Date().toISOString();
      db.orders.unshift(order);
      saveDbData(db);
      return res.status(200).json({ success: true, order });
    }
  }

  return res.status(200).json({ success: true, message: 'API is running' });
}