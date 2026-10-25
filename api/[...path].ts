import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

// مسار مؤقت لتخزين المنتجات والطلبات على سيرفر Vercel
const DB_FILE = '/tmp/bkbeauty_db.json';

function getDbData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading db', e);
  }
  return { products: [], orders: [] };
}

function saveDbData(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving db', e);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || '';
  
  // السماح بالوصول لجميع الـ API بصلاحيات الإدارة
  if (url.includes('/api/admin/login')) {
    if (req.method === 'POST') {
      const { email, password } = req.body || {};
      if ((email === 'admin@bkbeauty.dz' || email === 'admin') && password === 'admin12345678') {
        return res.status(200).json({ success: true, user: { role: 'admin' } });
      }
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }
  }

  // إدارة الطلبات (Orders)
  if (url.includes('/api/admin/orders')) {
    const db = getDbData();
    if (req.method === 'GET') {
      return res.status(200).json({ success: true, orders: db.orders || [] });
    }
  }

  // إدارة المنتجات (Products)
  if (url.includes('/api/admin/products') || url.includes('/api/public/products')) {
    const db = getDbData();
    
    if (req.method === 'GET') {
      return res.status(200).json({ success: true, products: db.products || [] });
    }
    
    if (req.method === 'POST' || req.method === 'PUT') {
      const newProduct = req.body;
      if (!newProduct.id) {
        newProduct.id = 'prod_' + Date.now();
      }
      
      const index = db.products.findIndex((p: any) => p.id === newProduct.id);
      if (index >= 0) {
        db.products[index] = { ...db.products[index], ...newProduct };
      } else {
        db.products.push(newProduct);
      }
      
      saveDbData(db);
      return res.status(200).json({ success: true, product: newProduct });
    }
  }

  // إعدادات افتراضية عامة
  if (url.includes('/api/public/settings')) {
    return res.status(200).json({ success: true, settings: { storeName: 'BK Beauty' } });
  }

  if (url.includes('/api/public/categories')) {
    return res.status(200).json({ success: true, categories: [] });
  }

  return res.status(200).json({ success: true, message: 'API is running' });
}