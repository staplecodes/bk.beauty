import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// الاتصال بقاعدة بيانات Supabase باستخدام متغيرات البيئة الآمنة في Vercel
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = (req.url || '').split('?')[0];

    // --- 1. ADMIN LOGIN ---
    if (req.method === 'POST' && url.includes('admin/login')) {
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

    // --- 2. PRODUCTS (GET, POST, PUT, DELETE from Supabase) ---
    if (url.includes('products')) {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        return res.status(200).json({ success: true, products: data || [] });
      }

      if (req.method === 'POST' || req.method === 'PUT') {
        const item = req.body;
        if (!item.id) {
          item.id = 'prod_' + Date.now();
        }
        item.updated_at = new Date().toISOString();
        if (!item.created_at) item.created_at = item.updated_at;

        // تجهيز البيانات لتتوافق مع أسود أعمدة Supabase
        const dbPayload = {
          id: item.id,
          sku: item.sku || '',
          name_fr: item.nameFr || item.name_fr || '',
          name_ar: item.nameAr || item.name_ar || '',
          description_fr: item.descriptionFr || item.description_fr || '',
          description_ar: item.descriptionAr || item.description_ar || '',
          price: Number(item.price) || 0,
          category: item.category || '',
          image: item.image || '',
          stock_quantity: Number(item.stockQuantity || item.stock_quantity) || 0,
          in_stock: Boolean(item.inStock ?? item.in_stock ?? true)
        };

        const { error } = await supabase.from('products').upsert(dbPayload);
        if (error) throw error;

        // جلب القائمة المحدثة
        const { data: updatedProducts } = await supabase.from('products').select('*');
        return res.status(200).json({ success: true, product: item, products: updatedProducts || [] });
      }

      if (req.method === 'DELETE') {
        const { id } = req.body || {};
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;

        const { data: updatedProducts } = await supabase.from('products').select('*');
        return res.status(200).json({ success: true, products: updatedProducts || [] });
      }
    }

    // --- 3. ORDERS (GET & POST to Supabase) ---
    if (url.includes('orders')) {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json({ success: true, orders: data || [] });
      }

      if (req.method === 'POST') {
        const { customer, items } = req.body || {};
        if (!customer || !items) {
          return res.status(400).json({ error: 'Données incomplètes' });
        }

        const newOrder = {
          id: `ord_${Date.now()}`,
          reference: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
          customer,
          items,
          subtotal: req.body.subtotal || 0,
          delivery_fee: req.body.deliveryFee || 0,
          final_total: req.body.finalTotal || 0,
          status: 'Nouvelle',
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('orders').insert([newOrder]);
        if (error) throw error;

        return res.status(201).json({ success: true, order: newOrder });
      }
    }

    // --- 4. DASHBOARD STATS ---
    if (req.method === 'GET' && url.includes('admin/dashboard-stats')) {
      const { data: orders } = await supabase.from('orders').select('*');
      const ordersList = orders || [];
      return res.status(200).json({
        stats: {
          totalOrders: ordersList.length,
          newPendingOrders: ordersList.filter((o: any) => o.status === 'Nouvelle').length,
          recentOrders: ordersList.slice(0, 10),
        }
      });
    }

    // --- 5. PUBLIC CONFIGS ---
    if (url.includes('categories')) {
      return res.status(200).json({
        success: true,
        categories: [
          { id: 'cat_maquillage', slug: 'maquillage', nameFr: 'Maquillage', nameAr: 'المكياج' },
          { id: 'cat_soins_visage', slug: 'soins-du-visage', nameFr: 'Soins du visage', nameAr: 'العناية بالوجه' },
          { id: 'cat_soins_corps', slug: 'soins-du-corps', nameFr: 'Soins du corps', nameAr: 'العناية بالجسم' },
          { id: 'cat_parfums', slug: 'parfums', nameFr: 'Parfums', nameAr: 'العطور' },
        ]
      });
    }

    if (url.includes('settings')) {
      return res.status(200).json({ success: true, settings: { storeName: 'BK BEAUTY', currency: 'DZD' } });
    }

    if (url.includes('wilayas')) {
      return res.status(200).json({
        success: true,
        wilayas: [
          { code: '03', nameFr: 'Laghouat', nameAr: 'الأغواط', deliveryFee: 300, active: true },
          { code: '16', nameFr: 'Alger', nameAr: 'الجزائر', deliveryFee: 400, active: true },
          { code: '31', nameFr: 'Oran', nameAr: 'وهران', deliveryFee: 500, active: true },
        ]
      });
    }

    return res.status(200).json({ success: true, message: 'API is running with Supabase' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}