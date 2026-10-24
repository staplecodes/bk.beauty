import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const CodExplainer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="cod" className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] border-y border-[#E8C9CD]/40">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs uppercase tracking-widest text-[#C5A46D] font-bold">
            {t.codJourney.pretitle}
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#292526] font-semibold">
            {t.codJourney.title}
          </h2>
          <p className="text-sm text-[#292526]/75 max-w-xl mx-auto leading-relaxed">
            {t.codJourney.subtitle}
          </p>
        </div>

        {/* 3-Step Journey Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E8C9CD]/60 shadow-2xs hover:shadow-md transition-shadow relative text-start">
            <div className="w-12 h-12 rounded-xl bg-[#E8C9CD]/40 flex items-center justify-center text-[#642C40] mb-5">
              <span className="font-tabular font-bold text-lg">01</span>
            </div>
            <h3 className="font-serif-luxury text-lg font-bold text-[#292526] mb-2">
              {t.codJourney.step1Title}
            </h3>
            <p className="text-xs text-[#292526]/75 leading-relaxed">
              {t.codJourney.step1Desc}
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-[#C5A46D] text-[11px] font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>{t.codJourney.step1Tag}</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E8C9CD]/60 shadow-2xs hover:shadow-md transition-shadow relative text-start">
            <div className="w-12 h-12 rounded-xl bg-[#E8C9CD]/40 flex items-center justify-center text-[#642C40] mb-5">
              <span className="font-tabular font-bold text-lg">02</span>
            </div>
            <h3 className="font-serif-luxury text-lg font-bold text-[#292526] mb-2">
              {t.codJourney.step2Title}
            </h3>
            <p className="text-xs text-[#292526]/75 leading-relaxed">
              {t.codJourney.step2Desc}
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-[#C5A46D] text-[11px] font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
              <span>{t.codJourney.step2Tag}</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E8C9CD]/60 shadow-2xs hover:shadow-md transition-shadow relative text-start">
            <div className="w-12 h-12 rounded-xl bg-[#E8C9CD]/40 flex items-center justify-center text-[#642C40] mb-5">
              <span className="font-tabular font-bold text-lg">03</span>
            </div>
            <h3 className="font-serif-luxury text-lg font-bold text-[#292526] mb-2">
              {t.codJourney.step3Title}
            </h3>
            <p className="text-xs text-[#292526]/75 leading-relaxed">
              {t.codJourney.step3Desc}
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-[#C5A46D] text-[11px] font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>{t.codJourney.step3Tag}</span>
            </div>
          </div>
        </div>

        {/* Support Concierge Strip */}
        <div className="mt-8 bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E8C9CD] flex flex-col sm:flex-row items-center justify-between gap-4 text-start">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C5A46D]/40 flex items-center justify-center text-[#642C40] shrink-0">
              <span className="material-symbols-outlined text-[22px]">support_agent</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#292526] font-bold">
                {t.codJourney.conciergeTitle}
              </p>
              <p className="text-xs text-[#292526]/70 mt-0.5">
                {t.codJourney.conciergeDesc}
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap px-4 py-2 bg-[#FAF7F2] text-[#642C40] border border-[#C5A46D] hover:bg-[#642C40] hover:text-[#FAF7F2] rounded-lg text-xs uppercase tracking-wider font-semibold transition-colors shadow-2xs"
          >
            {t.codJourney.contactConcierge}
          </a>
        </div>
      </div>
    </section>
  );
};
