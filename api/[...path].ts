import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

const TMP_DB_FILE = '/tmp/bkbeauty_db.json';

const INITIAL_CATEGORIES = [
  {
    id: 'cat_maquillage',
    slug: 'maquillage',
    nameFr: 'Maquillage',
    nameAr: 'المكياج',
    descriptionFr: 'Fonds de teint soyeux, rouges à lèvres veloutés et poudres haute définition.',
    descriptionAr: 'كريمات أساس حريرية، أحمر شفاه مخملي وبودرة تثبيت فائقة النعومة.',
    icon: 'brush',
  },
  {
    id: 'cat_soins_visage',
    slug: 'soins-du-visage',
    nameFr: 'Soins du visage',
    nameAr: 'العناية بالوجه',
    descriptionFr: 'Sérums botaniques concentrés, crèmes barrière et élixirs hydratants.',
    descriptionAr: 'سيرومات نباتية مركزة، كريمات حماية البشرة وإكسيرات الترطيب الفائق.',
    icon: 'spa',
  },
  {
    id: 'cat_soins_corps',
    slug: 'soins-du-corps',
    nameFr: 'Soins du corps',
    nameAr: 'العناية بالجسم',
    descriptionFr: 'Huiles satinées, baumes nourrissants et gommages exfoliants soyeux.',
    descriptionAr: 'زيوت ترطيب ساتانية، زبدة مغذية ومقشرات ناعمة تدلل حواسك.',
    icon: 'water_drop',
  },
  {
    id: 'cat_parfums',
    slug: 'parfums',
    nameFr: 'Parfums',
    nameAr: 'العطور',
    descriptionFr: "Fragrances intenses, sillages ambrés et floraux d'exception.",
    descriptionAr: 'عطور شرقية وزهرية مميزة تدوم طويلاً وتمنحك حضوراً آسراً.',
    icon: 'local_florist',
  },
  {
    id: 'cat_soins_capillaires',
    slug: 'soins-capillaires',
    nameFr: 'Soins capillaires',
    nameAr: 'العناية بالشعر',
    descriptionFr: 'Masques réparateurs, huiles précieuses et shampooings doux sans sulfates.',
    descriptionAr: 'أقنعة ترميم عميقة، زيوت مقوية وشامبو لطيف خالٍ من السلفات.',
    icon: 'content_cut',
  },
  {
    id: 'cat_accessoires',
    slug: 'accessoires-beaute',
    nameFr: 'Accessoires beauté',
    nameAr: 'إكسسوارات التجميل',
    descriptionFr: "Pinceaux d'artisan vegan, éponges précision et trousses de voyage.",
    descriptionAr: 'فراشي احترافية ناعمة، إسفنجات دمج دقيقة وحقائب مكياج فاخرة.',
    icon: 'auto_fix_high',
  },
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod_foundation_silk',
    sku: 'BK-FDN-01',
    nameFr: 'Lumière Hydrating Silk Foundation',
    nameAr: 'كريم أساس لوميير الحريري المرطب',
    descriptionFr: "Formule fluide infusée de protéines de soie micro-filtrées et d'acide hyaluronique pur. Offre un fini satiné naturel effet seconde peau avec 24h d'hydratation.",
    descriptionAr: 'تركيبة غنية ببروتينات الحرير المفلترة وحمض الهيالورونيك، تمنح تغطية طبيعية حريرية تدوم طوال اليوم مع ترطيب عميق بدون لمعان زائد.',
    category: 'cat_maquillage',
    price: 4800,
    originalPrice: 5600,
    image: '/src/assets/images/product_silk_foundation_1792358662724.jpg',
    stockQuantity: 42,
    inStock: true,
    featured: true,
    isNewArrival: false,
    badgeFr: 'Best-Seller',
    badgeAr: 'الأكثر طلباً',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_rose_serum',
    sku: 'BK-SRM-02',
    nameFr: 'Rose Petal Peptides Overnight Serum',
    nameAr: 'سيروم بتلات الورد بالببتيدات لتجديد البشرة',
    descriptionFr: 'Concentré régénérant de nuit mariant peptides de cuivre et essence de rose de Damas fraîchement cueillie. Répare la barrière cutanée et redonne fermeté et éclat.',
    descriptionAr: 'سيروم ليلي غني بببتيدات النحاس وخلاصة الورد الجوري، يعمل على ترميم حاجز البشرة واستعادة نضارتها وإشراقتها الصباحية الفورية.',
    category: 'cat_soins_visage',
    price: 6500,
    originalPrice: 7200,
    image: '/src/assets/images/product_rose_elixir_serum_1792358664394.jpg',
    stockQuantity: 16,
    inStock: true,
    featured: true,
    isNewArrival: true,
    badgeFr: 'Nouveauté',
    badgeAr: 'جديد',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_velvet_lipstick',
    sku: 'BK-LIP-03',
    nameFr: 'Velvet Matte Sculpting Lipstick',
    nameAr: 'أحمر شفاه مخملي مطفأ فائق الثبات',
    descriptionFr: 'Rouge à lèvres haute pigmentation au fini velours mat non asséchant. Enrichi en beurre de karité bio et huile de grenade pour 12 heures de confort absolu.',
    descriptionAr: 'لون غني بلمسة مخملية غير لامعة لا تسبب جفاف الشفاه، معزز بزبدة الشيا وزيت الرمان الطبيعي لثبات يدوم حتى 12 ساعة.',
    category: 'cat_maquillage',
    price: 2900,
    image: '/src/assets/images/product_velvet_rouge_lipstick_1792358664698.jpg',
    stockQuantity: 28,
    inStock: true,
    featured: true,
    isNewArrival: false,
    badgeFr: 'Favori',
    badgeAr: 'المفضل',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_contouring_brush',
    sku: 'BK-BRS-04',
    nameFr: 'Artistry No. 101 Precision Contouring Brush',
    nameAr: 'فرشاة نحت الوجه الاحترافية رقم 101',
    descriptionFr: "Pinceau biseauté d'artisan avec manche en bois laqué espresso et virole or champagne. Poils synthétiques ultra-denses coupés à la main pour sculpter pommettes et contours sans démarcation.",
    descriptionAr: 'فرشاة مكياج مشطوفة بمقبض خشبي مطلي باللون البني وشعيرات حريرية نباتية كثيفة تتيح دمج وتحديد ملامح الوجه بكل دقة واحترافية.',
    category: 'cat_accessoires',
    price: 3200,
    image: '/src/assets/images/product_contouring_brush_1792358665018.jpg',
    stockQuantity: 19,
    inStock: true,
    featured: true,
    isNewArrival: true,
    badgeFr: '100% Vegan',
    badgeAr: 'نباتي 100%',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_botanical_glow_oil',
    sku: 'BK-OIL-05',
    nameFr: "Éclat d'Or Botanical Face Oil",
    nameAr: 'زيت الوجه النباتي الذهبي لإشراقة فورية',
    descriptionFr: "Huile sèche précieuse infusée de squalane végétal, huile de jojoba du Sahara et particules d'or micronisées. Pénètre instantanément sans fini gras pour un teint rayonnant.",
    descriptionAr: 'زيت نباتي جاف بتركيبة سريعة الامتصاص مع ذرات ذهبية متناهية الصغر وزيت الجوجوبا، يمنح بشرتك إشراقة مخملية ولمعاناً صحياً لا يُقاوم.',
    category: 'cat_soins_visage',
    price: 5900,
    originalPrice: 6500,
    image: '/src/assets/images/hero_bk_beauty_cosmetics_1792358663044.jpg',
    stockQuantity: 11,
    inStock: true,
    featured: true,
    isNewArrival: true,
    badgeFr: 'Coup de Cœur',
    badgeAr: 'موصى به',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_SETTINGS = {
  storeName: 'BK BEAUTY',
  announcementFr: 'Livraison express & Paiement à la livraison (Cash on Delivery) partout en Algérie',
  announcementAr: 'توصيل سريع ودفع عند الاستلام (Cash on Delivery) في جميع أنحاء الجزائر',
  instagramUrl: 'https://www.instagram.com/bachir_bk_beauty03/',
  phoneHotline: '+213 555 00 00 00',
  emailContact: 'contact@bkbeauty.dz',
  locationCityFr: 'Laghouat, Algérie',
  locationCityAr: 'الأغواط، الجزائر',
  lowStockThreshold: 10,
  freeDeliveryThreshold: 12000,
  defaultDeliveryFee: 500,
  isStoreOpen: true,
};

const INITIAL_WILAYAS = [
  { code: '01', nameFr: 'Adrar', nameAr: 'أدرار', deliveryFee: 800, estimatedDays: '3-5 jours', active: true },
  { code: '02', nameFr: 'Chlef', nameAr: 'الشلف', deliveryFee: 500, estimatedDays: '2-3 jours', active: true },
  { code: '03', nameFr: 'Laghouat', nameAr: 'الأغواط', deliveryFee: 300, estimatedDays: '1-2 jours', active: true },
  { code: '04', nameFr: 'Oum El Bouaghi', nameAr: 'أم البواقي', deliveryFee: 600, estimatedDays: '2-4 jours', active: true },
  { code: '05', nameFr: 'Batna', nameAr: 'باتنة', deliveryFee: 600, estimatedDays: '2-4 jours', active: true },
  { code: '06', nameFr: 'Béjaïa', nameAr: 'بجاية', deliveryFee: 500, estimatedDays: '2-3 jours', active: true },
  { code: '07', nameFr: 'Biskra', nameAr: 'بسكرة', deliveryFee: 600, estimatedDays: '2-3 jours', active: true },
  { code: '09', nameFr: 'Blida', nameAr: 'البليدة', deliveryFee: 400, estimatedDays: '1-2 jours', active: true },
  { code: '15', nameFr: 'Tizi Ouzou', nameAr: 'تيزي وزو', deliveryFee: 500, estimatedDays: '2-3 jours', active: true },
  { code: '16', nameFr: 'Alger', nameAr: 'الجزائر', deliveryFee: 400, estimatedDays: '1-2 jours', active: true },
  { code: '17', nameFr: 'Djelfa', nameAr: 'الجلفة', deliveryFee: 400, estimatedDays: '1-2 jours', active: true },
  { code: '19', nameFr: 'Sétif', nameAr: 'سطيف', deliveryFee: 500, estimatedDays: '2-3 jours', active: true },
  { code: '23', nameFr: 'Annaba', nameAr: 'عنابة', deliveryFee: 600, estimatedDays: '2-4 jours', active: true },
  { code: '25', nameFr: 'Constantine', nameAr: 'قسنطينة', deliveryFee: 500, estimatedDays: '2-3 jours', active: true },
  { code: '30', nameFr: 'Ouargla', nameAr: 'ورقلة', deliveryFee: 600, estimatedDays: '2-4 jours', active: true },
  { code: '31', nameFr: 'Oran', nameAr: 'وهران', deliveryFee: 500, estimatedDays: '2-3 jours', active: true },
  { code: '34', nameFr: 'Bordj Bou Arréridj', nameAr: 'برج بوعريريج', deliveryFee: 500, estimatedDays: '2-3 jours', active: true },
  { code: '47', nameFr: 'Ghardaïa', nameAr: 'غرداية', deliveryFee: 500, estimatedDays: '1-3 jours', active: true },
];

function getDb() {
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      return JSON.parse(fs.readFileSync(TMP_DB_FILE, 'utf-8'));
    }
    const repoDbPath = path.resolve(process.cwd(), 'data', 'bkbeauty_db.json');
    if (fs.existsSync(repoDbPath)) {
      const parsed = JSON.parse(fs.readFileSync(repoDbPath, 'utf-8'));
      if (parsed.products && parsed.products.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Fallback to initial DB:', err);
  }
  return {
    categories: INITIAL_CATEGORIES,
    products: INITIAL_PRODUCTS,
    orders: [],
    wilayas: INITIAL_WILAYAS,
    settings: INITIAL_SETTINGS,
  };
}

function saveDb(db: any) {
  try {
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to /tmp:', err);
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

    // --- 0. ADMIN LOGIN ---
    if (req.method === 'POST' && (url.endsWith('/api/admin/login') || url.includes('admin/login'))) {
      const { email, password } = req.body || {};
      const username = (email || '').trim().toLowerCase();
      const pass = (password || '').trim();

      if ((username === 'admin@bkbeauty.dz' || username === 'admin') && pass === 'admin12345678') {
        return res.status(200).json({
          success: true,
          user: { 
            id: 'admin_1', 
            email: 'admin@bkbeauty.dz', 
            name: 'BK Beauty Admin', 
            role: 'admin' 
          }
        });
      }
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    // --- ADMIN ME ---
    if (req.method === 'GET' && (url.endsWith('/api/admin/me') || url.includes('admin/me'))) {
      return res.status(200).json({
        user: { 
          id: 'admin_1', 
          email: 'admin@bkbeauty.dz', 
          name: 'BK Beauty Admin', 
          role: 'admin' 
        }
      });
    }

    // --- ADMIN DASHBOARD STATS ---
    if (req.method === 'GET' && url.endsWith('/api/admin/dashboard-stats')) {
      const orders = db.orders || [];
      return res.status(200).json({
        stats: {
          totalOrders: orders.length,
          newPendingOrders: orders.filter((o: any) => o.status === 'Nouvelle').length,
          confirmedOrders: orders.filter((o: any) => o.status === 'Confirmée').length,
          deliveredOrders: orders.filter((o: any) => o.status === 'Livrée').length,
          recentOrders: orders.slice(0, 10),
        }
      });
    }

    // --- ADMIN ORDERS ---
    if (req.method === 'GET' && url.endsWith('/api/admin/orders')) {
      return res.status(200).json({ orders: db.orders || [] });
    }

    // --- ADMIN PRODUCTS (POST / PUT / DELETE) ---
    if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') && url.includes('/api/admin/products')) {
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

    // 1. GET /api/public/products/:id
    const singleProductMatch = url.match(/\/api\/public\/products\/([^/]+)$/);
    if (req.method === 'GET' && singleProductMatch) {
      const product = (db.products || INITIAL_PRODUCTS).find((p: any) => p.id === singleProductMatch[1]);
      if (!product) return res.status(404).json({ error: 'Produit introuvable' });
      return res.status(200).json({ product });
    }

    // 2. GET /api/public/products
    if (req.method === 'GET' && url.endsWith('/api/public/products')) {
      const { category, search, inStockOnly, featured } = req.query;
      let prods = [...(db.products || INITIAL_PRODUCTS)];
      if (category && category !== 'all') prods = prods.filter((p: any) => p.category === category);
      if (featured === 'true') prods = prods.filter((p: any) => p.featured);
      if (inStockOnly === 'true') prods = prods.filter((p: any) => p.inStock && p.stockQuantity > 0);
      if (search && typeof search === 'string') {
        const q = search.toLowerCase().trim();
        prods = prods.filter(
          (p: any) =>
            p.nameFr?.toLowerCase().includes(q) ||
            p.nameAr?.toLowerCase().includes(q) ||
            p.descriptionFr?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q)
        );
      }
      return res.status(200).json({ products: prods });
    }

    // 3. GET /api/public/categories
    if (req.method === 'GET' && url.endsWith('/api/public/categories')) {
      const categories = (db.categories || INITIAL_CATEGORIES).map((cat: any) => ({
        ...cat,
        productCount: (db.products || INITIAL_PRODUCTS).filter((p: any) => p.category === cat.id && p.inStock).length,
      }));
      return res.status(200).json({ categories });
    }

    // 4. GET /api/public/wilayas
    if (req.method === 'GET' && url.endsWith('/api/public/wilayas')) {
      return res.status(200).json({ wilayas: db.wilayas || INITIAL_WILAYAS });
    }

    // 5. GET /api/public/settings
    if (req.method === 'GET' && url.endsWith('/api/public/settings')) {
      return res.status(200).json({ settings: db.settings || INITIAL_SETTINGS });
    }

    // 6. POST /api/public/orders
    if (req.method === 'POST' && url.endsWith('/api/public/orders')) {
      const { customer, items } = req.body || {};
      if (!customer || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Données de commande incomplètes.' });
      }
      const wilaya = (db.wilayas || INITIAL_WILAYAS).find((w: any) => w.code === customer.wilayaCode) || INITIAL_WILAYAS[0];
      let subtotal = 0;
      const verifiedItems = items.map((item: any) => {
        const prod = (db.products || INITIAL_PRODUCTS).find((p: any) => p.id === item.productId) || INITIAL_PRODUCTS[0];
        const lineTotal = prod.price * (item.quantity || 1);
        subtotal += lineTotal;
        return {
          productId: prod.id,
          productNameFr: prod.nameFr,
          productNameAr: prod.nameAr,
          sku: prod.sku,
          unitPrice: prod.price,
          quantity: item.quantity || 1,
          lineTotal,
          image: prod.image,
        };
      });
      const deliveryFee = subtotal >= (db.settings?.freeDeliveryThreshold || 12000) ? 0 : wilaya.deliveryFee;
      const orderRef = `BK-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder = {
        id: `ord_${Date.now()}`,
        reference: orderRef,
        customer: {
          ...customer,
          wilayaNameFr: wilaya.nameFr,
          wilayaNameAr: wilaya.nameAr,
        },
        items: verifiedItems,
        subtotal,
        deliveryFee,
        finalTotal: subtotal + deliveryFee,
        paymentMethod: 'cash_on_delivery',
        status: 'Nouvelle',
        createdAt: new Date().toISOString(),
      };
      db.orders = [newOrder, ...(db.orders || [])];
      saveDb(db);
      return res.status(201).json({ success: true, order: newOrder });
    }

    // 7. GET /api/public/orders/:reference
    const trackOrderMatch = url.match(/\/api\/public\/orders\/([^/]+)$/);
    if (req.method === 'GET' && trackOrderMatch) {
      const order = (db.orders || []).find(
        (o: any) => o.reference?.toLowerCase() === trackOrderMatch[1].toLowerCase()
      );
      if (!order) return res.status(404).json({ error: 'Commande introuvable.' });
      return res.status(200).json({
        reference: order.reference,
        status: order.status,
        customerName: order.customer.fullName,
        wilaya: order.customer.wilayaNameFr,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        finalTotal: order.finalTotal,
        itemsCount: order.items.reduce((s: number, i: any) => s + i.quantity, 0),
        items: order.items,
        createdAt: order.createdAt,
      });
    }

    return res.status(200).json({ products: db.products || INITIAL_PRODUCTS });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}