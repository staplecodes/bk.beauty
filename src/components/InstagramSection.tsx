import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types';

export const InstagramSection: React.FC = () => {
  const { t } = useLanguage();
  const instagramUrl = 'https://www.instagram.com/bachir_bk_beauty03/';

  const [galleryItems, setGalleryItems] = useState<Array<{ img: string; handle: string; commentFr: string; commentAr: string }>>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/public/products');
        const data = await res.json();
        const products: Product[] = data.products || [];

        const selected = [
          products.find((p) => p.id === 'prod_medicube_serum'),
          products.find((p) => p.id === 'prod_brand_kayali'),
          products.find((p) => p.id === 'prod_loreal_infallible_foundation'),
          products.find((p) => p.id === 'prod_contouring_brush'),
        ].filter(Boolean) as Product[];

        if (selected.length > 0) {
          setGalleryItems(
            selected.map((p, idx) => ({
              img: p.image,
              handle: idx === 0 ? '@medicube.dz' : idx === 1 ? '@kayali.dz' : idx === 2 ? '@loreal.dz' : '@brush.dz',
              commentFr: p.nameFr,
              commentAr: p.nameAr || p.nameFr,
            }))
          );
        }
      } catch (e) {
        console.error('Failed to load gallery products', e);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] border-t border-[#E8C9CD]/40">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8 text-start">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#C5A46D] font-bold">
              {t.instagram.pretitle}
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#292526] font-semibold mt-1">
              {t.instagram.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#292526]/70 mt-1">
              {t.instagram.subtitle}
            </p>
          </div>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#642C40] hover:text-[#C5A46D] text-xs uppercase tracking-wider font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-lg">photo_camera</span>
            <span>{t.instagram.linkText}</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        </div>

        {/* 4 UGC Visual Frames */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryItems.map((item, idx) => (
            <a
              key={idx}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-xl overflow-hidden bg-[#FFFFFF] border border-[#E8C9CD] shadow-2xs block"
            >
              <img
                src={item.img}
                alt="Instagram BK BEAUTY"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
