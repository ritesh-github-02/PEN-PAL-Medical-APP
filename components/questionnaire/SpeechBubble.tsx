"use client";

import React from "react";

export interface SpeechBubbleProps {
  children: React.ReactNode;
  tailPosition?: "right-center" | "right-bottom" | "left-center" | "bottom-center";
  className?: string;
  borderColor?: string;
  variant?: "round" | "box";
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  children,
  tailPosition = "right-bottom",
  className = "",
  borderColor = "#27707e",
  variant = "round",
}) => {
  if (variant === "round") {
    return (
      <div className={`relative inline-block filter drop-shadow(2px 3px 5px rgba(20,60,55,0.18)) ${className}`}>
        <svg
          viewBox="0 0 430 260"
          fill="none"
          className="w-full h-auto block"
          aria-hidden="true"
        >
          <path
            d="M 213, 8
               C 317, 8  404, 56  404, 120
               C 404, 146  388, 172  360, 189
               C 375, 204  392, 222  409, 239
               C 390, 241  356, 233  325, 214
               C 292, 228  254, 236  213, 236
               C 109, 236  28, 184  28, 120
               C 28, 56  109, 8  213, 8
               Z"
            fill="#ffffff"
            stroke={borderColor}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="absolute inset-0 top-[5%] left-[5%] w-[82%] h-[84%] flex flex-col justify-center items-center text-center px-4 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-white border-2 rounded-3xl p-4 sm:p-5 shadow-sm text-slate-800 text-xs sm:text-sm md:text-base font-semibold leading-relaxed ${className}`}
      style={{ borderColor }}
    >
      {children}

      {/* Tail pointing RIGHT toward Anna */}
      {tailPosition === "right-bottom" && (
        <svg
          className="absolute -right-3.5 bottom-5 w-4 h-6 pointer-events-none"
          viewBox="0 0 16 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M0 2 L14 12 L0 22 Z" fill="#ffffff" stroke={borderColor} strokeWidth="2" strokeLinejoin="round" />
          <line x1="0" y1="3" x2="0" y2="21" stroke="#ffffff" strokeWidth="3" />
        </svg>
      )}

      {tailPosition === "right-center" && (
        <svg
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-4 h-6 pointer-events-none"
          viewBox="0 0 16 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M0 2 L14 12 L0 22 Z" fill="#ffffff" stroke={borderColor} strokeWidth="2" strokeLinejoin="round" />
          <line x1="0" y1="3" x2="0" y2="21" stroke="#ffffff" strokeWidth="3" />
        </svg>
      )}

      {/* Tail pointing LEFT toward Anna (when Anna is on left side) */}
      {tailPosition === "left-center" && (
        <svg
          className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-4 h-6 pointer-events-none"
          viewBox="0 0 16 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M16 2 L2 12 L16 22 Z" fill="#ffffff" stroke={borderColor} strokeWidth="2" strokeLinejoin="round" />
          <line x1="16" y1="3" x2="16" y2="21" stroke="#ffffff" strokeWidth="3" />
        </svg>
      )}

      {/* Tail pointing BOTTOM */}
      {tailPosition === "bottom-center" && (
        <svg
          className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-6 h-4 pointer-events-none"
          viewBox="0 0 24 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M2 0 L12 14 L22 0 Z" fill="#ffffff" stroke={borderColor} strokeWidth="2" strokeLinejoin="round" />
          <line x1="3" y1="0" x2="21" y2="0" stroke="#ffffff" strokeWidth="3" />
        </svg>
      )}
    </div>
  );
};

export default SpeechBubble;
