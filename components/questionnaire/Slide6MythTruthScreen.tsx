"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import SlideNavigationButtons from "./SlideNavigationButtons";
import { resolveMedicineToken } from "@/lib/token-engine";

export interface Slide6MythTruthScreenProps {
  isSpanish?: boolean;
  medicationName?: string;
  variant?: "auto" | "desktop" | "mobile";
  revealedCards?: number[];
  onRevealedChange?: (revealed: number[]) => void;
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
}

/** Fixed design stage, scaled to fit the tablet frame (same convention as the other slides). */
const STAGE_W = 750;
const STAGE_H = 530;

interface MythTruthItem {
  id: number;
  mythEn: string;
  mythEs: string;
  truthEn: string;
  truthEs: string;
}

const MYTHS: MythTruthItem[] = [
  {
    id: 1,
    mythEn:
      "Myth 1 - If a child gets a rash when taking [name], it means they are allergic to [name].",
    mythEs:
      "Mito 1 - Si un niño tiene sarpullido al tomar [name], significa que es alérgico a [name].",
    truthEn:
      "Truth - A rash does not always mean an allergy. Rashes are common in kids, especially when they are sick. The underlying illness may have caused the rash.",
    truthEs:
      "Verdad - Un sarpullido no siempre significa alergia. Los sarpullidos son comunes en los niños, especialmente cuando están enfermos. La enfermedad subyacente puede haber causado el sarpullido.",
  },
  {
    id: 2,
    mythEn:
      "Myth 2 - If a child gets a belly ache or has diarrhea while taking [name], it means they are allergic to [name].",
    mythEs:
      "Mito 2 - Si un niño tiene dolor de estómago o diarrea mientras toma [name], significa que es alérgico a [name].",
    truthEn: "Truth - Belly aches and diarrhea are common side effects of antibiotics.",
    truthEs: "Verdad - Los dolores de estómago y la diarrea son efectos secundarios comunes de los antibióticos.",
  },
  {
    id: 3,
    mythEn: "Myth 3 - If a parent is allergic to penicillin, their child will be too.",
    mythEs: "Mito 3 - Si uno de los padres es alérgico a la penicilina, su hijo también lo será.",
    truthEn: "Truth - A penicillin allergy is not passed down from a parent to child.",
    truthEs: "Verdad - La alergia a la penicilina no se transmite de padres a hijos.",
  },
  {
    id: 4,
    mythEn: "Myth 4 - If a child has a [name] allergy, they will always have it.",
    mythEs: "Mito 4 - Si un niño tiene alergia a [name], siempre la tendrá.",
    truthEn: "Truth - A child may outgrow their allergy to [name].",
    truthEs: "Verdad - Un niño puede superar su alergia a [name].",
  },
];

const TITLE_EN =
  "Why are so many kids thought to have a penicillin allergy when they don't? Click each box to reveal the truth!";
const TITLE_ES =
  "¿Por qué se piensa que tantos niños tienen alergia a la penicilina cuando no es así? ¡Haga clic en cada cuadro para revelar la verdad!";

/** The "Myth 1 -" / "Truth -" prefixes are already shown by the status tag. */
const stripPrefix = (text: string) =>
  text
    .replace(/^(myth|mito)\s*\d+\s*[-–—:]\s*/i, "")
    .replace(/^(truth|verdad)\s*[-–—:]\s*/i, "");

/**
 * Stacked phone layout. Declared once and reused for both the media query and
 * the explicit `variant="mobile"` mode instead of duplicating the rules.
 */
const mobileLayout = (scope: string) => `
  ${scope} {
    height: auto;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    flex-direction: column;
    justify-content: flex-start;
    padding: 0.85rem 0.75rem 1rem;
  }
  ${scope} .s6-stage {
    width: 100%;
    max-width: 380px;
    height: auto;
    padding: 16px 14px 12px;
    transform: none !important;
  }
  ${scope} .s6-heading {
    font-size: 15px;
    margin-bottom: 10px;
  }
  ${scope} .s6-cards {
    gap: 8px;
  }
  ${scope} .s6-card {
    min-height: 48px;
    padding: 10px 12px;
    gap: 10px;
    border-radius: 12px;
  }
  ${scope} .s6-card-tag {
    font-size: 10px;
    padding: 3px 7px;
  }
  ${scope} .s6-card-text {
    font-size: 12.5px;
    line-height: 1.35;
  }
  ${scope} .s6-audio {
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }
  ${scope} .s6-audio .audio-cc-btn svg {
    width: 32px;
    height: 28px;
  }
  ${scope} .s6-audio .audio-play-btn svg {
    width: 42px;
    height: 28px;
  }
`;

const SLIDE6_CSS = `
.s6-root,
.s6-root *,
.s6-root *::before,
.s6-root *::after {
  box-sizing: border-box;
}

.s6-root {
  position: relative;
  display: flex;
  flex: 1 1 0%;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: #232323;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
}

.s6-sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Bottom padding keeps the slide content clear of the shared navigation row. */
.s6-stage {
  position: relative;
  display: flex;
  flex: none;
  flex-direction: column;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  padding: 30px 36px 60px;
  transform-origin: center center;
  background-color: #fafdf3;
  overflow: hidden;
}

/* 1. Question heading (AAA contrast: #232323 on #fafdf3 ≈ 15.8:1) */
.s6-heading {
  flex: none;
  margin: 0 0 16px;
  padding: 0;
  color: #232323;
  font-size: 21px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.015em;
  outline: none;
}

.s6-heading:focus-visible {
  outline: 2px dashed #143833;
  outline-offset: 4px;
  border-radius: 4px;
}

/* 2. Myth / truth cards */
.s6-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  overflow-y: auto;
}

.s6-card {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 54px;
  padding: 13px 18px;
  border: 1.5px solid #d9a97f;
  border-radius: 14px;
  background-color: #f1c9a9;
  color: #232323;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  outline: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: background-color 0.18s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.18s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.12s ease;
}

.s6-card:hover {
  background-color: #f6d3b8;
  border-color: #c89163;
  transform: translateY(-1px);
}

.s6-card:active {
  transform: translateY(0);
}

.s6-card:focus-visible {
  outline: 3px solid #143833;
  outline-offset: 2px;
}

/* Revealed truth (AAA contrast: #232323 on #bce3dc ≈ 12.6:1) */
.s6-card--revealed {
  background-color: #bce3dc;
  border-color: #8ab8b0;
}

.s6-card--revealed:hover {
  background-color: #c9ebe5;
  border-color: #79a9a0;
}

.s6-card-tag {
  flex-shrink: 0;
  padding: 4px 9px;
  border-radius: 9999px;
  background-color: #7a4526;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.s6-card-tag--truth {
  background-color: #144e57;
}

.s6-card-text {
  flex: 1 1 auto;
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.38;
  letter-spacing: -0.01em;
  overflow-wrap: anywhere;
}

.s6-card-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #143833;
  opacity: 0.75;
}

/* 3. Audio controls — desktop uses the shared player in the tablet frame */
.s6-audio {
  display: none;
}

@media (max-width: 767px) {
${mobileLayout(".s6-root")}
}

${mobileLayout(".s6-root.is-mobile")}

@media (prefers-reduced-motion: reduce) {
  .s6-root *,
  .s6-root *::before,
  .s6-root *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
`;

export function Slide6MythTruthScreen({
  isSpanish = false,
  medicationName,
  variant = "auto",
  revealedCards,
  onRevealedChange,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide6_myths",
  locale,
  transcriptText,
}: Slide6MythTruthScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [scale, setScale] = useState(1);
  const [ownRevealed, setOwnRevealed] = useState<number[]>([]);
  const [announcement, setAnnouncement] = useState("");

  const isEs = (locale ?? "").startsWith("es") || isSpanish;
  const activeLocale = isEs ? "es" : "en";
  const medName = medicationName?.trim();

  // Controlled by the parent when `revealedCards` is supplied; self-managed otherwise.
  const revealed = revealedCards ?? ownRevealed;

  const text = useCallback(
    (value: string) => stripPrefix(resolveMedicineToken(value, medName, isEs)),
    [medName, isEs]
  );

  // WCAG 2.4.3 — move reading order to the new heading.
  useEffect(() => {
    const frame = requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Fit the fixed stage into the available frame without distorting it.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const update = () => {
      if (variant === "mobile" || window.innerWidth < 768) {
        setScale(1);
        return;
      }
      const { clientWidth: w, clientHeight: h } = el;
      if (!w || !h) return;
      setScale(Math.min((w - 24) / STAGE_W, (h - 24) / STAGE_H, 1));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [variant]);

  const toggleCard = useCallback(
    (item: MythTruthItem) => {
      const isOpen = revealed.includes(item.id);
      const updated = isOpen
        ? revealed.filter((id) => id !== item.id)
        : [...revealed, item.id];

      if (!revealedCards) setOwnRevealed(updated);
      onRevealedChange?.(updated);

      if (isOpen) {
        setAnnouncement(
          isEs ? `Mito ${item.id} restaurado.` : `Myth ${item.id} restored.`
        );
        return;
      }

      const truth = text(isEs ? item.truthEs : item.truthEn);
      const allRevealed = MYTHS.every((myth) => updated.includes(myth.id));
      const suffix = allRevealed
        ? isEs
          ? " Todos los mitos han sido revelados. Ya puede continuar."
          : " All myths are revealed. You can continue."
        : isEs
          ? ` Quedan ${MYTHS.length - updated.length} mitos por revelar.`
          : ` ${MYTHS.length - updated.length} myths left to reveal.`;

      setAnnouncement(
        `${isEs ? `Verdad revelada para el mito ${item.id}` : `Truth revealed for myth ${item.id}`}: ${truth}.${suffix}`
      );
    },
    [revealed, revealedCards, onRevealedChange, isEs, text]
  );

  const title = isEs ? TITLE_ES : TITLE_EN;
  const allRevealed = MYTHS.every((item) => revealed.includes(item.id));

  const plainTranscript =
    transcriptText ||
    `${title} ${MYTHS.map((item) =>
      `${text(isEs ? item.mythEs : item.mythEn)} ${text(isEs ? item.truthEs : item.truthEn)}`
    ).join(" ")}`;

  const effectiveAudioSrc =
    audioSrc ||
    (isEs
      ? "/audio/exported/screen3_5_knowledge_test_es.mp3"
      : "/audio/exported/screen3_5_knowledge_test_en.mp3");

  const variantClass =
    variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

  return (
    <div
      id="slide-content"
      ref={rootRef}
      className={`s6-root${variantClass}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="s6-heading"
      lang={activeLocale}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE6_CSS }} />

      <div className="s6-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <div className="s6-stage" style={{ transform: `scale(${scale})` }}>
        <h1 id="s6-heading" ref={headingRef} tabIndex={-1} className="s6-heading">
          {title}
        </h1>

        <div
          className="s6-cards"
          role="group"
          aria-label={isEs ? "Mitos para revelar" : "Myths to reveal"}
        >
          {MYTHS.map((item) => {
            const isOpen = revealed.includes(item.id);
            const statement = text(isEs ? (isOpen ? item.truthEs : item.mythEs) : isOpen ? item.truthEn : item.mythEn);
            const typeLabel = isEs ? (isOpen ? "Verdad" : `Mito ${item.id}`) : isOpen ? "Truth" : `Myth ${item.id}`;

            return (
              <button
                key={item.id}
                type="button"
                className={`s6-card${isOpen ? " s6-card--revealed" : ""}`}
                aria-expanded={isOpen}
                aria-label={`${typeLabel}. ${statement} ${
                  isOpen
                    ? isEs
                      ? "Haga clic para volver a mostrar el mito."
                      : "Click to show the myth again."
                    : isEs
                      ? "Haga clic para revelar la verdad."
                      : "Click to reveal the truth."
                }`}
                onClick={() => toggleCard(item)}
              >
                <span
                  className={`s6-card-tag${isOpen ? " s6-card-tag--truth" : ""}`}
                  aria-hidden="true"
                >
                  {typeLabel}
                </span>

                <span className="s6-card-text">{statement}</span>

                <span className="s6-card-icon" aria-hidden="true">
                  {isOpen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="3" />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="s6-audio">
          <AudioPlayer
            audioSrc={effectiveAudioSrc}
            stepId={stepId}
            locale={activeLocale}
            transcriptText={plainTranscript}
            size="large"
          />
        </div>
      </div>

      <p className="s6-sr-only">
        {allRevealed
          ? isEs
            ? "Todos los mitos han sido revelados."
            : "All myths are revealed."
          : isEs
            ? "El botón Siguiente se activa cuando se revelan los cuatro mitos."
            : "The Next button is enabled once all four myths are revealed."}
      </p>

      <SlideNavigationButtons
        onBack={onBack}
        onNext={onNext}
        isSpanish={isEs}
        loading={loading}
        nextDisabled={!allRevealed}
      />
    </div>
  );
}

export default Slide6MythTruthScreen;
