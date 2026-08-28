'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/routing';
import Loader from '@/components/common/Loader';

export default function HomePage() {
  const t = useTranslations('Index');
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  const handleNavigate = (path: string) => {
    setNavigating(true);
    router.push(path);
  };

  return (
    <main className="h-screen w-screen overflow-hidden flex flex-col justify-between py-4 sm:py-6 px-4 sm:px-8 font-sans text-[#1c2b2e] bg-[#faf9f5] relative" role="main" aria-label="PEN-PAL Study Landing">

      {/* Global FullScreen Loader Overlay */}
      {navigating && <Loader fullScreen />}

      {/* Subtle grid texture backdrop */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#e8e4d8 1px, transparent 1px), linear-gradient(90deg, #e8e4d8 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      {/* Branding Header */}
      <div className="space-y-2 text-center shrink-0 relative z-10">
        <div className="inline-flex items-center gap-2.5">
          <span className="h-px w-6 bg-[#9c6b3f]/50" aria-hidden="true" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#9c6b3f]">
            Clinical Study Portal
          </span>
          <span className="h-px w-6 bg-[#9c6b3f]/50" aria-hidden="true" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-[-0.02em] text-[#12262a] leading-none">
          PEN&#8209;PAL
        </h1>
        <p className="text-[11px] sm:text-xs font-medium text-[#5b6b64] tracking-wide">
          Parents Engaged in Penicillin Allergies
        </p>
      </div>

      {/* Main Card */}
      <div className="my-auto w-full max-w-4xl mx-auto relative z-10">
        <div className="bg-white border border-[#e4e0d3] rounded-2xl shadow-[0_1px_2px_rgba(18,38,42,0.04),0_12px_32px_-12px_rgba(18,38,42,0.12)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12">

            {/* Left Column: Notice & Action Buttons */}
            <div className="md:col-span-7 p-6 sm:p-8 md:p-9 space-y-5 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#e4e0d3]">

              <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-[#fbf3e9] border border-[#e8d5b8]">
                <svg className="w-3.5 h-3.5 text-[#9c6b3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9c6b3f]">
                  Access Restricted
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#12262a] tracking-tight leading-snug">
                  A unique study link is required
                </h2>
                <p className="text-sm text-[#5b6b64] leading-relaxed max-w-md">
                  Direct browsing to this sub-domain is locked down. Access is granted exclusively through personal study invitations or poster QR codes.
                </p>
              </div>

              {/* Action Links */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleNavigate('/intervention')}
                  disabled={navigating}
                  aria-label="Open Participant Access Gateway"
                  className="group inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#12262a] hover:bg-[#0a1719] text-white text-[13px] font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#12262a] focus-visible:ring-offset-2 cursor-pointer disabled:opacity-75"
                >
                  Participant Access Gateway
                  <span className="group-hover:translate-x-0.5 transition-transform duration-150" aria-hidden="true">&rarr;</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate('/admin')}
                  disabled={navigating}
                  aria-label="Open Admin Portal"
                  className="group inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border border-[#d7d2c2] hover:border-[#b5ae99] hover:bg-[#faf9f5] text-[#12262a] text-[13px] font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#12262a] focus-visible:ring-offset-2 cursor-pointer disabled:opacity-75"
                >
                  Admin Portal
                  <span className="text-[#8b8677] group-hover:translate-x-0.5 transition-transform duration-150" aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </div>

            {/* Right Column: How to Access */}
            <div className="md:col-span-5 p-6 sm:p-8 md:p-9 bg-[#f8f6ef] flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#ece7d8]">
              <p className="text-[10px] font-bold text-[#12262a] uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9c6b3f]" aria-hidden="true" />
                How to access
              </p>

              <p className="text-[13px] sm:text-[14px] text-[#374544] leading-relaxed">
                <strong className="text-[#12262a] font-semibold">Participants</strong> &mdash; click the unique invitation link sent to you, or scan the QR code on your study flyer.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center shrink-0 relative z-10">
        <p className="text-[11px] text-[#8b8677]">
          &copy; {new Date().getFullYear()} PEN&#8209;PAL Study &middot; Access restricted to authorized study participants
        </p>
      </footer>

    </main>
  );
}