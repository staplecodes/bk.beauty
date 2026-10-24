import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const AdminChangePassword: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const close = () => {
    setIsOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError(isArabic ? 'كلمتا المرور الجديدتان غير متطابقتين.' : 'Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || (isArabic ? 'تعذر تغيير كلمة المرور.' : 'Impossible de modifier le mot de passe.'));
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);
    } catch (requestError) {
      console.error('Password change request failed', requestError);
      setError(isArabic ? 'تعذر الاتصال بالخادم.' : 'Impossible de joindre le serveur.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#E8C9CD]/40 border border-[#E8C9CD] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#292526] transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px] text-[#C5A46D]">key</span>
        <span className="hidden sm:inline">{isArabic ? 'تغيير كلمة المرور' : 'Changer le mot de passe'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-[#292526]/50 flex items-center justify-center p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
            className="w-full max-w-md bg-white rounded-2xl border border-[#E8C9CD] shadow-2xl p-6 sm:p-8"
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 id="change-password-title" className="font-serif-luxury text-xl font-bold text-[#642C40]">
                {isArabic ? 'تغيير كلمة المرور' : 'Changer le mot de passe'}
              </h2>
              <button type="button" onClick={close} aria-label={isArabic ? 'إغلاق' : 'Fermer'} className="text-[#292526]/60 hover:text-[#642C40]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {error && <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
            {success && (
              <p role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                {isArabic ? 'تم تحديث كلمة المرور وحفظها.' : 'Mot de passe modifié et enregistré.'}
              </p>
            )}

            <form onSubmit={submit} className="space-y-4">
              <label className="block space-y-1 text-sm font-medium">
                <span>{isArabic ? 'كلمة المرور الحالية' : 'Mot de passe actuel'}</span>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="w-full rounded-lg border border-[#E8C9CD] bg-[#FAF7F2] px-3 py-2.5 pr-10 outline-none focus:border-[#642C40]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    aria-label={showCurrentPassword ? (isArabic ? 'إخفاء كلمة المرور' : 'Hide password') : (isArabic ? 'إظهار كلمة المرور' : 'Show password')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#292526]/50 hover:text-[#642C40] transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showCurrentPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </label>
              <label className="block space-y-1 text-sm font-medium">
                <span>{isArabic ? 'كلمة المرور الجديدة (12 إلى 72 بايت)' : 'Nouveau mot de passe (12 à 72 octets)'}</span>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={12}
                    required
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full rounded-lg border border-[#E8C9CD] bg-[#FAF7F2] px-3 py-2.5 pr-10 outline-none focus:border-[#642C40]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    aria-label={showNewPassword ? (isArabic ? 'إخفاء كلمة المرور' : 'Hide password') : (isArabic ? 'إظهار كلمة المرور' : 'Show password')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#292526]/50 hover:text-[#642C40] transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showNewPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </label>
              <label className="block space-y-1 text-sm font-medium">
                <span>{isArabic ? 'تأكيد كلمة المرور الجديدة' : 'Confirmer le nouveau mot de passe'}</span>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={12}
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-lg border border-[#E8C9CD] bg-[#FAF7F2] px-3 py-2.5 pr-10 outline-none focus:border-[#642C40]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? (isArabic ? 'إخفاء كلمة المرور' : 'Hide password') : (isArabic ? 'إظهار كلمة المرور' : 'Show password')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#292526]/50 hover:text-[#642C40] transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </label>
              <p className="text-xs text-[#292526]/60">
                {isArabic ? 'يجب أن تتراوح كلمة المرور بين 12 و72 بايت UTF-8.' : 'Le mot de passe doit compter entre 12 et 72 octets UTF-8.'}
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={close} className="rounded-lg border border-[#E8C9CD] px-4 py-2 text-sm font-semibold hover:bg-[#FAF7F2]">
                  {isArabic ? 'إغلاق' : 'Fermer'}
                </button>
                <button type="submit" disabled={isSaving} className="rounded-lg bg-[#642C40] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {isSaving ? (isArabic ? 'جارٍ الحفظ...' : 'Enregistrement...') : (isArabic ? 'حفظ' : 'Enregistrer')}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
};
