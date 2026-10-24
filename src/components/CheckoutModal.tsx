import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Order, WilayaDeliveryRule } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { items, subtotal, clearCart } = useCart();
  const { language, t } = useLanguage();

  const [wilayas, setWilayas] = useState<WilayaDeliveryRule[]>([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('03'); // Default to 03 - Laghouat!
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch wilayas list from backend
  useEffect(() => {
    fetch('/api/public/wilayas')
      .then((res) => res.json())
      .then((data) => {
        if (data.wilayas) {
          setWilayas(data.wilayas);
        }
      })
      .catch((err) => console.error('Failed to load wilayas', err));
  }, []);

  if (!isOpen) return null;

  const currentWilaya = wilayas.find((w) => w.code === selectedWilayaCode);
  const deliveryFee = currentWilaya ? currentWilaya.deliveryFee : 500;
  const finalTotal = subtotal + deliveryFee;

  const validateAlgerianPhone = (num: string): boolean => {
    const clean = num.replace(/\s+/g, '').replace(/[-+]/g, '');
    return /^(?:213|00213|0)?[567]\d{8}$/.test(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError(t.checkout.errors.fullNameRequired);
      return;
    }

    if (!validateAlgerianPhone(phone)) {
      setFormError(t.checkout.errors.phoneInvalid);
      return;
    }

    if (!selectedWilayaCode) {
      setFormError(t.checkout.errors.wilayaRequired);
      return;
    }

    if (!commune.trim()) {
      setFormError(t.checkout.errors.communeRequired);
      return;
    }

    if (!address.trim()) {
      setFormError(t.checkout.errors.addressRequired);
      return;
    }

    if (!termsAccepted) {
      setFormError(t.checkout.errors.termsRequired);
      return;
    }

    if (items.length === 0) {
      setFormError(t.checkout.errors.emptyCart);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          wilayaCode: selectedWilayaCode,
          commune: commune.trim(),
          address: address.trim(),
          notes: notes.trim(),
        },
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || t.checkout.errors.serverError);
        setIsSubmitting(false);
        return;
      }

      // Order saved in persistent DB!
      clearCart();
      setIsSubmitting(false);
      onClose();
      onOrderSuccess(data.order);
    } catch (err) {
      console.error('Order submission error', err);
      setFormError(t.checkout.errors.serverError);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#292526]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E8C9CD] overflow-hidden text-start my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-[#FAF7F2] border-b border-[#E8C9CD]/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A46D]">
              BK BEAUTY · Laghouat
            </span>
            <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#292526]">
              {t.checkout.title}
            </h2>
            <p className="text-xs text-[#292526]/70 mt-0.5">
              {t.checkout.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 rounded-full bg-[#FFFFFF] text-[#292526] hover:bg-[#E8C9CD] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">
                error
              </span>
              <span>{formError}</span>
            </div>
          )}

          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#642C40] pb-1 border-b border-[#E8C9CD]/50">
              {t.checkout.customerInfo}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#292526] mb-1">
                  {t.checkout.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.checkout.fullNamePlaceholder}
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg px-3 py-2 text-xs text-[#292526] focus:border-[#642C40] focus:bg-[#FFFFFF] transition-colors focus:outline-none"
                />
              </div>

              {/* Algerian Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-[#292526] mb-1">
                  {t.checkout.phone} *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.checkout.phonePlaceholder}
                    className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg px-3 py-2 text-xs font-tabular text-[#292526] focus:border-[#642C40] focus:bg-[#FFFFFF] transition-colors focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-[#292526]/50 mt-0.5 block">
                  {language === 'ar' ? 'سنتصل بك لتأكيد الطلب قبل الشحن' : 'Nous vous contacterons par téléphone pour valider l\'envoi'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Wilaya Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#292526] mb-1">
                  {t.checkout.wilaya} *
                </label>
                <select
                  value={selectedWilayaCode}
                  onChange={(e) => setSelectedWilayaCode(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg px-3 py-2 text-xs text-[#292526] focus:border-[#642C40] focus:bg-[#FFFFFF] transition-colors focus:outline-none cursor-pointer"
                >
                  {wilayas.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code} - {language === 'ar' ? w.nameAr : w.nameFr} (+{w.deliveryFee} {t.currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Commune */}
              <div>
                <label className="block text-xs font-semibold text-[#292526] mb-1">
                  {t.checkout.commune} *
                </label>
                <input
                  type="text"
                  required
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  placeholder={t.checkout.communePlaceholder}
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg px-3 py-2 text-xs text-[#292526] focus:border-[#642C40] focus:bg-[#FFFFFF] transition-colors focus:outline-none"
                />
              </div>
            </div>

            {/* Detailed Address */}
            <div>
              <label className="block text-xs font-semibold text-[#292526] mb-1">
                {t.checkout.address} *
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t.checkout.addressPlaceholder}
                className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg px-3 py-2 text-xs text-[#292526] focus:border-[#642C40] focus:bg-[#FFFFFF] transition-colors focus:outline-none"
              />
            </div>

            {/* Order Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#292526] mb-1">
                {t.checkout.notes}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.checkout.notesPlaceholder}
                className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg px-3 py-2 text-xs text-[#292526] focus:border-[#642C40] focus:bg-[#FFFFFF] transition-colors focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method & Order Summary */}
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8C9CD] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#642C40] uppercase tracking-wider">
                {t.checkout.paymentMethod}
              </span>
              <span className="bg-[#642C40] text-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                {t.checkout.codBadge}
              </span>
            </div>
            <p className="text-[11px] text-[#292526]/75 leading-relaxed">
              {t.checkout.codExplainer}
            </p>

            <div className="pt-2 border-t border-[#E8C9CD]/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#292526]/80">
                <span>{t.checkout.subtotal} ({items.length} {t.cart.itemsCount}) :</span>
                <span className="font-tabular font-semibold">
                  {subtotal.toLocaleString()} {t.currency}
                </span>
              </div>
              <div className="flex justify-between text-[#292526]/80">
                <span>
                  {t.checkout.deliveryFee} ({currentWilaya ? (language === 'ar' ? currentWilaya.nameAr : currentWilaya.nameFr) : ''}) :
                </span>
                <span className="font-tabular font-semibold text-[#C5A46D]">
                  {deliveryFee.toLocaleString()} {t.currency}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E8C9CD]/60 flex justify-between font-bold text-sm text-[#292526]">
                <span>{t.checkout.finalTotal} :</span>
                <span className="font-tabular text-lg text-[#642C40]">
                  {finalTotal.toLocaleString()} {t.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="termsAgreement"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#642C40] accent-[#642C40] cursor-pointer"
            />
            <label htmlFor="termsAgreement" className="text-xs text-[#292526]/80 cursor-pointer">
              {t.checkout.termsAgreement}
            </label>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              isSubmitting
                ? 'bg-[#E8C9CD] text-[#292526]/40 cursor-wait'
                : 'bg-[#642C40] text-[#FAF7F2] hover:bg-[#292526]'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">
                  progress_activity
                </span>
                <span>{t.checkout.submitting}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{t.checkout.submitOrder} ({finalTotal.toLocaleString()} {t.currency})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
