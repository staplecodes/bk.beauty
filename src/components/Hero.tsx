import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  onShopClick: () => void;
  onCodClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick, onCodClick }) => {
  const { t } = useLanguage();

  return (
    <section className="relative w-full pt-28 pb-16 overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#FAF7F2] to-[#FAF7F2]/60">
      {/* Subtle Ambient Decorative Circles */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#E8C9CD]/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-[#C5A46D]/15 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Typography & Editorial Story */}
          <div className="lg:col-span-7 flex flex-col space-y-6 text-start">
            {/* Subtle Brand Tag */}
            <div className="inline-flex items-center gap-2 self-start bg-[#FFFFFF] border border-[#E8C9CD] px-3.5 py-1 rounded-full shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#C5A46D]" />
              <span className="text-xs uppercase tracking-widest text-[#642C40] font-bold">
                {t.hero.badge}
              </span>
            </div>

            {/* Display Headline */}
            <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-normal text-[#292526] leading-[1.15] tracking-tight">
              {t.hero.titleLine1} <br />
              <span className="italic font-serif-luxury text-[#642C40]">
                {t.hero.titleLine2}
              </span>
            </h1>

            {/* Prose description */}
            <p className="text-base sm:text-lg text-[#292526]/75 max-w-xl leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onShopClick}
                className="inline-flex items-center justify-center bg-[#642C40] text-[#FAF7F2] hover:bg-[#292526] px-6 py-3.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition-all shadow-md group cursor-pointer"
              >
                <span>{t.hero.shopBestsellers}</span>
                <span className="material-symbols-outlined text-[18px] ml-2 rtl:mr-2 rtl:ml-0 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>

              <button
                onClick={onCodClick}
                className="inline-flex items-center justify-center bg-[#FFFFFF] text-[#642C40] border border-[#C5A46D] hover:bg-[#FAF7F2] px-6 py-3.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition-all shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] mr-2 rtl:ml-2 rtl:mr-0 text-[#C5A46D]">
                  payments
                </span>
                <span>{t.hero.exploreCod}</span>
              </button>
            </div>

            {/* Brand Proof / Quality Note */}
            <div className="pt-2 flex items-center gap-3 text-xs text-[#292526]/70">
              <div className="flex text-[#C5A46D]">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="font-medium">{t.hero.satisfactionScore}</span>
            </div>
          </div>

          {/* Hero Visual Showcase */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative mx-auto max-w-md aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-[#FFFFFF] p-2 border border-[#E8C9CD]/50">
              <div className="w-full h-full rounded-xl overflow-hidden relative">
                <img
                  src="/src/assets/images/hero_bk_beauty_cosmetics_1792358663044.jpg"
                  alt="BK BEAUTY Cosmétiques d'exception"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#292526]/80 via-transparent to-transparent flex flex-col justify-end p-6 text-[#FAF7F2]">
                  <span className="text-[10px] uppercase tracking-widest text-[#C5A46D] font-bold">
                    BK BEAUTY ATELIER
                  </span>
                  <p className="font-serif-luxury text-xl sm:text-2xl font-semibold">
                    The Botanical Glow Collection
                  </p>
                  <p className="text-xs text-[#FAF7F2]/80 mt-1">
                    Huile précieuse de rose & pigments minéraux purs · Laghouat, Algérie
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Quality Seal */}
            <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-[#FFFFFF] p-3 sm:p-4 rounded-xl shadow-xl border border-[#E8C9CD]/60 flex items-center gap-3 max-w-xs">
              <div className="w-10 h-10 rounded-full bg-[#E8C9CD]/40 flex items-center justify-center text-[#642C40] shrink-0">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#292526] uppercase tracking-wider">
                  BK BEAUTY Laghouat
                </p>
                <p className="text-[11px] text-[#292526]/70">
                  Paiement à la livraison dans les 58 wilayas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Pillar Trust Highlights Banner */}
        <div className="mt-16 pt-8 border-t border-[#E8C9CD]/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#FFFFFF]/90 backdrop-blur-xs p-6 rounded-xl border border-[#E8C9CD]/50 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C5A46D]/40 flex items-center justify-center text-[#642C40] shrink-0">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#292526]">
                  {t.trust.authenticTitle}
                </h4>
                <p className="text-xs text-[#292526]/70 mt-0.5">
                  {t.trust.authenticDesc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C5A46D]/40 flex items-center justify-center text-[#642C40] shrink-0">
                <span className="material-symbols-outlined text-[24px]">payments</span>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#292526]">
                  {t.trust.codTitle}
                </h4>
                <p className="text-xs text-[#292526]/70 mt-0.5">
                  {t.trust.codDesc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C5A46D]/40 flex items-center justify-center text-[#642C40] shrink-0">
                <span className="material-symbols-outlined text-[24px]">local_shipping</span>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#292526]">
                  {t.trust.wilayasTitle}
                </h4>
                <p className="text-xs text-[#292526]/70 mt-0.5">
                  {t.trust.wilayasDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
