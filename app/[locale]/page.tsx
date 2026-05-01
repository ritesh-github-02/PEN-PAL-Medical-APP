import { useTranslations } from 'next-intl';
import { Link } from '@/routing';

export default function HomePage() {
  const t = useTranslations('Index');
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-teal-800 mb-2 tracking-tight">
            PEN-PAL
          </h1>
          <p className="text-sm sm:text-base text-teal-600 leading-relaxed font-light max-w-xl mx-auto">
            {t('description')}
          </p>
          <div className="mt-2">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-teal-500">
              Parents Engaged in Penicillin Allergies
            </p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {/* Control Site */}
          <Link
            href="/control"
            className="group bg-white border border-teal-200 hover:border-teal-400 transition-all duration-200 p-6 rounded-xl shadow hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-teal-900">Control Site</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Standard care information and resources
              </p>
              <div className="pt-2 border-t border-teal-50">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 group-hover:text-teal-700 transition-colors">
                  Access Portal →
                </span>
              </div>
            </div>
          </Link>

          {/* Intervention App */}
          <Link
            href="/intervention"
            className="group bg-teal-600 border border-teal-600 hover:border-teal-700 transition-all duration-200 p-6 rounded-xl shadow hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 8.066l-5.666-1.337" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Intervention App</h3>
              <p className="text-xs text-teal-50 leading-relaxed">
                Interactive questionnaire and assessment tool
              </p>
              <div className="pt-2 border-t border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-white/90 group-hover:text-white transition-colors">
                  Start Assessment →
                </span>
              </div>
            </div>
          </Link>

          {/* Admin Portal */}
          <Link
            href="/admin"
            className="group bg-white border border-gray-200 hover:border-teal-300 transition-all duration-200 p-6 rounded-xl shadow hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Admin Portal</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Management and administration tools
              </p>
              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-teal-500 transition-colors">
                  Admin Access →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-teal-50">
          <p className="text-xs text-teal-500 font-semibold uppercase tracking-wider">
            A Federally Funded Healthcare Research Study
          </p>
          <p className="text-xs text-gray-400 mt-1">
            © {new Date().getFullYear()} PEN-PAL Study. All rights reserved.
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-3 left-3 w-8 h-8 bg-teal-200 rounded-full mix-blend-multiply filter blur-lg opacity-10 animate-pulse"></div>
      <div className="fixed bottom-3 right-3 w-10 h-10 bg-orange-200 rounded-full mix-blend-multiply filter blur-lg opacity-10 animate-pulse"></div>
    </main>
  );
}