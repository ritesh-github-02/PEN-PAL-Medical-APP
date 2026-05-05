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

  const currentStep = questionnaireConfig[currentStepIndex];

  useEffect(() => {
    async function init() {
      let progress = await loadQuestionnaireProgress();
      let localAnswers = false;

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
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8 font-sans">
      {loading && <Loader fullScreen />}
      {navigating && <Loader fullScreen />}
      <div className="w-full max-w-4xl">
        {showSummary ? (
          <SummaryReportScreen
            answers={answers}
            onEditAssessment={() => {
              setShowSummary(false);
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
    <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center pt-8 mt-8 border-t border-zinc-100 gap-4 sm:gap-0">
      <button
        type="button"
        className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 disabled:opacity-0 transition-colors no-print"
        disabled={isFirstStep || loading}
        onClick={onBack}
      >
        ← {t("back")}
      </button>
      <button
        type="button"
        onClick={() => onNext()}
        disabled={loading}
        className="px-12 py-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center bg-zinc-900 text-white border border-zinc-900 hover:bg-zinc-800 no-print"
      >
        {loading ? "..." : t("next")}
      </button>
    </div>
  );
}

// ============ Screen Components ============

function IntroScreen({ title, description, content, onNext, onAnswer, loading, t }: BaseScreenProps & { onAnswer: (val: string) => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-teal-700 mb-2">{title}</h1>
        <p className="text-lg text-gray-700">{description}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-8 items-center justify-between mb-8">
        <div className="flex-1">
          <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">{content}</p>
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={() => {
                onAnswer("yes");
                onNext("yes");
              }}
              disabled={loading}
              className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50 no-print"
            >
              {loading ? "Loading..." : t("yes")}
            </button>
            <button type="button" disabled={loading} className="px-8 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition disabled:opacity-50 no-print">
              {t("no")}
            </button>
          </div>
        </div>
        <div className="flex-shrink-0 w-32 h-32 bg-teal-100 rounded-lg flex items-center justify-center">
          <span className="text-5xl">👩‍⚕️</span>
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
    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center">{title}</h2>
      <div className="mb-12 text-center">
        <p className="text-lg text-gray-700 mb-8">{content}</p>
        <div className="grid grid-cols-10 sm:grid-cols-20 gap-1 sm:gap-2 mb-6 justify-center mx-auto max-w-4xl">
          {Array(totalKids).fill(0).map((_, i) => {
            const isAllergic = i >= totalKids - allergicCount;
            const isGirl = i % 2 === 0;
            return (
              <button
                type="button"
                key={i}
                onClick={() => handleSelect(totalKids - i)}
                className="focus:outline-none transition-transform hover:scale-110 flex items-center justify-center"
                aria-label={`Select ${totalKids - i} kids`}
              >
                <KidIcon isAllergic={isAllergic} isGirl={isGirl} />
              </button>
            );
          })}
        </div>
        <p className="text-lg font-semibold text-gray-700">
          {allergicCount > 10 ? t("allergyMany", { count: allergicCount }) : t("allergyFew", { count: allergicCount })}
        </p>
      </div>
      <NavigationFooter onBack={onBack} onNext={() => onNext(value !== undefined ? value : allergicCount)} loading={loading} isFirstStep={isFirstStep} t={t} />
    </div>
  );
}

const KidIcon = memo(function KidIcon({ isAllergic, isGirl }: { isAllergic: boolean; isGirl: boolean }) {
  const color = isAllergic ? "#E86638" : "#558C8C";
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
    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">{props.title}</h2>
          <div className="text-gray-800 leading-relaxed space-y-4 whitespace-pre-line">{props.content}</div>
        </div>
        <div className="flex-shrink-0 w-32 h-32 bg-teal-100 rounded-lg flex items-center justify-center">
          <span className="text-5xl">👩‍⚕️</span>
        </div>
      </div>
      <NavigationFooter {...props} />
    </div>
  );
}

function TestingScreen(props: BaseScreenProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">{props.title}</h2>
          <div className="text-gray-800 leading-relaxed space-y-3 whitespace-pre-line text-sm">{props.content}</div>
        </div>
        <div className="flex-shrink-0 w-32 h-32 bg-teal-100 rounded-lg flex items-center justify-center">
          <span className="text-5xl">👩‍⚕️</span>
        </div>
      </div>
      <NavigationFooter {...props} />
    </div>
  );
}

function TestimonialScreen(props: BaseScreenProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">{props.title}</h2>
          <div className="text-gray-800 leading-relaxed space-y-3 whitespace-pre-line">{props.content}</div>
        </div>
        <div className="flex-shrink-0 w-32 h-32 bg-teal-100 rounded-lg flex items-center justify-center">
          <span className="text-5xl">👨‍👩‍👧</span>
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
    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {options.map((opt: any) => (
          <button
            type="button"
            key={opt.value}
            onClick={() => handleToggle(opt.value)}
            className={`p-4 rounded-lg font-semibold border-2 transition ${selected?.includes(opt.value) ? "bg-teal-100 border-teal-600 text-teal-700" : "bg-gray-50 border-gray-300 text-gray-700 hover:border-teal-400"}`}
          >
            {navProps.locale === "es" ? opt.labelEs : opt.labelEn}
          </button>
        ))}
      </div>
      <NavigationFooter {...navProps} />
    </div>
  );
}

function SurveySingleChoice({ title, options, selected, onSelect, ...navProps }: BaseScreenProps & { options: any; selected: string; onSelect: (val: string) => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8">{title}</h2>
      <div className="space-y-3 mb-8">
        {options.map((opt: any) => (
          <button
            type="button"
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`w-full p-4 rounded-lg font-semibold text-left border-2 transition ${selected === opt.value ? "bg-teal-100 border-teal-600 text-teal-700" : "bg-gray-50 border-gray-300 text-gray-700 hover:border-teal-400"}`}
          >
            {navProps.locale === "es" ? opt.labelEs : opt.labelEn}
          </button>
        ))}
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
    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8">{title}</h2>
      <div className="mb-8">
        <div className="text-center mb-6">
          <span className="text-4xl font-bold text-teal-600">{value}</span>
          <span className="text-lg text-gray-600 ml-2">{unit}</span>
        </div>
        <input
          type="range"
          min={minVal}
          max={maxVal}
          value={value}
          onChange={(e) => onSelect(Number(e.target.value))}
          className="w-full h-3 bg-teal-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
        />
        <div className="flex justify-between mt-4 text-sm text-gray-600">
          <span>{minVal}</span>
          <span>{maxVal}</span>
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

  return (
    <div className="print-container bg-white rounded-2xl shadow-lg p-8 sm:p-12 print-report">
      <div className="print-section mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">{title}</h2>
        <p className="text-center text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto whitespace-pre-line">{content}</p>
      </div>

      <div className="print-section border-t border-gray-200 pt-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
          {summarySections.map((section) => (
            <div key={section.id} className="py-1">
              <p className="section-label text-sm font-semibold text-teal-600 uppercase tracking-wide mb-1">
                {t(section.labelKey) || section.defaultValue}
              </p>
              <p className="section-value text-lg text-gray-800 font-light">{section.getValue()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-6 border-t border-gray-200 no-print">
        <button
          type="button"
          onClick={() => window.print()}
          className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          {t("print")}
        </button>
        <button
          type="button"
          onClick={() => onNext()}
          disabled={loading}
          className="px-12 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{title}</h2>
      <p className="text-lg text-gray-700 mb-8">{description}</p>
      <NavigationFooter {...navProps} />
    </div>
  );
}

function SummaryReportScreen({ answers, onEditAssessment, onProceedToSurvey, t, locale, navigating }: { answers: any; onEditAssessment: () => void; onProceedToSurvey: () => void; t: any; locale: string; navigating?: boolean }) {
  const allergy = answers["screen2_allergy"] || "Not Specified";
  const symptoms = Array.isArray(answers["screen6_1_symptoms"]) ? answers["screen6_1_symptoms"].join(", ") : answers["screen6_1_symptoms"] || "None reported";

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
      <div className="flex justify-between items-center mb-8 pb-8 border-b border-teal-100 no-print">
        <h1 className="text-sm font-bold uppercase tracking-widest text-teal-600">Assessment Report</h1>
        <button type="button" onClick={onEditAssessment} className="text-[10px] font-bold text-teal-600 underline underline-offset-4 uppercase tracking-widest hover:text-teal-700 transition-colors">
          Edit Assessment
        </button>
      </div>

      <div className="space-y-8 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-light text-teal-900 italic mb-2">PEN-PAL</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-teal-600">Patient Allergy Assessment</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-teal-600 uppercase tracking-widest mb-2">Date Generated</p>
            <p className="text-lg font-light text-teal-900">{new Date().toLocaleDateString("en-GB").split("/").join("-")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">Primary Allergy</p>
            <p className="text-xl font-light text-teal-900">{allergy}</p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">Reported Symptoms</p>
            <p className="text-sm text-teal-900">{symptoms}</p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">Age at Reaction</p>
            <p className="text-lg font-light text-teal-900">{answers["screen6_2_timing"] || "Not provided"} {locale === "es" ? "años" : "years old"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">Time to Onset</p>
            <p className="text-sm text-teal-900">{answers["screen6_3_onset"] || "Not provided"}</p>
          </div>
        </div>

        <div className="bg-teal-50 p-6 rounded-lg border border-teal-100 mt-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600 mb-4">Clinical Guidance</h3>
          <p className="text-sm text-teal-700 leading-relaxed">
            Based on the responses provided, your child has a documented history of <strong>{allergy}</strong> allergy. The symptoms reported ({symptoms}) indicate a clinical profile that may require further evaluation by a specialist.
          </p>
          <p className="text-sm text-teal-700 leading-relaxed mt-4">
            This report is part of the PEN-PAL research study and should be discussed with your pediatrician or an allergist.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-teal-100 no-print">
        <button type="button" onClick={() => window.print()} className="flex items-center justify-center gap-3 px-6 py-3 border border-teal-300 text-teal-600 hover:bg-teal-50 transition-colors rounded-lg text-sm font-bold uppercase tracking-widest flex-1 sm:flex-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9V2h12v7"></path>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print Report
        </button>
        <button type="button" onClick={onProceedToSurvey} disabled={navigating} className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white hover:bg-teal-700 transition-colors rounded-lg text-sm font-bold uppercase tracking-widest flex-1 sm:flex-none disabled:opacity-50">
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
          .rounded-2xl { border-radius: 0 !important; }
          .shadow-lg { box-shadow: none !important; }
          .bg-white { background: white !important; }
          .bg-teal-50 { background-color: #f0fdf4 !important; }
          .text-teal-600 { color: #14b8a6 !important; }
          .text-teal-900 { color: #0d3b40 !important; }
          .text-teal-700 { color: #0f766e !important; }
          .border-teal-100 { border-color: #ccf0ee !important; }
          .p-8, .p-6 { padding: 0 !important; }
          .sm\\:p-12 { padding: 0 !important; }
          .space-y-8 > * + * { margin-top: 1rem !important; }
        }
      `}</style>
    </div>
  );
}