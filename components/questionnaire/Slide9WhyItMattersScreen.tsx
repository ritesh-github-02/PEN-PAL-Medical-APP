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
    height: auto;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    flex-direction: column;
    justify-content: flex-start;
    padding: 0.85rem 0.75rem 1rem;
  }
  ${scope} .s9-stage {
    width: 100%;
    max-width: 380px;
    height: auto;
    padding: 16px 14px 12px;
    transform: none !important;
  }
  ${scope} .s9-badge {
    margin: 0 auto 10px;
    padding: 8px 18px;
    border-radius: 16px;
  }
  ${scope} .s9-heading {
    font-size: 16px;
  }
  ${scope} .s9-main {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  ${scope} .s9-nurse {
    order: 2;
    width: 95px;
    height: 160px;
    margin-top: 4px;
  }
  ${scope} .s9-content {
    order: 1;
    width: 100%;
    gap: 10px;
  }
  ${scope} .s9-intro {
    font-size: 13.5px;
    line-height: 1.38;
  }
  ${scope} .s9-bullets {
    gap: 8px;
  }
  ${scope} .s9-bullet {
    gap: 8px;
    font-size: 12.5px;
    line-height: 1.35;
  }
  ${scope} .s9-bullet-dot {
    width: 5px;
    height: 5px;
    margin-top: 6px;
  }
  ${scope} .s9-audio {
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }
  ${scope} .slide-nav {
    margin: 10px auto 0.25rem auto !important;
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
  width: 150px;
  height: 300px;
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

/* 3. Audio controls — desktop uses the shared player in the tablet frame */
.s9-audio {
  display: none;
}

@media (max-width: 767px) {
${mobileLayout(".s9-root")}
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

        <div className="s9-audio">
          <AudioPlayer
            audioSrc={effectiveAudioSrc}
            stepId={stepId}
            locale={activeLocale}
            transcriptText={plainTranscript}
            size="large"
          />
        </div>
      </div>

      <SlideNavigationButtons
        onBack={onBack}
        onNext={onNext}
        isSpanish={isEs}
        loading={loading}
      />
    </div>
  );
}

export default Slide9WhyItMattersScreen;
