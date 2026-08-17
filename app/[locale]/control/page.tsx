import { getTranslations } from 'next-intl/server';
import { logout, validateAndConsumeToken } from '../intervention/actions';
import { 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  LogOut, 
  FileText,
  FileCheck2
} from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ControlSitePage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  if (token) {
    try {
      await validateAndConsumeToken(token, 'en');
    } catch {
      // Best-effort token consumption on landing
    }
  }

  const t = await getTranslations('Control');
  
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans p-4 sm:p-6 lg:p-8" role="main" aria-label="Control Group Portal">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Professional Header Navigation Bar */}
        <header className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-700 rounded-lg flex items-center justify-center shadow-xs" aria-hidden="true">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white font-mono flex items-center gap-2">
                PEN-PAL <span className="text-slate-500 font-normal" aria-hidden="true">|</span> <span className="text-slate-100 font-semibold">Control Group Portal</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="bg-slate-800 border border-slate-700 text-teal-300 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded">
                  Protocol Version 2.1
                </span>
                <span className="text-[11px] font-semibold text-slate-300">
                  Research Baseline Site
                </span>
              </div>
            </div>
          </div>

          <form action={logout}>
            <button 
              type="submit"
              aria-label="Exit study and logout"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-rose-900/50 hover:text-rose-200 border border-slate-700 text-slate-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-teal-300" aria-hidden="true" />
              Exit & Logout
            </button>
          </form>
        </header>

        {/* Hero Section Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 text-white space-y-4 shadow-xs">
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 text-teal-400 text-xs font-bold px-3 py-1 rounded-md font-mono">
            <BookOpen className="w-3.5 h-3.5" />
            Clinical Study Information
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            {t('title')}
          </h2>
          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            {t('about')}
          </p>

          {/* Quick Metrics Badges */}
          <div className="pt-2 flex flex-wrap gap-3">
            <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-3.5 py-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">Over 90% False Labeling Rate</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-3.5 py-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-slate-200">Standard Baseline Protocol</span>
            </div>
          </div>
        </div>

        {/* Section 1: Understanding Penicillin Allergy */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <span className="w-6 h-6 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-md flex items-center justify-center font-mono">
              01
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Understanding Penicillin Allergy Labels
            </h3>
          </div>

          <p className="text-slate-700 text-sm leading-relaxed">
            Many parents believe their child has a penicillin allergy, often due to a rash or reaction experienced during early childhood. However, extensive clinical research shows that <strong>over 90% of individuals labeled as penicillin-allergic can actually tolerate penicillin safely after formal evaluation.</strong>
          </p>

          {/* Key Facts List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <HelpCircle className="w-4 h-4 text-teal-700" />
                Childhood Viral Rashes
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Rashes occurring during viral infections are frequently mistaken for penicillin allergies when antibiotics were given at the same time.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                Waning Immunity Over Time
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Even true penicillin allergies wane over time: up to 80% of people lose sensitivity after 10 years without exposure.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Our Research Study Mission */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <span className="w-6 h-6 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-md flex items-center justify-center font-mono">
              02
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Research Study Mission & Control Group Role
            </h3>
          </div>

          <p className="text-slate-700 text-sm leading-relaxed">
            The <strong>PEN-PAL (Parents Engaged in Penicillin Allergies)</strong> study evaluates effective communication strategies to help parents understand penicillin allergy labels.
          </p>

          {/* 3 Core Highlight Cards */}
          <div className="space-y-3 pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shrink-0 font-bold text-xs">
                A
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Baseline Study Comparison</h4>
                <p className="text-slate-600 text-xs leading-relaxed mt-0.5">
                  As a participant in the control group, your participation establishes a standard baseline to measure how standard information impacts parental decision-making.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shrink-0 font-bold text-xs">
                B
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Avoiding Broader Spectrum Antibiotics</h4>
                <p className="text-slate-600 text-xs leading-relaxed mt-0.5">
                  Unverified allergy labels force doctors to prescribe broad-spectrum antibiotics, which can be more expensive, have more side effects, and contribute to drug-resistant bacteria.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shrink-0 font-bold text-xs">
                C
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Improving Pediatric Healthcare</h4>
                <p className="text-slate-600 text-xs leading-relaxed mt-0.5">
                  Re-evaluating unverified penicillin allergies allows children to safely receive first-line penicillin antibiotics when needed for future infections.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Completion & Next Steps */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-950">
                Participation Complete
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Thank you for reviewing the PEN-PAL Control Group research information.
              </p>
            </div>
          </div>

          <p className="text-emerald-900 text-xs leading-relaxed border-t border-emerald-200/80 pt-3">
            Your role in this research study protocol is now complete. You may log out of the platform or return home at any time.
          </p>

          <div className="pt-2 flex justify-end">
            <form action={logout}>
              <button 
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5 text-teal-400" />
                Finish & Logout
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-4 text-center border-t border-slate-200 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            &copy; {new Date().getFullYear()} PEN-PAL CLINICAL RESEARCH PROTOCOL • CONTROL GROUP PORTAL
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
            <span>Protocol ID: PENPAL-2026-CTL</span>
            <span>•</span>
            <span>IRB Approved</span>
          </div>
        </footer>

      </div>
    </main>
  );
}
