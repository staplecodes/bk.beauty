import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface PolicyModalsProps {
  policyKey: 'shipping' | 'returns' | 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const PolicyModals: React.FC<PolicyModalsProps> = ({ policyKey, onClose }) => {
  const { language } = useLanguage();

  if (!policyKey) return null;

  const content = {
    shipping: {
      titleFr: 'Politique de Livraison & Paiement à la Livraison (COD)',
      titleAr: 'سياسة الشحن والدفع عند الاستلام (Cash on Delivery)',
      bodyFr: (
        <div className="space-y-4 text-xs text-[#292526]/80 leading-relaxed text-start">
          <p>
            Chez <strong>BK BEAUTY</strong>, nous nous engageons à offrir un service d'expédition transparent, soigné et rapide à travers l'ensemble des <strong>58 Wilayas d'Algérie</strong>.
          </p>
          <h4 className="font-bold text-[#642C40] uppercase text-[11px]">1. Mode de Paiement : Espèces à la livraison</h4>
          <p>
            Toutes les commandes sont réglées en <strong>Dinars Algériens (DA)</strong> directement auprès de l'agent livreur lors de la remise de votre colis en main propre. Aucun paiement anticipé ni carte bancaire n'est requis.
          </p>
          <h4 className="font-bold text-[#642C40] uppercase text-[11px]">2. Délais d'expédition</h4>
          <p>
            • <strong>Laghouat (Boutique & Wilaya locale) :</strong> Livraison express en 24h ouvrées.<br />
            • <strong>Grandes villes du Nord (Alger, Blida, Oran, Constantine...) :</strong> 24h à 48h.<br />
            • <strong>Hauts-Plateaux et Sud :</strong> 2 à 4 jours ouvrés.
          </p>
          <h4 className="font-bold text-[#642C40] uppercase text-[11px]">3. Vérification du colis</h4>
          <p>
            Chaque colis est soigneusement protégé par un emballage de sécurité. Vous êtes invité(e) à vérifier l'état extérieur du colis avant de régler le montant exact auprès du coursier.
          </p>
        </div>
      ),
      bodyAr: (
        <div className="space-y-4 text-xs text-[#292526]/80 leading-relaxed text-start">
          <p>
            في <strong>BK BEAUTY</strong>، نلتزم بتقديم خدمة توصيل سريعة وموثوقة تغطي كافة <strong>الولايات الـ 58 للجمهورية الجزائرية</strong>.
          </p>
          <h4 className="font-bold text-[#642C40] uppercase text-[11px]">1. طريقة الدفع: نقداً عند الاستلام</h4>
          <p>
            يتم تسليم قيمة الطلبية بالكامل بالدينار الجزائري (دج) لممثل التوصيل فور استلام الطرد. لا نطلب أي دفع مسبق بالبطاقة البنكية.
          </p>
          <h4 className="font-bold text-[#642C40] uppercase text-[11px]">2. آجال التوصيل</h4>
          <p>
            • <strong>ولاية الأغواط (المقر الرئيسي) :</strong> توصيل سريع خلال 24 ساعة.<br />
            • <strong>المدن الكبرى (الجزائر العاصمة، وهران، قسنطينة...) :</strong> 24 إلى 48 ساعة.<br />
            • <strong>باقي ولايات الوطن والجنوب الكبير :</strong> 2 إلى 4 أيام عمل.
          </p>
          <h4 className="font-bold text-[#642C40] uppercase text-[11px]">3. فحص الطرد وسلامة المحتوى</h4>
          <p>
            تغلف كافة المنتجات بعناية فائقة ضد الكسر والصدمات لضمان وصولها بأعلى معايير الجودة الأصلية.
          </p>
        </div>
      ),
    },
    returns: {
      titleFr: 'Politique d\'Échanges & Retours',
      titleAr: 'سياسة الاستبدال والإرجاع',
      bodyFr: (
        <div className="space-y-4 text-xs text-[#292526]/80 leading-relaxed text-start">
          <p>
            Pour des raisons d'hygiène et de sécurité sanitaire strictes régissant les produits cosmétiques et de beauté, les retours de produits descellés, testés ou utilisés ne peuvent être acceptés.
          </p>
          <h4 className="font-bold text-[#642C40] uppercase text-[11px]">Conditions d'échange :</h4>
          <p>
            • Si un article présente un défaut de fabrication ou une non-conformité à la livraison, signalez-le dans les <strong>48 heures</strong> suivant la réception en contactant notre service client.<br />
            • L'article doit être dans son emballage d'origine intact, non ouvert et scellé.
          </p>
        </div>
      ),
      bodyAr: (
        <div className="space-y-4 text-xs text-[#292526]/80 leading-relaxed text-start">
          <p>
            حرصاً على السلامة الصحية وقواعد النظافة الصارمة الخاصة بمستحضرات التجميل والعناية، لا يمكن استرجاع أو استبدال المنتجات التي تم فتح غلافها الأصلي أو تجربتها.
          </p>
          <h4 className="font-bold text-[#642C40] uppercase text-[11px]">شروط الاستبدال:</h4>
          <p>
            • في حال وجود خطأ في المنتج المستلم أو عيب مصنعي، يرجى التواصل مع فريقنا خلال <strong>48 ساعة</strong> من تاريخ الاستلام.<br />
            • يجب أن يكون المنتج في غلافه الأصلي المحكم الإغلاق وغير مستعمل بتاتاً.
          </p>
        </div>
      ),
    },
    privacy: {
      titleFr: 'Politique de Confidentialité',
      titleAr: 'سياسة الخصوصية وحماية البيانات',
      bodyFr: (
        <div className="space-y-3 text-xs text-[#292526]/80 leading-relaxed text-start">
          <p>
            Chez <strong>BK BEAUTY</strong>, nous protégeons rigoureusement vos données personnelles. Les informations fournies lors de votre commande (nom, téléphone, wilaya, adresse) sont utilisées exclusivement pour le traitement et la livraison de votre colis.
          </p>
          <p>
            Vos coordonnées ne sont jamais vendues, cédées ou divulguées à des tiers autres que notre transporteur partenaire pour l'acheminement de votre commande.
          </p>
        </div>
      ),
      bodyAr: (
        <div className="space-y-3 text-xs text-[#292526]/80 leading-relaxed text-start">
          <p>
            نحن في <strong>BK BEAUTY</strong> نحترم خصوصيتكم بأعلى درجات المسؤولية. المعلومات المقدمة عند التسوق (الاسم، الهاتف، الولاية، العنوان) تُستخدم حصرياً لإتمام عملية التوصيل وتأكيد الطلب.
          </p>
          <p>
            بياناتكم محمية ولا يتم مشاركتها أو بيعها لأي جهات أخرى سوى شركة التوصيل المسؤولة عن تسليمكم الطرد.
          </p>
        </div>
      ),
    },
    terms: {
      titleFr: 'Conditions Générales de Vente',
      titleAr: 'الشروط العامة للبيع',
      bodyFr: (
        <div className="space-y-3 text-xs text-[#292526]/80 leading-relaxed text-start">
          <p>
            Toute commande passée sur la boutique en ligne <strong>BK BEAUTY</strong> implique l'acceptation sans réserve des présentes conditions de vente.
          </p>
          <p>
            Les prix sont indiqués en <strong>Dinars Algériens (DA)</strong> toutes taxes comprises. La validation de la commande entraîne un engagement d'achat ferme avec obligation de règlement du montant convenu lors de la présentation du colis par le livreur.
          </p>
        </div>
      ),
      bodyAr: (
        <div className="space-y-3 text-xs text-[#292526]/80 leading-relaxed text-start">
          <p>
            إن تأكيد أي طلبية عبر متجر <strong>BK BEAUTY</strong> يعتبر موافقة كاملة على شروط البيع المعمول بها.
          </p>
          <p>
            كافة الأسعار محددة بوضوح بالدينار الجزائري (دج). تسجيل الطلب هو التزام شرائي بدفع المبلغ المتفق عليه نقداً لموزع الطرود عند الاستلام.
          </p>
        </div>
      ),
    },
  };

  const item = content[policyKey];

  return (
    <div className="fixed inset-0 z-50 bg-[#292526]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E8C9CD] overflow-hidden text-start my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 bg-[#FAF7F2] border-b border-[#E8C9CD]/60 flex items-center justify-between">
          <h3 className="font-serif-luxury text-lg font-bold text-[#292526]">
            {language === 'ar' ? item.titleAr : item.titleFr}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FFFFFF] text-[#292526] hover:bg-[#E8C9CD] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {language === 'ar' ? item.bodyAr : item.bodyFr}
        </div>

        <div className="p-4 bg-[#FAF7F2] border-t border-[#E8C9CD]/50 text-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#642C40] text-[#FAF7F2] hover:bg-[#292526] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
};
