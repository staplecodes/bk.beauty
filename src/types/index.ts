export type Language = 'fr' | 'ar';

export interface ProductVariant {
  id: string;
  nameFr: string;
  nameAr: string;
  sku: string;
  colorHex?: string;
  inStock: boolean;
  stockQuantity: number;
}

export interface Product {
  id: string;
  sku: string;
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  category: string; // category id
  price: number; // in DA
  originalPrice?: number; // in DA
  image: string;
  additionalImages?: string[];
  stockQuantity: number;
  inStock: boolean;
  featured?: boolean;
  isNewArrival?: boolean;
  variants?: ProductVariant[];
  badgeFr?: string;
  badgeAr?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  nameFr: string;
  nameAr: string;
  descriptionFr?: string;
  descriptionAr?: string;
  icon?: string;
  productCount?: number;
}

export interface CartItem {
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
}

export type OrderStatus =
  | 'Nouvelle'
  | 'Confirmée'
  | 'En préparation'
  | 'En cours de livraison'
  | 'Livrée'
  | 'Annulée';

export interface OrderItem {
  productId: string;
  productNameFr: string;
  productNameAr: string;
  sku: string;
  variantId?: string;
  variantNameFr?: string;
  variantNameAr?: string;
  unitPrice: number; // in DA
  quantity: number;
  lineTotal: number; // in DA
  image?: string;
  productImage?: string;
}

export interface CustomerInfo {
  fullName: string;
  phone: string; // Algerian phone format: e.g. 05XX, 06XX, 07XX
  wilayaCode: string;
  wilayaNameFr: string;
  wilayaNameAr: string;
  commune: string;
  address: string;
  notes?: string;
}

export interface Order {
  id: string;
  reference: string; // e.g. BK-2025-XXXX
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number; // in DA
  deliveryFee: number; // in DA
  finalTotal: number; // in DA
  paymentMethod: 'cash_on_delivery';
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  adminNotes?: string | string[];
  createdAt: string;
  updatedAt: string;
}

export interface WilayaDeliveryRule {
  code: string;
  nameFr: string;
  nameAr: string;
  deliveryFee: number; // in DA
  estimatedDays: string;
  active: boolean;
}

export interface StoreSettings {
  storeName: string;
  taglineFr?: string;
  taglineAr?: string;
  announcementFr: string;
  announcementAr: string;
  instagramUrl: string;
  phoneHotline: string;
  contactPhone?: string;
  emailContact: string;
  contactEmail?: string;
  locationCityFr: string;
  locationCityAr: string;
  storeAddressFr?: string;
  storeAddressAr?: string;
  lowStockThreshold: number;
  freeDeliveryThreshold: number; // in DA, 0 = disabled
  defaultDeliveryFee: number; // in DA
  isStoreOpen: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
  lastLogin?: string;
}

export interface DashboardStats {
  totalOrders: number;
  newPendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  deliveringOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  todayOrdersCount: number;
  todayCodCount: number;
  todayPrepaidCount: number;
  activeOrderValue: number; // Fee-inclusive value of all non-cancelled orders
  collectedRevenue: number; // Only for delivered orders!
  lowStockCount: number;
  criticalLowProducts: Product[];
  recentOrders: Order[];
}
