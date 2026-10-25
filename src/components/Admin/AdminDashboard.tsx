import React, { useState, useEffect } from 'react';
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

  const loadData = async () => {
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

      if (statsRes && statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
      }

      // --- ORDERS (Merged safely with localStorage so they never disappear) ---
      let serverOrders: Order[] = [];
      if (ordersRes && ordersRes.ok) {
        const d = await ordersRes.json();
        serverOrders = d.orders || [];
      }
      const localOrders: Order[] = JSON.parse(localStorage.getItem('bk_admin_orders') || '[]');
      const orderMap = new Map<string, Order>();
      for (const o of [...localOrders, ...serverOrders]) {
        if (o && o.id) orderMap.set(o.id, o);
      }
      const mergedOrders = Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      localStorage.setItem('bk_admin_orders', JSON.stringify(mergedOrders));
      setOrders(mergedOrders);

      // --- PRODUCTS ---
      let serverProducts: Product[] = [];
      if (prodsRes && prodsRes.ok) {
        const d = await prodsRes.json();
        serverProducts = d.products || [];
      }
      const localProducts: Product[] = JSON.parse(localStorage.getItem('bk_admin_products') || '[]');
      const prodMap = new Map<string, Product>();
      for (const p of [...localProducts, ...serverProducts]) {
        if (p && p.id) prodMap.set(p.id, p);
      }
      const mergedProducts = Array.from(prodMap.values());
      setProducts(mergedProducts.length > 0 ? mergedProducts : serverProducts);

      if (catsRes && catsRes.ok) {
        const d = await catsRes.json();
        setCategories(d.categories || []);
      }
      if (wilayasRes && wilayasRes.ok) {
        const d = await wilayasRes.json();
        setWilayas(d.wilayas || []);
      }
      if (settingsRes && settingsRes.ok) {
        const d = await settingsRes.json();
        setSettings(d.settings || null);
      }
    } catch (e) {
      console.error('Error fetching admin data', e);
      setOrders(JSON.parse(localStorage.getItem('bk_admin_orders') || '[]'));
      setProducts(JSON.parse(localStorage.getItem('bk_admin_products') || '[]'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      onLogoutSuccess();
    } catch (error) {
      console.error('Logout failed', error);
      showNotification('Unable to end the session. Please try again.');
    }
  };

  const normalizedPath = currentPath === '/gestion-privee' ? '/gestion-privee/dashboard' : currentPath;

  useEffect(() => {
    if (normalizedPath !== '/gestion-privee/dashboard') return;

    const intervalId = window.setInterval(loadData, 15_000);
    window.addEventListener('focus', loadData);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', loadData);
    };
  }, [normalizedPath]);

  return (
    <AdminLayout
      currentPath={normalizedPath}
      onNavigate={onNavigate}
      onLogout={handleLogout}
      onViewStorefront={onViewStorefront}
      pendingOrdersCount={stats?.newPendingOrders || orders.filter(o => o.status === 'Nouvelle').length}
      lowStockCount={stats?.lowStockCount || 0}
    >
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 bg-[#1e1b19] text-[#FAF7F2] border border-[#C5A46D] px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-[#C5A46D] text-base">check_circle</span>
          <span>{actionNotice}</span>
        </div>
      )}

      {isLoading && !stats && orders.length === 0 ? (
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