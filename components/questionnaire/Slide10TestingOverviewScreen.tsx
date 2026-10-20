"use client";

import { useEffect, useRef, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import SlideNavigationButtons from "./SlideNavigationButtons";
import { resolveMedicineToken } from "@/lib/token-engine";

export interface Slide10TestingOverviewScreenProps {
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

/** Speech-bubble artwork (viewBox 0 0 520 330, tail pointing down-right at Nurse Anna). */
const BUBBLE_PATH =
  "M 397.9,283.4 C 395.8,284.6 391.2,287.9 385.1,290.7 " +
  "C 379.0,293.4 369.2,297.5 361.3,299.9 C 353.4,302.3 345.2,303.8 337.6,305.3 " +
  "C 330.0,306.8 322.6,307.8 315.6,309.0 C 308.6,310.2 302.5,312.1 295.5,312.7 " +
  "C 288.5,313.3 280.6,312.4 273.6,312.7 C 266.6,313.0 260.2,314.5 253.5,314.5 " +
  "C 246.8,314.5 240.1,313.3 233.4,312.7 C 226.7,312.1 220.6,311.4 213.3,310.8 " +
  "C 206.0,310.2 197.2,310.2 189.6,309.0 C 182.0,307.8 175.5,305.3 167.6,303.5 " +
  "C 159.7,301.7 150.3,300.8 142.1,298.0 C 133.9,295.3 126.8,291.3 118.3,287.0 " +
  "C 109.8,282.7 99.7,277.9 90.9,272.4 C 82.1,266.9 73.8,261.1 65.3,254.1 " +
  "C 56.8,247.1 46.8,239.2 39.8,230.3 C 32.8,221.5 27.0,211.4 23.3,201.0 " +
  "C 19.6,190.6 18.1,179.0 17.8,168.0 C 17.5,157.0 19.1,146.0 21.5,135.0 " +
  "C 23.9,124.0 27.2,111.9 32.4,102.1 C 37.6,92.3 44.6,84.0 52.5,76.4 " +
  "C 60.4,68.8 70.5,62.1 79.9,56.3 C 89.4,50.5 99.8,45.6 109.2,41.6 " +
  "C 118.7,37.6 127.5,35.2 136.6,32.5 C 145.7,29.8 155.5,27.0 164.0,25.2 " +
  "C 172.5,23.4 179.8,22.4 187.7,21.5 C 195.6,20.6 203.9,20.3 211.5,19.7 " +
  "C 219.1,19.1 226.4,18.1 233.4,17.8 C 240.4,17.5 245.9,17.5 253.5,17.8 " +
  "C 261.1,18.1 271.2,19.1 279.1,19.7 C 287.0,20.3 293.7,20.6 301.0,21.5 " +
  "C 308.3,22.4 315.6,24.0 322.9,25.2 C 330.2,26.4 337.0,27.0 344.9,28.8 " +
  "C 352.8,30.6 362.0,33.4 370.5,36.1 C 379.0,38.9 387.2,41.6 396.0,45.3 " +
  "C 404.8,49.0 414.9,52.9 423.4,58.1 C 431.9,63.3 438.7,69.7 447.2,76.4 " +
  "C 455.7,83.1 466.7,90.2 474.6,98.4 C 482.5,106.7 490.4,115.8 494.7,125.9 " +
  "C 499.0,136.0 501.1,147.8 500.2,158.8 C 499.3,169.8 493.8,181.4 489.2,191.8 " +
  "C 484.6,202.2 480.4,211.0 472.8,221.1 C 465.2,231.2 448.4,247.0 443.5,252.2 " +
  "L 485.6,314.5 L 397.9,283.4 Z";

/** Slide copy, defined once instead of being rebuilt on every render. */
const COPY = {
  intro: {
    en: "There's a test that your child's doctor can perform. This test can determine if your child can safely take [name].",
    es: "Hay una prueba que el médico de su hijo puede realizar. Esta prueba puede determinar si su hijo puede tomar [name] de manera segura.",
  },
  subtitle: {
    en: "Testing is safe and done in the office",
    es: "Las pruebas son seguras y se realizan en el consultorio",
  },
  /** Rendered inside the speech bubble, line breaks are intentional. */
  bubble: {
    en: ["Talk to your", "child's doctor", "about testing!"],
    es: ["¡Hable con el", "médico de su hijo", "sobre las pruebas!"],
  },
  bubbleLead: {
    en: "Talk to your child's doctor about testing!",
    es: "¡Hable con el médico de su hijo sobre las pruebas!",
  },
  bullets: [
    {
      en: "For the test, kids take [name] by mouth and are monitored in a doctor's office for about an hour.",
      es: "Para la prueba, los niños toman [name] por vía oral y se les monitorea en el consultorio médico durante aproximadamente una hora.",
    },
    {
      en: "Kids can help decide whether they want to take [name] as a liquid or chewable tablet.",
      es: "Los niños pueden ayudar a decidir si quieren tomar [name] en forma líquida o en tabletas masticables.",
    },
    {
      en: "Fortunately, kids tend to like the way [name] tastes!",
      es: "¡Afortunadamente, a los niños les suele gustar el sabor de [name]!",
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
  ${scope} .s10-stage {
    width: 100%;
    max-width: 380px;
    height: auto;
    padding: 16px 14px 12px;
    transform: none !important;
  }
  ${scope} .s10-body {
    position: static;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }
  ${scope} .s10-left {
    width: 100%;
    justify-content: flex-start;
    gap: 8px;
  }
  ${scope} .s10-heading {
    margin-bottom: 0;
    font-size: 13.5px;
    line-height: 1.35;
  }
  ${scope} .s10-subheading {
    margin-bottom: 0;
    font-size: 14px;
    line-height: 1.3;
  }
  ${scope} .s10-bullets {
    gap: 7px;
  }
  ${scope} .s10-bullet-item {
    font-size: 12.5px;
    line-height: 1.35;
    gap: 8px;
  }
  ${scope} .s10-bullet-dot {
    width: 6px;
    height: 6px;
    margin-top: 6px;
  }
  ${scope} .s10-right {
    width: 100%;
    flex-direction: column;
    gap: 0;
  }
  ${scope} .s10-bubble {
    width: 220px;
    height: auto;
    aspect-ratio: 520 / 330;
    margin: 0 auto;
  }
  ${scope} .s10-bubble-text {
    font-size: 12.5px;
  }
  ${scope} .s10-nurse {
    width: 75px;
    height: 130px;
    margin-top: -14px;
  }
  ${scope} .s10-audio {
    display: flex;
    justify-content: center;
    margin-top: 8px;
  }
  ${scope} .s10-audio .audio-cc-btn svg {
    width: 32px;
    height: 28px;
  }
  ${scope} .s10-audio .audio-play-btn svg {
    width: 42px;
    height: 28px;
  }
`;

const SLIDE10_CSS = `
.s10-root,
.s10-root *,
.s10-root *::before,
.s10-root *::after {
  box-sizing: border-box;
}

.s10-root {
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

/* Bottom padding keeps the content clear of the shared navigation row. */
.s10-stage {
  position: relative;
  display: flex;
  flex: none;
  flex-direction: column;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  padding: 28px 30px 60px;
  transform-origin: center center;
  background-color: #fafdf3;
  overflow: hidden;
}

.s10-body {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 22px;
  min-height: 0;
}

/* 1. Left information column */
.s10-left {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.s10-heading {
  margin: 0 0 14px;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.38;
  letter-spacing: -0.01em;
  color: #232323;
  text-align: left;
  outline: none;
}

.s10-heading:focus-visible {
  outline: 2px dashed #143833;
  outline-offset: 4px;
  border-radius: 4px;
}

.s10-subheading {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.32;
  letter-spacing: -0.01em;
  color: #232323;
  text-align: left;
}

.s10-bullets {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.s10-bullet-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 0;
  color: #232323;
  font-size: 18.5px;
  font-weight: 500;
  line-height: 1.38;
  letter-spacing: -0.01em;
  text-align: left;
}

.s10-bullet-dot {
  flex-shrink: 0;
  width: 6.5px;
  height: 6.5px;
  margin-top: 9px;
  border-radius: 50%;
  background-color: #236f7a;
}

/* 2. Right column: speech bubble with Nurse Anna below it */
.s10-right {
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: center;
  width: 236px;
}

.s10-bubble {
  position: relative;
  width: 236px;
  height: 160px;
  flex-shrink: 0;
  filter: drop-shadow(3px 4px 0 #1a3532);
  pointer-events: none;
}

.s10-bubble-svg {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.s10-bubble-text-wrap {
  position: absolute;
  top: 44%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 84%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.s10-bubble-text {
  margin: 0;
  color: #232323;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
  text-align: center;
}

/* Nurse Anna fills whatever height is left after the bubble */
.s10-nurse {
  display: flex;
  flex: 1 1 auto;
  align-items: flex-end;
  justify-content: center;
  width: 127px;
  min-height: 0;
  margin-top: -6px;
  pointer-events: none;
}

.s10-nurse-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom center;
  user-select: none;
  -webkit-user-drag: none;
}

/* 3. Audio controls — desktop uses the shared player in the tablet frame */
.s10-audio {
  display: none;
}

@media (max-width: 767px) {
${mobileLayout(".s10-root")}
}

${mobileLayout(".s10-root.is-mobile")}

@media (prefers-reduced-motion: reduce) {
  .s10-root *,
  .s10-root *::before,
  .s10-root *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
`;

export function Slide10TestingOverviewScreen({
  isSpanish = false,
  medicationName,
  variant = "auto",
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide10_testing",
  locale,
  transcriptText,
}: Slide10TestingOverviewScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [scale, setScale] = useState(1);

  const isEs = (locale ?? "").startsWith("es") || isSpanish;
  const activeLocale = isEs ? "es" : "en";
  const medName = medicationName?.trim();
  const resolve = (value: string) => resolveMedicineToken(value, medName, isEs);

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

  const introText = resolve(COPY.intro[activeLocale]);
  const subtitleText = resolve(COPY.subtitle[activeLocale]);
  const bullets = COPY.bullets.map((bullet) => resolve(bullet[activeLocale]));

  const spokenText =
    transcriptText ||
    `${COPY.bubbleLead[activeLocale]} ${introText} ${subtitleText}. ${bullets.join(" ")}`;

  // `screen4_testing_*` exists for both locales; `slide10_testing_es.mp3` does not.
  const effectiveAudioSrc =
    audioSrc ||
    (isEs
      ? "/audio/exported/screen4_testing_es.mp3"
      : "/audio/exported/screen4_testing_en.mp3");

  const variantClass =
    variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

  return (
    <div
      id="slide-content"
      ref={rootRef}
      className={`s10-root${variantClass}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="s10-heading"
      lang={activeLocale}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE10_CSS }} />

      <div className="s10-stage" style={{ transform: `scale(${scale})` }}>
        <div className="s10-body">
          {/* 1. Left information column */}
          <div className="s10-left">
            <h1 id="s10-heading" ref={headingRef} tabIndex={-1} className="s10-heading">
              {introText}
            </h1>

            <h2 className="s10-subheading">{subtitleText}</h2>

            <ul className="s10-bullets" role="list">
              {bullets.map((text, idx) => (
                <li key={idx} className="s10-bullet-item">
                  <span className="s10-bullet-dot" aria-hidden="true" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Speech bubble with Nurse Anna below */}
          <div className="s10-right">
            <div
              className="s10-bubble"
              role="note"
              aria-label={isEs ? "Consejo de la enfermera Anna" : "Nurse Anna's advice"}
            >
              <svg className="s10-bubble-svg" viewBox="0 0 520 330" fill="none" aria-hidden="true" focusable="false">
                <defs>
                  <pattern id="s10-bubble-dots" width="18" height="18" patternUnits="userSpaceOnUse">
                    <circle cx="9" cy="9" r="0.8" fill="#cadada" opacity="0.65" />
                  </pattern>
                </defs>
                <path d={BUBBLE_PATH} fill="#ffffff" />
                <path d={BUBBLE_PATH} fill="url(#s10-bubble-dots)" />
                <path
                  d={BUBBLE_PATH}
                  fill="none"
                  stroke="#94bbb9"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div className="s10-bubble-text-wrap">
                <p className="s10-bubble-text">
                  {COPY.bubble[activeLocale].map((line, idx) => (
                    <span key={idx}>
                      {idx > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            <div className="s10-nurse" aria-hidden="true">
              <img
                src="/images/nurse-anna.png"
                alt=""
                className="s10-nurse-img"
                draggable={false}
              />
            </div>
          </div>
        </div>

        <div className="s10-audio">
          <AudioPlayer
            audioSrc={effectiveAudioSrc}
            stepId={stepId}
            locale={activeLocale}
            transcriptText={spokenText}
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

export default Slide10TestingOverviewScreen;
