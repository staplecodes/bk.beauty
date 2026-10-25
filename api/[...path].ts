import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';

const TMP_DB_FILE = '/tmp/bkbeauty_db.json';

// منتجاتك الأساسية كاملة لكي لا تختفي أبداً
const INITIAL_PRODUCTS = [
  {
    id: 'prod_foundation_silk',
    sku: 'BK-FDN-01',
    nameFr: 'Lumière Hydrating Silk Foundation',
    nameAr: 'كريم أساس لوميير الحريري المرطب',
    descriptionFr: "Formule fluide infusée de protéines de soie micro-filtrées et d'acide hyaluronique pur.",
    descriptionAr: 'تركيبة غنية ببروتينات الحرير المفلترة وحمض الهيالورونيك.',
    category: 'cat_maquillage',
    price: 4800,
    originalPrice: 5600,
    image: '/src/assets/images/product_silk_foundation_1792358662724.jpg',
    stockQuantity: 42,
    inStock: true,
    featured: true,
  },
  {
    id: 'prod_rose_serum',
    sku: 'BK-SRM-02',
    nameFr: 'Rose Petal Peptides Overnight Serum',
    nameAr: 'سيروم بتلات الورد بالببتيدات لتجديد البشرة',
    descriptionFr: 'Concentré régénérant de nuit mariant peptides de cuivre et essence de rose.',
    descriptionAr: 'سيروم ليلي غني بببتيدات النحاس وخلاصة الورد الجوري.',
    category: 'cat_soins_visage',
    price: 6500,
    originalPrice: 7200,
    image: '/src/assets/images/product_rose_elixir_serum_1792358664394.jpg',
    stockQuantity: 16,
    inStock: true,
    featured: true,
  },
  {
    id: 'prod_velvet_lipstick',
    sku: 'BK-LIP-03',
    nameFr: 'Velvet Matte Sculpting Lipstick',
    nameAr: 'أحمر شفاه مخملي مطفأ فائق الثبات',
    descriptionFr: 'Rouge à lèvres haute pigmentation au fini velours mat.',
    descriptionAr: 'لون غني بلمسة مخملية غير لامعة لا تسبب جفاف الشفاه.',
    category: 'cat_maquillage',
    price: 2900,
    image: '/src/assets/images/product_velvet_rouge_lipstick_1792358664698.jpg',
    stockQuantity: 28,
    inStock: true,
    featured: true,
  },
  {
    id: 'prod_contouring_brush',
    sku: 'BK-BRS-04',
    nameFr: 'Artistry No. 101 Precision Contouring Brush',
    nameAr: 'فرشاة نحت الوجه الاحترافية رقم 101',
    descriptionFr: "Pinceau biseauté d'artisan avec manche en bois laqué.",
    descriptionAr: 'فرشاة مكياج مشطوفة بمقبض خشبي مطلي.',
    category: 'cat_accessoires',
    price: 3200,
    image: '/src/assets/images/product_contouring_brush_1792358665018.jpg',
    stockQuantity: 19,
    inStock: true,
    featured: true,
  },
  {
    id: 'prod_botanical_glow_oil',
    sku: 'BK-OIL-05',
    nameFr: "Éclat d'Or Botanical Face Oil",
    nameAr: 'زيت الوجه النباتي الذهبي لإشراقة فورية',
    descriptionFr: "Huile sèche précieuse infusée de squalane végétal.",
    descriptionAr: 'زيت نباتي جاف بتركيبة سريعة الامتصاص.',
    category: 'cat_soins_visage',
    price: 5900,
    image: '/src/assets/images/hero_bk_beauty_cosmetics_1792358663044.jpg',
    stockQuantity: 11,
    inStock: true,
    featured: true,
  },
];

const INITIAL_CATEGORIES = [
  { id: 'cat_maquillage', slug: 'maquillage', nameFr: 'Maquillage', nameAr: 'المكياج' },
  { id: 'cat_soins_visage', slug: 'soins-du-visage', nameFr: 'Soins du visage', nameAr: 'العناية بالوجه' },
  { id: 'cat_soins_corps', slug: 'soins-du-corps', nameFr: 'Soins du corps', nameAr: 'العناية بالجسم' },
  { id: 'cat_parfums', slug: 'parfums', nameFr: 'Parfums', nameAr: 'العطور' },
  { id: 'cat_soins_capillaires', slug: 'soins-capillaires', nameFr: 'Soins capillaires', nameAr: 'العناية بالشعر' },
  { id: 'cat_accessoires', slug: 'accessoires-beaute', nameFr: 'Accessoires beauté', nameAr: 'إكسسوارات التجميل' },
];

function getDb() {
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_DB_FILE, 'utf-8'));
      if (data && data.products && data.products.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('DB read error:', err);
  }
  return {
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    orders: [],
    wilayas: [
      { code: '03', nameFr: 'Laghouat', nameAr: 'الأغواط', deliveryFee: 300, active: true },
      { code: '16', nameFr: 'Alger', nameAr: 'الجزائر', deliveryFee: 400, active: true },
      { code: '31', nameFr: 'Oran', nameAr: 'وهران', deliveryFee: 500, active: true },
    ],
    settings: { storeName: 'BK BEAUTY', currency: 'DZD' }
  };
}

function saveDb(db: any) {
  try {
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn('DB write error:', err);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = getDb();
    const url = (req.url || '').split('?')[0];

    // Admin Login
    if (req.method === 'POST' && url.includes('admin/login')) {
      const { email, password } = req.body || {};
      if ((email === 'admin@bkbeauty.dz' || email === 'admin') && password === 'admin12345678') {
        return res.status(200).json({
          success: true,
          user: { id: 'admin_1', email: 'admin@bkbeauty.dz', name: 'BK Beauty Admin', role: 'admin' }
        });
      }
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    if (req.method === 'GET' && url.includes('admin/me')) {
      return res.status(200).json({
        user: { id: 'admin_1', email: 'admin@bkbeauty.dz', name: 'BK Beauty Admin', role: 'admin' }
      });
    }

    // Dashboard Stats & Orders
    if (req.method === 'GET' && url.includes('admin/dashboard-stats')) {
      const orders = db.orders || [];
      return res.status(200).json({
        stats: {
          totalOrders: orders.length,
          newPendingOrders: orders.filter((o: any) => o.status === 'Nouvelle').length,
          recentOrders: orders.slice(0, 10),
        }
      });
    }

    if (req.method === 'GET' && url.includes('admin/orders')) {
      return res.status(200).json({ success: true, orders: db.orders || [] });
    }

    // Products Management (Add, Edit, Delete)
    if (url.includes('products')) {
      if (req.method === 'GET') {
        return res.status(200).json({ success: true, products: db.products || INITIAL_PRODUCTS });
      }

      if (req.method === 'POST' || req.method === 'PUT') {
        const item = req.body;
        if (!item.id) {
          item.id = 'prod_' + Date.now();
        }
        item.updatedAt = new Date().toISOString();
        if (!item.createdAt) item.createdAt = item.updatedAt;

        const index = (db.products || []).findIndex((p: any) => p.id === item.id);
        if (index >= 0) {
          db.products[index] = { ...db.products[index], ...item };
        } else {
          if (!db.products) db.products = [];
          db.products.push(item);
        }
        saveDb(db);
        return res.status(200).json({ success: true, product: item, products: db.products });
      }

      if (req.method === 'DELETE') {
        const { id } = req.body || {};
        db.products = (db.products || []).filter((p: any) => p.id !== id);
        saveDb(db);
        return res.status(200).json({ success: true, products: db.products });
      }
    }

    // Public Orders (Checkout submission)
    if (req.method === 'POST' && url.includes('public/orders')) {
      const { customer, items } = req.body || {};
      if (!customer || !items) {
        return res.status(400).json({ error: 'Données incomplètes' });
      }
      const newOrder = {
        id: `ord_${Date.now()}`,
        reference: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
        customer,
        items,
        status: 'Nouvelle',
        createdAt: new Date().toISOString(),
      };
      if (!db.orders) db.orders = [];
      db.orders.unshift(newOrder);
      saveDb(db);
      return res.status(201).json({ success: true, order: newOrder });
    }

    if (url.includes('categories')) return res.status(200).json({ success: true, categories: db.categories });
    if (url.includes('settings')) return res.status(200).json({ success: true, settings: db.settings });
    if (url.includes('wilayas')) return res.status(200).json({ success: true, wilayas: db.wilayas });

    return res.status(200).json({ success: true, products: db.products || INITIAL_PRODUCTS });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}