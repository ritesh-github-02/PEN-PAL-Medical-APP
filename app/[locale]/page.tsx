import { useTranslations } from 'next-intl';
import { Link } from '@/routing';

export default function HomePage() {
  const t = useTranslations('Index');
  
  return (
    <main className="h-screen flex flex-col items-center justify-center py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-teal-355/10 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none animate-pulse duration-[8000ms]"></div>
      <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-indigo-355/15 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none animate-pulse duration-[10000ms]"></div>

      <div className="w-full max-w-4xl space-y-6 md:space-y-8 relative z-10">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-teal-700 via-teal-600 to-indigo-800 bg-clip-text text-transparent mb-1 tracking-tight font-display">
            PEN-PAL
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light max-w-lg mx-auto">
            {t('description')}
          </p>
          <div className="pt-0.5">
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.22em] text-teal-700 bg-teal-50 border border-teal-100 px-3.5 py-1 rounded-full shadow-sm">
              Parents Engaged in Penicillin Allergies
            </span>
          </div>
        </div>

        {/* Navigation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-1">
          
          {/* Control Site Card */}
          <Link
            href="/control"
            className="group bg-white/70 backdrop-blur-md border border-slate-200/60 hover:border-teal-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors duration-300 shadow-sm border border-slate-100">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 font-display group-hover:text-teal-850 transition-colors">Control Site</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-light">
                  Standard care information, research insights, and penicillin allergy resources.
                </p>
              </div>
            </div>
            <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 group-hover:text-teal-700 transition-colors flex items-center gap-1">
                Access Portal <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </span>
            </div>
          </Link>

          {/* Intervention App Card (Featured Primary) */}
          <Link
            href="/intervention"
            className="group bg-gradient-to-br from-teal-600 to-indigo-700 border border-teal-500/30 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-600/15 transition-all duration-300 hover:-translate-y-1.5 p-5 sm:p-6 rounded-2xl shadow-md flex flex-col justify-between text-white"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center shadow-inner border border-white/20">
                <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 8.066l-5.666-1.337" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-white font-display">Intervention App</h3>
                <p className="text-[11px] sm:text-xs text-teal-50 leading-relaxed font-light">
                  Interactive parent assessment tool, personalized telemetry, and questionnaire engine.
                </p>
              </div>
            </div>
            <div className="pt-3.5 mt-3 border-t border-white/10 flex items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white group-hover:text-teal-100 transition-colors flex items-center gap-1">
                Start Assessment <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </span>
            </div>
          </Link>

          {/* Admin Portal Card */}
          <Link
            href="/admin"
            className="group bg-white/70 backdrop-blur-md border border-slate-200/60 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-650 transition-colors duration-300 shadow-sm border border-slate-100">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 font-display group-hover:text-indigo-850 transition-colors">Admin Portal</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-light">
                  Study telemetry, live events tracker, access token creation, and participant logs exports.
                </p>
              </div>
            </div>
            <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-650 group-hover:text-indigo-755 transition-colors flex items-center gap-1">
                Admin Access <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </span>
            </div>
          </Link>

        </div>

        {/* Footer */}
        <div className="text-center pt-5 border-t border-slate-200/50">
          <p className="text-[8px] sm:text-[9px] text-teal-650 font-bold uppercase tracking-[0.2em]">
            A Federally Funded Healthcare Research Study
          </p>
          <p className="text-xs text-slate-400 mt-1 font-light">
            © {new Date().getFullYear()} PEN-PAL Study. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}