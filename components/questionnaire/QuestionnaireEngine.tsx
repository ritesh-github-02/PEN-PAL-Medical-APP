'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { questionnaireConfig, QuestionnaireStep } from '@/config/questionnaire';
import { logInteraction } from '@/lib/tracking';
import { submitAnswer, completeQuestionnaire, loadQuestionnaireProgress } from './actions';
import Loader from '@/components/common/Loader';
import AudioPlayer from './AudioPlayer';

export default function QuestionnaireEngine() {
  const t = useTranslations('Intervention');
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  const currentStep = questionnaireConfig[currentStepIndex];

  useEffect(() => {
    async function init() {
      let progress = await loadQuestionnaireProgress();
      
      // Fallback for preview environment via localStorage
      let localAnswers = false;
      if (!progress.lastStepId) {
        try {
          const cached = localStorage.getItem('penpal_progress');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Object.keys(parsed).length > 0) {
              progress.answers = parsed;
              localAnswers = true;
            }
          }
        } catch (e) {}
      }

      setAnswers(progress.answers || {});
      
      let targetIndex = 0;
      const searchParams = new URLSearchParams(window.location.search);
      const isEditMode = searchParams.get('edit') === 'true';

      if (isEditMode) {
        targetIndex = 0;
      }
      // If Server identified the step, use it directly
      else if (progress.lastStepId && !localAnswers) {
        const found = questionnaireConfig.findIndex(s => s.id === progress.lastStepId);
        if (found !== -1) targetIndex = found;
      } 
      // Else re-simulate if we grabbed from local storage
      else if (Object.keys(progress.answers || {}).length > 0) {
        let index = 0;
        let visitedIds = new Set<string>();
        
        while (index >= 0 && index < questionnaireConfig.length) {
          const step = questionnaireConfig[index];
          if (visitedIds.has(step.id)) break;
          visitedIds.add(step.id);
          
          const ans = (progress.answers || {})[step.id];
          
          if (ans === undefined || ans === null || (Array.isArray(ans) && ans.length === 0 && step.required)) {
            targetIndex = index;
            break;
          }
          
          let nextId = step.nextStepId;
          if (step.branchLogic && ans !== undefined) {
             const match = step.branchLogic.find(b => b.value === String(ans));
             if (match) nextId = match.targetStepId;
          }
          
          if (!nextId) {
             targetIndex = index;
             break;
          }
          
          const nextIdx = questionnaireConfig.findIndex(s => s.id === nextId);
          if (nextIdx === -1) {
             targetIndex = index;
             break;
          }
          index = nextIdx;
        }
      }
      
      setCurrentStepIndex(targetIndex);
      setInitialized(true);
    }
    
    init();
  }, []);

  useEffect(() => {
    // Log page/step view
    if (currentStep && initialized) {
      logInteraction('QUESTION_VIEW', { stepId: currentStep.id }, `/intervention/flow`)
        .catch(e => console.warn('Silently caught tracking error:', e));
    }
  }, [currentStepIndex, currentStep, initialized]);

  const handleNext = async () => {
    if (!currentStep) return;

    setLoading(true);
    const answer = answers[currentStep.id];
    
    // Server action to save answer
    const answerPayload = typeof answer === 'object' ? JSON.stringify(answer) : String(answer);
    
    try {
      await submitAnswer(currentStep.id, answerPayload);
      await logInteraction('QUESTION_ANSWER', { stepId: currentStep.id, answer }, `/intervention/flow`);
    } catch (e) {
      console.warn("Server sync failed, continuing locally.", e);
    }

    // Local fallback save 
    try {
      localStorage.setItem('penpal_progress', JSON.stringify(answers));
    } catch(e) {}

    if (currentStep.isTerminal) {
      try {
        await completeQuestionnaire();
        // Clear local cache on successful completion
        localStorage.removeItem('penpal_progress');
      } catch (e) {
        console.warn("Complete sync failed, continuing.", e);
      }
      // Wait for complete hook or redirect
      window.location.href = `/${locale}/intervention/report`;
      return;
    }

    // Determine branching
    let nextId = currentStep.nextStepId;
    if (currentStep.branchLogic && answer !== undefined) {
      const match = currentStep.branchLogic.find(b => b.value === String(answer));
      if (match) {
        nextId = match.targetStepId;
      }
    }

    if (nextId) {
      const nextIndex = questionnaireConfig.findIndex(s => s.id === nextId);
      if (nextIndex !== -1) {
        setCurrentStepIndex(nextIndex);
      }
    }
    
    setLoading(false);
  };

  const setAnswerLocal = (val: any) => {
    setAnswers({ ...answers, [currentStep.id]: val });
  };

  if (!initialized || !currentStep) return (
    <div className="bg-white border border-zinc-200 min-h-[400px] flex items-center justify-center">
      <Loader />
    </div>
  );

  const currentAnswer = answers[currentStep.id];
  const isNextDisabled = currentStep.required && (currentAnswer === undefined || currentAnswer === '' || (Array.isArray(currentAnswer) && currentAnswer.length === 0));

  return (
    <div className="bg-white border border-zinc-200 p-10 sm:p-16 relative overflow-hidden">
      {/* Premium Loader Overlay for transitions */}
      {loading && <Loader fullScreen />}
      <div className="mb-16">
        <h2 className="text-3xl sm:text-4xl font-light text-zinc-900 tracking-tight">
          {locale === 'es' && currentStep.titleEs ? currentStep.titleEs : currentStep.titleEn}
        </h2>
        
        {((locale === 'es' ? currentStep.descriptionEs : currentStep.descriptionEn)) && (
          <p className="mt-6 text-zinc-500 leading-relaxed font-light text-lg">
            {locale === 'es' ? currentStep.descriptionEs : currentStep.descriptionEn}
          </p>
        )}
      </div>

      {/* Always render AudioPlayer, it will use TTS if no audioSrc exists */}
      <AudioPlayer 
        textToSpeak={locale === 'es' ? currentStep.titleEs : currentStep.titleEn}
        audioSrc={locale === 'es' ? currentStep.audioEs : currentStep.audioEn} 
        stepId={currentStep.id} 
        locale={locale} 
      />

      <div className="space-y-4 mb-20 md:max-w-2xl">
        {currentStep.type === 'boolean' && (
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setAnswerLocal(true)}
              className={`flex-1 py-5 px-6 border transition-colors text-left sm:text-center ${currentAnswer === true ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 hover:border-zinc-400 text-zinc-900 bg-white'}`}
            >
              <span className="font-medium tracking-wide uppercase text-sm">{locale === 'es' ? 'Sí' : 'Yes'}</span>
            </button>
            <button 
              onClick={() => setAnswerLocal(false)}
              className={`flex-1 py-5 px-6 border transition-colors text-left sm:text-center ${currentAnswer === false ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 hover:border-zinc-400 text-zinc-900 bg-white'}`}
            >
              <span className="font-medium tracking-wide uppercase text-sm">{locale === 'es' ? 'No' : 'No'}</span>
            </button>
          </div>
        )}

        {currentStep.type === 'single_choice' && currentStep.options?.map(opt => (
          <label key={opt.value} className={`block p-6 border cursor-pointer transition-colors ${currentAnswer === opt.value ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400 bg-white'}`}>
            <div className="flex items-center">
              <input 
                type="radio" 
                name={currentStep.id} 
                value={opt.value}
                onChange={() => setAnswerLocal(opt.value)}
                className="mr-5 text-zinc-900 focus:ring-zinc-900 w-5 h-5 border-zinc-300"
                checked={currentAnswer === opt.value}
              />
              <span className={`text-lg font-light ${currentAnswer === opt.value ? 'text-zinc-900 font-medium' : 'text-zinc-700'}`}>{locale === 'es' ? opt.labelEs : opt.labelEn}</span>
            </div>
          </label>
        ))}
        
        {currentStep.type === 'multiple_choice' && currentStep.options?.map(opt => (
          <label key={opt.value} className={`block p-6 border cursor-pointer transition-colors ${Array.isArray(currentAnswer) && currentAnswer.includes(opt.value) ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400 bg-white'}`}>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                value={opt.value}
                onChange={(e) => {
                  const checked = e.target.checked;
                  let current = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
                  if (checked) current.push(opt.value);
                  else current = current.filter(c => c !== opt.value);
                  setAnswerLocal(current);
                }}
                className="mr-5 text-zinc-900 rounded-none focus:ring-zinc-900 w-5 h-5 border-zinc-300"
                checked={Array.isArray(currentAnswer) && currentAnswer.includes(opt.value)}
              />
              <span className={`text-lg font-light ${Array.isArray(currentAnswer) && currentAnswer.includes(opt.value) ? 'text-zinc-900 font-medium' : 'text-zinc-700'}`}>{locale === 'es' ? opt.labelEs : opt.labelEn}</span>
            </div>
          </label>
        ))}

        {currentStep.type === 'likert' && (
          <div className="flex flex-col gap-4">
             {currentStep.options?.map(opt => (
              <label key={opt.value} className={`block p-6 border cursor-pointer transition-colors ${currentAnswer === opt.value ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400 bg-white'}`}>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    name={currentStep.id} 
                    value={opt.value}
                    onChange={() => setAnswerLocal(opt.value)}
                    className="mr-5 text-zinc-900 focus:ring-zinc-900 w-5 h-5 border-zinc-300"
                    checked={currentAnswer === opt.value}
                  />
                  <span className={`text-lg font-light ${currentAnswer === opt.value ? 'text-zinc-900 font-medium' : 'text-zinc-700'}`}>{locale === 'es' ? opt.labelEs : opt.labelEn}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center pt-8 border-t border-zinc-100 gap-6 sm:gap-0">
        <button 
           className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 disabled:opacity-0 transition-colors"
           disabled={currentStepIndex === 0 || loading}
           onClick={() => setCurrentStepIndex(state => Math.max(0, state - 1))}
        >
          ← {t('back')}
        </button>

        <button 
          onClick={handleNext} 
          disabled={isNextDisabled || loading}
          className={`px-12 py-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center ${isNextDisabled ? 'bg-zinc-100 text-zinc-400 border border-zinc-100 cursor-not-allowed' : 'bg-zinc-900 text-white border border-zinc-900 hover:bg-zinc-800'}`}
        >
          {loading ? '...' : (currentStep.isTerminal ? t('submit') : t('next'))}
        </button>
      </div>
    </div>
  );
}
