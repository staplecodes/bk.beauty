import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onProceedToCheckout }) => {
  const { items, removeItem, updateQuantity, subtotal, itemsCount, clearCart } = useCart();
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#292526]/50 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 max-w-full flex pl-10 rtl:pl-0 rtl:pr-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] border-l rtl:border-l-0 rtl:border-r border-[#E8C9CD] shadow-2xl flex flex-col justify-between text-start">
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#E8C9CD]/60 bg-[#FFFFFF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#642C40] text-2xl">shopping_bag</span>
              <h2 className="font-serif-luxury text-xl font-bold text-[#292526]">
                {t.cart.title} ({itemsCount})
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#292526] hover:bg-[#E8C9CD] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Drawer Body: Items or Empty State */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#E8C9CD]/40 flex items-center justify-center text-[#642C40]">
                  <span className="material-symbols-outlined text-3xl">remove_shopping_cart</span>
                </div>
                <h3 className="font-serif-luxury text-lg font-semibold text-[#292526]">
                  {t.cart.empty}
                </h3>
                <p className="text-xs text-[#292526]/70 max-w-xs">
                  {t.cart.emptyDesc}
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 bg-[#642C40] text-[#FAF7F2] hover:bg-[#292526] px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer shadow-sm"
                >
                  {t.cart.continueShopping}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-[#292526]/60 pb-2">
                  <span>{items.length} {t.cart.itemsCount}</span>
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-700 hover:underline cursor-pointer"
                  >
                    {language === 'ar' ? 'تفريغ السلة' : 'Vider le panier'}
                  </button>
                </div>

                <div className="divide-y divide-[#E8C9CD]/50">
                  {items.map((item) => {
                    const productName = language === 'ar' ? item.product.nameAr : item.product.nameFr;
                    const variantName = item.variant
                      ? language === 'ar'
                        ? item.variant.nameAr
                        : item.variant.nameFr
                      : null;

                    return (
                      <div
                        key={`${item.productId}-${item.variantId || 'base'}`}
                        className="py-4 flex items-start gap-4"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#FFFFFF] border border-[#E8C9CD] shrink-0">
                          <img
                            src={item.product.image}
                            alt={productName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-serif-luxury text-sm font-semibold text-[#292526] line-clamp-1">
                              {productName}
                            </h4>
                            <button
                              onClick={() => removeItem(item.productId, item.variantId)}
                              aria-label={t.cart.remove}
                              className="text-[#292526]/40 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>

                          {variantName && (
                            <p className="text-[11px] text-[#C5A46D] font-medium mt-0.5">
                              {variantName}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity Stepper */}
                            <div className="flex items-center border border-[#E8C9CD] rounded bg-[#FFFFFF] p-0.5">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                                className="w-6 h-6 flex items-center justify-center text-xs hover:bg-[#FAF7F2] rounded cursor-pointer font-bold"
                              >
                                -
                              </button>
                              <span className="w-7 text-center font-tabular text-xs font-bold text-[#292526]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                                className="w-6 h-6 flex items-center justify-center text-xs hover:bg-[#FAF7F2] rounded cursor-pointer font-bold"
                              >
                                +
                              </button>
                            </div>

                            {/* Line Total */}
                            <span className="font-tabular text-sm font-bold text-[#642C40]">
                              {(item.product.price * item.quantity).toLocaleString()} {t.currency}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer: Subtotal & Checkout Button */}
          {items.length > 0 && (
            <div className="p-6 bg-[#FFFFFF] border-t border-[#E8C9CD]/60 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#292526]/75">
                  <span>{t.cart.subtotal}</span>
                  <span className="font-tabular font-semibold text-sm text-[#292526]">
                    {subtotal.toLocaleString()} {t.currency}
                  </span>
                </div>
                <div className="flex justify-between text-[#292526]/75">
                  <span>{t.cart.delivery}</span>
                  <span className="font-tabular font-medium text-[#C5A46D]">
                    {language === 'ar' ? 'محسوب حسب الولاية' : 'Calculé à l\'étape suivante'}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E8C9CD]/40 flex justify-between font-bold text-sm text-[#292526]">
                  <span>{t.cart.total}</span>
                  <span className="font-tabular text-lg text-[#642C40]">
                    {subtotal.toLocaleString()} {t.currency}
                  </span>
                </div>
              </div>

              {/* COD Reminder Badge */}
              <div className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#C5A46D]/30 flex items-center gap-2 text-[11px] text-[#292526]/80">
                <span className="material-symbols-outlined text-[#C5A46D] text-[18px]">verified</span>
                <span>{t.cart.codNotice}</span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full bg-[#642C40] text-[#FAF7F2] hover:bg-[#292526] py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>{t.cart.checkoutBtn}</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
