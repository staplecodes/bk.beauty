import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { randomBytes, randomUUID, timingSafeEqual } from 'crypto';
import { storage } from './src/db/storage';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = process.cwd();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'bk-beauty-super-secret-jwt-key-2026-production';
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL?.trim().toLowerCase() || storage.getAdminUser('admin@bkbeauty.dz')?.email || '';
const ADMIN_COOKIE = 'bk_admin_session';
const ADMIN_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const PRODUCT_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'products');
const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
const PRODUCT_IMAGE_MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jfif': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function saveProductImage(dataUrl: unknown): string {
  if (typeof dataUrl !== 'string') {
    throw new Error('Sélectionnez une image JPG, JPEG, JFIF, PNG ou WEBP valide.');
  }

  const match = /^data:(image\/(?:jpeg|jfif|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match) {
    throw new Error('Format d’image invalide. Utilisez un fichier JPG, JPEG, JFIF, PNG ou WEBP.');
  }

  const [, mimeType, encoded] = match;
  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.length === 0 || bytes.length > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error('L’image doit peser 5 Mo maximum.');
  }

  const hasValidSignature =
    (mimeType === 'image/jpeg' || mimeType === 'image/jfif')
      ? bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
      : mimeType === 'image/png'
        ? bytes.length >= 8 &&
          bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
        : bytes.length >= 12 &&
          bytes.toString('ascii', 0, 4) === 'RIFF' &&
          bytes.toString('ascii', 8, 12) === 'WEBP';

  if (!hasValidSignature) {
    throw new Error(
      'Le contenu du fichier ne correspond pas à une image JPG, JPEG, JFIF, PNG ou WEBP valide.',
    );
  }
  // On Vercel, the filesystem is read-only, so store the validated base64 image directly
if (process.env.VERCEL) {
  return dataUrl;
}

  fs.mkdirSync(PRODUCT_UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${PRODUCT_IMAGE_MIME_EXTENSIONS[mimeType]}`;
  fs.writeFileSync(path.join(PRODUCT_UPLOAD_DIR, filename), bytes, { flag: 'wx' });
  return `/uploads/products/${filename}`;
}

// Basic in-memory rate limiter for sensitive endpoints
const rateLimitMap = new Map<string, { count: number; firstAttempt: number }>();
function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const key = `${ip}_${req.path}`;
    const now = Date.now();
    const record = rateLimitMap.get(key as string);

    if (!record) {
      rateLimitMap.set(key as string, { count: 1, firstAttempt: now });
      next();
      return;
    }

    if (now - record.firstAttempt > windowMs) {
      rateLimitMap.set(key as string, { count: 1, firstAttempt: now });
      next();
      return;
    }

    if (record.count >= limit) {
      res.status(429).json({
        error: 'Trop de requêtes. Veuillez patienter avant de réessayer.',
        errorAr: 'عدد كبير جداً من المحاولات. يرجى الانتظار قليلاً.',
      });
      return;
    }

    record.count += 1;
    next();
  };
}

app.use(express.json({ limit: '7mb' }));
app.use(cookieParser());
app.use('/uploads/products', express.static(PRODUCT_UPLOAD_DIR, { fallthrough: false }));
app.use('/src/assets', express.static(path.resolve(__dirname, 'src', 'assets')));

interface AuthRequest extends Request {
  adminUser?: { id: string; email: string; name: string; role: string };
  adminSessionId?: string;
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.[ADMIN_COOKIE];
  if (!token) {
    res.status(401).json({
      error: 'Unauthorized. Administrator credentials are required.',
    });
    return;
  }

  try {
  const decoded = jwt.verify(token, JWT_SECRET) as {
    id: string;
    email: string;
    name: string;
    role: string;
    sid: string;
  };
  req.adminUser = {
    id: decoded.id,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
  };
  req.adminSessionId = decoded.sid;
  next();
} catch {
  res.status(403).json({
    error: 'Session expired or invalid. Please sign in again.',
  });
} catch {
    res.status(403).json({
      error: 'Session expired or invalid. Please sign in again.',
    });
  }
}

app.use('/api/admin', (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' && req.path === '/login') {
    next();
    return;
  }
  requireAdmin(req as AuthRequest, res, next);
});

// -------------------------------------------------------------
// PUBLIC STOREFRONT ENDPOINTS
// -------------------------------------------------------------

// Products listing
app.get('/api/public/products', (req: Request, res: Response) => {
  const { category, search, inStockOnly, featured } = req.query;
  const products = storage.getProducts({
    category: category as string,
    search: search as string,
    inStockOnly: inStockOnly === 'true',
    featured: featured === 'true',
  });
  res.json({ products });
});

// Single product
app.get('/api/public/products/:id', (req: Request, res: Response) => {
  const product = storage.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Produit introuvable' });
    return;
  }
  res.json({ product });
});

// Categories listing
app.get('/api/public/categories', (_req: Request, res: Response) => {
  const categories = storage.getCategories();
  res.json({ categories });
});

// Wilayas and delivery fees
app.get('/api/public/wilayas', (_req: Request, res: Response) => {
  const wilayas = storage.getWilayas();
  res.json({ wilayas });
});

// Store Settings
app.get('/api/public/settings', (_req: Request, res: Response) => {
  const settings = storage.getSettings();
  res.json({ settings });
});

// Create Order (Cash on Delivery)
app.post('/api/public/orders', rateLimiter(10, 60 * 1000), (req: Request, res: Response) => {
  const { customer, items } = req.body;

  if (!customer || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Données de commande incomplètes.' });
    return;
  }

  const result = storage.createOrder({ customer, items });

  if (!result.success || !result.order) {
    res.status(400).json({ error: result.error || 'Impossible d\'enregistrer la commande.' });
    return;
  }

  res.status(201).json({
    success: true,
    order: result.order,
  });
});

// Track Order by Reference & Phone
app.get('/api/public/orders/:reference', (req: Request, res: Response) => {
  const { phone } = req.query;
  const order = storage.getOrderByReference(req.params.reference);

  if (!order) {
    res.status(404).json({ error: 'Commande introuvable avec cette référence.' });
    return;
  }

  // Basic security check: must match customer phone if provided
  if (phone) {
    const cleanQueryPhone = (phone as string).replace(/\s+/g, '');
    const cleanOrderPhone = order.customer.phone.replace(/\s+/g, '');
    if (!cleanOrderPhone.includes(cleanQueryPhone)) {
      res.status(403).json({ error: 'Numéro de téléphone non correspondant.' });
      return;
    }
  }

  // Return public order details
  res.json({
    reference: order.reference,
    status: order.status,
    customerName: order.customer.fullName,
    wilaya: order.customer.wilayaNameFr,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    finalTotal: order.finalTotal,
    itemsCount: order.items.reduce((s, i) => s + i.quantity, 0),
    items: order.items.map((i) => ({
      nameFr: i.productNameFr,
      nameAr: i.productNameAr,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      lineTotal: i.lineTotal,
    })),
    createdAt: order.createdAt,
  });
});

// -------------------------------------------------------------
// PRIVATE ADMINISTRATOR ENDPOINTS
// -------------------------------------------------------------

// Admin Login
app.post('/api/admin/login', rateLimiter(8, 60 * 1000), (req: Request, res: Response) => {
  const { email, password } = req.body;
  const suppliedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const suppliedPassword = typeof password === 'string' ? password : '';
  const expectedEmailBuffer = Buffer.from(ADMIN_EMAIL);
  const suppliedEmailBuffer = Buffer.from(suppliedEmail);
  const emailMatches =
    expectedEmailBuffer.length === suppliedEmailBuffer.length &&
    timingSafeEqual(expectedEmailBuffer, suppliedEmailBuffer);
  const user = emailMatches ? storage.verifyAdminCredentials(ADMIN_EMAIL, suppliedPassword) : null;

  if (!user) {
    res.status(401).json({
      error: 'Invalid username or password.',
    });
    return;
  }

  const sessionId = randomUUID();
  const expiresAt = Date.now() + ADMIN_SESSION_DURATION_MS;
  storage.createAdminSession(sessionId, expiresAt);

  const token = jwt.sign(
    { ...user, sid: sessionId },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.cookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_DURATION_MS,
  });
  res.json({ success: true, user });
});

app.post('/api/admin/change-password', rateLimiter(5, 60 * 1000), (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    res.status(400).json({ error: 'Current and new passwords are required.' });
    return;
  }

  const newPasswordLength = Buffer.byteLength(newPassword);
  if (newPasswordLength < 12 || newPasswordLength > 72) {
    res.status(400).json({ error: 'New password must be between 12 and 72 bytes.' });
    return;
  }

  if (!req.adminUser || !storage.changeAdminPassword(req.adminUser.email, currentPassword, newPassword)) {
    res.status(400).json({ error: 'Current password is incorrect.' });
    return;
  }

  storage.revokeOtherAdminSessions(req.adminSessionId);
  res.json({ success: true });
});

// Admin Logout
app.post('/api/admin/logout', (req: AuthRequest, res: Response) => {
  if (req.adminSessionId) storage.revokeAdminSession(req.adminSessionId);
  res.clearCookie(ADMIN_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  res.clearCookie('bk_admin_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.json({ success: true, message: 'Signed out.' });
});

// Admin Profile verification
app.get('/api/admin/me', requireAdmin, (req: AuthRequest, res: Response) => {
  res.json({ user: req.adminUser });
});

// Admin Dashboard KPIs
app.get('/api/admin/dashboard-stats', requireAdmin, (_req: Request, res: Response) => {
  const stats = storage.getDashboardStats();
  res.json({ stats });
});

// Admin Orders list
app.get('/api/admin/orders', requireAdmin, (req: Request, res: Response) => {
  const { status, search } = req.query;
  const orders = storage.getOrders({
    status: status as any,
    search: search as string,
  });
  res.json({ orders });
});

// Admin Update Order Status
app.patch('/api/admin/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { status, adminNote } = req.body;
  if (!status) {
    res.status(400).json({ error: 'Nouveau statut obligatoire.' });
    return;
  }

  const updatedOrder = storage.updateOrderStatus(req.params.id, status, adminNote);
  if (!updatedOrder) {
    res.status(404).json({ error: 'Commande introuvable.' });
    return;
  }

  res.json({ success: true, order: updatedOrder });
});

// Admin Products CRUD
app.post('/api/admin/products', requireAdmin, (req: Request, res: Response) => {
  const { nameFr, nameAr, descriptionFr, descriptionAr, category, price, originalPrice, stockQuantity, image, sku, badgeFr, badgeAr, variants, featured, isNewArrival } = req.body;

  if (!nameFr || !nameAr || !price || !category) {
    res.status(400).json({ error: 'Nom, catégorie et prix sont obligatoires.' });
    return;
  }

  const existingSkus = new Set(storage.getProducts().map((product) => product.sku.toUpperCase()));
  let uniqueSku =
    typeof sku === 'string' && /^BK-[A-Z0-9-]{8,40}$/i.test(sku) && !existingSkus.has(sku.toUpperCase())
      ? sku.toUpperCase()
      : '';
  while (!uniqueSku || existingSkus.has(uniqueSku)) {
    uniqueSku = `BK-${randomBytes(8).toString('hex').toUpperCase()}`;
  }

  let savedImage: string;
  try {
    savedImage = typeof image === 'string' && image.startsWith('data:')
      ? saveProductImage(image)
      : typeof image === 'string' && image
        ? image
        : '/no-product-image.svg';
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Impossible d’enregistrer cette image.',
    });
    return;
  }

  const newProduct = storage.addProduct({
    sku: uniqueSku,
    nameFr,
    nameAr,
    descriptionFr: descriptionFr || '',
    descriptionAr: descriptionAr || '',
    category,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    stockQuantity: Number(stockQuantity) || 0,
    inStock: (Number(stockQuantity) || 0) > 0,
    image: savedImage,
    badgeFr,
    badgeAr,
    variants,
    featured: Boolean(featured),
    isNewArrival: Boolean(isNewArrival),
  });

  res.status(201).json({ success: true, product: newProduct });
});

app.put('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  const updates = { ...req.body } as Record<string, unknown>;
  delete updates.sku;
  if (typeof updates.image === 'string' && updates.image.startsWith('data:')) {
    try {
      updates.image = saveProductImage(updates.image);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Impossible d’enregistrer cette image.',
      });
      return;
    }
  }
  const updated = storage.updateProduct(req.params.id, updates);
  if (!updated) {
    res.status(404).json({ error: 'Produit introuvable.' });
    return;
  }
  res.json({ success: true, product: updated });
});

app.patch('/api/admin/products/:id/stock', requireAdmin, (req: Request, res: Response) => {
  const { inStock, stockQuantity } = req.body;
  const updated = storage.toggleProductStock(req.params.id, Boolean(inStock), stockQuantity);
  if (!updated) {
    res.status(404).json({ error: 'Produit introuvable.' });
    return;
  }
  res.json({ success: true, product: updated });
});

app.delete('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = storage.deleteProduct(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Produit introuvable.' });
    return;
  }
  res.json({ success: true });
});

// Admin Update Store Settings
app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const updated = storage.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

// Admin Update Wilaya Delivery Rule
app.put('/api/admin/wilayas/:code', requireAdmin, (req: Request, res: Response) => {
  const { code, deliveryFee, estimatedDays, active } = req.body;
  if (
    code !== req.params.code ||
    typeof deliveryFee !== 'number' ||
    !Number.isSafeInteger(deliveryFee) ||
    deliveryFee < 0 ||
    typeof estimatedDays !== 'string' ||
    !estimatedDays.trim() ||
    typeof active !== 'boolean'
  ) {
    res.status(400).json({ error: 'Tarif, délai ou statut de livraison invalide.' });
    return;
  }

  const updated = storage.updateWilaya(req.params.code, {
    deliveryFee,
    estimatedDays: estimatedDays.trim(),
    active,
  });
  if (!updated) {
    res.status(404).json({ error: 'Wilaya introuvable.' });
    return;
  }
  res.json({ success: true, wilaya: updated });
});

// Admin Categories CRUD
app.post('/api/admin/categories', requireAdmin, (req: Request, res: Response) => {
  const { nameFr, nameAr, descriptionFr, descriptionAr, slug, icon } = req.body;
  if (!nameFr || !nameAr) {
    res.status(400).json({ error: 'Noms français et arabe obligatoires.' });
    return;
  }
  const newCat = storage.addCategory({
    nameFr,
    nameAr,
    descriptionFr: descriptionFr || '',
    descriptionAr: descriptionAr || '',
    slug: slug || nameFr.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    icon: icon || 'category',
  });
  res.status(201).json({ success: true, category: newCat });
});

app.put('/api/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = storage.updateCategory(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Catégorie introuvable.' });
    return;
  }
  res.json({ success: true, category: updated });
});

app.delete('/api/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = storage.deleteCategory(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Catégorie introuvable.' });
    return;
  }
  res.json({ success: true });
});

// Admin Inventory Stock Adjustment
app.patch('/api/admin/inventory/:id/stock', requireAdmin, (req: Request, res: Response) => {
  const { stockQuantity, variantId } = req.body;
  if (typeof stockQuantity !== 'number') {
    res.status(400).json({ error: 'Quantité de stock invalide.' });
    return;
  }
  const updated = storage.adjustStock(req.params.id, stockQuantity, variantId);
  if (!updated) {
    res.status(404).json({ error: 'Produit introuvable.' });
    return;
  }
  res.json({ success: true, product: updated });
});

// -------------------------------------------------------------
// SERVER INITIALIZATION (Dev with Vite or Production Static)
// -------------------------------------------------------------
async function startServer() {
  if (!ADMIN_EMAIL || !storage.getAdminUser(ADMIN_EMAIL)) {
    console.warn('ADMIN_EMAIL check warning.');
  }
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BK BEAUTY] Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

// Only run startServer() locally, NOT on Vercel
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('[BK BEAUTY] Failed to start server:', err);
  });
}

export default app;