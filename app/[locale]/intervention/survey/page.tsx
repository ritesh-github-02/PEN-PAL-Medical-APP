'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { logout, getSurveyResponse } from '../actions';
import Loader from '@/components/common/Loader';

type QuestionType = 'likert' | 'text';

interface QuestionDef {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
}

interface SectionDef {
  id: string;
  title: string;
  description: string;
  questions: QuestionDef[];
}

export default function SurveyPage() {
  const t = useTranslations('Intervention');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const surveySections: SectionDef[] = [
    {
      id: 'evaluation',
      title: 'Final Evaluation',
      description: 'Please help us improve by answering these 3 quick questions.',
      questions: [
        { id: 'sus_3', type: 'likert', required: true, text: "I thought the system was easy to use." },
        { id: 'edu_2', type: 'likert', required: true, text: "I feel more informed about allergies after using this tool." },
        { id: 'feedback_1', type: 'text', required: false, text: "Do you have any final comments or suggestions for us? (Optional)" }
      ]
    }
  ];

  // Load existing survey data on mount
  useEffect(() => {
    const loadSurveyData = async () => {
      try {
        const result = await getSurveyResponse();
        if (result.error) {
          console.error('Survey load error:', result.error);
          setGlobalError(result.error);
        } else if (result.data) {
          setAnswers(result.data.answers);
          setIsEditMode(true);
          setLastUpdated(new Date(result.data.updatedAt));
        }
      } catch (error) {
        console.error('Error loading survey:', error);
        setGlobalError('Failed to load survey data');
      } finally {
        setLoading(false);
      }
    };

    loadSurveyData();
  }, []);

  const allRequiredQuestions = surveySections.flatMap(s => s.questions.filter(q => q.required));
  const answeredRequiredCount = allRequiredQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== '').length;
  const progressPercent = Math.round((answeredRequiredCount / allRequiredQuestions.length) * 100);

  const handleAnswer = (id: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
    if (globalError) setGlobalError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasErrors = false;
    const newErrors: Record<string, string> = {};
    
    surveySections.forEach(section => {
      section.questions.forEach(q => {
        if (q.required) {
          const val = answers[q.id];
          if (val === undefined || val === '') {
            hasErrors = true;
            newErrors[q.id] = "Required";
          }
        }
      });
    });

    if (hasErrors) {
      setErrors(newErrors);
      setGlobalError(`Please complete all required fields.`);
      const firstErrorId = Object.keys(newErrors)[0];
      const el = document.getElementById(`question-${firstErrorId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers,
          surveyType: 'FINAL_EVALUATION'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit survey');
      }

      setSubmitted(true);
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : 'An error occurred while submitting the survey');
      console.error('Survey submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900/5 backdrop-blur-md flex items-center justify-center p-6">
        <Loader />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans bg-slate-50">
        <div className="max-w-xl w-full bg-white border border-slate-200 p-8 sm:p-12 text-center shadow-sm rounded-2xl">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-6 rounded-full text-2xl font-bold shadow-sm">✓</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Success</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-8">
            {isEditMode ? 'Your responses have been updated.' : 'Your responses have been recorded.'} Thank you for participating in the PEN-PAL study.
          </p>
          
          <div className="space-y-4 pt-8 border-t border-slate-100">
            <button 
              onClick={() => logout()}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-sm active:scale-[0.98] cursor-pointer"
            >
              Finish & Return Home
            </button>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Session will be cleared</p>
          </div>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800 bg-slate-50">
      {submitting && <Loader fullScreen />}
      
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        {/* Sticky Header */}
        <header className="sticky top-4 z-50 bg-white border border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm rounded-xl">
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
               <span>Study Progress {isEditMode && '(Editing)'}</span>
               <span>{answeredRequiredCount} / {allRequiredQuestions.length}</span>
            </div>
            <div className="w-full sm:w-64 h-1.5 bg-slate-100 overflow-hidden rounded-full">
               <div className="h-full bg-blue-600 transition-all duration-700 ease-out rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="px-4 py-2 border border-slate-200 text-slate-400 hover:text-red-655 hover:border-red-100 rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
          >
            Exit Study
          </button>
        </header>

        <div className="bg-white border border-slate-200 p-6 sm:p-8 space-y-8 shadow-sm rounded-2xl">
          <div className="space-y-3 text-center max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">Final Evaluation</h1>
            <p className="text-sm text-slate-500 leading-relaxed">Please help us improve the tool by providing your honest feedback. This takes less than 2 minutes.</p>
            {isEditMode && lastUpdated && (
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Last updated: {new Date(lastUpdated).toLocaleDateString()} at {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {surveySections.map((section) => (
              <section key={section.id} className="space-y-6">
                <div className="border-b border-slate-200/60 pb-3">
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">{section.title}</h2>
                  <p className="text-xs text-slate-455 italic font-normal">{section.description}</p>
                </div>

                <div className="space-y-8">
                  {section.questions.map((q, index) => (
                    <div key={q.id} id={`question-${q.id}`} className="space-y-3 group">
                      <div className="flex gap-3 items-start">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>
                        <div className="space-y-1">
                          <p className={`text-base font-bold tracking-tight leading-relaxed ${errors[q.id] ? 'text-red-655' : 'text-slate-900'}`}>
                            {q.text}
                            {q.required && <span className="text-blue-600 ml-2" aria-hidden="true">*</span>}
                          </p>
                          {errors[q.id] && <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Required field</p>}
                        </div>
                      </div>

                      {q.type === 'likert' && (
                        <div className="pt-1">
                          <div className="grid grid-cols-5 gap-2 sm:gap-4">
                            {[1, 2, 3, 4, 5].map(val => {
                              const isChecked = answers[q.id] === val;
                              return (
                                <label key={val} className="cursor-pointer group/label">
                                  <input 
                                    type="radio" 
                                    name={q.id} 
                                    value={val} 
                                    checked={isChecked}
                                    onChange={() => handleAnswer(q.id, val)}
                                    className="sr-only" 
                                  />
                                  <div className={`h-10 sm:h-12 w-full flex items-center justify-center border rounded-lg transition-all duration-200 ${
                                    isChecked 
                                      ? 'border-blue-600 bg-blue-50 text-blue-955 font-extrabold shadow-sm ring-4 ring-blue-600/10 scale-[1.01]' 
                                      : 'border-slate-200 bg-slate-50 text-slate-500 group-hover/label:border-blue-400 group-hover/label:bg-white group-hover/label:text-blue-700 hover:scale-[1.005]'
                                  }`}>
                                    <span className="text-base font-bold font-display">{val}</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                          <div className="flex justify-between mt-2.5 px-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Strongly Disagree</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Strongly Agree</span>
                          </div>
                        </div>
                      )}

                      {q.type === 'text' && (
                        <div className="pt-1">
                          <textarea 
                            rows={3}
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswer(q.id, e.target.value)}
                            placeholder="Write your thoughts here..."
                            className={`w-full p-4 border rounded-xl block text-sm text-slate-800 focus:outline-none transition-all bg-slate-50 focus:bg-white resize-none ${
                              errors[q.id] ? 'border-red-300 focus:border-red-555 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))} 

            <div className="pt-6 flex flex-col items-center gap-4">
              {globalError && (
                <p className="text-red-600 text-xs font-bold uppercase tracking-wider animate-pulse">{globalError}</p>
              )}
              <button 
                type="submit" 
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition shadow-sm active:scale-[0.98] cursor-pointer"
              >
                {isEditMode ? 'Update & Complete Study →' : 'Submit & Complete Study →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
