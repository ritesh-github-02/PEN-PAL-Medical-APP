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
import { NurseAnna } from "./NurseAnna";
import { generateAssessmentPDF } from "@/lib/generate-pdf";
import { SuccessScreen } from "./SuccessScreen";
import { Slide12AgeCohortScreen } from "./Slide12AgeCohortScreen";
import { Slide2MedicineNamingScreen } from "./Slide2MedicineNamingScreen";
import { Slide3EfficacyScreen } from "./Slide3EfficacyScreen";
import { Slide4AllergyBarrierScreen } from "./Slide4AllergyBarrierScreen";
import { Slide5PrevalenceScreen } from "./Slide5PrevalenceScreen";
import { Slide6MythTruthScreen } from "./Slide6MythTruthScreen";
import { Slide8MilestoneScreen } from "./Slide8MilestoneScreen";
import { Slide9WhyItMattersScreen } from "./Slide9WhyItMattersScreen";
import { Slide10TestingOverviewScreen } from "./Slide10TestingOverviewScreen";
import { Slide10SurveyIntroScreen } from "./Slide10SurveyIntroScreen";
import { Slide11SymptomsScreen } from "./Slide11SymptomsScreen";
import { Slide13OnsetScreen } from "./Slide13OnsetScreen";
import { Slide14MedicalCareScreen } from "./Slide14MedicalCareScreen";
import { Slide16ResolutionScreen } from "./Slide16ResolutionScreen";
import { Slide19RepeatUseScreen } from "./Slide19RepeatUseScreen";
import { Slide21WhatNowScreen } from "./Slide21WhatNowScreen";
import { Slide18SummaryScreen } from "./Slide18SummaryScreen";
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
  const isInitialMount = useRef(true);

  // 1. Session Reset for Testers via ?reset=true
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("reset=true")) {
      localStorage.removeItem("penpal_progress");
      localStorage.removeItem("penpal_answers");
      sessionStorage.clear();
    }
  }, []);

  // 2. Focus Management: Do NOT steal focus on initial page load (Slide 1)
  useEffect(() => {
    if (!initialized) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // Leave focus at top of page so Language Switcher is encountered first
    }
    // Only auto-focus heading when moving between subsequent steps
    setTimeout(() => {
      if (isTerminated && exitHeadingRef.current) {
        exitHeadingRef.current.focus();
      } else if (headingRef.current) {
        headingRef.current.focus();
      }
    }, 50);
  }, [currentStepIndex, showSummary, isTerminated, initialized]);

  useEffect(() => {
    async function init() {
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const isResetParam = searchParams ? searchParams.get('reset') === 'true' : false;
      if (isResetParam) {
        localStorage.removeItem("penpal_progress");
        localStorage.removeItem("penpal_answers");
        sessionStorage.clear();
      }
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

      if (showReport || (progress.isAllCompleted && stepParam === null)) {
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
      // Build compound metadata for slides with modal branching
      let metadata: string | undefined = undefined;
      if (currentStep.id === "screen6_1_symptoms") {
        if (answers["rashDetails"] || answers["symptomsOther"]) {
          metadata = JSON.stringify({
            rashDetails: answers["rashDetails"] || null,
            symptomsOther: answers["symptomsOther"] || null,
          });
        }
      } else if (currentStep.id === "screen6_4_resolution" && answers["screen6_4_location"]) {
        metadata = JSON.stringify({ location: answers["screen6_4_location"] });
      } else if (currentStep.id === "screen6_4b_resolution_type") {
        metadata = JSON.stringify({ 
          medicines: answers["resolutionMedicines"] || (answers["screen6_4b_medicine"] ? [answers["screen6_4b_medicine"]] : null),
          medicine: answers["screen6_4b_medicine"] || null, 
          route: answers["screen6_4b_route"] || null 
        });
      } else if (currentStep.id === "screen6_5_yetagain" && answers["screen6_5_reaction_detail"]) {
        metadata = JSON.stringify({ reactionDetail: answers["screen6_5_reaction_detail"] });
      }

      await submitAnswer(currentStep.id, answerPayload, Math.round(currentSlideDwellMs), metadata);
      if (currentStep.id === "screen6_4_resolution" && answers["screen6_4_location"]) {
        await submitAnswer("screen6_4_location", String(answers["screen6_4_location"]), Math.round(currentSlideDwellMs));
      }
      if (currentStep.id === "screen6_4b_resolution_type") {
        if (answers["resolutionMedicines"] && Array.isArray(answers["resolutionMedicines"])) {
          await submitAnswer("resolutionMedicines", answers["resolutionMedicines"], Math.round(currentSlideDwellMs));
        }
        if (answers["screen6_4b_medicine"]) {
          await submitAnswer("screen6_4b_medicine", String(answers["screen6_4b_medicine"]), Math.round(currentSlideDwellMs));
        }
        if (answers["screen6_4b_route"]) {
          await submitAnswer("screen6_4b_route", String(answers["screen6_4b_route"]), Math.round(currentSlideDwellMs));
        }
      }
      if (currentStep.id === "screen6_5_yetagain" && answers["screen6_5_reaction_detail"]) {
        await submitAnswer("screen6_5_reaction_detail", String(answers["screen6_5_reaction_detail"]), Math.round(currentSlideDwellMs));
      }
      await logInteraction(
        "QUESTION_ANSWER",
        {
          stepId: currentStep.id,
          answer,
          rashDetails: answers["rashDetails"] || undefined,
          location: answers["screen6_4_location"] || undefined,
          medicines: answers["resolutionMedicines"] || undefined,
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
      <SuccessScreen
        locale={locale}
        onSwitchLanguage={handleLanguageSwitch}
      />
    );
  }

  const medicationName = answers?.medicationName || answers?.screen2_naming || "";
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
      className="h-screen h-[100dvh] max-h-[100dvh] w-full max-w-full flex flex-col items-center justify-center p-2 sm:p-3 md:p-3.5 relative font-sans bg-[#f4f8e8] overflow-hidden"
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
      <div 
        className="w-full relative z-10 flex flex-col items-center gap-1.5 sm:gap-2 h-full max-h-full justify-center transition-all duration-300"
        style={{
          maxWidth: "min(56rem, calc((100dvh - 4.25rem) * 1.55), 100%)",
        }}
      >
        {/* Header Bar matching old slide: Logo, Step Progress, and Language Switcher */}
        <header className="w-full shrink-0 flex items-center justify-between px-3 sm:px-4 py-1 sm:py-1.5 bg-white/90 backdrop-blur border border-slate-200/90 rounded-2xl shadow-xs no-print">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#236f7a]" aria-hidden="true"></span>
            <span className="font-black text-xs sm:text-sm tracking-tight text-[#236f7a] font-display">PEN-PAL</span>
            <span className="text-slate-300 text-xs" aria-hidden="true">|</span>
            {(() => {
              const activeCount = questionnaireConfig.filter((s) => !s.isTerminal && s.id !== "screen_end").length + 1;
              const displayStep = showSummary ? activeCount : Math.min(currentStepIndex + 1, activeCount);
              return (
                <span 
                  className="text-[11px] font-bold text-slate-700"
                  aria-label={locale === "es" ? `Progreso: Paso ${displayStep} de ${activeCount}` : `Progress: Step ${displayStep} of ${activeCount}`}
                >
                  {locale === "es"
                    ? `Paso ${displayStep} de ${activeCount}`
                    : `Step ${displayStep} of ${activeCount}`}
                </span>
              );
            })()}
          </div>
          <LanguageSwitcher locale={locale} onSwitch={handleLanguageSwitch} />
        </header>

        {/* =========================================================================
            REALISTIC TABLET HARDWARE MOCKUP (LANDSCAPE ORIENTATION)
            ========================================================================= */}
        <div className="w-full flex-1 min-h-0 flex items-center justify-center relative">
          {/* Outer Tablet Bezel Frame */}
          <div 
            className="relative w-full h-full max-h-full bg-[#181a1d] p-2.5 sm:p-3 md:p-3.5 rounded-[1.6rem] sm:rounded-[2.2rem] md:rounded-[2.5rem] border-2 border-[#2b2e33] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06)_inset] flex flex-col"
            style={{
              aspectRatio: "16 / 10.3",
              maxHeight: "calc(100dvh - 4.25rem)",
            }}
          >
            
            {/* Left Bezel Camera Array (Landscape Tablet) */}
            <div 
              className="absolute left-1 sm:left-1.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 pointer-events-none select-none z-30"
              aria-hidden="true"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d0f12] border border-[#272a30]"></span>
              <span className="w-2 h-2 rounded-full bg-[#0a0f16] ring-1 ring-[#262f3d] flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-[#1e3c59]/90"></span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d0f12] border border-[#272a30]"></span>
            </div>

            {/* Tablet Inner Screen with Mesh Gradient */}
            <div 
              className="relative w-full h-full flex-1 min-h-0 rounded-[1.1rem] sm:rounded-[1.5rem] md:rounded-[1.7rem] overflow-hidden shadow-inner flex flex-col justify-between"
              style={{
                background: `
                  radial-gradient(circle at 18% 20%, rgba(186, 203, 246, 0.95) 0%, rgba(186, 203, 246, 0) 48%),
                  radial-gradient(circle at 12% 75%, rgba(162, 230, 228, 0.9) 0%, rgba(162, 230, 228, 0) 50%),
                  radial-gradient(circle at 82% 18%, rgba(204, 246, 219, 0.9) 0%, rgba(204, 246, 219, 0) 48%),
                  radial-gradient(circle at 88% 82%, rgba(235, 248, 208, 0.95) 0%, rgba(235, 248, 208, 0) 52%),
                  linear-gradient(135deg, #c4d4f8 0%, #b2e7e3 28%, #cdf3da 62%, #ecf9d4 100%)
                `,
              }}
            >
              {/* Slide Content */}
              <div className="relative w-full h-full flex-1 min-h-0 flex flex-col justify-between overflow-y-auto">
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
                <Slide18SummaryScreen
                  isSpanish={locale === "es"}
                  answers={answers}
                  activeToken={activeToken}
                  participantId={activeToken}
                  onBack={handleBack}
                  onPrint={() => window.print()}
                  onNavigateToSuccess={() => {
                    setShowSuccess(true);
                  }}
                  onNext={() => {
                    setShowSuccess(true);
                  }}
                />
              ) : (
                <>
                  {currentStep.id === "screen1_intro" ? (
                    <IntroScreen
                      {...baseProps}
                      onAnswer={handleAnswer}
                      onNoBranching={() => setIsTerminated(true)}
                    />
                  ) : currentStep.id === "slide2_naming" ? (
                    <Slide2MedicineNamingScreen
                      isSpanish={locale === "es"}
                      selected={answers["medicationName"] || answers["screen2_naming"]}
                      onSelect={(val: string) => {
                        setAnswers((prev) => {
                          const updated = { ...prev, medicationName: val, screen2_naming: val };
                          try {
                            localStorage.setItem("penpal_progress", JSON.stringify(updated));
                          } catch {}
                          return updated;
                        });
                        submitAnswer("medicationName", val, 0).catch(() => {});
                        logInteraction("MEDICINE_NAME_SELECT", { medicationName: val }, "/intervention/flow").catch(() => {});
                      }}
                      onNext={() => handleNext(answers["medicationName"] || answers["screen2_naming"])}
                      onBack={handleBack}
                      loading={loading}
                    />
                  ) : currentStep.id === "slide3_efficacy" ? (
                    <Slide3EfficacyScreen
                      isSpanish={locale === "es"}
                      medicationName={medicationName}
                      onNext={() => handleNext()}
                      onBack={handleBack}
                      loading={loading}
                    />
                  ) : currentStep.id === "slide4_barrier" ? (
                    <Slide4AllergyBarrierScreen
                      isSpanish={locale === "es"}
                      medicationName={medicationName}
                      onNext={() => handleNext()}
                      onBack={handleBack}
                      loading={loading}
                    />
                  ) : currentStep.id === "slide5_prevalence" || currentStep.id === "screen2_statistics" ? (
                    <Slide5PrevalenceScreen
                      isSpanish={locale === "es"}
                      medicationName={medicationName}
                      onNext={() => handleNext()}
                      onBack={handleBack}
                      loading={loading}
                    />
                  ) : currentStep.id === "slide6_myths" || currentStep.id === "screen3_5_knowledge_test" || currentStep.id === "screen3_6_all_correct" ? (
                    <Slide6MythTruthScreen
                      isSpanish={locale === "es"}
                      medicationName={medicationName}
                      revealedCards={answers["revealedMyths"] || []}
                      onRevealedChange={(rev) => {
                        setAnswers((prev) => {
                          const updated = { ...prev, revealedMyths: rev };
                          try {
                            localStorage.setItem("penpal_progress", JSON.stringify(updated));
                          } catch {}
                          return updated;
                        });
                        submitAnswer("revealedMyths", JSON.stringify(rev), 0).catch(() => {});
                      }}
                      onNext={() => handleNext()}
                      onBack={handleBack}
                      loading={loading}
                    />
                  ) : currentStep.id === "slide8_milestone" ? (
                    <Slide8MilestoneScreen
                      isSpanish={locale === "es"}
                      onNext={() => handleNext()}
                      onBack={handleBack}
                      loading={loading}
                    />
                  ) : currentStep.id === "slide9_why_it_matters" ? (
                    <Slide9WhyItMattersScreen
                      isSpanish={locale === "es"}
                      medicationName={medicationName}
                      onNext={() => handleNext()}
                      onBack={handleBack}
                      loading={loading}
                    />
                  ) : currentStep.id === "slide10_testing" || currentStep.id === "screen4_testing" ? (
                    <Slide10TestingOverviewScreen
                      isSpanish={locale === "es"}
                      medicationName={medicationName}
                      onNext={() => handleNext()}
                      onBack={handleBack}
                      loading={loading}
                    />
                  ) : currentStep.id === "screen6_survey_intro" || currentStep.id === "slide10_survey_intro" ? (
                    <Slide10SurveyIntroScreen
                      isSpanish={locale === "es"}
                      onNext={() => handleNext()}
                      onBack={handleBack}
                      loading={loading}
                    />
                  ) : currentStep.id === "screen6_1_symptoms" ? (
                    <Slide11SymptomsScreen
                      isSpanish={locale === "es"}
                      medicationName={medicationName}
                      selectedSymptoms={Array.isArray(answers["screen6_1_symptoms"]) ? answers["screen6_1_symptoms"] : (answers["screen6_1_symptoms"] ? [answers["screen6_1_symptoms"]] : [])}
                      symptomsOther={answers["symptomsOther"] || ""}
                      rashDetails={answers["rashDetails"] || []}
                      swellingDetails={answers["swellingDetails"] || []}
                      onSelectSymptoms={(syms) => {
                        setAnswers((prev) => {
                          const updated = { ...prev, screen6_1_symptoms: syms, symptoms: syms };
                          try {
                            localStorage.setItem("penpal_progress", JSON.stringify(updated));
                          } catch {}
                          return updated;
                        });
                        submitAnswer("screen6_1_symptoms", syms, 0).catch(() => {});
                      }}
                      onSymptomsOtherChange={(val) => {
                        setAnswers((prev) => ({ ...prev, symptomsOther: val }));
                        submitAnswer("symptomsOther", val, 0).catch(() => {});
                      }}
                      onRashDetailsChange={(details) => {
                        setAnswers((prev) => ({ ...prev, rashDetails: details }));
                        submitAnswer("rashDetails", details, 0).catch(() => {});
                      }}
                      onSwellingDetailsChange={(details) => {
                        setAnswers((prev) => ({ ...prev, swellingDetails: details }));
                        submitAnswer("swellingDetails", details, 0).catch(() => {});
                        logInteraction("SYMPTOM_SWELLING_SUBTYPES", { details }, "/intervention/flow").catch(() => {});
                      }}
                      onNext={() => handleNext(answers["screen6_1_symptoms"])}
                      onBack={handleBack}
                      loading={loading}
                    />
                  ) : currentStep.id === "screen6_2_timing" ? (
                    <Slide12AgeCohortScreen
                      isSpanish={locale === "es"}
                      selected={answers[currentStep.id] || answers["ageCohort"]}
                      medicationName={answers["medicationName"] || answers["screen2_naming"]}
                      onSelect={(val: string) => {
                        handleAnswer(val);
                        setAnswers((prev) => {
                          const updated = { ...prev, screen6_2_timing: val, ageCohort: val };
                          try {
                            localStorage.setItem("penpal_progress", JSON.stringify(updated));
                          } catch {}
                          return updated;
                        });
                        submitAnswer("screen6_2_timing", val, 0).catch(() => {});
                        logInteraction("QUESTION_ANSWER", { stepId: "screen6_2_timing", answer: val }, "/intervention/flow").catch(() => {});
                      }}
                      onNext={() => handleNext(answers[currentStep.id] || answers["ageCohort"])}
                      onBack={handleBack}
                      loading={loading}
                      navProps={baseProps}
                    />
                  ) : currentStep.id === "screen6_3_onset" ? (
                    <Slide13OnsetScreen
                      isSpanish={locale === "es"}
                      medicationName={medicationName}
                      selected={answers["screen6_3_onset"] || answers["onset"]}
                      onSelect={(val: string) => {
                        setAnswers((prev) => {
                          const updated = { ...prev, screen6_3_onset: val, onset: val };
                          try {
                            localStorage.setItem("penpal_progress", JSON.stringify(updated));
                          } catch {}
                          return updated;
                        });
                        submitAnswer("screen6_3_onset", val, 0).catch(() => {});
                        logInteraction("QUESTION_ANSWER", { stepId: "screen6_3_onset", answer: val }, "/intervention/flow").catch(() => {});
                      }}
                      onNext={() => handleNext(answers["screen6_3_onset"] || answers["onset"])}
                      onBack={handleBack}
                      loading={loading}
                      navProps={baseProps}
                    />
                  ) : currentStep.id === "screen6_4_resolution" ? (
                    <Slide14MedicalCareScreen
                      isSpanish={locale === "es"}
                      selected={answers["screen6_4_resolution"] || answers["medicalCareReceived"]}
                      locationSelected={answers["screen6_4_location"] || answers["medicalCareLocation"]}
                      onSelect={(val: string) => {
                        setAnswers((prev) => {
                          const updated = { ...prev, screen6_4_resolution: val, medicalCareReceived: val };
                          try {
                            localStorage.setItem("penpal_progress", JSON.stringify(updated));
                          } catch {}
                          return updated;
                        });
                        submitAnswer("screen6_4_resolution", val, 0).catch(() => {});
                      }}
                      onLocationSelect={(loc: string) => {
                        setAnswers((prev) => {
                          const updated = { ...prev, screen6_4_location: loc, medicalCareLocation: loc };
                          try {
                            localStorage.setItem("penpal_progress", JSON.stringify(updated));
                          } catch {}
                          return updated;
                        });
                        submitAnswer("screen6_4_location", loc, 0).catch(() => {});
                      }}
                      onNext={() => handleNext(answers["screen6_4_resolution"] || answers["medicalCareReceived"])}
                      onBack={handleBack}
                      loading={loading}
                      navProps={baseProps}
                    />
                  ) : currentStep.id === "screen6_4b_resolution_type" ? (
                    <Slide16ResolutionScreen
                      isSpanish={locale === "es"}
                      selected={answers["screen6_4b_resolution_type"] || answers["resolution"]}
                      medicines={answers["resolutionMedicines"] || (answers["screen6_4b_medicine"] ? [answers["screen6_4b_medicine"]] : [])}
                      route={answers["screen6_4b_route"] || answers["resolutionRoute"]}
                      onSelectResolution={(val: string) => {
                        setAnswers((prev) => {
                          const updated = { ...prev, screen6_4b_resolution_type: val, resolution: val };
                          try {
                            localStorage.setItem("penpal_progress", JSON.stringify(updated));
                          } catch {}
                          return updated;
                        });
                        submitAnswer("screen6_4b_resolution_type", val, 0).catch(() => {});
                      }}
                      onSelectMedicines={(meds: string[]) => {
                        setAnswers((prev) => {
                          const updated = { ...prev, resolutionMedicines: meds, screen6_4b_medicine: meds[0] || "" };
                          try {
                            localStorage.setItem("penpal_progress", JSON.stringify(updated));
                          } catch {}
                          return updated;
                        });
                        submitAnswer("resolutionMedicines", meds, 0).catch(() => {});
                      }}
                      onSelectRoute={(rt: string) => {
                        setAnswers((prev) => {
                          const updated = { ...prev, screen6_4b_route: rt, resolutionRoute: rt };
                          try {
                            localStorage.setItem("penpal_progress", JSON.stringify(updated));
                          } catch {}
                          return updated;
                        });
                        submitAnswer("screen6_4b_route", rt, 0).catch(() => {});
                      }}
                      onNext={() => handleNext(answers["screen6_4b_resolution_type"] || answers["resolution"])}
                      onBack={handleBack}
                      loading={loading}
                      navProps={baseProps}
                    />
                  ) : currentStep.id === "screen6_5_yetagain" ? (
                    <Slide19RepeatUseScreen
                      isSpanish={locale === "es"}
                      selected={answers["screen6_5_yetagain"] || answers["repeatPenicillin"]}
                      reactionDetailSelected={answers["screen6_5_reaction_detail"] || answers["repeatPenicillinDetail"]}
                      onSelect={(val: string) => {
                        setAnswers((prev) => {
                          const updated = { ...prev, screen6_5_yetagain: val, repeatPenicillin: val };
                          try {
                            localStorage.setItem("penpal_progress", JSON.stringify(updated));
                          } catch {}
                          return updated;
                        });
                        submitAnswer("screen6_5_yetagain", val, 0).catch(() => {});
                      }}
                      onReactionDetailSelect={(det: string) => {
                        setAnswers((prev) => {
                          const updated = { ...prev, screen6_5_reaction_detail: det, repeatPenicillinDetail: det };
                          try {
                            localStorage.setItem("penpal_progress", JSON.stringify(updated));
                          } catch {}
                          return updated;
                        });
                        submitAnswer("screen6_5_reaction_detail", det, 0).catch(() => {});
                      }}
                      onNext={() => handleNext(answers["screen6_5_yetagain"] || answers["repeatPenicillin"])}
                      onBack={handleBack}
                      loading={loading}
                      navProps={baseProps}
                    />
                  ) : currentStep.id === "slide21_what_now" ? (
                    <Slide21WhatNowScreen
                      isSpanish={locale === "es"}
                      medicationName={medicationName}
                      onNext={() => {
                        setShowSummary(true);
                        if (typeof window !== "undefined") {
                          const sp = new URLSearchParams(window.location.search);
                          sp.set("report", "true");
                          window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
                        }
                      }}
                      onBack={handleBack}
                      loading={loading}
                      navProps={baseProps}
                    />
                  ) : currentStep.type === "summary" ? (
                    <Slide18SummaryScreen
                      isSpanish={locale === "es"}
                      answers={answers}
                      activeToken={activeToken}
                      participantId={activeToken}
                      onBack={handleBack}
                      onPrint={() => window.print()}
                      onNavigateToSuccess={() => setShowSuccess(true)}
                      onNext={() => setShowSuccess(true)}
                    />
                  ) : currentStep.type === "single_choice" ? (
                    <SurveySingleChoice
                      {...baseProps}
                      stepId={currentStep.id}
                      options={currentStep.options}
                      selected={answers[currentStep.id]}
                      onSelect={handleAnswer}
                    />
                  ) : currentStep.type === "multiple_choice" ? (
                    <SurveyMultipleChoice
                      {...baseProps}
                      options={currentStep.options}
                      selected={answers[currentStep.id]}
                      onSelect={handleAnswer}
                    />
                  ) : (
                    <TextScreen {...baseProps} />
                  )}
                </>
              )}
              </div>

              {/* Bottom-Right Audio & CC Controls inside the tablet screen */}
              {(!isTerminated && !showSuccess && currentStep && currentStep.type !== "summary") && (
                <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 md:bottom-5 md:right-7 z-30">
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
                </div>
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

function IntroScreen({ title, description, content, onNext, onAnswer, loading, t, locale, headingRef }: BaseScreenProps & { onAnswer: (val: string) => void; onNoBranching?: () => void }) {
  const isSpanish = locale === "es";
  const introSubtitle = description || (isSpanish ? "Padres Involucrados en Alergias a la Penicilina" : "Parents Engaged in Penicillin Allergies");
  const mainCopy = isSpanish
    ? "¡Hola! Soy la enfermera Anna. Hablemos sobre las alergias a la penicilina en los niños."
    : "Hi! I'm nurse Anna. Let's talk about penicillin allergies in kids.";

  return (
    <div
      id="slide-content"
      className="relative w-full h-full flex-1 min-h-0 flex flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-16 py-4 sm:py-6"
    >
      <div className="flex flex-row items-center justify-between gap-4 sm:gap-8 md:gap-12 max-w-4xl w-full my-auto">
        {/* Left Column: Heading, Subtitle, Copy, and Left-Aligned CTA Button */}
        <div className="flex-1 space-y-2 sm:space-y-3 md:space-y-4 text-left z-10 max-w-lg">
          <div>
            {/* Golden-Yellow Title with Dark Teal Stroke & Drop Shadow matching Image */}
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.35rem] font-black tracking-tight font-display outline-none select-none text-[#ebb016]"
              style={{
                WebkitTextStroke: "1.8px #12403d",
                paintOrder: "stroke fill",
                textShadow: "0 2px 0 #12403d, 0 3px 2px rgba(18, 64, 61, 0.3)",
              }}
            >
              PEN–PAL
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#143e3b] mt-1 sm:mt-1.5 tracking-tight">
              {introSubtitle}
            </p>
          </div>

          <p className="text-xs sm:text-sm md:text-base lg:text-[1.05rem] font-medium text-[#1c403c] leading-relaxed max-w-xs sm:max-w-sm md:max-w-md pt-1 sm:pt-2">
            {mainCopy}
          </p>

          {/* Left-Aligned Pastel Butter-Yellow Pill Button: "Get Started!" */}
          <div className="pt-3 sm:pt-5">
            <button
              type="button"
              onClick={() => {
                onAnswer("yes");
                onNext("yes");
              }}
              disabled={loading}
              className="px-6 sm:px-7 py-2 sm:py-2.5 rounded-full bg-[#fde989] hover:bg-[#f6df71] text-[#1b3b32] border border-[#dcc65b] font-bold text-xs sm:text-sm md:text-[15px] shadow-xs transition duration-150 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
            >
              {loading ? "..." : (isSpanish ? "¡Comenzar!" : "Get Started!")}
            </button>
          </div>
        </div>

        {/* Right Column: Nurse Anna Illustration (Smaller scale) */}
        <div className="shrink-0 flex items-center justify-center sm:pr-2 z-10">
          <NurseAnna size="md" imgClassName="w-20 sm:w-24 md:w-28 lg:w-32 max-h-[160px] sm:max-h-[190px] md:max-h-[220px] object-contain" isDecorative={false} locale={locale} />
        </div>
      </div>
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
    <div id="slide-content" className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-4 sm:p-5 md:p-6 shadow-lg relative min-h-0 overflow-y-auto">
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

        {/* Nurse Anna Illustration (Decorative on Slide 5) */}
        <NurseAnna size="md" isDecorative={true} />
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
  { value: "Emergency room (ER)", labelEn: "Emergency room (ER)", labelEs: "Sala de emergencias (SE)" },
  { value: "Urgent care", labelEn: "Urgent care", labelEs: "Centro de atención de urgencias" },
  { value: "Primary care doctor", labelEn: "Primary care doctor", labelEs: "Médico de atención primaria" },
  { value: "Hospital", labelEn: "Hospital", labelEs: "Hospital" },
  { value: "Phone call with doctor", labelEn: "Phone call with doctor", labelEs: "Consulta telefónica con un médico" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/No lo sé" },
];

const RESOLUTION_MEDICINE_OPTIONS = [
  { value: "Allergy medicine (Benadryl, Zyrtec)", labelEn: "Allergy medicine (Benadryl, Zyrtec)", labelEs: "Medicamento para la alergia (Benadryl, Zyrtec)" },
  { value: "Steroid medicine (Prednisone)", labelEn: "Steroid medicine (Prednisone)", labelEs: "Medicamento con esteroides (Prednisona)" },
  { value: "Epinephrine (EpiPen)", labelEn: "Epinephrine (EpiPen)", labelEs: "Epinefrina (EpiPen)" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/No sé" },
];

const RESOLUTION_ROUTE_OPTIONS = [
  { value: "Mouth", labelEn: "Mouth", labelEs: "Boca" },
  { value: "IV", labelEn: "IV", labelEs: "Vía intravenosa (IV)" },
  { value: "Shot", labelEn: "Shot", labelEs: "Inyección" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/No sé" },
];

// Clinical Options matching Eileen's exact protocol
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
  const slideTitleRef = useRef<HTMLHeadingElement>(null);
  const modalTitleRef = useRef<HTMLHeadingElement>(null);
  const yesButtonRef = useRef<HTMLButtonElement>(null);
  const changeButtonRef = useRef<HTMLButtonElement>(null);

  // 1. FIX: Focus the parent slide heading on mount so Apple VoiceOver speaks immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      slideTitleRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // 2. Move focus into modal when opened
  useEffect(() => {
    if (showBranchModal) {
      logInteraction("MODAL_VIEW", { modal: "screen6_4_location", slideId: "screen6_4_resolution" }, "/intervention/flow").catch(() => {});
      const timer = setTimeout(() => {
        modalTitleRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
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
        aria-hidden={showBranchModal ? true : undefined}
        className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl shadow-lg relative min-h-0 overflow-y-auto w-full max-w-4xl mx-auto flex flex-col justify-between p-4 sm:p-6"
      >
        <div className="mb-6">
          {/* Main heading with ref and tabIndex={-1} for VoiceOver capture */}
          <h2 
            ref={slideTitleRef}
            tabIndex={-1}
            id="slide10-title"
            className="text-xl sm:text-2xl md:text-3xl font-black text-[#2d221b] tracking-tight leading-snug outline-none"
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
            <NurseAnna size="md" isDecorative={true} />
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
                ? "¿Dónde recibió su hijo atención médica por la reacción alérgica?"
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

            {/* Modal Action Controls */}
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
  const { 
    isSpanish, 
    selected, 
    onSelect, 
    medicineSelected, 
    onMedicineSelect, 
    routeSelected, 
    onRouteSelect, 
    navProps 
  } = props;

  const [showBranchModal, setShowBranchModal] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1); // 1 = Medicine, 2 = Route

  // Focus management refs
  const slideTitleRef = useRef<HTMLHeadingElement>(null);
  const modalHeadingRef = useRef<HTMLHeadingElement>(null);
  const withMedButtonRef = useRef<HTMLButtonElement>(null);
  const changeButtonRef = useRef<HTMLButtonElement>(null);

  // 1. FIX: Focus the parent slide heading on mount so Apple VoiceOver speaks immediately
  // This stops VoiceOver from falling back and reading the window description!
  useEffect(() => {
    const timer = setTimeout(() => {
      slideTitleRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // 2. Focus modal heading when opened
  useEffect(() => {
    if (showBranchModal) {
      logInteraction("MODAL_VIEW", { modal: "screen6_4b_resolution", step: wizardStep, slideId: "screen6_4b_resolution_type" }, "/intervention/flow").catch(() => {});
      const timer = setTimeout(() => {
        modalHeadingRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showBranchModal, wizardStep]);

  const handleCloseModal = () => {
    setShowBranchModal(false);
    setWizardStep(1);
    if (medicineSelected && changeButtonRef.current) {
      changeButtonRef.current.focus();
    } else if (withMedButtonRef.current) {
      withMedButtonRef.current.focus();
    }
  };

  const handleMainSelect = (val: string) => {
    onSelect(val);
    if (val === "With medication" && (!medicineSelected || !routeSelected)) {
      setWizardStep(1);
      setShowBranchModal(true);
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
        aria-hidden={showBranchModal ? true : undefined}
        className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl shadow-lg relative min-h-0 overflow-y-auto w-full max-w-4xl mx-auto flex flex-col justify-between p-4 sm:p-6"
      >
        <div className="mb-6">
          {/* Main heading with ref and tabIndex={-1} for VoiceOver capture */}
          <h2 
            ref={slideTitleRef}
            tabIndex={-1}
            id="slide11-title"
            className="text-xl sm:text-2xl md:text-3xl font-black text-[#2d221b] tracking-tight leading-snug outline-none"
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
                const isSelected = selected === opt.value || 
                  (opt.value.startsWith("Unsure") && (selected === "Unsure" || selected === "Unsure/I don't know"));
                const label = isSpanish ? opt.labelEs : opt.labelEn;
                return (
                  <button
                    key={opt.value}
                    ref={opt.value === "With medication" ? withMedButtonRef : undefined}
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

            {/* Selected Medication Summary Chip */}
            {selected === "With medication" && (medicineSelected || routeSelected) && (
              <div className="mt-3.5 flex items-center justify-between bg-white/60 backdrop-blur-xs rounded-xl px-4 py-2.5 text-xs font-semibold text-[#132c27] border border-slate-200 shadow-2xs">
                <span>
                  {isSpanish ? "Medicamento: " : "Medicine: "}
                  <strong className="font-bold text-[#1f5c66]">
                    {(RESOLUTION_MEDICINE_OPTIONS.find((o) => o.value === medicineSelected)?.[isSpanish ? "labelEs" : "labelEn"]) || medicineSelected || (isSpanish ? "No especificado" : "Not specified")}
                  </strong>
                  {routeSelected && (
                    <>
                      {" • "}
                      {isSpanish ? "Vía: " : "Route: "}
                      <strong className="font-bold text-[#1f5c66]">
                        {(RESOLUTION_ROUTE_OPTIONS.find((o) => o.value === routeSelected)?.[isSpanish ? "labelEs" : "labelEn"]) || routeSelected}
                      </strong>
                    </>
                  )}
                </span>
                <button
                  ref={changeButtonRef}
                  type="button"
                  onClick={() => {
                    setWizardStep(1);
                    setShowBranchModal(true);
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
            <NurseAnna size="md" isDecorative={true} />
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
          PART 2: SINGLE ACCESSIBLE 2-STEP WIZARD MODAL
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
            
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1f5c66] bg-white px-2.5 py-1 rounded-full border border-slate-200">
                {isSpanish ? `Paso ${wizardStep} de 2` : `Step ${wizardStep} of 2`}
              </span>
            </div>

            {/* Modal Heading */}
            <h3
              ref={modalHeadingRef}
              tabIndex={-1}
              id="branch-modal-title"
              className="text-base sm:text-lg font-black text-[#2d221b] text-center mb-4 leading-snug outline-none focus:ring-2 focus:ring-[#236f7a] rounded-lg p-1"
            >
              {wizardStep === 1
                ? (isSpanish ? "¿Qué medicamento se le dio a su hijo?" : "What medicine was given to your child?")
                : (isSpanish ? "¿Cómo recibió su hijo el medicamento?" : "Did your child receive the medicine by:")}
            </h3>

            {/* WIZARD STEP 1: MEDICINE TYPE */}
            {wizardStep === 1 && (
              <div 
                role="radiogroup" 
                aria-labelledby="branch-modal-title"
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5"
              >
                {RESOLUTION_MEDICINE_OPTIONS.map((medOpt) => {
                  const isMedSelected = medicineSelected === medOpt.value;
                  const label = isSpanish ? medOpt.labelEs : medOpt.labelEn;
                  return (
                    <button
                      type="button"
                      key={medOpt.value}
                      role="radio"
                      aria-checked={isMedSelected}
                      onClick={() => {
                        if (onMedicineSelect) {
                          onMedicineSelect(medOpt.value);
                        }
                      }}
                      className={`px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs border cursor-pointer flex items-center justify-center text-center gap-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
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
            )}

            {/* WIZARD STEP 2: ROUTE */}
            {wizardStep === 2 && (
              <div 
                role="radiogroup" 
                aria-labelledby="branch-modal-title"
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5"
              >
                {RESOLUTION_ROUTE_OPTIONS.map((rtOpt) => {
                  const isRtSelected = routeSelected === rtOpt.value;
                  const label = isSpanish ? rtOpt.labelEs : rtOpt.labelEn;
                  return (
                    <button
                      type="button"
                      key={rtOpt.value}
                      role="radio"
                      aria-checked={isRtSelected}
                      onClick={() => {
                        if (onRouteSelect) {
                          onRouteSelect(rtOpt.value);
                        }
                      }}
                      className={`px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs border cursor-pointer flex items-center justify-center text-center gap-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                        isRtSelected
                          ? "bg-[#1f5c66] text-white border-[#1f5c66] shadow-md ring-2 ring-[#1f5c66]/40"
                          : "bg-white text-[#132c27] border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {isRtSelected && <span aria-hidden="true" className="text-amber-300 font-black">✓</span>}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Modal Action Controls */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-300/60">
              {wizardStep === 2 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2.5 min-h-[44px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-full transition cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
                >
                  <span>&larr;</span>
                  <span>{isSpanish ? "Atrás" : "Back"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCloseModal}
                  aria-label={isSpanish ? "Cerrar ventana" : "Close window"}
                  className="px-4 py-2.5 min-h-[44px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-full transition cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
                >
                  <span aria-hidden="true">✕</span>
                  <span>{isSpanish ? "Cerrar" : "Close"}</span>
                </button>
              )}

              {wizardStep === 1 ? (
                <button
                  type="button"
                  disabled={!medicineSelected}
                  onClick={() => setWizardStep(2)}
                  className={`px-6 py-2.5 min-h-[44px] font-bold text-xs sm:text-sm rounded-full transition shadow-xs flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                    medicineSelected
                      ? "bg-[#1f5c66] text-white hover:bg-[#16484e] cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span>{isSpanish ? "Siguiente" : "Next"}</span>
                  <span>&rarr;</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!routeSelected}
                  onClick={handleCloseModal}
                  className={`px-8 py-2.5 min-h-[44px] font-bold text-xs sm:text-sm rounded-full transition shadow-xs flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                    routeSelected
                      ? "bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#e0c406] cursor-pointer active:scale-95"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent"
                  }`}
                >
                  {isSpanish ? "Aceptar" : "Confirm"}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export function Slide12RepeatUseScreen(props: any) {
  const { 
    isSpanish, 
    selected, 
    onSelect, 
    reactionDetailSelected, 
    onReactionDetailSelect, 
    navProps 
  } = props;

  const [showYetAgainModal, setShowYetAgainModal] = useState(false);

  // Focus management refs
  const slideTitleRef = useRef<HTMLHeadingElement>(null);
  const modalTitleRef = useRef<HTMLHeadingElement>(null);
  const yesButtonRef = useRef<HTMLButtonElement>(null);
  const changeButtonRef = useRef<HTMLButtonElement>(null);

  // 1. FIX: Focus the parent slide heading on mount so VoiceOver speaks immediately
  // This eliminates the "window description" announcement!
  useEffect(() => {
    const timer = setTimeout(() => {
      slideTitleRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // 2. Focus modal heading when opened
  useEffect(() => {
    if (showYetAgainModal) {
      logInteraction("MODAL_VIEW", { modal: "screen6_5_reaction_detail", slideId: "screen6_5_yetagain" }, "/intervention/flow").catch(() => {});
      const timer = setTimeout(() => {
        modalTitleRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
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
          PART 1: PARENT SLIDE
          ========================================================================= */}
      <div 
        id="slide-content"
        aria-hidden={showYetAgainModal ? true : undefined}
        className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl shadow-lg relative min-h-0 overflow-y-auto w-full max-w-4xl mx-auto flex flex-col justify-between p-4 sm:p-6"
      >
        <div className="mb-6">
          {/* Main heading with ref and tabIndex={-1} for VoiceOver capture */}
          <h2 
            ref={slideTitleRef}
            tabIndex={-1}
            id="slide12-title"
            className="text-xl sm:text-2xl md:text-3xl font-black text-[#2d221b] tracking-tight leading-snug outline-none"
          >
            {isSpanish
              ? "¿Su hijo ha vuelto a tomar penicilina (amoxicilina) desde la reacción?"
              : "Has your child taken penicillin (amoxicillin) again since the reaction?"}
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
                const isSelected = selected === opt.value || 
                  (opt.value.startsWith("Unsure") && (selected === "Unsure" || selected === "Unsure/I don't know"));
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

            {/* Selected Detail Summary Chip */}
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
                  aria-label={isSpanish ? "Cambiar detalle de reacción previa" : "Change repeat exposure detail"}
                  className="text-[#1f5c66] hover:underline font-bold ml-3 min-h-[44px] inline-flex items-center cursor-pointer"
                >
                  {isSpanish ? "Cambiar" : "Change"}
                </button>
              </div>
            )}
          </div>

          <div className="shrink-0 self-center">
            <NurseAnna size="md" isDecorative={true} />
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
          PART 2: BRANCH MODAL
          ========================================================================= */}
      {showYetAgainModal && (
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
            
            {/* Modal Heading */}
            <h3
              ref={modalTitleRef}
              tabIndex={-1}
              id="branch-modal-title"
              className="text-base sm:text-lg font-black text-[#2d221b] text-center mb-4 leading-snug outline-none focus:ring-2 focus:ring-[#236f7a] rounded-lg p-1"
            >
              {isSpanish
                ? "Cuando su hijo volvió a tomar penicilina, ¿qué ocurrió?"
                : "When your child took penicillin again, what happened?"}
            </h3>

            {/* Modal Radiogroup */}
            <div 
              role="radiogroup" 
              aria-labelledby="branch-modal-title"
              className="flex flex-col gap-2.5 mb-5"
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
                    className={`w-full px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs border cursor-pointer flex items-center justify-between text-left gap-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                      isOptSelected
                        ? "bg-[#1f5c66] text-white border-[#1f5c66] shadow-md ring-2 ring-[#1f5c66]/40"
                        : "bg-white text-[#132c27] border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{label}</span>
                    {isOptSelected && <span aria-hidden="true" className="text-amber-300 font-black">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Modal Action Controls */}
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
                {isSpanish ? "Aceptar" : "Confirm"}
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
    <div id="slide-content" className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg relative min-h-0 overflow-y-auto">
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

        {/* Nurse Anna Illustration (Decorative) */}
        <NurseAnna size="md" isDecorative={true} />
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
                ? "¿Dónde recibió su hijo atención médica por la reacción alérgica?"
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
                ? "¿Qué medicamento le dieron a su hijo para tratar la reacción alérgica?"
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
                      ? "¿Su hijo recibió el medicamento por vía:"
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
                ? "¿Su hijo ha vuelto a tomar penicilina (amoxicilina) desde que tuvo la reacción?"
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

function TextScreen({ title, description, content, ...navProps }: BaseScreenProps) {
  const isSpanish = navProps.locale === "es";
  return (
    <div id="slide-content" className="bg-[#f4f8e8] border border-slate-200/60 rounded-3xl p-4 sm:p-8 md:p-10 shadow-lg relative min-h-0 overflow-y-auto">
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

        {/* Nurse Anna Illustration (Decorative) */}
        <NurseAnna size="md" isDecorative={true} />
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

export function Slide13SummaryScreen(props: any) {
  return <Slide18SummaryScreen {...props} />;
}

export const SummaryScreen = Slide13SummaryScreen;
export { SuccessScreen } from "./SuccessScreen";
export type { SuccessScreenProps } from "./SuccessScreen";