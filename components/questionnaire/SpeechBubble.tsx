"use client";

import React from "react";

export interface SpeechBubbleProps {
  children: React.ReactNode;
  tailPosition?: "right-center" | "right-bottom" | "left-center" | "left-bottom" | "bottom-center";
  className?: string;
  borderColor?: string;
  variant?: "round" | "box";
}

export const BUBBLE_PATH =
  "M 397.9,283.4 " +
  "C 395.8,284.6 391.2,287.9 385.1,290.7 " +
  "C 379.0,293.4 369.2,297.5 361.3,299.9 " +
  "C 353.4,302.3 345.2,303.8 337.6,305.3 " +
  "C 330.0,306.8 322.6,307.8 315.6,309.0 " +
  "C 308.6,310.2 302.5,312.1 295.5,312.7 " +
  "C 288.5,313.3 280.6,312.4 273.6,312.7 " +
  "C 266.6,313.0 260.2,314.5 253.5,314.5 " +
  "C 246.8,314.5 240.1,313.3 233.4,312.7 " +
  "C 226.7,312.1 220.6,311.4 213.3,310.8 " +
  "C 206.0,310.2 197.2,310.2 189.6,309.0 " +
  "C 182.0,307.8 175.5,305.3 167.6,303.5 " +
  "C 159.7,301.7 150.3,300.8 142.1,298.0 " +
  "C 133.9,295.3 126.8,291.3 118.3,287.0 " +
  "C 109.8,282.7 99.7,277.9 90.9,272.4 " +
  "C 82.1,266.9 73.8,261.1 65.3,254.1 " +
  "C 56.8,247.1 46.8,239.2 39.8,230.3 " +
  "C 32.8,221.5 27.0,211.4 23.3,201.0 " +
  "C 19.6,190.6 18.1,179.0 17.8,168.0 " +
  "C 17.5,157.0 19.1,146.0 21.5,135.0 " +
  "C 23.9,124.0 27.2,111.9 32.4,102.1 " +
  "C 37.6,92.3 44.6,84.0 52.5,76.4 " +
  "C 60.4,68.8 70.5,62.1 79.9,56.3 " +
  "C 89.4,50.5 99.8,45.6 109.2,41.6 " +
  "C 118.7,37.6 127.5,35.2 136.6,32.5 " +
  "C 145.7,29.8 155.5,27.0 164.0,25.2 " +
  "C 172.5,23.4 179.8,22.4 187.7,21.5 " +
  "C 195.6,20.6 203.9,20.3 211.5,19.7 " +
  "C 219.1,19.1 226.4,18.1 233.4,17.8 " +
  "C 240.4,17.5 245.9,17.5 253.5,17.8 " +
  "C 261.1,18.1 271.2,19.1 279.1,19.7 " +
  "C 287.0,20.3 293.7,20.6 301.0,21.5 " +
  "C 308.3,22.4 315.6,24.0 322.9,25.2 " +
  "C 330.2,26.4 337.0,27.0 344.9,28.8 " +
  "C 352.8,30.6 362.0,33.4 370.5,36.1 " +
  "C 379.0,38.9 387.2,41.6 396.0,45.3 " +
  "C 404.8,49.0 414.9,52.9 423.4,58.1 " +
  "C 431.9,63.3 438.7,69.7 447.2,76.4 " +
  "C 455.7,83.1 466.7,90.2 474.6,98.4 " +
  "C 482.5,106.7 490.4,115.8 494.7,125.9 " +
  "C 499.0,136.0 501.1,147.8 500.2,158.8 " +
  "C 499.3,169.8 493.8,181.4 489.2,191.8 " +
  "C 484.6,202.2 480.4,211.0 472.8,221.1 " +
  "C 465.2,231.2 448.4,247.0 443.5,252.2 " +
  "L 485.6,314.5 " +
  "L 397.9,283.4 " +
  "Z";

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  children,
  tailPosition = "right-bottom",
  className = "",
  borderColor = "#8ebfbb",
  variant = "round",
}) => {
  const isLeft = tailPosition.startsWith("left");

  if (variant === "round") {
    return (
      <div className={`relative inline-block ${className}`}>
        <svg
          viewBox="0 0 520 340"
          fill="none"
          className="w-full h-auto block overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <pattern id="speech-bubble-dots" width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="9" cy="9" r="0.8" fill="#cadada" opacity="0.65" />
            </pattern>
          </defs>

          {isLeft ? (
            <g transform="translate(520, 0) scale(-1, 1)">
              <path
                d={BUBBLE_PATH}
                transform="translate(-4, 5)"
                fill="#000000"
                stroke="#000000"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d={BUBBLE_PATH} fill="#ffffff" />
              <path d={BUBBLE_PATH} fill="url(#speech-bubble-dots)" />
              <path
                d={BUBBLE_PATH}
                fill="none"
                stroke={borderColor}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ) : (
            <>
              <path
                d={BUBBLE_PATH}
                transform="translate(4, 5)"
                fill="#000000"
                stroke="#000000"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d={BUBBLE_PATH} fill="#ffffff" />
              <path d={BUBBLE_PATH} fill="url(#speech-bubble-dots)" />
              <path
                d={BUBBLE_PATH}
                fill="none"
                stroke={borderColor}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}
        </svg>

        <div
          className={`absolute top-[10%] w-[78%] h-[75%] flex flex-col justify-center items-center text-center px-4 pointer-events-none ${
            isLeft ? "left-[16%]" : "left-[6%]"
          }`}
        >
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
      {(tailPosition === "left-center" || tailPosition === "left-bottom") && (
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
