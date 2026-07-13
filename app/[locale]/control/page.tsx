import { useTranslations } from 'next-intl';
import { logout } from '../intervention/actions';

export default function ControlSitePage() {
  const t = useTranslations('Control');
  
  return (
    <div className="relative min-h-screen py-16 px-4 font-sans selection:bg-teal-600 selection:text-white overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-teal-300/10 rounded-full filter blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-indigo-300/15 rounded-full filter blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Professional Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white/80 backdrop-blur-md border border-slate-200/60 p-8 rounded-3xl shadow-xl gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
             <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 font-display">
               PEN-PAL <span className="text-teal-600 font-black">Control</span>
             </h1>
             <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
               <span className="bg-teal-50 border border-teal-100 text-teal-800 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
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
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
            >
              Exit & Logout →
            </button>
          </form>
        </header>

        <main className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-teal-800 to-indigo-900 text-white p-12 sm:p-20 text-center space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
             <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto font-display italic">{t('title')}</h2>
             <p className="text-teal-100/90 text-lg font-light max-w-2xl mx-auto leading-relaxed">{t('about')}</p>
          </div>

          <div className="p-12 sm:p-20 space-y-20">
            <article className="max-w-3xl mx-auto space-y-16">
              <section className="space-y-4">
                <h3 className="text-xs font-black text-teal-600 uppercase tracking-[0.3em]">Section 01</h3>
                <h2 className="text-3.5xl font-extrabold tracking-tight text-slate-800 font-display">Understanding Penicillin Allergy</h2>
                <div className="h-1 w-12 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full mb-6"></div>
                 <p className="text-slate-650 leading-relaxed text-base sm:text-lg font-light">
                   Many people believe they have a penicillin allergy, but research shows that over 90% of people with a &apos;penicillin allergy&apos; label can actually tolerate the medication safely after proper testing.
                 </p>
                <p className="text-slate-650 leading-relaxed text-base sm:text-lg font-light">
                  Being falsely labeled as allergic to penicillin often leads to the use of broader-spectrum antibiotics, which can be more expensive and contribute to antibiotic resistance.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-black text-teal-600 uppercase tracking-[0.3em]">Section 02</h3>
                <h2 className="text-3.5xl font-extrabold tracking-tight text-slate-800 font-display">Our Research Mission</h2>
                <div className="h-1 w-12 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full mb-6"></div>
                 <p className="text-slate-650 leading-relaxed text-base sm:text-lg font-light">
                   The PEN-PAL study is designed to evaluate effective ways of educating parents about their child&apos;s allergy label. By participating in this control group, you are helping us establish a baseline for current information standards.
                 </p>
              </section>

              <section className="bg-teal-50/30 p-10 sm:p-12 border-l-4 border-teal-500 rounded-r-2xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full filter blur-xl pointer-events-none"></div>
                <h4 className="text-xs font-black text-teal-850 uppercase tracking-widest">Next Steps</h4>
                <p className="text-slate-650 italic font-light text-sm sm:text-base">
                  As a participant in the control group, please ensure you have reviewed the information above. Your primary role in this protocol is now complete.
                </p>
              </section>
            </article>

            <footer className="pt-12 border-t border-slate-100 flex flex-col items-center gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">&copy; {new Date().getFullYear()} PEN-PAL RESEARCH PROTOCOL</p>
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
