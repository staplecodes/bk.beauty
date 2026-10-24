import React from 'react';

interface AdminLoggedOutProps {
  onGoToLogin: () => void;
  onReturnToStorefront: () => void;
}

export const AdminLoggedOut: React.FC<AdminLoggedOutProps> = ({
  onGoToLogin,
  onReturnToStorefront,
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#FAF7F2] text-[#292526]">
      <div className="relative w-full max-w-xl bg-[#FFFFFF] rounded-2xl shadow-xl border border-[#E8C9CD] p-6 sm:p-10 space-y-6 text-start">
        {/* Center Title & Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#E8C9CD]">
            <span className="material-symbols-outlined text-[#642C40] text-3xl">shield</span>
            <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#642C40] text-[#FFFFFF] flex items-center justify-center text-xs font-bold shadow-xs">
              ✓
            </span>
          </div>

          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#292526]">
            You Have Been Safely Logged Out
          </h1>
          <p className="text-xs text-[#292526]/70 max-w-md">
            Your administrative session has ended and all privileged credentials have been invalidated.
          </p>
        </div>

        {/* Success Message */}
        <div className="flex items-center justify-center gap-2 py-4 text-[#292526]">
          <span className="material-symbols-outlined text-emerald-600 text-2xl">check_circle</span>
          <span className="text-sm font-semibold">You have been logged out successfully.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onGoToLogin}
            className="flex-1 py-3 px-4 bg-[#642C40] text-[#FAF7F2] hover:bg-[#292526] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">login</span>
            <span>Log In Again as Administrator</span>
          </button>

          <button
            onClick={onReturnToStorefront}
            className="flex-1 py-3 px-4 bg-[#FAF7F2] text-[#292526] hover:bg-[#E8C9CD]/40 border border-[#E8C9CD] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">storefront</span>
            <span>Browse Public Storefront</span>
          </button>
        </div>

      </div>
    </div>
  );
};
