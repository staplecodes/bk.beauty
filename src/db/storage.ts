import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  Product,
  Category,
  Order,
  StoreSettings,
  WilayaDeliveryRule,
  AdminUser,
  DashboardStats,
  OrderStatus,
} from '../types';
import { INITIAL_WILAYAS } from '../data/wilayas';

interface DatabaseSchema {
  adminUsers: AdminUser[];
  adminPasswordHash?: string;
  adminSessions?: { id: string; expiresAt: number }[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  wilayas: WilayaDeliveryRule[];
  settings: StoreSettings;
  version: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'bkbeauty_db.json');

const INITIAL_CATEGORIES: Category[] = [
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
    descriptionFr: 'Fragrances intenses, sillages ambrés et floraux d\'exception.',
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
    descriptionFr: 'Pinceaux d\'artisan vegan, éponges précision et trousses de voyage.',
    descriptionAr: 'فراشي احترافية ناعمة، إسفنجات دمج دقيقة وحقائب مكياج فاخرة.',
    icon: 'auto_fix_high',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_foundation_silk',
    sku: 'BK-FDN-01',
    nameFr: 'Lumière Hydrating Silk Foundation',
    nameAr: 'كريم أساس لوميير الحريري المرطب',
    descriptionFr: 'Formule fluide infusée de protéines de soie micro-filtrées et d\'acide hyaluronique pur. Offre un fini satiné naturel effet seconde peau avec 24h d\'hydratation.',
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
    variants: [
      { id: 'sh_090', nameFr: '090 Porcelaine Claire', nameAr: '090 بورسلين فاتح', sku: 'BK-FDN-01-090', colorHex: '#F7E7DE', inStock: true, stockQuantity: 10 },
      { id: 'sh_120', nameFr: '120 Sable Naturel', nameAr: '120 رملي طبيعي', sku: 'BK-FDN-01-120', colorHex: '#E9CEBA', inStock: true, stockQuantity: 18 },
      { id: 'sh_210', nameFr: '210 Amande Chaude', nameAr: '210 لوز دافئ', sku: 'BK-FDN-01-210', colorHex: '#D5AD8E', inStock: true, stockQuantity: 9 },
      { id: 'sh_330', nameFr: '330 Châtaigne Dorée', nameAr: '330 كستنائي مائل للذهبي', sku: 'BK-FDN-01-330', colorHex: '#935F42', inStock: true, stockQuantity: 5 },
    ],
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
    variants: [
      { id: 'vol_30ml', nameFr: 'Flacon Compte-gouttes 30ml', nameAr: 'قارورة قطارة 30 مل', sku: 'BK-SRM-02-30', inStock: true, stockQuantity: 10 },
      { id: 'vol_50ml', nameFr: 'Format Prestige 50ml (+1,500 DA)', nameAr: 'حجم برستيج 50 مل (+1500 دج)', sku: 'BK-SRM-02-50', inStock: true, stockQuantity: 6 },
    ],
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
    variants: [
      { id: 'lip_noir_rouge', nameFr: 'Noir Rouge (Bordeaux Profond)', nameAr: 'عنابي داكن كلاسيكي', sku: 'BK-LIP-03-NR', colorHex: '#642C40', inStock: true, stockQuantity: 12 },
      { id: 'lip_rose_poudre', nameFr: 'Rose Poudré (Nude Délicat)', nameAr: 'وردي بودري نيود', sku: 'BK-LIP-03-RP', colorHex: '#C9828B', inStock: true, stockQuantity: 10 },
      { id: 'lip_caramel_miel', nameFr: 'Caramel Miel (Chaud)', nameAr: 'كراميل عسلي دافئ', sku: 'BK-LIP-03-CM', colorHex: '#A06346', inStock: true, stockQuantity: 6 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_contouring_brush',
    sku: 'BK-BRS-04',
    nameFr: 'Artistry No. 101 Precision Contouring Brush',
    nameAr: 'فرشاة نحت الوجه الاحترافية رقم 101',
    descriptionFr: 'Pinceau biseauté d\'artisan avec manche en bois laqué espresso et virole or champagne. Poils synthétiques ultra-denses coupés à la main pour sculpter pommettes et contours sans démarcation.',
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
    nameFr: 'Éclat d\'Or Botanical Face Oil',
    nameAr: 'زيت الوجه النباتي الذهبي لإشراقة فورية',
    descriptionFr: 'Huile sèche précieuse infusée de squalane végétal, huile de jojoba du Sahara et particules d\'or micronisées. Pénètre instantanément sans fini gras pour un teint rayonnant.',
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

const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'BK BEAUTY',
  announcementFr: 'Livraison express & Paiement à la livraison (Cash on Delivery) partout en Algérie',
  announcementAr: 'توصيل سريع ودفع عند الاستلام (Cash on Delivery) في جميع أنحاء الجزائر',
  instagramUrl: 'https://www.instagram.com/bachir_bk_beauty03/',
  phoneHotline: '+213 555 00 00 00',
  emailContact: 'contact@bkbeauty.dz',
  locationCityFr: 'Laghouat, Algérie',
  locationCityAr: 'الأغواط، الجزائر',
  lowStockThreshold: 10,
  freeDeliveryThreshold: 12000, // Free delivery for orders above 12,000 DA
  defaultDeliveryFee: 500,
  isStoreOpen: true,
};

class PersistentStorage {
  private db: DatabaseSchema | null = null;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialData: DatabaseSchema = {
        adminUsers: [],
        adminPasswordHash: '',
        adminSessions: [],
        categories: INITIAL_CATEGORIES,
        products: INITIAL_PRODUCTS,
        orders: [],
        wilayas: INITIAL_WILAYAS,
        settings: INITIAL_SETTINGS,
        version: 1,
      };

      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      this.db = initialData;
    } else {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const loadedData: DatabaseSchema = JSON.parse(fileContent);
        loadedData.adminSessions ||= [];
        this.db = loadedData;
      } catch (e) {
        console.error('Error reading database file, reinitializing', e);
        this.ensureInitialized();
      }
    }
  }

  private save(): void {
    if (!this.db) return;
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(this.db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  // --- Products ---
  public getProducts(params?: { category?: string; search?: string; inStockOnly?: boolean; featured?: boolean }): Product[] {
    this.ensureInitialized();
    let prods = [...(this.db?.products || [])];

    if (params?.category && params.category !== 'all') {
      prods = prods.filter((p) => p.category === params.category);
    }
    if (params?.featured) {
      prods = prods.filter((p) => p.featured);
    }
    if (params?.inStockOnly) {
      prods = prods.filter((p) => p.inStock && p.stockQuantity > 0);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      prods = prods.filter(
        (p) =>
          p.nameFr.toLowerCase().includes(q) ||
          p.nameAr.toLowerCase().includes(q) ||
          p.descriptionFr.toLowerCase().includes(q) ||
          p.descriptionAr.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    return prods;
  }

  public getProductById(id: string): Product | undefined {
    this.ensureInitialized();
    return this.db?.products.find((p) => p.id === id);
  }

  public addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    this.ensureInitialized();
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.db?.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    this.ensureInitialized();
    const idx = this.db?.products.findIndex((p) => p.id === id);
    if (idx === undefined || idx === -1 || !this.db) return null;

    const current = this.db.products[idx];
    const updated: Product = {
      ...current,
      ...updates,
      sku: current.sku,
      updatedAt: new Date().toISOString(),
    };

    // Update inStock status based on stockQuantity
    if (typeof updates.stockQuantity === 'number') {
      updated.inStock = updates.stockQuantity > 0;
    }

    this.db.products[idx] = updated;
    this.save();
    return updated;
  }

  public toggleProductStock(id: string, inStock: boolean, newStock?: number): Product | null {
    this.ensureInitialized();
    const prod = this.getProductById(id);
    if (!prod) return null;

    const stock = newStock !== undefined ? newStock : inStock ? Math.max(prod.stockQuantity, 10) : 0;
    return this.updateProduct(id, { inStock, stockQuantity: stock });
  }

  public deleteProduct(id: string): boolean {
    this.ensureInitialized();
    if (!this.db) return false;
    const initialLen = this.db.products.length;
    this.db.products = this.db.products.filter((p) => p.id !== id);
    if (this.db.products.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Categories ---
  public getCategories(): Category[] {
    this.ensureInitialized();
    const categories = this.db?.categories || [];
    return categories.map((cat) => ({
      ...cat,
      productCount: this.db?.products.filter((p) => p.category === cat.id && p.inStock).length || 0,
    }));
  }

  public addCategory(cat: Omit<Category, 'id' | 'productCount'>): Category {
    this.ensureInitialized();
    const newCategory: Category = {
      ...cat,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      slug: cat.slug || cat.nameFr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    };
    this.db?.categories.push(newCategory);
    this.save();
    return newCategory;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    this.ensureInitialized();
    const idx = this.db?.categories.findIndex((c) => c.id === id);
    if (idx === undefined || idx === -1 || !this.db) return null;

    this.db.categories[idx] = { ...this.db.categories[idx], ...updates };
    this.save();
    return this.db.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    this.ensureInitialized();
    if (!this.db) return false;
    const initialLen = this.db.categories.length;
    this.db.categories = this.db.categories.filter((c) => c.id !== id);
    if (this.db.categories.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Inventory Management ---
  public adjustStock(productId: string, newStock: number, variantId?: string): Product | null {
    this.ensureInitialized();
    const product = this.getProductById(productId);
    if (!product || !this.db) return null;

    if (variantId && product.variants) {
      const v = product.variants.find((item) => item.id === variantId);
      if (v) {
        v.stockQuantity = Math.max(0, newStock);
        v.inStock = v.stockQuantity > 0;
        // Recalculate parent product total stock from variants
        product.stockQuantity = product.variants.reduce((sum, item) => sum + item.stockQuantity, 0);
        product.inStock = product.stockQuantity > 0;
      }
    } else {
      product.stockQuantity = Math.max(0, newStock);
      product.inStock = product.stockQuantity > 0;
    }

    product.updatedAt = new Date().toISOString();
    this.save();
    return product;
  }

  // --- Wilayas & Delivery Rules ---
  public getWilayas(): WilayaDeliveryRule[] {
    this.ensureInitialized();
    return this.db?.wilayas || [];
  }

  public updateWilaya(code: string, updates: Partial<WilayaDeliveryRule>): WilayaDeliveryRule | null {
    this.ensureInitialized();
    const idx = this.db?.wilayas.findIndex((wilaya) => wilaya.code === code);
    if (idx === undefined || idx === -1 || !this.db) return null;

    const current = this.db.wilayas[idx];
    this.db.wilayas[idx] = {
      ...current,
      deliveryFee: updates.deliveryFee ?? current.deliveryFee,
      estimatedDays: updates.estimatedDays ?? current.estimatedDays,
      active: updates.active ?? current.active,
    };
    this.save();
    return this.db.wilayas[idx];
  }

  // --- Orders & Transactional Checkout ---
  public createOrder(orderData: {
    customer: {
      fullName: string;
      phone: string;
      wilayaCode: string;
      commune: string;
      address: string;
      notes?: string;
    };
    items: {
      productId: string;
      variantId?: string;
      quantity: number;
    }[];
  }): { success: boolean; order?: Order; error?: string } {
    this.ensureInitialized();
    if (!this.db) return { success: false, error: 'Database error' };

    // 1. Validate customer info
    const { fullName, phone, wilayaCode, commune, address, notes } = orderData.customer;
    if (!fullName || !phone || !wilayaCode || !commune || !address) {
      return { success: false, error: 'Missing required customer delivery information.' };
    }

    // Algerian phone validation: 10 digits starting with 05, 06, or 07
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[-+]/g, '');
    const isDzPhone = /^(?:213|00213|0)?[567]\d{8}$/.test(cleanPhone);
    if (!isDzPhone) {
      return {
        success: false,
        error: 'Invalid Algerian phone number. Must start with 05, 06, or 07 and contain 10 digits.',
      };
    }

    // 2. Lookup Wilaya
    const wilaya = this.db.wilayas.find((w) => w.code === wilayaCode);
    if (!wilaya || !wilaya.active) {
      return { success: false, error: 'Selected wilaya is not available for delivery.' };
    }

    // 3. Re-verify prices, stock, and build order items from server-side DB
    let subtotal = 0;
    const verifiedOrderItems: Order['items'] = [];

    for (const item of orderData.items) {
      const product = this.db.products.find((p) => p.id === item.productId);
      if (!product || !product.inStock) {
        return { success: false, error: `Product "${item.productId}" is out of stock.` };
      }

      if (item.quantity <= 0) {
        return { success: false, error: 'Invalid item quantity.' };
      }

      if (product.stockQuantity < item.quantity) {
        return {
          success: false,
          error: `Not enough stock for "${product.nameFr}". Available: ${product.stockQuantity}.`,
        };
      }

      let unitPrice = product.price;
      let variantNameFr: string | undefined;
      let variantNameAr: string | undefined;

      if (item.variantId && product.variants) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          return { success: false, error: `Variant "${item.variantId}" not found for "${product.nameFr}".` };
        }
        if (variant.stockQuantity < item.quantity) {
          return {
            success: false,
            error: `Not enough stock for variant "${variant.nameFr}". Available: ${variant.stockQuantity}.`,
          };
        }
        variantNameFr = variant.nameFr;
        variantNameAr = variant.nameAr;
      }

      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      verifiedOrderItems.push({
        productId: product.id,
        productNameFr: product.nameFr,
        productNameAr: product.nameAr,
        sku: product.sku,
        variantId: item.variantId,
        variantNameFr,
        variantNameAr,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
        image: product.image,
      });
    }

    if (verifiedOrderItems.length === 0) {
      return { success: false, error: 'Cart is empty.' };
    }

    // 4. Calculate Delivery Fee
    const freeDeliveryThreshold = this.db.settings.freeDeliveryThreshold;
    const deliveryFee =
      freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold ? 0 : wilaya.deliveryFee;
    const finalTotal = subtotal + deliveryFee;

    // 5. Deduct inventory atomically
    for (const item of verifiedOrderItems) {
      const prod = this.db.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stockQuantity -= item.quantity;
        if (prod.stockQuantity <= 0) {
          prod.inStock = false;
        }

        if (item.variantId && prod.variants) {
          const v = prod.variants.find((varItem) => varItem.id === item.variantId);
          if (v) {
            v.stockQuantity -= item.quantity;
            if (v.stockQuantity <= 0) v.inStock = false;
          }
        }
      }
    }

    // 6. Generate unique order reference
    const timestampStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const orderRef = `BK-${timestampStr}-${randCode}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reference: orderRef,
      customer: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        wilayaCode: wilaya.code,
        wilayaNameFr: wilaya.nameFr,
        wilayaNameAr: wilaya.nameAr,
        commune: commune.trim(),
        address: address.trim(),
        notes: notes?.trim() || '',
      },
      items: verifiedOrderItems,
      subtotal,
      deliveryFee,
      finalTotal,
      paymentMethod: 'cash_on_delivery',
      status: 'Nouvelle',
      statusHistory: [
        {
          status: 'Nouvelle',
          timestamp: new Date().toISOString(),
          note: 'Commande enregistrée via la boutique en ligne (Paiement à la livraison)',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.orders.unshift(newOrder);
    this.save();

    return { success: true, order: newOrder };
  }

  public getOrders(params?: { status?: OrderStatus | 'all'; search?: string }): Order[] {
    this.ensureInitialized();
    let list = [...(this.db?.orders || [])];

    if (params?.status && params.status !== 'all') {
      list = list.filter((o) => o.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.reference.toLowerCase().includes(q) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.phone.includes(q) ||
          o.customer.commune.toLowerCase().includes(q) ||
          o.customer.wilayaNameFr.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public getOrderByReference(reference: string): Order | undefined {
    this.ensureInitialized();
    return this.db?.orders.find((o) => o.reference.toLowerCase() === reference.toLowerCase().trim());
  }

  public updateOrderStatus(id: string, newStatus: OrderStatus, adminNote?: string): Order | null {
    this.ensureInitialized();
    const order = this.db?.orders.find((o) => o.id === id);
    if (!order || !this.db) return null;

    const previousStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    if (adminNote) {
      order.adminNotes = adminNote;
    }

    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: adminNote || `Statut passé de ${previousStatus} à ${newStatus}`,
    });

    // Handle stock restoration if order is cancelled
    if (newStatus === 'Annulée' && previousStatus !== 'Annulée') {
      for (const item of order.items) {
        const prod = this.db.products.find((p) => p.id === item.productId);
        if (prod) {
          prod.stockQuantity += item.quantity;
          prod.inStock = prod.stockQuantity > 0;

          if (item.variantId && prod.variants) {
            const v = prod.variants.find((varItem) => varItem.id === item.variantId);
            if (v) {
              v.stockQuantity += item.quantity;
              v.inStock = v.stockQuantity > 0;
            }
          }
        }
      }
    }

    this.save();
    return order;
  }

  // --- Store Settings ---
  public getSettings(): StoreSettings {
    this.ensureInitialized();
    return this.db?.settings || INITIAL_SETTINGS;
  }

  public updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.ensureInitialized();
    if (!this.db) return INITIAL_SETTINGS;
    this.db.settings = { ...this.db.settings, ...updates };
    this.save();
    return this.db.settings;
  }

  public getAdminUser(email: string): AdminUser | null {
    this.ensureInitialized();
    const user = this.db?.adminUsers.find(
      (admin) => admin.email.toLowerCase() === email.trim().toLowerCase()
    );
    return user
      ? {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          lastLogin: user.lastLogin,
        }
      : null;
  }

  public verifyAdminCredentials(email: string, passwordAttempt: string): AdminUser | null {
    this.ensureInitialized();
    if (!this.db?.adminPasswordHash || Buffer.byteLength(passwordAttempt) > 72) return null;

    const user = this.db.adminUsers.find(
      (admin) => admin.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!user || !bcrypt.compareSync(passwordAttempt, this.db.adminPasswordHash)) return null;

    user.lastLogin = new Date().toISOString();
    this.save();
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      lastLogin: user.lastLogin,
    };
  }

  public changeAdminPassword(
    email: string,
    currentPassword: string,
    newPassword: string
  ): boolean {
    this.ensureInitialized();
    if (!this.db?.adminPasswordHash || Buffer.byteLength(currentPassword) > 72) return false;

    const user = this.db.adminUsers.find(
      (admin) => admin.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!user || !bcrypt.compareSync(currentPassword, this.db.adminPasswordHash)) return false;

    this.db.adminPasswordHash = bcrypt.hashSync(newPassword, 12);
    this.save();
    return true;
  }

  public createAdminSession(id: string, expiresAt: number): void {
    this.ensureInitialized();
    if (!this.db) throw new Error('Database is unavailable.');

    const now = Date.now();
    this.db.adminSessions = (this.db.adminSessions || []).filter((session) => session.expiresAt > now);
    this.db.adminSessions.push({ id, expiresAt });
    this.save();
  }

  public getAdminSessionExpiry(id: string): number | undefined {
    this.ensureInitialized();
    const session = this.db?.adminSessions?.find((entry) => entry.id === id);
    if (!session || session.expiresAt > Date.now()) return session?.expiresAt;

    this.revokeAdminSession(id);
    return undefined;
  }

  public revokeAdminSession(id: string): void {
    this.ensureInitialized();
    if (!this.db) return;

    const sessions = this.db.adminSessions || [];
    this.db.adminSessions = sessions.filter((session) => session.id !== id);
    if (this.db.adminSessions.length !== sessions.length) this.save();
  }

  public revokeOtherAdminSessions(exceptId?: string): void {
    this.ensureInitialized();
    if (!this.db) return;

    this.db.adminSessions = (this.db.adminSessions || []).filter(
      (session) => session.id === exceptId && session.expiresAt > Date.now()
    );
    this.save();
  }

  // --- Dashboard KPIs ---
  public getDashboardStats(): DashboardStats {
    this.ensureInitialized();
    const orders = this.db?.orders || [];
    const products = this.db?.products || [];
    const threshold = this.db?.settings.lowStockThreshold || 10;

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const todayOrders = orders.filter((o) => new Date(o.createdAt).getTime() >= todayMidnight);

    // Normalize accents and casing so cancelled orders are excluded consistently.
    const isCancelledOrder = (status: string) =>
      ['annulee', 'annule', 'cancelled', 'canceled', 'cancel'].includes(
        status.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()
      );
    const activeOrders = orders.filter((o) => !isCancelledOrder(o.status));

    // finalTotal is the recorded fee-inclusive amount for each order.
    const activeOrderValue = activeOrders
      .reduce((sum, o) => sum + o.finalTotal, 0);

    // Collected revenue (strictly delivered orders only - COD collected!)
    const collectedRevenue = orders
      .filter((o) => o.status === 'Livrée')
      .reduce((sum, o) => sum + o.finalTotal, 0);

    const lowStockProds = products.filter((p) => p.stockQuantity <= threshold);

    return {
      totalOrders: activeOrders.length,
      newPendingOrders: orders.filter((o) => o.status === 'Nouvelle').length,
      confirmedOrders: orders.filter((o) => o.status === 'Confirmée').length,
      preparingOrders: orders.filter((o) => o.status === 'En préparation').length,
      deliveringOrders: orders.filter((o) => o.status === 'En cours de livraison').length,
      deliveredOrders: orders.filter((o) => o.status === 'Livrée').length,
      cancelledOrders: orders.filter((o) => isCancelledOrder(o.status)).length,
      todayOrdersCount: todayOrders.length,
      todayCodCount: todayOrders.filter((o) => o.paymentMethod === 'cash_on_delivery').length,
      todayPrepaidCount: 0, // Algerian Cash on Delivery only
      activeOrderValue,
      collectedRevenue,
      lowStockCount: lowStockProds.length,
      criticalLowProducts: lowStockProds.slice(0, 5),
      recentOrders: orders.slice(0, 10),
    };
  }
}

export const storage = new PersistentStorage();
