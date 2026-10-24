import React from 'react';
import { Order } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ order, onClose }) => {
  const { language, t } = useLanguage();

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#292526]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E8C9CD] overflow-hidden text-start my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Success Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-[#FAF7F2] to-[#FFFFFF] border-b border-[#E8C9CD]/60 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 shadow-xs">
            <span className="material-symbols-outlined text-3xl font-bold">check</span>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A46D]">
            BK BEAUTY · Laghouat
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#292526] mt-1">
            {t.confirmation.title}
          </h2>
          <p className="text-xs text-[#292526]/75 max-w-md mt-1">
            {t.confirmation.subtitle}
          </p>

          {/* Reference Pill */}
          <div className="mt-4 px-4 py-2 bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg flex items-center gap-2">
            <span className="text-xs text-[#292526]/60 font-medium">
              {t.confirmation.orderRef} :
            </span>
            <span className="font-tabular font-bold text-sm text-[#642C40] tracking-wider select-all">
              {order.reference}
            </span>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Cash On Delivery Net Amount Banner */}
          <div className="bg-[#FAF7F2] border border-[#C5A46D]/40 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A46D]">
                {t.confirmation.amountDue}
              </span>
              <p className="font-tabular text-2xl font-bold text-[#642C40] mt-0.5">
                {order.finalTotal.toLocaleString()} {t.currency}
              </p>
              <p className="text-[11px] text-[#292526]/70 mt-0.5">
                {t.confirmation.reminderCod}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#C5A46D]/30 flex items-center justify-center text-[#642C40] shrink-0">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>

          {/* Customer & Delivery Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FAF7F2]/50 p-4 rounded-xl border border-[#E8C9CD]/40">
            <div>
              <span className="text-[#292526]/50 block font-semibold uppercase text-[10px]">
                {t.confirmation.deliveryTo}
              </span>
              <p className="font-semibold text-[#292526] mt-0.5">{order.customer.fullName}</p>
              <p className="text-[#292526]/80 mt-0.5">{order.customer.address}</p>
              <p className="text-[#292526]/80 font-medium">
                {order.customer.commune}, {language === 'ar' ? order.customer.wilayaNameAr : order.customer.wilayaNameFr} ({order.customer.wilayaCode})
              </p>
            </div>

            <div>
              <span className="text-[#292526]/50 block font-semibold uppercase text-[10px]">
                {t.confirmation.phone}
              </span>
              <p className="font-tabular font-semibold text-[#292526] mt-0.5">
                {order.customer.phone}
              </p>

              <span className="text-[#292526]/50 block font-semibold uppercase text-[10px] mt-2">
                {t.confirmation.status}
              </span>
              <span className="inline-block mt-0.5 text-[11px] font-semibold text-[#642C40] bg-[#E8C9CD]/30 px-2 py-0.5 rounded">
                {order.status}
              </span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#292526]">
              {language === 'ar' ? 'المنتجات المطلوبة' : 'Articles commandés'} ({order.items.length})
            </h4>
            <div className="divide-y divide-[#E8C9CD]/40 max-h-40 overflow-y-auto">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-medium text-[#292526] truncate">
                      {language === 'ar' ? item.productNameAr : item.productNameFr}
                    </p>
                    {item.variantNameFr && (
                      <p className="text-[10px] text-[#C5A46D]">
                        {language === 'ar' ? item.variantNameAr : item.variantNameFr}
                      </p>
                    )}
                  </div>
                  <div className="text-end shrink-0 font-tabular">
                    <span className="text-[#292526]/70 mr-2">x{item.quantity}</span>
                    <span className="font-semibold text-[#642C40]">
                      {item.lineTotal.toLocaleString()} {t.currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps Guidance */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl space-y-1.5 text-xs text-[#292526]/80">
            <h5 className="font-bold text-amber-950 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#C5A46D]">
                info
              </span>
              <span>{t.confirmation.nextStepsTitle}</span>
            </h5>
            <p>1. {t.confirmation.nextStep1}</p>
            <p>2. {t.confirmation.nextStep2}</p>
            <p>3. {t.confirmation.nextStep3}</p>
          </div>

          {/* Return CTA */}
          <button
            onClick={onClose}
            className="w-full bg-[#642C40] text-[#FAF7F2] hover:bg-[#292526] py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.confirmation.backToShop}</span>
            <span className="material-symbols-outlined text-base">storefront</span>
          </button>
        </div>
      </div>
    </div>
  );
};
