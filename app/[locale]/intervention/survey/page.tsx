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
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
        {/* Glow fields */}
        <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-teal-300/10 rounded-full filter blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] bg-indigo-300/10 rounded-full filter blur-[100px] pointer-events-none"></div>

        <div className="max-w-xl w-full bg-white/80 backdrop-blur-md border border-slate-200/60 p-12 sm:p-16 text-center shadow-2xl rounded-3xl relative z-10">
          <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-emerald-500 text-white flex items-center justify-center mx-auto mb-8 rounded-full text-3.5xl font-black shadow-lg shadow-teal-500/20">✓</div>
          <h2 className="text-4xl font-extrabold text-slate-800 mb-4 font-display tracking-tight leading-none">Success</h2>
          <p className="text-slate-500 leading-relaxed font-light mb-10 text-base sm:text-lg">
            {isEditMode ? 'Your responses have been updated.' : 'Your responses have been recorded.'} Thank you for participating in the PEN-PAL study.
          </p>
          
          <div className="space-y-4 pt-8 border-t border-slate-100">
            <button 
              onClick={() => logout()}
              className="w-full py-4.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-lg hover:shadow-slate-900/10 active:scale-[0.98] cursor-pointer"
            >
              Finish & Return Home
            </button>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Session will be cleared</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-teal-300/10 rounded-full filter blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-indigo-300/15 rounded-full filter blur-[120px] pointer-events-none animate-pulse"></div>

      {submitting && <Loader fullScreen />}
      
      <div className="max-w-4xl mx-auto w-full space-y-8 relative z-10">
        
        {/* Sticky Header */}
        <header className="sticky top-4 z-50 bg-white/80 backdrop-blur-md border border-slate-200/60 p-6 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl rounded-3xl">
          <div className="flex flex-col gap-2.5 w-full sm:w-auto">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
               <span>Study Progress {isEditMode && '(Editing)'}</span>
               <span>{answeredRequiredCount} / {allRequiredQuestions.length}</span>
            </div>
            <div className="w-full sm:w-64 h-1.5 bg-slate-100 overflow-hidden rounded-full">
               <div className="h-full bg-gradient-to-r from-teal-500 to-indigo-600 transition-all duration-700 ease-out rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="px-4 py-2 border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
          >
            Exit Study
          </button>
        </header>

        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-8 sm:p-16 space-y-16 shadow-2xl rounded-3xl">
          <div className="space-y-4 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-teal-700 to-indigo-850 bg-clip-text text-transparent font-display tracking-tight leading-tight">Final Evaluation</h1>
            <p className="text-slate-500 font-light leading-relaxed text-base sm:text-lg">Please help us improve the tool by providing your honest feedback. This takes less than 2 minutes.</p>
            {isEditMode && lastUpdated && (
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                Last updated: {new Date(lastUpdated).toLocaleDateString()} at {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-16" noValidate>
            {surveySections.map((section) => (
              <section key={section.id} className="space-y-10">
                <div className="border-b border-slate-100 pb-6">
                  <h2 className="text-xs font-black text-teal-600 uppercase tracking-widest mb-2">{section.title}</h2>
                  <p className="text-sm text-slate-400 font-light italic">{section.description}</p>
                </div>

                <div className="space-y-16">
                  {section.questions.map((q, index) => (
                    <div key={q.id} id={`question-${q.id}`} className="space-y-6 group">
                      <div className="flex gap-4 items-start">
                        <span className="text-3xl font-black text-indigo-200 font-display group-hover:text-teal-600 transition-colors duration-300 leading-none">0{index + 1}</span>
                        <div className="space-y-1">
                          <p className={`text-xl sm:text-2xl font-bold font-display tracking-tight leading-snug ${errors[q.id] ? 'text-red-600' : 'text-slate-800'}`}>
                            {q.text}
                            {q.required && <span className="text-teal-500 ml-2" aria-hidden="true">*</span>}
                          </p>
                          {errors[q.id] && <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Required field</p>}
                        </div>
                      </div>

                      {q.type === 'likert' && (
                        <div className="pt-2">
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
                                  <div className={`aspect-square sm:aspect-video flex items-center justify-center border rounded-2xl transition-all duration-300 ${
                                    isChecked 
                                      ? 'border-teal-500 bg-teal-55/80 text-teal-900 ring-4 ring-teal-500/10 scale-[1.03]' 
                                      : 'border-slate-100 bg-slate-50/50 text-slate-400 group-hover/label:border-teal-300 group-hover/label:bg-white group-hover/label:text-teal-700 hover:scale-[1.02]'
                                  }`}>
                                    <span className="text-lg font-bold font-display">{val}</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                          <div className="flex justify-between mt-4 px-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Strongly Disagree</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Strongly Agree</span>
                          </div>
                        </div>
                      )}

                      {q.type === 'text' && (
                        <div className="pt-2">
                          <textarea 
                            rows={5}
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswer(q.id, e.target.value)}
                            placeholder="Write your thoughts here..."
                            className={`w-full p-6 border rounded-2xl block font-light text-base text-slate-800 focus:outline-none transition-all bg-slate-50/50 focus:bg-white resize-none ${
                              errors[q.id] ? 'border-red-200 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))} 

            <div className="pt-10 flex flex-col items-center gap-6">
              {globalError && (
                <p className="text-red-650 text-xs font-black uppercase tracking-widest animate-pulse">{globalError}</p>
              )}
              <button 
                type="submit" 
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-lg hover:shadow-teal-600/15 active:scale-[0.98] cursor-pointer"
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
