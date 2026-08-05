import { useTranslations } from 'next-intl';
import { Link } from '@/routing';

export default function HomePage() {
  const t = useTranslations('Index');

  return (
    <main className="h-screen w-screen overflow-hidden flex flex-col justify-between py-4 sm:py-6 px-4 sm:px-8 font-sans text-[#2d3748] bg-gradient-to-b from-[#f8faf4] via-[#f4f8e8] to-[#eef4e2] select-none">
      
      {/* Branding Header */}
      <div className="space-y-1.5 text-center shrink-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#2b5d68] font-display drop-shadow-xs">
          PEN-PAL
        </h1>
        <div>
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#2b5d68] bg-white/90 border border-[#35727f]/20 px-3.5 py-1 rounded-full inline-block shadow-2xs backdrop-blur-xs">
            Parents Engaged in Penicillin Allergies
          </span>
        </div>
      </div>

      {/* Horizontal Restricted Domain Access Glass Card */}
      <div className="my-auto w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl shadow-xl p-5 sm:p-7 md:p-8 transition-all">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-center">
          
          {/* Left Column: Icon, Notice & Action Buttons */}
          <div className="md:col-span-6 space-y-4 text-center md:text-left flex flex-col justify-center">
            
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-[#f4f8e8] to-[#e2eed2] border border-[#35727f]/30 text-[#2b5d68] rounded-xl flex items-center justify-center shadow-2xs shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#2b5d68] bg-[#f4f8e8] border border-[#35727f]/20 px-3 py-1 rounded-full inline-block">
                DIRECT SUB-DOMAIN ACCESS RESTRICTED
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-black text-[#2d3748] tracking-tight">
                Unique Study Link Required
              </h2>
              <p className="text-xs text-slate-600 font-normal leading-relaxed">
                Direct web browsing to this sub-domain is locked down. Access is exclusively granted via unique study URLs or poster QR codes.
              </p>
            </div>

            {/* Action Links Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <Link
                href="/intervention"
                className="w-full sm:w-auto px-4 py-2.5 bg-[#35727f] hover:bg-[#2b5d68] text-white text-xs font-extrabold rounded-xl transition-all shadow-2xs hover:shadow-md flex items-center justify-center gap-1.5 group cursor-pointer"
              >
                Participant Access Gateway
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
              
              <Link
                href="/admin"
                className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 group cursor-pointer"
              >
                Admin Portal
                <span className="group-hover:translate-x-0.5 transition-transform text-slate-400">→</span>
              </Link>
            </div>

          </div>

          {/* Right Column: How to Access Box */}
          <div className="md:col-span-6">
            <div className="p-4 sm:p-5 bg-slate-50/90 border border-slate-200/90 rounded-2xl text-left space-y-3 shadow-2xs h-full flex flex-col justify-center">
              <p className="text-[11px] font-extrabold text-[#2b5d68] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#35727f]"></span>
                HOW TO ACCESS:
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed font-normal">
                <p className="flex items-start gap-2">
                  <span className="text-[#35727f] font-bold text-sm leading-none shrink-0">•</span>
                  <span>
                    <strong>Participants:</strong> Click the unique invitation link sent to you or scan the QR code on your study flyer.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#35727f] font-bold text-sm leading-none shrink-0">•</span>
                  <span>
                    <strong>Staff / Researchers:</strong> Use your assigned token or access the Admin Portal directly.
                  </span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="w-full text-center shrink-0">
        <p className="text-[10px] text-slate-400 font-normal">
          © {new Date().getFullYear()} PEN-PAL Study. Access restricted to authorized study participants.
        </p>
      </div>

    </main>
  );
}