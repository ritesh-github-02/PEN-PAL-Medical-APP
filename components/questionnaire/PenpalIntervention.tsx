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
import { logout } from "@/app/[locale]/intervention/actions";
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
  const [showSuccess, setShowSuccess] = useState(false);
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

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans bg-[#f4f8e8]">
        <div className="max-w-xl w-full bg-white border border-slate-200 p-8 sm:p-12 text-center shadow-md rounded-3xl">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-6 rounded-full text-2xl font-bold shadow-sm">
            ✓
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Success</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-8">
            Your responses have been recorded. Thank you for participating in the PEN-PAL study.
          </p>
          
          <div className="space-y-4 pt-6 border-t border-slate-100">
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
    <div className="min-h-screen max-h-screen flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 relative overflow-hidden font-sans">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-teal-300/10 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-indigo-300/15 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none animate-pulse"></div>

      {loading && <Loader fullScreen />}
      {navigating && <Loader fullScreen />}
      <div className="w-full max-w-3xl relative z-10 my-auto">
        {/* Compact Tablet / iPad Device Frame */}
        <div className="bg-zinc-900 border-[8px] sm:border-[12px] border-zinc-900 rounded-[1.8rem] sm:rounded-[2.4rem] shadow-2xl relative p-0.5 ring-1 ring-white/10 overflow-hidden">
          {/* Tablet Front Camera Notch / Sensor Dot */}
          {/* <div className="hidden sm:block absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700/80 z-30 shadow-inner"></div> */}

          <div className="rounded-[1.4rem] sm:rounded-[2rem] overflow-hidden">
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
                    await completeQuestionnaire();
                    setShowSuccess(true);
                  } catch (error) {
                    console.error("Completion error:", error);
                    setShowSuccess(true);
                  } finally {
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
                {currentStep.type === "testing_info" && <TestingScreen {...baseProps} />}
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
      </div>
    </div>
  );
}

// ============ Shared Components ============

function NavigationFooter({ onBack, onNext, loading, isFirstStep, t }: Omit<BaseScreenProps, 'title' | 'content' | 'description' | 'locale'>) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center pt-4 mt-4 border-t border-slate-300/40 gap-3 sm:gap-0">
      <button
        type="button"
        className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#2b3e34] hover:text-black disabled:opacity-0 transition-colors duration-250 no-print cursor-pointer"
        disabled={isFirstStep || loading}
        onClick={onBack}
      >
        ← {t("back")}
      </button>
      <button
        type="button"
        onClick={() => onNext()}
        disabled={loading}
        className="px-8 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-250 flex items-center justify-center bg-[#82bdad] hover:bg-[#71ad9d] text-[#193630] rounded-full hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm no-print font-sans border border-[#71ad9d]"
      >
        {loading ? "..." : t("next")}
      </button>
    </div>
  );
}

// ============ Screen Components ============

function IntroScreen({ title, description, content, onNext, onAnswer, loading, t }: BaseScreenProps & { onAnswer: (val: string) => void }) {
  return (
    <div className="bg-gradient-to-br from-[#a2b4ff] via-[#8ce5ce] to-[#eef8ce] border border-white/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl font-black text-[#216d77] tracking-tight font-display">PEN–PAL</h1>
            <p className="text-base sm:text-lg font-bold text-[#2b3e34]">Parents Engaged in Penicillin Allergies</p>
          </div>

          <div className="text-[#2b3e34] leading-relaxed whitespace-pre-line text-sm sm:text-base font-medium max-w-xl">
            This is nurse Anna. Anna is giving information about allergies to penicillin in kids.
          </div>

          <div className="space-y-2.5 pt-1">
            <p className="text-base sm:text-lg font-bold text-[#2b3e34]">Do you want to know more?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  onAnswer("yes");
                  onNext("yes");
                }}
                disabled={loading}
                className="px-6 py-2 bg-[#f0d411] hover:bg-[#e1c504] text-[#2b3e34] border border-[#e0c406] rounded-xl font-bold text-sm transition shadow-sm active:scale-[0.98] no-print cursor-pointer"
              >
                {loading ? "..." : t("yes")}
              </button>
              <button
                type="button"
                disabled={loading}
                className="px-6 py-2 bg-[#82bdad] hover:bg-[#71ad9d] text-[#193630] border border-[#71ad9d] rounded-xl font-bold text-sm transition active:scale-[0.98] no-print cursor-pointer shadow-sm"
              >
                {t("no")}
              </button>
            </div>
          </div>
        </div>

        {/* Nurse Anna Illustration */}
        <div className="flex-shrink-0 relative flex items-center justify-center p-2 self-end md:self-end mt-auto">
          <img
            src="/images/nurse-anna.png"
            alt="Nurse Anna"
            className="w-20 sm:w-20 md:w-20 h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
          />
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
    <div className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-4 sm:p-12 md:p-6 shadow-lg relative overflow-hidden">
      <div className="text-center space-y-1.5 mb-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#3a2d24] max-w-xl mx-auto tracking-tight leading-snug">
          {title}
        </h2>
        <p className="text-xs sm:text-sm md:text-base font-bold text-[#3a2d24] max-w-lg mx-auto">
          {content}
        </p>
      </div>

      <div className="mb-4 text-center">
        {/* 100 Kids Icon Grid (5 rows x 20 cols) */}
        <div className="grid grid-cols-10 sm:grid-cols-20 gap-1 sm:gap-0 mb-2 justify-center mx-auto max-w-xl p-2 bg-white/50 rounded-2xl border border-slate-200/50">
          {Array(totalKids).fill(0).map((_, i) => {
            const isAllergic = i >= totalKids - allergicCount;
            const isGirl = i % 2 === 0;
            return (
              <button
                type="button"
                key={i}
                onClick={() => handleSelect(totalKids - i)}
                className="focus:outline-none transition-transform hover:scale-125 flex items-center justify-center cursor-pointer p-0.5"
                aria-label={`Select ${totalKids - i} kids`}
              >
                <KidIcon isAllergic={isAllergic} isGirl={isGirl} />
              </button>
            );
          })}
        </div>

        <div className="flex justify-end max-w-xl mx-auto pr-2">
          <p className="text-xs sm:text-sm font-bold text-[#3a2d24]">
            only <span className="text-base sm:text-lg font-black text-[#3a2d24] mx-0.5">{allergicCount}</span> have a real allergy
          </p>
        </div>
      </div>

      {/* Centered Yellow Next Button */}
      <div className="flex justify-center pt-2 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => onNext(value !== undefined ? value : allergicCount)}
          disabled={loading}
          className="px-7 py-1.5 sm:py-2 bg-[#f0d411] hover:bg-[#e1c504] text-[#2b3e34] border border-[#e0c406] rounded-full font-bold text-xs sm:text-sm transition shadow-sm active:scale-[0.98] cursor-pointer"
        >
          {loading ? "..." : t("next")}
        </button>
      </div>
    </div>
  );
}

const KidIcon = memo(function KidIcon({ isAllergic, isGirl }: { isAllergic: boolean; isGirl: boolean }) {
  const color = isAllergic ? "#d95d39" : "#236f7a";
  return (
    <svg viewBox="0 0 32 32" className="w-8 h-8 sm:w-8 sm:h-8 md:w-8 md:h-8 select-none transition-transform">
      {/* Shoulders / Shirt */}
      <path
        d="M 7 29 C 7 23, 25 23, 25 29"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      
      {/* Face background circle */}
      <circle cx="16" cy="14.5" r="7.5" fill="#ffffff" stroke={color} strokeWidth="2" />
      
      {/* Eyes */}
      <circle cx="13.2" cy="14" r="1.1" fill={color} />
      <circle cx="18.8" cy="14" r="1.1" fill={color} />
      
      {/* Smile */}
      <path
        d="M 13.2 17 Q 16 19.8 18.8 17"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      
      {/* Hair */}
      {isGirl ? (
        /* Girl Hair: Shoulder length with side drapes */
        <path
          d="M 16 5.5 C 10 5.5, 7.5 9.5, 7.5 15 C 7.5 19.5, 9 22, 10.5 22 C 11.5 21, 11 18, 10 16 C 12.5 11.5, 15 10.5, 16.5 10.5 C 18 10.5, 20 11.5, 22 16 C 21 18, 20.5 21, 21.5 22 C 23 22, 24.5 19.5, 24.5 15 C 24.5 9.5, 22 5.5, 16 5.5 Z"
          fill={color}
        />
      ) : (
        /* Boy Hair: Short hair with side-swept bangs */
        <path
          d="M 16 5.5 C 10.5 5.5, 8 9, 8 13.5 C 10 12.8, 12 11, 14.5 11.8 C 17 10.8, 20.5 10.8, 24 13.5 C 24 9, 21.5 5.5, 16 5.5 Z"
          fill={color}
        />
      )}
    </svg>
  );
});


function TestingScreen(props: BaseScreenProps) {
  return (
    <div className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="flex-1 space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-[#3a2d24] tracking-tight leading-snug">{props.title}</h2>
          <div className="text-[#3a2d24] leading-relaxed space-y-3 whitespace-pre-line text-sm sm:text-base font-medium">
            {props.content}
          </div>
        </div>
        <div className="flex-shrink-0 relative flex items-center justify-center p-2 self-end md:self-end mt-auto">
          <img
            src="/images/nurse-anna.png"
            alt="Nurse Anna"
            className="w-20 sm:w-20 md:w-20 h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Centered Yellow Next Button */}
      <div className="flex justify-center pt-3 mt-4 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => props.onNext()}
          disabled={props.loading}
          className="px-8 py-2 bg-[#f0d411] hover:bg-[#e1c504] text-[#2b3e34] border border-[#e0c406] rounded-full font-bold text-sm transition shadow-sm active:scale-[0.98] cursor-pointer"
        >
          {props.loading ? "..." : props.t("next")}
        </button>
      </div>
    </div>
  );
}

function TestimonialScreen(props: BaseScreenProps) {
  return (
    <div className="bg-gradient-to-br from-[#a2b4ff] via-[#8ce5ce] to-[#eef8ce] border border-white/60 rounded-3xl p-8 sm:p-12 shadow-lg relative">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2b3e34] tracking-tight leading-snug">{props.title}</h2>
          <div className="text-[#2b3e34] leading-relaxed space-y-3 whitespace-pre-line text-base font-medium bg-white/70 p-6 rounded-2xl border border-white/80 shadow-sm backdrop-blur-sm italic">{props.content}</div>
        </div>
        <div className="flex-shrink-0 w-28 h-28 flex items-center justify-center text-7xl md:sticky md:top-4 select-none filter drop-shadow-md">
          👩‍👦
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
    <div className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-4 sm:p-5 md:p-6 shadow-lg relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        <div className="flex-1 space-y-3">
          <div>
            {navProps.description && (
              <p className="text-sm sm:text-base font-semibold text-[#3a2d24] mb-0.5">{navProps.description}</p>
            )}
            <h2 className="text-base sm:text-lg md:text-xl font-black text-[#3a2d24] tracking-tight leading-snug">{title}</h2>
          </div>

          {/* If Pill Style (e.g. Symptoms in Image 1) */}
          {options[0]?.value && !options[0]?.value.startsWith("curing_") ? (
            <div className="bg-[#8caeab] p-3.5 sm:p-4 rounded-2xl shadow-inner max-w-xl">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {options.map((opt: any) => {
                  const isSelected = selected?.includes(opt.value);
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => handleToggle(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs border ${
                        isSelected
                          ? "bg-[#236f7a] text-white border-[#236f7a] scale-105 shadow-sm"
                          : "bg-white text-[#1e3a3a] border-white/80 hover:bg-slate-50"
                      }`}
                    >
                      {navProps.locale === "es" ? opt.labelEs : opt.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Toggle Switch Style (Knowledge Test) */
            <div className="space-y-2.5 pt-1">
              {options.map((opt: any, idx: number) => {
                const isSelected = selected?.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleToggle(opt.value)}
                    className="flex items-center gap-3 cursor-pointer group select-none"
                  >
                    <div className="flex flex-col items-center shrink-0 pt-0.5">
                      <div className={`w-12 h-5 rounded-full p-0.5 transition-colors duration-200 ${isSelected ? 'bg-[#236f7a]' : 'bg-[#7d93a2]'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white border border-slate-300 shadow-sm transform transition-transform duration-200 ${isSelected ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                      <div className="flex justify-between w-full px-1 text-[10px] font-extrabold text-[#3a2d24] mt-0.5 leading-none">
                        <span>×</span>
                        <span>✓</span>
                      </div>
                    </div>

                    <span className="text-xs sm:text-sm font-semibold text-[#3a2d24] leading-snug">
                      {idx + 1}. {navProps.locale === "es" ? opt.labelEs : opt.labelEn}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Nurse Anna Illustration */}
        <div className="flex-shrink-0 relative flex items-center justify-center p-1 self-end md:self-end mt-auto">
          <img
            src="/images/nurse-anna.png"
            alt="Nurse Anna"
            className="w-20 sm:w-20 md:w-20 h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Centered Yellow Next Button */}
      <div className="flex justify-center pt-2 mt-3 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => navProps.onNext(selected)}
          disabled={navProps.loading}
          className="px-8 py-1.5 bg-[#f0d411] hover:bg-[#e1c504] text-[#2b3e34] border border-[#e0c406] rounded-full font-bold text-xs transition shadow-sm active:scale-[0.98] cursor-pointer"
        >
          {navProps.loading ? "..." : navProps.t("next")}
        </button>
      </div>
    </div>
  );
}

function SurveySingleChoice({ title, options, selected, onSelect, ...navProps }: BaseScreenProps & { options: any; selected: string; onSelect: (val: string) => void }) {
  return (
    <div className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="flex-1 space-y-4">
          <div>
            {navProps.description && (
              <p className="text-base sm:text-lg font-semibold text-[#3a2d24] mb-1">{navProps.description}</p>
            )}
            <h2 className="text-xl sm:text-2xl font-black text-[#3a2d24] tracking-tight leading-snug">{title}</h2>
          </div>

          {/* Teal Container Card with White Pill Buttons (Image 5) */}
          <div className="bg-[#8caeab] p-6 rounded-3xl shadow-inner max-w-xl">
            <div className="flex flex-wrap gap-3">
              {options.map((opt: any) => {
                const isSelected = selected === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => onSelect(opt.value)}
                    className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm border ${
                      isSelected
                        ? "bg-[#236f7a] text-white border-[#236f7a] scale-105 shadow-md"
                        : "bg-white text-[#1e3a3a] border-white/80 hover:bg-slate-50"
                    }`}
                  >
                    {navProps.locale === "es" ? opt.labelEs : opt.labelEn}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Nurse Anna Illustration */}
        <div className="flex-shrink-0 relative flex items-center justify-center p-2 self-end md:self-end mt-auto">
          <img
            src="/images/nurse-anna.png"
            alt="Nurse Anna"
            className="w-20 sm:w-20 md:w-20 h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Centered Yellow Next Button */}
      <div className="flex justify-center pt-3 mt-4 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => navProps.onNext(selected)}
          disabled={navProps.loading}
          className="px-8 py-2 bg-[#f0d411] hover:bg-[#e1c504] text-[#2b3e34] border border-[#e0c406] rounded-full font-bold text-sm transition shadow-sm active:scale-[0.98] cursor-pointer"
        >
          {navProps.loading ? "..." : navProps.t("next")}
        </button>
      </div>
    </div>
  );
}

function SurveySlider({ title, min, max, unit, selected, onSelect, ...navProps }: BaseScreenProps & { min?: number; max?: number; unit?: string; selected: number; onSelect: (val: number) => void }) {
  const minVal = min || 1;
  const maxVal = max || 26;
  const value = selected || 9;

  return (
    <div className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="flex-1 space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-[#3a2d24] tracking-tight leading-snug">{title}</h2>

          {/* Teal Container Card */}
          <div className="bg-[#8caeab] p-6 rounded-3xl text-[#1e3a3a] shadow-inner relative space-y-6 max-w-xl">
            <p className="text-sm sm:text-base font-semibold text-[#1e3a3a] leading-snug">
              {navProps.description || "At what age did your child have the reaction to penicillin (amoxicillin)?"}
            </p>

            {/* Slider with Yellow Badge Indicator */}
            <div className="relative pt-8 pb-4 px-2">
              {/* Dynamic Yellow Badge floating above thumb */}
              <div 
                className="absolute top-0 -translate-x-1/2 bg-[#f0d411] text-[#2b3e34] font-black text-xs px-2.5 py-1 rounded-full border border-[#e0c406] shadow-sm transition-all"
                style={{
                  left: `${((value - minVal) / (maxVal - minVal)) * 100}%`
                }}
              >
                {value}
              </div>

              <input
                type="range"
                min={minVal}
                max={maxVal}
                value={value}
                onChange={(e) => onSelect(Number(e.target.value))}
                className="w-full h-2 bg-[#2d565b] rounded-lg appearance-none cursor-pointer accent-[#f0d411] hover:accent-[#e1c504] transition"
              />

              {/* Timeline Tick Labels */}
              <div className="flex justify-between mt-3 text-[11px] font-bold text-[#1e3a3a]">
                <span>&lt;1<br/>year old</span>
                <span>1<br/>year old</span>
                <span>10<br/>year old</span>
                <span>20<br/>year old</span>
                <span>26<br/>year-old</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nurse Anna Illustration */}
        <div className="flex-shrink-0 relative flex items-center justify-center p-2 self-end md:self-end mt-auto">
          <img
            src="/images/nurse-anna.png"
            alt="Nurse Anna"
            className="w-20 sm:w-20 md:w-20 h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Centered Yellow Next Button */}
      <div className="flex justify-center pt-3 mt-4 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => navProps.onNext(value)}
          disabled={navProps.loading}
          className="px-8 py-2 bg-[#f0d411] hover:bg-[#e1c504] text-[#2b3e34] border border-[#e0c406] rounded-full font-bold text-sm transition shadow-sm active:scale-[0.98] cursor-pointer"
        >
          {navProps.loading ? "..." : navProps.t("next")}
        </button>
      </div>
    </div>
  );
}

function TextScreen({ title, description, content, ...navProps }: BaseScreenProps) {
  return (
    <div className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between min-h-[14rem]">
        <div className="flex-1 space-y-4 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#3a2d24] max-w-xl tracking-tight leading-relaxed">
            {title}
          </h2>
          {description && (
            <p className="text-sm sm:text-base font-medium text-[#3a2d24] max-w-xl">{description}</p>
          )}
        </div>

        {/* Nurse Anna Illustration */}
        <div className="flex-shrink-0 relative flex items-center justify-center p-2 self-end md:self-end mt-auto">
          <img
            src="/images/nurse-anna.png"
            alt="Nurse Anna"
            className="w-20 sm:w-20 md:w-20 h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Centered Yellow Next Button */}
      <div className="flex justify-center pt-3 mt-4 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => navProps.onNext()}
          disabled={navProps.loading}
          className="px-8 py-2 bg-[#f0d411] hover:bg-[#e1c504] text-[#2b3e34] border border-[#e0c406] rounded-full font-bold text-sm transition shadow-sm active:scale-[0.98] cursor-pointer"
        >
          {navProps.loading ? "..." : navProps.t("next")}
        </button>
      </div>
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
    <div className="print-container bg-white border border-slate-200/80 rounded-2xl shadow-md p-3.5 sm:p-5 max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col justify-between">
      <div className="print-section text-center">
        <h2 className="text-base sm:text-lg font-black text-slate-900 mb-2 text-center tracking-tight leading-tight">{title}</h2>

        {/* Step-by-step numbered actions */}
        <div className="space-y-1.5 max-w-xl mx-auto text-left mb-3">
          {steps.map((step, idx) => {
            const cleanText = step.replace(/^#\d+\.\s*/, "");
            return (
              <div key={idx} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-bold text-[10px] flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-700 leading-snug font-semibold">
                  {cleanText}
                </p>
              </div>
            );
          })}
        </div>

        {/* Callout box for patient verbal guidance */}
        {calloutParagraph && quoteParagraph && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 sm:p-2.5 max-w-xl mx-auto text-left shadow-2xs mb-3">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              {calloutParagraph}
            </p>
            <p className="text-xs text-slate-700 italic font-medium leading-tight pl-2 border-l-2 border-slate-300">
              {quoteParagraph}
            </p>
          </div>
        )}
      </div>

      <div className="print-section border-t border-slate-100 pt-2.5 mb-2">
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-left">
          {summarySections.map((section) => (
            <div key={section.id} className="bg-slate-50/90 border border-slate-200/80 rounded-lg p-2 sm:p-2.5">
              <p className="section-label text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 truncate">
                {t(section.labelKey) || section.defaultValue}
              </p>
              <p className="section-value text-xs text-slate-800 font-bold leading-tight truncate sm:whitespace-normal">{section.getValue()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-row gap-2 justify-center pt-2 border-t border-slate-100 no-print shrink-0">
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-1.5 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          {t("print")}
        </button>
        <button
          type="button"
          onClick={() => onNext()}
          disabled={loading}
          className="px-6 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
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


function SummaryReportScreen({ answers, onEditAssessment, onProceedToSurvey, t, locale, navigating }: { answers: any; onEditAssessment: () => void; onProceedToSurvey: () => void; t: any; locale: string; navigating?: boolean }) {
  const allergy = answers["screen2_allergy"] || "Not Specified";
  const symptoms = Array.isArray(answers["screen6_1_symptoms"]) ? answers["screen6_1_symptoms"].join(", ") : answers["screen6_1_symptoms"] || "None reported";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-md p-4 sm:p-6 max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col justify-between relative">
      <div>
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 no-print">
          <h1 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assessment Report</h1>
          <button
            type="button"
            onClick={onEditAssessment}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-lg text-[9px] font-bold uppercase tracking-widest transition active:scale-[0.98] cursor-pointer"
          >
            {t("editAnswers") || "Edit Assessment"}
          </button>
        </div>

        <div className="space-y-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-none mb-1">PEN-PAL</h2>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Patient Allergy Assessment</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Date Generated</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-700">{new Date().toLocaleDateString("en-GB").split("/").join("-")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80 rounded-lg">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Primary Allergy</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{allergy}</p>
            </div>
            <div className="bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80 rounded-lg">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Reported Symptoms</p>
              <p className="text-xs font-semibold text-slate-700 leading-tight truncate sm:whitespace-normal">{symptoms}</p>
            </div>
            <div className="bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80 rounded-lg">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Age at Reaction</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{answers["screen6_2_timing"] || "Not provided"} {locale === "es" ? "años" : "years old"}</p>
            </div>
            <div className="bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80 rounded-lg">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Time to Onset</p>
              <p className="text-xs font-semibold text-slate-700 leading-tight truncate">{answers["screen6_3_onset"] || "Not provided"}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 mt-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              Clinical Guidance
            </h3>
            <p className="text-xs text-slate-600 leading-snug">
              Based on the responses provided, your child has a documented history of <strong className="font-semibold text-slate-900">{allergy}</strong> allergy. The symptoms reported ({symptoms}) indicate a clinical profile that may require further evaluation by a specialist.
            </p>
            <p className="text-xs text-slate-600 leading-snug mt-1.5">
              This report is part of the PEN-PAL research study and should be discussed with your pediatrician or an allergist.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-2 pt-3 border-t border-slate-100 no-print justify-end shrink-0">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-5 py-2 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all rounded-lg text-xs font-bold uppercase tracking-wider flex-1 sm:flex-none cursor-pointer active:scale-[0.98]"
        >
          <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          className="flex items-center justify-center gap-1.5 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex-1 sm:flex-none disabled:opacity-50 cursor-pointer active:scale-[0.98]"
        >
          {navigating ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
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