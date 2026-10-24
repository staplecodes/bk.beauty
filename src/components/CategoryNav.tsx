import React from 'react';
import { Category } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CategoryNavProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { language, t } = useLanguage();

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all shrink-0 cursor-pointer ${
          selectedCategory === 'all'
            ? 'bg-[#642C40] text-[#FAF7F2] shadow-sm'
            : 'bg-[#FFFFFF] text-[#292526]/80 hover:bg-[#E8C9CD]/40 border border-[#E8C9CD]'
        }`}
      >
        {t.catalog.allCategories}
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const name = language === 'ar' ? cat.nameAr : cat.nameFr;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              isSelected
                ? 'bg-[#642C40] text-[#FAF7F2] shadow-sm'
                : 'bg-[#FFFFFF] text-[#292526]/80 hover:bg-[#E8C9CD]/40 border border-[#E8C9CD]'
            }`}
          >
            {cat.icon && (
              <span className="material-symbols-outlined text-[16px] opacity-80">
                {cat.icon}
              </span>
            )}
            <span>{name}</span>
            {cat.productCount !== undefined && cat.productCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-[#FFFFFF]/20 text-[#FAF7F2]' : 'bg-[#FAF7F2] text-[#292526]/60'
              }`}>
                {cat.productCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
