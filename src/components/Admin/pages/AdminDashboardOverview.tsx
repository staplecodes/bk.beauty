import React from 'react';
import { DashboardStats, Order } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';

interface AdminDashboardOverviewProps {
  stats: DashboardStats | null;
  onNavigate: (path: string) => void;
  onOpenOrder: (order: Order) => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  stats,
  onNavigate,
  onOpenOrder,
}) => {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Main KPI Ribbons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Chiffre d'affaires brut */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8C9CD] shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase text-[#292526]/60 font-bold tracking-wider font-tabular">
                {language === 'ar' ? 'إجمالي قيمة الطلبيات (Brut)' : 'Valeur Totale Commandes'}
              </span>
              <p className="font-serif-luxury text-2xl font-bold text-[#292526] mt-1">
                {(stats?.activeOrderValue || 0).toLocaleString()} {t.currency}
              </p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#642C40] shrink-0">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#FAF7F2] flex items-center justify-between text-xs text-[#292526]/70">
            <span>{language === 'ar' ? 'المجموع النشط' : 'Toutes commandes actives'}</span>
            <span className="font-tabular font-bold text-[#642C40]">
              {stats?.totalOrders || 0} commandes
            </span>
          </div>
        </div>

        {/* Card 2: Recettes Encaissées (Strictement Livrées) */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8C9CD] shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase text-[#292526]/60 font-bold tracking-wider font-tabular">
                {language === 'ar' ? 'المداخيل المحصلة فعلياً (Livrée)' : 'Recettes Encaissées (COD)'}
              </span>
              <p className="font-serif-luxury text-2xl font-bold text-emerald-700 mt-1">
                {(stats?.collectedRevenue || 0).toLocaleString()} {t.currency}
              </p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">price_check</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#FAF7F2] flex items-center justify-between text-xs text-[#292526]/70">
            <span>{language === 'ar' ? 'الطلبيات المسلمة نقداً' : 'Commandes réglées en espèces'}</span>
            <span className="font-tabular font-bold text-emerald-700">
              {stats?.deliveredOrders || 0} livrées
            </span>
          </div>
        </div>

        {/* Card 3: Commandes à valider par téléphone (COD Verification) */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8C9CD] shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase text-[#292526]/60 font-bold tracking-wider font-tabular">
                {language === 'ar' ? 'طلبيات جديدة للمراجعة' : 'Vérification Téléphonique'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="font-serif-luxury text-2xl font-bold text-[#292526]">
                  {stats?.newPendingOrders || 0}
                </p>
                <span className="font-tabular text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                  {language === 'ar' ? 'بحاجة لاتصال' : 'À contacter'}
                </span>
              </div>
            </div>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">phone_in_talk</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#FAF7F2] flex items-center justify-between text-xs text-[#292526]/70">
            <span>Confirmation avant expédition</span>
            <button
              onClick={() => onNavigate('/gestion-privee/orders')}
              className="text-[#642C40] font-bold hover:underline cursor-pointer"
            >
              Voir la file
            </button>
          </div>
        </div>

        {/* Card 4: Alertes Stock Faible */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8C9CD] shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase text-[#292526]/60 font-bold tracking-wider font-tabular">
                {language === 'ar' ? 'تنبيهات المخزون' : 'Santé du Stock'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="font-serif-luxury text-2xl font-bold text-rose-700">
                  {stats?.lowStockCount || 0} SKUs
                </p>
                <span className="font-tabular text-[10px] bg-rose-50 text-rose-800 px-2 py-0.5 rounded font-bold uppercase">
                  {language === 'ar' ? 'مخزون منخفض' : 'Alerte stock'}
                </span>
              </div>
            </div>
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">warning</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#FAF7F2] flex items-center justify-between text-xs text-[#292526]/70">
            <span>Seuil automatique d'alerte</span>
            <button
              onClick={() => onNavigate('/gestion-privee/inventory')}
              className="text-[#642C40] font-bold hover:underline cursor-pointer"
            >
              Gérer le stock
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Status Breakdown Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E8C9CD] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-[#292526]/60 font-semibold block">
              {language === 'ar' ? 'مؤكدة' : 'Confirmées'}
            </span>
            <p className="font-tabular font-bold text-base text-[#292526] mt-0.5">
              {stats?.confirmedOrders || 0}
            </p>
          </div>
          <span className="material-symbols-outlined text-blue-600">verified</span>
        </div>

        <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E8C9CD] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-[#292526]/60 font-semibold block">
              {language === 'ar' ? 'قيد التحضير' : 'En préparation'}
            </span>
            <p className="font-tabular font-bold text-base text-[#292526] mt-0.5">
              {stats?.preparingOrders || 0}
            </p>
          </div>
          <span className="material-symbols-outlined text-purple-600">inventory</span>
        </div>

        <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E8C9CD] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-[#292526]/60 font-semibold block">
              {language === 'ar' ? 'قيد التوصيل' : 'En livraison'}
            </span>
            <p className="font-tabular font-bold text-base text-[#292526] mt-0.5">
              {stats?.deliveringOrders || 0}
            </p>
          </div>
          <span className="material-symbols-outlined text-amber-600">local_shipping</span>
        </div>

        <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E8C9CD] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-[#292526]/60 font-semibold block">
              {language === 'ar' ? 'ملغاة' : 'Annulées'}
            </span>
            <p className="font-tabular font-bold text-base text-rose-700 mt-0.5">
              {stats?.cancelledOrders || 0}
            </p>
          </div>
          <span className="material-symbols-outlined text-rose-600">cancel</span>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8C9CD] shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E8C9CD]/50">
          <div>
            <h3 className="font-serif-luxury text-lg font-bold text-[#292526]">
              {language === 'ar' ? 'أحدث الطلبيات المسجلة' : 'Commandes Récentes'}
            </h3>
            <p className="text-xs text-[#292526]/65">
              {language === 'ar'
                ? 'آخر الطلبيات الواردة عبر المتجر مع معلومات التوصيل والمبلغ'
                : 'Dernières commandes enregistrées avec détails client et montant net COD'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('/gestion-privee/orders')}
            className="text-xs font-bold text-[#642C40] hover:text-[#C5A46D] transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>{language === 'ar' ? 'عرض جميع الطلبيات' : 'Voir toutes les commandes'}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-[#292526]/70 uppercase font-tabular border-b border-[#E8C9CD]">
                <th className="py-2.5 px-3 font-bold">Réf.</th>
                <th className="py-2.5 px-3 font-bold">Client</th>
                <th className="py-2.5 px-3 font-bold">Téléphone</th>
                <th className="py-2.5 px-3 font-bold">Wilaya</th>
                <th className="py-2.5 px-3 font-bold">Total Net</th>
                <th className="py-2.5 px-3 font-bold">Statut</th>
                <th className="py-2.5 px-3 font-bold text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8C9CD]/40">
              {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#292526]/50">
                    {language === 'ar' ? 'لا توجد طلبيات مسجلة حالياً.' : 'Aucune commande enregistrée pour le moment.'}
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3 px-3 font-tabular font-bold text-[#642C40]">
                      {ord.reference}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#292526]">
                      {ord.customer.fullName}
                    </td>
                    <td className="py-3 px-3 font-tabular text-[#292526]/80">
                      {ord.customer.phone}
                    </td>
                    <td className="py-3 px-3">
                      {ord.customer.wilayaNameFr} ({ord.customer.wilayaCode})
                    </td>
                    <td className="py-3 px-3 font-tabular font-bold text-[#292526]">
                      {ord.finalTotal.toLocaleString()} {t.currency}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-tabular text-[10px] font-bold px-2 py-0.5 rounded ${
                          ord.status === 'Nouvelle'
                            ? 'bg-amber-100 text-amber-900'
                            : ord.status === 'Confirmée'
                            ? 'bg-blue-100 text-blue-900'
                            : ord.status === 'Livrée'
                            ? 'bg-emerald-100 text-emerald-900'
                            : ord.status === 'Annulée'
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-purple-100 text-purple-900'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-end">
                      <button
                        onClick={() => onOpenOrder(ord)}
                        className="bg-[#FAF7F2] hover:bg-[#E8C9CD] text-[#292526] px-2.5 py-1 rounded border border-[#E8C9CD] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {language === 'ar' ? 'التفاصيل' : 'Détails'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
