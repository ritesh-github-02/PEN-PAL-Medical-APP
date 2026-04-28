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
  
  const [data, setData] = useState<{ answers: Record<string, any> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const progress = await loadQuestionnaireProgress(); 
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

  const answers = data?.answers || {};
  const allergy = answers['q2_allergy'] || 'Not Specified';
  const symptoms = Array.isArray(answers['q3_symptoms']) 
    ? answers['q3_symptoms'].join(', ') 
    : answers['q3_symptoms'] || 'None reported';

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-zinc-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation / Header */}
        <div className="flex justify-between items-center no-print">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold uppercase tracking-widest text-zinc-400">{t('reportTitle')}</h1>
            <button 
              onClick={() => window.location.href = `/${locale}/intervention/flow?edit=true`}
              className="text-[10px] font-bold text-zinc-900 underline underline-offset-4 uppercase tracking-widest hover:text-zinc-500 transition-colors"
            >
              {t('editAnswers')}
            </button>
          </div>
          <button 
            onClick={() => logout()}
            className="text-[10px] font-bold text-zinc-400 hover:text-red-600 uppercase tracking-widest transition-colors"
          >
            Exit
          </button>
        </div>

        {/* Report Card */}
        <div className="bg-white border border-zinc-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
          {/* Decorative Top Bar */}
          <div className="h-2 bg-zinc-900 w-full" />
          
          <div className="p-8 sm:p-16 space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-8 border-b border-zinc-100 pb-12">
              <div className="space-y-2">
                <h2 className="text-4xl font-light tracking-tight text-zinc-900 italic">PEN-PAL</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Patient Allergy Assessment</p>
              </div>
              <div className="text-right sm:text-right w-full sm:w-auto">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{t('dateGenerated')}</p>
                <p className="text-lg font-light text-zinc-900">
                  {new Date().toLocaleDateString('en-GB').split('/').join('-')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <section className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-900 border-l-2 border-zinc-900 pl-4">Identified Condition</h3>
                <div className="bg-zinc-50 p-8 border border-zinc-100">
                  <p className="text-sm text-zinc-500 uppercase tracking-widest font-medium mb-2">{t('primaryAllergy')}</p>
                  <p className="text-3xl font-light text-zinc-900">{allergy}</p>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-900 border-l-2 border-zinc-900 pl-4">Reported Symptoms</h3>
                <div className="bg-zinc-50 p-8 border border-zinc-100 min-h-[140px]">
                  <p className="text-sm text-zinc-500 uppercase tracking-widest font-medium mb-4">Historical Reactions</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(answers['q3_symptoms']) ? (
                      answers['q3_symptoms'].map((s: string) => (
                        <span key={s} className="px-3 py-1 bg-white border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                          {s}
                        </span>
                      ))
                    ) : (
                      <p className="text-zinc-900 font-light">{symptoms}</p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <section className="space-y-8 pt-8 border-t border-zinc-100">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-900">Details & Clinical Guidance</h3>
              <div className="prose prose-zinc max-w-none font-light text-zinc-600 leading-relaxed text-lg">
                <p>
                  Based on the responses provided, your child has a documented history of <strong>{allergy}</strong> allergy. 
                  The symptoms reported ({symptoms}) indicate a clinical profile that may require further evaluation by a specialist.
                </p>
                <p className="mt-4">
                  This report is part of the PEN-PAL research study and should be discussed with your pediatrician or an allergist. 
                  Early identification and proper management of allergies are critical for patient safety and quality of care.
                </p>
              </div>
            </section>

            <div className="bg-zinc-900 p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6 no-print">
               <div className="text-center sm:text-left">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">Next Step</p>
                  <p className="text-sm font-light">Complete the final system evaluation to finish the study.</p>
               </div>
               <button 
                  onClick={() => window.location.href = `/${locale}/intervention/survey`}
                  className="px-8 py-3 bg-white text-zinc-900 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
               >
                  {t('proceedToSurvey')} →
               </button>
            </div>
          </div>
          
          <div className="bg-zinc-50 px-8 py-6 border-t border-zinc-100 flex justify-between items-center no-print">
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-[0.2em]">Allergy Report v1.0</p>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-3 text-zinc-900 hover:text-zinc-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              <span className="text-xs font-bold uppercase tracking-widest">{t('downloadReport')}</span>
            </button>
          </div>
        </div>

        <style jsx global>{`
          @media print {
            @page {
              size: portrait;
              margin: 1cm;
            }
            .no-print {
              display: none !important;
            }
            body {
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
              font-size: 12pt;
            }
            .min-h-screen {
              min-height: auto !important;
              padding: 0 !important;
            }
            .max-w-4xl {
              max-width: 100% !important;
              margin: 0 !important;
            }
            /* Reduce spacing for print to fit one page */
            .p-8, .sm:p-16 {
              padding: 1.5rem !important;
            }
            .space-y-12 > * + * {
              margin-top: 1.5rem !important;
            }
            .space-y-24 > * + * {
              margin-top: 2rem !important;
            }
            .gap-16 {
              gap: 2rem !important;
            }
            .pb-12 {
              padding-bottom: 1.5rem !important;
            }
            .pt-8 {
              padding-top: 1rem !important;
            }
            .mb-12 {
              margin-bottom: 1rem !important;
            }
            h2 {
              font-size: 2rem !important;
            }
            h3 {
              font-size: 1rem !important;
            }
            p, span {
              font-size: 10pt !important;
            }
            .text-3xl {
              font-size: 1.5rem !important;
            }
            .text-4xl {
              font-size: 2rem !important;
            }
            /* Ensure the card doesn't have borders/shadows that might cause issues */
            .print\:border-none {
              border: none !important;
            }
            .print\:shadow-none {
              box-shadow: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
