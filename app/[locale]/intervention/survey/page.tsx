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
        if (result.data) {
          setAnswers(result.data.answers);
          setIsEditMode(true);
          setLastUpdated(new Date(result.data.updatedAt));
        }
      } catch (error) {
        console.error('Error loading survey:', error);
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
      // Submit survey responses to API
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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <Loader />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-xl w-full bg-white border border-zinc-200 p-12 sm:p-20 text-center shadow-sm">
          <div className="w-20 h-20 bg-zinc-900 text-white flex items-center justify-center mx-auto mb-10 rounded-full text-3xl font-light">✓</div>
          <h2 className="text-4xl font-light text-zinc-900 mb-6 tracking-tight italic">Success</h2>
          <p className="text-zinc-500 leading-relaxed font-light mb-12 text-lg">
            {isEditMode ? 'Your responses have been updated.' : 'Your responses have been recorded.'} Thank you for participating in the PEN-PAL study.
          </p>
          
          <div className="space-y-4 pt-10 border-t border-zinc-100">
            <button 
              onClick={() => logout()}
              className="w-full py-5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all"
            >
              Finish & Return Home
            </button>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">Session will be cleared</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-zinc-900 relative">
      {submitting && <Loader fullScreen />}
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Sticky Header */}
        <header className="sticky top-4 z-50 bg-white/80 backdrop-blur-md border border-zinc-200 p-6 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm">
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
               <span>Study Progress {isEditMode && '(Editing)'}</span>
               <span>{answeredRequiredCount} / {allRequiredQuestions.length}</span>
            </div>
            <div className="w-full sm:w-64 h-1 bg-zinc-100 overflow-hidden">
               <div className="h-full bg-zinc-900 transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="text-[10px] font-bold text-zinc-400 hover:text-red-600 uppercase tracking-widest transition-colors"
          >
            Exit Study
          </button>
        </header>

        <div className="bg-white border border-zinc-200 p-8 sm:p-16 space-y-24 shadow-sm">
          <div className="space-y-6 text-center max-w-2xl mx-auto">
            <h1 className="text-5xl font-light tracking-tight italic">Final Evaluation</h1>
            <p className="text-zinc-500 font-light leading-relaxed">Please help us improve the tool by providing your honest feedback. This takes less than 2 minutes.</p>
            {isEditMode && lastUpdated && (
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">
                Last updated: {new Date(lastUpdated).toLocaleDateString()} at {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-32" noValidate>
            {surveySections.map((section) => (
              <section key={section.id} className="space-y-16">
                <div className="border-b border-zinc-100 pb-8">
                  <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-[0.3em] mb-4">{section.title}</h2>
                  <p className="text-sm text-zinc-400 font-light italic">{section.description}</p>
                </div>

                <div className="space-y-24">
                  {section.questions.map((q, index) => (
                    <div key={q.id} id={`question-${q.id}`} className="space-y-10 group">
                      <div className="flex gap-6">
                        <span className="text-3xl font-light text-zinc-200 group-hover:text-zinc-900 transition-colors duration-500 italic">0{index + 1}</span>
                        <div className="space-y-2">
                          <p className={`text-2xl font-light leading-tight tracking-tight ${errors[q.id] ? 'text-red-600' : 'text-zinc-900'}`}>
                            {q.text}
                            {q.required && <span className="text-zinc-300 ml-2" aria-hidden="true">*</span>}
                          </p>
                          {errors[q.id] && <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Required field</p>}
                        </div>
                      </div>

                      {q.type === 'likert' && (
                        <div className="pt-4">
                          <div className="grid grid-cols-5 gap-2 sm:gap-4 relative">
                            {[1, 2, 3, 4, 5].map(val => (
                              <label key={val} className="cursor-pointer group/label">
                                <input 
                                  type="radio" 
                                  name={q.id} 
                                  value={val} 
                                  checked={answers[q.id] === val}
                                  onChange={() => handleAnswer(q.id, val)}
                                  className="sr-only" 
                                />
                                <div className={`aspect-square sm:aspect-video flex items-center justify-center border-2 transition-all duration-300 ${
                                  answers[q.id] === val 
                                    ? 'border-zinc-900 bg-zinc-900 text-white' 
                                    : 'border-zinc-100 bg-zinc-50/50 text-zinc-300 group-hover/label:border-zinc-300 group-hover/label:bg-white group-hover/label:text-zinc-900'
                                }`}>
                                  <span className="text-lg font-medium">{val}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                          <div className="flex justify-between mt-4 px-1">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Strongly Disagree</span>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Strongly Agree</span>
                          </div>
                        </div>
                      )}

                      {q.type === 'text' && (
                        <div className="pt-4">
                          <textarea 
                            rows={5}
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswer(q.id, e.target.value)}
                            placeholder="Write your thoughts here..."
                            className={`w-full p-8 border block font-light text-lg text-zinc-900 focus:outline-none transition-all bg-zinc-50 focus:bg-white resize-none ${errors[q.id] ? 'border-red-200' : 'border-zinc-100 focus:border-zinc-900'}`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))} 

            <div className="pt-16 flex flex-col items-center gap-8">
              {globalError && (
                <p className="text-red-600 text-xs font-bold uppercase tracking-widest animate-pulse">{globalError}</p>
              )}
              <button 
                type="submit" 
                className="w-full py-6 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-[0.3em] transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]"
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
