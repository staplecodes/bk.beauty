import React, { useState } from 'react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  const name = language === 'ar' ? product.nameAr : product.nameFr;
  const description = language === 'ar' ? product.descriptionAr : product.descriptionFr;
  const badge = language === 'ar' ? product.badgeAr : product.badgeFr;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock || product.stockQuantity <= 0) return;

    // Pick first variant if present
    const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : undefined;
    addItem(product, firstVariant, 1);

    setIsAddedFeedback(true);
    setTimeout(() => {
      setIsAddedFeedback(false);
    }, 1600);
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group flex flex-col bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#E8C9CD]/50 shadow-2xs hover:shadow-xl hover:border-[#C5A46D]/60 transition-all duration-300 cursor-pointer text-start"
    >
      {/* Product Image Stage */}
      <div className="relative w-full aspect-[4/5] bg-[#FAF7F2] overflow-hidden">
        <img
          src={product.image}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex flex-col gap-1 items-start rtl:items-end">
          <span className="bg-[#FAF7F2]/95 backdrop-blur-xs text-[#642C40] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-2xs border border-[#E8C9CD]">
            {t.product.doorstepCod}
          </span>
          {badge && (
            <span className="bg-[#642C40] text-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-2xs">
              {badge}
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        {!product.inStock || product.stockQuantity <= 0 ? (
          <div className="absolute inset-0 bg-[#292526]/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-[#292526] text-[#FFFFFF] text-xs font-bold uppercase px-3 py-1 rounded">
              {t.product.outOfStock}
            </span>
          </div>
        ) : product.stockQuantity <= 5 ? (
          <div className="absolute bottom-2 left-2 rtl:left-auto rtl:right-2">
            <span className="bg-[#C5A46D] text-[#292526] text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
              {t.product.lowStock} ({product.stockQuantity})
            </span>
          </div>
        ) : null}
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between space-y-3">
        <div>
          {/* Category / Reference */}
          <div className="flex items-center justify-between text-[11px] text-[#292526]/60 mb-1">
            <span className="uppercase tracking-wider font-semibold text-[#C5A46D]">
              {product.sku}
            </span>
            <div className="flex items-center gap-1 text-[#C5A46D]">
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="text-[#292526] font-semibold text-[11px]">5.0</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-serif-luxury text-base sm:text-lg font-semibold text-[#292526] group-hover:text-[#642C40] transition-colors line-clamp-1 leading-snug">
            {name}
          </h3>

          {/* Short description */}
          <p className="text-xs text-[#292526]/65 line-clamp-2 mt-1">
            {description}
          </p>

          {/* Optional Variants Preview (Shades) */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5">
              {product.variants.slice(0, 5).map((v) => (
                <span
                  key={v.id}
                  title={language === 'ar' ? v.nameAr : v.nameFr}
                  className="w-3.5 h-3.5 rounded-full border border-[#FAF7F2] shadow-2xs"
                  style={{ backgroundColor: v.colorHex || '#C5A46D' }}
                />
              ))}
              {product.variants.length > 5 && (
                <span className="text-[10px] text-[#292526]/50 font-medium">
                  +{product.variants.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Quick Add Action */}
        <div className="pt-2 border-t border-[#FAF7F2] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-tabular font-bold text-base sm:text-lg text-[#292526]">
                {product.price.toLocaleString()} {t.currency}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="font-tabular text-xs text-[#292526]/40 line-through">
                  {product.originalPrice.toLocaleString()} {t.currency}
                </span>
              )}
            </div>
            <span className="text-[9px] uppercase tracking-wider text-[#C5A46D] font-bold block">
              {t.product.doorstepCod}
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={!product.inStock || product.stockQuantity <= 0}
            className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
              !product.inStock || product.stockQuantity <= 0
                ? 'bg-[#E8C9CD]/40 text-[#292526]/40 cursor-not-allowed'
                : isAddedFeedback
                ? 'bg-[#292526] text-[#FFFFFF]'
                : 'bg-[#642C40] text-[#FAF7F2] hover:bg-[#292526] shadow-sm'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {isAddedFeedback ? 'done' : 'shopping_bag'}
            </span>
            <span className="hidden sm:inline">
              {isAddedFeedback ? t.product.added : t.product.addToCart}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
