import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { language, t } = useLanguage();
  const { addItem } = useCart();

  if (!product) return null;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  const name = language === 'ar' ? product.nameAr : product.nameFr;
  const description = language === 'ar' ? product.descriptionAr : product.descriptionFr;
  const badge = language === 'ar' ? product.badgeAr : product.badgeFr;

  const maxStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;
  const isAvailable = product.inStock && maxStock > 0;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addItem(product, selectedVariant, quantity);
    setIsAddedFeedback(true);
    setTimeout(() => {
      setIsAddedFeedback(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#292526]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-3xl bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E8C9CD]/60 overflow-hidden text-start my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10 w-9 h-9 rounded-full bg-[#FAF7F2] text-[#292526] hover:bg-[#E8C9CD] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Gallery Column */}
          <div className="relative bg-[#FAF7F2] p-6 flex flex-col justify-center items-center">
            <div className="aspect-[4/5] w-full max-w-sm rounded-xl overflow-hidden shadow-md bg-[#FFFFFF]">
              <img
                src={product.image}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="bg-[#642C40] text-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                {t.product.doorstepCod}
              </span>
              {badge && (
                <span className="bg-[#C5A46D] text-[#292526] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                  {badge}
                </span>
              )}
            </div>
          </div>

          {/* Product Details & Actions Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* SKU & Category */}
              <div className="flex items-center justify-between text-xs text-[#292526]/60 mb-2">
                <span className="font-semibold text-[#C5A46D]">{product.sku}</span>
                <span className="bg-[#FAF7F2] px-2 py-0.5 rounded text-[11px] font-medium">
                  {isAvailable ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      {t.product.inStock} ({maxStock})
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold">{t.product.outOfStock}</span>
                  )}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#292526] leading-tight">
                {name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-2 mt-3">
                <span className="font-tabular text-2xl font-bold text-[#642C40]">
                  {product.price.toLocaleString()} {t.currency}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="font-tabular text-sm text-[#292526]/40 line-through">
                    {product.originalPrice.toLocaleString()} {t.currency}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#292526]/75 mt-4 leading-relaxed">
                {description}
              </p>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-5 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#292526]">
                    {t.product.selectedShade} :{' '}
                    <span className="text-[#642C40] font-semibold">
                      {selectedVariant
                        ? language === 'ar'
                          ? selectedVariant.nameAr
                          : selectedVariant.nameFr
                        : ''}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#642C40] bg-[#642C40]/5 text-[#642C40] font-bold ring-1 ring-[#642C40]'
                              : 'border-[#E8C9CD] hover:border-[#C5A46D] text-[#292526]'
                          }`}
                        >
                          {v.colorHex && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-[#292526]/20 shadow-2xs"
                              style={{ backgroundColor: v.colorHex }}
                            />
                          )}
                          <span>{language === 'ar' ? v.nameAr : v.nameFr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Formulation Assurance */}
              <div className="mt-6 p-3 bg-[#FAF7F2] rounded-lg border border-[#E8C9CD]/40 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#C5A46D] text-[18px] shrink-0 mt-0.5">
                  spa
                </span>
                <p className="text-xs text-[#292526]/80 leading-relaxed">
                  {language === 'ar'
                    ? 'تركيبة معتمدة خالية من البارابين، مناسبة لجميع أنواع البشرة حتى الحساسة. دفع نقدي آمن عند التسليم بالأغواط وكافة ولايات الجزائر.'
                    : 'Formule testée sous contrôle dermatologique, sans parabènes ni sulfates. Expédition soignée depuis Laghouat avec paiement à la livraison.'}
                </p>
              </div>
            </div>

            {/* Quantity Stepper & Add to Cart Button */}
            <div className="pt-4 border-t border-[#E8C9CD]/50 flex items-center gap-3">
              <div className="flex items-center border border-[#E8C9CD] rounded-lg bg-[#FAF7F2] p-1">
                <button
                  type="button"
                  disabled={quantity <= 1 || !isAvailable}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded flex items-center justify-center text-[#292526] hover:bg-[#FFFFFF] disabled:opacity-30 cursor-pointer font-bold text-sm"
                >
                  -
                </button>
                <span className="w-10 text-center font-tabular font-bold text-sm text-[#292526]">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= maxStock || !isAvailable}
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  className="w-8 h-8 rounded flex items-center justify-center text-[#292526] hover:bg-[#FFFFFF] disabled:opacity-30 cursor-pointer font-bold text-sm"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={`flex-1 py-3 px-6 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  !isAvailable
                    ? 'bg-[#E8C9CD] text-[#292526]/40 cursor-not-allowed'
                    : isAddedFeedback
                    ? 'bg-[#292526] text-[#FFFFFF]'
                    : 'bg-[#642C40] text-[#FAF7F2] hover:bg-[#292526]'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {isAddedFeedback ? 'check_circle' : 'shopping_bag'}
                </span>
                <span>{isAddedFeedback ? t.product.added : t.product.addToCart}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
