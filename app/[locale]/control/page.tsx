import { useTranslations } from 'next-intl';
import { logout } from '../intervention/actions';

export default function ControlSitePage() {
  const t = useTranslations('Control');
  
  return (
    <div className="relative min-h-screen bg-zinc-50 py-16 px-4 font-sans selection:bg-zinc-900 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Professional Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white border border-zinc-200 p-8 shadow-sm gap-6">
          <div className="space-y-1">
             <h1 className="text-3xl font-light tracking-tight text-zinc-900 uppercase tracking-[0.2em]">PEN-PAL <span className="font-bold">Control</span></h1>
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Protocol Version 2.1 • Research Site</p>
          </div>
          <form action={logout}>
            <button 
              type="submit"
              className="px-8 py-3 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Exit & Logout →
            </button>
          </form>
        </header>

        <main className="bg-white border border-zinc-200 shadow-sm overflow-hidden">
          {/* Hero Section */}
          <div className="bg-zinc-900 text-white p-12 sm:p-20 text-center space-y-6">
             <h2 className="text-5xl font-light tracking-tight leading-tight max-w-3xl mx-auto italic">{t('title')}</h2>
             <p className="text-zinc-400 text-lg font-light max-w-2xl mx-auto leading-relaxed">{t('about')}</p>
          </div>

          <div className="p-12 sm:p-20 space-y-24">
            <article className="max-w-3xl mx-auto space-y-16">
              <section className="space-y-6">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.4em]">Section 01</h3>
                <h2 className="text-4xl font-light tracking-tight text-zinc-900">Understanding Penicillin Allergy</h2>
                <div className="h-1 w-12 bg-zinc-900"></div>
                <p className="text-zinc-600 leading-relaxed text-lg font-light">
                  Many people believe they have a penicillin allergy, but research shows that over 90% of people with a "penicillin allergy" label can actually tolerate the medication safely after proper testing.
                </p>
                <p className="text-zinc-600 leading-relaxed text-lg font-light">
                  Being falsely labeled as allergic to penicillin often leads to the use of broader-spectrum antibiotics, which can be more expensive and contribute to antibiotic resistance.
                </p>
              </section>

              <section className="space-y-6">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.4em]">Section 02</h3>
                <h2 className="text-4xl font-light tracking-tight text-zinc-900">Our Research Mission</h2>
                <div className="h-1 w-12 bg-zinc-900"></div>
                <p className="text-zinc-600 leading-relaxed text-lg font-light">
                  The PEN-PAL study is designed to evaluate effective ways of educating parents about their child's allergy label. By participating in this control group, you are helping us establish a baseline for current information standards.
                </p>
              </section>

              <section className="bg-zinc-50 p-10 sm:p-16 border-l-4 border-zinc-900 space-y-4">
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Next Steps</h4>
                <p className="text-zinc-500 italic font-light">
                  As a participant in the control group, please ensure you have reviewed the information above. Your primary role in this protocol is now complete.
                </p>
              </section>
            </article>

            <footer className="pt-12 border-t border-zinc-100 flex flex-col items-center gap-4">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">&copy; {new Date().getFullYear()} PEN-PAL RESEARCH PROTOCOL</p>
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
                <div className="w-2 h-2 rounded-full bg-zinc-900"></div>
                <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
