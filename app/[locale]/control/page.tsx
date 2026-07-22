import { useTranslations } from 'next-intl';
import { logout } from '../intervention/actions';

export default function ControlSitePage() {
  const t = useTranslations('Control');
  
  return (
    <div className="min-h-screen py-16 px-4 font-sans bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Professional Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200 p-6 rounded-xl shadow-sm gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
             <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 font-display">
               PEN-PAL <span className="text-slate-500 font-semibold">Control</span>
             </h1>
             <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
               <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                 Protocol Version 2.1
               </span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 Research Site
               </span>
             </div>
          </div>
          <form action={logout}>
            <button 
              type="submit"
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              Exit & Logout →
            </button>
          </form>
        </header>

        <main className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          {/* Hero Section */}
          <div className="bg-slate-900 text-white p-12 sm:p-20 text-center space-y-6">
             <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto font-display">{t('title')}</h2>
             <p className="text-slate-300 text-base sm:text-lg font-light max-w-2xl mx-auto leading-relaxed">{t('about')}</p>
          </div>

          <div className="p-12 sm:p-20 space-y-20">
            <article className="max-w-3xl mx-auto space-y-16">
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Section 01</h3>
                <h2 className="text-3.5xl font-extrabold tracking-tight text-slate-850 font-display">Understanding Penicillin Allergy</h2>
                <div className="h-1 w-12 bg-blue-600 rounded-full mb-6"></div>
                 <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-normal">
                   Many people believe they have a penicillin allergy, but research shows that over 90% of people with a &apos;penicillin allergy&apos; label can actually tolerate the medication safely after proper testing.
                 </p>
                 <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-normal">
                   Being falsely labeled as allergic to penicillin often leads to the use of broader-spectrum antibiotics, which can be more expensive and contribute to antibiotic resistance.
                 </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Section 02</h3>
                <h2 className="text-3.5xl font-extrabold tracking-tight text-slate-850 font-display">Our Research Mission</h2>
                <div className="h-1 w-12 bg-blue-600 rounded-full mb-6"></div>
                 <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-normal">
                   The PEN-PAL study is designed to evaluate effective ways of educating parents about their child&apos;s allergy label. By participating in this control group, you are helping us establish a baseline for current information standards.
                 </p>
              </section>

              <section className="bg-slate-50 p-10 sm:p-12 border-l-4 border-blue-600 rounded-r-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Next Steps</h4>
                <p className="text-slate-600 italic font-normal text-sm">
                   As a participant in the control group, please ensure you have reviewed the information above. Your primary role in this protocol is now complete.
                </p>
              </section>
            </article>

            <footer className="pt-12 border-t border-slate-150 flex flex-col items-center gap-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">&copy; {new Date().getFullYear()} PEN-PAL RESEARCH PROTOCOL</p>
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
