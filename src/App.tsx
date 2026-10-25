import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Product, Category, StoreSettings, Order } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { CodExplainer } from './components/CodExplainer';
import { AtelierStory } from './components/AtelierStory';
import { InstagramSection } from './components/InstagramSection';
import { ConciergeSection } from './components/ConciergeSection';
import { Footer } from './components/Footer';
import { PolicyModals } from './components/PolicyModals';
import { AdminLogin } from './components/Admin/AdminLogin';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { Admin403Forbidden } from './components/Admin/Admin403Forbidden';
import { AdminLoggedOut } from './components/Admin/AdminLoggedOut';

function StorefrontApp() {
  const { language, t, isRtl } = useLanguage();
  const { isCartOpen, setIsCartOpen } = useCart();
const { effectiveAuthenticated, isLoading: isAuthLoading } = useAuth();
// التحقق المباشر من التخزين المحلي لتجاوز مشاكل الـ Context
const isLocallyLoggedIn = typeof window !== 'undefined' && localStorage.getItem('bk_admin_logged') === 'true';
const effectiveAuthenticated = effectiveAuthenticated || isLocallyLoggedIn;
  // Route state
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const privateAdminPath = '/gestion-privee';

  // Sync route on popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
      navigateTo(privateAdminPath);
      return;
    }

    const privateSubpage =
      currentPath.startsWith(`${privateAdminPath}/`) &&
      currentPath !== `${privateAdminPath}/logged-out` &&
      currentPath !== `${privateAdminPath}/forbidden`;
    if (privateSubpage && !isAuthLoading && !effectiveAuthenticated) {
      navigateTo(privateAdminPath);
      return;
    }

    if (currentPath === privateAdminPath && !isAuthLoading && effectiveAuthenticated) {
      navigateTo(`${privateAdminPath}/dashboard`);
    }
  }, [currentPath, effectiveAuthenticated, isAuthLoading]);

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | undefined>(undefined);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Filter & Search state
  const [activeSection, setActiveSection] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name'>('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(10000);
  const maximumCatalogPrice = Math.max(15000, ...products.map((product) => product.price));

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [activePolicy, setActivePolicy] = useState<'shipping' | 'returns' | 'privacy' | 'terms' | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    setIsLoadingProducts(true);
    try {
      const [prodsRes, catsRes, settingsRes] = await Promise.all([
        fetch('/api/public/products'),
        fetch('/api/public/categories'),
        fetch('/api/public/settings'),
      ]);

      if (prodsRes.ok) {
        const d = await prodsRes.json();
        const loadedProducts: Product[] = d.products || [];
        setProducts(loadedProducts);
        setMaxPriceFilter(Math.max(15000, ...loadedProducts.map((product) => product.price)));
      }
      if (catsRes.ok) {
        const d = await catsRes.json();
        setCategories(d.categories || []);
      }
      if (settingsRes.ok) {
        const d = await settingsRes.json();
        setSettings(d.settings);
      }
    } catch (e) {
      console.error('Failed to fetch storefront data', e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter and sort products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }
    if (inStockOnly && (!p.inStock || p.stockQuantity <= 0)) {
      return false;
    }
    if (p.price > maxPriceFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchFr = p.nameFr.toLowerCase().includes(q) || p.descriptionFr.toLowerCase().includes(q);
      const matchAr = p.nameAr.toLowerCase().includes(q) || p.descriptionAr.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      return matchFr || matchAr || matchSku;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name') {
      const nameA = language === 'ar' ? a.nameAr : a.nameFr;
      const nameB = language === 'ar' ? b.nameAr : b.nameFr;
      return nameA.localeCompare(nameB);
    }
    // Default newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // -------------------------------------------------------------
  // Data state & Auth check
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const isLocallyLoggedIn = typeof window !== 'undefined' && localStorage.getItem('bk_admin_logged') === 'true';
  const effectiveAuthenticated = isAuthenticated || isLocallyLoggedIn;

  // ... (باقي الكود كما هو حتى جزء الـ Admin Routes Dispatcher)

  // -------------------------------------------------------------
  // ADMIN ROUTES DISPATCHER
  // -------------------------------------------------------------
  if (currentPath.startsWith('/admin') || currentPath.startsWith(privateAdminPath)) {
    if (currentPath === `${privateAdminPath}/forbidden`) {
      return (
        <Admin403Forbidden
          onReturnToStorefront={() => navigateTo('/')}
          onGoToLogin={() => navigateTo(privateAdminPath)}
        />
      );
    }

    if (currentPath === `${privateAdminPath}/logged-out`) {
      return (
        <AdminLoggedOut
          onGoToLogin={() => navigateTo(privateAdminPath)}
          onReturnToStorefront={() => navigateTo('/')}
        />
      );
    }

    if (isAuthLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
          <div className="w-8 h-8 border-2 border-[#642C40] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (effectiveAuthenticated) {
      const targetAdminPath =
        currentPath === privateAdminPath ? `${privateAdminPath}/dashboard` : currentPath;
      return (
        <AdminDashboard
          currentPath={targetAdminPath}
          onNavigate={(path) => navigateTo(path)}
          onLogoutSuccess={() => {
            localStorage.removeItem('bk_admin_logged');
            navigateTo(`${privateAdminPath}/logged-out`);
          }}
          onViewStorefront={() => navigateTo('/')}
        />
      );
    } else {
      return (
        <AdminLogin
          onSuccess={() => navigateTo(`${privateAdminPath}/dashboard`)}
          onReturnToStorefront={() => navigateTo('/')}
        />
      );
    }
  }

  // -------------------------------------------------------------
  // PUBLIC STOREFRONT VIEW
  // -------------------------------------------------------------
  return (
    <div className={`min-h-screen bg-[#FAF7F2] text-[#292526] selection:bg-[#E8C9CD] selection:text-[#642C40] ${isRtl ? 'font-arabic' : ''}`}>
      {/* Header */}
      <Header
        settings={settings}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Hero Section */}
      <Hero
        onShopClick={() => {
          const el = document.getElementById('catalog');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onCodClick={() => {
          const el = document.getElementById('cod');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Catalog Section */}
      <section id="catalog" className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-start">
        {/* Section Heading & Category Nav */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#C5A46D] font-bold">
              {t.catalog.pretitle}
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#292526] font-semibold mt-1">
              {t.catalog.title}
            </h2>
          </div>

          <span className="font-tabular text-xs text-[#292526]/60">
            {sortedProducts.length} {t.catalog.productCount}
          </span>
        </div>

        {/* 6 Category Filter Tabs */}
        <div className="mb-6">
          <CategoryNav
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Filters & Sorting Bar */}
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E8C9CD]/60 mb-8 flex flex-wrap items-center justify-between gap-4 text-xs shadow-2xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[#292526]/60 font-medium">{t.catalog.sortBy} :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg px-2.5 py-1.5 text-xs text-[#292526] focus:border-[#642C40] focus:outline-none cursor-pointer"
              >
                <option value="newest">{t.catalog.sortNewest}</option>
                <option value="price-asc">{t.catalog.sortPriceAsc}</option>
                <option value="price-desc">{t.catalog.sortPriceDesc}</option>
                <option value="name">{t.catalog.sortName}</option>
              </select>
            </div>

            {/* In stock only toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#642C40] accent-[#642C40] cursor-pointer"
              />
              <span className="text-[#292526]/80 font-medium">
                {t.catalog.inStockOnly}
              </span>
            </label>
          </div>

          {/* Price Range Slider */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-[#292526]/60 whitespace-nowrap">
              Max : <strong className="font-tabular text-[#642C40]">{maxPriceFilter.toLocaleString()} {t.currency}</strong>
            </span>
            <input
              type="range"
              min={1000}
              max={maximumCatalogPrice}
              step={500}
              value={Math.min(maxPriceFilter, maximumCatalogPrice)}
              onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
              className="accent-[#642C40] cursor-pointer w-32 sm:w-40"
            />
          </div>
        </div>

        {/* Products Grid */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#FFFFFF] rounded-xl p-4 space-y-3 animate-pulse border border-[#E8C9CD]/40">
                <div className="aspect-[4/5] bg-[#FAF7F2] rounded-lg" />
                <div className="h-4 bg-[#FAF7F2] rounded w-3/4" />
                <div className="h-3 bg-[#FAF7F2] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-[#FFFFFF] rounded-2xl border border-[#E8C9CD]/50 p-8">
            <span className="material-symbols-outlined text-4xl text-[#C5A46D]">
              filter_list_off
            </span>
            <p className="text-sm font-semibold text-[#292526]">
              {t.catalog.noProducts}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setInStockOnly(false);
                setMaxPriceFilter(maximumCatalogPrice);
              }}
              className="bg-[#642C40] text-[#FAF7F2] px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              {t.catalog.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {sortedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onOpenDetails={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Cash on Delivery (COD) Assurance Spotlight */}
      <CodExplainer />

      {/* Atelier Craft & Brand Story Section */}
      <AtelierStory />

      {/* Instagram Community Section */}
      <InstagramSection />

      {/* Customer Hotline & WhatsApp Concierge */}
      <ConciergeSection />

      {/* Footer */}
      <Footer
        onOpenPolicy={(policy) => setActivePolicy(policy)}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          const el = document.getElementById('catalog');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order) => setCompletedOrder(order)}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />

      {/* Policy Modals */}
      <PolicyModals
        policyKey={activePolicy}
        onClose={() => setActivePolicy(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <StorefrontApp />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
