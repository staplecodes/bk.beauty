import React, { useState, useEffect } from 'react';
import { StoreSettings, WilayaDeliveryRule } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';

interface AdminSettingsPageProps {
  settings: StoreSettings | null;
  wilayas: WilayaDeliveryRule[];
  onRefresh: () => void;
  onNotify: (msg: string) => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({
  settings,
  wilayas,
  onRefresh,
  onNotify,
}) => {
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'store' | 'wilayas' | 'announcement'>('store');

  // Store settings form
  const [storeForm, setStoreForm] = useState<StoreSettings | null>(settings);
  const [isSavingStore, setIsSavingStore] = useState(false);
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [storeSaveError, setStoreSaveError] = useState('');

  useEffect(() => {
    setStoreForm(settings);
    setIsLoadingStore(false);
  }, [settings]);

  // Wilaya editing state
  const [wilayaSearch, setWilayaSearch] = useState('');
  const [editingWilaya, setEditingWilaya] = useState<WilayaDeliveryRule | null>(null);
  const [isSavingWilaya, setIsSavingWilaya] = useState(false);
  const [wilayaSaveError, setWilayaSaveError] = useState('');

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeForm) return;

    setIsSavingStore(true);
    setStoreSaveError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeForm),
      });

      if (res.ok) {
        onNotify('Paramètres du magasin enregistrés avec succès !');
        setStoreSaveError('');
        onRefresh();
      } else {
        setStoreSaveError('Erreur lors de la sauvegarde des paramètres. Veuillez réessayer.');
      }
    } catch (e) {
      console.error(e);
      setStoreSaveError('Erreur lors de la sauvegarde des paramètres. Vérifiez votre connexion et réessayez.');
    } finally {
      setIsSavingStore(false);
    }
  };

  const handleUpdateWilaya = async (rule: WilayaDeliveryRule) => {
    setIsSavingWilaya(true);
    setWilayaSaveError('');
    try {
      const res = await fetch(`/api/admin/wilayas/${rule.code}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Le serveur a refusé la mise à jour du tarif.');
      }
      if (
        !data.success ||
        data.wilaya?.code !== rule.code ||
        data.wilaya?.deliveryFee !== rule.deliveryFee
      ) {
        throw new Error('Le serveur n’a pas confirmé l’enregistrement du nouveau tarif.');
      }

      await onRefresh();
      setEditingWilaya(null);
      onNotify(`Tarif de livraison de ${rule.nameFr} enregistré : ${data.wilaya.deliveryFee} DA.`);
    } catch (error) {
      console.error('Wilaya delivery fee save failed', error);
      setWilayaSaveError(
        error instanceof Error
          ? `Échec de l’enregistrement : ${error.message}`
          : 'Échec de l’enregistrement du tarif. Vérifiez votre connexion et réessayez.'
      );
    } finally {
      setIsSavingWilaya(false);
    }
  };

  const filteredWilayas = wilayas.filter((w) => {
    if (!wilayaSearch.trim()) return true;
    const q = wilayaSearch.toLowerCase();
    return (
      w.code.includes(q) ||
      w.nameFr.toLowerCase().includes(q) ||
      w.nameAr.includes(q)
    );
  });

  if (isLoadingStore) {
    return (
      <div className="p-8 text-center text-[#292526]/50">
        Chargement des paramètres de la boutique...
      </div>
    );
  }

  if (!storeForm) {
    return (
      <div className="p-8 text-center text-[#292526]/60">
        <p className="text-[#292526] font-medium">Les paramètres de la boutique sont indisponibles. Veuillez réessayer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8C9CD] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#292526]">
            {language === 'ar' ? 'إعدادات المتجر والتوصيل' : 'Configuration Magasin & Tarifs de Livraison'}
          </h1>
          <p className="text-xs text-[#292526]/65 mt-0.5">
            {language === 'ar'
              ? 'إدارة معلومات BK BEAUTY بالأغواط، تغطية 58 ولاية، ورابط إنستغرام والشريط العلوي'
              : 'Paramètres généraux, boutique physique à Laghouat, tarifs 58 Wilayas et Instagram'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E8C9CD] p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'store'
                ? 'bg-[#1e1b19] text-[#FAF7F2]'
                : 'text-[#292526] hover:bg-[#E8C9CD]/50'
            }`}
          >
            {language === 'ar' ? 'معلومات المتجر' : 'Boutique & Contact'}
          </button>
          <button
            onClick={() => setActiveTab('wilayas')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'wilayas'
                ? 'bg-[#1e1b19] text-[#FAF7F2]'
                : 'text-[#292526] hover:bg-[#E8C9CD]/50'
            }`}
          >
            {language === 'ar' ? '58 ولاية (التوصيل)' : 'Livraison 58 Wilayas'}
          </button>
          <button
            onClick={() => setActiveTab('announcement')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'announcement'
                ? 'bg-[#1e1b19] text-[#FAF7F2]'
                : 'text-[#292526] hover:bg-[#E8C9CD]/50'
            }`}
          >
            {language === 'ar' ? 'شريط الإعلانات' : 'Bandeau & Alertes'}
          </button>
        </div>
      </div>

      {/* Tab 1: General Store Settings */}
      {activeTab === 'store' && (
        <form onSubmit={handleSaveStore} className="space-y-6">
{storeSaveError && (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
              {storeSaveError}
            </p>
          )}

          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8C9CD] shadow-2xs space-y-4 text-xs">
            <h3 className="font-serif-luxury text-base font-bold text-[#642C40] pb-2 border-b border-[#E8C9CD]/60">
              Identité de Marque & Coordonnées à Laghouat
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#292526] mb-1">Nom de la marque</label>
                <input
                  type="text"
                  value={storeForm.storeName}
                  onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#292526] mb-1">
                  Lien officiel Instagram (Boutique)
                </label>
                <input
                  type="url"
                  value={storeForm.instagramUrl}
                  onChange={(e) => setStoreForm({ ...storeForm, instagramUrl: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2.5 font-mono"
                />
                <span className="text-[10px] text-[#292526]/50 mt-0.5 block">
                  Ex: https://www.instagram.com/bachir_bk_beauty03/
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#292526] mb-1">Slogan (Français)</label>
                <input
                  type="text"
                  value={storeForm.taglineFr || ''}
                  onChange={(e) => setStoreForm({ ...storeForm, taglineFr: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-[#292526] mb-1">الشعار (العربية)</label>
                <input
                  type="text"
                  value={storeForm.taglineAr || ''}
                  onChange={(e) => setStoreForm({ ...storeForm, taglineAr: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block font-bold text-[#292526] mb-1">
                  Téléphone / WhatsApp Concierge
                </label>
                <input
                  type="text"
                  value={storeForm.phoneHotline || storeForm.contactPhone || ''}
                  onChange={(e) =>
                    setStoreForm({
                      ...storeForm,
                      phoneHotline: e.target.value,
                      contactPhone: e.target.value,
                    })
                  }
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2.5 font-tabular"
                />
              </div>

              <div>
                <label className="block font-bold text-[#292526] mb-1">Email de service client</label>
                <input
                  type="email"
                  value={storeForm.emailContact || storeForm.contactEmail || ''}
                  onChange={(e) =>
                    setStoreForm({
                      ...storeForm,
                      emailContact: e.target.value,
                      contactEmail: e.target.value,
                    })
                  }
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-[#292526] mb-1">
                  Seuil d'alerte Stock Faible
                </label>
                <input
                  type="number"
                  value={storeForm.lowStockThreshold}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, lowStockThreshold: Number(e.target.value) })
                  }
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2.5 font-tabular"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-bold text-[#292526] mb-1">
                  Adresse de la boutique (Français)
                </label>
                <input
                  type="text"
                  value={storeForm.storeAddressFr || storeForm.locationCityFr || ''}
                  onChange={(e) =>
                    setStoreForm({
                      ...storeForm,
                      storeAddressFr: e.target.value,
                      locationCityFr: e.target.value,
                    })
                  }
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-[#292526] mb-1">
                  عنوان المحل (العربية)
                </label>
                <input
                  type="text"
                  value={storeForm.storeAddressAr || storeForm.locationCityAr || ''}
                  onChange={(e) =>
                    setStoreForm({
                      ...storeForm,
                      storeAddressAr: e.target.value,
                      locationCityAr: e.target.value,
                    })
                  }
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2.5"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSavingStore}
                className="px-6 py-2.5 bg-[#642C40] hover:bg-[#292526] text-[#FAF7F2] rounded-xl font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSavingStore ? 'Enregistrement...' : 'Enregistrer les Modifications'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: 58 Wilayas Delivery Fees & Coverage */}
      {activeTab === 'wilayas' && (
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8C9CD] shadow-2xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E8C9CD]/60">
            <div>
              <h3 className="font-serif-luxury text-base font-bold text-[#642C40]">
                Grille des Tarifs de Livraison — 58 Wilayas d'Algérie
              </h3>
              <p className="text-xs text-[#292526]/65 mt-0.5">
                Wilaya 03 (Laghouat) bénéficie d'un tarif local préférentiel. Modifiez les frais pour chaque wilaya.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#292526]/40 text-base">
                search
              </span>
              <input
                type="text"
                value={wilayaSearch}
                onChange={(e) => setWilayaSearch(e.target.value)}
                placeholder="Rechercher wilaya ou code..."
                className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#292526] focus:border-[#642C40] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-[#FAF7F2] shadow-2xs z-10">
                <tr className="text-[#292526]/70 uppercase font-tabular border-b border-[#E8C9CD]">
                  <th className="py-2.5 px-3 font-bold">Code</th>
                  <th className="py-2.5 px-3 font-bold">Wilaya (FR)</th>
                  <th className="py-2.5 px-3 font-bold">الولاية (AR)</th>
                  <th className="py-2.5 px-3 font-bold">Frais de Port (DA)</th>
                  <th className="py-2.5 px-3 font-bold">Délai estimé</th>
                  <th className="py-2.5 px-3 font-bold">Statut</th>
                  <th className="py-2.5 px-3 font-bold text-end">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8C9CD]/40">
                {filteredWilayas.map((w) => {
                  const isLaghouat = w.code === '03';

                  return (
                    <tr
                      key={w.code}
                      className={`hover:bg-[#FAF7F2]/60 transition-colors ${
                        isLaghouat ? 'bg-amber-50/40 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-tabular font-bold text-[#642C40]">
                        {w.code}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#292526]">
                        {w.nameFr}
                        {isLaghouat && (
                          <span className="ms-2 text-[10px] bg-[#C5A46D] text-[#292526] px-1.5 py-0.2 rounded font-bold">
                            BOUTIQUE
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#C5A46D]">{w.nameAr}</td>

                      <td className="py-2.5 px-3 font-tabular font-bold text-[#292526]">
                        {w.deliveryFee} DA
                      </td>

                      <td className="py-2.5 px-3 text-[#292526]/70">{w.estimatedDays}</td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`font-tabular text-[10px] font-bold px-2 py-0.5 rounded ${
                            w.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {w.active ? 'Couverte' : 'Suspendue'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-end">
                        <button
                          onClick={() => setEditingWilaya({ ...w })}
                          className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#E8C9CD] text-[#292526] rounded border border-[#E8C9CD] font-bold transition-colors cursor-pointer"
                        >
                          Modifier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Announcement Bar & Alerts */}
      {activeTab === 'announcement' && (
        <form onSubmit={handleSaveStore} className="space-y-6">
{storeSaveError && (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
              {storeSaveError}
            </p>
          )}

          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8C9CD] shadow-2xs space-y-4 text-xs">
            <h3 className="font-serif-luxury text-base font-bold text-[#642C40] pb-2 border-b border-[#E8C9CD]/60">
              Bandeau Supérieur & Messages d'Alerte Vitrine
            </h3>

            <div>
              <label className="block font-bold text-[#292526] mb-1">
                Texte du bandeau d'annonce (Français)
              </label>
              <input
                type="text"
                value={storeForm.announcementFr}
                onChange={(e) => setStoreForm({ ...storeForm, announcementFr: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-[#292526] mb-1">
                نص شريط الإعلانات العلوي (العربية)
              </label>
              <input
                type="text"
                value={storeForm.announcementAr}
                onChange={(e) => setStoreForm({ ...storeForm, announcementAr: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2.5"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSavingStore}
                className="px-6 py-2.5 bg-[#642C40] hover:bg-[#292526] text-[#FAF7F2] rounded-xl font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSavingStore ? 'Enregistrement...' : 'Mettre à jour le bandeau'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Wilaya Edit Modal */}
      {editingWilaya && (
        <div className="fixed inset-0 z-50 bg-[#292526]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E8C9CD] w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8C9CD]/60">
              <h3 className="font-serif-luxury text-lg font-bold text-[#292526]">
                Modifier Wilaya {editingWilaya.code} — {editingWilaya.nameFr} ({editingWilaya.nameAr})
              </h3>
              <button
                onClick={() => setEditingWilaya(null)}
                className="w-7 h-7 rounded-full bg-[#FAF7F2] flex items-center justify-center cursor-pointer hover:bg-[#E8C9CD]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#292526] mb-1">
                  Frais de livraison (DA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={editingWilaya.deliveryFee}
                  onChange={(e) =>
                    setEditingWilaya({ ...editingWilaya, deliveryFee: Number(e.target.value) })
                  }
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2 font-tabular font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#292526] mb-1">Délai estimé</label>
                <input
                  type="text"
                  value={editingWilaya.estimatedDays}
                  onChange={(e) =>
                    setEditingWilaya({ ...editingWilaya, estimatedDays: e.target.value })
                  }
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editingWilaya.active}
                  onChange={(e) =>
                    setEditingWilaya({ ...editingWilaya, active: e.target.checked })
                  }
                  className="rounded text-[#642C40] accent-[#642C40]"
                />
                <span className="font-bold text-[#292526]">
                  Activer la livraison pour cette wilaya
                </span>
              </label>

              {wilayaSaveError && (
                <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
                  {wilayaSaveError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8C9CD]/50">
                <button
                  type="button"
                  onClick={() => setEditingWilaya(null)}
                  className="px-4 py-2 bg-[#FAF7F2] rounded-lg font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateWilaya(editingWilaya)}
                  disabled={isSavingWilaya}
                  className="px-5 py-2 bg-[#642C40] text-[#FAF7F2] hover:bg-[#292526] rounded-lg font-bold shadow-sm cursor-pointer"
                >
                  {isSavingWilaya ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

