'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { loadQuestionnaireProgress } from '@/components/questionnaire/actions';
import { formatAssessmentData } from '@/lib/format-assessment';
import { generateAssessmentPDF } from '@/lib/generate-pdf';
import Loader from '@/components/common/Loader';
import { logout } from '../actions';
import { Printer, Download, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

export default function ReportPage() {
  const t = useTranslations('Intervention');
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const isSpanish = locale === 'es';
  
  const [data, setData] = useState<{ 
    answers: Record<string, any>; 
    participantId?: string | null;
    tokenDisplay?: string | null;
    bindingError?: string 
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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

  const handleDownloadPDF = () => {
    if (!data?.answers || downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      generateAssessmentPDF({
        locale,
        answers: data.answers,
        participantId: data.participantId || data.tokenDisplay || 'Participant',
        symptoms: formatted.symptoms,
        age: formatted.age,
        onset: formatted.onset,
        medicalCare: formatted.medicalCare,
        resolution: formatted.resolution,
        repeatUse: formatted.repeatUse,
        summarySections: formatted.summaryTableRows.map((r, i) => ({
          id: `row-${i}`,
          label: r.label,
          value: r.value,
        })),
        steps: [
          isSpanish
            ? 'Hable con el médico de su hijo sobre la alergia en su próxima visita.'
            : "Talk to your child's doctor about the allergy at their next visit.",
          isSpanish
            ? 'Comparta fotos de la reacción de su hijo con el médico.'
            : "Share pictures of your child's reaction with the doctor.",
          isSpanish
            ? `Entregue la siguiente tabla al médico de su hijo. Esto describe lo que ocurrió cuando su hijo tomó ${formatted.medicationName}.`
            : `Give the table below to your child's doctor. This says what happened when your child took ${formatted.medicationName}.`,
        ],
      });
    } catch (e) {
      console.error('Error downloading PDF:', e);
    } finally {
      setDownloadingPdf(false);
    }
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
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {isSpanish ? 'Sesión No Disponible' : 'Session Unavailable'}
          </h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {isSpanish
              ? 'Esta sesión está vinculada a otro dispositivo o red. Por favor solicite un nuevo token.'
              : 'This session is linked to a different device or network and can no longer be used here. Please request a new access token to continue.'}
          </p>
          <button
            onClick={() => { window.location.href = `/${locale}/intervention`; }}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition shadow-sm active:scale-[0.98]"
          >
            {isSpanish ? 'Solicitar Nuevo Token' : 'Request New Token'}
          </button>
        </div>
      </div>
    );
  }

  const answers = data?.answers || {};
  const formatted = formatAssessmentData(answers, isSpanish);

  return (
    <main className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800" role="main" aria-label="Clinical Allergy Assessment Report">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Navigation / Header */}
        <header className="flex justify-between items-center no-print">
          <div className="flex items-center gap-4">
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {isSpanish ? 'Resumen del Estudio PEN-PAL' : t('reportTitle')}
            </h1>
            <button 
              type="button"
              onClick={() => window.location.href = `/${locale}/intervention/flow?edit=true`}
              aria-label={isSpanish ? 'Editar respuestas anteriores' : 'Edit previous questionnaire answers'}
              className="text-xs font-bold text-[#1d5c64] underline underline-offset-4 uppercase tracking-wider hover:text-[#143e44] transition-colors cursor-pointer"
            >
              {isSpanish ? 'Editar Respuestas' : t('editAnswers')}
            </button>
          </div>
          <button 
            type="button"
            onClick={() => logout()}
            aria-label="Exit report and logout"
            className="text-xs font-bold text-slate-600 hover:text-red-700 uppercase tracking-wider transition-colors cursor-pointer"
          >
            {isSpanish ? 'Salir' : 'Exit'}
          </button>
        </header>

        {/* Report Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden print:border-none print:shadow-none">
          {/* Decorative Top Bar */}
          <div className="h-2 bg-[#1d5c64] w-full" aria-hidden="true" />
          
          <div className="p-6 sm:p-10 space-y-8">
            {/* Clinical Brand & Date */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#1d5c64]" aria-hidden="true" />
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">PEN-PAL</h2>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-600">
                  {isSpanish ? 'Evaluación de Alergia a la Penicilina en Pediatría' : 'Pediatric Penicillin Allergy Evaluation'}
                </p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {isSpanish ? 'Fecha Generada' : t('dateGenerated')}
                </p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {new Date().toLocaleDateString(isSpanish ? 'es-US' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {data?.tokenDisplay && (
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">ID: {data.tokenDisplay}</p>
                )}
              </div>
            </div>

            {/* Primary Medication Banner */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  {isSpanish ? 'Medicamento Informado' : 'Reported Medication / Suspected Allergy'}
                </p>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  {formatted.medicationName}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-full shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isSpanish ? 'Estudio Clínico Activo' : 'PEN-PAL Clinical Study'}</span>
              </div>
            </div>

            {/* 6-Card Clinical Evaluation Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1d5c64]" />
                <span>{isSpanish ? 'Resultados de la Evaluación de la Reacción' : 'Reaction Evaluation Results'}</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Symptoms */}
                <div className="bg-slate-50/80 p-5 border border-slate-200/80 rounded-xl space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {isSpanish ? '1. Síntomas de la Reacción' : "1. Symptoms of Child's Reaction"}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {formatted.symptoms}
                  </p>
                </div>

                {/* 2. Age Cohort */}
                <div className="bg-slate-50/80 p-5 border border-slate-200/80 rounded-xl space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {isSpanish ? '2. Edad al Momento de la Reacción' : '2. Age at Time of Reaction'}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {formatted.age}
                  </p>
                </div>

                {/* 3. Onset Timing */}
                <div className="bg-slate-50/80 p-5 border border-slate-200/80 rounded-xl space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {isSpanish ? '3. Tiempo hasta el Inicio' : '3. Time to Onset of Symptoms'}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {formatted.onset}
                  </p>
                </div>

                {/* 4. Medical Care */}
                <div className="bg-slate-50/80 p-5 border border-slate-200/80 rounded-xl space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {isSpanish ? '4. Atención Médica Recibida' : '4. Medical Care Received'}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {formatted.medicalCare}
                  </p>
                </div>

                {/* 5. Resolution */}
                <div className="bg-slate-50/80 p-5 border border-slate-200/80 rounded-xl space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {isSpanish ? '5. Cómo Desapareció la Reacción' : '5. How Reaction Resolved'}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {formatted.resolution}
                  </p>
                </div>

                {/* 6. Repeat Use */}
                <div className="bg-slate-50/80 p-5 border border-slate-200/80 rounded-xl space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {isSpanish ? '6. Uso Repetido de Penicilina' : '6. Repeat Use of Penicillin'}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {formatted.repeatUse}
                  </p>
                </div>
              </div>
            </div>

            {/* Doctor Discussion Guide / Action Steps Callout */}
            <section className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 space-y-3" aria-label="Action Steps for Parents">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                {isSpanish ? 'Pasos a Seguir para los Padres con el Pediatra' : 'Action Steps for Parents with Pediatrician'}
              </h4>
              <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-800">1.</span>
                  <span>
                    {isSpanish
                      ? 'Hable con el médico de su hijo sobre la alergia en su próxima visita médica.'
                      : "Talk to your child's doctor about the allergy at their next visit."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-800">2.</span>
                  <span>
                    {isSpanish
                      ? 'Comparta fotos o detalles de la reacción con el médico.'
                      : "Share pictures or details of your child's reaction with the doctor."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-800">3.</span>
                  <span>
                    {isSpanish
                      ? `Entregue este resumen al médico. Describe lo que ocurrió cuando su hijo tomó ${formatted.medicationName}.`
                      : `Give this report to your child's doctor. It describes what happened when your child took ${formatted.medicationName}.`}
                  </span>
                </li>
              </ul>
              <div className="pt-2 border-t border-amber-200/60">
                <p className="text-xs font-bold text-slate-800">
                  {isSpanish ? 'Qué puede decir: ' : 'What you can say: '}
                  <span className="italic font-normal text-slate-700">
                    {isSpanish
                      ? '«Leí sobre las alergias a la penicilina en niños. ¿Podríamos hablar sobre verificar si mi hijo realmente tiene una alergia?»'
                      : '“I read about penicillin allergies in kids. Could we talk about checking to see if my child really has an allergy?”'}
                  </span>
                </p>
              </div>
            </section>

            {/* Survey Next Step Banner */}
            <div className="bg-slate-900 p-6 rounded-xl text-white flex flex-col sm:flex-row justify-between items-center gap-4 no-print shadow-sm">
               <div className="text-center sm:text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-0.5">
                    {isSpanish ? 'Paso Siguiente' : 'Next Step'}
                  </p>
                  <p className="text-xs text-slate-200 font-normal">
                    {isSpanish
                      ? 'Complete la encuesta de evaluación del sistema para finalizar el estudio.'
                      : 'Complete the final system evaluation survey to finish the study.'}
                  </p>
               </div>
               <button 
                  type="button"
                  onClick={() => window.location.href = `/${locale}/intervention/survey`}
                  aria-label={isSpanish ? 'Continuar a la encuesta final' : 'Proceed to final usability survey'}
                  className="px-6 py-2.5 bg-white text-slate-900 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition rounded-lg shadow-sm active:scale-[0.98] cursor-pointer flex items-center gap-2"
               >
                  <span>{isSpanish ? 'Ir a la Encuesta' : t('proceedToSurvey')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
               </button>
            </div>
          </div>
          
          {/* Action Bar: Print & Download PDF */}
          <div className="bg-slate-50 px-6 sm:px-10 py-4 border-t border-slate-200/80 flex flex-wrap justify-between items-center gap-3 no-print">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">PEN-PAL Clinical Report</p>
            <div className="flex items-center gap-2.5">
              <button 
                type="button"
                onClick={handlePrint}
                aria-label={isSpanish ? 'Imprimir reporte clínico' : 'Print clinical report'}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isSpanish ? 'Imprimir' : 'Print'}</span>
              </button>

              <button 
                type="button"
                onClick={handleDownloadPDF}
                disabled={downloadingPdf}
                aria-label={isSpanish ? 'Descargar reporte PDF' : 'Download PDF report'}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1d5c64] hover:bg-[#143e44] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadingPdf ? (isSpanish ? 'Descargando...' : 'Downloading...') : (isSpanish ? 'Descargar PDF' : t('downloadReport'))}</span>
              </button>
            </div>
          </div>
        </div>

        <style jsx global>{`
          @media print {
            @page {
              size: letter portrait;
              margin: 12mm 15mm;
            }
            .no-print {
              display: none !important;
            }
            body {
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
              font-size: 10pt;
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
          }
        `}</style>
      </div>
    </main>
  );
}
