import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onOpenPolicy: (policyKey: 'shipping' | 'returns' | 'privacy' | 'terms') => void;
  onSelectCategory: (categoryId: string) => void;
  onGoToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy, onSelectCategory, onGoToAdmin }) => {
  const { t } = useLanguage();
  const instagramUrl = 'https://www.instagram.com/bachir_bk_beauty03/';

  return (
    <footer className="w-full bg-[#FFFFFF] border-t border-[#E8C9CD]/60 text-start">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-[#E8C9CD]/40">
          {/* Brand Info & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-[#C5A46D] flex flex-col items-center justify-center bg-[#FAF7F2]">
                <span className="font-serif-luxury font-bold text-xs text-[#642C40]">BK</span>
              </div>
              <span className="font-serif-luxury text-2xl font-bold tracking-tight text-[#292526]">
                BK BEAUTY
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#292526]/75 max-w-sm leading-relaxed">
              {t.footer.desc}
            </p>

            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#642C40] block mb-1">
                Laghouat, Algérie
              </span>
              <p className="text-xs text-[#292526]/60">
                Paiement en espèces à la livraison (Cash on Delivery)
              </p>
            </div>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-[#C5A46D] font-bold">
              {t.footer.customerCare}
            </p>
            <ul className="space-y-2 text-xs text-[#292526]/80">
              <li>
                <button
                  onClick={() => onOpenPolicy('shipping')}
                  className="hover:text-[#642C40] transition-colors cursor-pointer"
                >
                  {t.footer.shippingCodPolicy}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('returns')}
                  className="hover:text-[#642C40] transition-colors cursor-pointer"
                >
                  {t.footer.returnsPolicy}
                </button>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-[#642C40] transition-colors cursor-pointer"
                >
                  {t.footer.contactUs}
                </a>
              </li>
            </ul>
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-[#C5A46D] font-bold">
              {t.footer.categoriesTitle}
            </p>
            <ul className="space-y-2 text-xs text-[#292526]/80">
              <li>
                <button
                  onClick={() => onSelectCategory('cat_maquillage')}
                  className="hover:text-[#642C40] transition-colors cursor-pointer"
                >
                  Maquillage / المكياج
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('cat_soins_visage')}
                  className="hover:text-[#642C40] transition-colors cursor-pointer"
                >
                  Soins du visage / العناية بالوجه
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('cat_soins_corps')}
                  className="hover:text-[#642C40] transition-colors cursor-pointer"
                >
                  Soins du corps / العناية بالجسم
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('cat_parfums')}
                  className="hover:text-[#642C40] transition-colors cursor-pointer"
                >
                  Parfums / العطور
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('cat_accessoires')}
                  className="hover:text-[#642C40] transition-colors cursor-pointer"
                >
                  Accessoires / إكسسوارات
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Information & Instagram */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-[#C5A46D] font-bold">
              {t.footer.legalTitle}
            </p>
            <ul className="space-y-2 text-xs text-[#292526]/80">
              <li>
                <button
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:text-[#642C40] transition-colors cursor-pointer"
                >
                  {t.footer.privacyPolicy}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-[#642C40] transition-colors cursor-pointer"
                >
                  {t.footer.termsOfService}
                </button>
              </li>
            </ul>

            <div className="pt-3">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#642C40] hover:text-[#C5A46D] font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                <span>@bachir_bk_beauty03</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Trust & Copyright Row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#292526]/70">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#C5A46D]">local_shipping</span>
              Paiement à la livraison 58 Wilayas
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#C5A46D]">verified</span>
              100% Produits Authentiques
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span>{t.footer.copyright}</span>
            {onGoToAdmin && (
              <button
                onClick={onGoToAdmin}
                className="inline-flex items-center gap-1 text-[11px] text-[#292526]/40 hover:text-[#642C40] transition-colors cursor-pointer"
                title="Espace Privé Administrateur"
              >
                <span className="material-symbols-outlined text-xs">lock</span>
                <span>Espace Gérance</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
