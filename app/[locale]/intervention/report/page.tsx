'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { loadQuestionnaireProgress } from '@/components/questionnaire/actions';
import Loader from '@/components/common/Loader';
import { logout } from '../actions';

export default function ReportPage() {
  const t = useTranslations('Intervention');
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  
  const [data, setData] = useState<{ answers: Record<string, any>; bindingError?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const progress = await loadQuestionnaireProgress();

      if (progress.bindingError) {
        // IP fingerprint mismatch — the session is tied to a different device/network.
        // Show a re-auth prompt rather than rendering stale/incorrect data.
        setData({ answers: {}, bindingError: progress.bindingError });
        setLoading(false);
        return;
      }

      setData(progress);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print(); 
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  // IP-fingerprint mismatch on report page — cannot display stale/incorrect data
  if (data?.bindingError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="max-w-md w-full p-8 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
          <div className="w-12 h-12 bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-6 rounded-lg text-xl font-semibold text-amber-700">
            ⚑
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Session Unavailable</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            This session is linked to a different device or network and can no longer be used here.
            Please request a new access token to continue.
          </p>
          <button
            onClick={() => { window.location.href = `/${locale}/intervention`; }}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition shadow-sm active:scale-[0.98]"
          >
            Request New Token
          </button>
        </div>
      </div>
    );
  }

  const answers = data?.answers || {};
  const allergy = answers['q2_allergy'] || 'Not Specified';
  const symptoms = Array.isArray(answers['q3_symptoms']) 
    ? answers['q3_symptoms'].join(', ') 
    : answers['q3_symptoms'] || 'None reported';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation / Header */}
        <div className="flex justify-between items-center no-print">
          <div className="flex items-center gap-4">
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('reportTitle')}</h1>
            <button 
              onClick={() => window.location.href = `/${locale}/intervention/flow?edit=true`}
              className="text-xs font-bold text-blue-600 underline underline-offset-4 uppercase tracking-wider hover:text-blue-700 transition-colors"
            >
              {t('editAnswers')}
            </button>
          </div>
          <button 
            onClick={() => logout()}
            className="text-xs font-bold text-slate-400 hover:text-red-600 uppercase tracking-wider transition-colors"
          >
            Exit
          </button>
        </div>

        {/* Report Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none">
          {/* Decorative Top Bar */}
          <div className="h-1.5 bg-blue-600 w-full" />
          
          <div className="p-8 sm:p-12 space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tight text-slate-900">PEN-PAL</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Patient Allergy Assessment</p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('dateGenerated')}</p>
                <p className="text-base font-semibold text-slate-700 mt-1">
                  {new Date().toLocaleDateString('en-GB').split('/').join('-')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-l-2 border-blue-600 pl-3">Identified Condition</h3>
                <div className="bg-slate-50/50 p-6 border border-slate-200/80 rounded-lg">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('primaryAllergy')}</p>
                  <p className="text-2xl font-bold text-slate-900">{allergy}</p>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-l-2 border-blue-600 pl-3">Reported Symptoms</h3>
                <div className="bg-slate-50/50 p-6 border border-slate-200/80 rounded-lg min-h-[120px]">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Historical Reactions</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(answers['q3_symptoms']) ? (
                      answers['q3_symptoms'].map((s: string) => (
                        <span key={s} className="px-2.5 py-1 bg-white border border-slate-200 text-[11px] font-medium text-slate-700 rounded shadow-sm">
                          {s}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-600 text-sm font-medium">{symptoms}</p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <section className="space-y-4 pt-8 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Details & Clinical Guidance</h3>
              <div className="text-sm text-slate-600 leading-relaxed space-y-4">
                <p>
                  Based on the responses provided, your child has a documented history of <strong className="font-semibold text-slate-900">{allergy}</strong> allergy. 
                  The symptoms reported ({symptoms}) indicate a clinical profile that may require further evaluation by a specialist.
                </p>
                <p>
                  This report is part of the PEN-PAL research study and should be discussed with your pediatrician or an allergist. 
                  Early identification and proper management of allergies are critical for patient safety and quality of care.
                </p>
              </div>
            </section>

            <div className="bg-slate-900 p-6 rounded-lg text-white flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
               <div className="text-center sm:text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Next Step</p>
                  <p className="text-xs text-slate-300 font-normal">Complete the final system evaluation to finish the study.</p>
               </div>
               <button 
                  onClick={() => window.location.href = `/${locale}/intervention/survey`}
                  className="px-6 py-2.5 bg-white text-slate-900 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition rounded-md shadow-sm active:scale-[0.98]"
               >
                  {t('proceedToSurvey')} →
               </button>
            </div>
          </div>
          
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-200/80 flex justify-between items-center no-print">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Allergy Report v1.0</p>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              <span>{t('downloadReport')}</span>
            </button>
          </div>
        </div>

        <style jsx global>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 0.5cm;
            }
            .no-print {
              display: none !important;
            }
            body {
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
              font-size: 11pt;
            }
            .min-h-screen {
              min-height: auto !important;
              padding: 0 !important;
              background: white !important;
            }
            .max-w-4xl {
              max-width: 100% !important;
              margin: 0 !important;
            }
            /* Single page optimization - aggressive compression */
            .space-y-8 > * + * {
              margin-top: 0.75rem !important;
            }
            .p-8, .sm\:p-12 {
              padding: 1rem !important;
            }
            .space-y-10 > * + * {
              margin-top: 0.75rem !important;
            }
            .space-y-24 > * + * {
              margin-top: 1rem !important;
            }
            .gap-8 {
              gap: 1rem !important;
            }
            .pb-8 {
              padding-bottom: 0.75rem !important;
            }
            .pt-8 {
              padding-top: 0.75rem !important;
            }
            .mb-12 {
              margin-bottom: 0.5rem !important;
            }
            .mb-4 {
              margin-bottom: 0.25rem !important;
            }
            .mb-1 {
              margin-bottom: 0.125rem !important;
            }
            .mt-4 {
              margin-top: 0.25rem !important;
            }
            h2 {
              font-size: 1.5rem !important;
              margin: 0 !important;
            }
            h3 {
              font-size: 0.85rem !important;
              margin: 0 !important;
            }
            p, span {
              font-size: 9pt !important;
              line-height: 1.3 !important;
            }
            .text-3xl {
              font-size: 1.25rem !important;
            }
            .text-4xl {
              font-size: 1.5rem !important;
            }
            .text-lg {
              font-size: 0.95rem !important;
            }
            .text-sm {
              font-size: 0.8rem !important;
            }
            .text-xs {
              font-size: 0.7rem !important;
            }
            .text-\[10px\] {
              font-size: 0.7rem !important;
            }
            .min-h-\[120px\] {
              min-height: auto !important;
            }
            .border-b, .border-t {
              border-width: 0.5pt !important;
            }
            /* Ensure the card doesn't have borders/shadows that might cause issues */
            .print\:border-none {
              border: none !important;
            }
            .print\:shadow-none {
              box-shadow: none !important;
            }
            .shadow-sm {
              box-shadow: none !important;
            }
            /* Prevent page breaks in important sections */
            section {
              page-break-inside: avoid;
            }
            .grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
