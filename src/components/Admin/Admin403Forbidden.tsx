import React from 'react';

interface Admin403ForbiddenProps {
  onReturnToStorefront: () => void;
  onGoToLogin: () => void;
}

export const Admin403Forbidden: React.FC<Admin403ForbiddenProps> = ({
  onReturnToStorefront,
  onGoToLogin,
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#FAF7F2] text-[#292526]">
      <div className="flex flex-col w-full max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Demarcation Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#FFFFFF] border border-[#E8C9CD] px-6 py-3.5 rounded-xl shadow-xs">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
            </span>
            <span className="font-tabular text-[11px] font-bold text-[#292526] uppercase tracking-widest">
              ZERO_TRUST_PERIMETER // ENFORCED
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#292526]/60 font-tabular text-xs">
            <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
              <span className="material-symbols-outlined text-[16px]">gpp_bad</span>
              POLICY: RBAC_RESTRICTED
            </span>
            <span>|</span>
            <span>NODE: WAF-GATEWAY-DZ-LAGHOUAT</span>
          </div>
        </div>

        {/* Primary Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Core Card */}
          <div className="lg:col-span-7 bg-[#FFFFFF] rounded-2xl p-6 sm:p-10 border border-[#E8C9CD] shadow-xl flex flex-col justify-between text-start relative overflow-hidden">
            <div className="space-y-6">
              {/* Shield Emblem with Layered Rings */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-rose-100 animate-pulse" />
                <div className="absolute inset-1.5 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-200">
                  <span className="material-symbols-outlined text-rose-700 text-3xl font-bold">
                    lock_person
                  </span>
                </div>
              </div>

              {/* Headings */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-800 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm">shield</span>
                  <span>HTTP 403 • ACCESS_DENIED</span>
                </div>
                <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#292526] tracking-tight">
                  403 Forbidden — Access Denied
                </h1>
                <p className="text-xs sm:text-sm text-[#292526]/75 leading-relaxed">
                  Administrative privilege required. The resource or console you requested is restricted strictly to authorized BK BEAUTY administrative personnel.
                </p>
              </div>

              {/* Policy Notes */}
              <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#E8C9CD]/60 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#C5A46D] text-lg mt-0.5 shrink-0">
                    verified_user
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#642C40]">
                      Customer Boundary Guard
                    </p>
                    <p className="text-xs text-[#292526]/70 mt-0.5">
                      Customers and general shoppers cannot view store management consoles, stock reserves, order fulfillment queues, or customer PII records.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#C5A46D] text-lg mt-0.5 shrink-0">
                    lock_clock
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#642C40]">
                      Zero-Trust Cryptographic Enforcement
                    </p>
                    <p className="text-xs text-[#292526]/70 mt-0.5">
                      Privileged endpoints mandate verified administrative session tokens and strict Role-Based Access Control (RBAC).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onReturnToStorefront}
                className="flex-1 py-3 px-5 bg-[#642C40] text-[#FAF7F2] hover:bg-[#292526] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">west</span>
                <span>Return to Public Storefront</span>
              </button>

              <button
                onClick={onGoToLogin}
                className="flex-1 py-3 px-5 bg-[#FAF7F2] text-[#292526] hover:bg-[#E8C9CD]/50 border border-[#E8C9CD] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-[#C5A46D]">
                  admin_panel_settings
                </span>
                <span>Sign In as Admin</span>
              </button>
            </div>
          </div>

          {/* Right Column: Diagnostic Incident Telemetry */}
          <div className="lg:col-span-5 flex flex-col space-y-4 text-start">
            <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E8C9CD] shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8C9CD]/40">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#C5A46D] text-lg">terminal</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#292526]">
                    Incident Telemetry
                  </span>
                </div>
                <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">
                  SEV-3 RBAC_BLOCK
                </span>
              </div>

              {/* Diagnostic Box */}
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8C9CD] space-y-3 font-tabular text-xs">
                <div>
                  <span className="text-[10px] uppercase text-[#292526]/50 block font-bold">
                    INCIDENT REFERENCE
                  </span>
                  <div className="mt-0.5 bg-[#FFFFFF] px-3 py-1.5 rounded border border-[#E8C9CD] font-bold text-[#642C40] select-all">
                    SEC-ERR-8849-RBAC
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase text-[#292526]/50 block font-bold">
                      CLIENT IP
                    </span>
                    <div className="mt-0.5 bg-[#FFFFFF] px-2.5 py-1.5 rounded border border-[#E8C9CD] text-[11px] truncate select-all">
                      197.200.44.12
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#292526]/50 block font-bold">
                      SERVER CLOCK
                    </span>
                    <div className="mt-0.5 bg-[#FFFFFF] px-2.5 py-1.5 rounded border border-[#E8C9CD] text-[11px] truncate">
                      {new Date().toISOString().slice(11, 19)} UTC
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-[#292526]/50 block font-bold">
                    REQUESTED ENDPOINT
                  </span>
                  <div className="mt-0.5 bg-[#FFFFFF] px-3 py-1.5 rounded border border-[#E8C9CD] text-rose-700 text-[11px] break-all select-all">
                    /gestion-privee
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-[#292526]/50 block font-bold">
                    REASON CODES
                  </span>
                  <div className="mt-0.5 bg-[#FFFFFF] px-3 py-1.5 rounded border border-[#E8C9CD] text-[#292526]/70 text-[11px]">
                    Missing or expired administrator session
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs text-[#292526]/70 space-y-1">
                <p>
                  If you are an authorized manager and received this block unintentionally, sign in with your corporate credentials.
                </p>
              </div>
            </div>

            {/* Luxury Brand Note */}
            <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#E8C9CD] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E8C9CD]/40 flex items-center justify-center text-[#642C40]">
                  <span className="material-symbols-outlined text-base">spa</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#292526]">BK BEAUTY ATELIER</p>
                  <p className="text-[10px] text-[#292526]/60">Laghouat Data Protection Suite</p>
                </div>
              </div>
              <span className="font-tabular text-[10px] text-[#642C40] font-bold bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#E8C9CD]">
                TLS 1.3 AES-256
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
