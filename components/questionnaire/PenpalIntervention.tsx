"use client";

import React, { useState, useEffect, memo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { questionnaireConfig, QuestionnaireStep } from "@/config/questionnaire";
import { logInteraction } from "@/lib/tracking";
import {
  submitAnswer,
  completeQuestionnaire,
  loadQuestionnaireProgress,
} from "./actions";
import Loader from "@/components/common/Loader";
import AudioPlayer from "./AudioPlayer";

// ============ Types ============
interface BaseScreenProps {
  title: string;
  content?: string;
  description?: string;
  onNext: (explicitAnswer?: any) => void;
  onBack: () => void;
  loading: boolean;
  t: any;
  isFirstStep: boolean;
  locale?: string;
}

export default function PenpalIntervention() {
  const t = useTranslations("Intervention");
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "en";

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [bindingError, setBindingError] = useState<string | null>(null);

  const currentStep = questionnaireConfig[currentStepIndex];

  useEffect(() => {
    async function init() {
      let progress = await loadQuestionnaireProgress();
      let localAnswers = false;

      // ── IP-fingerprint binding failure ────────────────────────────────────────
      // The session's IP fingerprint (captured at first token validation) does
      // not match the current request.  Treat this as a hard auth failure — the
      // link may have been forwarded to an unauthorised device.
      if (progress.bindingError) {
        setBindingError(progress.bindingError);
        setInitialized(true);
        return;
      }

      if (!progress.lastStepId) {
        try {
          const cached = localStorage.getItem("penpal_progress");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Object.keys(parsed).length > 0) {
              progress.answers = parsed;
              localAnswers = true;
            }
          }
        } catch (e) {
          console.warn("Failed to parse local progress:", e);
        }
      }

      setAnswers(progress.answers || {});

      let targetIndex = 0;
      const searchParams = new URLSearchParams(window.location.search);
      const isEditMode = searchParams.get("edit") === "true";
      const showReport = searchParams.get("report") === "true";

      if (isEditMode) {
        targetIndex = 0;
        setShowSummary(false);
      } else if (showReport) {
        setShowSummary(true);
        setInitialized(true);
        return;
      } else if (progress.lastStepId && !localAnswers) {
        const found = questionnaireConfig.findIndex(
          (s) => s.id === progress.lastStepId
        );
        if (found !== -1) targetIndex = found;
      } else if (Object.keys(progress.answers || {}).length > 0) {
        let index = 0;
        const visitedIds = new Set<string>();

        while (index >= 0 && index < questionnaireConfig.length) {
          const step = questionnaireConfig[index];
          if (visitedIds.has(step.id)) break;
          visitedIds.add(step.id);

          const ans = (progress.answers || {})[step.id];

          if (
            ans === undefined ||
            ans === null ||
            (Array.isArray(ans) && ans.length === 0 && step.required)
          ) {
            targetIndex = index;
            break;
          }

          let nextId = step.nextStepId;
          if (step.branchLogic && ans !== undefined) {
            const match = step.branchLogic.find((b) => b.value === String(ans));
            if (match) nextId = match.targetStepId;
          }

          if (!nextId) {
            targetIndex = index;
            const allAnswered = questionnaireConfig.every((s) => {
              const answer = (progress.answers || {})[s.id];
              return (
                answer !== undefined &&
                answer !== null &&
                (Array.isArray(answer) ? answer.length > 0 : true)
              );
            });
            if (allAnswered) {
              setShowSummary(true);
              setInitialized(true);
              return;
            }
            break;
          }

          const nextIdx = questionnaireConfig.findIndex((s) => s.id === nextId);
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
    if (currentStep && initialized) {
      logInteraction(
        "QUESTION_VIEW",
        { stepId: currentStep.id },
        `/intervention/flow`
      ).catch((e) => console.warn("Silently caught tracking error:", e));
    }
  }, [currentStepIndex, currentStep, initialized]);

  useEffect(() => {
    if (loading) {
      setLoading(false);
    }
  }, [currentStepIndex]);

  const handleAnswer = (value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [currentStep.id]: value,
    }));
  };

  const handleNext = async (explicitAnswer?: any) => {
    if (!currentStep) return;

    setLoading(true);
    const answer = explicitAnswer !== undefined ? explicitAnswer : answers[currentStep.id];
    const answerPayload = typeof answer === "object" ? JSON.stringify(answer) : String(answer);

    try {
      await submitAnswer(currentStep.id, answerPayload);
      await logInteraction(
        "QUESTION_ANSWER",
        { stepId: currentStep.id, answer },
        `/intervention/flow`
      );
    } catch (e) {
      console.warn("Server sync failed, continuing locally.", e);
    }

    try {
      localStorage.setItem("penpal_progress", JSON.stringify({ ...answers, [currentStep.id]: answer }));
    } catch (e) {
      console.warn("Local storage limit reached.", e);
    }

    if (currentStep.isTerminal) {
      try {
        await completeQuestionnaire();
        localStorage.removeItem("penpal_progress");
      } catch (e) {
        console.warn("Complete sync failed, continuing.", e);
      }
      
      // FIX: Ensure loading is set to false before showing the summary
      setLoading(false);
      setShowSummary(true);
      window.scrollTo(0, 0);
      return;
    }

    let nextId = currentStep.nextStepId;
    if (currentStep.branchLogic && answer !== undefined) {
      const match = currentStep.branchLogic.find((b) => b.value === String(answer));
      if (match) {
        nextId = match.targetStepId;
      }
    }

    if (nextId) {
      const nextIndex = questionnaireConfig.findIndex((s) => s.id === nextId);
      if (nextIndex !== -1) {
        setCurrentStepIndex(nextIndex);
        window.scrollTo(0, 0);
        return;
      }
    }

    setLoading(false);
  };

  const handleBack = () => {
    if (!currentStep || currentStepIndex === 0 || loading) return;
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStepIndex(prevIndex);
      window.scrollTo(0, 0);
    }
  };

  if (!initialized || !currentStep) {
    return <Loader fullScreen />;
  }

  // IP-fingerprint mismatch — failed device/environment binding check
  if (bindingError) {
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

  const content = locale === "es" ? currentStep.contentEs : currentStep.contentEn;
  const title = locale === "es" ? currentStep.titleEs : currentStep.titleEn;
  const description = locale === "es" ? currentStep.descriptionEs : currentStep.descriptionEn;

  const baseProps = {
    title,
    content,
    description,
    onNext: handleNext,
    onBack: handleBack,
    loading,
    t,
    isFirstStep: currentStepIndex === 0,
    locale,
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-teal-300/10 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-indigo-300/15 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none animate-pulse"></div>
      
      {loading && <Loader fullScreen />}
      {navigating && <Loader fullScreen />}
      <div className="w-full max-w-4xl relative z-10">
        {showSummary ? (
          <SummaryReportScreen
            answers={answers}
            onEditAssessment={() => {
              setShowSummary(false);
              setCurrentStepIndex(0);
              router.push(`/${locale}/intervention/flow?edit=true`);
            }}
            onProceedToSurvey={async () => {
              try {
                setNavigating(true);
                const targetUrl = `/${locale}/intervention/survey`;
                
                console.log("Navigating to:", targetUrl);
                
                // 1. Try soft navigation via Next.js router
                router.push(targetUrl);
                
                // 2. FIX: Hard-redirect fallback if router.push fails silently
                setTimeout(() => {
                  window.location.href = targetUrl;
                }, 1500);

              } catch (error) {
                console.error("Navigation failed:", error);
                setNavigating(false);
              }
            }}
            t={t}
            locale={locale}
            navigating={navigating}
          />
        ) : (
          <>
            <AudioPlayer
              textToSpeak={
                locale === "es"
                  ? currentStep.titleEs || currentStep.contentEs || ""
                  : currentStep.titleEn || currentStep.contentEn || ""
              }
              audioSrc={locale === "es" ? currentStep.audioEs : currentStep.audioEn}
              stepId={currentStep.id}
              locale={locale}
              title={title}
              description={description}
              content={content}
              options={currentStep.options || []}
              selected={answers[currentStep.id]}
              isMultipleChoice={currentStep.type === "multiple_choice"}
            />

            {currentStep.type === "intro" && (
              <IntroScreen {...baseProps} onAnswer={handleAnswer} />
            )}
            {currentStep.type === "statistics" && (
              <StatisticsScreen {...baseProps} value={answers[currentStep.id]} onSelect={handleAnswer} />
            )}
            {currentStep.type === "education" && <EducationScreen {...baseProps} />}
            {currentStep.type === "testing_info" && <TestingScreen {...baseProps} />}
            {currentStep.type === "testimonial" && <TestimonialScreen {...baseProps} />}
            {currentStep.type === "multiple_choice" && (
              <SurveyMultipleChoice {...baseProps} options={currentStep.options} selected={answers[currentStep.id]} onSelect={handleAnswer} />
            )}
            {currentStep.type === "single_choice" && (
              <SurveySingleChoice {...baseProps} options={currentStep.options} selected={answers[currentStep.id]} onSelect={handleAnswer} />
            )}
            {currentStep.type === "slider" && (
              <SurveySlider {...baseProps} min={currentStep.min} max={currentStep.max} unit={locale === "es" ? currentStep.unitEs : currentStep.unitEn} selected={answers[currentStep.id]} onSelect={handleAnswer} />
            )}
            {currentStep.type === "summary" && (
              <SummaryScreen {...baseProps} answers={answers} />
            )}
            {currentStep.type === "text" && <TextScreen {...baseProps} />}
          </>
        )}
      </div>
    </div>
  );
}

// ============ Shared Components ============

function NavigationFooter({ onBack, onNext, loading, isFirstStep, t }: Omit<BaseScreenProps, 'title' | 'content' | 'description' | 'locale'>) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center pt-8 mt-8 border-t border-slate-100 gap-4 sm:gap-0">
      <button
        type="button"
        className="px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 disabled:opacity-0 transition-colors duration-250 no-print cursor-pointer"
        disabled={isFirstStep || loading}
        onClick={onBack}
      >
        ← {t("back")}
      </button>
      <button
        type="button"
        onClick={() => onNext()}
        disabled={loading}
        className="px-12 py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-250 flex items-center justify-center bg-slate-900 text-white border border-slate-900 hover:bg-slate-800 rounded-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md no-print"
      >
        {loading ? "..." : t("next")}
      </button>
    </div>
  );
}

// ============ Screen Components ============

function IntroScreen({ title, description, content, onNext, onAnswer, loading, t }: BaseScreenProps & { onAnswer: (val: string) => void }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-12">
      <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{title}</h1>
            <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
          </div>
          <div className="text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-6 rounded-xl border border-slate-200/80 text-sm">
            {content}
          </div>
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                onAnswer("yes");
                onNext("yes");
              }}
              disabled={loading}
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-sm active:scale-[0.98] no-print cursor-pointer"
            >
              {loading ? "..." : t("yes")}
            </button>
            <button 
              type="button" 
              disabled={loading} 
              className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest transition active:scale-[0.98] no-print cursor-pointer"
            >
              {t("no")}
            </button>
          </div>
        </div>
        <div className="flex-shrink-0 w-32 h-32 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-6xl shadow-sm select-none">
          👩‍⚕️
        </div>
      </div>
    </div>
  );
}

function StatisticsScreen({ title, content, value, onNext, onBack, onSelect, loading, t, isFirstStep }: BaseScreenProps & { value: any; onSelect: (val: number) => void }) {
  const [allergicCount, setAllergicCount] = useState<number>(value !== undefined ? Number(value) : 5);
  const totalKids = 100;

  const handleSelect = (count: number) => {
    setAllergicCount(count);
    onSelect(count);
  };

  useEffect(() => {
    if (value !== undefined && Number(value) !== allergicCount) {
      setAllergicCount(Number(value));
    }
  }, [value]);

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-xl p-8 sm:p-12 relative overflow-hidden">
      <h2 className="text-3xl font-bold text-slate-800 font-display mb-8 text-center tracking-tight">{title}</h2>
      <div className="mb-12 text-center">
        <p className="text-base text-slate-600 leading-relaxed font-light mb-8 max-w-2xl mx-auto">{content}</p>
        <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5 sm:gap-2.5 mb-8 justify-center mx-auto max-w-4xl bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50 shadow-inner">
          {Array(totalKids).fill(0).map((_, i) => {
            const isAllergic = i >= totalKids - allergicCount;
            const isGirl = i % 2 === 0;
            return (
              <button
                type="button"
                key={i}
                onClick={() => handleSelect(totalKids - i)}
                className="focus:outline-none transition-transform hover:scale-120 flex items-center justify-center cursor-pointer"
                aria-label={`Select ${totalKids - i} kids`}
              >
                <KidIcon isAllergic={isAllergic} isGirl={isGirl} />
              </button>
            );
          })}
        </div>
        <p className="text-lg font-bold text-slate-800 font-display">
          {allergicCount > 10 ? t("allergyMany", { count: allergicCount }) : t("allergyFew", { count: allergicCount })}
        </p>
      </div>
      <NavigationFooter onBack={onBack} onNext={() => onNext(value !== undefined ? value : allergicCount)} loading={loading} isFirstStep={isFirstStep} t={t} />
    </div>
  );
}

const KidIcon = memo(function KidIcon({ isAllergic, isGirl }: { isAllergic: boolean; isGirl: boolean }) {
  const color = isAllergic ? "#e88d67" : "#0d5c63";
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8" fill={color}>
      {isGirl ? (
        <>
          <circle cx="12" cy="7" r="4" />
          <path d="M12 2c-3 0-5 2-5 5v3h10V7c0-3-2-5-5-5z" fill={color} />
          <path d="M4 22a8 8 0 0 1 16 0H4z" />
        </>
      ) : (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 22a7 7 0 0 1 14 0H5z" />
        </>
      )}
    </svg>
  );
});

function EducationScreen(props: BaseScreenProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-xl p-8 sm:p-12 relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold text-slate-800 font-display tracking-tight">{props.title}</h2>
          <div className="text-slate-650 leading-relaxed space-y-4 whitespace-pre-line text-sm sm:text-base font-light bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">{props.content}</div>
        </div>
        <div className="flex-shrink-0 w-24 h-24 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-4xl shadow-inner md:sticky md:top-4 select-none">
          👩‍⚕️
        </div>
      </div>
      <NavigationFooter {...props} />
    </div>
  );
}

function TestingScreen(props: BaseScreenProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-xl p-8 sm:p-12 relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold text-slate-800 font-display tracking-tight">{props.title}</h2>
          <div className="text-slate-650 leading-relaxed space-y-4 whitespace-pre-line text-sm font-light bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">{props.content}</div>
        </div>
        <div className="flex-shrink-0 w-24 h-24 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-4xl shadow-inner md:sticky md:top-4 select-none">
          👩‍⚕️
        </div>
      </div>
      <NavigationFooter {...props} />
    </div>
  );
}

function TestimonialScreen(props: BaseScreenProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-xl p-8 sm:p-12 relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold text-slate-800 font-display tracking-tight">{props.title}</h2>
          <div className="text-slate-650 leading-relaxed space-y-4 whitespace-pre-line text-sm sm:text-base font-light bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50 italic">{props.content}</div>
        </div>
        <div className="flex-shrink-0 w-24 h-24 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-4xl shadow-inner md:sticky md:top-4 select-none">
          👨‍👩‍👧
        </div>
      </div>
      <NavigationFooter {...props} />
    </div>
  );
}

function SurveyMultipleChoice({ title, options, selected = [], onSelect, ...navProps }: BaseScreenProps & { options: any; selected: string[]; onSelect: (val: string[]) => void }) {
  const handleToggle = (value: string) => {
    const updated = selected?.includes(value)
      ? selected.filter((v: string) => v !== value)
      : [...(selected || []), value];
    onSelect(updated);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-xl p-8 sm:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
      
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8 font-display tracking-tight leading-snug">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {options.map((opt: any) => {
          const isSelected = selected?.includes(opt.value);
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => handleToggle(opt.value)}
              className={`flex items-center gap-4 p-5 rounded-2xl font-semibold border text-left transition-all duration-250 hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                isSelected
                  ? "bg-teal-55/80 border-teal-500 text-teal-900 ring-4 ring-teal-500/10"
                  : "bg-slate-50/50 border-slate-200/60 text-slate-700 hover:bg-slate-50 hover:border-teal-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0 ${
                  isSelected
                    ? "bg-teal-600 border-teal-600 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {isSelected && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm sm:text-base leading-snug">
                {navProps.locale === "es" ? opt.labelEs : opt.labelEn}
              </span>
            </button>
          );
        })}
      </div>
      <NavigationFooter {...navProps} />
    </div>
  );
}

function SurveySingleChoice({ title, options, selected, onSelect, ...navProps }: BaseScreenProps & { options: any; selected: string; onSelect: (val: string) => void }) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-xl p-8 sm:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full filter blur-2xl pointer-events-none"></div>

      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8 font-display tracking-tight leading-snug">{title}</h2>
      <div className="space-y-3.5 mb-8">
        {options.map((opt: any) => {
          const isSelected = selected === opt.value;
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl font-semibold text-left border transition-all duration-250 hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                isSelected
                  ? "bg-teal-55/80 border-teal-500 text-teal-900 ring-4 ring-teal-500/10"
                  : "bg-slate-50/50 border-slate-200/60 text-slate-700 hover:bg-slate-50 hover:border-teal-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 shrink-0 ${
                  isSelected
                    ? "bg-teal-600 border-teal-600 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <span className="text-sm sm:text-base leading-snug">
                {navProps.locale === "es" ? opt.labelEs : opt.labelEn}
              </span>
            </button>
          );
        })}
      </div>
      <NavigationFooter {...navProps} />
    </div>
  );
}

function SurveySlider({ title, min, max, unit, selected, onSelect, ...navProps }: BaseScreenProps & { min?: number; max?: number; unit?: string; selected: number; onSelect: (val: number) => void }) {
  const minVal = min || 1;
  const maxVal = max || 100;
  const value = selected || minVal;

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-xl p-8 sm:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full filter blur-2xl pointer-events-none"></div>

      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8 font-display tracking-tight leading-snug">{title}</h2>
      <div className="mb-8">
        <div className="text-center mb-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50 max-w-xs mx-auto shadow-inner">
          <span className="text-5xl font-extrabold text-teal-600 font-display leading-none">{value}</span>
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mt-1">{unit}</span>
        </div>
        <div className="relative mt-8 px-2">
          <input
            type="range"
            min={minVal}
            max={maxVal}
            value={value}
            onChange={(e) => onSelect(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600 hover:accent-teal-700 transition"
          />
          <div className="flex justify-between mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>{minVal} {unit}</span>
            <span>{maxVal} {unit}</span>
          </div>
        </div>
      </div>
      <NavigationFooter {...navProps} />
    </div>
  );
}

function SummaryScreen({ title, content, answers, onNext, onBack, loading, t, locale, isFirstStep }: BaseScreenProps & { answers: any }) {
  const summarySections = [
    {
      id: "screen2_statistics",
      labelKey: "statisticsTitle",
      defaultValue: "Statistics: Understanding Penicillin Allergy Prevalence",
      getValue: () => {
        const count = answers?.screen2_statistics;
        if (count === undefined || count === null || count === "") return t("notProvided");
        return t("allergyMessage", { count: Number(count) });
      },
    },
    {
      id: "screen3_education",
      labelKey: "educationTitle",
      defaultValue: "Education: Why Misdiagnosis Happens",
      getValue: () => (answers?.screen3_education !== undefined ? t("completed") : t("notCompleted")),
    },
    {
      id: "screen4_testing",
      labelKey: "testingTitle",
      defaultValue: "Testing Information",
      getValue: () => (answers?.screen4_testing !== undefined ? t("completed") : t("notCompleted")),
    },
    {
      id: "screen5_testimonial",
      labelKey: "testimonialTitle",
      defaultValue: "Parent Testimonials",
      getValue: () => (answers?.screen5_testimonial !== undefined ? t("completed") : t("notCompleted")),
    },
    {
      id: "screen6_1_symptoms",
      labelKey: "symptoms",
      defaultValue: "Reported Symptoms",
      getValue: () => {
        const val = answers?.screen6_1_symptoms;
        if (!Array.isArray(val) || val.length === 0) return t("notProvided");
        const step = questionnaireConfig.find((s) => s.id === "screen6_1_symptoms");
        if (!step?.options) return val.join(", ");
        return val.map((v: string) => {
          const opt = step.options!.find((o: any) => o.value === v);
          return locale === "es" ? opt?.labelEs || v : opt?.labelEn || v;
        }).join(", ");
      },
    },
    {
      id: "screen6_2_timing",
      labelKey: "timing",
      defaultValue: "Age at Reaction",
      getValue: () => {
        const val = answers?.screen6_2_timing;
        if (!val) return t("notProvided");
        return locale === "es" ? `${val} años` : `${val} year${Number(val) === 1 ? "" : "s"} old`;
      },
    },
    {
      id: "screen6_3_onset",
      labelKey: "onset",
      defaultValue: "Time to Onset",
      getValue: () => {
        const val = answers?.screen6_3_onset;
        if (!val) return t("notProvided");
        const step = questionnaireConfig.find((s) => s.id === "screen6_3_onset");
        const opt = step?.options?.find((o: any) => o.value === val);
        return locale === "es" ? opt?.labelEs || val : opt?.labelEn || val;
      },
    },
    {
      id: "screen6_4_resolution",
      labelKey: "resolution",
      defaultValue: "Resolution Method",
      getValue: () => {
        const val = answers?.screen6_4_resolution;
        if (!val) return t("notProvided");
        const step = questionnaireConfig.find((s) => s.id === "screen6_4_resolution");
        const opt = step?.options?.find((o: any) => o.value === val);
        return locale === "es" ? opt?.labelEs || val : opt?.labelEn || val;
      },
    },
    {
      id: "screen6_5_yetagain",
      labelKey: "yetagain",
      defaultValue: "Re-exposure Since Reaction",
      getValue: () => {
        const val = answers?.screen6_5_yetagain;
        if (!val) return t("notProvided");
        const step = questionnaireConfig.find((s) => s.id === "screen6_5_yetagain");
        const opt = step?.options?.find((o: any) => o.value === val);
        return locale === "es" ? opt?.labelEs || val : opt?.labelEn || val;
      },
    },
  ];

  // Parse Action Steps content
  const paragraphs = (content || '').split('\n\n');
  const steps = paragraphs.filter(p => p.startsWith('#'));
  const calloutParagraph = paragraphs.find(p => p.toLowerCase().includes("say:") || p.toLowerCase().includes("decir:"));
  const quoteParagraph = paragraphs.find(p => p.startsWith('"') || p.startsWith('“'));

  return (
    <div className="print-container bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 print-report relative overflow-hidden">
      <div className="print-section mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center tracking-tight">{title}</h2>
        
        {/* Step-by-step numbered actions */}
        <div className="space-y-3.5 max-w-2xl mx-auto text-left mb-6">
          {steps.map((step, idx) => {
            const cleanText = step.replace(/^#\d+\.\s*/, "");
            return (
              <div key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-bold text-xs flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-sm text-slate-650 leading-relaxed font-semibold">
                  {cleanText}
                </p>
              </div>
            );
          })}
        </div>

        {/* Callout box for patient verbal guidance */}
        {calloutParagraph && quoteParagraph && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-2xl mx-auto text-left shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              {calloutParagraph}
            </p>
            <p className="text-sm text-slate-700 italic font-medium leading-relaxed pl-3 border-l-2 border-slate-300">
              {quoteParagraph}
            </p>
          </div>
        )}
      </div>

      <div className="print-section border-t border-slate-100 pt-6 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {summarySections.map((section) => (
            <div key={section.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
              <p className="section-label text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                {t(section.labelKey) || section.defaultValue}
              </p>
              <p className="section-value text-sm text-slate-800 font-semibold">{section.getValue()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 pt-6 border-t border-slate-100 no-print">
        <button
          type="button"
          onClick={() => window.print()}
          className="px-6 py-2.5 border border-slate-200 text-slate-655 hover:text-slate-800 hover:bg-slate-50 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          {t("print")}
        </button>
        <button
          type="button"
          onClick={() => onNext()}
          disabled={loading}
          className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {t("completeSave")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function TextScreen({ title, description, ...navProps }: BaseScreenProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-12 text-center">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">{title}</h2>
      <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-2xl mx-auto">{description}</p>
      <NavigationFooter {...navProps} />
    </div>
  );
}

function SummaryReportScreen({ answers, onEditAssessment, onProceedToSurvey, t, locale, navigating }: { answers: any; onEditAssessment: () => void; onProceedToSurvey: () => void; t: any; locale: string; navigating?: boolean }) {
  const allergy = answers["screen2_allergy"] || "Not Specified";
  const symptoms = Array.isArray(answers["screen6_1_symptoms"]) ? answers["screen6_1_symptoms"].join(", ") : answers["screen6_1_symptoms"] || "None reported";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-12 relative overflow-hidden">
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100 no-print">
        <h1 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assessment Report</h1>
        <button
          type="button"
          onClick={onEditAssessment}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-widest transition active:scale-[0.98] cursor-pointer"
        >
          {t("editAnswers") || "Edit Assessment"}
        </button>
      </div>

      <div className="space-y-8 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none mb-2">PEN-PAL</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Patient Allergy Assessment</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Date Generated</p>
            <p className="text-base font-semibold text-slate-700">{new Date().toLocaleDateString("en-GB").split("/").join("-")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-5 border border-slate-200/80 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Primary Allergy</p>
            <p className="text-base font-bold text-slate-900">{allergy}</p>
          </div>
          <div className="bg-slate-50 p-5 border border-slate-200/80 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Reported Symptoms</p>
            <p className="text-sm font-semibold text-slate-700 leading-normal">{symptoms}</p>
          </div>
          <div className="bg-slate-50 p-5 border border-slate-200/80 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Age at Reaction</p>
            <p className="text-base font-bold text-slate-900">{answers["screen6_2_timing"] || "Not provided"} {locale === "es" ? "años" : "years old"}</p>
          </div>
          <div className="bg-slate-50 p-5 border border-slate-200/80 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Time to Onset</p>
            <p className="text-sm font-semibold text-slate-700 leading-normal">{answers["screen6_3_onset"] || "Not provided"}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 mt-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            Clinical Guidance
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Based on the responses provided, your child has a documented history of <strong className="font-semibold text-slate-900">{allergy}</strong> allergy. The symptoms reported ({symptoms}) indicate a clinical profile that may require further evaluation by a specialist.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mt-4">
            This report is part of the PEN-PAL research study and should be discussed with your pediatrician or an allergist.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100 no-print justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center justify-center gap-3 px-8 py-3.5 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all rounded-xl text-xs font-bold uppercase tracking-widest flex-1 sm:flex-none cursor-pointer active:scale-[0.98]"
        >
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9V2h12v7"></path>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print Report
        </button>
        <button
          type="button"
          onClick={onProceedToSurvey}
          disabled={navigating}
          className="flex items-center justify-center gap-2 px-12 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex-1 sm:flex-none disabled:opacity-50 cursor-pointer active:scale-[0.98]"
        >
          {navigating ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirecting...
            </>
          ) : (
            <>
              <span>✓</span> Complete & Save
            </>
          )}
        </button>
      </div>

      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 0.5cm; }
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; font-size: 11pt; }
          html { background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-shadow: none !important; }
          .rounded-xl { border-radius: 0 !important; }
          .rounded-2xl { border-radius: 0 !important; }
          .rounded-3xl { border-radius: 0 !important; }
          .shadow-sm, .shadow-lg, .shadow-2xl { box-shadow: none !important; }
          .bg-white { background: white !important; }
          .bg-slate-50 { background-color: #f8fafc !important; }
          .text-slate-400 { color: #94a3b8 !important; }
          .text-slate-500 { color: #64748b !important; }
          .text-slate-700 { color: #334155 !important; }
          .text-slate-900 { color: #0f172a !important; }
          .border-slate-200 { border-color: #e2e8f0 !important; }
          .p-8, .p-6, .p-5 { padding: 0 !important; }
          .sm\\:p-12 { padding: 0 !important; }
          .space-y-8 > * + * { margin-top: 1rem !important; }
        }
      `}</style>
    </div>
  );
}