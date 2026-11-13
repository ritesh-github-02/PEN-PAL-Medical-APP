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

/** Fixed design stage, scaled to fit the frame (same convention as Slides 3, 4 & 5). */
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
 * Stacked mobile layout matching Slides 3, 4 & 5:
 * - Same locked canvas height preventing outer page scroll
 * - Heading + 4 myth cards vertically center-aligned inside stage
 * - Two-tier bottom bar (Play/CC on top, Back/Next below without clipping)
 */
const mobileLayout = (scope: string) => `
  #slide-content${scope},
  ${scope} {
    overflow: hidden !important;
    height: 100% !important;
    min-height: clamp(580px, calc(100dvh - 150px), 720px) !important;
    max-height: 100% !important;
    flex: 1 1 0% !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 12px 16px 16px 16px !important;
    gap: 6px !important;
    box-sizing: border-box !important;
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  #slide-content${scope} .s6-stage,
  ${scope} .s6-stage {
    position: relative !important;
    width: 100% !important;
    max-width: 410px !important;
    height: auto !important;
    min-height: 0 !important;
    flex: 1 1 0% !important;
    padding: 4px 0 !important;
    margin: 0 auto !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
    transform: none !important;
    gap: clamp(8px, 1.4dvh, 14px) !important;
    box-sizing: border-box !important;
    overflow: visible !important;
  }
  ${scope} .s6-heading {
    width: 100% !important;
    font-size: clamp(14.5px, 2dvh, 17px) !important;
    line-height: 1.32 !important;
    margin: 0 auto 2px auto !important;
    text-align: center !important;
    text-wrap: balance !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s6-cards {
    gap: clamp(6px, 1.1dvh, 10px) !important;
    flex: 0 1 auto !important;
    min-height: 0 !important;
    max-height: 100% !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    width: 100% !important;
    padding: 2px 0 !important;
  }
  ${scope} .s6-card {
    min-height: clamp(44px, 6.2dvh, 52px) !important;
    padding: clamp(6px, 1dvh, 10px) 12px !important;
    gap: 8px !important;
    border-radius: 10px !important;
  }
  ${scope} .s6-card:hover {
    transform: none !important;
  }
  ${scope} .s6-card:active {
    transform: translateY(0) !important;
  }
  ${scope} .s6-card-tag {
    font-size: clamp(11px, 0.4vh + 8.5px, 12px) !important;
    padding: 3px 8px !important;
  }
${scope} .s6-card-text {
    font-size: clamp(15px, 1.65dvh, 16px) !important;
    line-height: 1.3 !important;
    overflow-wrap: break-word !important;
  }
  /* Two-tier bottom bar matching Slides 3, 4 & 5 */
  ${scope} .s6-bottom-bar-mobile {
    width: 100% !important;
    max-width: 360px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 12px !important;
    padding-top: 4px !important;
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px)) !important;
    margin: 0 auto !important;
    flex-shrink: 0 !important;
    z-index: 25 !important;
  }
  ${scope} .s6-audio {
    order: 1 !important;
    position: static !important;
    right: auto !important;
    bottom: auto !important;
    top: auto !important;
    left: auto !important;
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin: 0 auto !important;
    z-index: 25 !important;
    flex-shrink: 0 !important;
    color: #144e57 !important;
  }
  ${scope} .s6-audio button {
    background: transparent !important;
    border: none !important;
    cursor: pointer !important;
    color: #144e57 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 4px !important;
    min-width: 44px !important;
    min-height: 44px !important;
    border-radius: 8px !important;
    transition: transform 0.12s ease, opacity 0.15s ease !important;
  }
  ${scope} .s6-audio button:hover {
    transform: scale(1.08) !important;
    opacity: 0.85 !important;
  }
  ${scope} .s6-audio button svg {
    height: 34px !important;
    width: auto !important;
    transition: transform 0.12s ease !important;
  }
  ${scope} .s6-audio button:hover svg,
  ${scope} .s6-audio button:active svg {
    transform: scale(0.96) !important;
  }
  ${scope} .slide-nav,
  ${scope} .slide-nav-container {
    order: 2 !important;
    margin: 0 auto !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    width: 100% !important;
    gap: 16px !important;
    padding-bottom: 2px !important;
  }
  ${scope} .slide-nav-btn {
    min-width: 128px !important;
    min-height: 48px !important;
    height: 48px !important;
    padding: 0 32px !important;
    white-space: nowrap !important;
    flex: 0 1 auto !important;
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
  background-color: #fafdf3;
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

/* Universal Focus Indicator (WCAG 2.4.7) */
.s6-root button:focus-visible,
.s6-root [tabindex="0"]:focus-visible {
  outline: 3px solid #143833 !important;
  outline-offset: 3px !important;
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
  overflow: hidden;
  background-color: transparent;
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
  font-size: 17px;
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

/* Desktop Bottom Controls */
.s6-bottom-bar-mobile {
  display: none;
}

.s6-audio-desktop {
  position: absolute;
  right: 22px;
  bottom: clamp(16px, 3vh, 22px);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 30;
  color: #144e57;
}

.s6-audio-desktop button {
  background: transparent !important;
  border: none !important;
  cursor: pointer !important;
  color: #144e57 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 4px !important;
  min-width: 44px !important;
  min-height: 44px !important;
  border-radius: 8px !important;
  transition: transform 0.12s ease, opacity 0.15s ease !important;
}

.s6-audio-desktop button svg {
  height: 34px !important;
  width: auto !important;
}

.s6-nav-desktop {
  position: absolute;
  bottom: clamp(16px, 3vh, 22px);
  left: 0;
  right: 0;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 25;
  pointer-events: auto;
}

@media (max-width: 767px) {
  ${mobileLayout(".s6-root:not(.is-desktop)")}
  .s6-audio-desktop {
    display: none !important;
  }
  .s6-nav-desktop {
    display: none !important;
  }
  .s6-bottom-bar-mobile {
    display: flex !important;
  }
}

${mobileLayout(".s6-root.is-mobile")}
.s6-root.is-mobile .s6-audio-desktop {
  display: none !important;
}
.s6-root.is-mobile .s6-nav-desktop {
  display: none !important;
}
.s6-root.is-mobile .s6-bottom-bar-mobile {
  display: flex !important;
}

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
    (value: string) =>
      stripPrefix(
        resolveMedicineToken(
          value,
          medName || (isEs ? "la amoxicilina" : "amoxicillin"),
          isEs
        )
      ),
    [medName, isEs]
  );

  // WCAG 2.4.3 — move reading order to the new heading.
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      headingRef.current?.focus({ preventScroll: true })
    );
    return () => cancelAnimationFrame(frame);
  }, []);

  // Fit the fixed stage into the available frame without distorting it.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const update = () => {
      if (
        variant === "mobile" ||
        (variant !== "desktop" && window.innerWidth < 768)
      ) {
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
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
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
    `${title} ${MYTHS.map(
      (item) =>
        `${text(isEs ? item.mythEs : item.mythEn)} ${text(isEs ? item.truthEs : item.truthEn)}`
    ).join(" ")}`;

  const effectiveAudioSrc =
    audioSrc ||
    (isEs
      ? "/audio/exported/screen3_5_knowledge_test_es.mp3"
      : "/audio/exported/screen3_5_knowledge_test_en.mp3");

  const variantClass =
    variant === "mobile"
      ? " is-mobile"
      : variant === "desktop"
        ? " is-desktop"
        : "";

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
            const statement = text(
              isEs
                ? isOpen
                  ? item.truthEs
                  : item.mythEs
                : isOpen
                  ? item.truthEn
                  : item.mythEn
            );
            const typeLabel = isEs
              ? isOpen
                ? "Verdad"
                : `Mito ${item.id}`
              : isOpen
                ? "Truth"
                : `Myth ${item.id}`;

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
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      focusable="false"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      focusable="false"
                    >
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
      </div>

      {/* Desktop Audio narration & CC controls */}
      <div className="s6-audio-desktop">
        <AudioPlayer
          audioSrc={effectiveAudioSrc}
          stepId={stepId}
          locale={activeLocale}
          transcriptText={plainTranscript}
          size="large"
        />
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

      {/* Desktop Centered Navigation */}
      <div className="s6-nav-desktop">
        <SlideNavigationButtons
          onBack={onBack}
          onNext={onNext}
          isSpanish={isEs}
          loading={loading}
          nextDisabled={!allRevealed}
        />
      </div>

      {/* Mobile Centered Stacked Bottom Bar (Audio/CC on top, Back/Next below) */}
      <div className="s6-bottom-bar-mobile">
        <div className="s6-audio">
          <AudioPlayer
            audioSrc={effectiveAudioSrc}
            stepId={stepId}
            locale={activeLocale}
            transcriptText={plainTranscript}
            size="large"
          />
        </div>

        <SlideNavigationButtons
          onBack={onBack}
          onNext={onNext}
          isSpanish={isEs}
          loading={loading}
          nextDisabled={!allRevealed}
        />
      </div>
    </div>
  );
}

export default Slide6MythTruthScreen;