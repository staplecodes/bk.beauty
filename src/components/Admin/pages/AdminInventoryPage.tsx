import React, { useState } from 'react';
import { Product } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';

interface AdminInventoryPageProps {
  products: Product[];
  onRefresh: () => void;
  onNotify: (msg: string) => void;
}

export const AdminInventoryPage: React.FC<AdminInventoryPageProps> = ({
  products,
  onRefresh,
  onNotify,
}) => {
  const { language } = useLanguage();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Quick adjust stock
  const handleAdjustStock = async (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setUpdatingId(productId);
    try {
      const res = await fetch(`/api/admin/inventory/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stockQuantity: newQuantity }),
      });

      if (res.ok) {
        onNotify(`Stock mis à jour (${newQuantity} unités)`);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  // Adjust variant stock
  const handleAdjustVariantStock = async (
    productId: string,
    variantId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 0) return;
    try {
      const res = await fetch(`/api/admin/inventory/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stockQuantity: newQuantity, variantId }),
      });

      if (res.ok) {
        onNotify(`Stock de la variante mis à jour`);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Quick toggle in-stock
  const handleToggleActive = async (productId: string, currentInStock: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inStock: !currentInStock }),
      });

      if (res.ok) {
        onNotify(currentInStock ? 'Produit retiré de la vente' : 'Produit activé');
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const lowStockCount = products.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity <= 10
  ).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0 || !p.inStock).length;
  const totalUnits = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);

  const filtered = products.filter((p) => {
    if (filterType === 'low' && (p.stockQuantity <= 0 || p.stockQuantity > 10)) return false;
    if (filterType === 'out' && p.stockQuantity > 0 && p.inStock) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.nameFr.toLowerCase().includes(q) ||
        p.nameAr.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8C9CD] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#292526]">
            {language === 'ar' ? 'إدارة ومراقبة المخزون' : 'Gestion des Stocks & Alertes de Réassort'}
          </h1>
          <p className="text-xs text-[#292526]/65 mt-0.5">
            {language === 'ar'
              ? 'مراقبة كميات المستحضرات، التنبيه للمخزون المنخفض، والتحكم الفوري بالكميات'
              : 'Niveaux de stocks en temps réel, alertes seuil de rupture et contrôle direct'}
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#FAF7F2] hover:bg-[#E8C9CD]/40 border border-[#E8C9CD] rounded-xl text-xs font-bold text-[#292526] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">sync</span>
          <span>{language === 'ar' ? 'مزامنة' : 'Actualiser'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8C9CD] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-[#292526]/60 font-bold tracking-wider font-tabular">
              {language === 'ar' ? 'إجمالي القطع في المخزن' : 'Total Unités Disponibles'}
            </span>
            <p className="font-serif-luxury text-2xl font-bold text-[#292526] mt-1">
              {totalUnits} <span className="text-xs font-normal text-[#292526]/60">articles</span>
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#642C40]">
            <span className="material-symbols-outlined text-2xl">all_inbox</span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8C9CD] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-[#292526]/60 font-bold tracking-wider font-tabular">
              {language === 'ar' ? 'تنبيه مخزون منخفض (≤ 10)' : 'Alerte Stock Faible (≤ 10)'}
            </span>
            <p className="font-serif-luxury text-2xl font-bold text-amber-700 mt-1">
              {lowStockCount} <span className="text-xs font-normal text-[#292526]/60">SKUs</span>
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8C9CD] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-[#292526]/60 font-bold tracking-wider font-tabular">
              {language === 'ar' ? 'نفاد تام من المخزون' : 'Rupture Totale (0)'}
            </span>
            <p className="font-serif-luxury text-2xl font-bold text-rose-700 mt-1">
              {outOfStockCount} <span className="text-xs font-normal text-[#292526]/60">SKUs</span>
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">block</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E8C9CD] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#1e1b19] text-[#FAF7F2]'
                : 'bg-[#FAF7F2] text-[#292526] hover:bg-[#E8C9CD]/50'
            }`}
          >
            {language === 'ar' ? `كل المنتجات (${products.length})` : `Tous (${products.length})`}
          </button>
          <button
            onClick={() => setFilterType('low')}
            className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterType === 'low'
                ? 'bg-[#1e1b19] text-[#FAF7F2]'
                : 'bg-[#FAF7F2] text-[#292526] hover:bg-[#E8C9CD]/50'
            }`}
          >
            <span>{language === 'ar' ? 'مخزون قليل' : 'Stock faible'}</span>
            <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full text-[10px]">
              {lowStockCount}
            </span>
          </button>
          <button
            onClick={() => setFilterType('out')}
            className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterType === 'out'
                ? 'bg-[#1e1b19] text-[#FAF7F2]'
                : 'bg-[#FAF7F2] text-[#292526] hover:bg-[#E8C9CD]/50'
            }`}
          >
            <span>{language === 'ar' ? 'نفد' : 'Rupture'}</span>
            <span className="bg-rose-100 text-rose-900 px-1.5 py-0.2 rounded-full text-[10px]">
              {outOfStockCount}
            </span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#292526]/40 text-base">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالمرجع أو الاسم...' : 'Recherche SKU ou nom...'}
            className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#292526] focus:border-[#642C40] focus:outline-none"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8C9CD] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-[#292526]/70 uppercase font-tabular border-b border-[#E8C9CD]">
                <th className="py-3 px-4 font-bold">Produit</th>
                <th className="py-3 px-4 font-bold">SKU Réf.</th>
                <th className="py-3 px-4 font-bold">État du Stock</th>
                <th className="py-3 px-4 font-bold">Quantité en Rayon</th>
                <th className="py-3 px-4 font-bold">Ajustement Rapide</th>
                <th className="py-3 px-4 font-bold text-end">Statut Vente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8C9CD]/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#292526]/50">
                    {language === 'ar'
                      ? 'لا توجد عناصر مطابقة.'
                      : 'Aucun produit ne correspond à ces critères.'}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isOut = p.stockQuantity <= 0 || !p.inStock;
                  const isLow = p.stockQuantity > 0 && p.stockQuantity <= 10;

                  return (
                    <React.Fragment key={p.id}>
                      <tr className="hover:bg-[#FAF7F2]/50 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.nameFr}
                            className="w-10 h-10 rounded-lg object-cover bg-[#FFFFFF] border border-[#E8C9CD] shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-[#292526]">{p.nameFr}</p>
                            <p className="text-[11px] text-[#C5A46D]">{p.nameAr}</p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-tabular font-bold text-[#642C40]">
                          {p.sku}
                        </td>

                        <td className="py-3.5 px-4">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 font-tabular text-[10px] bg-rose-100 text-rose-900 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                              <span>{language === 'ar' ? 'نفاد من المخزن' : 'Rupture'}</span>
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 font-tabular text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-bold animate-pulse">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                              <span>{language === 'ar' ? 'مخزون منخفض' : 'Stock critique'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-tabular text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              <span>{language === 'ar' ? 'متاح ومستقر' : 'Optimal'}</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-tabular">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold ${
                                isOut ? 'text-rose-700' : isLow ? 'text-amber-700' : 'text-[#292526]'
                              }`}
                            >
                              {p.stockQuantity}
                            </span>
                            <span className="text-[11px] text-[#292526]/50">unités</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              disabled={updatingId === p.id || p.stockQuantity <= 0}
                              onClick={() => handleAdjustStock(p.id, p.stockQuantity - 1)}
                              className="w-7 h-7 bg-[#FAF7F2] hover:bg-[#E8C9CD] border border-[#E8C9CD] rounded-lg font-bold flex items-center justify-center cursor-pointer disabled:opacity-40"
                              title="-1 unité"
                            >
                              -
                            </button>

                            <input
                              type="number"
                              value={p.stockQuantity}
                              onChange={(e) => handleAdjustStock(p.id, Number(e.target.value))}
                              className="w-16 text-center font-tabular font-bold bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg py-1 text-xs focus:border-[#642C40] focus:bg-[#FFFFFF] focus:outline-none"
                            />

                            <button
                              disabled={updatingId === p.id}
                              onClick={() => handleAdjustStock(p.id, p.stockQuantity + 1)}
                              className="w-7 h-7 bg-[#FAF7F2] hover:bg-[#E8C9CD] border border-[#E8C9CD] rounded-lg font-bold flex items-center justify-center cursor-pointer"
                              title="+1 unité"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-end">
                          <button
                            onClick={() => handleToggleActive(p.id, p.inStock)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                              p.inStock
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {p.inStock ? 'Actif' : 'Bloqué'}
                          </button>
                        </td>
                      </tr>

                      {/* Variant Sub-rows if present */}
                      {p.variants && p.variants.length > 0 && (
                        <tr className="bg-[#FAF7F2]/40">
                          <td colSpan={6} className="py-2 px-6">
                            <div className="space-y-1.5 pl-6 border-l-2 border-[#C5A46D]">
                              <span className="text-[10px] uppercase font-bold text-[#642C40]">
                                Déclinaisons / Teintes :
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {p.variants.map((v) => (
                                  <div
                                    key={v.id}
                                    className="bg-[#FFFFFF] p-2 rounded-lg border border-[#E8C9CD]/60 flex items-center justify-between text-xs"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      {v.colorHex && (
                                        <span
                                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                                          style={{ backgroundColor: v.colorHex }}
                                        />
                                      )}
                                      <span className="font-semibold">{v.nameFr}</span>
                                    </div>
                                    <div className="flex items-center gap-1 font-tabular">
                                      <input
                                        type="number"
                                        value={v.stockQuantity}
                                        onChange={(e) =>
                                          handleAdjustVariantStock(
                                            p.id,
                                            v.id,
                                            Number(e.target.value)
                                          )
                                        }
                                        className="w-12 text-center border border-[#E8C9CD] rounded p-0.5 text-[11px]"
                                      />
                                      <span className="text-[10px] text-[#292526]/50">u.</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
