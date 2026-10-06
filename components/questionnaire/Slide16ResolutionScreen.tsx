"use client";

import React, { useState, useRef, useEffect } from "react";
import { NurseAnna } from "./NurseAnna";

export interface Slide16ResolutionScreenProps {
  isSpanish: boolean;
  selected?: string;
  medicines?: string[];
  resolutionMedicines?: string[];
  route?: string;
  resolutionRoute?: string;
  onSelectResolution?: (val: string) => void;
  onSelect?: (val: string) => void;
  onSelectMedicines?: (meds: string[]) => void;
  onMedicinesSelect?: (meds: string[]) => void;
  onSelectRoute?: (route: string) => void;
  onRouteChange?: (route: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

interface ResolutionOption {
  value: string;
  labelEn: string;
  labelEs: string;
}

const RESOLUTION_OPTIONS: ResolutionOption[] = [
  { value: "With medication", labelEn: "With medication", labelEs: "Con medicación" },
  { value: "On its own", labelEn: "On its own", labelEs: "Por sí sola" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/ No lo sé" },
];

const MEDICATION_OPTIONS: ResolutionOption[] = [
  { value: "Allergy medicine (Benadryl, Zyrtec)", labelEn: "Allergy medicine (Benadryl, Zyrtec)", labelEs: "Medicina para la alergia (Benadryl, Zyrtec)" },
  { value: "Steroid medicine (Prednisone)", labelEn: "Steroid medicine (Prednisone)", labelEs: "Medicina esteroidea (Prednisona)" },
  { value: "Epinephrine (EpiPen)", labelEn: "Epinephrine (EpiPen)", labelEs: "Epinefrina (EpiPen)" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/ No lo sé" },
];

const ROUTE_OPTIONS: ResolutionOption[] = [
  { value: "Mouth", labelEn: "Mouth", labelEs: "Por la boca" },
  { value: "IV", labelEn: "IV", labelEs: "Vía intravenosa (IV)" },
  { value: "Shot", labelEn: "Shot", labelEs: "Inyección" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/ No lo sé" },
];

export function Slide16ResolutionScreen({
  isSpanish,
  selected,
  medicines,
  resolutionMedicines,
  route,
  resolutionRoute,
  onSelectResolution,
  onSelect,
  onSelectMedicines,
  onMedicinesSelect,
  onSelectRoute,
  onRouteChange,
  onNext,
  onBack,
  loading = false,
}: Slide16ResolutionScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const modal17HeadingRef = useRef<HTMLHeadingElement | null>(null);
  const modal18HeadingRef = useRef<HTMLHeadingElement | null>(null);

  const initialMeds = medicines ?? resolutionMedicines ?? [];
  const initialRoute = route ?? resolutionRoute;
  const handleResolution = onSelectResolution ?? onSelect ?? (() => {});
  const handleMedicines = onSelectMedicines ?? onMedicinesSelect;
  const handleRoute = onSelectRoute ?? onRouteChange;

  const [modal17Open, setModal17Open] = useState(false);
  const [modal18Open, setModal18Open] = useState(false);

  const [activeMeds, setActiveMeds] = useState<string[]>(initialMeds);
  const [activeRoute, setActiveRoute] = useState<string | undefined>(initialRoute);

  useEffect(() => {
    if (medicines !== undefined || resolutionMedicines !== undefined) {
      setActiveMeds(medicines ?? resolutionMedicines ?? []);
    }
  }, [medicines, resolutionMedicines]);

  useEffect(() => {
    if (route !== undefined || resolutionRoute !== undefined) {
      setActiveRoute(route ?? resolutionRoute);
    }
  }, [route, resolutionRoute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Trap focus for Modal 17 (Medicines)
  useEffect(() => {
    if (!modal17Open) return;
    const timer = setTimeout(() => {
      modal17HeadingRef.current?.focus();
    }, 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal17Open(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modal17Open]);

  // Trap focus for Modal 18 (Route)
  useEffect(() => {
    if (!modal18Open) return;
    const timer = setTimeout(() => {
      modal18HeadingRef.current?.focus();
    }, 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal18Open(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modal18Open]);

  const handleMainOption = (val: string) => {
    handleResolution(val);
    if (val === "With medication") {
      setTimeout(() => setModal17Open(true), 150);
    }
  };

  const toggleMed = (val: string) => {
    let updated: string[];
    if (val === "Unsure/I don't know") {
      updated = activeMeds.includes("Unsure/I don't know") ? [] : ["Unsure/I don't know"];
    } else {
      const withoutUnsure = activeMeds.filter((m) => m !== "Unsure/I don't know");
      if (withoutUnsure.includes(val)) {
        updated = withoutUnsure.filter((m) => m !== val);
      } else {
        updated = [...withoutUnsure, val];
      }
    }
    setActiveMeds(updated);
    if (handleMedicines) handleMedicines(updated);
  };

  const handleRouteSelect = (val: string) => {
    setActiveRoute(val);
    if (handleRoute) handleRoute(val);
  };

  return (
    <div
      id="slide-content"
      className="bg-[#f4f8e8] border border-slate-200/80 rounded-3xl p-3.5 sm:p-6 md:p-7 shadow-md relative flex flex-col justify-between min-h-0 sm:min-h-[440px] max-h-none overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center space-y-3 sm:space-y-4">
        {/* Main Heading */}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-xs sm:text-sm md:text-base font-bold text-slate-900 tracking-tight leading-snug text-left outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
        >
          {isSpanish
            ? "¿Cómo se resolvió la reacción de su hijo?"
            : "How did your child's reaction go away?"}
        </h1>

        {/* Content: Options Row & Nurse Anna */}
        <div className="flex items-center gap-3 sm:gap-6 pt-1">
          {/* Horizontal / Stacked Buttons */}
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label={isSpanish ? "Resolución de la reacción" : "Reaction resolution"}>
              {RESOLUTION_OPTIONS.map((opt) => {
                const isChecked = selected === opt.value;
                const label = isSpanish ? opt.labelEs : opt.labelEn;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isChecked}
                    onClick={() => handleMainOption(opt.value)}
                    className={`flex flex-col items-center justify-center p-2.5 sm:p-3 min-h-[48px] sm:min-h-[56px] rounded-xl text-center font-bold text-xs sm:text-sm transition cursor-pointer border ${
                      isChecked
                        ? "bg-[#236f7a] text-white border-[#1a555e] shadow-xs"
                        : "bg-[#82bdad] text-[#132c27] border-[#6fa99b] hover:bg-[#72ae9e]"
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a] active:scale-95`}
                  >
                    <span className="leading-tight">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Meds & Route Pill */}
            {selected === "With medication" && (activeMeds.length > 0 || activeRoute) && (
              <div className="flex items-center justify-between bg-white border border-[#236f7a]/30 rounded-xl px-3 py-1.5 shadow-2xs">
                <span className="text-xs font-semibold text-slate-700">
                  {activeMeds.length > 0 && (
                    <span>
                      {isSpanish ? "Medicina: " : "Meds: "}
                      <strong className="text-[#236f7a]">{activeMeds.join(", ")}</strong>
                    </span>
                  )}
                  {activeRoute && (
                    <span className="ml-2 text-slate-500">
                      ({activeRoute})
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setModal17Open(true)}
                  className="text-xs text-[#236f7a] font-bold underline hover:text-[#1a555e] cursor-pointer shrink-0 ml-2"
                >
                  {isSpanish ? "Cambiar" : "Change"}
                </button>
              </div>
            )}
          </div>

          {/* Nurse Anna on Right */}
          <div className="shrink-0 hidden sm:flex items-center justify-center">
            <NurseAnna size="sm" isDecorative={true} />
          </div>
        </div>
      </div>

      {/* Paired Navigation Buttons */}
      <div className="flex items-center justify-center gap-4 pt-3 sm:pt-4 mt-2 sm:mt-3 border-t border-slate-200/60 shrink-0">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-6 sm:px-7 py-2 min-h-[44px] min-w-[100px] sm:min-w-[110px] rounded-full bg-[#7da199] hover:bg-[#6c8e86] text-[#132c27] font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selected || loading}
          className={`px-6 sm:px-7 py-2 min-h-[44px] min-w-[100px] sm:min-w-[110px] rounded-full font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
            selected && !loading
              ? "bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#d6be0e]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none"
          }`}
        >
          {loading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 17 (Figma 7-4-1): Multi-Select Medication Checkboxes */}
      {/* ========================================================================= */}
      {modal17Open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-17-heading"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <h2
                id="modal-17-heading"
                ref={modal17HeadingRef}
                tabIndex={-1}
                className="text-base sm:text-lg font-bold text-slate-900 tracking-tight outline-none"
              >
                {isSpanish
                  ? "¿Qué medicamento le dieron a su hijo para la reacción?"
                  : "What medicine was given to your child for the reaction?"}
              </h2>
              <p className="text-xs font-medium text-slate-500">
                {isSpanish ? "Seleccione todos los que correspondan." : "Select all that apply."}
              </p>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {MEDICATION_OPTIONS.map((opt) => {
                const isChecked = activeMeds.includes(opt.value);
                const label = isSpanish ? opt.labelEs : opt.labelEn;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => toggleMed(opt.value)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 min-h-[44px] rounded-xl text-left font-semibold text-xs sm:text-sm transition cursor-pointer border ${
                      isChecked
                        ? "bg-[#236f7a] text-white border-[#1a555e] shadow-2xs"
                        : "bg-[#f8faf7] text-slate-800 border-slate-300 hover:bg-slate-100"
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a] active:scale-[0.99]`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isChecked ? "border-white bg-[#1a555e]" : "border-slate-400 bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="leading-tight">{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] font-mono text-slate-400">7-4-1</span>
              <button
                type="button"
                onClick={() => {
                  setModal17Open(false);
                  setTimeout(() => setModal18Open(true), 150);
                }}
                className="px-6 py-2 min-h-[44px] rounded-full bg-[#132338] hover:bg-[#0c1827] text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
              >
                {isSpanish ? "Siguiente: Vía" : "Next: Route"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 18 (Figma 7-4-1-1): Route Administered Modal */}
      {/* ========================================================================= */}
      {modal18Open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-18-heading"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <h2
                id="modal-18-heading"
                ref={modal18HeadingRef}
                tabIndex={-1}
                className="text-base sm:text-lg font-bold text-slate-900 tracking-tight outline-none"
              >
                {isSpanish
                  ? "¿Cómo recibió su hijo el medicamento?"
                  : "Did your child receive the medicine by:"}
              </h2>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {ROUTE_OPTIONS.map((opt) => {
                const isChecked = activeRoute === opt.value;
                const label = isSpanish ? opt.labelEs : opt.labelEn;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isChecked}
                    onClick={() => handleRouteSelect(opt.value)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 min-h-[44px] rounded-xl text-left font-semibold text-xs sm:text-sm transition cursor-pointer border ${
                      isChecked
                        ? "bg-[#236f7a] text-white border-[#1a555e] shadow-2xs"
                        : "bg-[#f8faf7] text-slate-800 border-slate-300 hover:bg-slate-100"
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a] active:scale-[0.99]`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isChecked ? "border-[#236f7a] bg-white" : "border-slate-400 bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      {isChecked && <div className="w-2 h-2 rounded-full bg-[#236f7a]" />}
                    </div>
                    <span className="leading-tight">{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] font-mono text-slate-400">7-4-1-1</span>
              <button
                type="button"
                onClick={() => setModal18Open(false)}
                className="px-6 py-2 min-h-[44px] rounded-full bg-[#132338] hover:bg-[#0c1827] text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
              >
                {isSpanish ? "Guardar y continuar" : "Save and Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Slide16ResolutionScreen;
