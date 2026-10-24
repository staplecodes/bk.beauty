import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { StoreSettings } from '../types';

interface HeaderProps {
  settings?: StoreSettings;
  activeSection: string;
  setActiveSection: (section: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeSection,
  setActiveSection,
  searchQuery,
  setSearchQuery,
  onOpenCart,
}) => {
  const { language, setLanguage, t, isRtl } = useLanguage();
  const { itemsCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const announcementText =
    language === 'ar'
      ? settings?.announcementAr || t.announcement
      : settings?.announcementFr || t.announcement;

  const instagramUrl =
    settings?.instagramUrl || 'https://www.instagram.com/bachir_bk_beauty03/';

  const navItems = [
    { id: 'home', label: t.nav.home },
    { id: 'cod', label: t.nav.codInfo },
    { id: 'about', label: t.nav.about },
    { id: 'contact', label: t.nav.contact },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);

    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8C9CD]/40 transition-all duration-200">
      {/* Top Announcement Bar */}
      <div className="bg-[#642C40] text-[#FAF7F2] px-4 sm:px-8 py-1.5 text-xs text-center flex items-center justify-between font-medium">
        <div className="flex-1 text-center truncate">
          <span className="tracking-wide">{announcementText}</span>
        </div>
        <div className="hidden md:flex items-center gap-4 shrink-0 text-[11px] font-normal">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C5A46D] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">photo_camera</span>
            <span>@bachir_bk_beauty03</span>
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Monogram & Name */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-start cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-full border border-[#C5A46D] flex flex-col items-center justify-center bg-[#FAF7F2] shadow-sm group-hover:border-[#642C40] transition-colors">
            <span className="font-serif-luxury font-bold text-sm tracking-tighter text-[#642C40]">BK</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif-luxury text-xl sm:text-2xl font-bold tracking-tight text-[#292526] group-hover:text-[#642C40] transition-colors">
              BK BEAUTY
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#C5A46D] font-semibold -mt-1">
              Cosmétiques · Laghouat
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-[#292526]/80">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`hover:text-[#642C40] transition-colors relative py-1 cursor-pointer whitespace-nowrap ${
                activeSection === item.id ? 'text-[#642C40] font-semibold' : ''
              }`}
            >
              {item.label}
              {activeSection === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#642C40] rounded-full animate-fadeIn" />
              )}
            </button>
          ))}
        </nav>

        {/* Right Actions: Search, Currency, Language Selector, Cart */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Quick Search */}
          <div className="hidden sm:flex items-center bg-[#FFFFFF] border border-[#E8C9CD] px-3 py-1.5 rounded-full text-xs text-[#292526] w-48 md:w-56 focus-within:border-[#C5A46D] transition-colors shadow-2xs">
            <span className="material-symbols-outlined text-[18px] text-[#C5A46D] mr-1.5">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="bg-transparent w-full text-xs placeholder:text-[#292526]/40 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#292526]/40 hover:text-[#292526] text-xs cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          {/* Language Selector (Français | العربية) */}
          <div className="flex items-center bg-[#FFFFFF] border border-[#E8C9CD] rounded-full p-0.5 text-xs font-semibold shadow-2xs">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                language === 'fr'
                  ? 'bg-[#642C40] text-[#FFFFFF] shadow-sm'
                  : 'text-[#292526]/70 hover:text-[#642C40]'
              }`}
            >
              Français
            </button>
            <span className="text-[#E8C9CD] select-none">|</span>
            <button
              onClick={() => setLanguage('ar')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer font-arabic ${
                language === 'ar'
                  ? 'bg-[#642C40] text-[#FFFFFF] shadow-sm'
                  : 'text-[#292526]/70 hover:text-[#642C40]'
              }`}
            >
              العربية
            </button>
          </div>

          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            aria-label={t.cart.title}
            className="relative flex items-center gap-2 bg-[#642C40] text-[#FAF7F2] hover:bg-[#292526] px-3.5 py-2 rounded-full text-xs font-medium transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span className="hidden sm:inline font-semibold">{t.currency}</span>
            {itemsCount > 0 && (
              <span className="bg-[#C5A46D] text-[#292526] text-[11px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center -mr-1">
                {itemsCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#292526] hover:text-[#642C40] cursor-pointer"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F2] border-b border-[#E8C9CD] px-6 py-4 space-y-3 animate-fadeIn">
          <div className="flex items-center bg-[#FFFFFF] border border-[#E8C9CD] px-3 py-2 rounded-lg text-xs text-[#292526] mb-3">
            <span className="material-symbols-outlined text-[18px] text-[#C5A46D] mr-2">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="bg-transparent w-full text-xs focus:outline-none"
            />
          </div>

          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`py-2 text-start text-sm font-medium transition-colors ${
                  activeSection === item.id ? 'text-[#642C40] font-bold' : 'text-[#292526]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E8C9CD]/60 flex items-center justify-between text-xs text-[#292526]/70">
            <span>{t.currencyFull}: {t.currency}</span>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#642C40] font-semibold flex items-center gap-1"
            >
              <span>Instagram @bachir_bk_beauty03</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
