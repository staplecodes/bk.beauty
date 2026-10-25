import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  DashboardStats,
  Order,
  Product,
  Category,
  WilayaDeliveryRule,
  StoreSettings,
} from '../../types';
import { AdminLayout } from './AdminLayout';
import { AdminDashboardOverview } from './pages/AdminDashboardOverview';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminInventoryPage } from './pages/AdminInventoryPage';
import { AdminCategoriesPage } from './pages/AdminCategoriesPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

interface AdminDashboardProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogoutSuccess: () => void;
  onViewStorefront: () => void;
}

const safeGetLocal = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

// Merge local edits/new items with server items (local takes priority by ID)
const mergeById = <T extends { id?: any }>(localItems: T[], serverItems: T[]): T[] => {
  const localMap = new Map(localItems.map((item) => [String(item.id), item]));
  const merged = [...localItems];
  for (const sItem of serverItems) {
    if (!localMap.has(String(sItem.id))) {
      merged.push(sItem);
    }
  }
  return merged;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentPath,
  onNavigate,
  onLogoutSuccess,
  onViewStorefront,
}) => {
  const { logout } = useAuth();
  const { language } = useLanguage();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wilayas, setWilayas] = useState<WilayaDeliveryRule[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, ordersRes, prodsRes, catsRes, wilayasRes, settingsRes] =
        await Promise.all([
          fetch('/api/admin/dashboard-stats').catch(() => null),
          fetch('/api/admin/orders').catch(() => null),
          fetch('/api/public/products').catch(() => null),
          fetch('/api/public/categories').catch(() => null),
          fetch('/api/public/wilayas').catch(() => null),
          fetch('/api/public/settings').catch(() => null),
        ]);

      // 1. Orders: Always merge localStorage orders with server orders so new orders never disappear
      let serverOrders: Order[] = [];
      if (ordersRes && ordersRes.ok) {
        const d = await ordersRes.json();
        serverOrders = d.orders || [];
      }
      const localOrders = safeGetLocal<Order[]>('bk_admin_orders', []);
      const deletedOrderIds = safeGetLocal<string[]>('bk_deleted_orders', []);
      const mergedOrders = mergeById(localOrders, serverOrders).filter(
        (o) => !deletedOrderIds.includes(String(o.id))
      );
      setOrders(mergedOrders);

      // 2. Products: Merge local modifications & additions with server products
      let serverProducts: Product[] = [];
      if (prodsRes && prodsRes.ok) {
        const d = await prodsRes.json();
        serverProducts = d.products || [];
      }
      const localProducts = safeGetLocal<Product[]>('bk_admin_products', []);
      const deletedProductIds = safeGetLocal<string[]>('bk_deleted_products', []);
      const mergedProducts = mergeById(localProducts, serverProducts).filter(
        (p) => !deletedProductIds.includes(String(p.id))
      );
      setProducts(mergedProducts);

      // 3. Stats: Compute accurate stats using merged orders & products so auto-refresh never wipes new orders
      let serverStats: Partial<DashboardStats> = {};
      if (statsRes && statsRes.ok) {
        const d = await statsRes.json();
        serverStats = d.stats || {};
      }
      const pendingCount = mergedOrders.filter(
        (o: any) => o.status === 'Nouvelle' || o.status === 'pending' || o.status === 'new'
      ).length;
      const lowStock = mergedProducts.filter(
        (p: any) => typeof p.stock === 'number' && p.stock <= 5
      ).length;

      setStats({
        ...(serverStats as DashboardStats),
        totalOrders: Math.max(mergedOrders.length, serverStats.totalOrders || 0),
        newPendingOrders: mergedOrders.length > 0 ? pendingCount : (serverStats.newPendingOrders || 0),
        recentOrders: mergedOrders.length > 0 ? mergedOrders.slice(0, 10) : (serverStats.recentOrders || []),
        lowStockCount: mergedProducts.length > 0 ? lowStock : (serverStats.lowStockCount || 0),
      });

      // 4. Categories
      let serverCats: Category[] = [];
      if (catsRes && catsRes.ok) {
        const d = await catsRes.json();
        serverCats = d.categories || [];
      }
      const localCats = safeGetLocal<Category[]>('bk_admin_categories', []);
      setCategories(mergeById(localCats, serverCats));

      // 5. Wilayas
      let serverWilayas: WilayaDeliveryRule[] = [];
      if (wilayasRes && wilayasRes.ok) {
        const d = await wilayasRes.json();
        serverWilayas = d.wilayas || [];
      }
      const localWilayas = safeGetLocal<WilayaDeliveryRule[]>('bk_admin_wilayas', []);
      setWilayas(localWilayas.length > 0 ? mergeById(localWilayas, serverWilayas) : serverWilayas);

      // 6. Settings
      let serverSettings: StoreSettings | null = null;
      if (settingsRes && settingsRes.ok) {
        const d = await settingsRes.json();
        serverSettings = d.settings || null;
      }
      const localSettings = safeGetLocal<StoreSettings | null>('bk_admin_settings', null);
      setSettings(localSettings ? { ...serverSettings, ...localSettings } : serverSettings);
    } catch (e) {
      console.error('Error fetching admin data', e);
      setOrders(safeGetLocal<Order[]>('bk_admin_orders', []));
      setProducts(safeGetLocal<Product[]>('bk_admin_products', []));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    try {
      await logout();
      onLogoutSuccess();
    } catch (error) {
      console.error('Logout failed', error);
      showNotification('Unable to end the session. Please try again.');
    }
  };

  const normalizedPath =
    currentPath === '/gestion-privee' ? '/gestion-privee/dashboard' : currentPath;

  // Auto-refresh using loadData so localStorage orders are NEVER overwritten by a raw stats call
  useEffect(() => {
    if (normalizedPath !== '/gestion-privee/dashboard') return;

    const intervalId = window.setInterval(loadData, 15_000);
    window.addEventListener('focus', loadData);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', loadData);
    };
  }, [normalizedPath, loadData]);

  return (
    <AdminLayout
      currentPath={normalizedPath}
      onNavigate={onNavigate}
      onLogout={handleLogout}
      onViewStorefront={onViewStorefront}
      pendingOrdersCount={stats?.newPendingOrders || 0}
      lowStockCount={stats?.lowStockCount || 0}
    >
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 bg-[#1e1b19] text-[#FAF7F2] border border-[#C5A46D] px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-[#C5A46D] text-base">check_circle</span>
          <span>{actionNotice}</span>
        </div>
      )}

      {isLoading && !stats ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <div className="w-8 h-8 border-2 border-[#642C40] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#292526]/60 font-medium">
            {language === 'ar'
              ? 'جاري تحميل لوحة التحكم والبيانات المشفرة...'
              : 'Synchronisation de la console sécurisée BK BEAUTY...'}
          </p>
        </div>
      ) : (
        <>
          {/* Subpage Routing */}
          {normalizedPath === '/gestion-privee/dashboard' && (
            <AdminDashboardOverview
              stats={stats}
              onNavigate={onNavigate}
              onOpenOrder={(ord) => {
                setInspectingOrder(ord);
                onNavigate('/gestion-privee/orders');
              }}
            />
          )}

          {normalizedPath === '/gestion-privee/orders' && (
            <AdminOrdersPage
              orders={orders}
              onRefresh={loadData}
              onNotify={showNotification}
            />
          )}

          {normalizedPath === '/gestion-privee/products' && (
            <AdminProductsPage
              products={products}
              categories={categories}
              onRefresh={loadData}
              onNotify={showNotification}
            />
          )}

          {normalizedPath === '/gestion-privee/inventory' && (
            <AdminInventoryPage
              products={products}
              onRefresh={loadData}
              onNotify={showNotification}
            />
          )}

          {normalizedPath === '/gestion-privee/categories' && (
            <AdminCategoriesPage
              categories={categories}
              products={products}
              onRefresh={loadData}
              onNotify={showNotification}
            />
          )}

          {normalizedPath === '/gestion-privee/settings' && (
            <AdminSettingsPage
              settings={settings}
              wilayas={wilayas}
              onRefresh={loadData}
              onNotify={showNotification}
            />
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;