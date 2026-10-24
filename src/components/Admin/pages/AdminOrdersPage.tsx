import React, { useState } from 'react';
import { Order, OrderStatus } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';

interface AdminOrdersPageProps {
  orders: Order[];
  onRefresh: () => void;
  onNotify: (msg: string) => void;
}

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({
  orders,
  onRefresh,
  onNotify,
}) => {
  const { language, t } = useLanguage();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminNoteText, setAdminNoteText] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Status list with French and Arabic labels & luxury styling
  const statusOptions: { value: OrderStatus; labelFr: string; labelAr: string; color: string }[] = [
    { value: 'Nouvelle', labelFr: 'Nouvelle (À valider)', labelAr: 'جديدة (تتطلب تأكيد)', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    { value: 'Confirmée', labelFr: 'Confirmée', labelAr: 'مؤكدة هاتفياً', color: 'bg-blue-100 text-blue-900 border-blue-300' },
    { value: 'En préparation', labelFr: 'En préparation', labelAr: 'قيد التجهيز', color: 'bg-purple-100 text-purple-900 border-purple-300' },
    { value: 'En cours de livraison', labelFr: 'En livraison', labelAr: 'قيد التوصيل مع الموزع', color: 'bg-orange-100 text-orange-900 border-orange-300' },
    { value: 'Livrée', labelFr: 'Livrée & Encaissée', labelAr: 'تم التسليم وقبض المبلغ', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    { value: 'Annulée', labelFr: 'Annulée', labelAr: 'ملغاة', color: 'bg-rose-100 text-rose-900 border-rose-300' },
  ];

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, note?: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, adminNote: note || adminNoteText }),
      });

      if (res.ok) {
        const data = await res.json();
        onNotify(`Statut de la commande mis à jour : ${newStatus}`);
        onRefresh();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(data.order);
        }
        setAdminNoteText('');
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur lors de la mise à jour');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.reference.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.commune.toLowerCase().includes(q) ||
        o.customer.wilayaNameFr.toLowerCase().includes(q) ||
        o.customer.wilayaNameAr.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary */}
      <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8C9CD] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#292526]">
            {language === 'ar' ? 'إدارة طلبيات الزبائن والتوصيل (COD)' : 'Gestion des Commandes & Livraisons COD'}
          </h1>
          <p className="text-xs text-[#292526]/65 mt-0.5">
            {language === 'ar'
              ? 'متابعة الطلبيات عبر 58 ولاية، التحقق بالهاتف، وإدارة تسليم المبالغ النقدية'
              : 'Suivi de la file, vérification téléphonique préalable, expéditions et encaissements'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FAF7F2] hover:bg-[#E8C9CD]/40 border border-[#E8C9CD] rounded-xl text-xs font-bold text-[#292526] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>{language === 'ar' ? 'تحديث البيانات' : 'Actualiser'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E8C9CD] shadow-2xs space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider shrink-0 cursor-pointer transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#1e1b19] text-[#FAF7F2]'
                : 'bg-[#FAF7F2] text-[#292526] hover:bg-[#E8C9CD]/50'
            }`}
          >
            {language === 'ar' ? `الكل (${orders.length})` : `Toutes (${orders.length})`}
          </button>

          {statusOptions.map((opt) => {
            const count = orders.filter((o) => o.status === opt.value).length;
            const isActive = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider shrink-0 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#1e1b19] text-[#FAF7F2]'
                    : 'bg-[#FAF7F2] text-[#292526] hover:bg-[#E8C9CD]/50'
                }`}
              >
                <span>{language === 'ar' ? opt.labelAr : opt.labelFr}</span>
                <span className="bg-[#FFFFFF]/70 px-1.5 py-0.2 rounded-full text-[10px] text-[#292526] font-tabular">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#292526]/40 text-base">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'بحث برقم الطلبية، اسم الزبونة، رقم الهاتف، أو الولاية...'
                : 'Rechercher par référence, nom cliente, téléphone algérien, commune ou wilaya...'
            }
            className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-xl pl-9 pr-4 py-2 text-xs text-[#292526] focus:border-[#642C40] focus:bg-[#FFFFFF] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8C9CD] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-[#292526]/70 uppercase font-tabular border-b border-[#E8C9CD]">
                <th className="py-3 px-4 font-bold">Référence</th>
                <th className="py-3 px-4 font-bold">Cliente & Téléphone</th>
                <th className="py-3 px-4 font-bold">Wilaya & Commune</th>
                <th className="py-3 px-4 font-bold">Articles</th>
                <th className="py-3 px-4 font-bold">Montant COD (DA)</th>
                <th className="py-3 px-4 font-bold">Statut Actuel</th>
                <th className="py-3 px-4 font-bold text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8C9CD]/40">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#292526]/50">
                    <span className="material-symbols-outlined text-3xl text-[#C5A46D] block mb-1">
                      inbox
                    </span>
                    {language === 'ar'
                      ? 'لا توجد أي طلبية مطابقة للبحث أو الفلتر.'
                      : 'Aucune commande ne correspond aux filtres appliqués.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isNew = ord.status === 'Nouvelle';

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-[#FAF7F2]/60 transition-colors ${
                        isNew ? 'bg-amber-50/30 font-medium' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-tabular font-bold text-[#642C40] block">
                          {ord.reference}
                        </span>
                        <span className="text-[10px] text-[#292526]/50 font-tabular">
                          {new Date(ord.createdAt).toLocaleDateString([], {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}{' '}
                          {new Date(ord.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#292526]">{ord.customer.fullName}</p>
                        <a
                          href={`tel:${ord.customer.phone}`}
                          className="font-tabular text-[#642C40] font-semibold hover:underline flex items-center gap-1 text-[11px]"
                        >
                          <span className="material-symbols-outlined text-[13px]">call</span>
                          <span>{ord.customer.phone}</span>
                        </a>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#292526]">
                          {ord.customer.wilayaNameFr} ({ord.customer.wilayaCode})
                        </span>
                        <p className="text-[11px] text-[#292526]/60 truncate max-w-[140px]">
                          {ord.customer.commune}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8C9CD] font-tabular font-bold">
                          {ord.items.length} produit(s)
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-tabular font-bold text-[#292526]">
                        <span className="text-[#642C40] text-sm">
                          {ord.finalTotal.toLocaleString()} {t.currency}
                        </span>
                        <div className="text-[10px] text-[#292526]/50 font-normal">
                          Dont livr. : {ord.deliveryFee} DA
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={ord.status}
                          disabled={updatingId === ord.id}
                          onChange={(e) =>
                            handleUpdateStatus(ord.id, e.target.value as OrderStatus)
                          }
                          className={`font-tabular text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                            ord.status === 'Nouvelle'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : ord.status === 'Confirmée'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : ord.status === 'Livrée'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : ord.status === 'Annulée'
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : 'bg-purple-100 text-purple-900 border-purple-300'
                          }`}
                        >
                          {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>
                              {language === 'ar' ? s.labelAr : s.labelFr}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-end">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="bg-[#FAF7F2] hover:bg-[#E8C9CD] text-[#292526] px-3 py-1.5 rounded-lg border border-[#E8C9CD] text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[15px]">visibility</span>
                          <span>{language === 'ar' ? 'عرض' : 'Fiche'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#292526]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E8C9CD] w-full max-w-2xl p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8C9CD]/60">
              <div>
                <span className="text-[10px] font-tabular uppercase bg-[#FAF7F2] text-[#642C40] px-2 py-0.5 rounded border border-[#E8C9CD] font-bold">
                  BORDEREAU DE COMMANDE
                </span>
                <h3 className="font-serif-luxury text-xl font-bold text-[#292526] mt-1">
                  Commande {selectedOrder.reference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center cursor-pointer hover:bg-[#E8C9CD]"
              >
                ✕
              </button>
            </div>

            {/* Customer Information Card */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8C9CD] space-y-2 text-xs">
              <h4 className="font-bold text-[#642C40] uppercase text-[11px] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">person_pin</span>
                <span>Coordonnées de Livraison Cliente</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[#292526]/60">Nom complet :</span>
                  <p className="font-bold text-sm text-[#292526]">{selectedOrder.customer.fullName}</p>
                </div>
                <div>
                  <span className="text-[#292526]/60">Téléphone de contact :</span>
                  <p className="font-tabular font-bold text-sm text-[#642C40]">
                    <a href={`tel:${selectedOrder.customer.phone}`} className="hover:underline">
                      {selectedOrder.customer.phone}
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-[#292526]/60">Wilaya & Commune :</span>
                  <p className="font-semibold text-[#292526]">
                    {selectedOrder.customer.wilayaNameFr} ({selectedOrder.customer.wilayaCode}) — {selectedOrder.customer.commune}
                  </p>
                </div>
                <div>
                  <span className="text-[#292526]/60">Adresse exacte :</span>
                  <p className="font-medium text-[#292526]">{selectedOrder.customer.address}</p>
                </div>
              </div>
              {selectedOrder.customer.notes && (
                <div className="pt-2 border-t border-[#E8C9CD]/50">
                  <span className="text-[#292526]/60">Remarques client :</span>
                  <p className="italic text-[#292526]/80">{selectedOrder.customer.notes}</p>
                </div>
              )}
            </div>

            {/* Itemized Products */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-[#292526] uppercase text-[11px]">Articles de la commande</h4>
              <div className="divide-y divide-[#E8C9CD]/40 border border-[#E8C9CD] rounded-xl overflow-hidden bg-[#FFFFFF]">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={it.productImage}
                        alt={it.productNameFr}
                        className="w-10 h-10 rounded-lg object-cover bg-[#FAF7F2] border border-[#E8C9CD]"
                      />
                      <div>
                        <p className="font-bold text-[#292526]">{it.productNameFr}</p>
                        <p className="text-[11px] text-[#C5A46D]">{it.productNameAr}</p>
                        {it.variantNameFr && (
                          <span className="text-[10px] bg-[#FAF7F2] px-1.5 py-0.2 rounded border border-[#E8C9CD]">
                            Teinte/Option : {it.variantNameFr}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-end font-tabular">
                      <p className="text-[#292526]/60 text-[11px]">
                        {it.quantity} × {it.unitPrice.toLocaleString()} DA
                      </p>
                      <p className="font-bold text-[#642C40]">
                        {it.lineTotal.toLocaleString()} DA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8C9CD] space-y-1.5 text-xs font-tabular">
              <div className="flex justify-between text-[#292526]/70">
                <span>Sous-total articles :</span>
                <span>{selectedOrder.subtotal.toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between text-[#292526]/70">
                <span>Frais de livraison ({selectedOrder.customer.wilayaNameFr}) :</span>
                <span>{selectedOrder.deliveryFee.toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#642C40] pt-2 border-t border-[#E8C9CD]">
                <span>TOTAL À ENCAISSER EN ESPÈCES (COD) :</span>
                <span>{selectedOrder.finalTotal.toLocaleString()} DA</span>
              </div>
            </div>

            {/* Change Status & Admin Note */}
            <div className="space-y-3 pt-2 text-xs">
              <label className="block font-bold text-[#292526]">
                Modifier le statut & Ajouter une note interne :
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleUpdateStatus(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="bg-[#FAF7F2] border border-[#E8C9CD] rounded-xl px-3 py-2 font-bold focus:outline-none"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.labelFr}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Note interne (ex: confirmée par tél, livraison prévue demain 15h)..."
                  value={adminNoteText}
                  onChange={(e) => setAdminNoteText(e.target.value)}
                  className="flex-1 bg-[#FAF7F2] border border-[#E8C9CD] rounded-xl px-3 py-2 focus:outline-none"
                />

                <button
                  onClick={() =>
                    handleUpdateStatus(selectedOrder.id, selectedOrder.status, adminNoteText)
                  }
                  className="px-4 py-2 bg-[#642C40] text-[#FAF7F2] rounded-xl font-bold hover:bg-[#292526] transition-colors cursor-pointer"
                >
                  Sauvegarder
                </button>
              </div>

              {selectedOrder.adminNotes && (
                <div className="bg-[#FFFFFF] border border-[#E8C9CD] p-3 rounded-xl space-y-1">
                  <span className="font-bold text-[10px] text-[#292526]/60 uppercase">
                    Historique des notes :
                  </span>
                  {(Array.isArray(selectedOrder.adminNotes)
                    ? selectedOrder.adminNotes
                    : [selectedOrder.adminNotes]
                  ).map((nt: string, i: number) => (
                    <p key={i} className="text-[11px] text-[#292526]">
                      • {nt}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end items-center pt-3 border-t border-[#E8C9CD]/60">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-[#292526] text-[#FAF7F2] rounded-xl text-xs font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
