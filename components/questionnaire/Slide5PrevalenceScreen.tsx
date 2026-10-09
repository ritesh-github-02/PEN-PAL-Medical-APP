"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";

const SLIDE5_CSS = `
/* ==========================================================
   Slide5PrevalenceScreen – Scoped Pixel-Perfect Styles
   Matching exact mockup reference (Image 1)
   ========================================================== */

.s5-root,
.s5-root *,
.s5-root *::before,
.s5-root *::after {
  box-sizing: border-box;
}

.s5-root {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f4f8ec;
  padding: 1.25rem 2.25rem 1rem 2.25rem;
  overflow: hidden;
  gap: clamp(1.25rem, 3.5vh, 2.25rem);
}

/* Middle Content: Bottle + Nurse Anna Shield + Descriptive Text */
.s5-middle {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

.s5-content-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2.25rem;
  max-width: 860px;
  width: 100%;
  margin: 0 auto;
}

/* Left Illustration Group: Pink Bottle & Nurse Anna with Shield */
.s5-graphics {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.s5-bottle {
  position: relative;
  width: 130px;
  height: 245px;
  flex-shrink: 0;
  margin-bottom: 14px;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.06));
}

.s5-anna {
  position: relative;
  width: 160px;
  height: 360px;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08));
}

.s5-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* Right Content: Main Statement Typography */
.s5-text-wrap {
  flex: 1 1 0%;
  max-width: 480px;
}

.s5-heading {
  font-size: 1.62rem;
  font-weight: 600;
  line-height: 1.44;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.015em;
  outline: none;
}

.s5-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
  border-radius: 6px;
}

.s5-bold {
  font-weight: 800;
  color: #0f172a;
}

/* Bottom Centered Navigation */
.s5-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
}

.s5-btn {
  padding: 0.45rem 2.25rem;
  min-height: 44px;
  min-width: 105px;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #143833;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  outline: none;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.s5-btn:active {
  transform: scale(0.96);
}

.s5-btn:focus-visible {
  box-shadow: 0 0 0 4px #236f7a;
}

.s5-btn--back {
  background-color: #adc9c4;
  border: 1px solid #96bcb5;
}

.s5-btn--back:hover {
  background-color: #9cbdb8;
}

.s5-btn--next {
  background-color: #fae88a;
  color: #143833;
  border: 1px solid #d8c85c;
}

.s5-btn--next:hover {
  background-color: #f6df6e;
}

/* Tablet & Smaller Screens Scaling */
@media (max-height: 600px), (max-width: 768px) {
  .s5-root {
    padding: 1rem 1.5rem 0.5rem 1.5rem;
  }
  .s5-content-wrap {
    gap: 1.25rem;
  }
  .s5-bottle {
    width: 96px;
    height: 180px;
    margin-bottom: 8px;
  }
  .s5-anna {
    width: 118px;
    height: 270px;
  }
  .s5-heading {
    font-size: 1.15rem;
    line-height: 1.38;
  }
  .s5-btn {
    padding: 0.35rem 1.6rem;
    min-height: 40px;
    font-size: 0.85rem;
  }
}
`;

export interface Slide5PrevalenceScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function Slide5PrevalenceScreen({
  isSpanish,
  medicationName,
  onNext,
  onBack,
  loading = false,
}: Slide5PrevalenceScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const medicineToken = medicationName && medicationName.trim()
    ? medicationName
    : (isSpanish ? "[nombre]" : "[name]");

  return (
    <div id="slide-content" className="s5-root">
      <style>{SLIDE5_CSS}</style>

      {/* Middle Content: Graphics (Bottle + Anna with Shield) + Statement Text */}
      <div className="s5-middle">
        <div className="s5-content-wrap">
          {/* Graphics: Pink Amoxicillin Bottle & Nurse Anna holding 95% shield */}
          <div className="s5-graphics">
            <div className="s5-bottle">
              <Image
                src="/images/amoxicillin-bottle.png"
                alt={isSpanish ? "Frasco de amoxicilina rosa" : "Pink amoxicillin suspension bottle"}
                fill
                unoptimized
                priority
                className="s5-img"
              />
            </div>
            <div className="s5-anna">
              <Image
                src="/images/nurse-anna-95-shield.png"
                alt={
                  isSpanish
                    ? "Enfermera Anna sosteniendo escudo: El 95% de los niños pueden tomarlo de forma segura"
                    : "Nurse Anna holding shield: 95% of kids can take it safely"
                }
                fill
                unoptimized
                priority
                className="s5-img"
              />
            </div>
          </div>

          {/* Right: Main Statement Typography */}
          <div className="s5-text-wrap">
            <h1 ref={headingRef} tabIndex={-1} className="s5-heading">
              {isSpanish ? (
                <>
                  La mayoría de las personas que piensan que son alérgicas a la penicilina pueden tomarla de manera segura. De cada <strong className="s5-bold">100</strong> niños con alergia a {medicineToken}, <strong className="s5-bold">95</strong> pueden tomar {medicineToken} sin tener ninguna reacción.
                </>
              ) : (
                <>
                  Most people who think they are allergic to penicillin can safely take it. Out of <strong className="s5-bold">100</strong> kids with a {medicineToken} allergy, <strong className="s5-bold">95</strong> can take {medicineToken} without having a reaction.
                </>
              )}
            </h1>
          </div>
        </div>
      </div>

      {/* Bottom Centered Navigation Buttons (Back & Next) */}
      <div className="s5-nav">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="s5-btn s5-btn--back"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={loading}
          className="s5-btn s5-btn--next"
        >
          {loading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Slide5PrevalenceScreen;
