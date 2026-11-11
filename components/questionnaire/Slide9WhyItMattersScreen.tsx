"use client";

import { useEffect, useRef, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import SlideNavigationButtons from "./SlideNavigationButtons";
import { resolveMedicineToken } from "@/lib/token-engine";

export interface Slide9WhyItMattersScreenProps {
  isSpanish?: boolean;
  medicationName?: string;
  variant?: "auto" | "desktop" | "mobile";
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

const COPY = {
  title: {
    en: "Why does this matter?",
    es: "¿Por qué es importante esto?",
  },
  intro: {
    en: "When a child needs antibiotics and is believed to have an allergy to [name], they receive different antibiotics that...",
    es: "Cuando un niño necesita antibióticos y se cree que tiene alergia a [name], recibe diferentes antibióticos que...",
  },
  bullets: [
    {
      en: "Are more likely to cause diarrhea or other side effects",
      es: "Tienen más probabilidades de causar diarrea u otros efectos secundarios",
    },
    {
      en: "Cost more than [name]",
      es: "Cuestan más que [name]",
    },
    {
      en: "Taste worse than [name]",
      es: "Tienen peor sabor que [name]",
    },
    {
      en: "May make an infection harder to treat in the future",
      es: "Pueden hacer que una infección sea más difícil de tratar en el futuro",
    },
  ],
} as const;

/**
 * Stacked phone layout. Declared once and reused for both the media query and
 * the explicit `variant="mobile"` mode instead of duplicating the rules.
 */
const mobileLayout = (scope: string) => `
  ${scope} {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    height: 100% !important;
    max-height: 100% !important;
    min-height: 100% !important;
    flex: 1 1 auto !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 14px 16px 12px 16px !important;
    gap: 10px !important;
    box-sizing: border-box !important;
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  ${scope} .s9-stage {
    width: 100% !important;
    max-width: 380px !important;
    height: auto !important;
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    padding: 0 !important;
    margin: 0 auto !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    transform: none !important;
    gap: clamp(14px, 2.2vh, 22px) !important;
  }
  ${scope} .s9-badge {
    margin: 4px auto 0 auto !important;
    padding: 10px 22px !important;
    border-radius: 16px !important;
    display: inline-flex !important;
    align-self: center !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s9-heading {
    font-size: clamp(16px, 2.35vh, 18.5px) !important;
    line-height: 1.2 !important;
    text-align: center !important;
    margin: 0 !important;
  }
  ${scope} .s9-heading:focus:not(:focus-visible) {
    outline: none !important;
  }
  ${scope} .s9-main {
    flex-direction: column !important;
    align-items: center !important;
    flex: 0 1 auto !important;
    min-height: 0 !important;
    width: 100% !important;
    justify-content: center !important;
    gap: clamp(12px, 2vh, 18px) !important;
    margin-top: 0 !important;
  }
  ${scope} .s9-nurse {
    order: 2 !important;
    width: auto !important;
    height: clamp(100px, 16vh, 145px) !important;
    max-height: 145px !important;
    margin: 2px auto 0 auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s9-nurse-img {
    height: 100% !important;
    max-height: 100% !important;
    width: auto !important;
    object-fit: contain !important;
    filter: drop-shadow(0 4px 10px rgba(20, 50, 45, 0.12)) !important;
  }
  @media (max-height: 580px) {
    ${scope} .s9-nurse {
      height: 82px !important;
      max-height: 82px !important;
    }
  }
  ${scope} .s9-content {
    order: 1 !important;
    width: 100% !important;
    max-width: 350px !important;
    padding: 0 4px !important;
    gap: clamp(8px, 1.4vh, 12px) !important;
  }
  ${scope} .s9-intro {
    font-size: clamp(13.5px, 1.95vh, 15px) !important;
    line-height: 1.38 !important;
    font-weight: 700 !important;
    color: #142724 !important;
    margin: 0 !important;
  }
  ${scope} .s9-bullets {
    gap: clamp(6px, 1.1vh, 9px) !important;
    margin: 0 !important;
  }
  ${scope} .s9-bullet {
    gap: 9px !important;
    font-size: clamp(12.5px, 1.75vh, 14px) !important;
    line-height: 1.35 !important;
    color: #1f2e2b !important;
  }
  ${scope} .s9-bullet-dot {
    width: 6px !important;
    height: 6px !important;
    margin-top: 7px !important;
  }
  ${scope} .s9-bottom-bar {
    width: 100% !important;
    max-width: 360px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: clamp(10px, 1.8vh, 16px) !important;
    padding-top: 6px !important;
    padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px)) !important;
    margin: 0 auto !important;
    flex-shrink: 0 !important;
    z-index: 25 !important;
  }
  ${scope} .s9-audio {
    order: 1 !important;
    position: static !important;
    right: auto !important;
    bottom: auto !important;
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    margin: 0 auto !important;
    color: #144e57 !important;
    z-index: 25 !important;
  }
  ${scope} .s9-audio > div {
    gap: 8px !important;
  }
  ${scope} .s9-audio .audio-cc-btn,
  ${scope} .s9-audio .audio-play-btn {
    color: #144e57 !important;
    min-width: 44px !important;
    min-height: 44px !important;
    padding: 4px !important;
  }
  ${scope} .s9-audio .audio-cc-btn svg,
  ${scope} .s9-audio .audio-play-btn svg {
    height: 34px !important;
    width: auto !important;
  }
  ${scope} .slide-nav {
    order: 2 !important;
    position: relative !important;
    bottom: auto !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    margin: 0 auto !important;
    gap: 16px !important;
  }
  ${scope} .slide-nav-btn {
    min-width: 128px !important;
    padding: 0 32px !important;
  }
`;

const SLIDE9_CSS = `
.s9-root,
.s9-root *,
.s9-root *::before,
.s9-root *::after {
  box-sizing: border-box;
}

.s9-root {
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

/* Bottom padding keeps the slide content clear of the shared navigation row. */
.s9-stage {
  position: relative;
  display: flex;
  flex: none;
  flex-direction: column;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  padding: 24px 40px 60px;
  transform-origin: center center;
  overflow: hidden;
}

/* 1. Yellow title badge (AAA contrast: #232323 on #fdee8e ≈ 12.4:1) */
.s9-badge {
  display: inline-flex;
  flex: none;
  align-self: flex-start;
  padding: 10px 24px;
  border: 2px solid #508e82;
  border-radius: 16px;
  background-color: #fdee8e;
  box-shadow: 0 4px 0 #3a6d65;
}

.s9-heading {
  margin: 0;
  padding: 0;
  color: #232323;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
  outline: none;
}

.s9-heading:focus-visible {
  outline: 2px dashed #143833;
  outline-offset: 4px;
  border-radius: 4px;
}

/* 2. Nurse + explanation ("this...", so the list completes the sentence) */
.s9-main {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 24px;
  min-height: 0;
  margin-top: 18px;
}

.s9-nurse {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 175px;
  height: 330px;
  pointer-events: none;
  user-select: none;
}

.s9-nurse-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom center;
  user-select: none;
  -webkit-user-drag: none;
  filter: drop-shadow(0 4px 12px rgba(20, 50, 45, 0.12));
}

.s9-content {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.s9-intro {
  margin: 0;
  color: #232323;
  font-size: 18.5px;
  font-weight: 600;
  line-height: 1.36;
  letter-spacing: -0.01em;
}

.s9-bullets {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.s9-bullet {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #232323;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.34;
  letter-spacing: -0.01em;
}

.s9-bullet-dot {
  flex: none;
  width: 6px;
  height: 6px;
  margin-top: 9px;
  border-radius: 50%;
  background-color: #236f7a;
}

/* Wrapper collapses on desktop so audio + nav keep independent absolute positioning */
.s9-bottom-bar {
  display: contents;
}

/* 3. Audio controls — bottom-right on desktop, centered above nav on mobile */
.s9-audio {
  position: absolute;
  right: 22px;
  bottom: clamp(16px, 3vh, 22px);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 30;
}

@media (max-width: 767px) {
${mobileLayout(".s9-root:not(.is-desktop)")}
  .s9-root:not(.is-desktop) {
    min-height: min(640px, calc(100dvh - 80px)) !important;
    max-height: calc(100dvh - 72px) !important;
  }
}

${mobileLayout(".s9-root.is-mobile")}

@media (prefers-reduced-motion: reduce) {
  .s9-root *,
  .s9-root *::before,
  .s9-root *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
`;

export function Slide9WhyItMattersScreen({
  isSpanish = false,
  medicationName,
  variant = "auto",
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide9_why_it_matters",
  locale,
  transcriptText,
}: Slide9WhyItMattersScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [scale, setScale] = useState(1);

  const isEs = (locale ?? "").startsWith("es") || isSpanish;
  const activeLocale = isEs ? "es" : "en";
  const medName = medicationName?.trim();

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

  const resolve = (value: string) => resolveMedicineToken(value, medName, isEs);

  const title = isEs ? COPY.title.es : COPY.title.en;
  const intro = resolve(isEs ? COPY.intro.es : COPY.intro.en);
  const bullets = COPY.bullets.map((bullet) => resolve(isEs ? bullet.es : bullet.en));

  const plainTranscript =
    transcriptText || `${title} ${intro} ${bullets.join(", ")}.`;

  const effectiveAudioSrc =
    audioSrc ||
    (isEs
      ? "/audio/exported/slide9_why_it_matters_es.mp3"
      : "/audio/exported/slide9_why_it_matters_en.mp3");

  const variantClass =
    variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

  return (
    <div
      id="slide-content"
      ref={rootRef}
      className={`s9-root${variantClass}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="s9-heading"
      lang={activeLocale}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE9_CSS }} />

      <div className="s9-stage" style={{ transform: `scale(${scale})` }}>
        <div className="s9-badge">
          <h1 id="s9-heading" ref={headingRef} tabIndex={-1} className="s9-heading">
            {title}
          </h1>
        </div>

        <div className="s9-main">
          <div className="s9-nurse" aria-hidden="true">
            <img
              src="/images/nurse-anna-explaining.png"
              srcSet="/images/nurse-anna-explaining.png 1x, /images/nurse-anna-explaining-hd.png 2x"
              alt=""
              className="s9-nurse-img"
              draggable={false}
            />
          </div>

          <div className="s9-content">
            <p className="s9-intro">{intro}</p>

            <ul className="s9-bullets">
              {bullets.map((bullet) => (
                <li key={bullet} className="s9-bullet">
                  <span className="s9-bullet-dot" aria-hidden="true" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="s9-bottom-bar">
        <div className="s9-audio">
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
        />
      </div>
    </div>
  );
}

export default Slide9WhyItMattersScreen;
