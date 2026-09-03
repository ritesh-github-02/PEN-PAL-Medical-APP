"use client";

import React, { useState, useEffect, useRef, memo } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/routing";
import { questionnaireConfig, QuestionnaireStep, QuestionnaireOption } from "@/config/questionnaire";
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
import { generateAssessmentPDF } from "@/lib/generate-pdf";
import esMessages from "@/messages/es.json";
import enMessages from "@/messages/en.json";

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
  const nextIntlT = useTranslations("Intervention");
  const params = useParams();
  const router = useRouter();
  const initialLocale = (params.locale as string) || "en";
  const [currentLocale, setCurrentLocale] = useState<string>(initialLocale);

  const t = (key: string, values?: any): string => {
    const isEs = currentLocale === "es";
    const dict = isEs ? (esMessages as any).Intervention : (enMessages as any).Intervention;
    let text = dict?.[key];
    if (!text) {
      try {
        text = nextIntlT(key as any, values);
      } catch {
        text = key;
      }
    }
    return text || key;
  };

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
        // Cleanly update Next.js router locale
        try {
          router.replace(`${currentPath}?${searchParams.toString()}`, { locale: targetLocale });
        } catch {
          // fallback
        }
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
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const tokenParam = searchParams ? (searchParams.get('token') || searchParams.get('TOKEN') || searchParams.get('t') || undefined) : undefined;

      let progress = await loadQuestionnaireProgress(tokenParam, locale);
      let localAnswers = false;

      if (progress.tokenDisplay) {
        setActiveToken(progress.tokenDisplay);
      }

      // ── Participant ID tracking & Cache sync ─────────────────────────────────
      const currentParticipantId = progress.participantId;
      const storedParticipantId = localStorage.getItem("penpal_participant_id");

      if (currentParticipantId && storedParticipantId !== currentParticipantId) {
        localStorage.removeItem("penpal_progress");
        localStorage.setItem("penpal_participant_id", currentParticipantId);
      }

      // Prioritize answers loaded from server database; fallback to local storage if empty
      let finalAnswers = (progress.answers && Object.keys(progress.answers).length > 0) ? progress.answers : {};
      if (Object.keys(finalAnswers).length === 0) {
        try {
          const cached = localStorage.getItem("penpal_progress");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
              finalAnswers = parsed;
            }
          }
        } catch (e) {
          console.warn("Failed to parse local progress:", e);
        }
      }

      setAnswers(finalAnswers);

      const showReport = searchParams ? searchParams.get("report") === "true" : false;
      const stepParam = searchParams ? searchParams.get("step") : null;

      if (progress.isAllCompleted || showReport) {
        setShowSummary(true);
        const summaryIndex = questionnaireConfig.findIndex((s) => s.type === "summary");
        setCurrentStepIndex(summaryIndex !== -1 ? summaryIndex : questionnaireConfig.length - 2);
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
  const recordedStepVisitsRef = useRef<Set<string>>(new Set());

  // Detect Assistive Technology (NVDA, Screen Readers, Sequential Keyboard Navigation)
  useEffect(() => {
    let a11yLogged = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !a11yLogged) {
        a11yLogged = true;
        logInteraction(
          'ACCESSIBILITY_INTERACTION',
          {
            type: 'Screen Reader / Keyboard Accessible Navigation',
            key: e.key,
            prefersReducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
          },
          '/intervention/flow'
        ).catch(() => {});
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Record 1 unique visit when entering a step
  useEffect(() => {
    if (!currentStep || !initialized) return;

    if (!recordedStepVisitsRef.current.has(currentStep.id)) {
      recordedStepVisitsRef.current.add(currentStep.id);
      recordSlideTiming(currentStep.id, currentStepIndex, 50, true).catch(() => {});
    }
  }, [currentStepIndex, initialized, currentStep]);

  // Active time tracker per slide with visibility change support
  useEffect(() => {
    if (!initialized || !currentStep) return;

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
            isNewVisit: false,
            path: '/intervention/flow',
          })], { type: 'application/json' });
          navigator.sendBeacon('/api/tracking', blob);
        } else {
          recordSlideTiming(activeStep.id, stepIdx, durationMs, false).catch(() => {});
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

    // For informational / non-question screens, record "acknowledged" instead of literal "undefined"
    if (answer === undefined || answer === null || answer === "undefined") {
      if (["intro", "statistics", "testing_info", "text", "summary", "knowledge_revelation"].includes(currentStep.type)) {
        answer = "acknowledged";
      } else {
        answer = "none_selected";
      }
    }

    const answerPayload = typeof answer === "object" ? JSON.stringify(answer) : String(answer);

    try {
      await submitAnswer(currentStep.id, answerPayload, Math.round(currentSlideDwellMs));
      if (currentStep.id === "screen6_4_resolution" && answers["screen6_4_location"]) {
        await submitAnswer("screen6_4_location", String(answers["screen6_4_location"]), 0);
      }
      if (currentStep.id === "screen6_4b_resolution_type") {
        if (answers["screen6_4b_medicine"]) {
          await submitAnswer("screen6_4b_medicine", String(answers["screen6_4b_medicine"]), 0);
        }
        if (answers["screen6_4b_route"]) {
          await submitAnswer("screen6_4b_route", String(answers["screen6_4b_route"]), 0);
        }
      }
      if (currentStep.id === "screen6_5_yetagain" && answers["screen6_5_reaction_detail"]) {
        await submitAnswer("screen6_5_reaction_detail", String(answers["screen6_5_reaction_detail"]), 0);
      }
      await logInteraction(
        "QUESTION_ANSWER",
        {
          stepId: currentStep.id,
          answer,
          location: answers["screen6_4_location"] || undefined,
          medicine: answers["screen6_4b_medicine"] || undefined,
          route: answers["screen6_4b_route"] || undefined,
          reactionDetail: answers["screen6_5_reaction_detail"] || undefined,
          dwellMs: Math.round(currentSlideDwellMs),
        },
        `/intervention/flow`
      );
    } catch (e) {
      console.warn("Server sync failed, continuing locally.", e);
    }

    // Always sync React state with latest answer
    setAnswers((prev) => ({ ...prev, [currentStep.id]: answer }));

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

      setLoading(false);
      setShowSuccess(true);
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

    setLoading(false);

    if (nextId) {
      const nextIndex = questionnaireConfig.findIndex((s) => s.id === nextId);
      if (nextIndex !== -1) {
        setCurrentStepIndex(nextIndex);
        if (typeof window !== "undefined") {
          const searchParams = new URLSearchParams(window.location.search);
          searchParams.set("step", String(nextIndex));
          window.history.replaceState(null, "", `${window.location.pathname}?${searchParams.toString()}`);
        }
        window.scrollTo(0, 0);
        return;
      }
    }
  };

  const handleBack = () => {
    if (loading) return;
    if (showSummary) {
      setShowSummary(false);               
      const prevIdx = questionnaireConfig.length - 2;
      setCurrentStepIndex(prevIdx);
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set("step", String(prevIdx));
        searchParams.delete("report");
        window.history.replaceState(null, "", `${window.location.pathname}?${searchParams.toString()}`);
      }
      window.scrollTo(0, 0);
      return;
    }
    if (!currentStep || currentStepIndex === 0) return;
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStepIndex(prevIndex);
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set("step", String(prevIndex));
        window.history.replaceState(null, "", `${window.location.pathname}?${searchParams.toString()}`);
      }
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
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 sm:p-10 text-center shadow-lg rounded-3xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto rounded-full text-2xl font-bold shadow-xs">
            ✓
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {locale === "es" ? "¡Éxito!" : "Success"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {locale === "es"
                ? "Sus respuestas han sido registradas. Gracias por participar en el estudio PEN-PAL."
                : "Your responses have been recorded. Thank you for participating in the PEN-PAL study."}
            </p>
          </div>
          
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => {
                try {
                  window.close();
                } catch {}
                logout();
              }}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-sm active:scale-[0.98] cursor-pointer"
            >
              {locale === "es" ? "Cerrar esta Ventana" : "Close this Window"}
            </button>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              {locale === "es" ? "La sesión se cerrará • Puede cerrar esta ventana con seguridad" : "Session will be cleared • You may safely close this window"}
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
      <div className="w-full max-w-4xl relative z-10 my-auto space-y-2 py-0 transition-all duration-300 overflow-visible">
        {/* Header Bar with Global Back Button, Logo, and Language Selector */}
        <header className="flex items-center justify-between px-3 sm:px-4 py-1.5 bg-white/90 backdrop-blur border border-slate-200/90 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {((currentStepIndex > 0 || showSummary) && !isTerminated && !showSuccess) && (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                aria-label={locale === "es" ? "Volver al paso anterior" : "Go back to previous step"}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#1f5c66] font-bold text-xs rounded-full transition cursor-pointer border border-slate-200/80 shadow-2xs active:scale-95 mr-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span>{locale === "es" ? "Atrás" : "Back"}</span>
              </button>
            )}
            <span className="w-2.5 h-2.5 rounded-full bg-[#236f7a]" aria-hidden="true"></span>
            <span className="font-black text-xs tracking-tight text-[#236f7a] font-display">PEN-PAL</span>
            <span className="text-slate-300 text-xs" aria-hidden="true">|</span>
            <span 
              className="text-[11px] font-bold text-slate-700"
              aria-label={locale === "es" ? `Progreso: Paso ${showSummary ? 13 : Math.min(currentStepIndex + 1, 13)} de 13` : `Progress: Step ${showSummary ? 13 : Math.min(currentStepIndex + 1, 13)} of 13`}
            >
              {locale === "es"
                ? `Paso ${showSummary ? 13 : Math.min(currentStepIndex + 1, 13)} de 13`
                : `Step ${showSummary ? 13 : Math.min(currentStepIndex + 1, 13)} of 13`}
            </span>
          </div>

          {/* Language Switcher Pill Button */}
          <LanguageSwitcher locale={locale} onSwitch={handleLanguageSwitch} />
        </header>

        <div className="w-full">
          {/* Responsive Device Frame: Preserves Tablet/Mobile Bezel, Removes Border with Properly Visible Soft Shadow on Desktop */}
          <div className="flex-1 w-full bg-zinc-900 lg:bg-transparent border-[6px] sm:border-[10px] lg:border-none border-zinc-900 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-3xl shadow-2xl lg:shadow-[0_16px_40px_-8px_rgba(20,60,65,0.20),0_8px_20px_-4px_rgba(0,0,0,0.08)] relative p-0.5 lg:p-0 ring-1 lg:ring-0 ring-white/10 overflow-hidden">
            <div className="rounded-[1.2rem] sm:rounded-[1.6rem] lg:rounded-3xl overflow-hidden">
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
                    <div
                      className="inline-block bg-[#82bdad] text-[#193630] font-bold py-2.5 px-8 rounded-full text-xs sm:text-sm shadow-sm border border-[#71ad9d] select-none cursor-default"
                    >
                      {locale === "es" ? "Puede cerrar esta ventana" : "You can close this window"}
                    </div>
                  </div>
                </div>
              ) : showSummary ? (
                <SummaryScreen
                  title={locale === "es" ? "Pasos de Acción para Padres" : "Action Steps for Parents"}
                  content={
                    locale === "es"
                      ? questionnaireConfig.find((s) => s.type === "summary")?.contentEs
                      : questionnaireConfig.find((s) => s.type === "summary")?.contentEn
                  }
                  answers={answers}
                  activeToken={activeToken}
                  isFirstStep={false}
                  loading={loading}
                  onBack={handleBack}
                  onNext={async () => {
                    setShowSuccess(true);
                  }}
                  t={t}
                  locale={locale}
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
                  {currentStep.type === "knowledge_revelation" && (
                    <KnowledgeRevelationScreen {...baseProps} options={currentStep.options} />
                  )}
                  {currentStep.type === "testing_info" && <TestingScreen {...baseProps} />}
                  {currentStep.type === "multiple_choice" && (
                    <SurveyMultipleChoice {...baseProps} options={currentStep.options} selected={answers[currentStep.id]} onSelect={handleAnswer} />
                  )}
                  {currentStep.id === "screen6_4_resolution" ? (
                    <Slide10MedicalCareScreen
                      isSpanish={locale === "es"}
                      selected={answers[currentStep.id]}
                      locationSelected={answers["screen6_4_location"]}
                      onSelect={handleAnswer}
                      onLocationSelect={(loc: string) => {
                        setAnswers((prev) => ({ ...prev, screen6_4_location: loc }));
                      }}
                      navProps={baseProps}
                    />
                  ) : currentStep.id === "screen6_4b_resolution_type" ? (
                    <Slide11MedicationScreen
                      isSpanish={locale === "es"}
                      selected={answers[currentStep.id]}
                      medicineSelected={answers["screen6_4b_medicine"]}
                      routeSelected={answers["screen6_4b_route"]}
                      onSelect={handleAnswer}
                      onMedicineSelect={(med: string) => {
                        setAnswers((prev) => ({ ...prev, screen6_4b_medicine: med }));
                      }}
                      onRouteSelect={(route: string) => {
                        setAnswers((prev) => ({ ...prev, screen6_4b_route: route }));
                      }}
                      navProps={baseProps}
                    />
                  ) : currentStep.id === "screen6_5_yetagain" ? (
                    <Slide12RepeatUseScreen
                      isSpanish={locale === "es"}
                      selected={answers[currentStep.id]}
                      reactionDetailSelected={answers["screen6_5_reaction_detail"]}
                      onSelect={handleAnswer}
                      onReactionDetailSelect={(detail: string) => {
                        setAnswers((prev) => ({ ...prev, screen6_5_reaction_detail: detail }));
                      }}
                      navProps={baseProps}
                    />
                  ) : currentStep.type === "single_choice" ? (
                    <SurveySingleChoice
                      {...baseProps}
                      stepId={currentStep.id}
                      options={currentStep.options}
                      selected={answers[currentStep.id]}
                      locationSelected={answers["screen6_4_location"]}
                      medicineSelected={answers["screen6_4b_medicine"]}
                      routeSelected={answers["screen6_4b_route"]}
                      reactionDetailSelected={answers["screen6_5_reaction_detail"]}
                      onSelect={handleAnswer}
                      onLocationSelect={(loc) => {
                        setAnswers((prev) => ({ ...prev, screen6_4_location: loc }));
                      }}
                      onMedicineSelect={(med) => {
                        setAnswers((prev) => ({ ...prev, screen6_4b_medicine: med }));
                      }}
                      onRouteSelect={(route) => {
                        setAnswers((prev) => ({ ...prev, screen6_4b_route: route }));
                      }}
                      onReactionDetailSelect={(detail) => {
                        setAnswers((prev) => ({ ...prev, screen6_5_reaction_detail: detail }));
                      }}
                    />
                  ) : null}
                  {currentStep.type === "slider" && (
                    <SurveySlider {...baseProps} min={currentStep.min} max={currentStep.max} unit={locale === "es" ? currentStep.unitEs : currentStep.unitEn} selected={answers[currentStep.id]} onSelect={handleAnswer} />
                  )}
                  {currentStep.type === "text" && <TextScreen {...baseProps} />}
                  {currentStep.type === "summary" && (
                    <SummaryScreen {...baseProps} answers={answers} activeToken={activeToken} />
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

function NavigationFooter({ onNext, loading, t, locale }: Omit<BaseScreenProps, 'title' | 'content' | 'description' | 'onBack'> & { locale?: string; onBack?: () => void }) {
  const isSpanish = locale === "es";
  return (
    <div className="flex justify-center items-center pt-4 mt-4 border-t border-slate-300/40">
      <button
        type="button"
        onClick={() => onNext()}
        disabled={loading}
        aria-label={isSpanish ? "Continuar al siguiente paso" : "Continue to next step"}
        className="px-8 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-250 flex items-center justify-center bg-[#82bdad] hover:bg-[#71ad9d] text-[#193630] rounded-full hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm no-print font-sans border border-[#71ad9d]"
      >
        {loading ? "..." : (isSpanish ? "Siguiente" : t("next"))}
      </button>
    </div>
  );
}

// ============ Screen Components ============

function IntroScreen({ title, description, content, onNext, onAnswer, loading, t, locale, headingRef, onNoBranching }: BaseScreenProps & { onAnswer: (val: string) => void; onNoBranching?: () => void }) {
  const isSpanish = locale === "es";
  const introSubtitle = description || (isSpanish ? "Padres Involucrados en Alergias a la Penicilina" : "Parents Engaged in Penicillin Allergies");
  const mainContent = content ? content.split('\n\n')[0] : (isSpanish ? "Esta es la enfermera Anna. Anna está brindando información sobre alergias a la penicilina en niños." : "This is nurse Anna. Anna is giving information about allergies to penicillin in kids.");
  const questionPrompt = isSpanish ? "¿Quieres saber más?" : "Do you want to know more?";

  return (
    <div id="slide-content" className="bg-gradient-to-br from-[#a2b4ff] via-[#8ce5ce] to-[#eef8ce] border border-white/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
      <div className="flex flex-row gap-3 sm:gap-6 items-center justify-between">
        <div className="flex-1 min-w-0 space-y-4">
          <div className="space-y-1">
            <h1 
              ref={headingRef}
              tabIndex={-1}
              style={{ outline: "none", boxShadow: "none" }}
              className="text-4xl sm:text-5xl font-black text-[#1d5c64] tracking-tight font-display outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 select-none"
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
                aria-label={isSpanish ? "Sí, quiero saber más sobre la alergia a la penicilina" : "Yes, I want to learn more about penicillin allergy"}
                className="px-6 py-2.5 min-h-[44px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] rounded-xl font-bold text-sm transition shadow-sm active:scale-[0.98] no-print cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
              >
                {loading ? "..." : (isSpanish ? "Sí" : t("yes"))}
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
                aria-label={isSpanish ? "No, salir o finalizar" : "No, do not continue"}
                className="px-6 py-2.5 min-h-[44px] bg-[#82bdad] hover:bg-[#71ad9d] text-[#193630] border border-[#71ad9d] rounded-xl font-bold text-sm transition active:scale-[0.98] no-print cursor-pointer shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
              >
                {isSpanish ? "No" : t("no")}
              </button>
            </div>
          </fieldset>
        </div>

        {/* Nurse Anna Illustration */}
        <div className="flex flex-shrink-0 relative items-center justify-center p-1 self-center md:self-center my-auto">
          <img
            src="/images/nurse-anna.png"
            alt={locale === "es" ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            role="img"
            aria-label={locale === "es" ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            className="w-16 sm:w-20 md:w-24 lg:w-28 max-h-[160px] sm:max-h-[190px] md:max-h-[220px] h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
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
      <div className="flex justify-center pt-2 mt-2 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => onNext(5)}
          disabled={loading}
          aria-label={locale === "es" ? "Continuar al siguiente paso" : "Continue to next step"}
          className="px-8 py-2 min-h-[44px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] rounded-full font-bold text-xs transition shadow-sm active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {loading ? "..." : (locale === "es" ? "Siguiente" : t("next"))}
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


function KnowledgeRevelationScreen(props: BaseScreenProps & { options?: QuestionnaireOption[] }) {
  const isSpanish = props.locale === "es";

  const statements = [
    {
      num: "1",
      textEn: "Only about 5% of kids with a reported penicillin allergy have a true, life-threatening allergy.",
      textEs: "Solo alrededor del 5% de los niños con reporte de alergia a la penicilina tienen una alergia verdadera y potencialmente mortal.",
    },
    {
      num: "2",
      textEn: "9 out of 10 kids grow out of their penicillin allergy over 10 years.",
      textEs: "9 de cada 10 niños superan su alergia a la penicilina con el paso de 10 años.",
    },
    {
      num: "3",
      textEn: "It kills bacteria better than other antibiotics.",
      textEs: "Mata las bacterias mejor que otros antibióticos.",
    },
    {
      num: "4",
      textEn: "It is cheaper than other antibiotics.",
      textEs: "Es más barata que otros antibióticos.",
    },
  ];

  return (
    <div 
      id="slide-content" 
      className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-4 sm:p-5 md:p-6 shadow-lg relative overflow-hidden"
    >
      {/* 1. Global Announcement for Screen Readers on Slide Load */}
      <div 
        role="status" 
        aria-live="polite" 
        className="sr-only"
      >
        {isSpanish 
          ? "Aviso de accesibilidad: Todas las 4 afirmaciones ya están marcadas como correctas y verdaderas." 
          : "Accessibility notice: All 4 statements are already checked as correct and true."}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-between">
        
        {/* Main Content Column */}
        <div className="flex-1 min-w-0 w-full max-w-3xl pb-2">
          {/* Slide Heading without tabIndex (Guarantees 0 ANDI Scanner Alerts) */}
          <div className="mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg md:text-xl font-black text-[#2d221b] tracking-tight leading-snug outline-none rounded-lg">
              {props.title || (isSpanish
                ? "¡Todas las afirmaciones sobre la penicilina son correctas!"
                : "All the statements about penicillin are correct!")}
            </h2>
          </div>

          {/* Semantic List of Confirmed Statements */}
          <ul role="list" className="space-y-3 pt-1">
            {statements.map((stmt) => (
              <li
                key={stmt.num}
                className="w-full text-left flex items-start gap-3 rounded-xl p-1 min-h-[44px]"
              >
                {/* Visual Toggle Track (aria-hidden to prevent redundant announcements) */}
                <div 
                  aria-hidden="true" 
                  className="flex flex-col items-center shrink-0 pt-1 select-none"
                >
                  <div className="w-12 h-6 rounded-full p-0.5 bg-[#1f5c66] transition-colors">
                    <div className="w-5 h-5 rounded-full bg-white border border-slate-300 shadow-sm transform translate-x-6" />
                  </div>
                  <div className="flex justify-between w-full px-1.5 text-[10px] font-extrabold text-[#2d221b] mt-0.5 leading-none">
                    <span>×</span>
                    <span>✓</span>
                  </div>
                </div>

                {/* Unified Accessible Statement (Read once cleanly by screen readers) */}
                <div className="text-xs sm:text-sm font-semibold text-[#2d221b] leading-relaxed pt-0.5">
                  <span className="sr-only">
                    {isSpanish ? "Verificado como verdadero: " : "Verified as true: "}
                  </span>
                  <span>{stmt.num}. {isSpanish ? stmt.textEs : stmt.textEn}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Nurse Anna Illustration */}
        <div className="flex flex-shrink-0 self-center sm:self-center my-auto p-1">
          <img
            src="/images/nurse-anna.png"
            alt={isSpanish ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            className="w-16 sm:w-20 md:w-24 lg:w-28 max-h-[140px] sm:max-h-[190px] md:max-h-[220px] h-auto object-contain filter drop-shadow-md pointer-events-none"
          />
        </div>
      </div>

      {/* Centered Yellow Next Button */}
      <div className="flex justify-center pt-3 mt-4 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => props.onNext("all_statements_acknowledged")}
          disabled={props.loading}
          className="px-10 py-2.5 min-h-[44px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] rounded-full font-bold text-xs sm:text-sm transition shadow-sm active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {props.loading ? "..." : (isSpanish ? "Siguiente" : props.t("next"))}
        </button>
      </div>
    </div>
  );
}

function TestingScreen(props: BaseScreenProps) {
  const isSpanish = props.locale === "es";

  return (
    <div id="slide-content" className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg relative overflow-hidden">
      <div className="flex flex-row items-center justify-between gap-3 sm:gap-6">
        <div className="space-y-3 flex-1 min-w-0 max-w-2xl pb-1">
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
        <div className="flex flex-shrink-0 self-center md:self-center my-auto p-1">
          <img
            src="/images/nurse-anna.png"
            alt={isSpanish ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            role="img"
            aria-label={isSpanish ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            className="w-16 sm:w-20 md:w-24 lg:w-28 max-h-[160px] sm:max-h-[190px] md:max-h-[220px] h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Centered Yellow Next Button */}
      <div className="flex justify-center pt-2 mt-3 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => props.onNext()}
          disabled={props.loading}
          className="px-8 py-2 min-h-[44px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] rounded-full font-bold text-xs sm:text-sm transition shadow-sm active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {props.loading ? "..." : (isSpanish ? "Siguiente" : props.t("next"))}
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
  const isSpanish = navProps.locale === "es";

  // Extract initial otherText if already in selected
  const existingOther = (selected || []).find((s: string) => typeof s === "string" && (s.startsWith("Other:") || s.startsWith("Otro:")));
  const initialOther = existingOther
    ? existingOther.replace(/^Other:\s*/i, "").replace(/^Otro:\s*/i, "")
    : "";
  const [otherText, setOtherText] = useState<string>(initialOther);

  const handleToggle = (value: string) => {
    if (value === "Unsure") {
      onSelect((selected || []).includes("Unsure") ? [] : ["Unsure"]);
      return;
    }
    const cleanList = (selected || []).filter((v: string) => v !== "Unsure");

    if (value === "Other") {
      const alreadyOther = cleanList.some((s: string) => s === "Other" || s.startsWith("Other:") || s === "Otro" || s.startsWith("Otro:"));
      if (alreadyOther) {
        // Deselect Other
        const updated = cleanList.filter((v: string) => v !== "Other" && !v.startsWith("Other:") && v !== "Otro" && !v.startsWith("Otro:"));
        onSelect(updated);
      } else {
        // Select Other with current text
        const customVal = otherText.trim()
          ? (isSpanish ? "Otro: " + otherText.trim() : "Other: " + otherText.trim())
          : "Other";
        onSelect([...cleanList, customVal]);
      }
      return;
    }

    const updated = cleanList.includes(value)
      ? cleanList.filter((v: string) => v !== value)
      : [...cleanList, value];
    onSelect(updated);
  };

  const isKnowledgeTest = options[0]?.value?.startsWith("curing_");

  return (
    <div id="slide-content" className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-4 sm:p-5 md:p-6 shadow-lg relative overflow-hidden">
      <div className="flex flex-row gap-2 sm:gap-6 items-center justify-between">
        <div className="flex-1 min-w-0 max-w-3xl pb-2">
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
                    const isSelected = opt.value === "Other"
                      ? (selected || []).some((s: string) => s === "Other" || s.startsWith("Other:") || s === "Otro" || s.startsWith("Otro:"))
                      : (selected || []).includes(opt.value);
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
                              onChange={(e) => {
                                const newText = e.target.value;
                                setOtherText(newText);
                                const customVal = newText.trim()
                                  ? (isSpanish ? "Otro: " + newText.trim() : "Other: " + newText.trim())
                                  : "Other";
                                const cleanList = (selected || []).filter((v: string) => v !== "Other" && !v.startsWith("Other:") && v !== "Otro" && !v.startsWith("Otro:"));
                                onSelect([...cleanList, customVal]);
                              }}
                              className="bg-white/20 text-white placeholder-white/60 border-b border-white/80 px-2 py-0.5 text-xs font-semibold focus:outline-none max-w-[140px] rounded"
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
        <div className="flex flex-shrink-0 self-center md:self-center my-auto p-1">
          <img
            src="/images/nurse-anna.png"
            alt={navProps.locale === "es" ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            role="img"
            aria-label={navProps.locale === "es" ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            className="w-16 sm:w-20 md:w-24 lg:w-28 max-h-[160px] sm:max-h-[190px] md:max-h-[220px] h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Centered Yellow Next Button */}
      <div className="flex justify-center pt-2 mt-3 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => {
            const trimmedOther = otherText.trim();
            const customVal = trimmedOther
              ? (isSpanish ? "Otro: " + trimmedOther : "Other: " + trimmedOther)
              : "Other";

            const hasOther = (selected || []).some((s: string) => s === "Other" || s.startsWith("Other:") || s === "Otro" || s.startsWith("Otro:"));
            const cleanList = (selected || []).filter((v: string) => v !== "Other" && !v.startsWith("Other:") && v !== "Otro" && !v.startsWith("Otro:"));
            const finalSelected = hasOther ? [...cleanList, customVal] : cleanList;

            navProps.onNext(finalSelected);
          }}
          disabled={navProps.loading}
          className="px-8 py-2 min-h-[44px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] rounded-full font-bold text-xs transition shadow-sm active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {navProps.loading ? "..." : (isSpanish ? "Siguiente" : navProps.t("next"))}
        </button>
      </div>
    </div>
  );
}

const MEDICAL_CARE_LOCATION_OPTIONS = [
  { value: "Emergency room (ER)", labelEn: "Emergency room (ER)", labelEs: "Sala de emergencias (ER)" },
  { value: "Urgent care", labelEn: "Urgent care", labelEs: "Centro de atención de urgencias" },
  { value: "Primary care doctor", labelEn: "Primary care doctor", labelEs: "Médico de cabecera" },
  { value: "Hospital", labelEn: "Hospital", labelEs: "Hospital" },
  { value: "Phone call with doctor", labelEn: "Phone call with doctor", labelEs: "Llamada telefónica con el médico" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/No sé" },
];

const RESOLUTION_MEDICINE_OPTIONS = [
  { value: "Allergy medicine (Benadryl, Zyrtec)", labelEn: "Allergy medicine (Benadryl, Zyrtec)", labelEs: "Medicamento para la alergia (Benadryl, Zyrtec)" },
  { value: "Steroid medicine (Prednisone)", labelEn: "Steroid medicine (Prednisone)", labelEs: "Medicamento con esteroides (Prednisona)" },
  { value: "Epinephrine (EpiPen)", labelEn: "Epinephrine (EpiPen)", labelEs: "Epinefrina (EpiPen)" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/No sé" },
];

const RESOLUTION_ROUTE_OPTIONS = [
  { value: "Mouth", labelEn: "Mouth", labelEs: "Boca" },
  { value: "IV", labelEn: "IV", labelEs: "IV" },
  { value: "Shot", labelEn: "Shot", labelEs: "Inyección" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/No sé" },
];

const YETAGAIN_REACTION_OPTIONS = [
  { 
    value: "Yes, and they did not have a reaction", 
    labelEn: "Yes, and they did not have a reaction", 
    labelEs: "Sí, y no tuvieron una reacción" 
  },
  { 
    value: "Yes, and they had a reaction", 
    labelEn: "Yes, and they had a reaction", 
    labelEs: "Sí, y tuvieron una reacción" 
  },
  { 
    value: "Unsure / I don't know", 
    labelEn: "Unsure / I don't know", 
    labelEs: "No estoy seguro / No sé" 
  },
];

export function Slide10MedicalCareScreen(props: any) {
  const { isSpanish, selected, onSelect, locationSelected, onLocationSelect, navProps } = props;
  const [showBranchModal, setShowBranchModal] = useState(false);

  // Focus management refs
  const modalTitleRef = useRef<HTMLHeadingElement>(null);
  const yesButtonRef = useRef<HTMLButtonElement>(null);
  const changeButtonRef = useRef<HTMLButtonElement>(null);

  // Move focus into modal when opened; announce dialog
  useEffect(() => {
    if (showBranchModal) {
      setTimeout(() => {
        modalTitleRef.current?.focus();
      }, 50);
    }
  }, [showBranchModal]);

  const handleCloseModal = () => {
    setShowBranchModal(false);
    // Return focus to appropriate trigger button
    if (locationSelected && changeButtonRef.current) {
      changeButtonRef.current.focus();
    } else if (yesButtonRef.current) {
      yesButtonRef.current.focus();
    }
  };

  const handleMainSelect = (val: string) => {
    onSelect(val);
    if (val === "Yes" && !locationSelected) {
      setShowBranchModal(true);
    }
  };

  const mainOptions = [
    { value: "Yes", labelEn: "Yes", labelEs: "Sí" },
    { value: "No", labelEn: "No", labelEs: "No" },
    { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/No sé" },
  ];

  return (
    <>
      {/* =========================================================================
          PART 1: PARENT SLIDE (aria-hidden while modal is open)
          ========================================================================= */}
      <div 
        id="slide-content"
        aria-hidden={showBranchModal}
        className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl shadow-lg relative overflow-hidden w-full max-w-4xl mx-auto flex flex-col justify-between p-4 sm:p-6"
      >
        <div className="mb-6">
          <h2 
            id="slide10-title"
            className="text-xl sm:text-2xl md:text-3xl font-black text-[#2d221b] tracking-tight leading-snug"
          >
            {isSpanish
              ? "¿Su hijo recibió atención médica por la reacción?"
              : "Did your child receive medical care for their reaction?"}
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 my-auto">
          <div className="flex-1 w-full max-w-xl">
            {/* Parent Radiogroup */}
            <div
              role="radiogroup"
              aria-labelledby="slide10-title"
              className="bg-[#7da199]/60 p-3 sm:p-4 rounded-3xl flex flex-wrap items-center gap-3"
            >
              {mainOptions.map((opt) => {
                const isSelected = selected === opt.value || (opt.value.startsWith("Unsure") && (selected === "Unsure" || selected === "Unsure/I don't know"));
                const label = isSpanish ? opt.labelEs : opt.labelEn;
                return (
                  <button
                    key={opt.value}
                    ref={opt.value === "Yes" ? yesButtonRef : undefined}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleMainSelect(opt.value)}
                    className={`px-6 py-3 min-h-[44px] rounded-2xl font-bold text-sm sm:text-base transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                      isSelected
                        ? "bg-[#1f5c66] text-white shadow-md border-2 border-[#1f5c66]"
                        : "bg-white text-[#132c27] hover:bg-slate-50 border-2 border-transparent"
                    }`}
                  >
                    {isSelected && <span aria-hidden="true" className="text-amber-300 font-black">✓</span>}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Location Summary Chip */}
            {selected === "Yes" && locationSelected && (
              <div className="mt-3.5 flex items-center justify-between bg-white/60 backdrop-blur-xs rounded-xl px-4 py-2.5 text-xs font-semibold text-[#132c27] border border-slate-200 shadow-2xs">
                <span>
                  {isSpanish ? "Ubicación seleccionada: " : "Selected location: "}
                  <strong className="font-bold text-[#1f5c66]">
                    {isSpanish
                      ? (MEDICAL_CARE_LOCATION_OPTIONS.find((o) => o.value === locationSelected)?.labelEs || locationSelected)
                      : (MEDICAL_CARE_LOCATION_OPTIONS.find((o) => o.value === locationSelected)?.labelEn || locationSelected)}
                  </strong>
                </span>
                <button
                  ref={changeButtonRef}
                  type="button"
                  onClick={() => setShowBranchModal(true)}
                  aria-label={isSpanish ? "Cambiar ubicación médica seleccionada" : "Change selected medical care location"}
                  className="text-[#1f5c66] hover:underline font-bold ml-3 min-h-[44px] inline-flex items-center cursor-pointer"
                >
                  {isSpanish ? "Cambiar" : "Change"}
                </button>
              </div>
            )}
          </div>

          <div className="shrink-0 self-center">
            <img
              src="/images/nurse-anna.png"
              alt={isSpanish ? "Ilustración de la enfermera Anna" : "Illustration of Nurse Anna"}
              className="w-24 sm:w-28 md:w-32 h-auto object-contain pointer-events-none"
            />
          </div>
        </div>

        {/* Parent Next Button */}
        <div className="flex justify-center pt-6 mt-4 border-t border-slate-200/60">
          <button
            type="button"
            disabled={!selected || (selected === "Yes" && !locationSelected)}
            onClick={() => navProps.onNext(selected)}
            className={`px-12 py-3 min-h-[44px] font-bold text-sm sm:text-base rounded-full transition shadow-sm flex items-center justify-center ${
              selected && (selected !== "Yes" || locationSelected)
                ? "bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent"
            }`}
          >
            {isSpanish ? "Siguiente" : "Next"}
          </button>
        </div>
      </div>

      {/* =========================================================================
          PART 2: ACCESSIBLE BRANCH MODAL
          ========================================================================= */}
      {showBranchModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="branch-modal-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              handleCloseModal();
            }
          }}
        >
          <div className="bg-[#f4f8e8] border border-slate-300 rounded-2xl p-5 sm:p-6 shadow-2xl max-w-lg w-full relative animate-in zoom-in-95 duration-200">
            
            {/* Modal Heading receives immediate programmatic focus on open */}
            <h3
              ref={modalTitleRef}
              tabIndex={-1}
              id="branch-modal-title"
              className="text-base sm:text-lg font-black text-[#2d221b] text-center mb-4 leading-snug outline-none focus:ring-2 focus:ring-[#236f7a] rounded-lg p-1"
            >
              {isSpanish
                ? "¿Dónde recibió atención médica su hijo por la reacción?"
                : "Where did your child get medical care for the reaction?"}
            </h3>

            {/* Modal Radiogroup */}
            <div 
              role="radiogroup" 
              aria-labelledby="branch-modal-title"
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5"
            >
              {MEDICAL_CARE_LOCATION_OPTIONS.map((locOpt) => {
                const isLocSelected = locationSelected === locOpt.value;
                const label = isSpanish ? locOpt.labelEs : locOpt.labelEn;
                return (
                  <button
                    type="button"
                    key={locOpt.value}
                    role="radio"
                    aria-checked={isLocSelected}
                    onClick={() => {
                      if (onLocationSelect) {
                        onLocationSelect(locOpt.value);
                      }
                    }}
                    className={`px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs border cursor-pointer flex items-center justify-center text-center gap-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                      isLocSelected
                        ? "bg-[#1f5c66] text-white border-[#1f5c66] shadow-md ring-2 ring-[#1f5c66]/40"
                        : "bg-white text-[#132c27] border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {isLocSelected && <span aria-hidden="true" className="text-amber-300 font-black">✓</span>}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Action Controls (Cleaned symbols + 44px targets) */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-300/60">
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label={isSpanish ? "Cerrar ventana" : "Close window"}
                className="px-5 py-2.5 min-h-[44px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-full transition cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
              >
                <span aria-hidden="true">✕</span>
                <span>{isSpanish ? "Cerrar" : "Close"}</span>
              </button>
              <button
                type="button"
                disabled={!locationSelected}
                onClick={handleCloseModal}
                className={`px-8 py-2.5 min-h-[44px] font-bold text-xs sm:text-sm rounded-full transition shadow-xs flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                  locationSelected
                    ? "bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] cursor-pointer active:scale-95"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent"
                }`}
              >
                {isSpanish ? "Aceptar" : "Confirm"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export function Slide11MedicationScreen(props: any) {
  const { isSpanish, selected, onSelect, medicineSelected, onMedicineSelect, routeSelected, onRouteSelect, navProps } = props;
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1); // 1 = Medicine, 2 = Route

  const modalTitleRef = useRef<HTMLHeadingElement>(null);
  const changeButtonRef = useRef<HTMLButtonElement>(null);
  const medTriggerButtonRef = useRef<HTMLButtonElement>(null);

  // Focus title on modal open or step transition
  useEffect(() => {
    if (showModal) {
      setTimeout(() => {
        modalTitleRef.current?.focus();
      }, 50);
    }
  }, [showModal, modalStep]);

  const handleClose = () => {
    setShowModal(false);
    setModalStep(1);
    if (medicineSelected && changeButtonRef.current) {
      changeButtonRef.current.focus();
    } else if (medTriggerButtonRef.current) {
      medTriggerButtonRef.current.focus();
    }
  };

  const mainOptions = [
    { value: "With medication", labelEn: "With medication", labelEs: "Con medicamentos" },
    { value: "On its own", labelEn: "On its own", labelEs: "Por sí sola" },
    { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/No sé" },
  ];

  return (
    <>
      {/* =========================================================================
          PART 1: PARENT SLIDE (aria-hidden while modal is open)
          ========================================================================= */}
      <div 
        id="slide-content"
        aria-hidden={showModal}
        className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl shadow-lg relative overflow-hidden w-full max-w-4xl mx-auto flex flex-col justify-between p-4 sm:p-6"
      >
        <div className="mb-6">
          <h2 
            id="slide11-title"
            className="text-xl sm:text-2xl md:text-3xl font-black text-[#2d221b] tracking-tight leading-snug"
          >
            {isSpanish
              ? "¿Cómo desapareció la reacción de su hijo?"
              : "How did your child's reaction go away?"}
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 my-auto">
          <div className="flex-1 w-full max-w-xl">
            {/* Parent Radiogroup */}
            <div
              role="radiogroup"
              aria-labelledby="slide11-title"
              className="bg-[#7da199]/60 p-3 sm:p-4 rounded-3xl flex flex-wrap items-center gap-3"
            >
              {mainOptions.map((opt) => {
                const isSelected = selected === opt.value;
                const label = isSpanish ? opt.labelEs : opt.labelEn;
                return (
                  <button
                    key={opt.value}
                    ref={opt.value === "With medication" ? medTriggerButtonRef : undefined}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      onSelect(opt.value);
                      if (opt.value === "With medication" && !medicineSelected) {
                        setModalStep(1);
                        setShowModal(true);
                      }
                    }}
                    className={`px-6 py-3 min-h-[44px] rounded-2xl font-bold text-sm sm:text-base transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                      isSelected
                        ? "bg-[#1f5c66] text-white shadow-md border-2 border-[#1f5c66]"
                        : "bg-white text-[#132c27] hover:bg-slate-50 border-2 border-transparent"
                    }`}
                  >
                    {isSelected && <span aria-hidden="true" className="text-amber-300 font-black">✓</span>}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Summary Chip */}
            {selected === "With medication" && (medicineSelected || routeSelected) && (
              <div className="mt-3.5 flex items-center justify-between bg-white/60 backdrop-blur-xs rounded-xl px-4 py-2.5 text-xs font-semibold text-[#132c27] border border-slate-200 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  {medicineSelected && (
                    <span>
                      {isSpanish ? "Medicamento: " : "Medicine: "}
                      <strong className="font-bold text-[#1f5c66]">
                        {isSpanish
                          ? (RESOLUTION_MEDICINE_OPTIONS.find((o) => o.value === medicineSelected)?.labelEs || medicineSelected)
                          : (RESOLUTION_MEDICINE_OPTIONS.find((o) => o.value === medicineSelected)?.labelEn || medicineSelected)}
                      </strong>
                    </span>
                  )}
                  {medicineSelected && routeSelected && <span className="hidden sm:inline text-slate-400">•</span>}
                  {routeSelected && (
                    <span>
                      {isSpanish ? "Toma: " : "Intake: "}
                      <strong className="font-bold text-[#1f5c66]">
                        {isSpanish
                          ? (RESOLUTION_ROUTE_OPTIONS.find((o) => o.value === routeSelected)?.labelEs || routeSelected)
                          : (RESOLUTION_ROUTE_OPTIONS.find((o) => o.value === routeSelected)?.labelEn || routeSelected)}
                      </strong>
                    </span>
                  )}
                </div>
                <button
                  ref={changeButtonRef}
                  type="button"
                  onClick={() => {
                    setModalStep(1);
                    setShowModal(true);
                  }}
                  aria-label={isSpanish ? "Cambiar detalles del medicamento" : "Change medication details"}
                  className="text-[#1f5c66] hover:underline font-bold ml-3 min-h-[44px] inline-flex items-center cursor-pointer"
                >
                  {isSpanish ? "Cambiar" : "Change"}
                </button>
              </div>
            )}
          </div>

          <div className="shrink-0 self-center">
            <img
              src="/images/nurse-anna.png"
              alt={isSpanish ? "Ilustración de la enfermera Anna" : "Illustration of Nurse Anna"}
              className="w-24 sm:w-28 md:w-32 h-auto object-contain pointer-events-none"
            />
          </div>
        </div>

        {/* Parent Next Button */}
        <div className="flex justify-center pt-6 mt-4 border-t border-slate-200/60">
          <button
            type="button"
            disabled={!selected || (selected === "With medication" && (!medicineSelected || !routeSelected))}
            onClick={() => navProps.onNext(selected)}
            className={`px-12 py-3 min-h-[44px] font-bold text-sm sm:text-base rounded-full transition shadow-sm flex items-center justify-center ${
              selected && (selected !== "With medication" || (medicineSelected && routeSelected))
                ? "bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent"
            }`}
          >
            {isSpanish ? "Siguiente" : "Next"}
          </button>
        </div>
      </div>

      {/* =========================================================================
          PART 2: SINGLE 2-STEP MODAL (Eliminates Nested Dialog Bug)
          ========================================================================= */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="med-modal-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") handleClose();
          }}
        >
          <div className="bg-[#f4f8e8] border border-slate-300 rounded-2xl p-5 sm:p-6 shadow-2xl max-w-lg w-full relative animate-in zoom-in-95 duration-200">
            {/* Step Indicator Header */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-[#1f5c66] uppercase tracking-wider">
                {isSpanish ? `Paso ${modalStep} de 2` : `Step ${modalStep} of 2`}
              </span>
            </div>

            {/* STEP 1: What Medicine Was Given? */}
            {modalStep === 1 && (
              <div>
                <h3
                  ref={modalTitleRef}
                  tabIndex={-1}
                  id="med-modal-title"
                  className="text-base sm:text-lg font-black text-[#2d221b] text-center mb-4 leading-snug outline-none focus:ring-2 focus:ring-[#236f7a] rounded-lg p-1"
                >
                  {isSpanish
                    ? "¿Qué medicamento se le dio a su hijo para la reacción?"
                    : "What medicine was given to your child for the reaction?"}
                </h3>

                <div role="radiogroup" aria-labelledby="med-modal-title" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                  {RESOLUTION_MEDICINE_OPTIONS.map((medOpt) => {
                    const isSelected = medicineSelected === medOpt.value;
                    const label = isSpanish ? medOpt.labelEs : medOpt.labelEn;
                    return (
                      <button
                        key={medOpt.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => onMedicineSelect && onMedicineSelect(medOpt.value)}
                        className={`px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs border cursor-pointer flex items-center justify-center text-center gap-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                          isSelected
                            ? "bg-[#1f5c66] text-white border-[#1f5c66] shadow-md ring-2 ring-[#1f5c66]/40"
                            : "bg-white text-[#132c27] border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {isSelected && <span aria-hidden="true" className="text-amber-300 font-black">✓</span>}
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-300/60">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2.5 min-h-[44px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-full transition cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
                  >
                    <span aria-hidden="true">✕</span>
                    <span>{isSpanish ? "Cerrar" : "Close"}</span>
                  </button>
                  <button
                    type="button"
                    disabled={!medicineSelected}
                    onClick={() => setModalStep(2)}
                    className={`px-8 py-2.5 min-h-[44px] font-bold text-xs sm:text-sm rounded-full transition shadow-xs flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                      medicineSelected
                        ? "bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] cursor-pointer active:scale-95"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent"
                    }`}
                  >
                    <span>{isSpanish ? "Siguiente" : "Next"}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Did Your Child Receive the Medicine By? */}
            {modalStep === 2 && (
              <div>
                <h3
                  ref={modalTitleRef}
                  tabIndex={-1}
                  id="med-modal-title"
                  className="text-base sm:text-lg font-black text-[#2d221b] text-center mb-4 leading-snug outline-none focus:ring-2 focus:ring-[#236f7a] rounded-lg p-1"
                >
                  {isSpanish
                    ? "¿Su hijo recibió el medicamento por:"
                    : "Did your child receive the medicine by:"}
                </h3>

                <div role="radiogroup" aria-labelledby="med-modal-title" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                  {RESOLUTION_ROUTE_OPTIONS.map((routeOpt) => {
                    const isSelected = routeSelected === routeOpt.value;
                    const label = isSpanish ? routeOpt.labelEs : routeOpt.labelEn;
                    return (
                      <button
                        key={routeOpt.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => onRouteSelect && onRouteSelect(routeOpt.value)}
                        className={`px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs border cursor-pointer flex items-center justify-center text-center gap-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                          isSelected
                            ? "bg-[#1f5c66] text-white border-[#1f5c66] shadow-md ring-2 ring-[#1f5c66]/40"
                            : "bg-white text-[#132c27] border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {isSelected && <span aria-hidden="true" className="text-amber-300 font-black">✓</span>}
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-300/60">
                  <button
                    type="button"
                    onClick={() => setModalStep(1)}
                    className="px-5 py-2.5 min-h-[44px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-full transition cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
                  >
                    <span aria-hidden="true">←</span>
                    <span>{isSpanish ? "Atrás" : "Back"}</span>
                  </button>
                  <button
                    type="button"
                    disabled={!routeSelected}
                    onClick={handleClose}
                    className={`px-8 py-2.5 min-h-[44px] font-bold text-xs sm:text-sm rounded-full transition shadow-xs flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                      routeSelected
                        ? "bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] cursor-pointer active:scale-95"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent"
                    }`}
                  >
                    {isSpanish ? "Confirmar" : "Confirm"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function Slide12RepeatUseScreen(props: any) {
  const { isSpanish, selected, onSelect, reactionDetailSelected, onReactionDetailSelect, navProps } = props;
  const [showYetAgainModal, setShowYetAgainModal] = useState(false);

  const modalTitleRef = useRef<HTMLHeadingElement>(null);
  const yesButtonRef = useRef<HTMLButtonElement>(null);
  const changeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showYetAgainModal) {
      setTimeout(() => {
        modalTitleRef.current?.focus();
      }, 50);
    }
  }, [showYetAgainModal]);

  const handleCloseModal = () => {
    setShowYetAgainModal(false);
    if (reactionDetailSelected && changeButtonRef.current) {
      changeButtonRef.current.focus();
    } else if (yesButtonRef.current) {
      yesButtonRef.current.focus();
    }
  };

  const handleMainSelect = (val: string) => {
    onSelect(val);
    if (val === "Yes" && !reactionDetailSelected) {
      setShowYetAgainModal(true);
    }
  };

  const mainOptions = [
    { value: "Yes", labelEn: "Yes", labelEs: "Sí" },
    { value: "No", labelEn: "No", labelEs: "No" },
    { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/No sé" },
  ];

  return (
    <>
      {/* =========================================================================
          PART 1: PARENT SLIDE (aria-hidden while modal is open)
          ========================================================================= */}
      <div 
        id="slide-content"
        aria-hidden={showYetAgainModal}
        className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl shadow-lg relative overflow-hidden w-full max-w-4xl mx-auto flex flex-col justify-between p-4 sm:p-6"
      >
        <div className="mb-6">
          <h2 
            id="slide12-title"
            className="text-xl sm:text-2xl md:text-3xl font-black text-[#2d221b] tracking-tight leading-snug"
          >
            {isSpanish
              ? "¿Su hijo ha recibido penicilina desde la reacción?"
              : "Has your child received penicillin since the reaction?"}
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 my-auto">
          <div className="flex-1 w-full max-w-xl">
            {/* Parent Radiogroup */}
            <div
              role="radiogroup"
              aria-labelledby="slide12-title"
              className="bg-[#7da199]/60 p-3 sm:p-4 rounded-3xl flex flex-wrap items-center gap-3"
            >
              {mainOptions.map((opt) => {
                const isSelected = selected === opt.value || (opt.value.startsWith("Unsure") && (selected === "Unsure" || selected === "Unsure/I don't know"));
                const label = isSpanish ? opt.labelEs : opt.labelEn;
                return (
                  <button
                    key={opt.value}
                    ref={opt.value === "Yes" ? yesButtonRef : undefined}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleMainSelect(opt.value)}
                    className={`px-6 py-3 min-h-[44px] rounded-2xl font-bold text-sm sm:text-base transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                      isSelected
                        ? "bg-[#1f5c66] text-white shadow-md border-2 border-[#1f5c66]"
                        : "bg-white text-[#132c27] hover:bg-slate-50 border-2 border-transparent"
                    }`}
                  >
                    {isSelected && <span aria-hidden="true" className="text-amber-300 font-black">✓</span>}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Reaction Detail Summary Chip */}
            {selected === "Yes" && reactionDetailSelected && (
              <div className="mt-3.5 flex items-center justify-between bg-white/60 backdrop-blur-xs rounded-xl px-4 py-2.5 text-xs font-semibold text-[#132c27] border border-slate-200 shadow-2xs">
                <span>
                  {isSpanish ? "Detalle: " : "Detail: "}
                  <strong className="font-bold text-[#1f5c66]">
                    {isSpanish
                      ? (YETAGAIN_REACTION_OPTIONS.find((o) => o.value === reactionDetailSelected)?.labelEs || reactionDetailSelected)
                      : (YETAGAIN_REACTION_OPTIONS.find((o) => o.value === reactionDetailSelected)?.labelEn || reactionDetailSelected)}
                  </strong>
                </span>
                <button
                  ref={changeButtonRef}
                  type="button"
                  onClick={() => setShowYetAgainModal(true)}
                  aria-label={isSpanish ? "Cambiar detalle de la reacción" : "Change reaction detail"}
                  className="text-[#1f5c66] hover:underline font-bold ml-3 min-h-[44px] inline-flex items-center cursor-pointer"
                >
                  {isSpanish ? "Cambiar" : "Change"}
                </button>
              </div>
            )}
          </div>

          <div className="shrink-0 self-center">
            <img
              src="/images/nurse-anna.png"
              alt={isSpanish ? "Ilustración de la enfermera Anna" : "Illustration of Nurse Anna"}
              className="w-24 sm:w-28 md:w-32 h-auto object-contain pointer-events-none"
            />
          </div>
        </div>

        {/* Parent Next Button */}
        <div className="flex justify-center pt-6 mt-4 border-t border-slate-200/60">
          <button
            type="button"
            disabled={!selected || (selected === "Yes" && !reactionDetailSelected)}
            onClick={() => navProps.onNext(selected)}
            className={`px-12 py-3 min-h-[44px] font-bold text-sm sm:text-base rounded-full transition shadow-sm flex items-center justify-center ${
              selected && (selected !== "Yes" || reactionDetailSelected)
                ? "bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent"
            }`}
          >
            {isSpanish ? "Siguiente" : "Next"}
          </button>
        </div>
      </div>

      {/* =========================================================================
          PART 2: ACCESSIBLE MODAL DIALOG
          ========================================================================= */}
      {showYetAgainModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="yetagain-modal-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") handleCloseModal();
          }}
        >
          <div className="bg-[#f4f8e8] border border-slate-300 rounded-2xl p-5 sm:p-6 shadow-2xl max-w-lg w-full relative animate-in zoom-in-95 duration-200">
            
            <h3
              ref={modalTitleRef}
              tabIndex={-1}
              id="yetagain-modal-title"
              className="text-base sm:text-lg font-black text-[#2d221b] text-center mb-4 leading-snug outline-none focus:ring-2 focus:ring-[#236f7a] rounded-lg p-1"
            >
              {isSpanish
                ? "¿Su hijo ha tomado penicilina (amoxicilina) nuevamente desde la reacción?"
                : "Has your child taken penicillin (amoxicillin) again since the reaction?"}
            </h3>

            {/* Semantic Radiogroup Wrapper */}
            <div 
              role="radiogroup" 
              aria-labelledby="yetagain-modal-title"
              className="space-y-3 mb-5"
            >
              {YETAGAIN_REACTION_OPTIONS.map((opt) => {
                const isOptSelected = reactionDetailSelected === opt.value;
                const label = isSpanish ? opt.labelEs : opt.labelEn;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    role="radio"
                    aria-checked={isOptSelected}
                    onClick={() => {
                      if (onReactionDetailSelect) {
                        onReactionDetailSelect(opt.value);
                      }
                    }}
                    className={`w-full px-5 py-3.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs border cursor-pointer flex items-center justify-center text-center gap-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                      isOptSelected
                        ? "bg-[#1f5c66] text-white border-[#1f5c66] shadow-md ring-2 ring-[#1f5c66]/40"
                        : "bg-white text-[#132c27] border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {isOptSelected && <span aria-hidden="true" className="text-amber-300 font-black">✓</span>}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer with 44px touch targets and Figma tag removed */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-300/60">
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label={isSpanish ? "Cerrar ventana" : "Close window"}
                className="px-5 py-2.5 min-h-[44px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-full transition cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
              >
                <span aria-hidden="true">✕</span>
                <span>{isSpanish ? "Cerrar" : "Close"}</span>
              </button>
              <button
                type="button"
                disabled={!reactionDetailSelected}
                onClick={handleCloseModal}
                className={`px-8 py-2.5 min-h-[44px] font-bold text-xs sm:text-sm rounded-full transition shadow-xs flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                  reactionDetailSelected
                    ? "bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] cursor-pointer active:scale-95"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent"
                }`}
              >
                {isSpanish ? "Confirmar" : "Confirm"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

function SurveySingleChoice({
  title,
  options,
  selected,
  onSelect,
  stepId,
  locationSelected,
  onLocationSelect,
  medicineSelected,
  routeSelected,
  onMedicineSelect,
  onRouteSelect,
  reactionDetailSelected,
  onReactionDetailSelect,
  ...navProps
}: BaseScreenProps & {
  options: any;
  selected: string;
  onSelect: (val: string) => void;
  stepId?: string;
  locationSelected?: string;
  onLocationSelect?: (loc: string) => void;
  medicineSelected?: string;
  routeSelected?: string;
  onMedicineSelect?: (med: string) => void;
  onRouteSelect?: (route: string) => void;
  reactionDetailSelected?: string;
  onReactionDetailSelect?: (detail: string) => void;
}) {
  const isSpanish = navProps.locale === "es";
  const [showBranchModal, setShowBranchModal] = useState<boolean>(false);
  const [showMedicineModal, setShowMedicineModal] = useState<boolean>(false);
  const [showRouteModal, setShowRouteModal] = useState<boolean>(false);
  const [showYetAgainModal, setShowYetAgainModal] = useState<boolean>(false);

  const handleOptionClick = (val: string) => {
    onSelect(val);
    if (stepId === "screen6_4_resolution") {
      if (val === "Yes") {
        setShowBranchModal(true);
      } else {
        setShowBranchModal(false);
        if (onLocationSelect) {
          onLocationSelect("");
        }
      }
    } else if (stepId === "screen6_4b_resolution_type") {
      if (val === "With medication") {
        setShowMedicineModal(true);
        setShowRouteModal(false);
      } else {
        setShowMedicineModal(false);
        setShowRouteModal(false);
        if (onMedicineSelect) onMedicineSelect("");
        if (onRouteSelect) onRouteSelect("");
      }
    } else if (stepId === "screen6_5_yetagain") {
      if (val === "Yes") {
        setShowYetAgainModal(true);
      } else {
        setShowYetAgainModal(false);
        if (onReactionDetailSelect) onReactionDetailSelect("");
      }
    }
  };

  return (
    <div id="slide-content" className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-5 sm:p-6 md:p-8 shadow-lg relative overflow-hidden">
      <div className="flex flex-row gap-2 sm:gap-6 items-center justify-between">
        <div className="flex-1 min-w-0 max-w-3xl pb-2">
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
                      onClick={() => handleOptionClick(opt.value)}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          handleOptionClick(opt.value);
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

              {/* Branch summary badge for Slide 10 if Yes & location chosen */}
              {stepId === "screen6_4_resolution" && selected === "Yes" && locationSelected && (
                <div className="mt-3 flex items-center justify-between bg-white/40 backdrop-blur-xs rounded-xl px-3.5 py-2 text-xs font-semibold text-[#132c27] border border-white/60">
                  <span>
                    {isSpanish ? "Ubicación seleccionada: " : "Selected location: "}
                    <strong className="font-bold text-[#1f5c66]">
                      {isSpanish
                        ? (MEDICAL_CARE_LOCATION_OPTIONS.find((o) => o.value === locationSelected)?.labelEs || locationSelected)
                        : (MEDICAL_CARE_LOCATION_OPTIONS.find((o) => o.value === locationSelected)?.labelEn || locationSelected)}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBranchModal(true)}
                    className="text-[#1f5c66] hover:underline font-bold ml-2 cursor-pointer"
                  >
                    {isSpanish ? "Cambiar" : "Change"}
                  </button>
                </div>
              )}

              {/* Branch summary badge for Slide 11 if With medication & medicine/route chosen */}
              {stepId === "screen6_4b_resolution_type" && selected === "With medication" && (medicineSelected || routeSelected) && (
                <div className="mt-3 flex items-center justify-between bg-white/40 backdrop-blur-xs rounded-xl px-3.5 py-2 text-xs font-semibold text-[#132c27] border border-white/60">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    {medicineSelected && (
                      <span>
                        {isSpanish ? "Medicamento: " : "Medicine: "}
                        <strong className="font-bold text-[#1f5c66]">
                          {isSpanish
                            ? (RESOLUTION_MEDICINE_OPTIONS.find((o) => o.value === medicineSelected)?.labelEs || medicineSelected)
                            : (RESOLUTION_MEDICINE_OPTIONS.find((o) => o.value === medicineSelected)?.labelEn || medicineSelected)}
                        </strong>
                      </span>
                    )}
                    {medicineSelected && routeSelected && <span className="hidden sm:inline text-slate-400">•</span>}
                    {routeSelected && (
                      <span>
                        {isSpanish ? "Toma: " : "Intake: "}
                        <strong className="font-bold text-[#1f5c66]">
                          {isSpanish
                            ? (RESOLUTION_ROUTE_OPTIONS.find((o) => o.value === routeSelected)?.labelEs || routeSelected)
                            : (RESOLUTION_ROUTE_OPTIONS.find((o) => o.value === routeSelected)?.labelEn || routeSelected)}
                        </strong>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMedicineModal(true);
                      setShowRouteModal(false);
                    }}
                    className="text-[#1f5c66] hover:underline font-bold ml-2 cursor-pointer shrink-0"
                  >
                    {isSpanish ? "Cambiar" : "Change"}
                  </button>
                </div>
              )}

              {/* Branch summary badge for Slide 12 if Yes & reaction detail chosen */}
              {stepId === "screen6_5_yetagain" && selected === "Yes" && reactionDetailSelected && (
                <div className="mt-3 flex items-center justify-between bg-white/40 backdrop-blur-xs rounded-xl px-3.5 py-2 text-xs font-semibold text-[#132c27] border border-white/60">
                  <span>
                    {isSpanish ? "Detalle: " : "Detail: "}
                    <strong className="font-bold text-[#1f5c66]">
                      {isSpanish
                        ? (YETAGAIN_REACTION_OPTIONS.find((o) => o.value === reactionDetailSelected)?.labelEs || reactionDetailSelected)
                        : (YETAGAIN_REACTION_OPTIONS.find((o) => o.value === reactionDetailSelected)?.labelEn || reactionDetailSelected)}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowYetAgainModal(true)}
                    className="text-[#1f5c66] hover:underline font-bold ml-2 cursor-pointer shrink-0"
                  >
                    {isSpanish ? "Cambiar" : "Change"}
                  </button>
                </div>
              )}
            </div>
          </fieldset>
        </div>

        {/* Nurse Anna Illustration */}
        <div className="flex flex-shrink-0 self-center md:self-center my-auto p-1">
          <img
            src="/images/nurse-anna.png"
            alt={navProps.locale === "es" ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            role="img"
            aria-label={navProps.locale === "es" ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            className="w-16 sm:w-20 md:w-24 lg:w-28 max-h-[160px] sm:max-h-[190px] md:max-h-[220px] h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
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
          {navProps.loading ? "..." : (isSpanish ? "Siguiente" : navProps.t("next"))}
        </button>
      </div>

      {/* Branch Modal for Slide 10: Where did your child get medical care? */}
      {showBranchModal && stepId === "screen6_4_resolution" && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="branch-modal-title"
        >
          <div className="bg-[#f4f8e8] border border-slate-300/80 rounded-2xl p-5 sm:p-6 shadow-2xl max-w-lg w-full relative animate-in zoom-in-95 duration-200">
            <h3
              id="branch-modal-title"
              className="text-base sm:text-lg font-black text-[#2d221b] text-center mb-4 leading-snug"
            >
              {isSpanish
                ? "¿Dónde recibió atención médica su hijo por la reacción?"
                : "Where did your child get medical care for the reaction?"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mb-4">
              {MEDICAL_CARE_LOCATION_OPTIONS.map((locOpt) => {
                const isLocSelected = locationSelected === locOpt.value;
                const label = isSpanish ? locOpt.labelEs : locOpt.labelEn;
                return (
                  <button
                    type="button"
                    key={locOpt.value}
                    role="radio"
                    aria-checked={isLocSelected}
                    tabIndex={0}
                    onClick={() => {
                      if (onLocationSelect) {
                        onLocationSelect(locOpt.value);
                      }
                    }}
                    className={`px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs border cursor-pointer flex items-center justify-center text-center gap-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                      isLocSelected
                        ? "bg-[#1f5c66] text-white border-[#1f5c66] shadow-md ring-2 ring-[#1f5c66]/40"
                        : "bg-white text-[#132c27] border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {isLocSelected && <span aria-hidden="true" className="text-amber-300 font-black">✓</span>}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer with 7-4-2 Tag and Close / Continue Action */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-300/60">
              <span className="text-[11px] font-mono font-bold text-slate-400 select-none">7-4-2</span>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  aria-label={isSpanish ? "Cerrar ventana" : "Close window"}
                  className="px-4 py-1.5 min-h-[36px] bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-full transition cursor-pointer flex items-center gap-1"
                >
                  <span>✕</span>
                  <span>{isSpanish ? "Cerrar" : "Close"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBranchModal(false);
                    navProps.onNext(selected);
                  }}
                  className="px-5 py-1.5 min-h-[36px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] font-bold text-xs rounded-full transition shadow-xs cursor-pointer active:scale-95"
                >
                  {isSpanish ? "Siguiente" : navProps.t("next")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branch Modal for Slide 11: What medicine was given to your child? (7-4-1) */}
      {showMedicineModal && stepId === "screen6_4b_resolution_type" && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="medicine-modal-title"
        >
          <div className="bg-[#f4f8e8] border border-slate-300/80 rounded-2xl p-5 sm:p-6 shadow-2xl max-w-lg w-full relative animate-in zoom-in-95 duration-200">
            {/* Modal 7-4-1 Heading */}
            <h3
              id="medicine-modal-title"
              className="text-base sm:text-lg font-black text-[#2d221b] text-center mb-4 leading-snug"
            >
              {isSpanish
                ? "¿Qué medicamento se le dio a su hijo para la reacción?"
                : "What medicine was given to your child for the reaction?"}
            </h3>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mb-4">
              {RESOLUTION_MEDICINE_OPTIONS.map((medOpt) => {
                const isMedSelected = medicineSelected === medOpt.value;
                const label = isSpanish ? medOpt.labelEs : medOpt.labelEn;
                return (
                  <button
                    type="button"
                    key={medOpt.value}
                    role="radio"
                    aria-checked={isMedSelected}
                    tabIndex={0}
                    onClick={() => {
                      if (onMedicineSelect) {
                        onMedicineSelect(medOpt.value);
                      }
                    }}
                    className={`px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs border cursor-pointer flex items-center justify-center text-center gap-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                      isMedSelected
                        ? "bg-[#1f5c66] text-white border-[#1f5c66] shadow-md ring-2 ring-[#1f5c66]/40"
                        : "bg-white text-[#132c27] border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {isMedSelected && <span aria-hidden="true" className="text-amber-300 font-black">✓</span>}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer with More Questions >> button, 7-4-1 tag, Close, and Next */}
            <div className="flex flex-col gap-3 pt-3 border-t border-slate-300/60">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowRouteModal(true)}
                  className="px-4 py-1.5 min-h-[36px] bg-white hover:bg-slate-50 text-[#1f5c66] border-2 border-[#1f5c66] rounded-full font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
                >
                  <span>{isSpanish ? "Más preguntas" : "More Questions"}</span>
                  <span className="text-[#1f5c66] font-black tracking-tighter text-sm">»</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-400 select-none">7-4-1</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMedicineModal(false);
                      setShowRouteModal(false);
                    }}
                    aria-label={isSpanish ? "Cerrar ventana" : "Close window"}
                    className="px-4 py-1.5 min-h-[36px] bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-full transition cursor-pointer flex items-center gap-1"
                  >
                    <span>✕</span>
                    <span>{isSpanish ? "Cerrar" : "Close"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMedicineModal(false);
                      setShowRouteModal(false);
                      navProps.onNext(selected);
                    }}
                    className="px-5 py-1.5 min-h-[36px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] font-bold text-xs rounded-full transition shadow-xs cursor-pointer active:scale-95"
                  >
                    {isSpanish ? "Siguiente" : navProps.t("next")}
                  </button>
                </div>
              </div>
            </div>

            {/* Nested Sub-Modal 7-4-1-1: Did your child receive the medicine by: */}
            {showRouteModal && (
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-2xs rounded-2xl flex items-center justify-center p-3 animate-in fade-in zoom-in-95 duration-200 z-20"
                role="dialog"
                aria-modal="true"
                aria-labelledby="route-modal-title"
              >
                <div className="bg-[#8caeab] border border-white/60 rounded-2xl p-4 sm:p-5 shadow-2xl max-w-sm w-full text-center relative">
                  <h4
                    id="route-modal-title"
                    className="text-sm sm:text-base font-bold text-[#132c27] mb-3 leading-snug"
                  >
                    {isSpanish
                      ? "¿Su hijo recibió el medicamento por:"
                      : "Did your child receive the medicine by:"}
                  </h4>

                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {RESOLUTION_ROUTE_OPTIONS.map((routeOpt) => {
                      const isRouteSelected = routeSelected === routeOpt.value;
                      const label = isSpanish ? routeOpt.labelEs : routeOpt.labelEn;
                      return (
                        <button
                          type="button"
                          key={routeOpt.value}
                          role="radio"
                          aria-checked={isRouteSelected}
                          tabIndex={0}
                          onClick={() => {
                            if (onRouteSelect) {
                              onRouteSelect(routeOpt.value);
                            }
                          }}
                          className={`px-3 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs border cursor-pointer inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                            isRouteSelected
                              ? "bg-[#1f5c66] text-white border-[#1f5c66] shadow-md ring-2 ring-[#1f5c66]/40"
                              : "bg-white text-[#132c27] border-white/80 hover:bg-slate-50"
                          }`}
                        >
                          {isRouteSelected && <span aria-hidden="true" className="text-amber-300 font-black">✓</span>}
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sub-modal Footer with 7-4-1-1 Tag, Back and Done */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/40">
                    <span className="text-[11px] font-mono font-bold text-[#193d38] select-none">7-4-1-1</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRouteModal(false)}
                        aria-label={isSpanish ? "Volver" : "Back"}
                        className="px-3.5 py-1.5 min-h-[32px] bg-white/70 hover:bg-white text-[#193d38] font-bold text-xs rounded-full transition cursor-pointer flex items-center gap-1"
                      >
                        <span>←</span>
                        <span>{isSpanish ? "Atrás" : "Back"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRouteModal(false);
                          setShowMedicineModal(false);
                          navProps.onNext(selected);
                        }}
                        className="px-4 py-1.5 min-h-[32px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] font-bold text-xs rounded-full transition shadow-xs cursor-pointer active:scale-95"
                      >
                        {isSpanish ? "Listo" : "Done"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Branch Modal for Slide 12: Has your child taken penicillin (amoxicillin) again since the reaction? (7-5-1) */}
      {showYetAgainModal && stepId === "screen6_5_yetagain" && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="yetagain-modal-title"
        >
          <div className="bg-[#f4f8e8] border border-slate-300/80 rounded-2xl p-5 sm:p-6 shadow-2xl max-w-lg w-full relative animate-in zoom-in-95 duration-200">
            {/* Modal 7-5-1 Heading */}
            <h3
              id="yetagain-modal-title"
              className="text-base sm:text-lg font-black text-[#2d221b] text-center mb-4 leading-snug"
            >
              {isSpanish
                ? "¿Su hijo ha tomado penicilina (amoxicilina) nuevamente desde la reacción?"
                : "Has your child taken penicillin (amoxicillin) again since the reaction?"}
            </h3>

            {/* 3 Options */}
            <div className="space-y-2.5 mb-4">
              {YETAGAIN_REACTION_OPTIONS.map((opt) => {
                const isOptSelected = reactionDetailSelected === opt.value;
                const label = isSpanish ? opt.labelEs : opt.labelEn;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    role="radio"
                    aria-checked={isOptSelected}
                    tabIndex={0}
                    onClick={() => {
                      if (onReactionDetailSelect) {
                        onReactionDetailSelect(opt.value);
                      }
                    }}
                    className={`w-full px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs border cursor-pointer flex items-center justify-center text-center gap-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                      isOptSelected
                        ? "bg-[#f0d411] text-[#1f382f] border-[#e0c406] shadow-sm font-bold ring-2 ring-[#e0c406]/60"
                        : "bg-white text-[#132c27] border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {isOptSelected && <span aria-hidden="true" className="font-black text-[#1f382f]">✓</span>}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer with 7-5-1 Tag, Close, and Next */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-300/60">
              <span className="text-[11px] font-mono font-bold text-slate-400 select-none">7-5-1</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowYetAgainModal(false)}
                  aria-label={isSpanish ? "Cerrar ventana" : "Close window"}
                  className="px-4 py-1.5 min-h-[36px] bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-full transition cursor-pointer flex items-center gap-1"
                >
                  <span>✕</span>
                  <span>{isSpanish ? "Cerrar" : "Close"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowYetAgainModal(false);
                    navProps.onNext(selected);
                  }}
                  className="px-5 py-1.5 min-h-[36px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] font-bold text-xs rounded-full transition shadow-xs cursor-pointer active:scale-95"
                >
                  {isSpanish ? "Siguiente" : navProps.t("next")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
      <div className="block absolute bottom-6 right-2 sm:bottom-10 sm:right-5 pointer-events-none z-10">
        <img
          src="/images/nurse-anna.png"
          alt={
            isSpanish
              ? "Ilustración de la enfermera Anna sonriendo"
              : "Illustration of Nurse Anna smiling in blue scrubs"
          }
          className="w-14 sm:w-18 md:w-22 max-h-[130px] sm:max-h-[160px] md:max-h-[180px] h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
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
          {navProps.loading ? "..." : (isSpanish ? "Siguiente" : navProps.t("next"))}
        </button>
      </div>
    </div>
  );
}

function TextScreen({ title, description, content, ...navProps }: BaseScreenProps) {
  const isSpanish = navProps.locale === "es";
  return (
    <div id="slide-content" className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-5 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
      <div className="flex flex-row items-center justify-between gap-3 sm:gap-6">
        <div className="space-y-4 flex-1 min-w-0 max-w-2xl pb-2 text-left min-h-[10rem]">
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
        <div className="flex flex-shrink-0 self-center my-auto p-1">
          <img
            src="/images/nurse-anna.png"
            alt={navProps.locale === "es" ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            role="img"
            aria-label={navProps.locale === "es" ? "Ilustración de la enfermera Anna sonriendo" : "Illustration of Nurse Anna smiling in blue scrubs"}
            className="w-16 sm:w-20 md:w-24 lg:w-28 max-h-[160px] sm:max-h-[190px] md:max-h-[220px] h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Centered Yellow Next Button */}
      <div className="flex justify-center pt-3 mt-4 border-t border-slate-300/40">
        <button
          type="button"
          onClick={() => navProps.onNext()}
          disabled={navProps.loading}
          className="px-8 py-2 min-h-[44px] bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] rounded-full font-bold text-sm transition shadow-sm active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {navProps.loading ? "..." : (isSpanish ? "Siguiente" : navProps.t("next"))}
        </button>
      </div>
    </div>
  );
}

function SummaryScreen({ 
  title, 
  content, 
  answers, 
  activeToken, 
  onNext, 
  onBack, 
  loading, 
  t, 
  locale, 
  isFirstStep, 
  headingRef 
}: BaseScreenProps & { answers: any; activeToken?: string | null }) {
  const isSpanish = locale === "es";

  const summarySections = [
    {
      id: "screen6_1_symptoms",
      labelKey: "symptoms",
      labelEn: "Reported Symptoms",
      labelEs: "Síntomas Reportados",
      getValue: () => {
        const rawVal = answers?.screen6_1_symptoms;
        if (!rawVal) return isSpanish ? "Ninguno reportado" : "None reported";

        let symArray: string[] = [];
        if (Array.isArray(rawVal)) {
          symArray = rawVal;
        } else if (typeof rawVal === "string") {
          try {
            const parsed = JSON.parse(rawVal);
            symArray = Array.isArray(parsed) ? parsed : [rawVal];
          } catch {
            symArray = [rawVal];
          }
        } else {
          symArray = [String(rawVal)];
        }

        if (symArray.length === 0) return isSpanish ? "Ninguno reportado" : "None reported";

        const step = questionnaireConfig.find((s) => s.id === "screen6_1_symptoms");
        return symArray
          .map((v: string) => {
            if (v === "Other: Please describe" || v === "Other" || v === "Otro: por favor describa" || v === "Otro") {
              return isSpanish ? "Otro" : "Other";
            }
            if (v.startsWith("Other:") || v.startsWith("Otro:")) {
              return v.replace(/_____+/g, "").trim();
            }
            const opt = step?.options?.find((o: any) => o.value === v || o.labelEn === v || o.labelEs === v);
            return isSpanish ? opt?.labelEs || v : opt?.labelEn || v;
          })
          .filter(Boolean)
          .join(", ");
      },
    },
    {
      id: "screen6_2_timing",
      labelKey: "timing",
      labelEn: "Age at Reaction",
      labelEs: "Edad en la Reacción",
      getValue: () => {
        const val = answers?.screen6_2_timing;
        if (!val || val === "none_selected" || val === "undefined") return isSpanish ? "No provisto" : "Not provided";
        return isSpanish ? `${val} años` : `${val} years old`;
      },
    },
    {
      id: "screen6_3_onset",
      labelKey: "onset",
      labelEn: "Time to Onset",
      labelEs: "Tiempo de Inicio",
      getValue: () => {
        const val = answers?.screen6_3_onset;
        if (!val || val === "none_selected" || val === "undefined") return isSpanish ? "No provisto" : "Not provided";
        const step = questionnaireConfig.find((s) => s.id === "screen6_3_onset");
        const opt = step?.options?.find((o: any) => o.value === val);
        return isSpanish ? opt?.labelEs || val : opt?.labelEn || val;
      },
    },
    {
      id: "screen6_4_resolution",
      labelKey: "resolution",
      labelEn: "Medical Care Received",
      labelEs: "Atención Médica Recibida",
      getValue: () => {
        const val = answers?.screen6_4_resolution;
        const loc = answers?.screen6_4_location;
        if (!val || val === "none_selected" || val === "undefined") return isSpanish ? "No provisto" : "Not provided";
        const step = questionnaireConfig.find((s) => s.id === "screen6_4_resolution");
        const opt = step?.options?.find((o: any) => o.value === val);
        const mainText = isSpanish ? opt?.labelEs || val : opt?.labelEn || val;
        if (val === "Yes" && loc) {
          const locOpt = MEDICAL_CARE_LOCATION_OPTIONS.find((o) => o.value === loc);
          const locText = isSpanish ? locOpt?.labelEs || loc : locOpt?.labelEn || loc;
          return `${mainText} (${locText})`;
        }
        return mainText;
      },
    },
    {
      id: "screen6_4b_resolution_type",
      labelKey: "resolutionType",
      labelEn: "Symptom Resolution",
      labelEs: "Resolución de Síntomas",
      getValue: () => {
        const val = answers?.screen6_4b_resolution_type;
        const med = answers?.screen6_4b_medicine;
        const route = answers?.screen6_4b_route;
        if (!val || val === "none_selected" || val === "undefined") return isSpanish ? "No provisto" : "Not provided";
        const step = questionnaireConfig.find((s) => s.id === "screen6_4b_resolution_type");
        const opt = step?.options?.find((o: any) => o.value === val);
        const mainText = isSpanish ? opt?.labelEs || val : opt?.labelEn || val;
        if (val === "With medication" && (med || route)) {
          const medOpt = RESOLUTION_MEDICINE_OPTIONS.find((o) => o.value === med);
          const medText = isSpanish ? medOpt?.labelEs || med : medOpt?.labelEn || med;
          const routeOpt = RESOLUTION_ROUTE_OPTIONS.find((o) => o.value === route);
          const routeText = isSpanish ? routeOpt?.labelEs || route : routeOpt?.labelEn || route;

          if (med && route) {
            return `${mainText} (${medText} - ${routeText})`;
          } else if (med) {
            return `${mainText} (${medText})`;
          } else if (route) {
            return `${mainText} (${routeText})`;
          }
        }
        return mainText;
      },
    },
    {
      id: "screen6_5_yetagain",
      labelKey: "yetagain",
      labelEn: "Penicillin Since Reaction",
      labelEs: "Re-exposición Desde la Reacción",
      getValue: () => {
        const val = answers?.screen6_5_yetagain;
        const detail = answers?.screen6_5_reaction_detail;
        if (!val || val === "none_selected" || val === "undefined") return isSpanish ? "No provisto" : "Not provided";
        const step = questionnaireConfig.find((s) => s.id === "screen6_5_yetagain");
        const opt = step?.options?.find((o: any) => o.value === val);
        const mainText = isSpanish ? opt?.labelEs || val : opt?.labelEn || val;
        if (val === "Yes" && detail) {
          const detailOpt = YETAGAIN_REACTION_OPTIONS.find((o) => o.value === detail);
          const detailText = isSpanish ? detailOpt?.labelEs || detail : detailOpt?.labelEn || detail;
          return `${mainText} (${detailText})`;
        }
        return mainText;
      },
    },
  ];

  const paragraphs = (content || "").split("\n\n");
  const steps = paragraphs.filter((p) => p.startsWith("#"));
  const calloutParagraph = paragraphs.find((p) => p.toLowerCase().includes("say:") || p.toLowerCase().includes("decir:"));
  const quoteParagraph = paragraphs.find((p) => p.startsWith('"') || p.startsWith('“'));

  return (
    <div 
      id="slide-content" 
      className="print-container bg-white border border-slate-200/80 rounded-2xl shadow-md p-4 sm:p-6 w-full max-w-4xl mx-auto flex flex-col justify-between"
    >
      {/* 1. Polite Status Announcement for Screen Readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {isSpanish 
          ? "Paso 13: Pasos a seguir para los padres y resumen de respuestas para el médico." 
          : "Step 13: Action Steps for Parents and summary of responses for the doctor."}
      </div>

      <div className="print-section text-center">
        {/* Heading without tabIndex (0 ANDI Alerts) */}
        <h2 
          className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 mb-3 text-center tracking-tight leading-tight outline-none"
        >
          {title || (isSpanish ? "Pasos a seguir para los padres" : "Action Steps for Parents")}
        </h2>

        {/* Semantic Ordered List for Screen Readers & WAVE */}
        <ol className="space-y-2 max-w-xl mx-auto text-left mb-4 list-none p-0">
          {steps.map((step, idx) => {
            const cleanText = step.replace(/^#\d+\.\s*/, "");
            return (
              <li key={idx} className="flex items-start gap-2.5">
                <span 
                  aria-hidden="true" 
                  className="shrink-0 w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center mt-0.5"
                >
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-snug font-semibold">
                  <span className="sr-only">{`Step ${idx + 1}: `}</span>
                  {cleanText}
                </p>
              </li>
            );
          })}
        </ol>

        {/* Doctor Conversation Guidance Callout */}
        {calloutParagraph && quoteParagraph && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-w-xl mx-auto text-left shadow-2xs mb-4">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              {isSpanish ? "Lo que puede decirle al médico:" : "What you can say to the doctor:"}
            </p>
            <p className="text-xs sm:text-sm text-slate-900 font-semibold italic leading-snug">
              {quoteParagraph}
            </p>
          </div>
        )}
      </div>

      {/* Semantic Definition List for Assessment Summary Grid */}
      <div className="print-section border-t border-slate-200 pt-3 mb-4">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left m-0">
          {summarySections.map((section) => {
            const label = isSpanish ? section.labelEs : section.labelEn;
            return (
              <div 
                key={section.id} 
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 shadow-2xs"
              >
                {/* High Contrast Label (> 6.5:1 ratio, No Truncation) */}
                <dt className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  {label}
                </dt>
                <dd className="m-0 text-xs sm:text-sm text-slate-950 font-black leading-snug break-words">
                  {section.getValue()}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      {/* Action Buttons: 44px Minimum Touch Targets with AAA Contrast */}
      <div className="flex flex-wrap gap-3 justify-center pt-3 border-t border-slate-200 no-print shrink-0">
        <button
          type="button"
          onClick={() => window.print()}
          className="px-5 py-2.5 min-h-[44px] border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-full text-xs sm:text-sm font-bold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>{isSpanish ? "Imprimir Informe" : t("print")}</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => {
            try {
              generateAssessmentPDF({
                participantId: activeToken || undefined,
                token: activeToken || undefined,
                locale,
                answers,
                summarySections: summarySections.map((s) => ({
                  label: isSpanish ? s.labelEs : s.labelEn,
                  value: s.getValue(),
                })),
                steps: steps.map((s) => s.replace(/^#\d+\.\s*/, "")),
              });
            } catch (err) {
              console.error("PDF generation error:", err);
            }
            onNext();
          }}
          className="px-8 py-2.5 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-xs sm:text-sm tracking-wide transition shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{isSpanish ? "Guardando..." : "Saving..."}</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{isSpanish ? "Completar y Guardar como PDF" : t("completeSave")}</span>
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
        }
      `}</style>
    </div>
  );
}