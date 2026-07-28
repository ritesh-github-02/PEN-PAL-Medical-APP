import { useTranslations } from 'next-intl';
import { Link } from '@/routing';

export default function HomePage() {
  const t = useTranslations('Index');
  
  return (
    <main className="h-screen flex flex-col items-center justify-center py-6 px-4 sm:px-6 lg:px-8 font-sans bg-[#f4f8e8]">
      <div className="w-full max-w-4xl space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#35727f] mb-1 tracking-tight font-display">
            PEN-PAL
          </h1>
          <p className="text-sm sm:text-base text-[#2d3748] leading-relaxed font-normal max-w-lg mx-auto">
            {t('description')}
          </p>
          <div className="pt-0.5">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.22em] text-[#35727f] bg-white/80 border border-slate-200/80 px-4 py-1.5 rounded-full shadow-sm">
              Parents Engaged in Penicillin Allergies
            </span>
          </div>
        </div>

        {/* Navigation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-1">
          
          {/* Control Site Card */}
          <Link
            href="/control"
            className="group bg-white/80 border border-slate-200/80 hover:border-[#35727f] hover:shadow-md transition-all duration-300 hover:-translate-y-1 p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#f4f8e8] rounded-xl flex items-center justify-center text-[#35727f] group-hover:bg-[#35727f] group-hover:text-white transition-colors duration-300 shadow-sm border border-slate-200/60">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-[#2d3748] font-display">Control Site</h3>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-normal">
                  Standard care information, research insights, and penicillin allergy resources.
                </p>
              </div>
            </div>
            <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#35727f] transition-colors flex items-center gap-1">
                Access Portal <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </span>
            </div>
          </Link>

          {/* Intervention App Card (Featured Primary) */}
          <Link
            href="/intervention"
            className="group bg-[#35727f] border border-[#2d616c] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-5 sm:p-6 rounded-3xl flex flex-col justify-between text-white shadow-md"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 8.066l-5.666-1.337" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-white font-display">Intervention App</h3>
                <p className="text-[11px] sm:text-xs text-slate-100 leading-relaxed font-normal">
                  Interactive parent assessment tool, personalized telemetry, and questionnaire engine.
                </p>
              </div>
            </div>
            <div className="pt-3.5 mt-3 border-t border-white/20 flex items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#e2e8df] group-hover:text-white transition-colors flex items-center gap-1">
                Start Assessment <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </span>
            </div>
          </Link>

          {/* Admin Portal Card */}
          <Link
            href="/admin"
            className="group bg-white/80 border border-slate-200/80 hover:border-[#35727f] hover:shadow-md transition-all duration-300 hover:-translate-y-1 p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#f4f8e8] rounded-xl flex items-center justify-center text-[#35727f] group-hover:bg-[#35727f] group-hover:text-white transition-colors duration-300 shadow-sm border border-slate-200/60">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-[#2d3748] font-display">Admin Portal</h3>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-normal">
                  Study telemetry, live events tracker, access token creation, and participant logs exports.
                </p>
              </div>
            </div>
            <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#35727f] transition-colors flex items-center gap-1">
                Admin Access <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </span>
            </div>
          </Link>

        </div>

        {/* Footer */}
        <div className="text-center pt-5 border-t border-slate-200/80">
          <p className="text-[9px] text-[#35727f] font-bold uppercase tracking-[0.2em]">
            A Federally Funded Healthcare Research Study
          </p>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            © {new Date().getFullYear()} PEN-PAL Study. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}