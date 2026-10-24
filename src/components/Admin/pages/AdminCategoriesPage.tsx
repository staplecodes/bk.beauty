import React, { useState } from 'react';
import { Category, Product } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';

interface AdminCategoriesPageProps {
  categories: Category[];
  products: Product[];
  onRefresh: () => void;
  onNotify: (msg: string) => void;
}

export const AdminCategoriesPage: React.FC<AdminCategoriesPageProps> = ({
  categories,
  products,
  onRefresh,
  onNotify,
}) => {
  const { language } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [form, setForm] = useState({
    nameFr: '',
    nameAr: '',
    slug: '',
    descriptionFr: '',
    descriptionAr: '',
    icon: 'spa',
  });

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setForm({
      nameFr: '',
      nameAr: '',
      slug: '',
      descriptionFr: '',
      descriptionAr: '',
      icon: 'spa',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      nameFr: cat.nameFr,
      nameAr: cat.nameAr,
      slug: cat.slug,
      descriptionFr: cat.descriptionFr || '',
      descriptionAr: cat.descriptionAr || '',
      icon: cat.icon || 'spa',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setIsModalOpen(false);
        onNotify(
          editingCategory
            ? 'Catégorie modifiée avec succès !'
            : 'Nouvelle catégorie créée et synchronisée !'
        );
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (cat: Category) => {
    const prodsInCat = products.filter((p) => p.category === cat.id);
    if (prodsInCat.length > 0) {
      alert(
        language === 'ar'
          ? `لا يمكن حذف هذه الفئة لأنها تحتوي على ${prodsInCat.length} منتج نشط في المتجر.`
          : `Impossible de supprimer cette catégorie car elle contient actuellement ${prodsInCat.length} produit(s).`
      );
      return;
    }

    const confirmDel = window.confirm(
      language === 'ar'
        ? `هل أنت متأكد من حذف الفئة "${cat.nameAr}"؟`
        : `Êtes-vous sûr de vouloir supprimer la catégorie "${cat.nameFr}" ?`
    );
    if (!confirmDel) return;

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onNotify('Catégorie supprimée.');
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8C9CD] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#292526]">
            {language === 'ar' ? 'إدارة أقسام وفئات المتجر' : 'Gestion des Catégories de Cosmétiques'}
          </h1>
          <p className="text-xs text-[#292526]/65 mt-0.5">
            {language === 'ar'
              ? 'تنظيم الأقسام الرئيسية (المكياج، العناية بالوجه، العناية بالجسم، العطور، العناية بالشعر، الإكسسوارات)'
              : 'Organisation des rayons beauté et synchronisation avec les filtres vitrine'}
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-[#642C40] hover:bg-[#292526] text-[#FAF7F2] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          <span>{language === 'ar' ? '+ إضافة قسم جديد' : '+ Nouvelle Catégorie'}</span>
        </button>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const count = products.filter((p) => p.category === cat.id).length;

          return (
            <div
              key={cat.id}
              className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8C9CD] shadow-2xs flex flex-col justify-between hover:border-[#C5A46D] transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#642C40] border border-[#E8C9CD]/60">
                    <span className="material-symbols-outlined text-xl">
                      {cat.icon || 'category'}
                    </span>
                  </div>

                  <span className="font-tabular text-[11px] bg-[#FAF7F2] border border-[#E8C9CD] px-2 py-0.5 rounded-full font-bold text-[#642C40]">
                    {count} produit(s)
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-serif-luxury text-lg font-bold text-[#292526]">
                    {cat.nameFr}
                  </h3>
                  <p className="text-xs font-semibold text-[#C5A46D] mt-0.5">{cat.nameAr}</p>
                  <p className="font-tabular text-[10px] text-[#292526]/50 mt-1">
                    Slug : <span className="font-mono">{cat.slug}</span>
                  </p>
                </div>

                {cat.descriptionFr && (
                  <p className="text-xs text-[#292526]/70 mt-2.5 line-clamp-2">
                    {language === 'ar' && cat.descriptionAr ? cat.descriptionAr : cat.descriptionFr}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#FAF7F2] flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEditModal(cat)}
                  className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#E8C9CD] text-[#292526] rounded-lg border border-[#E8C9CD] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  <span>{language === 'ar' ? 'تعديل' : 'Modifier'}</span>
                </button>

                <button
                  onClick={() => handleDelete(cat)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  <span>{language === 'ar' ? 'حذف' : 'Supprimer'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#292526]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E8C9CD] w-full max-w-lg p-6 sm:p-8 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8C9CD]/60">
              <h3 className="font-serif-luxury text-xl font-bold text-[#292526]">
                {editingCategory ? 'Modifier la Catégorie' : 'Créer une Catégorie'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center cursor-pointer hover:bg-[#E8C9CD]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#292526] mb-1">
                  Nom en Français * (ex: Soins capillaires)
                </label>
                <input
                  type="text"
                  required
                  value={form.nameFr}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      nameFr: e.target.value,
                      slug:
                        editingCategory
                          ? form.slug
                          : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    });
                  }}
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-[#292526] mb-1">
                  الاسم باللغة العربية * (مثال: العناية بالشعر)
                </label>
                <input
                  type="text"
                  required
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#292526] mb-1">Identifiant Slug</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#292526] mb-1">
                    Icône (Material Symbol)
                  </label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="spa, palette, perfume, etc."
                    className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#292526] mb-1">
                  Description (Français)
                </label>
                <textarea
                  rows={2}
                  value={form.descriptionFr}
                  onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-[#292526] mb-1">
                  الوصف التوضيحي (العربية)
                </label>
                <textarea
                  rows={2}
                  value={form.descriptionAr}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8C9CD]/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#FAF7F2] rounded-lg font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#642C40] text-[#FAF7F2] hover:bg-[#292526] rounded-lg font-bold shadow-sm cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
