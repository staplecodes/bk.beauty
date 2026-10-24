import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const ConciergeSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="contact" className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-[#FFFFFF] border-t border-[#E8C9CD]/40">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#FAF7F2] rounded-2xl border border-[#E8C9CD] p-6 sm:p-10 shadow-sm text-start">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Phone Hotline */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#642C40]">
                <span className="material-symbols-outlined text-xl">call</span>
                <span className="text-xs uppercase tracking-widest font-bold">
                  {t.conciergeSection.phoneLabel}
                </span>
              </div>
              <p className="font-tabular text-xl sm:text-2xl font-bold text-[#292526]">
                {t.conciergeSection.phoneValue}
              </p>
              <p className="text-xs text-[#292526]/70">
                {t.conciergeSection.hours}
              </p>
            </div>

            {/* WhatsApp Concierge */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#642C40]">
                <span className="material-symbols-outlined text-xl">chat</span>
                <span className="text-xs uppercase tracking-widest font-bold">
                  {t.conciergeSection.whatsappLabel}
                </span>
              </div>
              <p className="text-sm font-semibold text-[#292526]">
                {t.conciergeSection.whatsappText}
              </p>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#642C40] hover:text-[#C5A46D] font-bold uppercase tracking-wider transition-colors pt-1"
              >
                <span>{t.conciergeSection.whatsappBtn}</span>
                <span className="material-symbols-outlined text-sm">arrow_outward</span>
              </a>
            </div>

            {/* Physical Store in Laghouat */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#642C40]">
                <span className="material-symbols-outlined text-xl">store</span>
                <span className="text-xs uppercase tracking-widest font-bold">
                  {t.conciergeSection.locationLabel}
                </span>
              </div>
              <p className="text-base font-bold text-[#292526]">
                {t.conciergeSection.locationValue}
              </p>
              <p className="text-xs text-[#292526]/70">
                {t.conciergeSection.locationDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
