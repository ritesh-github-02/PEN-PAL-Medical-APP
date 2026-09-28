"use client";

import React, { useState, useRef, useEffect } from "react";
import { NurseAnna } from "./NurseAnna";

export interface Slide16ResolutionScreenProps {
  isSpanish: boolean;
  selected?: string;
  resolutionMedicines?: string[];
  resolutionRoute?: string;
  onSelect: (val: string) => void;
  onMedicinesSelect: (meds: string[]) => void;
  onRouteChange: (route: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

const RESOLUTION_OPTIONS = [
  { value: "With medication", labelEn: "With medication", labelEs: "Con medicamentos" },
  { value: "On its own", labelEn: "On its own", labelEs: "Por sí sola" },
  { value: "Unsure", labelEn: "Unsure", labelEs: "No estoy seguro" },
];

const MEDICINE_CHECKBOX_OPTIONS = [
  { value: "Allergy medicine (Benadryl, Zyrtec)", labelEn: "Allergy medicine (Benadryl, Zyrtec)", labelEs: "Antialérgico (Benadryl, Zyrtec)" },
  { value: "Steroid medicine (Prednisone)", labelEn: "Steroid medicine (Prednisone)", labelEs: "Esteroides (Prednisona)" },
  { value: "Epinephrine (EpiPen)", labelEn: "Epinephrine (EpiPen)", labelEs: "Epinefrina (EpiPen)" },
  { value: "Unsure", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro" },
];

const ROUTE_OPTIONS = [
  { value: "Mouth", labelEn: "Mouth", labelEs: "Vía oral (Boca)" },
  { value: "IV", labelEn: "IV", labelEs: "Vía intravenosa (IV)" },
  { value: "Shot", labelEn: "Shot", labelEs: "Inyección" },
  { value: "Unsure", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro" },
];

export function Slide16ResolutionScreen({
  isSpanish,
  selected,
  resolutionMedicines = [],
  resolutionRoute,
  onSelect,
  onMedicinesSelect,
  onRouteChange,
  onNext,
  onBack,
  loading = false,
}: Slide16ResolutionScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const modal17HeadingRef = useRef<HTMLHeadingElement | null>(null);
  const modal18HeadingRef = useRef<HTMLHeadingElement | null>(null);

  const [activeMeds, setActiveMeds] = useState<string[]>(resolutionMedicines);
  const [activeRoute, setActiveRoute] = useState<string | undefined>(resolutionRoute);
  const [modal17Open, setModal17Open] = useState(false);
  const [modal18Open, setModal18Open] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (modal17Open) {
      setTimeout(() => modal17HeadingRef.current?.focus(), 50);
    }
  }, [modal17Open]);

  useEffect(() => {
    if (modal18Open) {
      setTimeout(() => modal18HeadingRef.current?.focus(), 50);
    }
  }, [modal18Open]);

  const handleMainOption = (val: string) => {
    onSelect(val);
    if (val === "With medication") {
      setModal17Open(true);
    } else {
      onMedicinesSelect([]);
      onRouteChange("");
    }
  };

  const toggleMedicine = (val: string) => {
    let updated: string[];
    if (val === "Unsure") {
      updated = activeMeds.includes("Unsure") ? [] : ["Unsure"];
    } else {
      const withoutUnsure = activeMeds.filter((m) => m !== "Unsure");
      if (withoutUnsure.includes(val)) {
        updated = withoutUnsure.filter((m) => m !== val);
      } else {
        updated = [...withoutUnsure, val];
      }
    }
    setActiveMeds(updated);
    onMedicinesSelect(updated);
  };

  const handleRouteSelect = (r: string) => {
    setActiveRoute(r);
    onRouteChange(r);
  };

  return (
    <div
      id="slide-content"
      className="bg-[#f4f8e8] border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[440px] max-h-[85vh]"
    >
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center space-y-4">
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
        <div className="flex items-center gap-4 sm:gap-6 pt-1">
          {/* Horizontal Buttons */}
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={isSpanish ? "Resolución de la reacción" : "Reaction resolution"}>
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
                    className={`flex flex-col items-center justify-center p-3 min-h-[56px] rounded-xl text-center font-bold text-xs sm:text-sm transition cursor-pointer border ${
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
          <div className="shrink-0 flex items-center justify-center">
            <NurseAnna size="sm" isDecorative={true} />
          </div>
        </div>
      </div>

      {/* Paired Navigation Buttons */}
      <div className="flex items-center justify-center gap-4 pt-4 mt-3 border-t border-slate-200/60">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-7 py-2 min-h-[44px] min-w-[110px] rounded-full bg-[#7da199] hover:bg-[#6c8e86] text-[#132c27] font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
        >
          {isSpanish ? "Atrás" : "Back"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selected || loading}
          className={`px-7 py-2 min-h-[44px] min-w-[110px] rounded-full font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
            selected && !loading
              ? "bg-[#f0d411] hover:bg-[#e1c504] text-[#1f382f] border border-[#d6be0e]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none"
          }`}
        >
          {loading ? "..." : isSpanish ? "Siguiente" : "Next"}
        </button>
      </div>

      {/* MODAL 17: Multi-Select Medication Checkboxes */}
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
                {isSpanish
                  ? "Seleccione todos los medicamentos que correspondan."
                  : "Select all medications that apply."}
              </p>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {MEDICINE_CHECKBOX_OPTIONS.map((med) => {
                const isChecked = activeMeds.includes(med.value);
                const label = isSpanish ? med.labelEs : med.labelEn;

                return (
                  <button
                    key={med.value}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => toggleMedicine(med.value)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 min-h-[42px] rounded-xl text-left font-semibold text-xs sm:text-sm transition cursor-pointer border ${
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

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setModal17Open(false);
                  setModal18Open(true);
                }}
                className="px-6 py-2 min-h-[44px] rounded-full bg-[#132338] hover:bg-[#0c1827] text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a]"
              >
                {isSpanish ? "Siguiente: Vía de administración" : "Next: Route of Intake"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 18: Route of Administration */}
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
                  ? "¿Cómo se le administró el medicamento?"
                  : "How was the medicine given?"}
              </h2>
            </div>

            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
              {ROUTE_OPTIONS.map((rt) => {
                const isRouteChecked = activeRoute === rt.value;
                const rtLabel = isSpanish ? rt.labelEs : rt.labelEn;

                return (
                  <button
                    key={rt.value}
                    type="button"
                    onClick={() => {
                      handleRouteSelect(rt.value);
                      setModal18Open(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 min-h-[42px] rounded-xl text-left font-semibold text-xs sm:text-sm transition cursor-pointer border ${
                      isRouteChecked
                        ? "bg-[#236f7a] text-white border-[#1a555e] shadow-2xs"
                        : "bg-[#f8faf7] text-slate-800 border-slate-300 hover:bg-slate-100"
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a] active:scale-[0.99]`}
                  >
                    <span>{rtLabel}</span>
                    <span className="text-xs opacity-75 font-bold">
                      {isRouteChecked ? "✓" : "→"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Slide16ResolutionScreen;
