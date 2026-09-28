"use client";

import React, { useState, useRef, useEffect } from "react";
import { NurseAnna } from "./NurseAnna";

export interface Slide14MedicalCareScreenProps {
  isSpanish: boolean;
  selected?: string;
  locationSelected?: string;
  onSelect: (val: string) => void;
  onLocationSelect: (loc: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

const CARE_OPTIONS = [
  { value: "Yes", labelEn: "Yes", labelEs: "Sí" },
  { value: "No", labelEn: "No", labelEs: "No" },
  { value: "Unsure", labelEn: "Unsure", labelEs: "No estoy seguro" },
];

const LOCATION_OPTIONS = [
  { value: "Emergency room (ER)", labelEn: "Emergency room (ER)", labelEs: "Sala de emergencias (ER)" },
  { value: "Urgent care", labelEn: "Urgent care", labelEs: "Centro de urgencias" },
  { value: "Primary care doctor", labelEn: "Primary care doctor", labelEs: "Médico de atención primaria" },
  { value: "Hospital", labelEn: "Hospital", labelEs: "Hospital" },
  { value: "Phone call with doctor", labelEn: "Phone call with doctor", labelEs: "Llamada con el médico" },
  { value: "Unsure", labelEn: "Unsure", labelEs: "No estoy seguro" },
];

export function Slide14MedicalCareScreen({
  isSpanish,
  selected,
  locationSelected,
  onSelect,
  onLocationSelect,
  onNext,
  onBack,
  loading = false,
}: Slide14MedicalCareScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const modalHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const timer = setTimeout(() => {
      modalHeadingRef.current?.focus();
    }, 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen]);

  const handleMainOption = (val: string) => {
    onSelect(val);
    if (val === "Yes") {
      setModalOpen(true);
    } else {
      onLocationSelect("");
    }
  };

  const selectedLocLabel = isSpanish
    ? LOCATION_OPTIONS.find((l) => l.value === locationSelected)?.labelEs || locationSelected
    : LOCATION_OPTIONS.find((l) => l.value === locationSelected)?.labelEn || locationSelected;

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
            ? "¿Su hijo recibió atención médica por su reacción?"
            : "Did your child receive medical care for their reaction?"}
        </h1>

        {/* Content: Options Row & Nurse Anna */}
        <div className="flex items-center gap-4 sm:gap-6 pt-1">
          {/* Horizontal Buttons */}
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={isSpanish ? "Atención médica recibida" : "Medical care received"}>
              {CARE_OPTIONS.map((opt) => {
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

            {/* Selected Location Pill */}
            {selected === "Yes" && locationSelected && (
              <div className="flex items-center justify-between bg-white border border-[#236f7a]/30 rounded-xl px-3 py-1.5 shadow-2xs">
                <span className="text-xs font-semibold text-slate-700">
                  {isSpanish ? "Lugar de atención: " : "Location: "}
                  <strong className="text-[#236f7a]">{selectedLocLabel}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="text-xs text-[#236f7a] font-bold underline hover:text-[#1a555e] cursor-pointer"
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

      {/* MODAL 15: Medical Care Location */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-15-heading"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <h2
                id="modal-15-heading"
                ref={modalHeadingRef}
                tabIndex={-1}
                className="text-base sm:text-lg font-bold text-slate-900 tracking-tight outline-none"
              >
                {isSpanish ? "¿Dónde recibió atención médica?" : "Where did they receive medical care?"}
              </h2>
              <p className="text-xs font-medium text-slate-500">
                {isSpanish ? "Seleccione el lugar principal." : "Select the primary care location."}
              </p>
            </div>

            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
              {LOCATION_OPTIONS.map((loc) => {
                const isLocChecked = locationSelected === loc.value;
                const locLabel = isSpanish ? loc.labelEs : loc.labelEn;

                return (
                  <button
                    key={loc.value}
                    type="button"
                    onClick={() => {
                      onLocationSelect(loc.value);
                      setModalOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 min-h-[42px] rounded-xl text-left font-semibold text-xs sm:text-sm transition cursor-pointer border ${
                      isLocChecked
                        ? "bg-[#236f7a] text-white border-[#1a555e] shadow-2xs"
                        : "bg-[#f8faf7] text-slate-800 border-slate-300 hover:bg-slate-100"
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#236f7a] active:scale-[0.99]`}
                  >
                    <span>{locLabel}</span>
                    <span className="text-xs opacity-75 font-bold">
                      {isLocChecked ? "✓" : "→"}
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

export default Slide14MedicalCareScreen;
