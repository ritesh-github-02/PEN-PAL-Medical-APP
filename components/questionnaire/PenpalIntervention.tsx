"use client";

import React, { useState, useEffect, useRef, memo } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/routing";
import { questionnaireConfig, QuestionnaireStep } from "@/config/questionnaire";
import { logInteraction } from "@/lib/tracking";
import {
  submitAnswer,
  completeQuestionnaire,
  loadQuestionnaireProgress,
  recordSlideTiming,
} from "./actions";
import { logout } from "@/app/[locale]/intervention/actions";
import Loader from "@/components/common/Loader";
import AudioPlayer from "./AudioPlayer";

function LanguageSwitcher({ locale, onSwitch }: { locale: string; onSwitch: (newLocale: string) => void }) {
  return (
    <div 
      className="flex items-center gap-1 bg-white/90 border border-slate-200/90 shadow-2xs rounded-full p-1 font-sans no-print"
      role="group"
      aria-label={locale === "es" ? "Seleccionar idioma" : "Language selection"}
    >
      <button
        type="button"
        onClick={() => onSwitch("en")}
        aria-pressed={locale === "en"}
        aria-label="Switch language to English"
        className={`px-3 py-1.5 min-h-[32px] text-xs font-extrabold rounded-full transition-all cursor-pointer flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a] ${
          locale === "en"
            ? "bg-[#236f7a] text-white shadow-xs"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        }`}
      >
        <span aria-hidden="true">🇺🇸</span> English
      </button>
      <button
        type="button"
        onClick={() => onSwitch("es")}
        aria-pressed={locale === "es"}
        aria-label="Cambiar idioma a Español"
        className={`px-3 py-1.5 min-h-[32px] text-xs font-extrabold rounded-full transition-all cursor-pointer flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a] ${
          locale === "es"
            ? "bg-[#236f7a] text-white shadow-xs"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        }`}
      >
        <span aria-hidden="true">🇲🇽</span> Español
      </button>
    </div>
  );
}

// ============ Types ============
interface BaseScreenProps {
  title: string;
  content?: string;
  description?: string;
  titleEn?: string;
  contentEn?: string;
  descriptionEn?: string;
  onNext: (explicitAnswer?: any) => void;
  onBack: () => void;
  loading: boolean;
  t: any;
  isFirstStep: boolean;
  locale?: string;
  headingRef?: React.RefObject<HTMLHeadingElement | null>;
  exitHeadingRef?: React.RefObject<HTMLHeadingElement | null>;
}

export default function PenpalIntervention() {
  const t = useTranslations("Intervention");
  const params = useParams();
  const router = useRouter();
  const initialLocale = (params.locale as string) || "en";
  const [currentLocale, setCurrentLocale] = useState<string>(initialLocale);

  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const exitHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const handleLanguageSwitch = (targetLocale: string) => {
    if (targetLocale === currentLocale) return;
    setCurrentLocale(targetLocale);
    try {
      if (typeof window !== "undefined") {
        let currentPath = window.location.pathname;
        currentPath = currentPath.replace(/^\/(en|es)(\/|$)/, "/");
        if (!currentPath.startsWith("/")) {
          currentPath = "/" + currentPath;
        }
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set("step", String(currentStepIndex));
        if (showSummary) {
          searchParams.set("report", "true");
        }
        const targetUrl = `/${targetLocale}${currentPath}?${searchParams.toString()}`;
        window.history.replaceState(null, "", targetUrl);
      }
    } catch (e) {
      console.warn("URL update warning:", e);
    }
  };

  const locale = currentLocale;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [bindingError, setBindingError] = useState<string | null>(null);
  const [isTerminated, setIsTerminated] = useState(false);

  const currentStep = questionnaireConfig[currentStepIndex];

  // Programmatic Focus Reset: Focus slide heading or exit heading when step changes (WCAG 2.4.3)
  useEffect(() => {
    if (initialized) {
      setTimeout(() => {
        if (isTerminated && exitHeadingRef.current) {
          exitHeadingRef.current.focus();
        } else if (headingRef.current) {
          headingRef.current.focus();
        }
      }, 50);
    }
  }, [currentStepIndex, showSummary, isTerminated, initialized]);

  useEffect(() => {
    async function init() {
      let progress = await loadQuestionnaireProgress();
      let localAnswers = false;

      if (progress.tokenDisplay) {
        setActiveToken(progress.tokenDisplay);
      }

      // ── IP-fingerprint binding failure ────────────────────────────────────────
      // The session's IP fingerprint (captured at first token validation) does
      // not match the current request.  Treat this as a hard auth failure — the
      // link may have been forwarded to an unauthorised device.
      if (progress.bindingError) {
        setBindingError(progress.bindingError);
        setInitialized(true);
        return;
      }

      // ── Fresh Participant / Session Cache Reset ─────────────────────────────────
      const currentParticipantId = progress.participantId;
      const storedParticipantId = localStorage.getItem("penpal_participant_id");

      if (
        (currentParticipantId && storedParticipantId !== currentParticipantId) ||
        (Object.keys(progress.answers || {}).length === 0)
      ) {
        localStorage.removeItem("penpal_progress");
        if (currentParticipantId) {
          localStorage.setItem("penpal_participant_id", currentParticipantId);
        }
        progress.answers = {};
        progress.lastStepId = null;
        localAnswers = false;
      } else if (!progress.lastStepId) {
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

      const searchParams = new URLSearchParams(window.location.search);
      const showReport = searchParams.get("report") === "true";
      const stepParam = searchParams.get("step");

      if (progress.isAllCompleted || showReport) {
        setShowSummary(true);
        setInitialized(true);
        return;
      }

      if (stepParam !== null && !isNaN(Number(stepParam))) {
        const parsedStep = parseInt(stepParam, 10);
        if (parsedStep >= 0 && parsedStep < questionnaireConfig.length) {
          setCurrentStepIndex(parsedStep);
        } else {
          setCurrentStepIndex(progress.resumeStepIndex || 0);
        }
      } else {
        setCurrentStepIndex(progress.resumeStepIndex || 0);
      }

      setInitialized(true);
    }

    init();
  }, []);

  const slideActiveMsRef = useRef<number>(0);
  const slideLastActiveRef = useRef<number>(Date.now());
  const isSlideVisibleRef = useRef<boolean>(true);

  // Active time tracker per slide with visibility change support
  useEffect(() => {
    slideActiveMsRef.current = 0;
    slideLastActiveRef.current = Date.now();
    isSlideVisibleRef.current = document.visibilityState === 'visible';

    const activeStep = currentStep;
    const stepIdx = currentStepIndex;

    const flushDuration = (useBeacon = false) => {
      const now = Date.now();
      if (isSlideVisibleRef.current) {
        const delta = now - slideLastActiveRef.current;
        if (delta > 0 && delta < 300000) {
          slideActiveMsRef.current += delta;
        }
      }
      slideLastActiveRef.current = now;

      const durationMs = slideActiveMsRef.current;
      if (activeStep && durationMs > 100) {
        slideActiveMsRef.current = 0;
        if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify({
            stepId: activeStep.id,
            stepIndex: stepIdx,
            durationMs,
            path: '/intervention/flow',
          })], { type: 'application/json' });
          navigator.sendBeacon('/api/tracking', blob);
        } else {
          recordSlideTiming(activeStep.id, stepIdx, durationMs).catch(() => {});
        }
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushDuration(true);
        isSlideVisibleRef.current = false;
      } else {
        isSlideVisibleRef.current = true;
        slideLastActiveRef.current = Date.now();
      }
    };

    const handleUnload = () => {
      flushDuration(true);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleUnload);
      flushDuration(false);
    };
  }, [currentStepIndex, initialized, currentStep]);

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
    let answer = explicitAnswer !== undefined ? explicitAnswer : answers[currentStep.id];

    // Calculate time spent on this question before submitting
    const now = Date.now();
    let currentSlideDwellMs = slideActiveMsRef.current;
    if (isSlideVisibleRef.current) {
      const delta = now - slideLastActiveRef.current;
      if (delta > 0 && delta < 300000) {
        currentSlideDwellMs += delta;
      }
    }

    // Default age slider to 9 if unadjusted
    if (answer === undefined && currentStep.type === "slider") {
      answer = 9;
      setAnswers((prev) => ({ ...prev, [currentStep.id]: 9 }));
    }

    // Default statistics to 5 if unadjusted
    if (answer === undefined && currentStep.type === "statistics") {
      answer = 5;
      setAnswers((prev) => ({ ...prev, [currentStep.id]: 5 }));
    }

    // For informational / non-question screens, record "acknowledged" instead of literal "undefined"
    if (answer === undefined || answer === null || answer === "undefined") {
      if (["intro", "testing_info", "text", "summary"].includes(currentStep.type)) {
        answer = "acknowledged";
      } else {
        answer = "none_selected";
      }
    }

    const answerPayload = typeof answer === "object" ? JSON.stringify(answer) : String(answer);

    try {
      await submitAnswer(currentStep.id, answerPayload, Math.round(currentSlideDwellMs));
      await logInteraction(
        "QUESTION_ANSWER",
        { stepId: currentStep.id, answer, dwellMs: Math.round(currentSlideDwellMs) },
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-sans bg-[#f4f8e8] relative">
        <div className="absolute top-6 right-6 z-20">
          <LanguageSwitcher locale={locale} onSwitch={handleLanguageSwitch} />
        </div>
        <div className="max-w-xl w-full bg-white border border-slate-200 p-8 sm:p-12 text-center shadow-md rounded-3xl">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-6 rounded-full text-2xl font-bold shadow-sm">
            ✓
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
            {locale === "es" ? "¡Éxito!" : "Success"}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-8">
            {locale === "es"
              ? "Sus respuestas han sido registradas. Gracias por participar en el estudio PEN-PAL."
              : "Your responses have been recorded. Thank you for participating in the PEN-PAL study."}
          </p>
          
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <button 
              onClick={() => logout()}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-sm active:scale-[0.98] cursor-pointer"
            >
              {locale === "es" ? "Finalizar y Volver al Inicio" : "Finish & Return Home"}
            </button>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              {locale === "es" ? "La sesión se borrará" : "Session will be cleared"}
            </p>
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
    titleEn: currentStep.titleEn,
    contentEn: currentStep.contentEn,
    descriptionEn: currentStep.descriptionEn,
    onNext: handleNext,
    onBack: handleBack,
    loading,
    t,
    isFirstStep: currentStepIndex === 0,
    locale,
    headingRef,
    exitHeadingRef,
  };

  return (
    <main 
      className="min-h-screen min-h-[100dvh] w-full max-w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative font-sans bg-[#f4f8e8] overflow-x-hidden overflow-y-auto"
      role="main"
      aria-label={locale === "es" ? "Evaluación Interactiva PEN-PAL" : "PEN-PAL Interactive Assessment"}
    >
      {/* WCAG 2.4.1 Skip Link */}
      <a 
        href="#slide-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#236f7a] focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
      >
        {locale === "es" ? "Saltar al contenido principal" : "Skip to main content"}
      </a>

      {/* Decorative ambient background glows with motion-reduce safety */}
      <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-teal-300/10 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none animate-pulse motion-reduce:animate-none" aria-hidden="true"></div>
      <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-indigo-300/15 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none animate-pulse motion-reduce:animate-none" aria-hidden="true"></div>

      {loading && <Loader fullScreen />}
      {navigating && <Loader fullScreen />}
      <div className="w-full max-w-4xl relative z-10 my-auto space-y-2 py-0 transition-all duration-300 overflow-x-hidden">
        {/* Header Bar with Logo and Language Selector */}
        <header className="flex items-center justify-between px-3 sm:px-4 py-1.5 bg-white/90 backdrop-blur border border-slate-200/90 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#236f7a]" aria-hidden="true"></span>
            <span className="font-black text-xs tracking-tight text-[#236f7a] font-display">PEN-PAL</span>
            <span className="text-slate-300 text-xs" aria-hidden="true">|</span>
            <span 
              className="text-[11px] font-bold text-slate-700"
              aria-label={locale === "es" ? `Progreso: Paso ${currentStepIndex + 1} de ${questionnaireConfig.length}` : `Progress: Step ${currentStepIndex + 1} of ${questionnaireConfig.length}`}
            >
              {locale === "es"
                ? `Paso ${currentStepIndex + 1} de ${questionnaireConfig.length}`
                : `Step ${currentStepIndex + 1} of ${questionnaireConfig.length}`}
            </span>
            {activeToken && (
              <>
                <span className="text-slate-300 text-xs hidden xs:inline" aria-hidden="true">|</span>
                <span 
                  role="region"
                  aria-label={locale === "es" ? `ID de participante: ${activeToken}` : `Participant ID: ${activeToken}`}
                  className="text-[10px] font-bold text-[#1f5c66] bg-[#f4f8e8] border border-[#35727f]/30 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1 shadow-2xs"
                >
                  <span aria-hidden="true">🔑</span> <span className="text-[9px] uppercase tracking-wider text-slate-600">ID:</span> {activeToken}
                </span>
              </>
            )}
          </div>

          {/* Language Switcher Pill Button */}
          <LanguageSwitcher locale={locale} onSwitch={handleLanguageSwitch} />
        </header>

        <div className="w-full">
          {/* Compact Tablet / iPad Device Frame */}
          <div className="flex-1 w-full bg-zinc-900 border-[6px] sm:border-[10px] border-zinc-900 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl relative p-0.5 ring-1 ring-white/10 overflow-hidden">
            <div className="rounded-[1.2rem] sm:rounded-[1.6rem] overflow-hidden">
              {isTerminated ? (
                <div className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg text-center max-w-xl mx-auto space-y-4 my-2">
                  <h2
                    ref={exitHeadingRef}
                    tabIndex={-1}
                    className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] rounded-lg"
                  >
                    {locale === "es" ? "¡Gracias por su tiempo!" : "Thank You for Your Time!"}
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto font-medium">
                    {locale === "es"
                      ? "Actualmente este estudio está destinado a padres de niños con sospecha de alergia a la penicilina. Dado que su hijo no presenta alergia a la penicilina, no se requiere ninguna acción adicional."
                      : "This study is currently intended for parents of children who have a reported or suspected penicillin allergy. Since your child does not have a penicillin allergy, no further action is needed."}
                  </p>
                  <div className="pt-3">
                    <a
                      href="/"
                      className="inline-block bg-[#82bdad] hover:bg-[#71ad9d] text-[#193630] font-bold py-2.5 px-8 rounded-full text-xs sm:text-sm transition shadow-sm cursor-pointer border border-[#71ad9d] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
                    >
                      {locale === "es" ? "Volver al inicio" : "Return to Start"}
                    </a>
                  </div>
                </div>
              ) : showSummary ? (
                <SummaryReportScreen
                  answers={answers}
                  activeToken={activeToken}
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
                    audioSrc={locale === "es" ? currentStep.audioEs : currentStep.audioEn}
                    stepId={currentStep.id}
                    locale={locale}
                    transcriptText={
                      locale === "es"
                        ? `${currentStep.titleEs || ""}. ${currentStep.descriptionEs || ""}`
                        : `${currentStep.titleEn || ""}. ${currentStep.descriptionEn || ""}`
                    }
                  />

                  {currentStep.type === "intro" && (
                    <IntroScreen
                      {...baseProps}
                      onAnswer={handleAnswer}
                      onNoBranching={() => setIsTerminated(true)}
                    />
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
                  {currentStep.type === "text" && <TextScreen {...baseProps} />}
                  {currentStep.type === "summary" && (
                    <SummaryScreen {...baseProps} answers={answers} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ============ Shared Components ============

function NavigationFooter({ onBack, onNext, loading, isFirstStep, t, locale }: Omit<BaseScreenProps, 'title' | 'content' | 'description'> & { locale?: string }) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center pt-4 mt-4 border-t border-slate-300/40 gap-3 sm:gap-0">
      <button
        type="button"
        className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#2b3e34] hover:text-black disabled:opacity-0 transition-colors duration-250 no-print cursor-pointer"
        disabled={isFirstStep || loading}
        onClick={onBack}
        aria-label={locale === "es" ? "Volver al paso anterior" : "Go back to previous step"}
      >
        ← {t("back")}
      </button>
      <button
        type="button"
        onClick={() => onNext()}
        disabled={loading}
        aria-label={locale === "es" ? "Continuar al siguiente paso" : "Continue to next step"}
        className="px-8 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-250 flex items-center justify-center bg-[#82bdad] hover:bg-[#71ad9d] text-[#193630] rounded-full hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm no-print font-sans border border-[#71ad9d]"
      >
        {loading ? "..." : t("next")}
      </button>
    </div>
  );
}

// ============ Screen Components ============

function IntroScreen({ title, description, content, onNext, onAnswer, loading, t, locale, headingRef, onNoBranching }: BaseScreenProps & { onAnswer: (val: string) => void; onNoBranching?: () => void }) {
  const introSubtitle = description || (locale === "es" ? "Padres Involucrados en Alergias a la Penicilina" : "Parents Engaged in Penicillin Allergies");
  const mainContent = content ? content.split('\n\n')[0] : (locale === "es" ? "Esta es la enfermera Anna. Anna está brindando información sobre alergias a la penicilina en niños." : "This is nurse Anna. Anna is giving information about allergies to penicillin in kids.");
  const questionPrompt = content && content.split('\n\n')[1] ? content.split('\n\n')[1] : (locale === "es" ? "¿Quieres saber más?" : "Do you want to know more?");

  return (
    <div id="slide-content" className="bg-gradient-to-br from-[#a2b4ff] via-[#8ce5ce] to-[#eef8ce] border border-white/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <h1 
              ref={headingRef}
              tabIndex={-1}
              className="text-4xl sm:text-5xl font-black text-[#1d5c64] tracking-tight font-display outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] rounded-lg"
            >
              {title || "PEN–PAL"}
            </h1>
            <p className="text-base sm:text-lg font-bold text-[#1f382f]">{introSubtitle}</p>
          </div>

          <div className="text-[#1f382f] leading-relaxed whitespace-pre-line text-sm sm:text-base font-medium max-w-xl">
            {mainContent}
          </div>

          <fieldset className="border-0 p-0 m-0 space-y-2.5 pt-1">
            <legend className="text-base sm:text-lg font-bold text-[#1f382f] mb-2">{questionPrompt}</legend>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  onAnswer("yes");
                  onNext("yes");
                }}
                disabled={loading}
                aria-label={locale === "es" ? "Sí, quiero saber más sobre la alergia a la penicilina" : "Yes, I want to learn more about penicillin allergy"}
                className="px-6 py-2.5 min-h-[44px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] rounded-xl font-bold text-sm transition shadow-sm active:scale-[0.98] no-print cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
              >
                {loading ? "..." : t("yes")}
              </button>
              <button
                type="button"
                onClick={() => {
                  onAnswer("no");
                  if (onNoBranching) {
                    onNoBranching();
                  }
                }}
                disabled={loading}
                aria-label={locale === "es" ? "No, salir o finalizar" : "No, do not continue"}
                className="px-6 py-2.5 min-h-[44px] bg-[#82bdad] hover:bg-[#71ad9d] text-[#193630] border border-[#71ad9d] rounded-xl font-bold text-sm transition active:scale-[0.98] no-print cursor-pointer shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
              >
                {t("no")}
              </button>
            </div>
          </fieldset>
        </div>

        {/* Nurse Anna Illustration */}
        <div className="flex-shrink-0 relative flex items-center justify-center p-2 self-end md:self-end mt-auto">
          <img
            src="/images/nurse-anna.png"
            alt={locale === "es" ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            role="img"
            aria-label={locale === "es" ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            className="w-20 sm:w-20 md:w-20 h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}

function StatisticsScreen({ title, content, value, onNext, onBack, onSelect, loading, t, locale, isFirstStep, headingRef }: BaseScreenProps & { value?: any; onSelect?: (val: number) => void }) {
  const allergicCount = 5;
  const totalKids = 100;

  return (
    <div id="slide-content" className="bg-[#f4f8e8] border border-slate-200/60 rounded-2xl p-3 sm:p-4.5 md:p-5 shadow-lg relative overflow-hidden">
      <div className="text-center space-y-0.5 mb-2">
        <h2 
          ref={headingRef}
          tabIndex={-1}
          className="text-base sm:text-lg md:text-xl font-extrabold text-[#2d221b] max-w-3xl mx-auto tracking-tight leading-snug outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] rounded-lg"
        >
          {title}
        </h2>
        <p className="text-xs sm:text-xs font-bold text-[#2d221b] max-w-2xl mx-auto">
          {content}
        </p>
      </div>

      <div className="mb-2 text-center select-none">
        {/* Main 100 Kids Card */}
        <div className="mx-auto max-w-2xl sm:max-w-3xl p-3 sm:p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-xs mb-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* GROUP 1: 95 Safe Children (Treated as an accessible graphic) */}
            <div
              role="img"
              aria-label={
                locale === "es"
                  ? "Grupo de 95 niños que no tienen una alergia real y pueden tomar penicilina de manera segura."
                  : "Group of 95 children who do not have a real allergy and can safely take penicillin."
              }
              className="grid grid-cols-10 sm:grid-cols-19 gap-0.5 sm:gap-1 justify-center p-1"
            >
              {/* Screen reader text backup (guarantees VoiceOver speaks it) */}
              <span className="sr-only">
                {locale === "es"
                  ? "Grupo de 95 niños que pueden tomar penicilina de manera segura."
                  : "Group of 95 children who can safely take penicillin."}
              </span>
              {/* Visual icons hidden from audio clutter */}
              <div aria-hidden="true" className="contents">
                {Array(95)
                  .fill(0)
                  .map((_, i) => {
                    const isGirl = i % 2 === 0;
                    return (
                      <div key={`safe-${i}`} className="flex items-center justify-center p-0.5">
                        <KidIcon isAllergic={false} isGirl={isGirl} />
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* GROUP 2: 5 Allergic Children (Treated as an accessible graphic + color-blind box) */}
            <div
              role="img"
              aria-label={
                locale === "es"
                  ? "Grupo de 5 niños destacados en un recuadro que sí tienen una alergia real a la penicilina."
                  : "Group of 5 children highlighted in an orange box who have a true penicillin allergy."
              }
              className="flex items-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 bg-orange-100/90 border-2 border-[#c84a26] rounded-xl shadow-2xs"
            >
              {/* Screen reader text backup */}
              <span className="sr-only">
                {locale === "es"
                  ? "Grupo de 5 niños destacados en un recuadro que sí tienen una alergia real a la penicilina."
                  : "Group of 5 children highlighted in an orange box who have a true penicillin allergy."}
              </span>
              {/* Visual icons hidden from audio clutter */}
              <div aria-hidden="true" className="contents">
                {Array(5)
                  .fill(0)
                  .map((_, i) => {
                    const isGirl = i % 2 === 0;
                    return (
                      <div key={`allergic-${i}`} className="flex items-center justify-center p-0.5">
                        <KidIcon isAllergic={true} isGirl={isGirl} />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Text Summary Badge */}
        <div className="flex justify-end max-w-2xl sm:max-w-3xl mx-auto pr-2">
          <p className="text-[11px] sm:text-xs font-bold text-[#2d221b] bg-amber-50/80 border border-amber-200 px-3 py-1 rounded-xl shadow-2xs">
            {locale === "es" ? "solo" : "only"}{" "}
            <span className="text-xs sm:text-sm font-black text-[#c84a26] mx-0.5">
              {allergicCount}
            </span>{" "}
            {locale === "es" ? "tienen una alergia real" : "have a real allergy"}
          </p>
        </div>
      </div>

      {/* Centered Yellow Next Button */}
      <div className="flex justify-center pt-1 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => onNext(5)}
          disabled={loading}
          aria-label={locale === "es" ? "Continuar al siguiente paso" : "Continue to next step"}
          className="px-8 py-2 min-h-[44px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] rounded-full font-bold text-xs transition shadow-sm active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {loading ? "..." : t("next")}
        </button>
      </div>
    </div>
  );
}

const KidIcon = memo(function KidIcon({ isAllergic, isGirl }: { isAllergic: boolean; isGirl: boolean }) {
  const color = isAllergic ? "#c84a26" : "#1f5c66";
  return (
    <svg viewBox="0 0 32 32" className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 select-none pointer-events-none" aria-hidden="true">
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
        <path
          d="M 16 5.5 C 10 5.5, 7.5 9.5, 7.5 15 C 7.5 19.5, 9 22, 10.5 22 C 11.5 21, 11 18, 10 16 C 12.5 11.5, 15 10.5, 16.5 10.5 C 18 10.5, 20 11.5, 22 16 C 21 18, 20.5 21, 21.5 22 C 23 22, 24.5 19.5, 24.5 15 C 24.5 9.5, 22 5.5, 16 5.5 Z"
          fill={color}
        />
      ) : (
        <path
          d="M 16 5.5 C 10.5 5.5, 8 9, 8 13.5 C 10 12.8, 12 11, 14.5 11.8 C 17 10.8, 20.5 10.8, 24 13.5 C 24 9, 21.5 5.5, 16 5.5 Z"
          fill={color}
        />
      )}
    </svg>
  );
});


function TestingScreen(props: BaseScreenProps) {
  const isSpanish = props.locale === "es";

  return (
    <div id="slide-content" className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-5 sm:p-6 md:p-8 shadow-lg relative overflow-hidden">
      <div className="space-y-3 max-w-3xl pb-2">
        <h2 
          ref={props.headingRef}
          tabIndex={-1}
          className="text-lg sm:text-xl md:text-2xl font-black text-[#2d221b] tracking-tight leading-snug outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] rounded-lg"
        >
          {props.title || (isSpanish ? "¡Hable con el médico sobre la alergia de su hijo!" : "Talk to the doctor about your child's allergy!")}
        </h2>
        
        {/* Semantic 2-Item Bullet List (WCAG 1.3.1) */}
        <ul className="space-y-2.5 text-[#2d221b] text-xs sm:text-sm font-medium leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-[#236f7a] font-bold shrink-0 mt-0.5" aria-hidden="true">•</span>
            <span>
              {isSpanish
                ? "Los médicos pueden comprobar si la reacción de su hijo fue solo un efecto secundario y no una alergia."
                : "Doctors can check to see if your child's reaction was just a side-effect and not an allergy."}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#236f7a] font-bold shrink-0 mt-0.5" aria-hidden="true">•</span>
            <span>
              {isSpanish
                ? "También hay una prueba simple que puede saber si su hijo tiene una alergia."
                : "There is also a simple test that can tell if your child has an allergy."}
              <span className="block text-slate-700 text-[11px] sm:text-xs mt-0.5 font-normal">
                {isSpanish
                  ? "Para la prueba, los niños tragan medicamentos. A veces, los niños también toman medicamentos a través de un pinchazo en la piel."
                  : "For the test, kids swallow medicine. Sometimes, kids also take medicine through a skin prick."}
              </span>
            </span>
          </li>
        </ul>

        {/* Distinct Bottom Paragraph (No Bullet) */}
        <p className="text-xs sm:text-sm font-bold text-[#1f382f] pt-1">
          {isSpanish
            ? "Si su hijo puede tomar penicilina de manera segura, no es alérgico."
            : "If your child can safely take penicillin, they are not allergic."}
        </p>
      </div>

      {/* Nurse Anna Illustration */}
      <div className="absolute bottom-10 right-4 sm:bottom-12 sm:right-6 md:bottom-14 md:right-8 pointer-events-none z-10">
        <img
          src="/images/nurse-anna.png"
          alt={isSpanish ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
          role="img"
          aria-label={isSpanish ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
          className="w-20 sm:w-20 md:w-20 h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
        />
      </div>

      {/* Centered Yellow Next Button */}
      <div className="flex justify-center pt-2 mt-3 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => props.onNext()}
          disabled={props.loading}
          className="px-8 py-2 min-h-[44px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] rounded-full font-bold text-xs transition shadow-sm active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
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
          <h2 
            ref={props.headingRef}
            tabIndex={-1}
            className="text-2xl sm:text-3xl font-extrabold text-[#1f382f] tracking-tight leading-snug outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] rounded-lg"
          >
            {props.title}
          </h2>
          <blockquote className="text-[#1f382f] leading-relaxed space-y-3 whitespace-pre-line text-base font-medium bg-white/70 p-6 rounded-2xl border border-white/80 shadow-sm backdrop-blur-sm italic">
            {props.content}
          </blockquote>
        </div>
        <div className="flex-shrink-0 w-28 h-28 flex items-center justify-center text-7xl md:sticky md:top-4 select-none filter drop-shadow-md" aria-hidden="true">
          👩‍👦
        </div>
      </div>
      <NavigationFooter {...props} />
    </div>
  );
}

function SurveyMultipleChoice({ title, options, selected = [], onSelect, ...navProps }: BaseScreenProps & { options: any; selected: string[]; onSelect: (val: string[]) => void }) {
  const [otherText, setOtherText] = useState<string>("");

  const handleToggle = (value: string) => {
    if (value === "Unsure") {
      onSelect(selected?.includes("Unsure") ? [] : ["Unsure"]);
      return;
    }
    const cleanList = selected?.filter((v: string) => v !== "Unsure") || [];
    const updated = cleanList.includes(value)
      ? cleanList.filter((v: string) => v !== value)
      : [...cleanList, value];
    onSelect(updated);
  };

  const isKnowledgeTest = options[0]?.value?.startsWith("curing_");

  return (
    <div id="slide-content" className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-4 sm:p-5 md:p-6 shadow-lg relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start justify-between">
        <div className="flex-1 max-w-3xl pb-2">
          {/* 1. Heading & Subtitle Outside Fieldset (Eliminates Double Title Announcement) */}
          <div className="mb-3">
            {navProps.description && (
              <p className="text-sm sm:text-base font-semibold text-[#2d221b] mb-0.5">{navProps.description}</p>
            )}
            <h2 
              ref={navProps.headingRef}
              tabIndex={-1}
              className="text-base sm:text-lg md:text-xl font-black text-[#2d221b] tracking-tight leading-snug outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] rounded-lg"
            >
              {title}
            </h2>
          </div>

          {/* 2. Semantic Fieldset Grouping Only for Options */}
          <fieldset className="border-0 p-0 m-0 space-y-2.5">
            <legend className="sr-only">
              {navProps.locale === "es" ? "Opciones de preguntas" : "Question options"}
            </legend>

            {/* If Pill Style (Symptoms Multi-Select) */}
            {!isKnowledgeTest ? (
              <div className="bg-[#8caeab] p-3.5 sm:p-4.5 rounded-2xl shadow-inner max-w-3xl">
                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  {options.map((opt: any) => {
                    const isSelected = selected?.includes(opt.value);
                    const label = navProps.locale === "es" ? opt.labelEs : opt.labelEn;

                    if (opt.value === "Other") {
                      return (
                        <div
                          key={opt.value}
                          className={`px-3.5 py-2 min-h-[44px] inline-flex items-center gap-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs border ${
                            isSelected
                              ? "bg-[#1f5c66] text-white border-[#1f5c66] shadow-md ring-2 ring-[#1f5c66]/40"
                              : "bg-white text-[#132c27] border-white/80 hover:bg-slate-50"
                          }`}
                        >
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={isSelected}
                            onClick={() => handleToggle("Other")}
                            onKeyDown={(e) => {
                              if (e.key === " " || e.key === "Enter") {
                                e.preventDefault();
                                handleToggle("Other");
                              }
                            }}
                            aria-label={label}
                            className="inline-flex items-center gap-1.5 cursor-pointer focus:outline-none"
                          >
                            {isSelected && <span aria-hidden="true" className="text-amber-300 font-black">✓</span>}
                            <span>{navProps.locale === "es" ? "Otro: por favor describa" : "Other: Please describe"}</span>
                          </button>
                          {isSelected && (
                            <input
                              type="text"
                              id="other-symptom-text"
                              aria-label={navProps.locale === "es" ? "Describa otro síntoma" : "Describe other symptom"}
                              placeholder="..."
                              value={otherText}
                              onChange={(e) => setOtherText(e.target.value)}
                              className="bg-white/20 text-white placeholder-white/60 border-b border-white/80 px-2 py-0.5 text-xs font-semibold focus:outline-none max-w-[130px] rounded"
                            />
                          )}
                        </div>
                      );
                    }

                    return (
                      <button
                        type="button"
                        key={opt.value}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onClick={() => handleToggle(opt.value)}
                        onKeyDown={(e) => {
                          if (e.key === " " || e.key === "Enter") {
                            e.preventDefault();
                            handleToggle(opt.value);
                          }
                        }}
                        aria-label={label}
                        className={`px-3.5 py-2.5 min-h-[44px] inline-flex items-center gap-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs border cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                          isSelected
                            ? "bg-[#1f5c66] text-white border-[#1f5c66] shadow-md ring-2 ring-[#1f5c66]/40"
                            : "bg-white text-[#132c27] border-white/80 hover:bg-slate-50"
                        }`}
                      >
                        {isSelected && <span aria-hidden="true" className="text-amber-300 font-black">✓</span>}
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Toggle Switch Style (Knowledge Test) - WCAG 4.1.2 Clean */
              <div className="space-y-2.5 pt-1">
                {options.map((opt: any, idx: number) => {
                  const isSelected = selected?.includes(opt.value);
                  const label = navProps.locale === "es" ? opt.labelEs : opt.labelEn;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      role="switch"
                      aria-checked={isSelected}
                      onClick={() => handleToggle(opt.value)}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          handleToggle(opt.value);
                        }
                      }}
                      aria-label={(idx + 1) + ". " + label}
                      className="w-full text-left flex items-center gap-3 cursor-pointer group select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] rounded-xl p-1 min-h-[44px]"
                    >
                      {/* Visual Toggle Track (Suppressed from screen readers) */}
                      <div className="flex flex-col items-center shrink-0 pt-0.5" aria-hidden="true">
                        <div className={`w-12 h-5 rounded-full p-0.5 transition-colors duration-200 ${isSelected ? 'bg-[#1f5c66]' : 'bg-[#6b808e]'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white border border-slate-300 shadow-sm transform transition-transform duration-200 ${isSelected ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                        <div className="flex justify-between w-full px-1 text-[10px] font-extrabold text-[#2d221b] mt-0.5 leading-none">
                          <span>×</span>
                          <span>✓</span>
                        </div>
                      </div>

                      <span className="text-xs sm:text-sm font-semibold text-[#2d221b] leading-snug">
                        {idx + 1}. {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>
        </div>

        {/* Nurse Anna Illustration */}
        <div className="flex-shrink-0 self-end md:self-end mt-auto p-1 hidden sm:block">
          <img
            src="/images/nurse-anna.png"
            alt={navProps.locale === "es" ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            role="img"
            aria-label={navProps.locale === "es" ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            className="w-16 sm:w-20 md:w-20 h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Centered Yellow Next Button */}
      <div className="flex justify-center pt-2 mt-3 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => {
            const isSpanish = navProps.locale === "es";
            // Merge custom otherText into the submitted array
            const finalSelected = (selected || []).map((item: string) => {
              if (item === "Other" || item.startsWith("Other") || item === "Otro" || item.startsWith("Otro")) {
                return otherText.trim()
                  ? (isSpanish ? "Otro: " + otherText.trim() : "Other: " + otherText.trim())
                  : (isSpanish ? "Otro" : "Other");
              }
              return item;
            });
            navProps.onNext(finalSelected);
          }}
          disabled={navProps.loading}
          className="px-8 py-2 min-h-[44px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] rounded-full font-bold text-xs transition shadow-sm active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {navProps.loading ? "..." : navProps.t("next")}
        </button>
      </div>
    </div>
  );
}

function SurveySingleChoice({ title, options, selected, onSelect, ...navProps }: BaseScreenProps & { options: any; selected: string; onSelect: (val: string) => void }) {
  return (
    <div id="slide-content" className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-5 sm:p-6 md:p-8 shadow-lg relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start justify-between">
        <div className="flex-1 max-w-3xl pb-2">
          {/* 1. Heading & Description Outside Fieldset (WCAG 2.4.3 Focus Target) */}
          <div className="mb-3">
            {navProps.description && (
              <p className="text-base sm:text-lg font-semibold text-[#2d221b] mb-1">{navProps.description}</p>
            )}
            <h2 
              ref={navProps.headingRef}
              tabIndex={-1}
              className="text-xl sm:text-2xl font-black text-[#2d221b] tracking-tight leading-snug outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] rounded-lg"
            >
              {title}
            </h2>
          </div>

          {/* 2. Semantic Fieldset for Radio Options Grouping (WCAG 1.3.1) */}
          <fieldset className="border-0 p-0 m-0 space-y-4">
            <legend className="sr-only">
              {navProps.locale === "es" ? "Opciones de selección única" : "Single choice options"}
            </legend>

            {/* Teal Container Card with White Pill Buttons */}
            <div className="bg-[#8caeab] p-4 sm:p-5 rounded-3xl shadow-inner max-w-3xl">
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {options.map((opt: any) => {
                  const isSelected = selected === opt.value;
                  const label = navProps.locale === "es" ? opt.labelEs : opt.labelEn;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onClick={() => onSelect(opt.value)}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          onSelect(opt.value);
                        }
                      }}
                      aria-label={label}
                      className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm border cursor-pointer inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                        isSelected
                          ? "bg-[#1f5c66] text-white border-[#1f5c66] shadow-md ring-2 ring-[#1f5c66]/40"
                          : "bg-white text-[#132c27] border-white/80 hover:bg-slate-50"
                      }`}
                    >
                      {isSelected && <span aria-hidden="true" className="text-amber-300 font-black">✓</span>}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </fieldset>
        </div>

        {/* Nurse Anna Illustration */}
        <div className="flex-shrink-0 self-end md:self-end mt-auto p-1 hidden sm:block">
          <img
            src="/images/nurse-anna.png"
            alt={navProps.locale === "es" ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            role="img"
            aria-label={navProps.locale === "es" ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            className="w-16 sm:w-20 md:w-20 h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Centered Yellow Next Button */}
      <div className="flex justify-center pt-3 mt-4 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => navProps.onNext(selected)}
          disabled={navProps.loading}
          className="px-8 py-2 min-h-[44px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] rounded-full font-bold text-sm transition shadow-sm active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {navProps.loading ? "..." : navProps.t("next")}
        </button>
      </div>
    </div>
  );
}

// Milestone tick marks for accurate positioning
const milestoneTicks = [
  { val: 1, labelEn: "<1 yr", labelEs: "<1 año" },
  { val: 5, labelEn: "5 yrs", labelEs: "5 años" },
  { val: 10, labelEn: "10 yrs", labelEs: "10 años" },
  { val: 15, labelEn: "15 yrs", labelEs: "15 años" },
  { val: 20, labelEn: "20 yrs", labelEs: "20 años" },
  { val: 26, labelEn: "26 yrs", labelEs: "26 años" },
];

function SurveySlider({ title, min, max, unit, selected, onSelect, ...navProps }: BaseScreenProps & { min?: number; max?: number; unit?: string; selected: number; onSelect: (val: number) => void }) {
  const isSpanish = navProps.locale === "es";
  const minVal = min || 1;
  const maxVal = max || 26;
  const value = selected || 9;

  const displayTitle =
    title ||
    (isSpanish
      ? "¿Qué edad tenía su hijo cuando ocurrió la reacción?"
      : "How old was your child when the reaction happened?");
  const instructionText =
    navProps.description ||
    (isSpanish
      ? "Arrastre el control o use las teclas de flecha para seleccionar la edad."
      : "Drag the slider or use arrow keys to select your child's age.");

  // Mathematical percentage calculation (0% to 100%)
  const percentage = Math.max(
    0,
    Math.min(100, ((value - minVal) / (maxVal - minVal)) * 100)
  );

  return (
    <div
      id="slide-content"
      className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden"
    >
      <div className="space-y-4 max-w-3xl pb-2">
        {/* Main Heading (Auto-Focus Target) */}
        <h2 
          ref={navProps.headingRef}
          tabIndex={-1}
          className="text-xl sm:text-2xl font-black text-[#2d221b] tracking-tight leading-snug outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] rounded-lg"
        >
          {displayTitle}
        </h2>

        {/* Sage Container Card with Safe Right Padding to prevent Nurse Anna collision */}
        <div className="bg-[#8caeab] p-6 sm:p-7 pr-16 sm:pr-24 rounded-3xl text-[#132c27] shadow-inner relative space-y-5 max-w-3xl">
          <p className="text-xs sm:text-sm font-semibold text-[#132c27] leading-snug">
            {instructionText}
          </p>

          {/* Interactive Slider Area */}
          <div className="relative pt-8 pb-6 px-1">
            {/* Dynamic Floating Yellow Value Badge */}
            <div 
              aria-hidden="true"
              className="absolute top-0 -translate-x-1/2 bg-[#f0d411] text-[#1f382f] font-black text-xs px-3 py-1 rounded-full border border-[#e0c406] shadow-sm transition-all pointer-events-none whitespace-nowrap"
              style={{
                left: percentage + "%"
              }}
            >
              {value} {isSpanish ? (value === 1 ? "año" : "años") : (value === 1 ? "yr" : "yrs")}
            </div>

            {/* Native Accessible Range Input */}
            <input
              type="range"
              min={minVal}
              max={maxVal}
              value={value}
              aria-valuemin={minVal}
              aria-valuemax={maxVal}
              aria-valuenow={value}
              aria-valuetext={
                isSpanish
                  ? value + " " + (unit || (value === 1 ? "año de edad" : "años de edad"))
                  : value + " " + (unit || (value === 1 ? "year old" : "years old"))
              }
              aria-label={displayTitle}
              onChange={(e) => onSelect(Number(e.target.value))}
              className="w-full h-3.5 bg-[#234b50] rounded-lg appearance-none cursor-pointer accent-[#f0d411] hover:accent-[#e1c504] transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
            />

            {/* Mathematically Aligned Milestone Ticks */}
            <div
              className="relative w-full h-6 mt-3 text-[10px] sm:text-[11px] font-bold text-[#132c27] select-none"
              aria-hidden="true"
            >
              {milestoneTicks.map((tick) => {
                const tickPct = ((tick.val - minVal) / (maxVal - minVal)) * 100;
                return (
                  <span
                    key={tick.val}
                    className="absolute -translate-x-1/2 whitespace-nowrap text-center"
                    style={{ left: tickPct + "%" }}
                  >
                    {isSpanish ? tick.labelEs : tick.labelEn}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Nurse Anna Illustration (Safe Positioned Outside Text Area) */}
      <div className="absolute bottom-8 right-3 sm:bottom-10 sm:right-6 pointer-events-none z-10">
        <img
          src="/images/nurse-anna.png"
          alt={
            isSpanish
              ? "Ilustración de la enfermera Anna sonriendo"
              : "Illustration of Nurse Anna smiling in blue scrubs"
          }
          className="w-20 sm:w-24 h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
        />
      </div>

      {/* Centered Yellow Next Button */}
      <div className="flex justify-center pt-3 mt-4 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => navProps.onNext(value)}
          disabled={navProps.loading}
          className="px-8 py-2 min-h-[44px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] rounded-full font-bold text-sm transition shadow-sm active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {navProps.loading ? "..." : navProps.t("next")}
        </button>
      </div>
    </div>
  );
}

function TextScreen({ title, description, content, ...navProps }: BaseScreenProps) {
  return (
    <div id="slide-content" className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
      <div className="space-y-4 max-w-3xl pb-2 text-center md:text-left min-h-[12rem]">
        <h2 
          ref={navProps.headingRef}
          tabIndex={-1}
          className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#2d221b] max-w-3xl tracking-tight leading-relaxed outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] rounded-lg"
        >
          {title}
        </h2>
        {description && (
          <p className="text-sm sm:text-base font-medium text-[#2d221b] max-w-3xl">{description}</p>
        )}
      </div>

      {/* Nurse Anna Illustration */}
      <div className="absolute bottom-10 right-4 sm:bottom-12 sm:right-6 md:bottom-14 md:right-8 pointer-events-none z-10">
        <img
          src="/images/nurse-anna.png"
          alt={navProps.locale === "es" ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
          role="img"
          aria-label={navProps.locale === "es" ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
          className="w-20 sm:w-20 md:w-20 h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
        />
      </div>

      {/* Centered Yellow Next Button */}
      <div className="flex justify-center pt-3 mt-4 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => navProps.onNext()}
          disabled={navProps.loading}
          className="px-8 py-2 min-h-[44px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] rounded-full font-bold text-sm transition shadow-sm active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {navProps.loading ? "..." : navProps.t("next")}
        </button>
      </div>
    </div>
  );
}

function SummaryScreen({ title, content, answers, onNext, onBack, loading, t, locale, isFirstStep, headingRef }: BaseScreenProps & { answers: any }) {
  const summarySections = [
    {
      id: "screen2_statistics",
      labelKey: "statisticsTitle",
      defaultValue: "Statistics: Understanding Penicillin Allergy Prevalence",
      getValue: () => {
        const count = answers?.screen2_statistics ?? 5;
        return locale === "es"
          ? "Solo " + count + " de 100 niños tienen alergia real."
          : "Only " + count + " out of 100 kids have a true allergy.";
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
        if (!val || (Array.isArray(val) && val.length === 0)) {
          return locale === "es" ? "Ninguno reportado" : "None reported";
        }
        const symArray = Array.isArray(val) ? val : [val];
        const step = questionnaireConfig.find((s) => s.id === "screen6_1_symptoms");
        return symArray
          .map((v: string) => {
            if (v === "Other: Please describe" || v === "Other" || v === "Otro: por favor describa" || v === "Otro") {
              return locale === "es" ? "Otro" : "Other";
            }
            if (v.startsWith("Other:") || v.startsWith("Otro:")) {
              return v.replace(/_____+/g, "").trim();
            }
            const opt = step?.options?.find((o: any) => o.value === v || o.labelEn === v || o.labelEs === v);
            return locale === "es" ? opt?.labelEs || v : opt?.labelEn || v;
          })
          .filter(Boolean)
          .join(", ");
      },
    },
    {
      id: "screen6_2_timing",
      labelKey: "timing",
      defaultValue: "Age at Reaction",
      getValue: () => {
        const val = answers?.screen6_2_timing;
        if (!val) return t("notProvided");
        return locale === "es" ? (val + " años") : (val + " years old");
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
    <div id="slide-content" className="print-container bg-white border border-slate-200/80 rounded-2xl shadow-md p-3.5 sm:p-5 max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col justify-between">
      <div className="print-section text-center">
        <h2 
          ref={headingRef}
          tabIndex={-1}
          className="text-base sm:text-lg font-black text-slate-900 mb-2 text-center tracking-tight leading-tight outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] rounded-lg"
        >
          {title}
        </h2>

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
          className="px-4 py-2 min-h-[44px] border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
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
          className="px-6 py-2 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {locale === "es" ? "Guardando..." : "Saving..."}
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


function SummaryReportScreen({ answers, activeToken, onProceedToSurvey, t, locale, navigating }: { answers: any; activeToken?: string | null; onProceedToSurvey: () => void; t: any; locale: string; navigating?: boolean }) {
  const isEs = locale === "es";

  // Formatted Allergy
  const rawAllergy = answers["screen2_allergy"];
  const allergy = rawAllergy
    ? (isEs && (rawAllergy === "Not Specified" || rawAllergy === "No especificada") ? t("notSpecified") : rawAllergy)
    : t("notSpecified");

  // Formatted Symptoms
  const rawSymptoms = answers["screen6_1_symptoms"];
  const formatSymptoms = () => {
    if (!rawSymptoms || (Array.isArray(rawSymptoms) && rawSymptoms.length === 0)) {
      return isEs ? "Ninguno reportado" : "None reported";
    }
    const symArray = Array.isArray(rawSymptoms) ? rawSymptoms : [rawSymptoms];
    const symptomsStep = questionnaireConfig.find((s) => s.id === "screen6_1_symptoms");
    return symArray
      .map((v: string) => {
        if (v === "Other: Please describe" || v === "Other" || v === "Otro: por favor describa" || v === "Otro") {
          return isEs ? "Otro" : "Other";
        }
        if (v.startsWith("Other:") || v.startsWith("Otro:")) {
          return v.replace(/_____+/g, "").trim();
        }
        const opt = symptomsStep?.options?.find((o: any) => o.value === v || o.labelEn === v || o.labelEs === v);
        return isEs ? (opt?.labelEs || v) : (opt?.labelEn || v);
      })
      .filter(Boolean)
      .join(", ");
  };
  const symptoms = formatSymptoms();

  // Formatted Timing / Age
  const rawTiming = answers["screen6_2_timing"];
  const formattedTiming = rawTiming
    ? rawTiming + (isEs ? " años" : " years old")
    : t("notProvided");

  // Formatted Time to Onset
  const rawOnset = answers["screen6_3_onset"];
  const formatOnset = () => {
    if (!rawOnset) return t("notProvided");
    const onsetStep = questionnaireConfig.find((s) => s.id === "screen6_3_onset");
    const opt = onsetStep?.options?.find((o) => o.value === rawOnset || o.labelEn === rawOnset || o.labelEs === rawOnset);
    return isEs ? (opt?.labelEs || rawOnset) : (opt?.labelEn || rawOnset);
  };
  const onset = formatOnset();

  return (
    <div id="slide-content" className="bg-white border border-slate-200/80 rounded-2xl shadow-md p-4 sm:p-6 max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col justify-between relative">
      <div>
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 no-print">
          <div className="flex items-center gap-2">
            <h1 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("assessmentReport")}</h1>
            {activeToken && (
              <span className="text-[10px] font-bold text-[#35727f] bg-[#f4f8e8] border border-[#35727f]/25 px-2.5 py-0.5 rounded-full font-mono shadow-2xs">
                🔑 <span className="text-[9px] uppercase tracking-wider text-slate-500">ID:</span> {activeToken}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            ✓ {t("completeSaved")}
          </span>
        </div>

        <div className="space-y-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-none mb-1">PEN-PAL</h2>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">{t("patientAllergyAssessment")}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{t("dateGenerated")}</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-700">{new Date().toLocaleDateString(isEs ? "es-ES" : "en-GB").split("/").join("-")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80 rounded-lg">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{t("primaryAllergy")}</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{allergy}</p>
            </div>
            <div className="bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80 rounded-lg">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{t("reportedSymptoms")}</p>
              <p className="text-xs font-semibold text-slate-700 leading-tight truncate sm:whitespace-normal">{symptoms}</p>
            </div>
            <div className="bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80 rounded-lg">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{t("timing")}</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{formattedTiming}</p>
            </div>
            <div className="bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80 rounded-lg">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{t("onset")}</p>
              <p className="text-xs font-semibold text-slate-700 leading-tight truncate">{onset}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 mt-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              {t("clinicalGuidance")}
            </h3>
            <p className="text-xs text-slate-600 leading-snug">
              {isEs ? (
                <>
                  Según las respuestas proporcionadas, su hijo tiene un historial documentado de alergia a <strong className="font-semibold text-slate-900">{allergy}</strong>. Los síntomas reportados ({symptoms}) indican un perfil clínico que puede requerir una evaluación adicional por parte de un especialista.
                </>
              ) : (
                <>
                  Based on the responses provided, your child has a documented history of <strong className="font-semibold text-slate-900">{allergy}</strong> allergy. The symptoms reported ({symptoms}) indicate a clinical profile that may require further evaluation by a specialist.
                </>
              )}
            </p>
            <p className="text-xs text-slate-600 leading-snug mt-1.5">
              {isEs
                ? "Este informe es parte del estudio de investigación PEN-PAL y debe conversarse con su pediatra o un alergólogo."
                : "This report is part of the PEN-PAL research study and should be discussed with your pediatrician or an allergist."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-2 pt-3 border-t border-slate-100 no-print justify-end shrink-0">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-5 py-2 min-h-[44px] border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all rounded-lg text-xs font-bold uppercase tracking-wider flex-1 sm:flex-none cursor-pointer active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9V2h12v7"></path>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          {t("print")}
        </button>
        <button
          type="button"
          onClick={onProceedToSurvey}
          disabled={navigating}
          className="flex items-center justify-center gap-1.5 px-6 py-2 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex-1 sm:flex-none disabled:opacity-50 cursor-pointer active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {navigating ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isEs ? "Redirigiendo..." : "Redirecting..."}
            </>
          ) : (
            <>
              <span>✓</span> {t("completeSave")}
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