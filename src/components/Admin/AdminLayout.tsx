import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AdminChangePassword } from './AdminChangePassword';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onViewStorefront: () => void;
  pendingOrdersCount?: number;
  lowStockCount?: number;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentPath,
  onNavigate,
  onLogout,
  onViewStorefront,
  pendingOrdersCount = 0,
  lowStockCount = 0,
  children,
}) => {
  const { user } = useAuth();
  const { language, setLanguage, isRtl } = useLanguage();

  const navItems = [
    {
      path: '/gestion-privee/dashboard',
      labelFr: 'Vue d\'ensemble',
      labelAr: 'لوحة الإحصائيات',
      icon: 'dashboard',
    },
    {
      path: '/gestion-privee/orders',
      labelFr: 'Commandes',
      labelAr: 'إدارة الطلبيات',
      icon: 'local_shipping',
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : undefined,
      badgeColor: 'bg-[#C5A46D] text-[#292526]',
    },
    {
      path: '/gestion-privee/products',
      labelFr: 'Catalogue Produits',
      labelAr: 'كتالوج المنتجات',
      icon: 'spa',
    },
    {
      path: '/gestion-privee/inventory',
      labelFr: 'Gestion des Stocks',
      labelAr: 'إدارة المخزون',
      icon: 'inventory_2',
      badge: lowStockCount > 0 ? `${lowStockCount} alerte(s)` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      path: '/gestion-privee/categories',
      labelFr: 'Catégories',
      labelAr: 'أقسام المتجر',
      icon: 'category',
    },
    {
      path: '/gestion-privee/settings',
      labelFr: 'Configuration Magasin',
      labelAr: 'إعدادات المتجر',
      icon: 'settings',
    },
  ];

  return (
    <div className={`min-h-screen bg-[#FAF7F2] text-[#292526] flex text-start ${isRtl ? 'font-arabic' : ''}`}>
      {/* Fixed Admin Sidebar */}
      <aside className="w-64 bg-[#FFFFFF] border-r rtl:border-r-0 rtl:border-l border-[#E8C9CD] flex flex-col justify-between shrink-0 shadow-xs hidden md:flex fixed top-0 bottom-0 z-40">
        <div className="flex flex-col">
          {/* Navigation Links */}
          <nav className="px-3 space-y-1 pt-4">
            {navItems.map((item) => {
              const isActive =
                currentPath === item.path ||
                (item.path === '/gestion-privee/dashboard' && currentPath === '/gestion-privee');

              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1e1b19] text-[#FAF7F2] font-semibold shadow-xs'
                      : 'text-[#292526]/80 hover:bg-[#FAF7F2] hover:text-[#642C40]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">
                      {item.icon}
                    </span>
                    <span>{language === 'ar' ? item.labelAr : item.labelFr}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-tabular ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Button */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#E8C9CD]/60 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#642C40] flex items-center justify-center text-[#FAF7F2] font-bold text-xs shrink-0">
              BK
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-bold text-[#292526] truncate">
                {user?.name || 'Administrateur'}
              </p>
              <p className="font-tabular text-[10px] text-[#292526]/60 truncate">
                {user?.email || 'Administrateur'}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 text-rose-800 hover:bg-rose-100 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">lock</span>
            <span>{language === 'ar' ? 'تسجيل الخروج الآمن' : 'Déconnexion Sécurisée'}</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 md:pl-64 rtl:md:pl-0 rtl:md:pr-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-[#FFFFFF] border-b border-[#E8C9CD] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-4">
            <span className="font-serif-luxury text-base font-bold text-[#642C40] hidden sm:inline">
              BK BEAUTY
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#FAF7F2] border border-[#E8C9CD] rounded-full p-0.5 text-xs font-semibold">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-colors ${
                  language === 'fr' ? 'bg-[#642C40] text-[#FFFFFF]' : 'text-[#292526]/70'
                }`}
              >
                Français
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-colors ${
                  language === 'ar' ? 'bg-[#642C40] text-[#FFFFFF]' : 'text-[#292526]/70'
                }`}
              >
                العربية
              </button>
            </div>

            <AdminChangePassword />

            {/* View Storefront CTA */}
            <button
              onClick={onViewStorefront}
              className="flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#E8C9CD]/40 border border-[#E8C9CD] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#292526] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#C5A46D]">
                open_in_new
              </span>
              <span className="hidden sm:inline">
                {language === 'ar' ? 'عرض المتجر للزبائن' : 'Voir la boutique'}
              </span>
            </button>

            {/* Mobile Logout Button */}
            <button
              onClick={onLogout}
              className="md:hidden p-1.5 text-rose-700 hover:bg-rose-50 rounded"
              title="Logout"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden bg-[#FFFFFF] border-b border-[#E8C9CD] px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.path ||
              (item.path === '/gestion-privee/dashboard' && currentPath === '/gestion-privee');

            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#1e1b19] text-[#FAF7F2] font-semibold'
                    : 'bg-[#FAF7F2] text-[#292526]'
                }`}
              >
                {language === 'ar' ? item.labelAr : item.labelFr}
              </button>
            );
          })}
        </div>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
};
