import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const AtelierStory: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Visual Side */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl bg-[#FAF7F2] border border-[#E8C9CD]">
              <img
                src="/src/assets/images/product_contouring_brush_1792358665018.jpg"
                alt="BK BEAUTY Atelier d'Artisan"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlaid note */}
            <div className="absolute -bottom-5 -right-3 sm:-right-5 bg-[#FAF7F2] p-4 rounded-xl shadow-xl border border-[#E8C9CD] max-w-xs text-start">
              <p className="font-serif-luxury text-sm font-bold text-[#642C40]">
                {t.atelier.craft2Title}
              </p>
              <p className="text-[11px] text-[#292526]/75 mt-1 leading-relaxed">
                {t.atelier.craft2Desc}
              </p>
            </div>
          </div>

          {/* Typography Side */}
          <div className="lg:col-span-7 space-y-6 text-start lg:pl-6 rtl:lg:pl-0 rtl:lg:pr-6">
            <span className="text-xs uppercase tracking-widest text-[#C5A46D] font-bold">
              {t.atelier.pretitle}
            </span>

            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl text-[#292526] leading-tight font-normal">
              {t.atelier.titleLine1} <br />
              <span className="italic font-serif-luxury text-[#642C40]">
                {t.atelier.titleLine2}
              </span>
            </h2>

            <p className="text-sm sm:text-base text-[#292526]/80 leading-relaxed">
              {t.atelier.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8C9CD]/40">
                <h4 className="text-xs uppercase tracking-wider text-[#292526] font-bold">
                  {t.atelier.craft1Title}
                </h4>
                <p className="text-xs text-[#292526]/70 mt-1">
                  {t.atelier.craft1Desc}
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8C9CD]/40">
                <h4 className="text-xs uppercase tracking-wider text-[#292526] font-bold">
                  {t.atelier.craft2Title}
                </h4>
                <p className="text-xs text-[#292526]/70 mt-1">
                  {t.atelier.craft2Desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
