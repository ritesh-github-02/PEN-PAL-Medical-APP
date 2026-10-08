"use client";

import React, { useRef, useEffect } from "react";
import { resolveMedicineToken } from "@/lib/token-engine";

const SLIDE21_CSS = `
/* ==========================================================
   Slide21WhatNowScreen – Pixel-Perfect Styles Matching Target UI
   ========================================================== */

.s21-root,
.s21-root *,
.s21-root *::before,
.s21-root *::after {
  box-sizing: border-box;
}

.s21-root {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #f6faee;
  padding: 1.5rem 2.5rem 0.85rem 2.5rem;
  overflow: hidden;
}

/* Centered Content Container */
.s21-content {
  flex: 1 1 0%;
  min-height: 0;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 0.25rem 0;
}

/* "What Now?" Yellow Badge */
.s21-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #fff589;
  border: 1.5px solid #142724;
  border-radius: 14px;
  padding: 0.45rem 1.4rem;
  box-shadow: 2px 3px 0px rgba(20, 50, 40, 0.2);
  margin-bottom: 0.9rem;
}

.s21-badge-title {
  font-size: 1.18rem;
  font-weight: 800;
  color: #142724;
  line-height: 1.2;
  margin: 0;
  outline: none;
}

.s21-badge-title:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}

/* Main Heading */
.s21-heading {
  font-size: 1.28rem;
  font-weight: 700;
  line-height: 1.35;
  color: #142724;
  letter-spacing: -0.01em;
  margin: 0 0 0.65rem 0;
  text-align: left;
}

/* Bullet Points */
.s21-bullets {
  list-style: none;
  padding: 0;
  margin: 0 0 0.85rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}

.s21-bullet-item {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  font-size: 1.05rem;
  font-weight: 500;
  color: #142724;
  line-height: 1.4;
  text-align: left;
}

.s21-bullet-dot {
  font-size: 1.2rem;
  line-height: 1.1;
  color: #142724;
  user-select: none;
  flex-shrink: 0;
}

/* Illustration Container */
.s21-illustration-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0.35rem;
  user-select: none;
}

.s21-illustration-img {
  max-width: 480px;
  width: 100%;
  height: auto;
  max-height: 220px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 4px 12px rgba(20, 50, 45, 0.08));
}

/* Navigation Bar */
.s21-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 0.25rem 0 0.5rem 0;
  flex-shrink: 0;
}

.s21-btn {
  padding: 0.45rem 2.2rem;
  min-height: 42px;
  min-width: 104px;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #143833;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  outline: none;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.s21-btn:active {
  transform: scale(0.96);
}
.s21-btn:focus-visible {
  box-shadow: 0 0 0 4px #236f7a;
}

.s21-btn--back {
  background-color: #adcbc7;
  border: 1px solid #94b9b4;
}
.s21-btn--back:hover {
  background-color: #9cbdb8;
}

.s21-btn--next {
  background-color: #fae98f;
  color: #143833;
  border: 1px solid #dac85e;
}
.s21-btn--next:hover {
  background-color: #f7e37b;
}

/* Responsive Scaling */
@media (max-height: 700px), (max-width: 860px) {
  .s21-root {
    padding: 1rem 1.75rem 0.5rem 1.75rem;
  }
  .s21-badge {
    padding: 0.35rem 1.15rem;
    margin-bottom: 0.6rem;
  }
  .s21-badge-title {
    font-size: 1.05rem;
  }
  .s21-heading {
    font-size: 1.15rem;
    margin-bottom: 0.45rem;
  }
  .s21-bullet-item {
    font-size: 0.95rem;
  }
  .s21-illustration-img {
    max-height: 180px;
    max-width: 410px;
  }
  .s21-btn {
    padding: 0.38rem 1.8rem;
    font-size: 0.9rem;
    min-height: 38px;
  }
}

@media (max-width: 600px) {
  .s21-illustration-img {
    max-height: 140px;
  }
}
`;

export interface Slide21WhatNowScreenProps {
  isSpanish?: boolean;
  medicationName?: string;
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
  navProps?: {
    onNext: (explicitAnswer?: any) => void;
    onBack: () => void;
    loading?: boolean;
    headingRef?: React.RefObject<HTMLHeadingElement | null>;
  };
}

export function Slide21WhatNowScreen({
  isSpanish = false,
  medicationName,
  onNext,
  onBack,
  loading = false,
  navProps,
}: Slide21WhatNowScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const rawTitle = isSpanish
    ? "¡Hable con el médico de su hijo sobre las pruebas de alergia a [name]!"
    : "Talk to your child's doctor about [name] allergy testing!";

  const rawBullets = [
    {
      en: "The test can help you learn the truth about your child's past reaction.",
      es: "La prueba puede ayudarle a saber la verdad sobre la reacción pasada de su hijo.",
    },
    {
      en: "The test may help your child get better medicine in the future.",
      es: "La prueba puede ayudar a que su hijo reciba mejores medicamentos en el futuro.",
    },
  ];

  const titleText = resolveMedicineToken(rawTitle, medicationName, isSpanish);

  const handleNextClick = () => {
    if (onNext) {
      onNext();
    } else if (navProps?.onNext) {
      navProps.onNext();
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (navProps?.onBack) {
      navProps.onBack();
    }
  };

  const isLoading = loading || navProps?.loading || false;

  return (
    <div id="slide-content" className="s21-root">
      <style>{SLIDE21_CSS}</style>

      {/* Main Centered Content */}
      <div className="s21-content">
        {/* Yellow "What Now?" Badge */}
        <div className="s21-badge">
          <h1
            ref={headingRef}
            tabIndex={-1}
            id="slide21-title"
            className="s21-badge-title"
          >
            {isSpanish ? "¿Qué sigue ahora?" : "What Now?"}
          </h1>
        </div>

        {/* Heading */}
        <h2 className="s21-heading">
          {titleText}
        </h2>

        {/* Bullet Points */}
        <ul className="s21-bullets" aria-label={titleText}>
          {rawBullets.map((b, idx) => {
            const text = resolveMedicineToken(isSpanish ? b.es : b.en, medicationName, isSpanish);
            return (
              <li key={idx} className="s21-bullet-item">
                <span className="s21-bullet-dot" aria-hidden="true">•</span>
                <span>{text}</span>
              </li>
            );
          })}
        </ul>

        {/* Doctor Consultation Illustration */}
        <div className="s21-illustration-wrap" aria-hidden="true">
          <img
            src="/images/doctor-consultation-v3.png"
            alt={
              isSpanish
                ? "Madre e hija consultando con la pediatra sobre las pruebas de alergia"
                : "Mother and daughter consulting with pediatrician about allergy testing"
            }
            className="s21-illustration-img"
          />
        </div>
      </div>

      {/* Centered Bottom Navigation (Back & Next) */}
      <div className="s21-nav">
        <button
          type="button"
          onClick={handleBackClick}
          disabled={isLoading}
          className="s21-btn s21-btn--back"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={handleNextClick}
          disabled={isLoading}
          className="s21-btn s21-btn--next"
        >
          {isLoading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Slide21WhatNowScreen;
